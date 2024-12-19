import { load } from 'ts-dotenv';

const env = load({
    PORT: Number,
    POSTGRES_PORT: Number,
    POSTGRES_HOST: String,
    POSTGRES_USER: String,
    POSTGRES_PASSWORD: String,
    POSTGRES_DATABASE: String,
});

export default env;