import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { Item, Status } from './entity/items.entity';
import { Bid } from './entity/bid.entity';
import { User } from './../auth/entity/user.entity';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { BidService } from './bid.service';
import { PlaceBidDto } from './dto/place-bid.dto';

describe('Bid Service', () => {
  let service: BidService;
  let itemRepo: Repository<Item>;
  let userRepo: Repository<User>;
  let bidRepo: Repository<Bid>;

  beforeEach(async () => {
    const mockRepository = jest.fn(() => ({
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
    }));

    const mockService = jest.fn(() => ({
      upateUserBalance: jest.fn(),
    }));

    const module = await Test.createTestingModule({
      providers: [
        BidService,
        {
          provide: getRepositoryToken(Item),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(Bid),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(User),
          useFactory: mockRepository,
        },
        {
          provide: EntityManager,
          useValue: {
            transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BidService>(BidService);
    itemRepo = module.get<Repository<Item>>(getRepositoryToken(Item));
    bidRepo = module.get<Repository<Bid>>(getRepositoryToken(Bid));
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('getCurrentBidOnItem', () => {
    it('should get current bid on item', () => {
      const bid = new Bid({
        id: 1,
        item: new Item({ id: 1 }),
        user: new User({ id: 1 }),
      });

      const repoSpy = jest.spyOn(bidRepo, 'findOne').mockResolvedValue(bid);

      const currentBid = service.getCurrentBidOnItem(1, new User({ id: 1 }));
      expect(currentBid).resolves.toEqual(bid);

      expect(repoSpy).toBeCalledWith({
        where: { user: new User({ id: 1 }), item: new Item({ id: 1 }) },
      });
    });

    it('should throw an error when no bid is found', async () => {
      const repoSpy = jest
        .spyOn(bidRepo, 'findOne')
        .mockResolvedValue(undefined);
      try {
        const currentBid = await service.getCurrentBidOnItem(
          1,
          new User({ id: 1 }),
        );
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('placeBid', () => {
    it('should throw an error if user is placing multiple bid records on single item', async () => {
      const repoSpy = jest
        .spyOn(bidRepo, 'findOne')
        .mockResolvedValue(new Bid({ id: 1 }));
      try {
        const result = await service.placeBid(
          new Item({ id: 1 }),
          new User({ id: 1 }),
          10,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should create a bid', async () => {
      const bid = new Bid({
        id: 1,
        item: new Item({ id: 1 }),
        user: new User({ id: 1 }),
      });

      const user = new User();
      user.balance = 2000;
      const bidAmount = 100;
      const item = new Item({ id: 1, highestBidder: user });

      jest.spyOn(bidRepo, 'findOne').mockResolvedValue(undefined);

      jest.spyOn(itemRepo, 'save').mockResolvedValue(item);

      jest.spyOn(service, 'updateUserBalance').mockImplementation((): any => {
        return new User({ id: 1, balance: user.balance - bidAmount });
      });

      jest.spyOn(bidRepo, 'save').mockResolvedValue(
        new Bid({
          user: user,
          item: item,
          bidAmount,
        }),
      );

      const result = await service.placeBid(item, user, bidAmount);
      expect(result.bidAmount).toBe(bidAmount);
      expect(result.updatedBalance).toBe(user.balance - bidAmount);
    });
  });

  describe('updateBid', () => {
    it('should not update bid when user doesnt have a bid on item', async () => {
      const mockItem: Item = new Item({ id: 1 });
      const mockUser: User = new User({ id: 1, balance: 200 });
      const newBidAmount = 250;

      jest.spyOn(bidRepo, 'findOne').mockResolvedValue(undefined);

      try {
        await service.updateBid(mockItem, mockUser, newBidAmount);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
      }
    });

    it('should throw a ForbiddenException if user does not have enough balance', async () => {
      const mockItem: Item = new Item({ id: 1 });
      const mockUser: User = new User({ id: 1, balance: 50 });
      const mockBid: Bid = new Bid({
        user: mockUser,
        item: mockItem,
        bidAmount: 30,
      });
      const newBidAmount = 100;

      jest.spyOn(bidRepo, 'findOne').mockResolvedValue(mockBid);

      await expect(
        service.updateBid(mockItem, mockUser, newBidAmount),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should update user bid on item', async () => {
      const mockItem: Item = new Item({ id: 1 });
      const mockUser: User = new User({ id: 1, balance: 200 });
      const mockBid: Bid = new Bid({
        user: mockUser,
        item: mockItem,
        bidAmount: 50,
      });
      const newBidAmount = 100;

      jest.spyOn(bidRepo, 'findOne').mockResolvedValue(mockBid);
      jest
        .spyOn(bidRepo, 'save')
        .mockResolvedValue({ ...mockBid, bidAmount: newBidAmount });
      jest.spyOn(itemRepo, 'findOne').mockResolvedValue(mockItem);

      jest.spyOn(service, 'updateUserBalance').mockResolvedValue({
        ...mockUser,
        balance: mockUser.balance - (newBidAmount - mockBid.bidAmount),
      });

      const result = await service.updateBid(mockItem, mockUser, newBidAmount);
      expect(result.bidAmount).toBe(newBidAmount);
      expect(result.updatedBalance).toBe(150); // 200 - (100 - 50)
    });
  });

  describe('validateBid', () => {
    it('should throw a BadRequestException if the item is not found', async () => {
      const mockItemId = 1;
      const mockPlaceBidDto: PlaceBidDto = { bidAmount: 200 };

      jest.spyOn(itemRepo, 'findOne').mockResolvedValue(undefined);

      await expect(
        service.validateBid(mockItemId, mockPlaceBidDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw a BadRequestException if the item status is not PUBLISHED', async () => {
      const mockItem: Item = new Item({ id: 1, status: Status.DRAFT });
      const mockPlaceBidDto: PlaceBidDto = { bidAmount: 200 };

      jest.spyOn(itemRepo, 'findOne').mockResolvedValue(mockItem);

      await expect(
        service.validateBid(mockItem.id, mockPlaceBidDto),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw a BadRequestException if the bid amount is less than or equal to the item's highest bid", async () => {
      const mockItem: Item = new Item({
        id: 1,
        status: Status.PUBLISHED,
        highestBid: 150,
      });
      const mockPlaceBidDto: PlaceBidDto = { bidAmount: 100 };

      jest.spyOn(itemRepo, 'findOne').mockResolvedValue(mockItem);

      await expect(
        service.validateBid(mockItem.id, mockPlaceBidDto),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
