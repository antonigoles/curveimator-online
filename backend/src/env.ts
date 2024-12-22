const env = {
    PORT: Deno.env.get("PORT"),
    POSTGRES_PORT: Number(Deno.env.get("POSTGRES_PORT")),
    POSTGRES_HOST: Deno.env.get("POSTGRES_HOST"),
    POSTGRES_USER: Deno.env.get("POSTGRES_USER"),
    POSTGRES_PASSWORD: Deno.env.get("POSTGRES_PASSWORD"),
    POSTGRES_DATABASE: Deno.env.get("POSTGRES_DATABASE"),
};

export default env;