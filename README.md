# Starcrossed - Advanced Astrological Platform

Starcrossed is a comprehensive astrological platform for generating and interpreting astrological charts with advanced predictive features and community sharing capabilities. It calculates celestial positions at the time of birth and provides detailed interpretations of planetary placements, aspects, and house positions, along with advanced predictive tools.

## Features

### Core Birth Chart Features
- **Birth Chart Calculation Engine**: Accurate planetary positions using Swiss Ephemeris
- **Interactive Chart Visualization**: Beautiful and intuitive chart representations using D3.js
- **Detailed Interpretations**: Personalized analysis of planetary positions, aspects, and more
- **Multiple House Systems**: Support for Placidus, Whole Sign, and other house systems
- **User Accounts**: Save and manage multiple birth charts
- **Responsive Design**: Works on desktop and mobile devices

### Advanced Calculation Features
- **Secondary Progressions**: Day-for-a-year symbolic movement calculations
- **Solar Arc Directions**: All planets moving at the rate of the progressed Sun
- **Solar Return Charts**: Annual charts for when the Sun returns to its natal position
- **Lunar Phase Analysis**: Insight into lunar cycles and their personal impact
- **Composite Charts**: Relationship charts using planetary midpoints

### Predictive Tools
- **Personalized Forecasts**: Custom astrological forecasts based on multiple factors
- **Eclipse Impact Analysis**: How eclipses influence your chart specifically
- **Retrograde Planning Tool**: Plan around retrograde periods with personalized advice
- **Key Date Identification**: Important astrological dates and their meanings
- **Planetary Hour Calculator**: Traditional time division based on planetary rulerships

### Community & Sharing
- **Public Profiles**: Optional public astrologer profiles
- **Chart Sharing**: Share charts with interpretations
- **Chart Comments**: Discuss and provide feedback on charts
- **Community Forums**: Discuss astrology topics with other users
- **Social Media Integration**: Share charts on social platforms

## Tech Stack

### Frontend
- React
- TypeScript
- Tailwind CSS
- D3.js
- React Router
- Axios

### Backend
- Node.js
- Express
- MongoDB
- Swiss Ephemeris (via swisseph)
- JWT Authentication

## Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/starcrossed.git
   cd starcrossed
   ```

2. Install server dependencies and set up the database:
   ```
   cd server
   npm install
   cp .env.example .env
   # Edit .env with your database credentials and API keys
   npm run setup  # Downloads ephemeris files and initializes database
   ```

3. Install client dependencies:
   ```
   cd ../client
   npm install
   cp .env.example .env
   # Add your Google Maps API key to .env if needed
   ```

### Running the Development Server

1. Start the backend server:
   ```
   cd server
   npm run dev
   ```

2. Start the frontend development server:
   ```
   cd ../client
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
starcrossed/
├── client/                  # Frontend React application
│   ├── public/              # Static assets
│   └── src/                 # React source code
│       ├── components/      # Reusable components
│       ├── pages/           # Page components
│       ├── services/        # API service functions
│       └── utils/           # Utility functions
├── server/                  # Backend Node.js application
│   ├── ephe/                # Swiss Ephemeris data files
│   ├── scripts/             # Utility scripts
│   └── src/                 # Node.js source code
│       ├── controllers/     # Request handlers
│       ├── middleware/      # Express middleware
│       ├── models/          # Database models
│       ├── routes/          # API routes
│       ├── services/        # Business logic
│       └── utils/           # Utility functions
└── README.md                # Project documentation
```

## External APIs

The application uses the following external APIs:

- **Google Maps Geocoding API**: For location search and geocoding
- **TimeZoneDB API**: For historical timezone data

You'll need to obtain API keys for these services and add them to your `.env` file.

## Implementation Status

- **Phase 1: Complete** - Core birth chart calculations and visualization
- **Phase 2: Complete** - User accounts, saved charts, and transits 
- **Phase 3: Complete** - Advanced calculations, predictive tools, and community features
- **Phase 4: Planned** - Performance optimization, internationalization, and monetization

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Swiss Ephemeris](https://www.astro.com/swisseph/) for astronomical calculations
- [Astrodienst](https://www.astro.com/) for astrological reference data
