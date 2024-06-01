import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, unique: true })
  username: string;

  @Column({ nullable: false })
  salt: string;

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: false })
  age: number;

  @Column({ nullable: false })
  role: string;
}
