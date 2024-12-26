# Curveimator Backend

To run tests
```bash
# You need test database first
sh ./bootstrap-test.sh 

# Now you need to run server with forced migrations
FORCE_SYNC_ON_START=true deno run src/index.ts

# Now run tests with allow-all flag
deno test --allow-all ./tests/**/*
```

To run dev local [TODO]
```bash
# Just run with docker compose
docker-compose up
```