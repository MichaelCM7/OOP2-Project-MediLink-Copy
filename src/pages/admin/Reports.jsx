import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  Download, Calendar, Users, Activity, TrendingUp, TrendingDown,
  FileText, Filter, RefreshCw, Eye, BarChart3, PieChart as PieChartIcon
} from 'lucide-react';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedReport, setSelectedReport] = useState('overview');
  const [dateRange, setDateRange] = useState({
    startDate: '2025-01-01',
    endDate: '2025-06-09'
  });

  // Mock data for different reports
  const [reportData, setReportData] = useState({
    appointmentsTrend: [],
    departmentStats: [],
    doctorPerformance: [],
    patientSatisfaction: [],
    revenueData: [],
    emergencyAlerts: []
  });

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setReportData({
        appointmentsTrend: [
          { month: 'Jan', appointments: 120, completed: 115, cancelled: 5 },
          { month: 'Feb', appointments: 135, completed: 128, cancelled: 7 },
          { month: 'Mar', appointments: 148, completed: 140, cancelled: 8 },
          { month: 'Apr', appointments: 162, completed: 155, cancelled: 7 },
          { month: 'May', appointments: 178, completed: 170, cancelled: 8 },
          { month: 'Jun', appointments: 95, completed: 88, cancelled: 7 }
        ],
        departmentStats: [
          { name: 'Cardiology', appointments: 245, revenue: 125000, satisfaction: 4.8 },
          { name: 'Orthopedics', appointments: 198, revenue: 98000, satisfaction: 4.6 },
          { name: 'Neurology', appointments: 156, revenue: 156000, satisfaction: 4.9 },
          { name: 'Pediatrics', appointments: 289, revenue: 87000, satisfaction: 4.7 },
          { name: 'Dermatology', appointments: 134, revenue: 67000, satisfaction: 4.5 }
        ],
        doctorPerformance: [
          { name: 'Dr. Sarah Wilson', appointments: 89, rating: 4.9, revenue: 45000 },
          { name: 'Dr. Michael Brown', appointments: 76, rating: 4.8, revenue: 38000 },
          { name: 'Dr. Emily Davis', appointments: 82, rating: 4.7, revenue: 41000 },
          { name: 'Dr. James Lee', appointments: 94, rating: 4.6, revenue: 35000 },
          { name: 'Dr. Lisa Anderson', appointments: 67, rating: 4.8, revenue: 33500 }
        ],
        patientSatisfaction: [
          { rating: 5, count: 345, percentage: 58 },
          { rating: 4, count: 156, percentage: 26 },
          { rating: 3, count: 67, percentage: 11 },
          { rating: 2, count: 23, percentage: 4 },
          { rating: 1, count: 9, percentage: 1 }
        ],
        revenueData: [
          { month: 'Jan', revenue: 45000, expenses: 32000, profit: 13000 },
          { month: 'Feb', revenue: 52000, expenses: 35000, profit: 17000 },
          { month: 'Mar', revenue: 48000, expenses: 34000, profit: 14000 },
          { month: 'Apr', revenue: 55000, expenses: 38000, profit: 17000 },
          { month: 'May', revenue: 61000, expenses: 42000, profit: 19000 },
          { month: 'Jun', revenue: 35000, expenses: 25000, profit: 10000 }
        ],
        emergencyAlerts: [
          { date: '2025-06-01', total: 12, resolved: 11, pending: 1 },
          { date: '2025-06-02', total: 8, resolved: 8, pending: 0 },
          { date: '2025-06-03', total: 15, resolved: 14, pending: 1 },
          { date: '2025-06-04', total: 6, resolved: 6, pending: 0 },
          { date: '2025-06-05', total: 9, resolved: 8, pending: 1 },
          { date: '2025-06-06', total: 11, resolved: 10, pending: 1 },
          { date: '2025-06-07', total: 7, resolved: 7, pending: 0 }
        ]
      });
      setLoading(false);
    }, 1000);
  }, [selectedPeriod, dateRange]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const summaryStats = {
    totalAppointments: 838,
    totalRevenue: 296000,
    averageRating: 4.7,
    emergencyResponse: 98.5
  };

  const handleExportReport = (format) => {
    // Simulate report export
    alert(`Exporting report in ${format} format...`);
  };

  const handleRefreshData = () => {
    setLoading(true);
    // Simulate data refresh
    setTimeout(() => {
      setLoading(false);
    }, 1000);
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
            <p className="text-gray-600">Comprehensive insights and performance metrics</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleRefreshData}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
            <div className="relative">
              <select
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => handleExportReport(e.target.value)}
                defaultValue=""
              >
                <option value="" disabled>Export Report</option>
                <option value="pdf">Export as PDF</option>
                <option value="excel">Export as Excel</option>
                <option value="csv">Export as CSV</option>
              </select>
              <Download className="h-4 w-4 absolute right-2 top-3 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value)}
          >
            <option value="overview">Overview Report</option>
            <option value="appointments">Appointments Report</option>
            <option value="financial">Financial Report</option>
            <option value="performance">Performance Report</option>
          </select>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
          <input
            type="date"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={dateRange.startDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
          />
          <input
            type="date"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={dateRange.endDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
          />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{summaryStats.totalAppointments}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-500">+12.5%</span>
              </div>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${summaryStats.totalRevenue.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-500">+8.3%</span>
              </div>
            </div>
            <BarChart3 className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900">{summaryStats.averageRating}/5</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-500">+0.2</span>
              </div>
            </div>
            <Users className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Emergency Response</p>
              <p className="text-2xl font-bold text-gray-900">{summaryStats.emergencyResponse}%</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-500">+1.2%</span>
              </div>
            </div>
            <Activity className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Appointments Trend */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Appointments Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={reportData.appointmentsTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="appointments" stackId="1" stroke="#8884d8" fill="#8884d8" />
              <Area type="monotone" dataKey="completed" stackId="2" stroke="#82ca9d" fill="#82ca9d" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Patient Satisfaction */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Patient Satisfaction</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={reportData.patientSatisfaction}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ rating, percentage }) => `${rating}★ (${percentage}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {reportData.patientSatisfaction.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Department Performance */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Department Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData.departmentStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="appointments" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Trend */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Revenue & Profit Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reportData.revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
              <Line type="monotone" dataKey="profit" stroke="#82ca9d" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Doctor Performance Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Top Performing Doctors</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Appointments</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData.doctorPerformance.map((doctor, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {doctor.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {doctor.appointments}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <span className="text-yellow-400 mr-1">★</span>
                        {doctor.rating}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${doctor.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Department Revenue Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Department Revenue</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Appointments</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Satisfaction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData.departmentStats.map((dept, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {dept.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {dept.appointments}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${dept.revenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <span className="text-yellow-400 mr-1">★</span>
                        {dept.satisfaction}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Emergency Response Timeline */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Emergency Response Timeline (Last 7 Days)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={reportData.emergencyAlerts}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#ef4444" name="Total Alerts" />
            <Bar dataKey="resolved" fill="#22c55e" name="Resolved" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Reports;