import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from '../../movie/domain/entities/session.entity';
import { Repository } from 'typeorm';
import { Ticket } from '../domain/entities/ticket.entity';
import { TicketCreateDto } from './dtos/ticket-create.dto';
import { TimeService } from '../../time/application/time.service';
import { isDbStatusConflict } from '../../../common/utils/psql.util';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Session) private sessionRepository: Repository<Session>,
    @InjectRepository(Ticket) private ticketRepository: Repository<Ticket>,
    private readonly timeService: TimeService,
  ) {}

  async create(
    userId: number,
    userAge: number,
    ticketCreateDto: TicketCreateDto,
  ): Promise<void> {
    const session = await this.sessionRepository.findOne({
      where: { id: ticketCreateDto.sessionId },
      relations: ['movie'],
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.movie.minAge > userAge) {
      throw new BadRequestException('Minimum age restriction not satisfied');
    }

    if (session.isExpired(this.timeService.now())) {
      throw new BadRequestException('Session is expired');
    }

    const ticket = new Ticket();
    ticket.sessionId = session.id;
    ticket.session = session;
    ticket.userId = userId;

    try {
      await this.ticketRepository.save(ticket);
    } catch (err) {
      if (isDbStatusConflict(err.code)) {
        throw new ConflictException('Ticket already booked for session');
      }
      throw err;
    }
  }
}
