import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { TicketService } from '../application/ticket.service';
import { TicketCreateDto } from '../application/dtos/ticket-create.dto';
import { Request } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('ticket')
export class TicketController {
  constructor(private ticketService: TicketService) {}

  @Post()
  async create(
    @Body() ticketCreateDto: TicketCreateDto,
    @Req() request: Request,
  ) {
    const { user } = request;

    await this.ticketService.create(user.id, user.age, ticketCreateDto);

    return { result: 'success' };
  }
}
