import express from "npm:express";
import env from "./env.ts";
import routes from "./routes.ts";
import './db.ts';
import './sockets/sockets.ts'

const app = express();
app.use(express.json())
for ( const route of routes  ) {
    if (route.method === "POST") app.post(route.path, route.handler)
    if (route.method === "GET") app.get(route.path, route.handler)
}

app.listen(env.PORT, () => {
    console.log(`Curveimator SaaS Backend running on port ${env.PORT}`);
})
