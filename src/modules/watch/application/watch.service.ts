import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { Ticket } from '../../ticket/domain/entities/ticket.entity';
import { TimeService } from '../../time/application/time.service';
import { WatchMovieDto } from './dtos/watch-movie.dto';
import { WatchHistoryEntryDto } from './dtos/watch-history-entry.dto';
import { History } from '../domain/entities/history.entity';
import { Pagination } from '../../../common/types/pagination.type';
import { WatchHistoryListDto } from './dtos/watch-history-list.dto';

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

  async listHistory(
    userId: number,
    pagination?: Pagination,
  ): Promise<WatchHistoryListDto> {
    const options: FindManyOptions<History> = {
      relations: ['movie'],
      where: { userId },
      order: { watchedAt: 'desc' },
    };

    if (pagination) {
      options.skip = (pagination.pageNumber - 1) * pagination.pageSize;
      options.take = pagination.pageSize;
    }

    const [entries, totalCount] =
      await this.historyRepository.findAndCount(options);

    const result = new WatchHistoryListDto();
    result.history = entries.map((entry) => {
      const watchHistoryEntryDto = new WatchHistoryEntryDto();
      watchHistoryEntryDto.movieId = entry.movieId;
      watchHistoryEntryDto.movieName = entry.movie.name;
      watchHistoryEntryDto.watchedAt = entry.watchedAt;

      return watchHistoryEntryDto;
    });
    if (pagination) {
      result.totalCount = totalCount;
      result.pageNumber = pagination.pageNumber;
      result.pageSize = pagination.pageSize;
    }

    return result;
  }
}
