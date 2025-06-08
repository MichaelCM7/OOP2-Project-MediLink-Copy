import React, { useState, useEffect } from 'react';
import './CalendarView.css';

const CalendarView = ({ appointments = [], onDateSelect, onAppointmentClick, userRole = 'patient' }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [view, setView] = useState('month'); // 'month', 'week', 'day'

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get calendar grid for current month
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  // Get appointments for a specific date
  const getAppointmentsForDate = (date) => {
    if (!date) return [];
    
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate.toDateString() === date.toDateString();
    });
  };

  // Navigate between months
  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  // Handle date selection
  const handleDateClick = (date) => {
    setSelectedDate(date);
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  // Format time for display
  const formatTime = (timeString) => {
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Get appointment status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'cancelled': return '#F44336';
      case 'completed': return '#2196F3';
      default: return '#9E9E9E';
    }
  };

  // Render month view
  const renderMonthView = () => {
    const days = getCalendarDays();
    
    return (
      <div className="calendar-grid">
        {/* Day headers */}
        {daysOfWeek.map(day => (
          <div key={day} className="calendar-day-header">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {days.map((date, index) => {
          if (!date) {
            return <div key={index} className="calendar-day empty"></div>;
          }
          
          const dayAppointments = getAppointmentsForDate(date);
          const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
          const isToday = date.toDateString() === new Date().toDateString();
          
          return (
            <div
              key={index}
              className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
              onClick={() => handleDateClick(date)}
            >
              <span className="day-number">{date.getDate()}</span>
              
              {dayAppointments.length > 0 && (
                <div className="appointments-indicator">
                  {dayAppointments.slice(0, 3).map((apt, aptIndex) => (
                    <div
                      key={aptIndex}
                      className="appointment-dot"
                      style={{ backgroundColor: getStatusColor(apt.status) }}
                      title={`${apt.patientName || apt.doctorName} - ${formatTime(apt.time)}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onAppointmentClick) onAppointmentClick(apt);
                      }}
                    />
                  ))}
                  {dayAppointments.length > 3 && (
                    <span className="more-appointments">+{dayAppointments.length - 3}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Render appointment details for selected date
  const renderSelectedDateDetails = () => {
    if (!selectedDate) return null;
    
    const dayAppointments = getAppointmentsForDate(selectedDate);
    
    return (
      <div className="selected-date-details">
        <h3>{selectedDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</h3>
        
        {dayAppointments.length === 0 ? (
          <p className="no-appointments">No appointments scheduled</p>
        ) : (
          <div className="appointments-list">
            {dayAppointments.map((apt, index) => (
              <div 
                key={index} 
                className="appointment-item"
                onClick={() => onAppointmentClick && onAppointmentClick(apt)}
              >
                <div className="appointment-time">
                  {formatTime(apt.time)}
                </div>
                <div className="appointment-details">
                  <div className="appointment-title">
                    {userRole === 'doctor' ? apt.patientName : apt.doctorName}
                  </div>
                  <div className="appointment-type">{apt.type || 'Consultation'}</div>
                </div>
                <div 
                  className="appointment-status"
                  style={{ color: getStatusColor(apt.status) }}
                >
                  {apt.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="calendar-view">
      {/* Calendar Header */}
      <div className="calendar-header">
        <div className="calendar-navigation">
          <button 
            className="nav-button"
            onClick={() => navigateMonth(-1)}
          >
            &#8249;
          </button>
          
          <h2 className="calendar-title">
            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          
          <button 
            className="nav-button"
            onClick={() => navigateMonth(1)}
          >
            &#8250;
          </button>
        </div>
        
        <div className="calendar-controls">
          <button 
            className={`view-button ${view === 'month' ? 'active' : ''}`}
            onClick={() => setView('month')}
          >
            Month
          </button>
          <button 
            className="today-button"
            onClick={() => {
              setCurrentDate(new Date());
              setSelectedDate(new Date());
            }}
          >
            Today
          </button>
        </div>
      </div>

      {/* Calendar Body */}
      <div className="calendar-body">
        <div className="calendar-main">
          {renderMonthView()}
        </div>
        
        {/* Selected Date Sidebar */}
        <div className="calendar-sidebar">
          {renderSelectedDateDetails()}
          
          {/* Legend */}
          <div className="calendar-legend">
            <h4>Legend</h4>
            <div className="legend-item">
              <div className="legend-dot" style={{ backgroundColor: '#4CAF50' }}></div>
              <span>Confirmed</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot" style={{ backgroundColor: '#FF9800' }}></div>
              <span>Pending</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot" style={{ backgroundColor: '#F44336' }}></div>
              <span>Cancelled</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot" style={{ backgroundColor: '#2196F3' }}></div>
              <span>Completed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;