/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
export class WorkflowExecutionInit1755292132721 {
    name = 'WorkflowExecutionInit1755292132721'

    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "workflow_executions" ("id" SERIAL NOT NULL, "workflowId" integer NOT NULL, "status" character varying NOT NULL DEFAULT 'running', "startedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "completedAt" TIMESTAMP WITH TIME ZONE, "executionLog" jsonb, "finalResult" jsonb, "errorMessage" character varying, "failedStepId" character varying, CONSTRAINT "PK_9d49b5c86c267d902145ed42c9d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_workflow_executions_workflow_id" ON "workflow_executions" ("workflowId") `);
        await queryRunner.query(`CREATE INDEX "idx_workflow_executions_status" ON "workflow_executions" ("status") `);
        await queryRunner.query(`CREATE INDEX "idx_workflow_executions_started_at" ON "workflow_executions" ("startedAt") `);
        await queryRunner.query(`ALTER TABLE "workflow_executions" ADD CONSTRAINT "FK_2cb399c231cb3f82c63506794bc" FOREIGN KEY ("workflowId") REFERENCES "workflows"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "workflow_executions" DROP CONSTRAINT "FK_2cb399c231cb3f82c63506794bc"`);
        await queryRunner.query(`DROP INDEX "public"."idx_workflow_executions_started_at"`);
        await queryRunner.query(`DROP INDEX "public"."idx_workflow_executions_status"`);
        await queryRunner.query(`DROP INDEX "public"."idx_workflow_executions_workflow_id"`);
        await queryRunner.query(`DROP TABLE "workflow_executions"`);
    }
}
