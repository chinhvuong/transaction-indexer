import * as dotenv from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

dotenv.config();

export const configDatabase: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['dist/modules/**/*.entity.js'],
  migrations: ['dist/database/migrations/*.js', 'dist/database/seeds/*.js'],
  synchronize: false,
  logging: true,
  migrationsRun: false,
  migrationsTableName: 'migrations',
  // uuidExtension: 'uuid-ossp',
};

export const dataSource = new DataSource(configDatabase);
