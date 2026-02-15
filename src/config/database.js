// src/config/database.js
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    database: process.env.DB_NAME || 'autoloan_development',
    username: process.env.DB_USER || 'lenovo',
    password: process.env.DB_PASSWORD || null,
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log,
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
  },
  test: {
    database: process.env.DB_NAME || 'autoloan_test',
    username: process.env.DB_USER || 'lenovo',
    password: process.env.DB_PASSWORD || null,
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
  },
  production: {
    database: process.env.DB_NAME,
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    pool: { max: 10, min: 2, acquire: 30000, idle: 10000 },
  },
};

const dbConfig = config[env];

const sequelize = dbConfig.url
  ? new Sequelize(dbConfig.url, {
      dialect: dbConfig.dialect,
      logging: dbConfig.logging,
      pool: dbConfig.pool,
      dialectOptions: dbConfig.dialectOptions,
    })
  : new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
      host: dbConfig.host,
      port: dbConfig.port,
      dialect: dbConfig.dialect,
      logging: dbConfig.logging,
      pool: dbConfig.pool,
    });

export { sequelize, config };
export default sequelize;
