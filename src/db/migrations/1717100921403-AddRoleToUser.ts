import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableUnique,
} from 'typeorm';

export class AddRoleToUser1717100921403 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'user',
      new TableColumn({
        name: 'role',
        type: 'text',
        isNullable: false,
      }),
    );

    await queryRunner.createUniqueConstraint(
      'user',
      new TableUnique({
        name: 'UQ_user_username',
        columnNames: ['username'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropUniqueConstraint('user', 'UQ_user_username');

    await queryRunner.dropColumn('user', 'role');
  }
}
