import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    todayAppointments: [],
    pendingRequests: [],
    emergencyAlerts: [],
    recentPatients: [],
    statistics: {
      todayAppointments: 0,
      pendingRequests: 0,
      totalPatients: 0,
      avgRating: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API calls
      const mockData = {
        todayAppointments: [
          {
            id: 1,
            patientName: 'John Smith',
            time: '09:00 AM',
            type: 'Consultation',
            status: 'confirmed',
            reason: 'Regular checkup'
          },
          {
            id: 2,
            patientName: 'Mary Johnson',
            time: '10:30 AM',
            type: 'Follow-up',
            status: 'confirmed',
            reason: 'Blood pressure monitoring'
          },
          {
            id: 3,
            patientName: 'Robert Davis',
            time: '2:00 PM',
            type: 'Consultation',
            status: 'confirmed',
            reason: 'Chest pain evaluation'
          },
          {
            id: 4,
            patientName: 'Lisa Wilson',
            time: '3:30 PM',
            type: 'Follow-up',
            status: 'pending',
            reason: 'Test results review'
          }
        ],
        pendingRequests: [
          {
            id: 5,
            patientName: 'David Brown',
            requestDate: '2024-01-20',
            preferredDate: '2024-01-22',
            type: 'Urgent consultation',
            reason: 'Severe headaches'
          },
          {
            id: 6,
            patientName: 'Sarah Miller',
            requestDate: '2024-01-19',
            preferredDate: '2024-01-21',
            type: 'Regular checkup',
            reason: 'Annual physical'
          }
        ],
        emergencyAlerts: [
          {
            id: 1,
            patientName: 'Emergency Patient',
            time: '08:45 AM',
            location: 'ER - Room 3',
            condition: 'Cardiac event',
            severity: 'high'
          }
        ],
        recentPatients: [
          {
            id: 1,
            name: 'Alice Cooper',
            lastVisit: '2024-01-18',
            condition: 'Hypertension',
            status: 'stable'
          },
          {
            id: 2,
            name: 'Tom Anderson',
            lastVisit: '2024-01-17',
            condition: 'Diabetes Type 2',
            status: 'monitoring'
          },
          {
            id: 3,
            name: 'Emma Thompson',
            lastVisit: '2024-01-16',
            condition: 'Asthma',
            status: 'improved'
          }
        ],
        statistics: {
          todayAppointments: 4,
          pendingRequests: 2,
          totalPatients: 147,
          avgRating: 4.8
        }
      };
      setDashboardData(mockData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyResponse = (alertId) => {
    console.log('Responding to emergency:', alertId);
    // Navigate to emergency details or update status
  };

  const handleAppointmentAction = (appointmentId, action) => {
    console.log(`${action} appointment:`, appointmentId);
    // Handle confirm/reschedule/cancel actions
  };

  const handleRequestAction = (requestId, action) => {
    console.log(`${action} request:`, requestId);
    // Handle approve/decline request actions
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, Dr. {user?.lastName || 'Doctor'}!
              </h1>
              <p className="text-gray-600">Here's your practice overview for today</p>
            </div>
            <div className="flex space-x-3">
              <Link
                to="/doctor/emergency-alerts"
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                🚨 Emergency Alerts
              </Link>
              <Link
                to="/doctor/schedule"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                📅 My Schedule
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600">📅</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.statistics.todayAppointments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-600">⏳</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.statistics.pendingRequests}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600">👥</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.statistics.totalPatients}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600">⭐</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.statistics.avgRating}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Appointments */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Today's Appointments</h2>
                  <Link
                    to="/doctor/appointment-management"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View All
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {dashboardData.todayAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📅</div>
                    <p className="text-gray-500">No appointments scheduled for today</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dashboardData.todayAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-medium">
                                  {appointment.patientName.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-gray-900">
                                {appointment.patientName}
                              </h3>
                              <p className="text-sm text-gray-500">{appointment.reason}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{appointment.time}</p>
                            <p className="text-sm text-gray-500">{appointment.type}</p>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              appointment.status === 'confirmed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {appointment.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Emergency Alerts */}
            {dashboardData.emergencyAlerts.length > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-red-600">🚨 Emergency Alerts</h2>
                </div>
                <div className="p-6">
                  {dashboardData.emergencyAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-4 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-red-900">{alert.patientName}</h3>
                        <span className="text-xs text-red-600">{alert.time}</span>
                      </div>
                      <p className="text-sm text-red-700 mb-2">{alert.condition}</p>
                      <p className="text-xs text-red-600 mb-3">{alert.location}</p>
                      <button
                        onClick={() => handleEmergencyResponse(alert.id)}
                        className="w-full bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 transition-colors"
                      >
                        Respond Now
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pending Requests */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Pending Requests</h2>
                  <Link
                    to="/doctor/patient-requests"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View All
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {dashboardData.pendingRequests.length === 0 ? (
                  <p className="text-gray-500 text-sm">No pending requests</p>
                ) : (
                  <div className="space-y-4">
                    {dashboardData.pendingRequests.map((request) => (
                      <div key={request.id} className="border border-gray-200 rounded-lg p-3">
                        <h3 className="font-medium text-gray-900 text-sm">
                          {request.patientName}
                        </h3>
                        <p className="text-xs text-gray-500 mb-2">{request.reason}</p>
                        <p className="text-xs text-gray-600 mb-3">
                          Preferred: {request.preferredDate}
                        </p>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleRequestAction(request.id, 'approve')}
                            className="flex-1 bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRequestAction(request.id, 'decline')}
                            className="flex-1 bg-gray-300 text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-400"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Patients */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Patients</h2>
                  <Link
                    to="/doctor/patient-records"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View All
                  </Link>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {dashboardData.recentPatients.map((patient) => (
                    <div key={patient.id} className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{patient.name}</h3>
                        <p className="text-xs text-gray-500">{patient.condition}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{patient.lastVisit}</p>
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full ${
                            patient.status === 'stable'
                              ? 'bg-green-100 text-green-800'
                              : patient.status === 'monitoring'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {patient.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/doctor/patient-records"
              className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-center"
            >
              <div className="text-2xl mb-2">📋</div>
              <div className="text-sm font-medium text-gray-900">Patient Records</div>
            </Link>
            <Link
              to="/doctor/schedule"
              className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-center"
            >
              <div className="text-2xl mb-2">📅</div>
              <div className="text-sm font-medium text-gray-900">Schedule</div>
            </Link>
            <Link
              to="/doctor/my-ratings"
              className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-center"
            >
              <div className="text-2xl mb-2">⭐</div>
              <div className="text-sm font-medium text-gray-900">My Ratings</div>
            </Link>
            <Link
              to="/doctor/settings"
              className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-center"
            >
              <div className="text-2xl mb-2">⚙️</div>
              <div className="text-sm font-medium text-gray-900">Settings</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;