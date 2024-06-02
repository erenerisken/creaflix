import { IsInt, IsString, Max, Min } from 'class-validator';
import { IsFutureISODate } from '../../../../common/decorators/is-future-iso-date.decorator';

export class SessionUpsertDto {
  @IsString()
  @IsFutureISODate()
  date: string;

  @IsInt()
  @Min(0)
  @Max(6)
  timeSlot: number;

  @IsInt()
  @Min(0)
  roomNumber: number;
}
