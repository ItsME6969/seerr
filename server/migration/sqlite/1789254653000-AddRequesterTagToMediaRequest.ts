import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRequesterTagToMediaRequest1789254653000 implements MigrationInterface {
  name = 'AddRequesterTagToMediaRequest1789254653000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "media_request" ADD "requesterTag" varchar'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // SQLite cannot drop a column on all supported versions.
  }
}
