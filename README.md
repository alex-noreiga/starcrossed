# 🌟 Starcrossed - Birth Chart Generator

A modern web application that generates personalized astrological birth charts with detailed interpretations.

## ✨ Features

- **Accurate Birth Chart Calculation**: Uses Swiss Ephemeris for precise astronomical calculations
- **Interactive Chart Visualization**: Beautiful, responsive chart diagrams
- **Personalized Interpretations**: Detailed analysis of planetary positions and aspects
- **User Profiles**: Save and compare multiple charts
- **Location Accuracy**: Precise geocoding for accurate birth location coordinates
- **Historical Time Zones**: Handles daylight saving time and historical time zone changes
- **Mobile Responsive**: Perfect experience on any device

## 🛠️ Tech Stack

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- Chart.js/D3.js for chart visualization
- React Router for navigation

### Backend
- Node.js with Express
- PostgreSQL database
- JWT for authentication

### External Libraries & APIs
- Swiss Ephemeris (via JavaScript wrapper)
- Google Maps API for location geocoding
- TimeZoneDB API for historical timezone data

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL
- Google Maps API key
- Swiss Ephemeris

### Installation

1. Clone the repository
```bash
git clone https://github.com/alex-noreiga/starcrossed.git
cd crossed
```

2. Install dependencies
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

3. Set up environment variables
```bash
# Server directory
cp .env.example .env
# Edit .env file with your database credentials and API keys
```

4. Set up the database
```bash
# Run migrations
cd server
npm run migrate
```

5. Start the development servers
```bash
# Start backend server (from server directory)
npm run dev

# Start frontend server (from client directory)
cd ../client
npm run dev
```

6. Open your browser and navigate to `http://localhost:3000`

## 📊 Project Structure

```
starcrossed/
├── client/                 # Frontend React application
│   ├── public/             # Static files
│   ├── src/                
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service functions
│   │   ├── store/          # State management
│   │   ├── types/          # TypeScript type definitions
│   │   ├── utils/          # Utility functions
│   │   └── App.tsx         # Main application component
├── server/                 # Backend Node.js/Express application
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   └── app.js          # Express application setup
│   ├── migrations/         # Database migrations
│   └── tests/              # Backend tests
└── README.md               # Project documentation
```

## 🧪 Testing

```bash
# Run backend tests
cd server
npm test

# Run frontend tests
cd client
npm test
```

## 📱 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | User login |
| GET | /api/charts | Get user's saved charts |
| POST | /api/charts | Create new chart |
| GET | /api/charts/:id | Get specific chart |
| PUT | /api/charts/:id | Update chart |
| DELETE | /api/charts/:id | Delete chart |

## 🔮 Birth Chart Calculation

The application uses the Swiss Ephemeris library to calculate planetary positions based on:
- Date of birth (year, month, day)
- Time of birth (hour, minute)
- Location of birth (latitude, longitude)

These calculations provide the positions of celestial bodies at the exact moment of birth, which form the basis of the astrological interpretation.

## 🌐 Deployment

- Frontend: Deployed on Vercel or Netlify
- Backend: Deployed on Heroku or Railway
- Database: Hosted on Supabase or Neon

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👏 Acknowledgements

- [Swiss Ephemeris](https://www.astro.com/swisseph/swephinfo_e.htm) for astronomical calculations
- [React](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [Chart.js](https://www.chartjs.org/)
- [D3.js](https://d3js.org/)
