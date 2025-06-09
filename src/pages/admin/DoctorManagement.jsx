import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../hooks/useNotification';
import { useTheme } from '../../context/ThemeContext';

const DoctorManagement = () => {
  const { get, post, put, delete: del } = useApi();
  const { showSuccess, showError, showWarning } = useNotification();
  const { theme } = useTheme();

  // State management
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: 'all', // all, pending, approved, suspended, rejected
    specialty: 'all',
    verificationStatus: 'all', // all, verified, unverified, expired
    joinedDate: 'all' // all, today, week, month, year
  });
  const [sortBy, setSortBy] = useState('created_desc');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    suspended: 0
  });

  // Doctor status options
  const DOCTOR_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    SUSPENDED: 'suspended',
    REJECTED: 'rejected'
  };

  const VERIFICATION_STATUS = {
    VERIFIED: 'verified',
    UNVERIFIED: 'unverified',
    EXPIRED: 'expired',
    UNDER_REVIEW: 'under_review'
  };

  // Load doctors on component mount and filter changes
  useEffect(() => {
    fetchDoctors();
  }, [filters, sortBy]);

  // Apply search filter
  useEffect(() => {
    applySearchFilter();
  }, [doctors, searchQuery]);

  // Fetch doctors from API
  const fetchDoctors = async () => {
    setIsLoading(true);
    try {
      const params = {
        status: filters.status !== 'all' ? filters.status : undefined,
        specialty: filters.specialty !== 'all' ? filters.specialty : undefined,
        verification: filters.verificationStatus !== 'all' ? filters.verificationStatus : undefined,
        joined: filters.joinedDate !== 'all' ? filters.joinedDate : undefined,
        sort: sortBy
      };

      const result = await get('/admin/doctors', params);
      
      if (result.success) {
        setDoctors(result.data.doctors || []);
        setStats(result.data.stats || {});
      } else {
        setMockDoctorData();
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setMockDoctorData();
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data for development
  const setMockDoctorData = () => {
    const mockDoctors = [
      {
        id: 'DOC-001',
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+254-700-123456',
        specialty: 'Cardiology',
        subSpecialty: 'Interventional Cardiology',
        licenseNumber: 'KMD-12345',
        yearsOfExperience: 8,
        status: DOCTOR_STATUS.PENDING,
        verificationStatus: VERIFICATION_STATUS.UNDER_REVIEW,
        profilePicture: '/api/placeholder/100/100',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        lastActive: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        education: [
          { degree: 'MD', institution: 'University of Nairobi', year: 2015 },
          { degree: 'Fellowship in Cardiology', institution: 'Aga Khan University', year: 2018 }
        ],
        certifications: [
          { name: 'Basic Life Support', issuer: 'Kenya Medical Association', expiry: '2025-12-31' },
          { name: 'Advanced Cardiac Life Support', issuer: 'American Heart Association', expiry: '2025-06-30' }
        ],
        workHistory: [
          { hospital: 'Nairobi Hospital', position: 'Senior Cardiologist', duration: '2020-Present' },
          { hospital: 'Aga Khan Hospital', position: 'Cardiologist', duration: '2018-2020' }
        ],
        documents: [
          { type: 'Medical License', status: 'verified', uploadedAt: '2024-01-15' },
          { type: 'CV', status: 'pending', uploadedAt: '2024-01-15' },
          { type: 'Certificates', status: 'verified', uploadedAt: '2024-01-15' }
        ],
        statistics: {
          totalAppointments: 0,
          averageRating: 0,
          totalReviews: 0,
          completionRate: 0
        },
        availability: {
          monday: { start: '09:00', end: '17:00', available: true },
          tuesday: { start: '09:00', end: '17:00', available: true },
          wednesday: { start: '09:00', end: '17:00', available: true },
          thursday: { start: '09:00', end: '17:00', available: true },
          friday: { start: '09:00', end: '17:00', available: true },
          saturday: { start: '09:00', end: '13:00', available: true },
          sunday: { start: null, end: null, available: false }
        }
      },
      {
        id: 'DOC-002',
        name: 'Dr. Michael Chen',
        email: 'michael.chen@email.com',
        phone: '+254-700-789012',
        specialty: 'Neurology',
        subSpecialty: 'Stroke Medicine',
        licenseNumber: 'KMD-67890',
        yearsOfExperience: 12,
        status: DOCTOR_STATUS.APPROVED,
        verificationStatus: VERIFICATION_STATUS.VERIFIED,
        profilePicture: '/api/placeholder/100/100',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        lastActive: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        education: [
          { degree: 'MD', institution: 'Makerere University', year: 2012 },
          { degree: 'Neurology Residency', institution: 'Kenyatta University', year: 2016 }
        ],
        certifications: [
          { name: 'Stroke Certification', issuer: 'East African Neurological Society', expiry: '2025-08-15' }
        ],
        workHistory: [
          { hospital: 'Kenyatta National Hospital', position: 'Consultant Neurologist', duration: '2018-Present' }
        ],
        documents: [
          { type: 'Medical License', status: 'verified', uploadedAt: '2023-12-01' },
          { type: 'CV', status: 'verified', uploadedAt: '2023-12-01' },
          { type: 'Certificates', status: 'verified', uploadedAt: '2023-12-01' }
        ],
        statistics: {
          totalAppointments: 342,
          averageRating: 4.8,
          totalReviews: 156,
          completionRate: 96
        },
        availability: {
          monday: { start: '08:00', end: '16:00', available: true },
          tuesday: { start: '08:00', end: '16:00', available: true },
          wednesday: { start: '08:00', end: '16:00', available: true },
          thursday: { start: '08:00', end: '16:00', available: true },
          friday: { start: '08:00', end: '16:00', available: true },
          saturday: { start: null, end: null, available: false },
          sunday: { start: null, end: null, available: false }
        }
      },
      {
        id: 'DOC-003',
        name: 'Dr. Emily Davis',
        email: 'emily.davis@email.com',
        phone: '+254-700-345678',
        specialty: 'Pediatrics',
        subSpecialty: 'Pediatric Emergency Medicine',
        licenseNumber: 'KMD-13579',
        yearsOfExperience: 6,
        status: DOCTOR_STATUS.SUSPENDED,
        verificationStatus: VERIFICATION_STATUS.EXPIRED,
        profilePicture: '/api/placeholder/100/100',
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        lastActive: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        education: [
          { degree: 'MD', institution: 'Moi University', year: 2018 },
          { degree: 'Pediatrics Residency', institution: 'University of Nairobi', year: 2021 }
        ],
        certifications: [
          { name: 'Pediatric Life Support', issuer: 'Kenya Pediatric Association', expiry: '2024-01-15' }
        ],
        workHistory: [
          { hospital: 'Gertrude Children\'s Hospital', position: 'Pediatrician', duration: '2021-Present' }
        ],
        documents: [
          { type: 'Medical License', status: 'expired', uploadedAt: '2023-01-15' },
          { type: 'CV', status: 'verified', uploadedAt: '2023-01-15' },
          { type: 'Certificates', status: 'expired', uploadedAt: '2023-01-15' }
        ],
        statistics: {
          totalAppointments: 189,
          averageRating: 4.2,
          totalReviews: 78,
          completionRate: 88
        },
        suspensionReason: 'License expired - pending renewal'
      }
    ];

    setDoctors(mockDoctors);
    setStats({
      total: mockDoctors.length,
      pending: mockDoctors.filter(d => d.status === DOCTOR_STATUS.PENDING).length,
      approved: mockDoctors.filter(d => d.status === DOCTOR_STATUS.APPROVED).length,
      suspended: mockDoctors.filter(d => d.status === DOCTOR_STATUS.SUSPENDED).length
    });
  };

  // Apply search filter
  const applySearchFilter = () => {
    let filtered = [...doctors];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doctor =>
        doctor.name.toLowerCase().includes(query) ||
        doctor.email.toLowerCase().includes(query) ||
        doctor.specialty.toLowerCase().includes(query) ||
        doctor.licenseNumber.toLowerCase().includes(query)
      );
    }

    setFilteredDoctors(filtered);
  };

  // Update doctor status
  const updateDoctorStatus = async (doctorId, newStatus, reason = '') => {
    try {
      const result = await put(`/admin/doctors/${doctorId}/status`, {
        status: newStatus,
        reason,
        updatedBy: 'Admin',
        timestamp: new Date().toISOString()
      });

      if (result.success) {
        showSuccess('Status Updated', `Doctor status updated to ${newStatus}`);
        fetchDoctors();
        setShowApprovalModal(false);
        setPendingAction(null);
      } else {
        showError('Update Failed', result.error || 'Failed to update doctor status');
      }
    } catch (error) {
      showError('Update Failed', 'Network error occurred');
    }
  };

  // Delete doctor
  const deleteDoctor = async (doctorId) => {
    if (window.confirm('Are you sure you want to delete this doctor? This action cannot be undone.')) {
      try {
        const result = await del(`/admin/doctors/${doctorId}`);
        
        if (result.success) {
          showSuccess('Doctor Deleted', 'Doctor has been removed from the system');
          fetchDoctors();
        } else {
          showError('Delete Failed', result.error || 'Failed to delete doctor');
        }
      } catch (error) {
        showError('Delete Failed', 'Network error occurred');
      }
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time ago
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    return formatDate(timestamp);
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      pending: '#f39c12',
      approved: '#27ae60',
      suspended: '#e74c3c',
      rejected: '#95a5a6'
    };
    return colors[status] || '#95a5a6';
  };

  // Get verification status color
  const getVerificationColor = (status) => {
    const colors = {
      verified: '#27ae60',
      unverified: '#f39c12',
      expired: '#e74c3c',
      under_review: '#3498db'
    };
    return colors[status] || '#95a5a6';
  };

  // Handle approval action
  const handleApprovalAction = (doctor, action) => {
    setSelectedDoctor(doctor);
    setPendingAction(action);
    setShowApprovalModal(true);
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <div>Loading doctors...</div>
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
            Doctor Management
          </h1>
          <p style={{ margin: 0, color: theme.colors.textSecondary }}>
            Manage doctor registrations, approvals, and account status
          </p>
        </div>
        
        <button
          onClick={fetchDoctors}
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
          { title: 'Total Doctors', value: stats.total, icon: '👨‍⚕️', color: '#3498db' },
          { title: 'Pending Approval', value: stats.pending, icon: '⏳', color: '#f39c12' },
          { title: 'Approved', value: stats.approved, icon: '✅', color: '#27ae60' },
          { title: 'Suspended', value: stats.suspended, icon: '⛔', color: '#e74c3c' }
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
              placeholder="Search by name, email, specialty, or license..."
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
              <option value="approved">Approved</option>
              <option value="suspended">Suspended</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
              Verification
            </label>
            <select
              value={filters.verificationStatus}
              onChange={(e) => setFilters(prev => ({ ...prev, verificationStatus: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px',
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="all">All Verification</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
              <option value="expired">Expired</option>
              <option value="under_review">Under Review</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
              Specialty
            </label>
            <select
              value={filters.specialty}
              onChange={(e) => setFilters(prev => ({ ...prev, specialty: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px',
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="all">All Specialties</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Neurology">Neurology</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Surgery">Surgery</option>
              <option value="Emergency Medicine">Emergency Medicine</option>
              <option value="Internal Medicine">Internal Medicine</option>
            </select>
          </div>
        </div>
      </div>

      {/* Doctors List */}
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
            Doctors ({filteredDoctors.length})
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
            <option value="created_desc">Newest First</option>
            <option value="created_asc">Oldest First</option>
            <option value="name_asc">Name A-Z</option>
            <option value="name_desc">Name Z-A</option>
            <option value="specialty">By Specialty</option>
            <option value="status">By Status</option>
          </select>
        </div>

        {filteredDoctors.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: theme.colors.textMuted }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>👨‍⚕️</div>
            <h3 style={{ margin: '0 0 10px 0' }}>No Doctors Found</h3>
            <p style={{ margin: 0 }}>No doctors match your current filters</p>
          </div>
        ) : (
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {filteredDoctors.map((doctor) => (
              <div
                key={doctor.id}
                style={{
                  padding: '20px',
                  borderBottom: `1px solid ${theme.colors.borderLight}`,
                  transition: 'background-color 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = theme.colors.surface}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  {/* Profile Picture */}
                  <div style={{ flexShrink: 0 }}>
                    <img
                      src={doctor.profilePicture || '/api/placeholder/80/80'}
                      alt={doctor.name}
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: `2px solid ${theme.colors.border}`
                      }}
                    />
                  </div>

                  {/* Doctor Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <h4 style={{ margin: '0 0 5px 0', color: theme.colors.text, fontSize: '18px' }}>
                          {doctor.name}
                        </h4>
                        <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: theme.colors.textSecondary }}>
                          {doctor.specialty} • {doctor.yearsOfExperience} years experience
                        </p>
                        <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: theme.colors.textMuted }}>
                          📧 {doctor.email} • 📞 {doctor.phone}
                        </p>
                        <p style={{ margin: 0, fontSize: '13px', color: theme.colors.textMuted }}>
                          License: {doctor.licenseNumber} • Joined: {formatDate(doctor.createdAt)}
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
                          backgroundColor: getStatusColor(doctor.status),
                          marginBottom: '5px'
                        }}>
                          {doctor.status.toUpperCase()}
                        </div>
                        <div style={{
                          display: 'block',
                          padding: '2px 8px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: '600',
                          color: getVerificationColor(doctor.verificationStatus),
                          backgroundColor: `${getVerificationColor(doctor.verificationStatus)}20`
                        }}>
                          {doctor.verificationStatus.replace('_', ' ').toUpperCase()}
                        </div>
                      </div>
                    </div>

                    {/* Statistics */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                      gap: '15px',
                      marginBottom: '15px',
                      fontSize: '13px',
                      color: theme.colors.textSecondary
                    }}>
                      <div>📅 {doctor.statistics.totalAppointments} appointments</div>
                      <div>⭐ {doctor.statistics.averageRating || 'N/A'} rating</div>
                      <div>📝 {doctor.statistics.totalReviews} reviews</div>
                      <div>📊 {doctor.statistics.completionRate}% completion</div>
                      <div>🕒 Active {formatTimeAgo(doctor.lastActive)}</div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => {
                          setSelectedDoctor(doctor);
                          setShowDetails(true);
                        }}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: theme.colors.primary,
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        View Details
                      </button>

                      {doctor.status === DOCTOR_STATUS.PENDING && (
                        <>
                          <button
                            onClick={() => handleApprovalAction(doctor, 'approve')}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#27ae60',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              fontWeight: '600'
                            }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleApprovalAction(doctor, 'reject')}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#e74c3c',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              fontWeight: '600'
                            }}
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {doctor.status === DOCTOR_STATUS.APPROVED && (
                        <button
                          onClick={() => handleApprovalAction(doctor, 'suspend')}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#f39c12',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            fontWeight: '600'
                          }}
                        >
                          Suspend
                        </button>
                      )}

                      {doctor.status === DOCTOR_STATUS.SUSPENDED && (
                        <button
                          onClick={() => handleApprovalAction(doctor, 'reactivate')}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#27ae60',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            fontWeight: '600'
                          }}
                        >
                          Reactivate
                        </button>
                      )}

                      <button
                        onClick={() => deleteDoctor(doctor.id)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#95a5a6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Doctor Details Modal */}
      {showDetails && selectedDoctor && (
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
            maxWidth: '900px',
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
                Doctor Details - {selectedDoctor.name}
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
              {/* Basic Information */}
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ margin: '0 0 15px 0', color: theme.colors.text }}>Basic Information</h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '15px',
                  padding: '15px',
                  backgroundColor: theme.colors.surface,
                  borderRadius: '8px'
                }}>
                  <div><strong>Name:</strong> {selectedDoctor.name}</div>
                  <div><strong>Email:</strong> {selectedDoctor.email}</div>
                  <div><strong>Phone:</strong> {selectedDoctor.phone}</div>
                  <div><strong>Specialty:</strong> {selectedDoctor.specialty}</div>
                  <div><strong>Sub-specialty:</strong> {selectedDoctor.subSpecialty}</div>
                  <div><strong>License:</strong> {selectedDoctor.licenseNumber}</div>
                  <div><strong>Experience:</strong> {selectedDoctor.yearsOfExperience} years</div>
                  <div><strong>Status:</strong> 
                    <span style={{ 
                      color: getStatusColor(selectedDoctor.status),
                      fontWeight: '600',
                      marginLeft: '5px'
                    }}>
                      {selectedDoctor.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Education */}
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ margin: '0 0 15px 0', color: theme.colors.text }}>Education</h3>
                <div style={{ space: '10px' }}>
                  {selectedDoctor.education?.map((edu, index) => (
                    <div key={index} style={{
                      padding: '10px',
                      backgroundColor: theme.colors.surface,
                      borderRadius: '6px',
                      marginBottom: '10px'
                    }}>
                      <strong>{edu.degree}</strong> - {edu.institution} ({edu.year})
                    </div>
                  ))}
                </div>
              </div>

              {/* Documents */}
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ margin: '0 0 15px 0', color: theme.colors.text }}>Documents</h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '10px'
                }}>
                  {selectedDoctor.documents?.map((doc, index) => (
                    <div key={index} style={{
                      padding: '10px',
                      backgroundColor: theme.colors.surface,
                      borderRadius: '6px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span>{doc.type}</span>
                      <span style={{
                        color: getVerificationColor(doc.status),
                        fontWeight: '600',
                        fontSize: '12px'
                      }}>
                        {doc.status.toUpperCase()}
                      </span>
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
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedDoctor && pendingAction && (
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
          zIndex: 1001,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: theme.colors.card,
            borderRadius: '12px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: theme.shadows.xl
          }}>
            <div style={{ padding: '20px' }}>
              <h3 style={{ margin: '0 0 15px 0', color: theme.colors.text }}>
                {pendingAction.charAt(0).toUpperCase() + pendingAction.slice(1)} Doctor
              </h3>
              <p style={{ marginBottom: '20px', color: theme.colors.textSecondary }}>
                Are you sure you want to {pendingAction} {selectedDoctor.name}?
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowApprovalModal(false);
                    setPendingAction(null);
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: theme.colors.border,
                    color: theme.colors.text,
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateDoctorStatus(selectedDoctor.id, pendingAction)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: pendingAction === 'approve' ? '#27ae60' : '#e74c3c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  {pendingAction.charAt(0).toUpperCase() + pendingAction.slice(1)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorManagement;