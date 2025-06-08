import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  Heart,
  AlertCircle,
  Plus,
  FileText,
  Activity,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../utils/constants';
import { formatDate } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const UserDashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    upcomingAppointments: [],
    recentAppointments: [],
    healthSummary: {},
    quickStats: {}
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Simulate API call
      setTimeout(() => {
        setDashboardData({
          upcomingAppointments: [
            {
              id: 1,
              doctorName: 'Dr. Sarah Johnson',
              specialty: 'Cardiology',
              date: '2024-06-15',
              time: '10:00 AM',
              location: 'Main Hospital - Room 205',
              status: 'confirmed'
            },
            {
              id: 2,
              doctorName: 'Dr. Michael Chen',
              specialty: 'General Practice',
              date: '2024-06-20',
              time: '2:30 PM',
              location: 'City Clinic - Room 103',
              status: 'pending'
            }
          ],
          recentAppointments: [
            {
              id: 3,
              doctorName: 'Dr. Emily Rodriguez',
              specialty: 'Dermatology',
              date: '2024-05-28',
              status: 'completed'
            }
          ],
          healthSummary: {
            bloodPressure: '120/80',
            heartRate: '72 bpm',
            weight: '70 kg',
            lastCheckup: '2024-05-28'
          },
          quickStats: {
            totalAppointments: 15,
            completedAppointments: 12,
            doctorsVisited: 5,
            healthScore: 85
          }
        });
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setIsLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {getGreeting()}, {user?.firstName}!
              </h1>
              <p className="text-gray-600 mt-2">
                Here's what's happening with your health today.
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Today's Date</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatDate(new Date(), 'EEEE, MMMM dd, yyyy')}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="bg-blue-100 rounded-lg p-3">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData.quickStats.totalAppointments}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="bg-green-100 rounded-lg p-3">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Health Score</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData.quickStats.healthScore}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="bg-purple-100 rounded-lg p-3">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Doctors Visited</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData.quickStats.doctorsVisited}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="bg-yellow-100 rounded-lg p-3">
                  <TrendingUp className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-gray-900">3</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upcoming Appointments */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Upcoming Appointments</h2>
                  <Link to={ROUTES.BOOK_APPOINTMENT} className="btn btn-primary btn-sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Book New
                  </Link>
                </div>
              </div>
              <div className="card-body">
                {dashboardData.upcomingAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.upcomingAppointments.map((appointment) => (
                      <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="bg-primary-blue-lightest rounded-full p-2">
                                <User className="w-4 h-4 text-primary-blue" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  {appointment.doctorName}
                                </h3>
                                <p className="text-sm text-gray-600">{appointment.specialty}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span>{formatDate(appointment.date)} at {appointment.time}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span>{appointment.location}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              appointment.status === 'confirmed' 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {appointment.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No upcoming appointments</p>
                    <Link to={ROUTES.BOOK_APPOINTMENT} className="btn btn-primary mt-4">
                      Book Your First Appointment
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link to={ROUTES.BOOK_APPOINTMENT} className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Calendar className="w-8 h-8 text-primary-blue mb-2" />
                    <span className="text-sm font-medium text-gray-900">Book Appointment</span>
                  </Link>
                  
                  <Link to={ROUTES.SEARCH_DOCTORS} className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <User className="w-8 h-8 text-primary-blue mb-2" />
                    <span className="text-sm font-medium text-gray-900">Find Doctors</span>
                  </Link>
                  
                  <Link to={ROUTES.MEDICAL_HISTORY} className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <FileText className="w-8 h-8 text-primary-blue mb-2" />
                    <span className="text-sm font-medium text-gray-900">Medical Records</span>
                  </Link>
                  
                  <Link to="/emergency" className="flex flex-col items-center p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                    <AlertCircle className="w-8 h-8 text-red-600 mb-2" />
                    <span className="text-sm font-medium text-red-900">Emergency</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Profile Card */}
            <div className="card">
              <div className="card-body text-center">
                <div className="w-20 h-20 bg-primary-blue rounded-full flex items-center justify-center mx-auto mb-4">
                  {user?.profilePicture ? (
                    <img 
                      src={user.profilePicture} 
                      alt="Profile" 
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-white" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {user?.firstName} {user?.lastName}
                </h3>
                <p className="text-gray-600 mb-4">{user?.email}</p>
                <Link to={ROUTES.USER_PROFILE} className="btn btn-outline w-full">
                  Edit Profile
                </Link>
              </div>
            </div>

            {/* Health Summary */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Health Summary</h3>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Blood Pressure</span>
                    <span className="font-semibold text-gray-900">
                      {dashboardData.healthSummary.bloodPressure}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Heart Rate</span>
                    <span className="font-semibold text-gray-900">
                      {dashboardData.healthSummary.heartRate}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Weight</span>
                    <span className="font-semibold text-gray-900">
                      {dashboardData.healthSummary.weight}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Last Checkup</span>
                    <span className="font-semibold text-gray-900">
                      {formatDate(dashboardData.healthSummary.lastCheckup)}
                    </span>
                  </div>
                </div>
                <div className="mt-6">
                  <Link to={ROUTES.MEDICAL_HISTORY} className="btn btn-outline w-full">
                    View Complete Records
                  </Link>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="card border-red-200">
              <div className="card-header bg-red-50">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <h3 className="text-lg font-semibold text-red-900">Emergency</h3>
                </div>
              </div>
              <div className="card-body">
                <p className="text-gray-700 text-sm mb-4">
                  Need immediate medical assistance?
                </p>
                <div className="space-y-3">
                  <a href="tel:911" className="btn btn-error w-full">
                    Call 911
                  </a>
                  <Link to="/emergency" className="btn btn-outline border-red-300 text-red-600 hover:bg-red-50 w-full">
                    Emergency Alert
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;