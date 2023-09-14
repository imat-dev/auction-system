import { IsEnum } from "class-validator";
import { Status } from "../entity/items.entity";

export class UpdateItemDto {
  
    @IsEnum(Status)
    status: Status

}
