import { Sequelize } from 'npm:@sequelize/core';
import { PostgresDialect } from 'npm:@sequelize/postgres';
import env from "./env.ts";

// Models
import Project from "./models/project.model.ts";
import ProjectObject from "./models/projectObject.model.ts";
import Keyframe from "./models/keyframe.model.ts";

const sequelize = new Sequelize({
    dialect: PostgresDialect,
    database: env.POSTGRES_DATABASE,
    user: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
    host: env.POSTGRES_HOST,
    port: env.POSTGRES_PORT,
    ssl: false,
    models: [Project, ProjectObject, Keyframe]
});

await sequelize.sync({ force: true });

export default sequelize;