import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { SessionUpsertDto } from './session-upsert.dto';
import { Type } from 'class-transformer';

export class MovieUpsertDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(0)
  minAge: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SessionUpsertDto)
  sessions: SessionUpsertDto[];
}
