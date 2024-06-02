import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from '../modules/user/domain/entities/user.entity';
import { Movie } from '../modules/movie/domain/entities/movie.entity';
import { Session } from '../modules/movie/domain/entities/session.entity';
import { Ticket } from '../modules/ticket/domain/entities/ticket.entity';
import { History } from '../modules/watch/domain/entities/history.entity';

//TODO: Move credentials to environment
export const dbConfig: DataSourceOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'crea',
  password: 'flix',
  database: 'creaflix',
  ssl: false,
  entities: [History, Movie, Session, Ticket, User],
  migrations: [__dirname + '/migrations/*.ts'],
};

const dataSource = new DataSource(dbConfig);

export default dataSource;
