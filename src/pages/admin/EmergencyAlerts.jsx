import React, { useState, useEffect, useCallback } from 'react';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../hooks/useNotification';
import { useTheme } from '../../context/ThemeContext';
import { useRealTimeData } from '../../hooks/useApi';

const EmergencyAlerts = () => {
  const { get, post, put } = useApi();
  const { showSuccess, showError, showWarning } = useNotification();
  const { theme } = useTheme();

  // State management
  const [emergencies, setEmergencies] = useState([]);
  const [filteredEmergencies, setFilteredEmergencies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all', // all, active, pending, resolved, cancelled
    priority: 'all', // all, critical, high, medium, low
    type: 'all', // all, medical, cardiac, trauma, psychiatric, other
    timeframe: 'today' // today, week, month, all
  });
  const [sortBy, setSortBy] = useState('timestamp_desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    resolved: 0,
    avgResponseTime: 0
  });

  // Real-time emergency updates
  const { data: realTimeUpdates } = useRealTimeData('/admin/emergency-alerts/stream');

  // Emergency status options
  const EMERGENCY_STATUS = {
    PENDING: 'pending',
    DISPATCHED: 'dispatched',
    EN_ROUTE: 'en_route',
    ON_SCENE: 'on_scene',
    TRANSPORTING: 'transporting',
    ARRIVED_HOSPITAL: 'arrived_hospital',
    RESOLVED: 'resolved',
    CANCELLED: 'cancelled'
  };

  const EMERGENCY_TYPES = {
    MEDICAL: 'medical',
    CARDIAC: 'cardiac',
    TRAUMA: 'trauma',
    PSYCHIATRIC: 'psychiatric',
    RESPIRATORY: 'respiratory',
    STROKE: 'stroke',
    OTHER: 'other'
  };

  const PRIORITY_LEVELS = {
    CRITICAL: 'critical',
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low'
  };

  // Load emergencies on component mount and filter changes
  useEffect(() => {
    fetchEmergencies();
  }, [filters, sortBy]);

  // Handle real-time updates
  useEffect(() => {
    if (realTimeUpdates) {
      handleRealTimeUpdate(realTimeUpdates);
    }
  }, [realTimeUpdates]);

  // Apply filters and search
  useEffect(() => {
    applyFiltersAndSearch();
  }, [emergencies, searchQuery, filters]);

  // Fetch emergencies from API
  const fetchEmergencies = async () => {
    setIsLoading(true);
    try {
      const params = {
        status: filters.status !== 'all' ? filters.status : undefined,
        priority: filters.priority !== 'all' ? filters.priority : undefined,
        type: filters.type !== 'all' ? filters.type : undefined,
        timeframe: filters.timeframe,
        sort: sortBy
      };

      const result = await get('/admin/emergency-alerts', params);
      
      if (result.success) {
        setEmergencies(result.data.emergencies || []);
        setStats(result.data.stats || {});
      } else {
        setMockEmergencyData();
      }
    } catch (error) {
      console.error('Error fetching emergencies:', error);
      setMockEmergencyData();
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data for development
  const setMockEmergencyData = () => {
    const mockEmergencies = [
      {
        id: 'EMG-001',
        patientName: 'John Doe',
        patientAge: 45,
        patientGender: 'Male',
        type: EMERGENCY_TYPES.CARDIAC,
        priority: PRIORITY_LEVELS.CRITICAL,
        status: EMERGENCY_STATUS.EN_ROUTE,
        description: 'Chest pain, suspected heart attack',
        location: {
          address: '123 Main Street, Nairobi',
          coordinates: { lat: -1.2921, lng: 36.8219 }
        },
        reportedBy: 'Self',
        reporterPhone: '+254-700-123456',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        dispatchTime: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
        estimatedArrival: '8 minutes',
        assignedAmbulance: 'AMB-001',
        assignedParamedic: 'Dr. Sarah Johnson',
        assignedHospital: 'Nairobi Hospital',
        vitals: {
          heartRate: 120,
          bloodPressure: '180/110',
          oxygenSaturation: 92,
          temperature: 37.2
        },
        timeline: [
          { time: new Date(Date.now() - 15 * 60 * 1000).toISOString(), event: 'Emergency reported', status: 'pending' },
          { time: new Date(Date.now() - 12 * 60 * 1000).toISOString(), event: 'Ambulance dispatched', status: 'dispatched' },
          { time: new Date(Date.now() - 8 * 60 * 1000).toISOString(), event: 'En route to scene', status: 'en_route' }
        ]
      },
      {
        id: 'EMG-002',
        patientName: 'Mary Smith',
        patientAge: 67,
        patientGender: 'Female',
        type: EMERGENCY_TYPES.MEDICAL,
        priority: PRIORITY_LEVELS.HIGH,
        status: EMERGENCY_STATUS.ON_SCENE,
        description: 'Fall with possible hip fracture',
        location: {
          address: '456 Oak Avenue, Westlands',
          coordinates: { lat: -1.2676, lng: 36.8108 }
        },
        reportedBy: 'Family Member',
        reporterPhone: '+254-700-789012',
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        dispatchTime: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        estimatedArrival: 'On scene',
        assignedAmbulance: 'AMB-002',
        assignedParamedic: 'Dr. Michael Chen',
        assignedHospital: 'Aga Khan Hospital',
        vitals: {
          heartRate: 95,
          bloodPressure: '150/85',
          oxygenSaturation: 98,
          temperature: 36.8
        },
        timeline: [
          { time: new Date(Date.now() - 25 * 60 * 1000).toISOString(), event: 'Emergency reported', status: 'pending' },
          { time: new Date(Date.now() - 20 * 60 * 1000).toISOString(), event: 'Ambulance dispatched', status: 'dispatched' },
          { time: new Date(Date.now() - 15 * 60 * 1000).toISOString(), event: 'En route to scene', status: 'en_route' },
          { time: new Date(Date.now() - 5 * 60 * 1000).toISOString(), event: 'Arrived on scene', status: 'on_scene' }
        ]
      },
      {
        id: 'EMG-003',
        patientName: 'Robert Johnson',
        patientAge: 32,
        patientGender: 'Male',
        type: EMERGENCY_TYPES.TRAUMA,
        priority: PRIORITY_LEVELS.CRITICAL,
        status: EMERGENCY_STATUS.RESOLVED,
        description: 'Motor vehicle accident with head injury',
        location: {
          address: 'Uhuru Highway, Near City Center',
          coordinates: { lat: -1.2884, lng: 36.8233 }
        },
        reportedBy: 'Bystander',
        reporterPhone: '+254-700-345678',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        dispatchTime: new Date(Date.now() - 115 * 60 * 1000).toISOString(),
        resolvedTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        estimatedArrival: 'Resolved',
        assignedAmbulance: 'AMB-003',
        assignedParamedic: 'Dr. Emily Davis',
        assignedHospital: 'Kenyatta National Hospital',
        vitals: {
          heartRate: 110,
          bloodPressure: '140/90',
          oxygenSaturation: 95,
          temperature: 36.9
        },
        outcome: 'Patient stabilized and transported to trauma center',
        timeline: [
          { time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), event: 'Emergency reported', status: 'pending' },
          { time: new Date(Date.now() - 115 * 60 * 1000).toISOString(), event: 'Ambulance dispatched', status: 'dispatched' },
          { time: new Date(Date.now() - 105 * 60 * 1000).toISOString(), event: 'En route to scene', status: 'en_route' },
          { time: new Date(Date.now() - 95 * 60 * 1000).toISOString(), event: 'Arrived on scene', status: 'on_scene' },
          { time: new Date(Date.now() - 75 * 60 * 1000).toISOString(), event: 'Transporting to hospital', status: 'transporting' },
          { time: new Date(Date.now() - 45 * 60 * 1000).toISOString(), event: 'Arrived at hospital', status: 'arrived_hospital' },
          { time: new Date(Date.now() - 30 * 60 * 1000).toISOString(), event: 'Emergency resolved', status: 'resolved' }
        ]
      }
    ];

    setEmergencies(mockEmergencies);
    setStats({
      total: mockEmergencies.length,
      active: mockEmergencies.filter(e => !['resolved', 'cancelled'].includes(e.status)).length,
      resolved: mockEmergencies.filter(e => e.status === 'resolved').length,
      avgResponseTime: 8.5
    });
  };

  // Handle real-time updates
  const handleRealTimeUpdate = (update) => {
    setEmergencies(prev => {
      const existingIndex = prev.findIndex(e => e.id === update.id);
      if (existingIndex >= 0) {
        // Update existing emergency
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], ...update };
        return updated;
      } else {
        // Add new emergency
        return [update, ...prev];
      }
    });

    // Show notification for critical updates
    if (update.priority === PRIORITY_LEVELS.CRITICAL) {
      showWarning('Critical Emergency Update', `Emergency ${update.id} status: ${update.status}`);
    }
  };

  // Apply filters and search
  const applyFiltersAndSearch = () => {
    let filtered = [...emergencies];

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(emergency =>
        emergency.patientName.toLowerCase().includes(query) ||
        emergency.id.toLowerCase().includes(query) ||
        emergency.description.toLowerCase().includes(query) ||
        emergency.location.address.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (filters.status !== 'all') {
      filtered = filtered.filter(e => e.status === filters.status);
    }

    if (filters.priority !== 'all') {
      filtered = filtered.filter(e => e.priority === filters.priority);
    }

    if (filters.type !== 'all') {
      filtered = filtered.filter(e => e.type === filters.type);
    }

    setFilteredEmergencies(filtered);
  };

  // Update emergency status
  const updateEmergencyStatus = async (emergencyId, newStatus, notes = '') => {
    try {
      const result = await put(`/admin/emergency-alerts/${emergencyId}/status`, {
        status: newStatus,
        notes,
        timestamp: new Date().toISOString()
      });

      if (result.success) {
        showSuccess('Status Updated', `Emergency ${emergencyId} status updated to ${newStatus}`);
        fetchEmergencies(); // Refresh data
      } else {
        showError('Update Failed', result.error || 'Failed to update emergency status');
      }
    } catch (error) {
      showError('Update Failed', 'Network error occurred');
    }
  };

  // Assign resources to emergency
  const assignResources = async (emergencyId, resources) => {
    try {
      const result = await post(`/admin/emergency-alerts/${emergencyId}/assign`, resources);

      if (result.success) {
        showSuccess('Resources Assigned', 'Emergency resources assigned successfully');
        fetchEmergencies();
      } else {
        showError('Assignment Failed', result.error || 'Failed to assign resources');
      }
    } catch (error) {
      showError('Assignment Failed', 'Network error occurred');
    }
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

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      pending: '#f39c12',
      dispatched: '#3498db',
      en_route: '#9b59b6',
      on_scene: '#e67e22',
      transporting: '#1abc9c',
      arrived_hospital: '#2ecc71',
      resolved: '#27ae60',
      cancelled: '#95a5a6'
    };
    return colors[status] || '#95a5a6';
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

  // Get type icon
  const getTypeIcon = (type) => {
    const icons = {
      cardiac: '💗',
      medical: '🏥',
      trauma: '🚑',
      psychiatric: '🧠',
      respiratory: '🫁',
      stroke: '🧠',
      other: '📋'
    };
    return icons[type] || '📋';
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <div>Loading emergency alerts...</div>
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
            Emergency Alerts
          </h1>
          <p style={{ margin: 0, color: theme.colors.textSecondary }}>
            Monitor and manage emergency responses in real-time
          </p>
        </div>
        
        <button
          onClick={fetchEmergencies}
          style={{
            padding: '10px 20px',
            backgroundColor: theme.colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Statistics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {[
          { title: 'Total Emergencies', value: stats.total, icon: '📊', color: '#3498db' },
          { title: 'Active Cases', value: stats.active, icon: '🚨', color: '#e74c3c' },
          { title: 'Resolved Today', value: stats.resolved, icon: '✅', color: '#27ae60' },
          { title: 'Avg Response Time', value: `${stats.avgResponseTime || 0}min`, icon: '⏱️', color: '#f39c12' }
        ].map((stat, index) => (
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: theme.colors.textSecondary }}>
                  {stat.title}
                </p>
                <h3 style={{ margin: 0, fontSize: '24px', color: theme.colors.text, fontWeight: '700' }}>
                  {stat.value}
                </h3>
              </div>
              <div style={{ 
                fontSize: '24px', 
                backgroundColor: `${stat.color}20`, 
                padding: '8px', 
                borderRadius: '8px' 
              }}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div style={{
        backgroundColor: theme.colors.card,
        padding: '20px',
        borderRadius: '12px',
        border: `1px solid ${theme.colors.border}`,
        marginBottom: '30px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          alignItems: 'end'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
              Search
            </label>
            <input
              type="text"
              placeholder="Search by patient, ID, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px',
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="dispatched">Dispatched</option>
              <option value="en_route">En Route</option>
              <option value="on_scene">On Scene</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
              Priority
            </label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px',
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
              Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px',
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="all">All Types</option>
              <option value="cardiac">Cardiac</option>
              <option value="medical">Medical</option>
              <option value="trauma">Trauma</option>
              <option value="psychiatric">Psychiatric</option>
              <option value="respiratory">Respiratory</option>
              <option value="stroke">Stroke</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Emergency List */}
      <div style={{
        backgroundColor: theme.colors.card,
        borderRadius: '12px',
        border: `1px solid ${theme.colors.border}`,
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '20px',
          borderBottom: `1px solid ${theme.colors.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, color: theme.colors.text }}>
            Emergency Cases ({filteredEmergencies.length})
          </h3>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '8px 12px',
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '6px',
              fontSize: '14px'
            }}
          >
            <option value="timestamp_desc">Most Recent</option>
            <option value="timestamp_asc">Oldest First</option>
            <option value="priority_desc">Highest Priority</option>
            <option value="status">By Status</option>
          </select>
        </div>

        {filteredEmergencies.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: theme.colors.textMuted }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🏥</div>
            <h3 style={{ margin: '0 0 10px 0' }}>No Emergency Alerts</h3>
            <p style={{ margin: 0 }}>No emergencies match your current filters</p>
          </div>
        ) : (
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {filteredEmergencies.map((emergency) => (
              <div
                key={emergency.id}
                style={{
                  padding: '20px',
                  borderBottom: `1px solid ${theme.colors.borderLight}`,
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease'
                }}
                onClick={() => {
                  setSelectedEmergency(emergency);
                  setShowDetails(true);
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = theme.colors.surface}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  {/* Type Icon */}
                  <div style={{
                    fontSize: '32px',
                    backgroundColor: `${getPriorityColor(emergency.priority)}20`,
                    padding: '10px',
                    borderRadius: '8px',
                    flexShrink: 0
                  }}>
                    {getTypeIcon(emergency.type)}
                  </div>

                  {/* Emergency Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <h4 style={{ margin: '0 0 5px 0', color: theme.colors.text }}>
                          {emergency.patientName} ({emergency.patientAge}, {emergency.patientGender})
                        </h4>
                        <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: theme.colors.textSecondary }}>
                          ID: {emergency.id} • {emergency.description}
                        </p>
                        <p style={{ margin: 0, fontSize: '13px', color: theme.colors.textMuted }}>
                          📍 {emergency.location.address}
                        </p>
                      </div>
                      
                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: 'white',
                          backgroundColor: getStatusColor(emergency.status),
                          marginBottom: '5px'
                        }}>
                          {emergency.status.replace('_', ' ').toUpperCase()}
                        </div>
                        <div style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: '600',
                          color: getPriorityColor(emergency.priority),
                          backgroundColor: `${getPriorityColor(emergency.priority)}20`,
                          marginLeft: '5px'
                        }}>
                          {emergency.priority.toUpperCase()}
                        </div>
                      </div>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: '15px',
                      fontSize: '13px',
                      color: theme.colors.textSecondary
                    }}>
                      <div>⏰ {formatTimeAgo(emergency.timestamp)}</div>
                      <div>🚑 {emergency.assignedAmbulance}</div>
                      <div>👨‍⚕️ {emergency.assignedParamedic}</div>
                      <div>🏥 {emergency.assignedHospital}</div>
                      <div>📞 {emergency.reporterPhone}</div>
                      <div>⏱️ ETA: {emergency.estimatedArrival}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Emergency Details Modal */}
      {showDetails && selectedEmergency && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: theme.colors.card,
            borderRadius: '12px',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: theme.shadows.xl
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px',
              borderBottom: `1px solid ${theme.colors.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ margin: 0, color: theme.colors.text }}>
                Emergency Details - {selectedEmergency.id}
              </h2>
              <button
                onClick={() => setShowDetails(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: theme.colors.textMuted
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '20px' }}>
              {/* Patient Information */}
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ margin: '0 0 15px 0', color: theme.colors.text }}>Patient Information</h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '15px',
                  padding: '15px',
                  backgroundColor: theme.colors.surface,
                  borderRadius: '8px'
                }}>
                  <div><strong>Name:</strong> {selectedEmergency.patientName}</div>
                  <div><strong>Age:</strong> {selectedEmergency.patientAge}</div>
                  <div><strong>Gender:</strong> {selectedEmergency.patientGender}</div>
                  <div><strong>Reported By:</strong> {selectedEmergency.reportedBy}</div>
                  <div><strong>Contact:</strong> {selectedEmergency.reporterPhone}</div>
                  <div><strong>Type:</strong> {selectedEmergency.type}</div>
                </div>
              </div>

              {/* Vitals */}
              {selectedEmergency.vitals && (
                <div style={{ marginBottom: '30px' }}>
                  <h3 style={{ margin: '0 0 15px 0', color: theme.colors.text }}>Current Vitals</h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '15px',
                    padding: '15px',
                    backgroundColor: theme.colors.surface,
                    borderRadius: '8px'
                  }}>
                    <div><strong>Heart Rate:</strong> {selectedEmergency.vitals.heartRate} bpm</div>
                    <div><strong>Blood Pressure:</strong> {selectedEmergency.vitals.bloodPressure}</div>
                    <div><strong>O2 Saturation:</strong> {selectedEmergency.vitals.oxygenSaturation}%</div>
                    <div><strong>Temperature:</strong> {selectedEmergency.vitals.temperature}°C</div>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ margin: '0 0 15px 0', color: theme.colors.text }}>Emergency Timeline</h3>
                <div style={{ position: 'relative', paddingLeft: '30px' }}>
                  {selectedEmergency.timeline?.map((event, index) => (
                    <div key={index} style={{ position: 'relative', marginBottom: '15px' }}>
                      <div style={{
                        position: 'absolute',
                        left: '-25px',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: getStatusColor(event.status)
                      }} />
                      <div style={{
                        fontSize: '14px',
                        color: theme.colors.text,
                        fontWeight: '600',
                        marginBottom: '2px'
                      }}>
                        {event.event}
                      </div>
                      <div style={{ fontSize: '12px', color: theme.colors.textMuted }}>
                        {formatTimeAgo(event.time)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowDetails(false)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: theme.colors.border,
                    color: theme.colors.text,
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
                {selectedEmergency.status !== 'resolved' && (
                  <button
                    onClick={() => updateEmergencyStatus(selectedEmergency.id, 'resolved')}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: theme.colors.success,
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    Mark as Resolved
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyAlerts;