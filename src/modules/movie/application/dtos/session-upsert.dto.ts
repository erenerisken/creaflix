import { IsInt, IsString, Max, Min } from 'class-validator';
import { IsFutureISODate } from '../../../../common/decorators/is-future-iso-date.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class SessionUpsertDto {
  @IsString()
  @IsFutureISODate()
  @ApiProperty({ description: 'Date of the session in ISO format' })
  date: string;

  @IsInt()
  @Min(0)
  @Max(6)
  @ApiProperty({
    description: 'Time slot of the session',
    minimum: 0,
    maximum: 6,
  })
  timeSlot: number;

  @IsInt()
  @Min(0)
  @ApiProperty({ description: 'Room number of the session' })
  roomNumber: number;
}
