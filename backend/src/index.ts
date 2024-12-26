import express from "npm:express";
import env from "./env.ts";
import routes from "./routes.ts";
import './db.ts';
import './sockets/sockets.ts'
import cors from 'npm:cors'

if (env.DEV_MODE) console.log(env)

const app = express();
app.use(cors({
    origin: env.DEV_MODE ? [
        "https://localhost:5173",
        "http://localhost:5173"
    ] : [
        //TODO: Implement
    ],
    optionsSuccessStatus: 200
}))
app.use(express.json())
for ( const route of routes  ) {
    if (route.method === "POST") app.post(route.path, route.handler)
    if (route.method === "GET") app.get(route.path, route.handler)
}

app.listen(env.PORT, () => {
    console.log(`Curveimator SaaS Backend running on port ${env.PORT}`);
})
