/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
export class InitWorkflowConnector1755117022585 {
    name = 'InitWorkflowConnector1755117022585'

    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "workflows" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying, "isActive" boolean NOT NULL DEFAULT true, "config" jsonb, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_5b5757cc1cd86268019fef52e0c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "connectors" ("id" SERIAL NOT NULL, "key" character varying NOT NULL, "name" character varying NOT NULL, "type" character varying NOT NULL, "description" character varying, "paramSchema" jsonb, "defaultParams" jsonb, "config" jsonb, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_7b6fdd4504f608a94fb344918ee" UNIQUE ("key"), CONSTRAINT "PK_c1334e2a68a8de86d1732a8e3fb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "idx_connectors_key" ON "connectors" ("key") `);
        await queryRunner.query(`CREATE INDEX "idx_connectors_type" ON "connectors" ("type") `);
        await queryRunner.query(`CREATE TABLE "workflow_connectors" ("workflow_id" integer NOT NULL, "connector_id" integer NOT NULL, CONSTRAINT "PK_d8f76d733b7685c21b40911dddd" PRIMARY KEY ("workflow_id", "connector_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_4b9787cff67bfb4e324f41d529" ON "workflow_connectors" ("workflow_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_39c1789b81024de2680b603752" ON "workflow_connectors" ("connector_id") `);
        await queryRunner.query(`ALTER TABLE "workflow_connectors" ADD CONSTRAINT "FK_4b9787cff67bfb4e324f41d5292" FOREIGN KEY ("workflow_id") REFERENCES "workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "workflow_connectors" ADD CONSTRAINT "FK_39c1789b81024de2680b6037528" FOREIGN KEY ("connector_id") REFERENCES "connectors"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "workflow_connectors" DROP CONSTRAINT "FK_39c1789b81024de2680b6037528"`);
        await queryRunner.query(`ALTER TABLE "workflow_connectors" DROP CONSTRAINT "FK_4b9787cff67bfb4e324f41d5292"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_39c1789b81024de2680b603752"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4b9787cff67bfb4e324f41d529"`);
        await queryRunner.query(`DROP TABLE "workflow_connectors"`);
        await queryRunner.query(`DROP INDEX "public"."idx_connectors_type"`);
        await queryRunner.query(`DROP INDEX "public"."idx_connectors_key"`);
        await queryRunner.query(`DROP TABLE "connectors"`);
        await queryRunner.query(`DROP TABLE "workflows"`);
    }
}
