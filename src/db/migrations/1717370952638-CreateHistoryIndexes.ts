import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class CreateHistoryIndexes1717370952638 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createIndex(
      'history',
      new TableIndex({
        name: 'IDX_HISTORY_USER_ID',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'history',
      new TableIndex({
        name: 'IDX_HISTORY_WATCHED_AT',
        columnNames: ['watched_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('history', 'IDX_HISTORY_WATCHED_AT');
    await queryRunner.dropIndex('history', 'IDX_HISTORY_USER_ID');
  }
}
