import { Sequelize } from 'npm:@sequelize/core';
import { PostgresDialect } from 'npm:@sequelize/postgres';
import express from "npm:express@4.18.2";
import models from "./models/models.ts";
import env from "./env.ts";


const sequelize = new Sequelize({
    dialect: PostgresDialect,
    database: env.POSTGRES_DATABASE,
    user: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
    host: env.POSTGRES_HOST,
    port: env.POSTGRES_PORT,
    ssl: false,
    models: Object.values(models)
});

const app = express();
app.use(express.json())
app.listen(env.PORT, () => {
    console.log(`Curveimator SaaS Backend running on port ${env.PORT}`);
})