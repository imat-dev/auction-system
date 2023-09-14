import { Transform } from 'class-transformer';
import { IsNotEmpty, Validate } from 'class-validator';
import { IsPositiveNonZeroNumber } from 'src/common/helpers/custom-class.validator';

export class UpdateBidDto {
  @IsNotEmpty()
  @Validate(IsPositiveNonZeroNumber)
  @Transform((value) => parseFloat(value.value), { toClassOnly: true })
  bidAmount: number;
}
