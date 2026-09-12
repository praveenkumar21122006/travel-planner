# Travel Planner API

Express and Prisma backend for the travel planner application. It runs locally
as a normal Node server and deploys to Vercel as one serverless function.

## Local development

1. Copy `.env.example` to `.env` and set `DATABASE_URL` and `JWT_SECRET`.
2. Install dependencies:

	```bash
	npm ci
	```

3. Generate Prisma Client and apply the local migration:

	```bash
	npm run prisma:generate
	npx prisma migrate deploy
	```

4. Start the API:

	```bash
	npm run dev
	```

The local health endpoint is `http://localhost:3001/health`.

## Vercel deployment

Import the GitHub repository into Vercel with the project root set to this
directory. Vercel uses `vercel.json` and runs `npm run vercel-build`.

Add these production environment variables in the Vercel project settings:

- `DATABASE_URL`: pooled PostgreSQL connection string
- `JWT_SECRET`: long random secret
- `JWT_EXPIRES_IN`: usually `7d`
- `OPENWEATHER_API_KEY`: OpenWeather API key
- `AMADEUS_API_KEY` and `AMADEUS_API_SECRET`, or `GEONAMES_USERNAME`

Run the initial database migration from a trusted environment with the same
production `DATABASE_URL`:

```bash
npx prisma migrate deploy
```

The deployed health endpoint is `/health`. All API routes are served through
the Vercel function at `api/index.ts`.