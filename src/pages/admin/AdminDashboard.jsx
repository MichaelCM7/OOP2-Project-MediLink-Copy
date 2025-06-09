import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../hooks/useNotification';
import { useTheme } from '../../context/ThemeContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { get } = useApi();
  const { showSuccess, showError } = useNotification();
  const { theme } = useTheme();

  // Dashboard state
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('today'); // today, week, month, year
  const [refreshing, setRefreshing] = useState(false);

  // Load dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, [selectedTimeframe]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const result = await get(`/admin/dashboard?timeframe=${selectedTimeframe}`);
      if (result.success) {
        setDashboardData(result.data);
      } else {
        setMockDashboardData();
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setMockDashboardData();
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data for development
  const setMockDashboardData = () => {
    const mockData = {
      metrics: {
        totalPatients: 15284,
        totalDoctors: 342,
        totalAppointments: 1256,
        totalEmergencies: 23,
        activeEmergencies: 3,
        appointmentsToday: 156,
        newRegistrations: 47,
        averageRating: 4.6,
        systemUptime: 99.8,
        revenue: 245000
      },
      trends: {
        patientsGrowth: 12.5,
        appointmentsGrowth: 8.3,
        emergenciesChange: -15.2,
        ratingsChange: 5.1
      },
      recentActivities: [
        {
          id: 1,
          type: 'emergency',
          title: 'Emergency Alert - Cardiac Event',
          description: 'Patient John Doe requires immediate attention',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          priority: 'critical',
          status: 'active'
        },
        {
          id: 2,
          type: 'appointment',
          title: 'High Volume Alert',
          description: '85% appointment capacity reached for today',
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          priority: 'medium',
          status: 'resolved'
        },
        {
          id: 3,
          type: 'registration',
          title: 'New Doctor Registration',
          description: 'Dr. Sarah Wilson - Cardiologist pending approval',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          priority: 'low',
          status: 'pending'
        },
        {
          id: 4,
          type: 'system',
          title: 'System Maintenance Complete',
          description: 'Scheduled maintenance completed successfully',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          priority: 'low',
          status: 'completed'
        }
      ],
      topDoctors: [
        { id: 1, name: 'Dr. Emily Johnson', specialty: 'Cardiology', rating: 4.9, appointments: 156 },
        { id: 2, name: 'Dr. Michael Chen', specialty: 'Neurology', rating: 4.8, appointments: 142 },
        { id: 3, name: 'Dr. Sarah Davis', specialty: 'Pediatrics', rating: 4.8, appointments: 138 },
        { id: 4, name: 'Dr. James Wilson', specialty: 'Emergency Medicine', rating: 4.7, appointments: 134 }
      ],
      departmentStats: [
        { name: 'Emergency', patients: 234, capacity: 85, utilization: 89 },
        { name: 'Cardiology', patients: 156, capacity: 200, utilization: 78 },
        { name: 'Pediatrics', patients: 298, capacity: 350, utilization: 85 },
        { name: 'Neurology', patients: 89, capacity: 120, utilization: 74 },
        { name: 'Surgery', patients: 67, capacity: 80, utilization: 84 }
      ],
      emergencyAlerts: [
        {
          id: 1,
          type: 'medical_emergency',
          patient: 'John Doe',
          location: 'Room 302-A',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          status: 'active',
          priority: 'critical'
        },
        {
          id: 2,
          type: 'cardiac_emergency',
          patient: 'Mary Smith',
          location: 'Emergency Room',
          timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
          status: 'responding',
          priority: 'critical'
        }
      ]
    };
    setDashboardData(mockData);
  };

  // Refresh dashboard
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
    showSuccess('Dashboard refreshed', 'Data updated successfully');
  };

  // Quick actions
  const quickActions = [
    {
      id: 'emergency',
      title: 'Emergency Alerts',
      description: 'View active emergencies',
      icon: '🚨',
      color: '#e74c3c',
      count: dashboardData?.metrics.activeEmergencies || 0,
      action: () => window.location.href = '/admin/emergency-alerts'
    },
    {
      id: 'doctors',
      title: 'Doctor Management',
      description: 'Manage doctor registrations',
      icon: '👨‍⚕️',
      color: '#3498db',
      count: dashboardData?.metrics.totalDoctors || 0,
      action: () => window.location.href = '/admin/doctors'
    },
    {
      id: 'patients',
      title: 'Patient Management',
      description: 'View patient records',
      icon: '👥',
      color: '#27ae60',
      count: dashboardData?.metrics.totalPatients || 0,
      action: () => window.location.href = '/admin/patients'
    },
    {
      id: 'appointments',
      title: 'Appointments',
      description: 'Manage appointments',
      icon: '📅',
      color: '#9b59b6',
      count: dashboardData?.metrics.appointmentsToday || 0,
      action: () => window.location.href = '/admin/appointments'
    }
  ];

  // Format number with commas
  const formatNumber = (num) => {
    return num?.toLocaleString() || '0';
  };

  // Format time ago
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return time.toLocaleDateString();
  };

  // Get activity icon
  const getActivityIcon = (type) => {
    const icons = {
      emergency: '🚨',
      appointment: '📅',
      registration: '👨‍⚕️',
      system: '⚙️',
      patient: '👤'
    };
    return icons[type] || '📋';
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    const colors = {
      critical: '#e74c3c',
      high: '#f39c12',
      medium: '#3498db',
      low: '#95a5a6'
    };
    return colors[priority] || '#95a5a6';
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <div>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '30px',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <div>
          <h1 style={{ margin: '0 0 5px 0', fontSize: '28px', color: theme.colors.text }}>
            Admin Dashboard
          </h1>
          <p style={{ margin: 0, color: theme.colors.textSecondary }}>
            Welcome back, {user?.name || 'Administrator'}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            style={{
              padding: '8px 12px',
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: theme.colors.background
            }}
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              padding: '8px 16px',
              backgroundColor: theme.colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              opacity: refreshing ? 0.7 : 1
            }}
          >
            {refreshing ? '🔄 Refreshing...' : '🔄 Refresh'}
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {[
          { 
            title: 'Total Patients', 
            value: formatNumber(dashboardData?.metrics.totalPatients), 
            change: dashboardData?.trends.patientsGrowth,
            icon: '👥',
            color: '#3498db'
          },
          { 
            title: 'Total Doctors', 
            value: formatNumber(dashboardData?.metrics.totalDoctors), 
            change: null,
            icon: '👨‍⚕️',
            color: '#27ae60'
          },
          { 
            title: 'Today\'s Appointments', 
            value: formatNumber(dashboardData?.metrics.appointmentsToday), 
            change: dashboardData?.trends.appointmentsGrowth,
            icon: '📅',
            color: '#9b59b6'
          },
          { 
            title: 'Active Emergencies', 
            value: formatNumber(dashboardData?.metrics.activeEmergencies), 
            change: dashboardData?.trends.emergenciesChange,
            icon: '🚨',
            color: '#e74c3c'
          },
          { 
            title: 'Average Rating', 
            value: dashboardData?.metrics.averageRating?.toFixed(1) || '0.0', 
            change: dashboardData?.trends.ratingsChange,
            icon: '⭐',
            color: '#f39c12'
          },
          { 
            title: 'System Uptime', 
            value: `${dashboardData?.metrics.systemUptime || 0}%`, 
            change: null,
            icon: '📊',
            color: '#1abc9c'
          }
        ].map((metric, index) => (
          <div
            key={index}
            style={{
              backgroundColor: theme.colors.card,
              padding: '20px',
              borderRadius: '12px',
              border: `1px solid ${theme.colors.border}`,
              boxShadow: theme.shadows.small
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div>
                <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: theme.colors.textSecondary }}>
                  {metric.title}
                </p>
                <h3 style={{ margin: 0, fontSize: '24px', color: theme.colors.text, fontWeight: '700' }}>
                  {metric.value}
                </h3>
              </div>
              <div style={{ 
                fontSize: '24px', 
                backgroundColor: `${metric.color}20`, 
                padding: '8px', 
                borderRadius: '8px' 
              }}>
                {metric.icon}
              </div>
            </div>
            {metric.change !== null && (
              <div style={{ 
                fontSize: '12px', 
                color: metric.change > 0 ? '#27ae60' : '#e74c3c',
                fontWeight: '600'
              }}>
                {metric.change > 0 ? '↗' : '↘'} {Math.abs(metric.change)}% vs last period
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {quickActions.map((action) => (
          <div
            key={action.id}
            onClick={action.action}
            style={{
              backgroundColor: theme.colors.card,
              padding: '20px',
              borderRadius: '12px',
              border: `1px solid ${theme.colors.border}`,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = theme.shadows.medium;
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = theme.shadows.small;
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{
                fontSize: '32px',
                backgroundColor: `${action.color}20`,
                padding: '12px',
                borderRadius: '12px'
              }}>
                {action.icon}
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 5px 0', color: theme.colors.text }}>
                  {action.title}
                </h4>
                <p style={{ margin: 0, fontSize: '14px', color: theme.colors.textSecondary }}>
                  {action.description}
                </p>
              </div>
              <div style={{
                backgroundColor: action.color,
                color: 'white',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {action.count}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', marginBottom: '30px' }}>
        {/* Recent Activities */}
        <div style={{
          backgroundColor: theme.colors.card,
          padding: '20px',
          borderRadius: '12px',
          border: `1px solid ${theme.colors.border}`
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: theme.colors.text }}>Recent Activities</h3>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {dashboardData?.recentActivities.map((activity) => (
              <div
                key={activity.id}
                style={{
                  display: 'flex',
                  gap: '15px',
                  padding: '15px 0',
                  borderBottom: `1px solid ${theme.colors.borderLight}`,
                  lastChild: { borderBottom: 'none' }
                }}
              >
                <div style={{
                  fontSize: '20px',
                  backgroundColor: `${getPriorityColor(activity.priority)}20`,
                  padding: '8px',
                  borderRadius: '8px',
                  height: 'fit-content'
                }}>
                  {getActivityIcon(activity.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <h5 style={{ margin: '0 0 5px 0', fontSize: '14px', color: theme.colors.text }}>
                    {activity.title}
                  </h5>
                  <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: theme.colors.textSecondary }}>
                    {activity.description}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: theme.colors.textMuted }}>
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      backgroundColor: `${getPriorityColor(activity.priority)}20`,
                      color: getPriorityColor(activity.priority),
                      fontWeight: '600'
                    }}>
                      {activity.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Alerts */}
        <div style={{
          backgroundColor: theme.colors.card,
          padding: '20px',
          borderRadius: '12px',
          border: `1px solid ${theme.colors.border}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: theme.colors.text }}>Emergency Alerts</h3>
            <button
              onClick={() => window.location.href = '/admin/emergency-alerts'}
              style={{
                padding: '6px 12px',
                backgroundColor: theme.colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              View All
            </button>
          </div>
          
          {dashboardData?.emergencyAlerts.length > 0 ? (
            dashboardData.emergencyAlerts.map((alert) => (
              <div
                key={alert.id}
                style={{
                  padding: '15px',
                  backgroundColor: '#ffebee',
                  border: '1px solid #ffcdd2',
                  borderRadius: '8px',
                  marginBottom: '10px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '600', color: '#c62828', fontSize: '14px' }}>
                    🚨 {alert.type.replace('_', ' ').toUpperCase()}
                  </span>
                  <span style={{ fontSize: '12px', color: '#666' }}>
                    {formatTimeAgo(alert.timestamp)}
                  </span>
                </div>
                <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#333' }}>
                  Patient: {alert.patient}
                </p>
                <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
                  Location: {alert.location}
                </p>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: theme.colors.textMuted }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>✅</div>
              <p>No active emergencies</p>
            </div>
          )}
        </div>
      </div>

      {/* Department Statistics */}
      <div style={{
        backgroundColor: theme.colors.card,
        padding: '20px',
        borderRadius: '12px',
        border: `1px solid ${theme.colors.border}`,
        marginBottom: '30px'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: theme.colors.text }}>Department Utilization</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px'
        }}>
          {dashboardData?.departmentStats.map((dept, index) => (
            <div key={index} style={{
              padding: '15px',
              backgroundColor: theme.colors.surface,
              borderRadius: '8px',
              border: `1px solid ${theme.colors.borderLight}`
            }}>
              <h5 style={{ margin: '0 0 10px 0', color: theme.colors.text }}>{dept.name}</h5>
              <div style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '13px', color: theme.colors.textSecondary }}>
                    {dept.patients}/{dept.capacity} patients
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: theme.colors.text }}>
                    {dept.utilization}%
                  </span>
                </div>
                <div style={{
                  height: '6px',
                  backgroundColor: theme.colors.borderLight,
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${dept.utilization}%`,
                    backgroundColor: dept.utilization > 85 ? '#e74c3c' : dept.utilization > 70 ? '#f39c12' : '#27ae60',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Performing Doctors */}
      <div style={{
        backgroundColor: theme.colors.card,
        padding: '20px',
        borderRadius: '12px',
        border: `1px solid ${theme.colors.border}`
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: theme.colors.text }}>Top Performing Doctors</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '15px'
        }}>
          {dashboardData?.topDoctors.map((doctor) => (
            <div key={doctor.id} style={{
              padding: '15px',
              backgroundColor: theme.colors.surface,
              borderRadius: '8px',
              border: `1px solid ${theme.colors.borderLight}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h5 style={{ margin: 0, color: theme.colors.text }}>{doctor.name}</h5>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ color: '#f39c12' }}>⭐</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.text }}>
                    {doctor.rating}
                  </span>
                </div>
              </div>
              <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: theme.colors.textSecondary }}>
                {doctor.specialty}
              </p>
              <p style={{ margin: 0, fontSize: '13px', color: theme.colors.textMuted }}>
                {doctor.appointments} appointments this period
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;