import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, FileText, AlertCircle, MapPin } from 'lucide-react';
import { validateForm } from '../../utils/validators';
import { getNextAvailableDates } from '../../utils/dateUtils';
import { ButtonLoader } from '../common/LoadingSpinner';

const AppointmentForm = ({ 
  doctor,
  selectedDate,
  selectedTime,
  onSubmit,
  onCancel,
  isLoading = false,
  initialData = null,
  isReschedule = false
}) => {
  const [formData, setFormData] = useState({
    doctorId: doctor?.id || '',
    date: selectedDate || '',
    time: selectedTime || '',
    appointmentType: 'consultation',
    reason: '',
    symptoms: '',
    urgency: 'normal',
    isFollowUp: false,
    previousAppointmentId: '',
    insuranceProvider: '',
    insurancePolicyNumber: '',
    emergencyContact: '',
    emergencyPhone: '',
    notes: '',
    preferredLanguage: 'english',
    isTelemedicine: false,
    ...initialData
  });

  const [errors, setErrors] = useState({});
  const [availableDates, setAvailableDates] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);

  const appointmentTypes = [
    { value: 'consultation', label: 'Consultation' },
    { value: 'followup', label: 'Follow-up' },
    { value: 'checkup', label: 'Regular Checkup' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'procedure', label: 'Procedure' },
    { value: 'screening', label: 'Screening' }
  ];

  const urgencyLevels = [
    { value: 'low', label: 'Low - Routine care' },
    { value: 'normal', label: 'Normal - Standard appointment' },
    { value: 'high', label: 'High - Urgent but not emergency' },
    { value: 'emergency', label: 'Emergency - Immediate attention needed' }
  ];

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30'
  ];

  useEffect(() => {
    // Get next 14 available dates
    setAvailableDates(getNextAvailableDates(14, true));
  }, []);

  useEffect(() => {
    if (formData.date && doctor?.id) {
      loadAvailableTimes();
    }
  }, [formData.date, doctor?.id]);

  const loadAvailableTimes = async () => {
    try {
      // Simulate API call to get available times for the selected date
      // In real implementation, this would call the backend
      setTimeout(() => {
        // Mock: Remove some times to simulate busy slots
        const busySlots = ['09:00', '14:00', '16:00'];
        const available = timeSlots.filter(time => !busySlots.includes(time));
        setAvailableTimes(available);
      }, 500);
    } catch (error) {
      console.error('Error loading available times:', error);
    }
  };

  const validationRules = {
    date: [{ type: 'required' }],
    time: [{ type: 'required' }],
    appointmentType: [{ type: 'required' }],
    reason: [{ type: 'required' }],
    urgency: [{ type: 'required' }],
    emergencyContact: [{ type: 'required' }],
    emergencyPhone: [{ type: 'required' }, { type: 'phone' }]
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { isValid, errors: validationErrors } = validateForm(formData, validationRules);
    
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to book appointment' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-gray-900">
            {isReschedule ? 'Reschedule Appointment' : 'Book Appointment'}
          </h2>
          {doctor && (
            <div className="flex items-center space-x-3 mt-3">
              <div className="w-10 h-10 bg-primary-blue-lightest rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-primary-blue" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{doctor.name}</p>
                <p className="text-sm text-gray-600">{doctor.specialty}</p>
              </div>
            </div>
          )}
        </div>

        <div className="card-body">
          {errors.submit && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                <span className="text-red-700 text-sm">{errors.submit}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date and Time Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Preferred Date *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className={`form-select pl-10 ${errors.date ? 'error' : ''}`}
                  >
                    <option value="">Select date</option>
                    {availableDates.map(date => (
                      <option key={date.toISOString()} value={date.toISOString().split('T')[0]}>
                        {date.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.date && <div className="form-error">{errors.date}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Preferred Time *</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className={`form-select pl-10 ${errors.time ? 'error' : ''}`}
                    disabled={!formData.date}
                  >
                    <option value="">Select time</option>
                    {availableTimes.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
                {errors.time && <div className="form-error">{errors.time}</div>}
              </div>
            </div>

            {/* Appointment Type and Urgency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Appointment Type *</label>
                <select
                  name="appointmentType"
                  value={formData.appointmentType}
                  onChange={handleInputChange}
                  className={`form-select ${errors.appointmentType ? 'error' : ''}`}
                >
                  {appointmentTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                {errors.appointmentType && <div className="form-error">{errors.appointmentType}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Urgency Level *</label>
                <select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleInputChange}
                  className={`form-select ${errors.urgency ? 'error' : ''}`}
                >
                  {urgencyLevels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
                {errors.urgency && <div className="form-error">{errors.urgency}</div>}
              </div>
            </div>

            {/* Reason and Symptoms */}
            <div className="form-group">
              <label className="form-label">Reason for Visit *</label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                className={`form-textarea ${errors.reason ? 'error' : ''}`}
                rows="3"
                placeholder="Please describe the main reason for your visit..."
              />
              {errors.reason && <div className="form-error">{errors.reason}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Current Symptoms (Optional)</label>
              <textarea
                name="symptoms"
                value={formData.symptoms}
                onChange={handleInputChange}
                className="form-textarea"
                rows="3"
                placeholder="Please describe any symptoms you're experiencing..."
              />
            </div>

            {/* Emergency Contact */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Contact Name *</label>
                  <input
                    type="text"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    className={`form-input ${errors.emergencyContact ? 'error' : ''}`}
                    placeholder="Emergency contact name"
                  />
                  {errors.emergencyContact && <div className="form-error">{errors.emergencyContact}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Phone *</label>
                  <input
                    type="tel"
                    name="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={handleInputChange}
                    className={`form-input ${errors.emergencyPhone ? 'error' : ''}`}
                    placeholder="(555) 123-4567"
                  />
                  {errors.emergencyPhone && <div className="form-error">{errors.emergencyPhone}</div>}
                </div>
              </div>
            </div>

            {/* Insurance Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Insurance Information (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Insurance Provider</label>
                  <input
                    type="text"
                    name="insuranceProvider"
                    value={formData.insuranceProvider}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="e.g., Blue Cross Blue Shield"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Policy Number</label>
                  <input
                    type="text"
                    name="insurancePolicyNumber"
                    value={formData.insurancePolicyNumber}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Policy number"
                  />
                </div>
              </div>
            </div>

            {/* Additional Options */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Additional Options</h3>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isFollowUp"
                    name="isFollowUp"
                    checked={formData.isFollowUp}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-primary-blue focus:ring-primary-blue border-gray-300 rounded"
                  />
                  <label htmlFor="isFollowUp" className="ml-2 block text-sm text-gray-700">
                    This is a follow-up appointment
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isTelemedicine"
                    name="isTelemedicine"
                    checked={formData.isTelemedicine}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-primary-blue focus:ring-primary-blue border-gray-300 rounded"
                  />
                  <label htmlFor="isTelemedicine" className="ml-2 block text-sm text-gray-700">
                    I prefer a telemedicine/video consultation
                  </label>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="form-group">
              <label className="form-label">Additional Notes (Optional)</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="form-textarea"
                rows="3"
                placeholder="Any additional information you'd like the doctor to know..."
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="btn btn-secondary"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary"
              >
                {isLoading && <ButtonLoader />}
                {isReschedule ? 'Reschedule Appointment' : 'Book Appointment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AppointmentForm;