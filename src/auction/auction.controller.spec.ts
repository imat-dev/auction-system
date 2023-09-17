import { User } from './../auth/entity/user.entity';
import { Repository } from 'typeorm';
import { AuctionController } from './auction.controller';
import { AuctionService } from './auction.service';
import { Item, Status } from './entity/items.entity';
import { Queue } from 'bull';
import { AuthService } from 'src/auth/auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('Auction Controller (unit)', () => {
  let auctionController: AuctionController;
  let auctionService: AuctionService;
  let itemRepo: Repository<Item>;
  let queue: Queue;

  beforeEach(async () => {
    auctionService = new AuctionService(itemRepo, queue);
    auctionController = new AuctionController(auctionService);
  });
  const result = {
    id: 1,
    name: 'Rare',
    startingPrice: 1,
    windowTime: 1,
  };

  it('should return all items', async () => {
    const findSpy = jest
      .spyOn(auctionService, 'findAll')
      .mockImplementation((): any => {
        return [result];
      });

    expect(await auctionController.findAll()).toEqual([result]);
    expect(findSpy).toBeCalledTimes(1);
  });

  it('should return auction items of user', async () => {
    const findSpy = jest
      .spyOn(auctionService, 'findAllByUser')
      .mockImplementation((): any => {
        return [result];
      });

    expect(
      await auctionController.findByUser(null, new User({ id: 1 })),
    ).toEqual([result]);
    expect(findSpy).toBeCalledTimes(1);
  });

  it('should create an auction Item', async () => {
    const createSpy = jest
      .spyOn(auctionService, 'createAuctionItem')
      .mockImplementation((): any => {
        return result as Item;
      });

    expect(
      await auctionController.create(new User({ id: 1 }), {
        name: 'test',
        startingPrice: 1,
        windowTime: 1,
      }),
    ).toEqual(result);
    expect(createSpy).toBeCalledTimes(1);
  });

  describe('Published auction item', () => {
    const result = {
      id: 1,
      name: 'Rare',
      startingPrice: 1,
      windowTime: 1,
    };

    it('should publish auction item', async () => {
      const updateSpy = jest
        .spyOn(auctionService, 'startAuction')
        .mockImplementation((): any => {
          return result as Item;
        });

      jest
        .spyOn(auctionService, 'checkUserOwnership')
        .mockImplementation((): any => true);

      expect(
        await auctionController.startAuction(1, new User({ id: 1 }), {
          status: Status.PUBLISHED,
        }),
      ).toEqual(result);

      expect(updateSpy).toBeCalledTimes(1);
    });

    it('should not publish auction item when updating item of other user', async () => {
      const updateSpy = jest
        .spyOn(auctionService, 'startAuction')
        .mockImplementation((): any => {
          return result as Item;
        });

      jest
        .spyOn(auctionService, 'checkUserOwnership')
        .mockImplementation((): any => false);

      try {
        await auctionController.startAuction(1, new User({ id: 1 }), {
          status: Status.PUBLISHED,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }

      expect(updateSpy).toBeCalledTimes(0);
    });
  });

  //   it('should make deposit', async () => {
  //     const amount = 5;
  //     const initialBalance = 0;

  //     const result = {
  //       id: 1,
  //       email: 'test@test.om',
  //       balance: amount + initialBalance,
  //     };

  //     const spy = jest
  //       .spyOn(depositService, 'makeDeposit')
  //       .mockImplementation((): any => new User({ ...result }));

  //     expect(
  //       await depositController.create(
  //         new User({ id: 1, email: 'test@test.com', balance: 0 }),
  //         { amount: amount },
  //       ),
  //     ).toEqual(result);
  //   });

  //   it('should not make deposit', async () => {
  //     const currentUser = undefined;

  //     const spy = jest
  //       .spyOn(depositService, 'makeDeposit')
  //       .mockImplementation((): any => Error);

  //     try {
  //       await depositController.create(currentUser, { amount: 5 });
  //     } catch (error) {
  //       expect(error).toBeInstanceOf(Error);
  //     }
  //   });
});
