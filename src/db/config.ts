import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from '../modules/user/domain/entities/user.entity';
import { Movie } from '../modules/movie/domain/entities/movie.entity';

export const dbConfig: DataSourceOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'crea',
  password: 'flix',
  database: 'creaflix',
  ssl: false,
  entities: [Movie, User],
  migrations: [__dirname + '/migrations/*.ts'],
};

const dataSource = new DataSource(dbConfig);

export default dataSource;
