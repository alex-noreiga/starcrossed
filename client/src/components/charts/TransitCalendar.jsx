import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isToday, parseISO } from 'date-fns';

/**
 * TransitCalendar component
 * 
 * @param {Object} props - Component props
 * @param {string} props.chartId - Chart ID for fetching transit data
 */
const TransitCalendar = ({ chartId }) => {
  const { token } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarData, setCalendarData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  
  // Fetch calendar data when month changes
  useEffect(() => {
    if (chartId) {
      fetchCalendarData();
    }
  }, [chartId, currentMonth]);
  
  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      
      // Calculate date range for current month view
      const startDate = startOfMonth(currentMonth);
      const endDate = endOfMonth(currentMonth);
      
      // Fetch transit calendar data
      const response = await axios.get(
        `/api/transits/${chartId}/calendar?startDate=${startDate.toISOString()}&days=${30}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setCalendarData(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching transit calendar data:', error);
      setError('Failed to load transit calendar');
      setLoading(false);
    }
  };
  
  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
    setSelectedDay(null);
  };
  
  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
    setSelectedDay(null);
  };
  
  // Navigate to current month
  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDay(new Date());
  };
  
  // Handle day click
  const handleDayClick = (day, transitData) => {
    setSelectedDay({
      date: day,
      transits: transitData
    });
  };
  
  // Generate calendar days
  const renderCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = monthStart;
    const endDate = monthEnd;
    
    const dateFormat = 'd';
    const rows = [];
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    // Create week rows
    let cells = [];
    days.forEach(day => {
      // Find transit data for this day
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayData = calendarData.find(item => item.date.startsWith(dayStr)) || null;
      
      // Calculate intensity color
      const intensity = dayData ? dayData.intensity : 0;
      const intensityClass = `intensity-${intensity}`;
      
      cells.push(
        <div
          className={`calendar-day ${
            !isSameMonth(day, monthStart)
              ? 'disabled'
              : isToday(day)
              ? 'today'
              : ''
          } ${selectedDay && format(selectedDay.date, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd') ? 'selected' : ''} ${intensityClass}`}
          key={day}
          onClick={() => handleDayClick(day, dayData)}
        >
          <span className="day-number">{format(day, dateFormat)}</span>
          {dayData && (
            <div className="transit-indicators">
              {dayData.aspects.length > 0 && (
                <span className="transit-count">{dayData.aspects.length}</span>
              )}
            </div>
          )}
        </div>
      );
    });
    
    // Add empty cells for days of the week before the first day of the month
    const firstDayOfMonth = getDay(monthStart);
    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.unshift(<div className="calendar-day disabled" key={`empty-${i}`}></div>);
    }
    
    // Split cells into rows of 7
    const daysInWeek = 7;
    let cellRows = [];
    
    cells.forEach((cell, i) => {
      if (i % daysInWeek === 0) {
        cellRows.push([]);
      }
      
      const currentWeek = Math.floor(i / daysInWeek);
      cellRows[currentWeek].push(cell);
    });
    
    // Add remaining empty cells to complete the last row
    const lastRowIndex = cellRows.length - 1;
    if (cellRows[lastRowIndex].length < daysInWeek) {
      const remainingCells = daysInWeek - cellRows[lastRowIndex].length;
      for (let i = 0; i < remainingCells; i++) {
        cellRows[lastRowIndex].push(<div className="calendar-day disabled" key={`empty-end-${i}`}></div>);
      }
    }
    
    // Create row elements
    cellRows.forEach((row, i) => {
      rows.push(
        <div className="calendar-row" key={i}>
          {row}
        </div>
      );
    });
    
    return rows;
  };
  
  // Generate calendar headers (day names)
  const renderCalendarHeader = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <div className="calendar-header">
        {days.map(day => (
          <div className="calendar-day-name" key={day}>
            {day}
          </div>
        ))}
      </div>
    );
  };
  
  // Render selected day details
  const renderSelectedDayDetails = () => {
    if (!selectedDay) return null;
    
    const formattedDate = format(selectedDay.date, 'MMMM d, yyyy');
    const transits = selectedDay.transits?.aspects || [];
    
    return (
      <div className="selected-day-details">
        <h3>{formattedDate} Transits</h3>
        
        {transits.length > 0 ? (
          <div className="transit-list">
            {transits.map((transit, index) => (
              <div className="transit-item" key={index}>
                <div className="transit-header">
                  <span className="transit-planets">
                    {transit.transitPlanet} {getAspectSymbol(transit.aspectType)} {transit.natalPlanet}
                  </span>
                  <span className="transit-info">
                    {transit.exactness.toFixed(0)}% {transit.applying ? 'Applying' : 'Separating'}
                  </span>
                </div>
                <p>{transit.interpretation}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-transits">No significant transits on this day.</p>
        )}
      </div>
    );
  };
  
  // Helper function to get aspect symbol
  const getAspectSymbol = (aspect) => {
    const symbols = {
      'conjunction': '☌',
      'opposition': '☍',
      'trine': '△',
      'square': '□',
      'sextile': '⚹'
    };
    
    return symbols[aspect] || '*';
  };
  
  // Render legend
  const renderLegend = () => {
    return (
      <div className="calendar-legend">
        <div className="legend-title">Transit Intensity</div>
        <div className="legend-items">
          {[0, 1, 2, 3, 4, 5].map(intensity => (
            <div className="legend-item" key={intensity}>
              <div className={`legend-color intensity-${intensity}`}></div>
              <div className="legend-label">
                {intensity === 0 ? 'None' : 
                 intensity === 1 ? 'Minimal' : 
                 intensity === 2 ? 'Light' :
                 intensity === 3 ? 'Moderate' :
                 intensity === 4 ? 'Strong' : 'Intense'}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="transit-calendar-container">
      <div className="calendar-header-controls">
        <div className="month-navigation">
          <button onClick={prevMonth} className="nav-button">
            &lt; Prev
          </button>
          <h2 className="current-month">{format(currentMonth, 'MMMM yyyy')}</h2>
          <button onClick={nextMonth} className="nav-button">
            Next &gt;
          </button>
        </div>
        <button onClick={goToToday} className="today-button">
          Today
        </button>
      </div>
      
      {loading ? (
        <div className="loading">Loading calendar data...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="calendar-grid-container">
          <div className="calendar-grid">
            {renderCalendarHeader()}
            {renderCalendarDays()}
          </div>
          
          {renderLegend()}
        </div>
      )}
      
      {selectedDay && renderSelectedDayDetails()}
      
      <style jsx>{`
        .transit-calendar-container {
          font-family: Arial, sans-serif;
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .calendar-header-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .month-navigation {
          display: flex;
          align-items: center;
        }
        
        .current-month {
          margin: 0 15px;
          min-width: 150px;
          text-align: center;
        }
        
        .nav-button, .today-button {
          background-color: #6c5ce7;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        
        .nav-button:hover, .today-button:hover {
          background-color: #5649c0;
        }
        
        .calendar-grid-container {
          display: flex;
          gap: 20px;
        }
        
        .calendar-grid {
          flex: 1;
          border: 1px solid #ddd;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .calendar-header {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          background-color: #f8f9fa;
          border-bottom: 1px solid #ddd;
        }
        
        .calendar-day-name {
          padding: 10px;
          text-align: center;
          font-weight: bold;
        }
        
        .calendar-row {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
        }
        
        .calendar-day {
          position: relative;
          min-height: 80px;
          padding: 5px;
          border-right: 1px solid #eee;
          border-bottom: 1px solid #eee;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        
        .calendar-day:hover {
          background-color: #f1f1f1;
        }
        
        .calendar-day.disabled {
          opacity: 0.5;
          cursor: default;
          background-color: #f9f9f9;
        }
        
        .calendar-day.today {
          background-color: #e8f4fd;
          font-weight: bold;
        }
        
        .calendar-day.selected {
          border: 2px solid #6c5ce7;
        }
        
        .day-number {
          position: absolute;
          top: 5px;
          left: 5px;
        }
        
        .transit-indicators {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
        }
        
        .transit-count {
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #6c5ce7;
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          font-size: 12px;
        }
        
        .selected-day-details {
          margin-top: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 15px;
        }
        
        .transit-list {
          margin-top: 10px;
        }
        
        .transit-item {
          margin-bottom: 15px;
          padding-bottom: 15px;
          border-bottom: 1px solid #eee;
        }
        
        .transit-item:last-child {
          border-bottom: none;
        }
        
        .transit-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
        }
        
        .transit-planets {
          font-weight: bold;
          font-size: 16px;
        }
        
        .transit-info {
          font-size: 14px;
          color: #666;
        }
        
        .no-transits {
          color: #666;
          font-style: italic;
        }
        
        .calendar-legend {
          width: 180px;
        }
        
        .legend-title {
          font-weight: bold;
          margin-bottom: 10px;
        }
        
        .legend-items {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .legend-color {
          width: 20px;
          height: 20px;
          border-radius: 4px;
          border: 1px solid #ddd;
        }
        
        .legend-label {
          font-size: 12px;
        }
        
        /* Intensity colors */
        .intensity-0 {
          background-color: #ffffff;
        }
        
        .intensity-1 {
          background-color: #e3f2fd;
        }
        
        .intensity-2 {
          background-color: #bbdefb;
        }
        
        .intensity-3 {
          background-color: #90caf9;
        }
        
        .intensity-4 {
          background-color: #64b5f6;
        }
        
        .intensity-5 {
          background-color: #42a5f5;
        }
        
        .loading, .error {
          padding: 20px;
          text-align: center;
          color: #666;
        }
        
        .error {
          color: #e53935;
        }
      `}</style>
    </div>
  );
};

export default TransitCalendar;
