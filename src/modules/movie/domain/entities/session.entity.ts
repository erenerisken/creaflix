import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Movie } from './movie.entity';
import { getSessionTimeRange } from '../../utils/session.util';
import { Ticket } from '../../../ticket/domain/entities/ticket.entity';

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

  @OneToMany(() => Ticket, (ticket) => ticket.session)
  tickets: Ticket[];

  isActive(now: Date): boolean {
    const sessionDate = new Date(this.date);
    const [startHour, endHour] = getSessionTimeRange(this.timeSlot);

    const sessionStart = new Date(sessionDate);
    sessionStart.setHours(startHour, 0, 0, 0);

    const sessionEnd = new Date(sessionDate);
    sessionEnd.setHours(endHour - 1, 59, 59, 999);

    return now >= sessionStart && now <= sessionEnd;
  }

  isExpired(now: Date): boolean {
    const sessionDate = new Date(this.date);
    const [, endHour] = getSessionTimeRange(this.timeSlot);

    const sessionEnd = new Date(sessionDate);
    sessionEnd.setHours(endHour - 1, 59, 59, 999);

    return now > sessionEnd;
  }
}
