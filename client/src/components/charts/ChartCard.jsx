import React from 'react';
import { Link } from 'react-router-dom';

const ChartCard = ({ chart, onDelete, onSelectForComparison, isSelectedForComparison }) => {
  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Format time for display
  const formatTime = (timeString) => {
    return timeString.substring(0, 5); // Just take HH:MM part
  };
  
  return (
    <div className={`bg-night-700 rounded-lg shadow-lg overflow-hidden transition-all duration-200 ${
      isSelectedForComparison ? 'ring-2 ring-indigo-500' : ''
    }`}>
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-primary-300 truncate">{chart.name}</h3>
          <div className="flex">
            <button
              onClick={onSelectForComparison}
              className={`mr-2 p-1.5 rounded-md transition-colors ${
                isSelectedForComparison 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-night-600 text-night-300 hover:bg-night-500'
              }`}
              title={isSelectedForComparison ? "Deselect for comparison" : "Select for comparison"}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 6l-10 8 10 8M3 14h18" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="space-y-2 text-sm text-night-200 mb-4">
          <div className="flex justify-between">
            <span className="text-night-400">Date:</span>
            <span>{formatDate(chart.birthDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-night-400">Time:</span>
            <span>{formatTime(chart.birthTime)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-night-400">Location:</span>
            <span className="truncate max-w-[200px]">{chart.birthPlace}</span>
          </div>
        </div>
        
        <div className="flex justify-between">
          <Link
            to={`/charts/${chart.id}`}
            className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded transition-colors"
          >
            View Chart
          </Link>
          
          <div className="flex space-x-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/shared-chart/${chart.id}`);
                alert('Chart link copied to clipboard!');
              }}
              className="p-1.5 bg-night-600 hover:bg-night-500 text-night-300 hover:text-night-100 rounded transition-colors"
              title="Share Chart"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                <polyline points="16 6 12 2 8 6"/>
                <line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
            </button>
            
            <button
              onClick={() => window.open(`/api/charts/${chart.id}/pdf`, '_blank')}
              className="p-1.5 bg-night-600 hover:bg-night-500 text-night-300 hover:text-night-100 rounded transition-colors"
              title="Download as PDF"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 3v4a1 1 0 0 0 1 1h4"/>
                <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z"/>
                <line x1="9" y1="9" x2="10" y2="9"/>
                <line x1="9" y1="13" x2="15" y2="13"/>
                <line x1="9" y1="17" x2="15" y2="17"/>
              </svg>
            </button>
            
            <button
              onClick={onDelete}
              className="p-1.5 bg-red-900 hover:bg-red-800 text-red-300 hover:text-red-100 rounded transition-colors"
              title="Delete Chart"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartCard;
