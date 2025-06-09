import { apiMethods, endpoints } from './api';

const appointmentService = {
  // Get all appointments with optional filters
  getAppointments: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters);
    const url = queryParams.toString() 
      ? `${endpoints.appointments.list}?${queryParams}` 
      : endpoints.appointments.list;
    return apiMethods.get(url);
  },

  // Get appointment by ID
  getAppointmentById: async (id) => {
    return apiMethods.get(endpoints.appointments.getById(id));
  },

  // Create new appointment
  createAppointment: async (appointmentData) => {
    const payload = {
      doctorId: appointmentData.doctorId,
      patientId: appointmentData.patientId,
      departmentId: appointmentData.departmentId,
      appointmentDate: appointmentData.appointmentDate,
      appointmentTime: appointmentData.appointmentTime,
      type: appointmentData.type || 'regular',
      reason: appointmentData.reason,
      notes: appointmentData.notes || '',
      insuranceInfo: appointmentData.insuranceInfo,
      emergencyContact: appointmentData.emergencyContact,
    };
    
    return apiMethods.post(endpoints.appointments.create, payload);
  },

  // Update appointment
  updateAppointment: async (id, updateData) => {
    return apiMethods.put(endpoints.appointments.update(id), updateData);
  },

  // Cancel appointment
  cancelAppointment: async (id, cancellationReason = '') => {
    return apiMethods.post(endpoints.appointments.cancel(id), {
      reason: cancellationReason,
      cancelledAt: new Date().toISOString(),
    });
  },

  // Confirm appointment (doctor side)
  confirmAppointment: async (id) => {
    return apiMethods.post(endpoints.appointments.confirm(id), {
      status: 'confirmed',
      confirmedAt: new Date().toISOString(),
    });
  },

  // Reschedule appointment
  rescheduleAppointment: async (id, newDateTime) => {
    return apiMethods.patch(endpoints.appointments.update(id), {
      appointmentDate: newDateTime.date,
      appointmentTime: newDateTime.time,
      status: 'rescheduled',
      rescheduledAt: new Date().toISOString(),
    });
  },

  // Get appointments by user ID
  getUserAppointments: async (userId, status = null) => {
    const url = status 
      ? `${endpoints.appointments.byUser(userId)}?status=${status}`
      : endpoints.appointments.byUser(userId);
    return apiMethods.get(url);
  },

  // Get appointments by doctor ID
  getDoctorAppointments: async (doctorId, date = null) => {
    const url = date 
      ? `${endpoints.appointments.byDoctor(doctorId)}?date=${date}`
      : endpoints.appointments.byDoctor(doctorId);
    return apiMethods.get(url);
  },

  // Get upcoming appointments
  getUpcomingAppointments: async (limit = 10) => {
    return apiMethods.get(`${endpoints.appointments.upcoming}?limit=${limit}`);
  },

  // Get appointment history
  getAppointmentHistory: async (userId, page = 1, limit = 10) => {
    return apiMethods.get(`${endpoints.appointments.history}?userId=${userId}&page=${page}&limit=${limit}`);
  },

  // Check appointment availability
  checkAvailability: async (doctorId, date, time) => {
    return apiMethods.get(`${endpoints.doctors.availability(doctorId)}?date=${date}&time=${time}`);
  },

  // Get available time slots
  getAvailableSlots: async (doctorId, date) => {
    return apiMethods.get(`${endpoints.doctors.schedule(doctorId)}?date=${date}`);
  },

  // Search appointments
  searchAppointments: async (searchParams) => {
    const queryParams = new URLSearchParams(searchParams);
    return apiMethods.get(`${endpoints.appointments.list}/search?${queryParams}`);
  },

  // Get appointment statistics
  getAppointmentStats: async (dateRange = {}) => {
    const queryParams = new URLSearchParams(dateRange);
    return apiMethods.get(`${endpoints.appointments.list}/stats?${queryParams}`);
  },

  // Bulk update appointments
  bulkUpdateAppointments: async (appointmentIds, updateData) => {
    return apiMethods.post(`${endpoints.appointments.list}/bulk-update`, {
      appointmentIds,
      updateData,
    });
  },

  // Get appointment reminders
  getAppointmentReminders: async (userId) => {
    return apiMethods.get(`${endpoints.appointments.list}/reminders?userId=${userId}`);
  },

  // Send appointment reminder
  sendAppointmentReminder: async (appointmentId) => {
    return apiMethods.post(`${endpoints.appointments.getById(appointmentId)}/remind`);
  },

  // Mark appointment as completed
  markAsCompleted: async (id, completionData = {}) => {
    return apiMethods.patch(endpoints.appointments.update(id), {
      status: 'completed',
      completedAt: new Date().toISOString(),
      ...completionData,
    });
  },

  // Mark appointment as no-show
  markAsNoShow: async (id) => {
    return apiMethods.patch(endpoints.appointments.update(id), {
      status: 'no-show',
      noShowAt: new Date().toISOString(),
    });
  },

  // Get appointment conflicts
  getAppointmentConflicts: async (doctorId, dateTime) => {
    return apiMethods.get(`${endpoints.doctors.schedule(doctorId)}/conflicts?dateTime=${dateTime}`);
  },

  // Validate appointment data
  validateAppointment: (appointmentData) => {
    const errors = [];
    
    if (!appointmentData.doctorId) {
      errors.push('Doctor is required');
    }
    
    if (!appointmentData.patientId) {
      errors.push('Patient is required');
    }
    
    if (!appointmentData.appointmentDate) {
      errors.push('Appointment date is required');
    }
    
    if (!appointmentData.appointmentTime) {
      errors.push('Appointment time is required');
    }
    
    if (!appointmentData.reason || appointmentData.reason.trim().length === 0) {
      errors.push('Reason for appointment is required');
    }
    
    // Validate date is not in the past
    const appointmentDateTime = new Date(`${appointmentData.appointmentDate}T${appointmentData.appointmentTime}`);
    if (appointmentDateTime < new Date()) {
      errors.push('Appointment cannot be scheduled in the past');
    }
    
    // Validate working hours (9 AM to 6 PM)
    const hour = parseInt(appointmentData.appointmentTime?.split(':')[0]);
    if (hour < 9 || hour >= 18) {
      errors.push('Appointments can only be scheduled between 9:00 AM and 6:00 PM');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Format appointment data for display
  formatAppointmentData: (appointment) => {
    return {
      ...appointment,
      formattedDate: new Date(appointment.appointmentDate).toLocaleDateString(),
      formattedTime: appointment.appointmentTime,
      formattedDateTime: new Date(`${appointment.appointmentDate}T${appointment.appointmentTime}`).toLocaleString(),
      duration: appointment.duration || 30, // Default 30 minutes
      statusColor: getStatusColor(appointment.status),
      isUpcoming: new Date(`${appointment.appointmentDate}T${appointment.appointmentTime}`) > new Date(),
      canCancel: ['confirmed', 'pending'].includes(appointment.status) && 
                 new Date(`${appointment.appointmentDate}T${appointment.appointmentTime}`) > new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours notice
      canReschedule: ['confirmed', 'pending'].includes(appointment.status),
    };
  },

  // Get appointment status options
  getStatusOptions: () => [
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'confirmed', label: 'Confirmed', color: 'green' },
    { value: 'cancelled', label: 'Cancelled', color: 'red' },
    { value: 'completed', label: 'Completed', color: 'blue' },
    { value: 'no-show', label: 'No Show', color: 'gray' },
    { value: 'rescheduled', label: 'Rescheduled', color: 'orange' },
  ],

  // Get appointment type options
  getTypeOptions: () => [
    { value: 'regular', label: 'Regular Checkup' },
    { value: 'follow-up', label: 'Follow-up' },
    { value: 'consultation', label: 'Consultation' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'vaccination', label: 'Vaccination' },
    { value: 'surgery', label: 'Surgery' },
    { value: 'test', label: 'Medical Test' },
    { value: 'therapy', label: 'Therapy Session' },
  ],

  // Calculate appointment duration
  calculateDuration: (startTime, endTime) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    return (end - start) / (1000 * 60); // Duration in minutes
  },

  // Generate time slots
  generateTimeSlots: (startTime = '09:00', endTime = '18:00', interval = 30) => {
    const slots = [];
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    
    let current = new Date(start);
    while (current < end) {
      slots.push(current.toTimeString().slice(0, 5));
      current.setMinutes(current.getMinutes() + interval);
    }
    
    return slots;
  },

  // Check if appointment can be modified
  canModifyAppointment: (appointment, userRole = 'patient') => {
    const now = new Date();
    const appointmentDateTime = new Date(`${appointment.appointmentDate}T${appointment.appointmentTime}`);
    const hoursUntilAppointment = (appointmentDateTime - now) / (1000 * 60 * 60);
    
    // Can't modify past appointments
    if (appointmentDateTime < now) return false;
    
    // Can't modify completed or cancelled appointments
    if (['completed', 'cancelled', 'no-show'].includes(appointment.status)) return false;
    
    // Different rules for different roles
    if (userRole === 'patient') {
      // Patients need at least 2 hours notice
      return hoursUntilAppointment >= 2;
    } else if (userRole === 'doctor' || userRole === 'admin') {
      // Doctors and admins can modify until 30 minutes before
      return hoursUntilAppointment >= 0.5;
    }
    
    return false;
  },
};

// Helper function to get status color
const getStatusColor = (status) => {
  const colorMap = {
    pending: 'yellow',
    confirmed: 'green',
    cancelled: 'red',
    completed: 'blue',
    'no-show': 'gray',
    rescheduled: 'orange',
  };
  return colorMap[status] || 'gray';
};

export default appointmentService;