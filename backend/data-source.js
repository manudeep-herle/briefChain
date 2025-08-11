import "reflect-metadata";
import { DataSource } from "typeorm";
import Workflow from "./entities/workflow.js";
import Connector from "./entities/connector.js";
import dotenv from "dotenv";

dotenv.config();
const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = process.env;
const dbUrl = `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

const AppDataSource = new DataSource({
  type: "postgres",
  url: dbUrl,
  entities: [Workflow, Connector],
  migrations: ["migrations/*.js"],
  synchronize: false,
  logging: false,
});

export default AppDataSource;
