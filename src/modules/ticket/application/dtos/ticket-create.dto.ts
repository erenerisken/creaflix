import { IsInt } from 'class-validator';

export class TicketCreateDto {
  @IsInt()
  sessionId: number;
}
