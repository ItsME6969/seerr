import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRequesterTagToMediaRequest1789254653000 implements MigrationInterface {
  name = 'AddRequesterTagToMediaRequest1789254653000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "media_request" ADD "requesterTag" character varying'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "media_request" DROP COLUMN "requesterTag"'
    );
  }
}
