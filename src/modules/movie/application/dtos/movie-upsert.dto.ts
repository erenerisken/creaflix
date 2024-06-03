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
import { ApiProperty } from '@nestjs/swagger';

export class MovieUpsertDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The name of the movie' })
  name: string;

  @IsInt()
  @Min(0)
  @ApiProperty({ description: 'Minimum age restriction for the movie' })
  minAge: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SessionUpsertDto)
  @ApiProperty({
    description: 'Available sessions of the movie',
    type: [SessionUpsertDto],
  })
  sessions: SessionUpsertDto[];
}
