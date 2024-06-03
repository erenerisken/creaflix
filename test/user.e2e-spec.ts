import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { UserRegisterDto } from '../src/modules/user/application/dtos/user-register.dto';
import { UserLoginDto } from '../src/modules/user/application/dtos/user-login.dto';
import { DataSource } from 'typeorm';
import { dbConfig } from '../src/db/config';
import { UserRole } from '../src/common/enums/user-role.enum';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = new DataSource(dbConfig);
    await dataSource.initialize();
    await dataSource.runMigrations();
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  it('/user/register (POST)', async () => {
    const userRegisterDto: UserRegisterDto = {
      username: 'testuser',
      password: 'StrongP@ssw0rd',
      age: 25,
      role: UserRole.CUSTOMER,
    };

    return request(app.getHttpServer())
      .post('/user/register')
      .send(userRegisterDto)
      .expect(201)
      .expect({ result: 'success' });
  });

  it('/user/login (POST)', async () => {
    const userLoginDto: UserLoginDto = {
      username: 'testuser',
      password: 'StrongP@ssw0rd',
    };

    return request(app.getHttpServer())
      .post('/user/login')
      .send(userLoginDto)
      .expect(200)
      .expect((res) => {
        expect(res.body.token).toBeDefined();
      });
  });

  it('should return 409 for duplicate user registration (POST)', async () => {
    const userRegisterDto: UserRegisterDto = {
      username: 'testuser',
      password: 'StrongP@ssw0rd',
      age: 25,
      role: UserRole.CUSTOMER,
    };

    return request(app.getHttpServer())
      .post('/user/register')
      .send(userRegisterDto)
      .expect(409)
      .expect((res) => {
        expect(res.body.message).toBe('Username already exists');
      });
  });

  it('should return 401 for invalid login (POST)', async () => {
    const userLoginDto: UserLoginDto = {
      username: 'testuser',
      password: 'WrongPassword',
    };

    return request(app.getHttpServer())
      .post('/user/login')
      .send(userLoginDto)
      .expect(401)
      .expect((res) => {
        expect(res.body.message).toBe('Invalid credentials');
      });
  });
});
