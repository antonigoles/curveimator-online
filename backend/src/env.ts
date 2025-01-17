// if no env data is found we should use test data

const env = {
    HOST: Deno.env.get("HOST") || 'localhost',
    PORT: Deno.env.get("PORT") || 3001,
    POSTGRES_PORT: Number(Deno.env.get("POSTGRES_PORT")) || 5433,
    POSTGRES_HOST: Deno.env.get("POSTGRES_HOST") || 'localhost',
    POSTGRES_USER: Deno.env.get("POSTGRES_USER") || "test_postgres",
    POSTGRES_PASSWORD: Deno.env.get("POSTGRES_PASSWORD") || "test_postgres",
    POSTGRES_DATABASE: Deno.env.get("POSTGRES_DATABASE") || "test_curveimator",
    DEV_MODE: Boolean(Deno.env.get("DEV_MODE")) || true,
    SOCKETS_PORT: Number(Deno.env.get("SOCKETS_PORT")) || 2115,
    FORCE_SYNC_ON_START: Boolean(Deno.env.get("FORCE_SYNC_ON_START")) || false,
};
export default env;