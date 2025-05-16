import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, RadialLinearScale, PointElement, LineElement } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

interface BirthChartProps {
  chartData: {
    planets: {
      name: string;
      degree: number;
      sign: string;
      house: number;
    }[];
    houses: {
      house: number;
      sign: string;
      degree: number;
    }[];
    aspects: {
      planet1: string;
      planet2: string;
      type: string;
      orb: number;
    }[];
  };
}

const BirthChart: React.FC<BirthChartProps> = ({ chartData }) => {
  // Define colors for each zodiac sign
  const signColors = {
    'Aries': '#FF4136',
    'Taurus': '#2ECC40',
    'Gemini': '#FFDC00',
    'Cancer': '#B10DC9',
    'Leo': '#FF851B',
    'Virgo': '#7FDBFF',
    'Libra': '#F012BE',
    'Scorpio': '#111111',
    'Sagittarius': '#01FF70',
    'Capricorn': '#0074D9',
    'Aquarius': '#85144b',
    'Pisces': '#39CCCC'
  };

  // For MVP, we'll create a simple doughnut chart to represent the signs
  // A real implementation would use a more complex chart to show houses, planets, etc.
  const data = {
    labels: Object.keys(signColors),
    datasets: [
      {
        data: Array(12).fill(1), // Equal parts for each sign
        backgroundColor: Object.values(signColors),
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.label}`;
          }
        }
      }
    },
    cutout: '60%',
  };

  // For MVP, we'll display planet info below the chart
  // A complete implementation would place planets on the chart
  return (
    <div className="bg-night-800 rounded-xl p-6 shadow-xl">
      <h2 className="text-2xl font-serif text-center mb-6">Birth Chart</h2>
      
      <div className="chart-container bg-night-900 rounded-full relative mb-8">
        <Doughnut data={data} options={options} />
        
        {/* Overlay planet positions */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <span className="text-primary-400 text-5xl">★</span>
            <p className="text-white">Your Cosmic Blueprint</p>
          </div>
        </div>
      </div>
      
      {/* Planet Positions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div>
          <h3 className="text-xl font-medium mb-3 text-primary-400">Planet Positions</h3>
          <div className="space-y-2">
            {chartData.planets.map((planet, index) => (
              <div key={index} className="flex justify-between bg-night-700 p-2 rounded">
                <span>{planet.name}</span>
                <span>{planet.sign} {planet.degree.toFixed(1)}° (House {planet.house})</span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-xl font-medium mb-3 text-primary-400">House Cusps</h3>
          <div className="space-y-2">
            {chartData.houses.map((house, index) => (
              <div key={index} className="flex justify-between bg-night-700 p-2 rounded">
                <span>House {house.house}</span>
                <span>{house.sign} {house.degree.toFixed(1)}°</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Aspects */}
      <div className="mt-8">
        <h3 className="text-xl font-medium mb-3 text-primary-400">Aspects</h3>
        <div className="space-y-2">
          {chartData.aspects.map((aspect, index) => (
            <div key={index} className="flex justify-between bg-night-700 p-2 rounded">
              <span>{aspect.planet1} - {aspect.planet2}</span>
              <span>{aspect.type} (orb: {aspect.orb.toFixed(1)}°)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BirthChart;
