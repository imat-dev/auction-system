import { BidController } from './bid.controller';
import { BidService } from './bid.service';
import { RateLimiterService } from './rate-limiter.service';
import { Bid } from './entity/bid.entity';
import { Repository } from 'typeorm';
import { Item } from './entity/items.entity';
import { User } from './../auth/entity/user.entity';
import { PlaceBidDto } from './dto/place-bid.dto';
import { ConfigService as NestConfigService } from '@nestjs/config';


describe('Bid Controller (unit)', () => {
  let bidController: BidController;
  let bidService: BidService;
  let rateLimiterService: RateLimiterService;
  let itemRepo: Repository<Item>;
  let userRepo: Repository<User>;
  let bidRepo: Repository<Bid>;
  let configService : NestConfigService
  let mockRateLimiterService: RateLimiterService ;

  beforeEach(async () => {
    bidService = new BidService(bidRepo, itemRepo, userRepo);
    bidController = new BidController(bidService, rateLimiterService);
    mockRateLimiterService = new RateLimiterService(configService);
  });

  describe('GetBid', () => {
    it('should get the current user bid on item', async () => {
      const mockUser = new User({ id: 1 });

      const mockBid = new Bid({
        id: 1,
        user: mockUser,
        bidAmount: 1,
      });
      const mockItemId = 1;

      jest.spyOn(bidService, 'getCurrentBidOnItem').mockResolvedValue(mockBid);

      const result = await bidController.getBid(mockUser, mockItemId);
      expect(result).toBe(mockBid);
    });
  });

//   describe('placeBid', () => {
//     it('place bid on item', async () => {
//       const mockUser = new User({ id: 1 });

//       const mockBid = new Bid({
//         id: 1,
//         user: mockUser,
//         bidAmount: 1,
//       });
//       const mockItem = new Item({ id: 1 });
//       const mockPlaceBidDto: PlaceBidDto = { bidAmount: 200 };
      
//       jest.spyOn(mockRateLimiterService, 'checkLimit').mockImplementation((): any => {})
//       jest.spyOn(bidService, 'validateBid').mockResolvedValue(mockItem);

//       const result = await bidController.placeBid(mockItem, mockUser, mockPlaceBidDto);
//       expect(result).toBe(mockBid);
//     });
//   });
});
