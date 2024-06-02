import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from '../../ticket/domain/entities/ticket.entity';
import { TimeService } from '../../time/application/time.service';
import { WatchMovieDto } from './dtos/watch-movie.dto';
import { WatchHistoryEntryDto } from './dtos/watch-history-entry.dto';
import { History } from '../domain/entities/history.entity';

@Injectable()
export class WatchService {
  constructor(
    @InjectRepository(History) private historyRepository: Repository<History>,
    @InjectRepository(Ticket) private ticketRepository: Repository<Ticket>,
    private readonly timeService: TimeService,
  ) {}

  async watch(
    userId: number,
    watchMovieDto: WatchMovieDto,
  ): Promise<WatchHistoryEntryDto> {
    const ticket = await this.ticketRepository.findOne({
      where: { userId, sessionId: watchMovieDto.sessionId },
      relations: ['session', 'session.movie'],
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const now = this.timeService.now();
    if (!ticket.session.isActive(now)) {
      throw new BadRequestException('Session is not active');
    }

    await this.historyRepository.query(
      `
      INSERT INTO history (movie_id, user_id, watched_at)
      VALUES ($1, $2, $3)
      ON CONFLICT (movie_id, user_id)
      DO UPDATE SET watched_at = EXCLUDED.watched_at
      `,
      [ticket.session.movieId, userId, now],
    );

    const watchHistoryEntryDto = new WatchHistoryEntryDto();
    watchHistoryEntryDto.movieId = ticket.session.movieId;
    watchHistoryEntryDto.movieName = ticket.session.movie.name;
    watchHistoryEntryDto.watchedAt = now;

    return watchHistoryEntryDto;
  }
}
