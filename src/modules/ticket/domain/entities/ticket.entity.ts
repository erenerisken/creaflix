import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Session } from '../../../movie/domain/entities/session.entity';

@Entity()
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'session_id', nullable: false })
  sessionId: number;

  @ManyToOne(() => Session, (session) => session.tickets, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'session_id' })
  session: Session;

  @Column({ name: 'user_id', nullable: false })
  userId: number;
}
