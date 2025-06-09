import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, MapPin, Filter, Search, Eye, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const AppointmentOverview = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockAppointments = [
      {
        id: 1,
        patientName: 'John Doe',
        doctorName: 'Dr. Sarah Wilson',
        department: 'Cardiology',
        date: '2025-06-10',
        time: '10:00 AM',
        status: 'confirmed',
        type: 'Regular Checkup',
        location: 'Room 204',
        patientPhone: '+1234567890',
        notes: 'Follow-up for heart condition'
      },
      {
        id: 2,
        patientName: 'Jane Smith',
        doctorName: 'Dr. Michael Brown',
        department: 'Orthopedics',
        date: '2025-06-10',
        time: '2:30 PM',
        status: 'pending',
        type: 'Consultation',
        location: 'Room 301',
        patientPhone: '+1234567891',
        notes: 'Knee pain assessment'
      },
      {
        id: 3,
        patientName: 'Robert Johnson',
        doctorName: 'Dr. Emily Davis',
        department: 'Neurology',
        date: '2025-06-11',
        time: '9:15 AM',
        status: 'cancelled',
        type: 'Emergency',
        location: 'ER',
        patientPhone: '+1234567892',
        notes: 'Severe headache - cancelled by patient'
      },
      {
        id: 4,
        patientName: 'Maria Garcia',
        doctorName: 'Dr. James Lee',
        department: 'Pediatrics',
        date: '2025-06-11',
        time: '11:00 AM',
        status: 'confirmed',
        type: 'Vaccination',
        location: 'Room 105',
        patientPhone: '+1234567893',
        notes: 'Routine vaccination for 5-year-old'
      },
      {
        id: 5,
        patientName: 'David Wilson',
        doctorName: 'Dr. Lisa Anderson',
        department: 'Dermatology',
        date: '2025-06-12',
        time: '3:45 PM',
        status: 'completed',
        type: 'Follow-up',
        location: 'Room 208',
        patientPhone: '+1234567894',
        notes: 'Skin condition follow-up'
      }
    ];

    setTimeout(() => {
      setAppointments(mockAppointments);
      setFilteredAppointments(mockAppointments);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter appointments based on search and filters
  useEffect(() => {
    let filtered = appointments;

    if (searchTerm) {
      filtered = filtered.filter(apt => 
        apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(apt => apt.status === filterStatus);
    }

    if (filterDate) {
      filtered = filtered.filter(apt => apt.date === filterDate);
    }

    setFilteredAppointments(filtered);
  }, [searchTerm, filterStatus, filterDate, appointments]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'confirmed':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'cancelled':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'completed':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const handleUpdateStatus = (appointmentId, newStatus) => {
    setAppointments(prev => 
      prev.map(apt => 
        apt.id === appointmentId ? { ...apt, status: newStatus } : apt
      )
    );
    setShowModal(false);
  };

  const appointmentStats = {
    total: appointments.length,
    confirmed: appointments.filter(apt => apt.status === 'confirmed').length,
    pending: appointments.filter(apt => apt.status === 'pending').length,
    cancelled: appointments.filter(apt => apt.status === 'cancelled').length,
    completed: appointments.filter(apt => apt.status === 'completed').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Appointment Overview</h1>
        <p className="text-gray-600">Monitor and manage all hospital appointments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{appointmentStats.total}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold text-green-600">{appointmentStats.confirmed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{appointmentStats.pending}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cancelled</p>
              <p className="text-2xl font-bold text-red-600">{appointmentStats.cancelled}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-blue-600">{appointmentStats.completed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search appointments..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
          <input
            type="date"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('all');
              setFilterDate('');
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => (
                <tr key={appointment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{appointment.patientName}</div>
                        <div className="text-sm text-gray-500">{appointment.patientPhone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {appointment.doctorName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {appointment.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                      {appointment.date}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 text-gray-400 mr-1" />
                      {appointment.time}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(appointment.status)}
                      <span className={`ml-2 ${getStatusBadge(appointment.status)}`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {appointment.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredAppointments.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No appointments found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Modal for appointment details */}
      {showModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Appointment Details</h3>
            <div className="space-y-3">
              <div>
                <span className="font-medium">Patient:</span> {selectedAppointment.patientName}
              </div>
              <div>
                <span className="font-medium">Doctor:</span> {selectedAppointment.doctorName}
              </div>
              <div>
                <span className="font-medium">Department:</span> {selectedAppointment.department}
              </div>
              <div>
                <span className="font-medium">Date & Time:</span> {selectedAppointment.date} at {selectedAppointment.time}
              </div>
              <div>
                <span className="font-medium">Location:</span> {selectedAppointment.location}
              </div>
              <div>
                <span className="font-medium">Type:</span> {selectedAppointment.type}
              </div>
              <div>
                <span className="font-medium">Notes:</span> {selectedAppointment.notes}
              </div>
              <div className="flex items-center">
                <span className="font-medium mr-2">Status:</span>
                {getStatusIcon(selectedAppointment.status)}
                <span className={`ml-2 ${getStatusBadge(selectedAppointment.status)}`}>
                  {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                </span>
              </div>
            </div>
            
            {/* Status update buttons */}
            <div className="mt-6 space-y-2">
              <p className="text-sm font-medium text-gray-700">Update Status:</p>
              <div className="flex space-x-2">
                {['confirmed', 'pending', 'cancelled', 'completed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleUpdateStatus(selectedAppointment.id, status)}
                    disabled={selectedAppointment.status === status}
                    className={`px-3 py-1 rounded text-xs font-medium ${
                      selectedAppointment.status === status
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentOverview;