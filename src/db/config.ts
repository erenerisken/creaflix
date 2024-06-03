import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from '../modules/user/domain/entities/user.entity';
import { Movie } from '../modules/movie/domain/entities/movie.entity';
import { Session } from '../modules/movie/domain/entities/session.entity';
import { Ticket } from '../modules/ticket/domain/entities/ticket.entity';
import { History } from '../modules/watch/domain/entities/history.entity';
import * as dotenv from 'dotenv';
import * as process from 'process';

dotenv.config();

export const dbConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: false,
  entities: [History, Movie, Session, Ticket, User],
  migrations: [__dirname + '/migrations/*.ts'],
};

const dataSource = new DataSource(dbConfig);

export default dataSource;
