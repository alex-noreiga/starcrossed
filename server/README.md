# Starcrossed - Server

Backend API for the Starcrossed birth chart generator application.

## Technologies

- Node.js
- Express
- PostgreSQL
- Swiss Ephemeris (for astronomical calculations)
- JWT for authentication

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials and API keys
```

3. Set up the database:
```bash
# Create PostgreSQL database
createdb starcrossed

# Run migrations
npm run migrate
```

4. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/profile` - Get current user profile (requires authentication)

### Birth Charts
- `POST /api/charts` - Generate a birth chart
- `GET /api/charts/:id` - Get a specific chart
- `GET /api/charts` - Get all charts for the authenticated user
- `DELETE /api/charts/:id` - Delete a chart

## Swiss Ephemeris Setup

This application requires the Swiss Ephemeris library for accurate astronomical calculations. Follow these steps to set it up:

1. Download the ephemeris files from [Astrodienst](https://www.astro.com/ftp/swisseph/)
2. Extract the files to a directory named `ephe` in the project root
3. Update the `EPHE_PATH` in your `.env` file to point to this directory

## Running Tests

```bash
npm test
```
