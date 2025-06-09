import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../hooks/useNotification';
import { useTheme } from '../../context/ThemeContext';

const Analytics = () => {
  const { get } = useApi();
  const { showError } = useNotification();
  const { theme } = useTheme();

  // State management
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('month'); // week, month, quarter, year
  const [selectedMetric, setSelectedMetric] = useState('overview'); // overview, patients, doctors, appointments, revenue
  const [comparisonData, setComparisonData] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);

  // Load analytics data on component mount and filter changes
  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedTimeframe, selectedMetric]);

  // Fetch analytics data from API
  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const result = await get(`/admin/analytics?timeframe=${selectedTimeframe}&metric=${selectedMetric}`);
      
      if (result.success) {
        setAnalyticsData(result.data);
        setComparisonData(result.data.comparison);
      } else {
        setMockAnalyticsData();
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setMockAnalyticsData();
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data for development
  const setMockAnalyticsData = () => {
    const mockData = {
      overview: {
        totalPatients: 15284,
        totalDoctors: 342,
        totalAppointments: 8945,
        totalRevenue: 4250000,
        growthRates: {
          patients: 12.5,
          doctors: 8.3,
          appointments: 15.7,
          revenue: 22.1
        }
      },
      chartData: {
        appointments: [
          { month: 'Jan', count: 680, revenue: 340000 },
          { month: 'Feb', count: 720, revenue: 360000 },
          { month: 'Mar', count: 850, revenue: 425000 },
          { month: 'Apr', count: 920, revenue: 460000 },
          { month: 'May', count: 780, revenue: 390000 },
          { month: 'Jun', count: 940, revenue: 470000 }
        ],
        patientRegistrations: [
          { month: 'Jan', new: 245, returning: 435 },
          { month: 'Feb', new: 280, returning: 440 },
          { month: 'Mar', new: 320, returning: 530 },
          { month: 'Apr', new: 380, returning: 540 },
          { month: 'May', new: 290, returning: 490 },
          { month: 'Jun', new: 350, returning: 590 }
        ],
        departmentStats: [
          { department: 'Emergency', appointments: 1250, revenue: 625000, utilization: 89 },
          { department: 'Cardiology', appointments: 980, revenue: 490000, utilization: 78 },
          { department: 'Pediatrics', appointments: 1180, revenue: 354000, utilization: 85 },
          { department: 'Surgery', appointments: 420, revenue: 315000, utilization: 74 },
          { department: 'Neurology', appointments: 650, revenue: 390000, utilization: 82 }
        ],
        doctorPerformance: [
          { name: 'Dr. Sarah Johnson', appointments: 156, rating: 4.9, revenue: 78000 },
          { name: 'Dr. Michael Chen', appointments: 142, rating: 4.8, revenue: 85200 },
          { name: 'Dr. Emily Davis', appointments: 138, rating: 4.7, revenue: 69000 },
          { name: 'Dr. James Wilson', appointments: 134, rating: 4.6, revenue: 80400 }
        ]
      },
      demographics: {
        ageGroups: [
          { group: '0-18', count: 2850, percentage: 18.7 },
          { group: '19-35', count: 4920, percentage: 32.2 },
          { group: '36-55', count: 4680, percentage: 30.6 },
          { group: '56-70', count: 2134, percentage: 14.0 },
          { group: '70+', count: 700, percentage: 4.5 }
        ],
        genderDistribution: [
          { gender: 'Female', count: 8650, percentage: 56.6 },
          { gender: 'Male', count: 6634, percentage: 43.4 }
        ],
        insuranceTypes: [
          { type: 'NHIF', count: 6850, percentage: 44.8 },
          { type: 'Private Insurance', count: 4920, percentage: 32.2 },
          { type: 'Self-Pay', count: 3514, percentage: 23.0 }
        ]
      },
      operationalMetrics: {
        averageWaitTime: 18, // minutes
        appointmentUtilization: 87, // percentage
        doctorUtilization: 82, // percentage
        patientSatisfaction: 4.6, // out of 5
        emergencyResponseTime: 8.5, // minutes
        bedOccupancy: 76 // percentage
      },
      financialMetrics: {
        totalRevenue: 4250000,
        operatingCosts: 3200000,
        netProfit: 1050000,
        profitMargin: 24.7,
        averageAppointmentCost: 475,
        revenuePerPatient: 278
      },
      comparison: {
        previousPeriod: {
          patients: 13650,
          appointments: 7745,
          revenue: 3480000
        },
        industryAverage: {
          patientSatisfaction: 4.2,
          utilizationRate: 79,
          profitMargin: 18.5
        }
      }
    };

    setAnalyticsData(mockData);
    setComparisonData(mockData.comparison);
  };

  // Export analytics data
  const handleExport = async (format) => {
    setExportLoading(true);
    try {
      // Simulate export delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation, this would download a file
      const exportData = {
        timeframe: selectedTimeframe,
        metric: selectedMetric,
        data: analyticsData,
        generatedAt: new Date().toISOString()
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-${selectedTimeframe}-${Date.now()}.${format}`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      showError('Export Failed', 'Failed to export analytics data');
    } finally {
      setExportLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  // Get trend indicator
  const getTrendIndicator = (value) => {
    if (value > 0) return { icon: '📈', color: '#27ae60', text: 'increase' };
    if (value < 0) return { icon: '📉', color: '#e74c3c', text: 'decrease' };
    return { icon: '➡️', color: '#95a5a6', text: 'no change' };
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <div>Loading analytics...</div>
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
            Analytics Dashboard
          </h1>
          <p style={{ margin: 0, color: theme.colors.textSecondary }}>
            Comprehensive insights into hospital performance and operations
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          
          <button
            onClick={() => handleExport('json')}
            disabled={exportLoading}
            style={{
              padding: '8px 16px',
              backgroundColor: theme.colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              opacity: exportLoading ? 0.7 : 1
            }}
          >
            {exportLoading ? 'Exporting...' : '📊 Export'}
          </button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {[
          {
            title: 'Total Patients',
            value: analyticsData?.overview.totalPatients.toLocaleString(),
            change: analyticsData?.overview.growthRates.patients,
            icon: '👥',
            color: '#3498db'
          },
          {
            title: 'Total Doctors',
            value: analyticsData?.overview.totalDoctors.toLocaleString(),
            change: analyticsData?.overview.growthRates.doctors,
            icon: '👨‍⚕️',
            color: '#27ae60'
          },
          {
            title: 'Appointments',
            value: analyticsData?.overview.totalAppointments.toLocaleString(),
            change: analyticsData?.overview.growthRates.appointments,
            icon: '📅',
            color: '#9b59b6'
          },
          {
            title: 'Total Revenue',
            value: formatCurrency(analyticsData?.overview.totalRevenue || 0),
            change: analyticsData?.overview.growthRates.revenue,
            icon: '💰',
            color: '#f39c12'
          }
        ].map((metric, index) => {
          const trend = getTrendIndicator(metric.change);
          return (
            <div
              key={index}
              style={{
                backgroundColor: theme.colors.card,
                padding: '25px',
                borderRadius: '12px',
                border: `1px solid ${theme.colors.border}`,
                boxShadow: theme.shadows.small
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <div>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: theme.colors.textSecondary }}>
                    {metric.title}
                  </p>
                  <h3 style={{ margin: 0, fontSize: '28px', color: theme.colors.text, fontWeight: '700' }}>
                    {metric.value}
                  </h3>
                </div>
                <div style={{ 
                  fontSize: '32px', 
                  backgroundColor: `${metric.color}20`, 
                  padding: '12px', 
                  borderRadius: '12px' 
                }}>
                  {metric.icon}
                </div>
              </div>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px', 
                color: trend.color,
                fontWeight: '600'
              }}>
                <span>{trend.icon}</span>
                <span>{formatPercentage(Math.abs(metric.change))} {trend.text}</span>
                <span style={{ color: theme.colors.textMuted, fontWeight: 'normal' }}>vs last period</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {/* Appointments Chart */}
        <div style={{
          backgroundColor: theme.colors.card,
          padding: '25px',
          borderRadius: '12px',
          border: `1px solid ${theme.colors.border}`
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: theme.colors.text }}>
            Appointment Trends
          </h3>
          <div style={{ height: '300px', display: 'flex', alignItems: 'end', gap: '15px', padding: '20px 0' }}>
            {analyticsData?.chartData.appointments.map((data, index) => (
              <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div
                  style={{
                    width: '100%',
                    height: `${(data.count / 1000) * 250}px`,
                    backgroundColor: theme.colors.primary,
                    borderRadius: '4px 4px 0 0',
                    marginBottom: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}
                >
                  {data.count}
                </div>
                <span style={{ fontSize: '12px', color: theme.colors.textMuted }}>{data.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Department Performance */}
        <div style={{
          backgroundColor: theme.colors.card,
          padding: '25px',
          borderRadius: '12px',
          border: `1px solid ${theme.colors.border}`
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: theme.colors.text }}>
            Department Performance
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {analyticsData?.chartData.departmentStats.slice(0, 5).map((dept, index) => (
              <div key={index}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>{dept.department}</span>
                  <span style={{ fontSize: '14px', color: theme.colors.textSecondary }}>
                    {dept.utilization}%
                  </span>
                </div>
                <div style={{
                  height: '8px',
                  backgroundColor: theme.colors.borderLight,
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${dept.utilization}%`,
                    backgroundColor: dept.utilization > 85 ? '#e74c3c' : dept.utilization > 70 ? '#f39c12' : '#27ae60',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <div style={{ fontSize: '12px', color: theme.colors.textMuted, marginTop: '2px' }}>
                  {dept.appointments} appointments • {formatCurrency(dept.revenue)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Demographics and Operational Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {/* Patient Demographics */}
        <div style={{
          backgroundColor: theme.colors.card,
          padding: '25px',
          borderRadius: '12px',
          border: `1px solid ${theme.colors.border}`
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: theme.colors.text }}>
            Patient Demographics
          </h3>
          
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', color: theme.colors.text }}>Age Groups</h4>
            {analyticsData?.demographics.ageGroups.map((group, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px' }}>{group.group}</span>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>
                  {group.count.toLocaleString()} ({group.percentage}%)
                </span>
              </div>
            ))}
          </div>

          <div>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', color: theme.colors.text }}>Insurance Distribution</h4>
            {analyticsData?.demographics.insuranceTypes.map((insurance, index) => (
              <div key={index} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '14px' }}>{insurance.type}</span>
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>{insurance.percentage}%</span>
                </div>
                <div style={{
                  height: '6px',
                  backgroundColor: theme.colors.borderLight,
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${insurance.percentage}%`,
                    backgroundColor: ['#3498db', '#27ae60', '#f39c12'][index],
                    borderRadius: '3px'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Operational Metrics */}
        <div style={{
          backgroundColor: theme.colors.card,
          padding: '25px',
          borderRadius: '12px',
          border: `1px solid ${theme.colors.border}`
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: theme.colors.text }}>
            Operational Metrics
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            {[
              { 
                label: 'Avg Wait Time', 
                value: `${analyticsData?.operationalMetrics.averageWaitTime}min`, 
                icon: '⏱️',
                color: '#3498db'
              },
              { 
                label: 'Appointment Utilization', 
                value: `${analyticsData?.operationalMetrics.appointmentUtilization}%`, 
                icon: '📊',
                color: '#27ae60'
              },
              { 
                label: 'Doctor Utilization', 
                value: `${analyticsData?.operationalMetrics.doctorUtilization}%`, 
                icon: '👨‍⚕️',
                color: '#9b59b6'
              },
              { 
                label: 'Patient Satisfaction', 
                value: `${analyticsData?.operationalMetrics.patientSatisfaction}/5`, 
                icon: '⭐',
                color: '#f39c12'
              },
              { 
                label: 'Emergency Response', 
                value: `${analyticsData?.operationalMetrics.emergencyResponseTime}min`, 
                icon: '🚨',
                color: '#e74c3c'
              },
              { 
                label: 'Bed Occupancy', 
                value: `${analyticsData?.operationalMetrics.bedOccupancy}%`, 
                icon: '🛏️',
                color: '#1abc9c'
              }
            ].map((metric, index) => (
              <div key={index} style={{
                padding: '15px',
                backgroundColor: theme.colors.surface,
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ 
                  fontSize: '24px', 
                  marginBottom: '8px',
                  color: metric.color
                }}>
                  {metric.icon}
                </div>
                <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '5px', color: theme.colors.text }}>
                  {metric.value}
                </div>
                <div style={{ fontSize: '12px', color: theme.colors.textMuted }}>
                  {metric.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Summary */}
        <div style={{
          backgroundColor: theme.colors.card,
          padding: '25px',
          borderRadius: '12px',
          border: `1px solid ${theme.colors.border}`
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: theme.colors.text }}>
            Financial Summary
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {[
              { 
                label: 'Total Revenue', 
                value: formatCurrency(analyticsData?.financialMetrics.totalRevenue || 0),
                color: '#27ae60'
              },
              { 
                label: 'Operating Costs', 
                value: formatCurrency(analyticsData?.financialMetrics.operatingCosts || 0),
                color: '#e74c3c'
              },
              { 
                label: 'Net Profit', 
                value: formatCurrency(analyticsData?.financialMetrics.netProfit || 0),
                color: '#3498db'
              },
              { 
                label: 'Profit Margin', 
                value: formatPercentage(analyticsData?.financialMetrics.profitMargin || 0),
                color: '#9b59b6'
              }
            ].map((metric, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                backgroundColor: theme.colors.surface,
                borderRadius: '6px'
              }}>
                <span style={{ fontSize: '14px', color: theme.colors.textSecondary }}>
                  {metric.label}
                </span>
                <span style={{ 
                  fontSize: '16px', 
                  fontWeight: '700', 
                  color: metric.color 
                }}>
                  {metric.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performing Doctors */}
      <div style={{
        backgroundColor: theme.colors.card,
        padding: '25px',
        borderRadius: '12px',
        border: `1px solid ${theme.colors.border}`,
        marginBottom: '30px'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: theme.colors.text }}>
          Top Performing Doctors
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {analyticsData?.chartData.doctorPerformance.map((doctor, index) => (
            <div key={index} style={{
              padding: '20px',
              backgroundColor: theme.colors.surface,
              borderRadius: '8px',
              border: `1px solid ${theme.colors.borderLight}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h4 style={{ margin: 0, color: theme.colors.text, fontSize: '16px' }}>
                  {doctor.name}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ color: '#f39c12' }}>⭐</span>
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>{doctor.rating}</span>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: theme.colors.primary }}>
                    {doctor.appointments}
                  </div>
                  <div style={{ fontSize: '12px', color: theme.colors.textMuted }}>Appointments</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: theme.colors.success }}>
                    {formatCurrency(doctor.revenue)}
                  </div>
                  <div style={{ fontSize: '12px', color: theme.colors.textMuted }}>Revenue</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison with Previous Period */}
      {comparisonData && (
        <div style={{
          backgroundColor: theme.colors.card,
          padding: '25px',
          borderRadius: '12px',
          border: `1px solid ${theme.colors.border}`
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: theme.colors.text }}>
            Performance Comparison
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px'
          }}>
            <div style={{
              padding: '20px',
              backgroundColor: theme.colors.surface,
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: theme.colors.text }}>vs Previous Period</h4>
              <div style={{ fontSize: '14px', color: theme.colors.textSecondary, marginBottom: '10px' }}>
                Patients: {comparisonData.previousPeriod.patients.toLocaleString()}
              </div>
              <div style={{ fontSize: '14px', color: theme.colors.textSecondary, marginBottom: '10px' }}>
                Appointments: {comparisonData.previousPeriod.appointments.toLocaleString()}
              </div>
              <div style={{ fontSize: '14px', color: theme.colors.textSecondary }}>
                Revenue: {formatCurrency(comparisonData.previousPeriod.revenue)}
              </div>
            </div>

            <div style={{
              padding: '20px',
              backgroundColor: theme.colors.surface,
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: theme.colors.text }}>vs Industry Average</h4>
              <div style={{ fontSize: '14px', color: theme.colors.textSecondary, marginBottom: '10px' }}>
                Satisfaction: {comparisonData.industryAverage.patientSatisfaction}/5
              </div>
              <div style={{ fontSize: '14px', color: theme.colors.textSecondary, marginBottom: '10px' }}>
                Utilization: {comparisonData.industryAverage.utilizationRate}%
              </div>
              <div style={{ fontSize: '14px', color: theme.colors.textSecondary }}>
                Profit Margin: {comparisonData.industryAverage.profitMargin}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;