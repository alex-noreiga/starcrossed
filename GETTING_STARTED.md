# Getting Started with Starcrossed

This document provides step-by-step instructions for setting up and running the Starcrossed application.

## Prerequisites

- Node.js (v14+)
- PostgreSQL (v12+)
- npm or yarn

## Setup Instructions

### 1. Database Setup

1. Create a PostgreSQL database for the application:

```sql
CREATE DATABASE starcrossed;
```

2. Create a database user (optional, you can use an existing user):

```sql
CREATE USER starcrossed_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE starcrossed TO starcrossed_user;
```

### 2. Server Setup

1. Navigate to the server directory:

```bash
cd server
```

2. Create an environment file by copying the example:

```bash
cp .env.example .env
```

3. Edit the `.env` file with your database credentials and API keys:

```
DB_USER=starcrossed_user
DB_PASSWORD=your_password
DB_NAME=starcrossed
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
TIMEZONE_DB_API_KEY=your_timezone_db_api_key
JWT_SECRET=your_jwt_secret
```

4. Run the setup script to install dependencies, download ephemeris files, and run database migrations:

```bash
npm run setup
```

### 3. Client Setup

1. Navigate to the client directory:

```bash
cd ../client
```

2. Create an environment file by copying the example:

```bash
cp .env.example .env
```

3. Add your Google Maps API key to the `.env` file:

```
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

4. Install dependencies:

```bash
npm install
```

## Running the Application

### Development Mode

1. Start the backend server (from the server directory):

```bash
npm run dev
```

2. In a new terminal, start the frontend development server (from the client directory):

```bash
npm start
```

3. The application should now be running at:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Production Mode

For production deployment, you would build the frontend and set up a proper web server, but for testing purposes:

1. Build the frontend (from the client directory):

```bash
npm run build
```

2. Start the backend server (from the server directory):

```bash
npm start
```

## Troubleshooting

### Database Migrations

If you need to re-run migrations:

```bash
cd server
npm run migrate
```

### Swiss Ephemeris Files

If the ephemeris files are missing, you can download them manually:

```bash
cd server
npm run download-ephe
```

### API Key Issues

If you encounter issues with the Google Maps or TimeZoneDB APIs, verify that:

1. Your API keys are correct
2. The APIs are enabled in your Google Cloud console
3. Billing is set up if required by the API provider

## Testing

To run backend tests:

```bash
cd server
npm test
```

## Need Help?

If you encounter any issues during setup or running the application, please refer to the project documentation or check for error logs in the console.
