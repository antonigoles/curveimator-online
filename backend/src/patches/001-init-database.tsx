import { connect } from "ts-postgres";
import env from "../env";

(async () => {
    const client = await connect({
        "port": env.POSTGRES_PORT,
        "host": env.POSTGRES_HOST,
        "user": env.POSTGRES_USER,
        "database": env.POSTGRES_DATABASE,
        "password": env.POSTGRES_PASSWORD,
    });

    await client.query(`CREATE TABLE "projects" (
        id VARCHAR(255) NOT NULL PRIMARY KEY,
        name VARCHAR(255),
    )`)
})();

