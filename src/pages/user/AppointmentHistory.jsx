import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AppointmentHistory = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, filter, searchTerm]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const mockAppointments = [
        {
          id: 1,
          doctorName: 'Dr. Sarah Johnson',
          specialty: 'Cardiology',
          hospital: 'City General Hospital',
          date: '2024-01-15',
          time: '10:00 AM',
          status: 'confirmed',
          type: 'consultation',
          reason: 'Regular checkup',
          notes: 'Follow-up on blood pressure medication'
        },
        {
          id: 2,
          doctorName: 'Dr. Michael Chen',
          specialty: 'General Practice',
          hospital: 'Metro Medical Center',
          date: '2024-01-20',
          time: '2:30 PM',
          status: 'pending',
          type: 'followup',
          reason: 'Blood test results review',
          notes: ''
        },
        {
          id: 3,
          doctorName: 'Dr. Emily Rodriguez',
          specialty: 'Dermatology',
          hospital: 'Skin Care Clinic',
          date: '2024-01-05',
          time: '11:00 AM',
          status: 'completed',
          type: 'consultation',
          reason: 'Skin rash examination',
          notes: 'Prescribed topical medication'
        },
        {
          id: 4,
          doctorName: 'Dr. David Wilson',
          specialty: 'Orthopedics',
          hospital: 'Sports Medicine Center',
          date: '2023-12-28',
          time: '3:00 PM',
          status: 'cancelled',
          type: 'consultation',
          reason: 'Knee pain assessment',
          notes: 'Patient cancelled due to scheduling conflict'
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

    if (filter !== 'all') {
      filtered = filtered.filter(apt => apt.status === filter);
    }

    if (searchTerm) {
      filtered = filtered.filter(apt =>
        apt.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.reason.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
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

  const handleCancelAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        setAppointments(prev =>
          prev.map(apt =>
            apt.id === appointmentId
              ? { ...apt, status: 'cancelled' }
              : apt
          )
        );
      } catch (error) {
        console.error('Error cancelling appointment:', error);
      }
    }
  };

  const handleRescheduleAppointment = (appointmentId) => {
    console.log('Reschedule appointment:', appointmentId);
  };

  if (loading) {
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Appointment History</h1>
              <p className="text-gray-600">View and manage your appointments</p>
            </div>
            <Link
              to="/user/book-appointment"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Book New Appointment
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {['all', 'confirmed', 'pending', 'completed', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <span className="text-gray-400">🔍</span>
              </div>
            </div>
          </div>
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filter !== 'all'
                ? 'No appointments found'
                : 'No appointments yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : "You haven't booked any appointments yet"}
            </p>
            <Link
              to="/user/book-appointment"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Book Your First Appointment
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <div key={appointment.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {appointment.doctorName}
                        </h3>
                        <p className="text-sm text-gray-600">{appointment.specialty}</p>
                        <p className="text-sm text-gray-500">{appointment.hospital}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          appointment.status
                        )}`}
                      >
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Date:</span> {appointment.date}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Time:</span> {appointment.time}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Type:</span> {appointment.type}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Reason:</span> {appointment.reason}
                        </p>
                        {appointment.notes && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Notes:</span> {appointment.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col sm:flex-row lg:flex-col gap-2">
                    {appointment.status === 'confirmed' && (
                      <>
                        <button
                          onClick={() => handleRescheduleAppointment(appointment.id)}
                          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                        >
                          Reschedule
                        </button>
                        <button
                          onClick={() => handleCancelAppointment(appointment.id)}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      </>
                    )}

                    {appointment.status === 'pending' && (
                      <button
                        onClick={() => handleCancelAppointment(appointment.id)}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    )}

                    {appointment.status === 'completed' && (
                      <Link
                        to={`/user/my-reviews?appointment=${appointment.id}`}
                        className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm text-center"
                      >
                        Leave Review
                      </Link>
                    )}

                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentHistory;