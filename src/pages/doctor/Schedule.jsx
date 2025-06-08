import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { scheduleService } from '../../services/scheduleService';
import { appointmentService } from '../../services/appointmentService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import './Schedule.css';

const Schedule = () => {
  const { user } = useAuth();
  
  const [scheduleData, setScheduleData] = useState({
    workingHours: {},
    appointments: [],
    blockedTimes: [],
    vacations: [],
    recurringSchedule: {}
  });

  const [currentView, setCurrentView] = useState('week'); // 'week', 'month', 'day'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modals
  const [showWorkingHoursModal, setShowWorkingHoursModal] = useState(false);
  const [showBlockTimeModal, setShowBlockTimeModal] = useState(false);
  const [showVacationModal, setShowVacationModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Working hours form
  const [workingHours, setWorkingHours] = useState({
    monday: { isWorking: true, start: '09:00', end: '17:00', breakStart: '12:00', breakEnd: '13:00' },
    tuesday: { isWorking: true, start: '09:00', end: '17:00', breakStart: '12:00', breakEnd: '13:00' },
    wednesday: { isWorking: true, start: '09:00', end: '17:00', breakStart: '12:00', breakEnd: '13:00' },
    thursday: { isWorking: true, start: '09:00', end: '17:00', breakStart: '12:00', breakEnd: '13:00' },
    friday: { isWorking: true, start: '09:00', end: '17:00', breakStart: '12:00', breakEnd: '13:00' },
    saturday: { isWorking: false, start: '09:00', end: '13:00', breakStart: '', breakEnd: '' },
    sunday: { isWorking: false, start: '09:00', end: '13:00', breakStart: '', breakEnd: '' }
  });

  // Block time form
  const [blockTimeForm, setBlockTimeForm] = useState({
    date: '',
    startTime: '',
    endTime: '',
    reason: '',
    isRecurring: false,
    recurrenceType: 'weekly',
    recurrenceEnd: ''
  });

  // Vacation form
  const [vacationForm, setVacationForm] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    type: 'vacation'
  });

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0') + ':00');

  useEffect(() => {
    fetchScheduleData();
  }, [currentDate, currentView]);

  const fetchScheduleData = async () => {
    try {
      setLoading(true);
      const [schedule, appointments] = await Promise.all([
        scheduleService.getDoctorSchedule(),
        appointmentService.getAppointmentsByDateRange(
          getDateRangeForView(currentDate, currentView)
        )
      ]);

      setScheduleData({
        workingHours: schedule.data.workingHours || {},
        appointments: appointments.data || [],
        blockedTimes: schedule.data.blockedTimes || [],
        vacations: schedule.data.vacations || [],
        recurringSchedule: schedule.data.recurringSchedule || {}
      });

      setWorkingHours(prev => ({
        ...prev,
        ...schedule.data.workingHours
      }));
    } catch (err) {
      setError('Failed to load schedule data');
      console.error('Schedule fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDateRangeForView = (date, view) => {
    const start = new Date(date);
    const end = new Date(date);

    switch (view) {
      case 'day':
        end.setDate(start.getDate() + 1);
        break;
      case 'week':
        start.setDate(date.getDate() - date.getDay());
        end.setDate(start.getDate() + 7);
        break;
      case 'month':
        start.setDate(1);
        end.setMonth(start.getMonth() + 1);
        end.setDate(0);
        break;
      default:
        break;
    }

    return { start, end };
  };

  const handleSaveWorkingHours = async () => {
    try {
      setError('');
      await scheduleService.updateWorkingHours(workingHours);
      setSuccess('Working hours updated successfully!');
      setShowWorkingHoursModal(false);
      fetchScheduleData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update working hours');
    }
  };

  const handleBlockTime = async () => {
    try {
      setError('');
      
      if (!blockTimeForm.date || !blockTimeForm.startTime || !blockTimeForm.endTime) {
        setError('Please fill in all required fields');
        return;
      }

      await scheduleService.blockTime(blockTimeForm);
      setSuccess('Time blocked successfully!');
      setShowBlockTimeModal(false);
      setBlockTimeForm({
        date: '',
        startTime: '',
        endTime: '',
        reason: '',
        isRecurring: false,
        recurrenceType: 'weekly',
        recurrenceEnd: ''
      });
      fetchScheduleData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to block time');
    }
  };

  const handleAddVacation = async () => {
    try {
      setError('');
      
      if (!vacationForm.startDate || !vacationForm.endDate) {
        setError('Please select start and end dates');
        return;
      }

      if (new Date(vacationForm.startDate) > new Date(vacationForm.endDate)) {
        setError('End date must be after start date');
        return;
      }

      await scheduleService.addVacation(vacationForm);
      setSuccess('Vacation scheduled successfully!');
      setShowVacationModal(false);
      setVacationForm({
        startDate: '',
        endDate: '',
        reason: '',
        type: 'vacation'
      });
      fetchScheduleData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to schedule vacation');
    }
  };

  const handleSlotClick = (date, time) => {
    const slotDateTime = new Date(`${date}T${time}`);
    const now = new Date();
    
    if (slotDateTime < now) {
      setError('Cannot schedule appointments in the past');
      return;
    }

    setSelectedSlot({ date, time });
    setShowAppointmentModal(true);
  };

  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentModal(true);
  };

  const isSlotAvailable = (date, time) => {
    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const daySchedule = scheduleData.workingHours[dayName];
    
    if (!daySchedule?.isWorking) return false;

    // Check if time is within working hours
    if (time < daySchedule.start || time >= daySchedule.end) return false;

    // Check if time is during break
    if (daySchedule.breakStart && daySchedule.breakEnd) {
      if (time >= daySchedule.breakStart && time < daySchedule.breakEnd) return false;
    }

    // Check if time is blocked
    const isBlocked = scheduleData.blockedTimes.some(block => {
      const blockDate = new Date(block.date).toDateString();
      const slotDate = new Date(date).toDateString();
      return blockDate === slotDate && time >= block.startTime && time < block.endTime;
    });

    if (isBlocked) return false;

    // Check if time is during vacation
    const isVacation = scheduleData.vacations.some(vacation => {
      const vacationStart = new Date(vacation.startDate);
      const vacationEnd = new Date(vacation.endDate);
      const slotDate = new Date(date);
      return slotDate >= vacationStart && slotDate <= vacationEnd;
    });

    if (isVacation) return false;

    // Check if appointment already exists
    const hasAppointment = scheduleData.appointments.some(appointment => {
      const appointmentDate = new Date(appointment.appointmentDate).toDateString();
      const slotDate = new Date(date).toDateString();
      return appointmentDate === slotDate && appointment.appointmentTime === time;
    });

    return !hasAppointment;
  };

  const getSlotStatus = (date, time) => {
    if (!isSlotAvailable(date, time)) {
      // Check if it's an appointment
      const appointment = scheduleData.appointments.find(apt => {
        const appointmentDate = new Date(apt.appointmentDate).toDateString();
        const slotDate = new Date(date).toDateString();
        return appointmentDate === slotDate && apt.appointmentTime === time;
      });
      
      if (appointment) return { type: 'appointment', data: appointment };
      
      // Check if it's blocked time
      const blockedTime = scheduleData.blockedTimes.find(block => {
        const blockDate = new Date(block.date).toDateString();
        const slotDate = new Date(date).toDateString();
        return blockDate === slotDate && time >= block.startTime && time < block.endTime;
      });
      
      if (blockedTime) return { type: 'blocked', data: blockedTime };
      
      return { type: 'unavailable' };
    }
    
    return { type: 'available' };
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    switch (currentView) {
      case 'day':
        newDate.setDate(newDate.getDate() + direction);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction * 7));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + direction);
        break;
      default:
        break;
    }
    setCurrentDate(newDate);
  };

  const getWeekDates = (date) => {
    const week = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    
    return week;
  };

  const renderWeekView = () => {
    const weekDates = getWeekDates(currentDate);
    const timeSlots = hours.filter(hour => {
      const hourNum = parseInt(hour);
      return hourNum >= 6 && hourNum <= 22; // Show 6 AM to 10 PM
    });

    return (
      <div className="week-view">
        <div className="week-header">
          <div className="time-column-header">Time</div>
          {weekDates.map((date, index) => (
            <div key={index} className="day-header">
              <div className="day-name">
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className="day-date">
                {date.getDate()}
              </div>
            </div>
          ))}
        </div>
        
        <div className="week-body">
          {timeSlots.map(time => (
            <div key={time} className="time-row">
              <div className="time-label">
                {formatTime(time)}
              </div>
              {weekDates.map((date, dateIndex) => {
                const dateStr = date.toISOString().split('T')[0];
                const slotStatus = getSlotStatus(dateStr, time);
                
                return (
                  <div
                    key={dateIndex}
                    className={`time-slot ${slotStatus.type}`}
                    onClick={() => {
                      if (slotStatus.type === 'available') {
                        handleSlotClick(dateStr, time);
                      } else if (slotStatus.type === 'appointment') {
                        handleAppointmentClick(slotStatus.data);
                      }
                    }}
                  >
                    {slotStatus.type === 'appointment' && (
                      <div className="appointment-info">
                        <span className="patient-name">
                          {slotStatus.data.patient?.firstName} {slotStatus.data.patient?.lastName}
                        </span>
                        <span className="appointment-type">
                          {slotStatus.data.appointmentType}
                        </span>
                      </div>
                    )}
                    {slotStatus.type === 'blocked' && (
                      <div className="blocked-info">
                        <span>🚫 {slotStatus.data.reason}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const dateStr = currentDate.toISOString().split('T')[0];
    const timeSlots = hours.filter(hour => {
      const hourNum = parseInt(hour);
      return hourNum >= 6 && hourNum <= 22;
    });

    return (
      <div className="day-view">
        <div className="day-header">
          <h3>{currentDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</h3>
        </div>
        
        <div className="day-schedule">
          {timeSlots.map(time => {
            const slotStatus = getSlotStatus(dateStr, time);
            
            return (
              <div
                key={time}
                className={`day-slot ${slotStatus.type}`}
                onClick={() => {
                  if (slotStatus.type === 'available') {
                    handleSlotClick(dateStr, time);
                  } else if (slotStatus.type === 'appointment') {
                    handleAppointmentClick(slotStatus.data);
                  }
                }}
              >
                <div className="slot-time">
                  {formatTime(time)}
                </div>
                <div className="slot-content">
                  {slotStatus.type === 'appointment' && (
                    <div className="appointment-card">
                      <h4>{slotStatus.data.patient?.firstName} {slotStatus.data.patient?.lastName}</h4>
                      <p>{slotStatus.data.appointmentType}</p>
                      <span className="duration">{slotStatus.data.duration || 30} min</span>
                    </div>
                  )}
                  {slotStatus.type === 'blocked' && (
                    <div className="blocked-card">
                      <span>🚫 {slotStatus.data.reason}</span>
                    </div>
                  )}
                  {slotStatus.type === 'available' && (
                    <div className="available-slot">
                      <span>+ Available</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startCalendar = new Date(firstDay);
    startCalendar.setDate(firstDay.getDate() - firstDay.getDay());
    
    const calendarDays = [];
    const current = new Date(startCalendar);
    
    while (current <= lastDay || current.getDay() !== 0 || calendarDays.length < 42) {
      calendarDays.push(new Date(current));
      current.setDate(current.getDate() + 1);
      if (calendarDays.length >= 42) break;
    }

    return (
      <div className="month-view">
        <div className="month-grid">
          <div className="month-header">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="month-day-header">{day}</div>
            ))}
          </div>
          
          <div className="month-body">
            {calendarDays.map((date, index) => {
              const dateStr = date.toISOString().split('T')[0];
              const dayAppointments = scheduleData.appointments.filter(apt => {
                const appointmentDate = new Date(apt.appointmentDate).toDateString();
                return date.toDateString() === appointmentDate;
              });
              
              const isCurrentMonth = date.getMonth() === month;
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <div
                  key={index}
                  className={`month-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
                  onClick={() => {
                    setCurrentDate(date);
                    setCurrentView('day');
                  }}
                >
                  <div className="day-number">{date.getDate()}</div>
                  <div className="day-appointments">
                    {dayAppointments.slice(0, 3).map((apt, aptIndex) => (
                      <div
                        key={aptIndex}
                        className="month-appointment"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAppointmentClick(apt);
                        }}
                      >
                        {apt.patient?.firstName} {apt.patient?.lastName}
                      </div>
                    ))}
                    {dayAppointments.length > 3 && (
                      <div className="more-appointments">
                        +{dayAppointments.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="schedule">
      <div className="schedule-header">
        <div className="header-content">
          <h1>My Schedule</h1>
          <div className="schedule-navigation">
            <button 
              className="nav-btn"
              onClick={() => navigateDate(-1)}
            >
              ← Previous
            </button>
            
            <div className="current-period">
              {currentView === 'month' && (
                currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
              )}
              {currentView === 'week' && (
                `Week of ${getWeekDates(currentDate)[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
              )}
              {currentView === 'day' && (
                currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
              )}
            </div>
            
            <button 
              className="nav-btn"
              onClick={() => navigateDate(1)}
            >
              Next →
            </button>
          </div>
        </div>
        
        <div className="header-actions">
          <div className="view-toggle">
            <button 
              className={`view-btn ${currentView === 'day' ? 'active' : ''}`}
              onClick={() => setCurrentView('day')}
            >
              Day
            </button>
            <button 
              className={`view-btn ${currentView === 'week' ? 'active' : ''}`}
              onClick={() => setCurrentView('week')}
            >
              Week
            </button>
            <button 
              className={`view-btn ${currentView === 'month' ? 'active' : ''}`}
              onClick={() => setCurrentView('month')}
            >
              Month
            </button>
          </div>
          
          <button 
            className="btn-outline"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </button>
          
          <div className="schedule-actions">
            <button 
              className="btn-outline"
              onClick={() => setShowWorkingHoursModal(true)}
            >
              ⚙️ Working Hours
            </button>
            <button 
              className="btn-outline"
              onClick={() => setShowBlockTimeModal(true)}
            >
              🚫 Block Time
            </button>
            <button 
              className="btn-outline"
              onClick={() => setShowVacationModal(true)}
            >
              🏖️ Vacation
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span>{error}</span>
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {success && (
        <div className="success-message">
          <span>{success}</span>
          <button onClick={() => setSuccess('')}>×</button>
        </div>
      )}

      {/* Schedule Statistics */}
      <div className="schedule-stats">
        <div className="stat-card">
          <span className="stat-number">
            {scheduleData.appointments.filter(apt => {
              const today = new Date().toDateString();
              return new Date(apt.appointmentDate).toDateString() === today;
            }).length}
          </span>
          <span className="stat-label">Today's Appointments</span>
        </div>
        
        <div className="stat-card">
          <span className="stat-number">
            {scheduleData.appointments.filter(apt => {
              const thisWeek = getWeekDates(new Date());
              const aptDate = new Date(apt.appointmentDate);
              return aptDate >= thisWeek[0] && aptDate <= thisWeek[6];
            }).length}
          </span>
          <span className="stat-label">This Week</span>
        </div>
        
        <div className="stat-card">
          <span className="stat-number">
            {scheduleData.blockedTimes.length}
          </span>
          <span className="stat-label">Blocked Times</span>
        </div>
        
        <div className="stat-card">
          <span className="stat-number">
            {scheduleData.vacations.length}
          </span>
          <span className="stat-label">Upcoming Vacations</span>
        </div>
      </div>

      {/* Calendar View */}
      <div className="schedule-content">
        {currentView === 'day' && renderDayView()}
        {currentView === 'week' && renderWeekView()}
        {currentView === 'month' && renderMonthView()}
      </div>

      {/* Working Hours Modal */}
      {showWorkingHoursModal && (
        <Modal onClose={() => setShowWorkingHoursModal(false)} size="large">
          <div className="working-hours-modal">
            <h3>Working Hours</h3>
            
            <div className="working-hours-form">
              {days.map(day => (
                <div key={day} className="day-schedule">
                  <div className="day-header">
                    <h4>{day.charAt(0).toUpperCase() + day.slice(1)}</h4>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={workingHours[day]?.isWorking || false}
                        onChange={(e) => setWorkingHours(prev => ({
                          ...prev,
                          [day]: { ...prev[day], isWorking: e.target.checked }
                        }))}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  
                  {workingHours[day]?.isWorking && (
                    <div className="time-inputs">
                      <div className="input-group">
                        <label>Start Time</label>
                        <input
                          type="time"
                          value={workingHours[day]?.start || '09:00'}
                          onChange={(e) => setWorkingHours(prev => ({
                            ...prev,
                            [day]: { ...prev[day], start: e.target.value }
                          }))}
                        />
                      </div>
                      
                      <div className="input-group">
                        <label>End Time</label>
                        <input
                          type="time"
                          value={workingHours[day]?.end || '17:00'}
                          onChange={(e) => setWorkingHours(prev => ({
                            ...prev,
                            [day]: { ...prev[day], end: e.target.value }
                          }))}
                        />
                      </div>
                      
                      <div className="input-group">
                        <label>Break Start</label>
                        <input
                          type="time"
                          value={workingHours[day]?.breakStart || ''}
                          onChange={(e) => setWorkingHours(prev => ({
                            ...prev,
                            [day]: { ...prev[day], breakStart: e.target.value }
                          }))}
                        />
                      </div>
                      
                      <div className="input-group">
                        <label>Break End</label>
                        <input
                          type="time"
                          value={workingHours[day]?.breakEnd || ''}
                          onChange={(e) => setWorkingHours(prev => ({
                            ...prev,
                            [day]: { ...prev[day], breakEnd: e.target.value }
                          }))}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => setShowWorkingHoursModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={handleSaveWorkingHours}
              >
                Save Working Hours
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Block Time Modal */}
      {showBlockTimeModal && (
        <Modal onClose={() => setShowBlockTimeModal(false)}>
          <div className="block-time-modal">
            <h3>Block Time</h3>
            
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={blockTimeForm.date}
                onChange={(e) => setBlockTimeForm(prev => ({ ...prev, date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div className="time-range">
              <div className="form-group">
                <label>Start Time</label>
                <input
                  type="time"
                  value={blockTimeForm.startTime}
                  onChange={(e) => setBlockTimeForm(prev => ({ ...prev, startTime: e.target.value }))}
                />
              </div>
              
              <div className="form-group">
                <label>End Time</label>
                <input
                  type="time"
                  value={blockTimeForm.endTime}
                  onChange={(e) => setBlockTimeForm(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Reason</label>
              <input
                type="text"
                value={blockTimeForm.reason}
                onChange={(e) => setBlockTimeForm(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Meeting, personal appointment, etc."
              />
            </div>
            
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={blockTimeForm.isRecurring}
                  onChange={(e) => setBlockTimeForm(prev => ({ ...prev, isRecurring: e.target.checked }))}
                />
                Recurring block
              </label>
            </div>
            
            {blockTimeForm.isRecurring && (
              <>
                <div className="form-group">
                  <label>Recurrence Type</label>
                  <select
                    value={blockTimeForm.recurrenceType}
                    onChange={(e) => setBlockTimeForm(prev => ({ ...prev, recurrenceType: e.target.value }))}
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Recurrence End Date</label>
                  <input
                    type="date"
                    value={blockTimeForm.recurrenceEnd}
                    onChange={(e) => setBlockTimeForm(prev => ({ ...prev, recurrenceEnd: e.target.value }))}
                    min={blockTimeForm.date}
                  />
                </div>
              </>
            )}

            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => setShowBlockTimeModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={handleBlockTime}
              >
                Block Time
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Vacation Modal */}
      {showVacationModal && (
        <Modal onClose={() => setShowVacationModal(false)}>
          <div className="vacation-modal">
            <h3>Schedule Vacation</h3>
            
            <div className="date-range">
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={vacationForm.startDate}
                  onChange={(e) => setVacationForm(prev => ({ ...prev, startDate: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={vacationForm.endDate}
                  onChange={(e) => setVacationForm(prev => ({ ...prev, endDate: e.target.value }))}
                  min={vacationForm.startDate || new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Type</label>
              <select
                value={vacationForm.type}
                onChange={(e) => setVacationForm(prev => ({ ...prev, type: e.target.value }))}
              >
                <option value="vacation">Vacation</option>
                <option value="sick_leave">Sick Leave</option>
                <option value="personal">Personal Leave</option>
                <option value="conference">Conference</option>
                <option value="training">Training</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Reason/Notes</label>
              <textarea
                value={vacationForm.reason}
                onChange={(e) => setVacationForm(prev => ({ ...prev, reason: e.target.value }))}
                rows="3"
                placeholder="Optional notes about your time off"
              />
            </div>

            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => setShowVacationModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={handleAddVacation}
              >
                Schedule Vacation
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Appointment Modal */}
      {showAppointmentModal && (selectedSlot || selectedAppointment) && (
        <Modal onClose={() => {
          setShowAppointmentModal(false);
          setSelectedSlot(null);
          setSelectedAppointment(null);
        }}>
          <div className="appointment-modal">
            {selectedAppointment ? (
              <div className="appointment-details">
                <h3>Appointment Details</h3>
                <div className="appointment-info">
                  <p><strong>Patient:</strong> {selectedAppointment.patient?.firstName} {selectedAppointment.patient?.lastName}</p>
                  <p><strong>Date:</strong> {formatDate(selectedAppointment.appointmentDate)}</p>
                  <p><strong>Time:</strong> {formatTime(selectedAppointment.appointmentTime)}</p>
                  <p><strong>Duration:</strong> {selectedAppointment.duration || 30} minutes</p>
                  <p><strong>Type:</strong> {selectedAppointment.appointmentType}</p>
                  {selectedAppointment.notes && (
                    <p><strong>Notes:</strong> {selectedAppointment.notes}</p>
                  )}
                </div>
                
                <div className="appointment-actions">
                  <button 
                    className="btn-outline"
                    onClick={() => {/* Navigate to patient history */}}
                  >
                    View Patient History
                  </button>
                  <button 
                    className="btn-outline"
                    onClick={() => {/* Edit appointment */}}
                  >
                    Edit Appointment
                  </button>
                  <button 
                    className="btn-danger"
                    onClick={() => {/* Cancel appointment */}}
                  >
                    Cancel Appointment
                  </button>
                </div>
              </div>
            ) : (
              <div className="slot-booking">
                <h3>Schedule New Appointment</h3>
                <div className="slot-info">
                  <p><strong>Date:</strong> {formatDate(selectedSlot?.date)}</p>
                  <p><strong>Time:</strong> {formatTime(selectedSlot?.time)}</p>
                </div>
                
                <div className="booking-actions">
                  <button 
                    className="btn-primary"
                    onClick={() => {
                      // Navigate to new appointment form with pre-filled date/time
                      window.location.href = `/doctor/appointments/new?date=${selectedSlot?.date}&time=${selectedSlot?.time}`;
                    }}
                  >
                    Book Appointment
                  </button>
                  <button 
                    className="btn-outline"
                    onClick={() => {
                      setBlockTimeForm({
                        ...blockTimeForm,
                        date: selectedSlot?.date,
                        startTime: selectedSlot?.time,
                        endTime: `${String(parseInt(selectedSlot?.time.split(':')[0]) + 1).padStart(2, '0')}:${selectedSlot?.time.split(':')[1]}`
                      });
                      setShowAppointmentModal(false);
                      setShowBlockTimeModal(true);
                    }}
                  >
                    Block This Time
                  </button>
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => {
                  setShowAppointmentModal(false);
                  setSelectedSlot(null);
                  setSelectedAppointment(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Schedule;