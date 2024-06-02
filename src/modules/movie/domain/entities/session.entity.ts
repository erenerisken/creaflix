import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Movie } from './movie.entity';

@Entity()
export class Session {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'movie_id', nullable: false })
  movieId: number;

  @ManyToOne(() => Movie, (movie) => movie.sessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'movie_id' })
  movie: Movie;

  @Column({ type: 'date', nullable: false })
  date: string;

  @Column({ name: 'time_slot', type: 'smallint', nullable: false })
  timeSlot: number;

  @Column({ name: 'room_number', type: 'int', nullable: false })
  roomNumber: number;
}
