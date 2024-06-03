import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TicketCreateDto {
  @IsInt()
  @ApiProperty({ description: 'The ID of the session to be booked' })
  sessionId: number;
}
