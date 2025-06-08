import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('today');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({
    date: '',
    time: '',
    reason: ''
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, filter, searchTerm, selectedDate]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockAppointments = [
        {
          id: 1,
          patientName: 'John Smith',
          patientId: 'P001',
          date: '2024-01-20',
          time: '09:00 AM',
          duration: 30,
          type: 'Consultation',
          status: 'confirmed',
          reason: 'Chest pain evaluation',
          phone: '(555) 123-4567',
          email: 'john.smith@email.com',
          insurance: 'Blue Cross Blue Shield',
          notes: 'Patient reports symptoms started 3 days ago',
          visitType: 'in-person'
        },
        {
          id: 2,
          patientName: 'Mary Johnson',
          patientId: 'P002',
          date: '2024-01-20',
          time: '10:30 AM',
          duration: 15,
          type: 'Follow-up',
          status: 'confirmed',
          reason: 'Blood pressure check',
          phone: '(555) 234-5678',
          email: 'mary.johnson@email.com',
          insurance: 'Aetna',
          notes: 'BP medication adjustment follow-up',
          visitType: 'in-person'
        },
        {
          id: 3,
          patientName: 'Robert Davis',
          patientId: 'P003',
          date: '2024-01-20',
          time: '02:00 PM',
          duration: 45,
          type: 'Consultation',
          status: 'pending',
          reason: 'Annual physical',
          phone: '(555) 345-6789',
          email: 'robert.davis@email.com',
          insurance: 'UnitedHealthcare',
          notes: 'Routine annual checkup',
          visitType: 'in-person'
        },
        {
          id: 4,
          patientName: 'Lisa Wilson',
          patientId: 'P004',
          date: '2024-01-21',
          time: '11:00 AM',
          duration: 30,
          type: 'Telemedicine',
          status: 'confirmed',
          reason: 'Prescription refill consultation',
          phone: '(555) 456-7890',
          email: 'lisa.wilson@email.com',
          insurance: 'Cigna',
          notes: 'Virtual consultation for medication review',
          visitType: 'virtual'
        },
        {
          id: 5,
          patientName: 'David Brown',
          patientId: 'P005',
          date: '2024-01-19',
          time: '03:30 PM',
          duration: 30,
          type: 'Follow-up',
          status: 'completed',
          reason: 'Diabetes management',
          phone: '(555) 567-8901',
          email: 'david.brown@email.com',
          insurance: 'Medicare',
          notes: 'Blood sugar levels review',
          visitType: 'in-person'
        },
        {
          id: 6,
          patientName: 'Sarah Miller',
          patientId: 'P006',
          date: '2024-01-22',
          time: '10:00 AM',
          duration: 60,
          type: 'Consultation',
          status: 'cancelled',
          reason: 'Joint pain assessment',
          phone: '(555) 678-9012',
          email: 'sarah.miller@email.com',
          insurance: 'Humana',
          notes: 'Patient cancelled due to emergency',
          visitType: 'in-person'
        }
      ];
      setAppointments(mockAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];
    const today = new Date().toISOString().split('T')[0];

    // Filter by date range
    switch (filter) {
      case 'today':
        filtered = filtered.filter(apt => apt.date === today);
        break;
      case 'week':
        const weekFromNow = new Date();
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        filtered = filtered.filter(apt => 
          new Date(apt.date) >= new Date(today) && 
          new Date(apt.date) <= weekFromNow
        );
        break;
      case 'month':
        const monthFromNow = new Date();
        monthFromNow.setMonth(monthFromNow.getMonth() + 1);
        filtered = filtered.filter(apt => 
          new Date(apt.date) >= new Date(today) && 
          new Date(apt.date) <= monthFromNow
        );
        break;
      case 'date':
        filtered = filtered.filter(apt => apt.date === selectedDate);
        break;
      case 'all':
        break;
      default:
        filtered = filtered.filter(apt => apt.status === filter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(apt =>
        apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by date and time
    filtered.sort((a, b) => {
      const dateComparison = new Date(a.date) - new Date(b.date);
      if (dateComparison !== 0) return dateComparison;
      return a.time.localeCompare(b.time);
    });

    setFilteredAppointments(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getVisitTypeIcon = (visitType) => {
    return visitType === 'virtual' ? '💻' : '🏥';
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === appointmentId
            ? { ...apt, status: newStatus }
            : apt
        )
      );
    } catch (error) {
      console.error('Error updating appointment status:', error);
    }
  };

  const handleReschedule = (appointment) => {
    setSelectedAppointment(appointment);
    setRescheduleData({
      date: appointment.date,
      time: appointment.time,
      reason: ''
    });
    setShowRescheduleModal(true);
  };

  const handleSubmitReschedule = async () => {
    setLoading(true);
    try {
      // API call to reschedule appointment
      console.log('Rescheduling appointment:', selectedAppointment.id, rescheduleData);
      
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === selectedAppointment.id
            ? { 
                ...apt, 
                date: rescheduleData.date, 
                time: rescheduleData.time,
                notes: apt.notes + ` | Rescheduled: ${rescheduleData.reason}`
              }
            : apt
        )
      );
      
      setShowRescheduleModal(false);
      setSelectedAppointment(null);
      setRescheduleData({ date: '', time: '', reason: '' });
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartConsultation = (appointmentId) => {
    console.log('Starting consultation for appointment:', appointmentId);
    // Navigate to consultation interface or patient records
  };

  const handleViewPatientRecord = (patientId) => {
    console.log('View patient record:', patientId);
    // Navigate to patient record page
  };

  if (loading && !showRescheduleModal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Appointment Management</h1>
              <p className="text-gray-600">Manage your patient appointments</p>
            </div>
            <Link
              to="/doctor/schedule"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              📅 View Schedule
            </Link>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'today', label: 'Today' },
                { key: 'week', label: 'This Week' },
                { key: 'month', label: 'This Month' },
                { key: 'confirmed', label: 'Confirmed' },
                { key: 'pending', label: 'Pending' },
                { key: 'completed', label: 'Completed' },
                { key: 'all', label: 'All' }
              ].map((filterOption) => (
                <button
                  key={filterOption.key}
                  onClick={() => setFilter(filterOption.key)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === filterOption.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>

            {/* Search and Date */}
            <div className="flex gap-4">
              {filter === 'date' && (
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              )}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search appointments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <span className="text-gray-400">🔍</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
            <p className="text-gray-600">
              {filter === 'today' 
                ? 'No appointments scheduled for today'
                : 'No appointments match your current filters'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <div key={appointment.id} className="bg-white rounded-lg shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl">{getVisitTypeIcon(appointment.visitType)}</span>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {appointment.patientName}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            appointment.status
                          )}`}
                        >
                          {appointment.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Date:</span> {appointment.date}
                        </div>
                        <div>
                          <span className="font-medium">Time:</span> {appointment.time}
                        </div>
                        <div>
                          <span className="font-medium">Duration:</span> {appointment.duration}min
                        </div>
                        <div>
                          <span className="font-medium">Type:</span> {appointment.type}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Appointment Details</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><span className="font-medium">Reason:</span> {appointment.reason}</p>
                        <p><span className="font-medium">Insurance:</span> {appointment.insurance}</p>
                        <p><span className="font-medium">Visit Type:</span> {appointment.visitType}</p>
                        <p><span className="font-medium">Notes:</span> {appointment.notes}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><span className="font-medium">Phone:</span> {appointment.phone}</p>
                        <p><span className="font-medium">Email:</span> {appointment.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewPatientRecord(appointment.patientId)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View Patient Record
                      </button>
                    </div>

                    <div className="flex space-x-2">
                      {appointment.status === 'confirmed' && (
                        <button
                          onClick={() => handleStartConsultation(appointment.id)}
                          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          Start Consultation
                        </button>
                      )}

                      {appointment.status === 'pending' && (
                        <button
                          onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          Confirm
                        </button>
                      )}

                      {(appointment.status === 'confirmed' || appointment.status === 'pending') && (
                        <>
                          <button
                            onClick={() => handleReschedule(appointment)}
                            className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                          >
                            Reschedule
                          </button>
                          <button
                            onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                            className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      {appointment.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusChange(appointment.id, 'completed')}
                          className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reschedule Modal */}
        {showRescheduleModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Reschedule Appointment</h3>

                {selectedAppointment && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium">{selectedAppointment.patientName}</h4>
                    <p className="text-sm text-gray-600">{selectedAppointment.reason}</p>
                    <p className="text-sm text-gray-500">
                      Current: {selectedAppointment.date} at {selectedAppointment.time}
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Date
                    </label>
                    <input
                      type="date"
                      value={rescheduleData.date}
                      onChange={(e) => setRescheduleData(prev => ({ 
                        ...prev, 
                        date: e.target.value 
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Time
                    </label>
                    <input
                      type="time"
                      value={rescheduleData.time}
                      onChange={(e) => setRescheduleData(prev => ({ 
                        ...prev, 
                        time: e.target.value 
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Reschedule
                    </label>
                    <textarea
                      value={rescheduleData.reason}
                      onChange={(e) => setRescheduleData(prev => ({ 
                        ...prev, 
                        reason: e.target.value 
                      }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Optional reason for rescheduling..."
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowRescheduleModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitReschedule}
                    disabled={loading || !rescheduleData.date || !rescheduleData.time}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Rescheduling...' : 'Reschedule'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentManagement;