import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Session } from './session.entity';

@Entity()
export class Movie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, unique: true })
  name: string;

  @Column({ name: 'min_age', nullable: false })
  minAge: number;

  @OneToMany(() => Session, (session) => session.movie)
  sessions: Session[];
}
