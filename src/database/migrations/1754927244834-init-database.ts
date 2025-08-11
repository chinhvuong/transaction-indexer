import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitDatabase1754927244834 implements MigrationInterface {
  name = 'InitDatabase1754927244834';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid NOT NULL, "refreshTokenHash" text NOT NULL, "deviceInfo" jsonb, "isActive" boolean NOT NULL DEFAULT true, "lastActive" TIMESTAMP, CONSTRAINT "PK_3238ef96f18b355b671619111bc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('USER', 'ADMIN', 'MODERATOR', 'SUPER_ADMIN')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_status_enum" AS ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "walletAddress" character varying(255) NOT NULL, "chainType" character varying(50) NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'USER', "status" "public"."users_status_enum" NOT NULL DEFAULT 'ACTIVE', "lastLoginAt" TIMESTAMP, CONSTRAINT "UQ_fc71cd6fb73f95244b23e2ef113" UNIQUE ("walletAddress"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."transactions_operation_enum" AS ENUM('deposit', 'withdraw')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."transactions_status_enum" AS ENUM('PENDING', 'CONFIRMED', 'FAILED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "address" character varying(42) NOT NULL, "amount" numeric(65,18) NOT NULL DEFAULT '0', "raw_amount" numeric(78,0) NOT NULL DEFAULT '0', "operation" "public"."transactions_operation_enum" NOT NULL, "transaction_hash" character varying(66) NOT NULL, "chain_id" character varying(50) NOT NULL, "block_number" bigint NOT NULL, "block_time" bigint NOT NULL, "block_hash" character varying(66) NOT NULL, "token_address" character varying(42), "token_decimals" integer NOT NULL DEFAULT '18', "contract_address" character varying(42), "confirmations" integer NOT NULL DEFAULT '0', "require_confirmations" integer NOT NULL DEFAULT '12', "status" "public"."transactions_status_enum" NOT NULL DEFAULT 'PENDING', CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ec16d45d683b79842fd619b7cc" ON "transactions" ("contract_address") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_77e661374c58cc4f39e32427f3" ON "transactions" ("token_address") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cd6b004e20786b55734e494f7c" ON "transactions" ("operation") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cde04d1ed3f8beb2df1e59e978" ON "transactions" ("address") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_b53cfe42d3c5c88fe715b9432b" ON "transactions" ("transaction_hash") `,
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD CONSTRAINT "FK_57de40bc620f456c7311aa3a1e6" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sessions" DROP CONSTRAINT "FK_57de40bc620f456c7311aa3a1e6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b53cfe42d3c5c88fe715b9432b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cde04d1ed3f8beb2df1e59e978"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cd6b004e20786b55734e494f7c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_77e661374c58cc4f39e32427f3"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ec16d45d683b79842fd619b7cc"`,
    );
    await queryRunner.query(`DROP TABLE "transactions"`);
    await queryRunner.query(`DROP TYPE "public"."transactions_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."transactions_operation_enum"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    await queryRunner.query(`DROP TABLE "sessions"`);
  }
}
