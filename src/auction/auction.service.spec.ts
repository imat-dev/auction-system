import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { Item, Status } from './entity/items.entity';
import { AuctionService } from './auction.service';
import { RefundsProcessor } from './scheduler/refunds.processor';
import { Bid } from './entity/bid.entity';
import { BullModule, getQueueToken } from '@nestjs/bull';
import { User } from './../auth/entity/user.entity';
import { Queue } from 'bull';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';

describe('Auction Service', () => {
  let service: AuctionService;
  let repository: Repository<Item>;
  let processor: RefundsProcessor;
  let refundsQueue: Queue;

  beforeEach(async () => {
    const mockRepository = jest.fn(() => ({
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
    }));

    const mockQueue = {
      add: jest.fn(),
      // ... other methods you may want to mock
    };

    const module = await Test.createTestingModule({
      imports: [BullModule],
      providers: [
        AuctionService,
        RefundsProcessor,
        {
          provide: getRepositoryToken(Item),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(Bid),
          useFactory: mockRepository,
        },
        {
          provide: 'BullQueue_refunds',
          useValue: mockQueue,
        },
        {
          provide: EntityManager,
          useValue: {
            transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    processor = module.get<RefundsProcessor>(RefundsProcessor);
    service = module.get<AuctionService>(AuctionService);
    repository = module.get<Repository<Item>>(getRepositoryToken(Item));
    refundsQueue = module.get(getQueueToken('refunds'));
  });

  it('should return all published and completed', () => {
    const result = [new Item({ id: 1 }), new Item({ id: 2 })];
    const repoSpy = jest.spyOn(repository, 'find').mockResolvedValue(result);

    const items = service.findAll();
    expect(items).resolves.toEqual(result);
    expect(repoSpy).toBeCalledWith({
      where: {
        status: In(['published', 'completed']),
      },
      order: {
        dateCreated: 'DESC' as const,
      },
    });
  });

  it('should return all items of a user', () => {
    const result = [new Item({ id: 1 }), new Item({ id: 2 })];
    const repoSpy = jest.spyOn(repository, 'find').mockResolvedValue(result);

    const user = new User({ id: 1 });
    const items = service.findAllByUser(null, user);
    expect(items).resolves.toEqual(result);
    expect(repoSpy).toBeCalledWith({ where: { owner: user } });
  });

  it('should create an auction with draft state', () => {
    const result = new Item({
      id: 1,
      name: 'test',
      startingPrice: 1,
      windowTime: 1,
      status: Status.DRAFT,
    });

    const repoSpy = jest.spyOn(repository, 'save').mockResolvedValue(result);

    const user = new User({ id: 1 });
    const input = { name: 'test', startingPrice: 1, windowTime: 1 };

    const items = service.createAuctionItem(input, user);
    expect(items).resolves.toEqual(result);
  });

  describe('Start Auction', () => {
    it('should start an auction', async () => {
      const result = new Item({
        id: 1,
        name: 'test',
        startingPrice: 1,
        windowTime: 1,
        status: Status.DRAFT,
      });

      const findSpy = jest
        .spyOn(service, 'findItemById')
        .mockResolvedValue(result);

      const saveSpy = jest
        .spyOn(repository, 'save')
        .mockResolvedValue(new Item({ ...result, status: Status.PUBLISHED }));

      const jobSpy = jest
        .spyOn(refundsQueue, 'add')
        .mockImplementation((): any => {
          return { id: 1 };
        });

      const auction = service.startAuction(Status.DRAFT, 1);
      expect(auction).resolves.toEqual(
        new Item({ ...result, status: Status.PUBLISHED }),
      );
    });

    it('should not start an auction when item is not on draft state', async () => {
      const findSpy = jest
        .spyOn(service, 'findItemById')
        .mockResolvedValue(undefined);

      try {
        const auction = await service.startAuction(Status.DRAFT, 1);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should not start an auction when item is not valid', async () => {
      const result = new Item({
        id: 1,
        name: 'test',
        startingPrice: 1,
        windowTime: 1,
        status: Status.COMPLETED,
      });

      const findSpy = jest
        .spyOn(service, 'findItemById')
        .mockResolvedValue(result);

      try {
        const auction = await service.startAuction(Status.DRAFT, 1);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should not start an auction when refund job id is not stored in Redis', async () => {
      const result = new Item({
        id: 1,
        name: 'test',
        startingPrice: 1,
        windowTime: 1,
        status: Status.DRAFT,
      });

      const findSpy = jest
        .spyOn(service, 'findItemById')
        .mockResolvedValue(result);

      const saveSpy = jest
        .spyOn(repository, 'save')
        .mockResolvedValue(new Item({ ...result, status: Status.PUBLISHED }));

      const jobSpy = jest
        .spyOn(refundsQueue, 'add')
        .mockImplementation((): any => {
          return { undefined };
        });

      try {
        const auction = await service.startAuction(Status.DRAFT, 1);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
      }
    });
  });

  //   describe('Validate User', () => {
  //     it('should retun user if valid credentials', async () => {
  //       const result = new User({
  //         email: 'tes@test.com',
  //         id: 1,
  //       });

  //       const repoSpy = jest
  //         .spyOn(repository, 'findOne')
  //         .mockResolvedValue(result);

  //       const serviceSpy = jest
  //         .spyOn(service, 'comparePassword')
  //         .mockResolvedValue(true);

  //       const user = service.validateUser('test@test.com', 'password');
  //       expect(user).resolves.toEqual({ email: 'tes@test.com', id: 1 });
  //       expect(repoSpy).toBeCalledWith({ where: { email: 'test@test.com' } });
  //     });

  //     it('should throw error if email does not exist', async () => {
  //       const result = new User({
  //         email: 'tes@test.com',
  //         id: 1,
  //       });

  //       const repoSpy = jest
  //         .spyOn(repository, 'findOne')
  //         .mockResolvedValue(undefined);

  //       try {
  //         await service.validateUser('test@test.com', 'password');
  //       } catch (error) {
  //         expect(error).toBeInstanceOf(UnauthorizedException);
  //       }
  //     });

  //     it('should throw error if email exist but wrong password', async () => {
  //       const result = new User({
  //         email: 'tes@test.com',
  //         id: 1,
  //       });

  //       jest.spyOn(repository, 'findOne').mockResolvedValue(result);

  //       jest
  //         .spyOn(service, 'comparePassword')
  //         .mockImplementation((): any => false);

  //       try {
  //         await service.validateUser('test@test.com', 'password');
  //       } catch (error) {
  //         expect(error).toBeInstanceOf(UnauthorizedException);
  //       }
  //     });
  //   });
});
