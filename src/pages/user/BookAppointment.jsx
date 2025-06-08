import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BookAppointment = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    specialty: '',
    doctor: '',
    date: '',
    time: '',
    appointmentType: '',
    reason: '',
    notes: '',
    insurance: ''
  });
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const specialties = [
    { id: 'general', name: 'General Practice' },
    { id: 'cardiology', name: 'Cardiology' },
    { id: 'dermatology', name: 'Dermatology' },
    { id: 'neurology', name: 'Neurology' },
    { id: 'orthopedics', name: 'Orthopedics' },
    { id: 'pediatrics', name: 'Pediatrics' },
    { id: 'psychiatry', name: 'Psychiatry' },
    { id: 'gynecology', name: 'Gynecology' }
  ];

  const appointmentTypes = [
    { id: 'consultation', name: 'General Consultation' },
    { id: 'followup', name: 'Follow-up Visit' },
    { id: 'checkup', name: 'Regular Check-up' },
    { id: 'urgent', name: 'Urgent Care' }
  ];

  useEffect(() => {
    if (formData.specialty) {
      fetchDoctorsBySpecialty(formData.specialty);
    }
  }, [formData.specialty]);

  useEffect(() => {
    if (formData.doctor && formData.date) {
      fetchAvailableSlots(formData.doctor, formData.date);
    }
  }, [formData.doctor, formData.date]);

  const fetchDoctorsBySpecialty = async (specialty) => {
    setLoading(true);
    try {
      const mockDoctors = [
        {
          id: 1,
          name: 'Dr. Sarah Johnson',
          specialty: 'Cardiology',
          rating: 4.8,
          experience: '15 years',
          hospital: 'City General Hospital'
        },
        {
          id: 2,
          name: 'Dr. Michael Chen',
          specialty: 'General Practice',
          rating: 4.6,
          experience: '10 years',
          hospital: 'Metro Medical Center'
        },
        {
          id: 3,
          name: 'Dr. Emily Rodriguez',
          specialty: 'Dermatology',
          rating: 4.9,
          experience: '12 years',
          hospital: 'Skin Care Clinic'
        }
      ];
      setDoctors(mockDoctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async (doctorId, date) => {
    setLoading(true);
    try {
      const mockSlots = [
        '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
        '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
        '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
      ];
      setAvailableSlots(mockSlots);
    } catch (error) {
      console.error('Error fetching slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNext = () => {
    setStep(prev => prev + 1);
  };

  const handlePrevious = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Booking appointment:', formData);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      navigate('/user/appointment-history', {
        state: { message: 'Appointment booked successfully!' }
      });
    } catch (error) {
      console.error('Error booking appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Specialty</h2>
        <p className="text-gray-600">What type of doctor do you need to see?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {specialties.map((specialty) => (
          <button
            key={specialty.id}
            type="button"
            onClick={() => {
              setFormData(prev => ({ ...prev, specialty: specialty.id }));
              handleNext();
            }}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
          >
            <div className="font-medium text-gray-900">{specialty.name}</div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Doctor</h2>
        <p className="text-gray-600">Choose from available doctors</p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading doctors...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                formData.doctor === doctor.id.toString()
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => setFormData(prev => ({ ...prev, doctor: doctor.id.toString() }))}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{doctor.name}</h3>
                  <p className="text-sm text-gray-600">{doctor.specialty}</p>
                  <p className="text-sm text-gray-500">{doctor.hospital}</p>
                  <p className="text-sm text-gray-500">{doctor.experience} experience</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center">
                    <span className="text-yellow-400">★</span>
                    <span className="text-sm text-gray-600 ml-1">{doctor.rating}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between">
        <button
          type="button"
          onClick={handlePrevious}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!formData.doctor}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Date & Time</h2>
        <p className="text-gray-600">Choose your preferred appointment slot</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Date
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Appointment Type
          </label>
          <select
            name="appointmentType"
            value={formData.appointmentType}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select type</option>
            {appointmentTypes.map((type) => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>
      </div>

      {formData.date && availableSlots.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Available Time Slots
          </label>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
            {availableSlots.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, time: slot }))}
                className={`p-2 text-sm border rounded-lg transition-colors ${
                  formData.time === slot
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-blue-300'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button
          type="button"
          onClick={handlePrevious}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!formData.date || !formData.time || !formData.appointmentType}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Additional Information</h2>
        <p className="text-gray-600">Tell us more about your visit</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for Visit *
          </label>
          <input
            type="text"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Brief description of your concern"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Any additional information you'd like the doctor to know..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Insurance Provider
          </label>
          <input
            type="text"
            name="insurance"
            value={formData.insurance}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Your insurance provider"
          />
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={handlePrevious}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={!formData.reason || loading}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Booking...' : 'Book Appointment'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`flex items-center ${stepNumber < 4 ? 'flex-1' : ''}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNumber
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div
                    className={`flex-1 h-1 mx-4 ${
                      step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Specialty</span>
            <span>Doctor</span>
            <span>Date & Time</span>
            <span>Details</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          <form onSubmit={handleSubmit}>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;