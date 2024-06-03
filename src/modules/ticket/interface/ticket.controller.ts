import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { TicketService } from '../application/ticket.service';
import { TicketCreateDto } from '../application/dtos/ticket-create.dto';
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('ticket')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ticket')
export class TicketController {
  constructor(private ticketService: TicketService) {}

  @Post()
  @ApiOperation({ summary: 'Book ticket for a movie session' })
  @ApiBody({ type: TicketCreateDto })
  @ApiResponse({ status: 201, description: 'Successful booking' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @ApiResponse({
    status: 409,
    description: 'Ticket already booked for session',
  })
  async create(
    @Body() ticketCreateDto: TicketCreateDto,
    @Req() request: Request,
  ) {
    const { user } = request;

    await this.ticketService.create(user.id, user.age, ticketCreateDto);

    return { result: 'success' };
  }
}
