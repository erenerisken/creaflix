import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Movie } from '../../../movie/domain/entities/movie.entity';

@Entity()
export class History {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'movie_id', nullable: false })
  movieId: number;

  @ManyToOne(() => Movie, (movie) => movie.historyEntries, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'movie_id' })
  movie: Movie;

  @Column({ name: 'user_id', nullable: false })
  userId: number;

  @Column({ name: 'watched_at', type: 'timestamptz', nullable: false })
  watchedAt: Date;
}
