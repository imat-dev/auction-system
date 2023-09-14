import { BullModule } from '@nestjs/bull';

export const RefundsQueue = BullModule.registerQueue({
  name: 'refunds',
});