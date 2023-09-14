import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsString,
  Min,
  Validate,
} from 'class-validator';
import { User } from 'src/auth/entity/user.entity';
import { IsPositiveNonZeroNumber } from 'src/common/helpers/custom-class.validator';


export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @Validate(IsPositiveNonZeroNumber)
  @Transform(value => parseFloat(value.value), { toClassOnly: true })
  startingPrice: number;

  @IsNumber()
  @Min(1, { message: 'Window Time must be greater than or equal to 1' })
  windowTime: number;

}
