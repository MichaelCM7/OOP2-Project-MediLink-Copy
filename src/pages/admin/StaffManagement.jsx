import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../hooks/useNotification';
import { useTheme } from '../../context/ThemeContext';

const StaffManagement = () => {
  const { get, post, put, delete: del } = useApi();
  const { showSuccess, showError, showWarning } = useNotification();
  const { theme } = useTheme();

  // State management
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    role: 'all', // all, admin, nurse, receptionist, technician, security, maintenance
    department: 'all', // all, emergency, cardiology, pediatrics, surgery, etc.
    status: 'all', // all, active, inactive, on_leave
    shift: 'all' // all, morning, afternoon, night, rotating
  });
  const [sortBy, setSortBy] = useState('created_desc');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    onLeave: 0
  });

  // Form state for add/edit
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'nurse',
    department: 'general',
    shift: 'morning',
    employeeId: '',
    joiningDate: new Date().toISOString().split('T')[0],
    salary: '',
    address: '',
    emergencyContact: '',
    qualifications: '',
    status: 'active'
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Staff roles and departments
  const STAFF_ROLES = {
    ADMIN: 'admin',
    NURSE: 'nurse',
    RECEPTIONIST: 'receptionist',
    TECHNICIAN: 'technician',
    SECURITY: 'security',
    MAINTENANCE: 'maintenance',
    PHARMACIST: 'pharmacist',
    LAB_TECHNICIAN: 'lab_technician',
    CLEANER: 'cleaner'
  };

  const DEPARTMENTS = {
    GENERAL: 'general',
    EMERGENCY: 'emergency',
    CARDIOLOGY: 'cardiology',
    PEDIATRICS: 'pediatrics',
    SURGERY: 'surgery',
    ICU: 'icu',
    PHARMACY: 'pharmacy',
    LABORATORY: 'laboratory',
    ADMINISTRATION: 'administration'
  };

  const STAFF_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    ON_LEAVE: 'on_leave',
    TERMINATED: 'terminated'
  };

  const SHIFTS = {
    MORNING: 'morning',
    AFTERNOON: 'afternoon',
    NIGHT: 'night',
    ROTATING: 'rotating'
  };

  // Load staff on component mount and filter changes
  useEffect(() => {
    fetchStaff();
  }, [filters, sortBy]);

  // Apply search filter
  useEffect(() => {
    applySearchFilter();
  }, [staff, searchQuery]);

  // Fetch staff from API
  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const params = {
        role: filters.role !== 'all' ? filters.role : undefined,
        department: filters.department !== 'all' ? filters.department : undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
        shift: filters.shift !== 'all' ? filters.shift : undefined,
        sort: sortBy
      };

      const result = await get('/admin/staff', params);
      
      if (result.success) {
        setStaff(result.data.staff || []);
        setStats(result.data.stats || {});
      } else {
        setMockStaffData();
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      setMockStaffData();
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data for development
  const setMockStaffData = () => {
    const mockStaff = [
      {
        id: 'STF-001',
        name: 'Sarah Williams',
        email: 'sarah.williams@hospital.com',
        phone: '+254-700-111222',
        role: STAFF_ROLES.NURSE,
        department: DEPARTMENTS.EMERGENCY,
        shift: SHIFTS.MORNING,
        employeeId: 'EMP-2023-001',
        status: STAFF_STATUS.ACTIVE,
        joiningDate: '2023-01-15',
        salary: 45000,
        address: '123 Nursing Avenue, Nairobi',
        emergencyContact: '+254-700-333444',
        qualifications: 'BSN from University of Nairobi, Emergency Care Certification',
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        profilePicture: '/api/placeholder/80/80',
        performance: {
          rating: 4.8,
          attendance: 98,
          punctuality: 96,
          patientFeedback: 4.9
        },
        workHistory: [
          { position: 'Senior Nurse', department: 'Emergency', duration: '2023-Present' },
          { position: 'Staff Nurse', department: 'General Ward', duration: '2022-2023' }
        ]
      },
      {
        id: 'STF-002',
        name: 'James Mwangi',
        email: 'james.mwangi@hospital.com',
        phone: '+254-700-555666',
        role: STAFF_ROLES.SECURITY,
        department: DEPARTMENTS.ADMINISTRATION,
        shift: SHIFTS.NIGHT,
        employeeId: 'EMP-2022-045',
        status: STAFF_STATUS.ACTIVE,
        joiningDate: '2022-06-20',
        salary: 28000,
        address: '456 Security Road, Nairobi',
        emergencyContact: '+254-700-777888',
        qualifications: 'Security Management Certificate, First Aid Training',
        createdAt: new Date(Date.now() - 500 * 24 * 60 * 60 * 1000).toISOString(),
        lastActive: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        profilePicture: '/api/placeholder/80/80',
        performance: {
          rating: 4.5,
          attendance: 94,
          punctuality: 99,
          patientFeedback: 4.2
        },
        workHistory: [
          { position: 'Security Officer', department: 'Administration', duration: '2022-Present' }
        ]
      },
      {
        id: 'STF-003',
        name: 'Mary Kiprotich',
        email: 'mary.kiprotich@hospital.com',
        phone: '+254-700-999000',
        role: STAFF_ROLES.RECEPTIONIST,
        department: DEPARTMENTS.GENERAL,
        shift: SHIFTS.MORNING,
        employeeId: 'EMP-2024-012',
        status: STAFF_STATUS.ON_LEAVE,
        joiningDate: '2024-02-01',
        salary: 32000,
        address: '789 Reception Street, Nairobi',
        emergencyContact: '+254-700-111333',
        qualifications: 'Diploma in Business Administration, Customer Service Training',
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        lastActive: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        profilePicture: '/api/placeholder/80/80',
        performance: {
          rating: 4.6,
          attendance: 92,
          punctuality: 95,
          patientFeedback: 4.7
        },
        leaveDetails: {
          type: 'Maternity Leave',
          startDate: '2024-06-01',
          endDate: '2024-09-01',
          reason: 'Maternity leave'
        }
      },
      {
        id: 'STF-004',
        name: 'Peter Ochieng',
        email: 'peter.ochieng@hospital.com',
        phone: '+254-700-222555',
        role: STAFF_ROLES.TECHNICIAN,
        department: DEPARTMENTS.LABORATORY,
        shift: SHIFTS.AFTERNOON,
        employeeId: 'EMP-2023-078',
        status: STAFF_STATUS.ACTIVE,
        joiningDate: '2023-08-10',
        salary: 38000,
        address: '321 Lab Technology Avenue, Nairobi',
        emergencyContact: '+254-700-444777',
        qualifications: 'Diploma in Medical Laboratory Technology, Quality Assurance Certification',
        createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
        lastActive: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        profilePicture: '/api/placeholder/80/80',
        performance: {
          rating: 4.7,
          attendance: 97,
          punctuality: 98,
          patientFeedback: 4.5
        }
      },
      {
        id: 'STF-005',
        name: 'Grace Wanjiku',
        email: 'grace.wanjiku@hospital.com',
        phone: '+254-700-666999',
        role: STAFF_ROLES.PHARMACIST,
        department: DEPARTMENTS.PHARMACY,
        shift: SHIFTS.MORNING,
        employeeId: 'EMP-2021-156',
        status: STAFF_STATUS.INACTIVE,
        joiningDate: '2021-11-05',
        salary: 55000,
        address: '654 Pharmacy Lane, Nairobi',
        emergencyContact: '+254-700-888111',
        qualifications: 'Bachelor of Pharmacy, Licensed Pharmacist',
        createdAt: new Date(Date.now() - 800 * 24 * 60 * 60 * 1000).toISOString(),
        lastActive: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        profilePicture: '/api/placeholder/80/80',
        performance: {
          rating: 4.9,
          attendance: 89,
          punctuality: 94,
          patientFeedback: 4.8
        },
        inactiveReason: 'Personal leave of absence'
      }
    ];

    setStaff(mockStaff);
    setStats({
      total: mockStaff.length,
      active: mockStaff.filter(s => s.status === STAFF_STATUS.ACTIVE).length,
      inactive: mockStaff.filter(s => s.status === STAFF_STATUS.INACTIVE).length,
      onLeave: mockStaff.filter(s => s.status === STAFF_STATUS.ON_LEAVE).length
    });
  };

  // Apply search filter
  const applySearchFilter = () => {
    let filtered = [...staff];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query) ||
        member.employeeId.toLowerCase().includes(query) ||
        member.role.toLowerCase().includes(query) ||
        member.department.toLowerCase().includes(query)
      );
    }

    setFilteredStaff(filtered);
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
    if (!formData.phone.trim()) errors.phone = 'Phone is required';
    if (!formData.employeeId.trim()) errors.employeeId = 'Employee ID is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const endpoint = selectedStaff ? `/admin/staff/${selectedStaff.id}` : '/admin/staff';
      const method = selectedStaff ? 'PUT' : 'POST';
      
      const result = selectedStaff 
        ? await put(endpoint, formData)
        : await post(endpoint, formData);

      if (result.success) {
        showSuccess(
          selectedStaff ? 'Staff Updated' : 'Staff Added',
          `Staff member ${selectedStaff ? 'updated' : 'added'} successfully`
        );
        fetchStaff();
        resetForm();
        setShowAddModal(false);
        setShowEditModal(false);
      } else {
        showError('Operation Failed', result.error || 'Failed to save staff member');
      }
    } catch (error) {
      showError('Operation Failed', 'Network error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'nurse',
      department: 'general',
      shift: 'morning',
      employeeId: '',
      joiningDate: new Date().toISOString().split('T')[0],
      salary: '',
      address: '',
      emergencyContact: '',
      qualifications: '',
      status: 'active'
    });
    setFormErrors({});
    setSelectedStaff(null);
  };

  // Update staff status
  const updateStaffStatus = async (staffId, newStatus) => {
    try {
      const result = await put(`/admin/staff/${staffId}/status`, {
        status: newStatus,
        updatedBy: 'Admin',
        timestamp: new Date().toISOString()
      });

      if (result.success) {
        showSuccess('Status Updated', `Staff status updated to ${newStatus}`);
        fetchStaff();
      } else {
        showError('Update Failed', result.error || 'Failed to update staff status');
      }
    } catch (error) {
      showError('Update Failed', 'Network error occurred');
    }
  };

  // Delete staff
  const deleteStaff = async (staffId) => {
    if (window.confirm('Are you sure you want to delete this staff member? This action cannot be undone.')) {
      try {
        const result = await del(`/admin/staff/${staffId}`);
        
        if (result.success) {
          showSuccess('Staff Deleted', 'Staff member has been removed from the system');
          fetchStaff();
        } else {
          showError('Delete Failed', result.error || 'Failed to delete staff member');
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
      active: '#27ae60',
      inactive: '#95a5a6',
      on_leave: '#f39c12',
      terminated: '#e74c3c'
    };
    return colors[status] || '#95a5a6';
  };

  // Get role icon
  const getRoleIcon = (role) => {
    const icons = {
      admin: '👨‍💼',
      nurse: '👩‍⚕️',
      receptionist: '👩‍💻',
      technician: '👨‍🔧',
      security: '👮‍♂️',
      maintenance: '🔧',
      pharmacist: '💊',
      lab_technician: '🔬',
      cleaner: '🧹'
    };
    return icons[role] || '👤';
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <div>Loading staff...</div>
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
            Staff Management
          </h1>
          <p style={{ margin: 0, color: theme.colors.textSecondary }}>
            Manage hospital staff accounts, roles, and assignments
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: theme.colors.success,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            + Add Staff
          </button>
          <button
            onClick={fetchStaff}
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
      </div>

      {/* Statistics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {[
          { title: 'Total Staff', value: stats.total, icon: '👥', color: '#3498db' },
          { title: 'Active', value: stats.active, icon: '✅', color: '#27ae60' },
          { title: 'On Leave', value: stats.onLeave, icon: '📅', color: '#f39c12' },
          { title: 'Inactive', value: stats.inactive, icon: '⏸️', color: '#95a5a6' }
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
              placeholder="Search by name, email, ID, or role..."
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
              Role
            </label>
            <select
              value={filters.role}
              onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px',
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="nurse">Nurse</option>
              <option value="receptionist">Receptionist</option>
              <option value="technician">Technician</option>
              <option value="security">Security</option>
              <option value="pharmacist">Pharmacist</option>
              <option value="lab_technician">Lab Technician</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
              Department
            </label>
            <select
              value={filters.department}
              onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px',
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="all">All Departments</option>
              <option value="general">General</option>
              <option value="emergency">Emergency</option>
              <option value="cardiology">Cardiology</option>
              <option value="pediatrics">Pediatrics</option>
              <option value="surgery">Surgery</option>
              <option value="pharmacy">Pharmacy</option>
              <option value="laboratory">Laboratory</option>
            </select>
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_leave">On Leave</option>
            </select>
          </div>
        </div>
      </div>

      {/* Staff List */}
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
            Staff Members ({filteredStaff.length})
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
            <option value="role">By Role</option>
            <option value="department">By Department</option>
          </select>
        </div>

        {filteredStaff.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: theme.colors.textMuted }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>👥</div>
            <h3 style={{ margin: '0 0 10px 0' }}>No Staff Found</h3>
            <p style={{ margin: 0 }}>No staff members match your current filters</p>
          </div>
        ) : (
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {filteredStaff.map((member) => (
              <div
                key={member.id}
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
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      backgroundColor: `${getStatusColor(member.status)}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      border: `2px solid ${getStatusColor(member.status)}`
                    }}>
                      {getRoleIcon(member.role)}
                    </div>
                  </div>

                  {/* Staff Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <h4 style={{ margin: '0 0 5px 0', color: theme.colors.text, fontSize: '16px' }}>
                          {member.name}
                        </h4>
                        <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: theme.colors.textSecondary }}>
                          {member.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} • {member.department.replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                        <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: theme.colors.textMuted }}>
                          📧 {member.email} • 📞 {member.phone}
                        </p>
                        <p style={{ margin: 0, fontSize: '13px', color: theme.colors.textMuted }}>
                          ID: {member.employeeId} • Joined: {formatDate(member.joiningDate)}
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
                          backgroundColor: getStatusColor(member.status),
                          marginBottom: '5px'
                        }}>
                          {member.status.replace('_', ' ').toUpperCase()}
                        </div>
                        <div style={{ fontSize: '12px', color: theme.colors.textMuted }}>
                          {member.shift.replace(/\b\w/g, l => l.toUpperCase())} Shift
                        </div>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    {member.performance && (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                        gap: '10px',
                        marginBottom: '15px',
                        fontSize: '12px',
                        color: theme.colors.textSecondary
                      }}>
                        <div>⭐ {member.performance.rating} rating</div>
                        <div>📅 {member.performance.attendance}% attendance</div>
                        <div>⏰ {member.performance.punctuality}% punctual</div>
                        <div>💬 {member.performance.patientFeedback} feedback</div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => {
                          setSelectedStaff(member);
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

                      <button
                        onClick={() => {
                          setSelectedStaff(member);
                          setFormData(member);
                          setShowEditModal(true);
                        }}
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
                        Edit
                      </button>

                      {member.status === STAFF_STATUS.ACTIVE && (
                        <button
                          onClick={() => updateStaffStatus(member.id, STAFF_STATUS.INACTIVE)}
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
                          Deactivate
                        </button>
                      )}

                      {member.status === STAFF_STATUS.INACTIVE && (
                        <button
                          onClick={() => updateStaffStatus(member.id, STAFF_STATUS.ACTIVE)}
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
                          Activate
                        </button>
                      )}

                      <button
                        onClick={() => deleteStaff(member.id)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#e74c3c',
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

      {/* Add/Edit Staff Modal */}
      {(showAddModal || showEditModal) && (
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
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: theme.shadows.xl
          }}>
            <div style={{
              padding: '20px',
              borderBottom: `1px solid ${theme.colors.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ margin: 0, color: theme.colors.text }}>
                {showEditModal ? 'Edit Staff Member' : 'Add New Staff Member'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  resetForm();
                }}
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

            <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '15px',
                marginBottom: '20px'
              }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: `1px solid ${formErrors.name ? '#e74c3c' : theme.colors.border}`,
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                  {formErrors.name && (
                    <span style={{ fontSize: '12px', color: '#e74c3c' }}>{formErrors.name}</span>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: `1px solid ${formErrors.email ? '#e74c3c' : theme.colors.border}`,
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                  {formErrors.email && (
                    <span style={{ fontSize: '12px', color: '#e74c3c' }}>{formErrors.email}</span>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: `1px solid ${formErrors.phone ? '#e74c3c' : theme.colors.border}`,
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                  {formErrors.phone && (
                    <span style={{ fontSize: '12px', color: '#e74c3c' }}>{formErrors.phone}</span>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
                    Employee ID *
                  </label>
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: `1px solid ${formErrors.employeeId ? '#e74c3c' : theme.colors.border}`,
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                  {formErrors.employeeId && (
                    <span style={{ fontSize: '12px', color: '#e74c3c' }}>{formErrors.employeeId}</span>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="nurse">Nurse</option>
                    <option value="receptionist">Receptionist</option>
                    <option value="technician">Technician</option>
                    <option value="security">Security</option>
                    <option value="pharmacist">Pharmacist</option>
                    <option value="lab_technician">Lab Technician</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="general">General</option>
                    <option value="emergency">Emergency</option>
                    <option value="cardiology">Cardiology</option>
                    <option value="pediatrics">Pediatrics</option>
                    <option value="surgery">Surgery</option>
                    <option value="pharmacy">Pharmacy</option>
                    <option value="laboratory">Laboratory</option>
                    <option value="administration">Administration</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
                    Shift
                  </label>
                  <select
                    value={formData.shift}
                    onChange={(e) => setFormData(prev => ({ ...prev, shift: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="night">Night</option>
                    <option value="rotating">Rotating</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
                    Salary (KES)
                  </label>
                  <input
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData(prev => ({ ...prev, salary: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    resetForm();
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
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: theme.colors.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    opacity: isSubmitting ? 0.7 : 1
                  }}
                >
                  {isSubmitting ? 'Saving...' : (showEditModal ? 'Update Staff' : 'Add Staff')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Details Modal */}
      {showDetails && selectedStaff && (
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
            maxWidth: '700px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: theme.shadows.xl
          }}>
            <div style={{
              padding: '20px',
              borderBottom: `1px solid ${theme.colors.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ margin: 0, color: theme.colors.text }}>
                Staff Details - {selectedStaff.name}
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

            <div style={{ padding: '20px' }}>
              {/* Basic Information */}
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ margin: '0 0 15px 0', color: theme.colors.text }}>Basic Information</h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '15px',
                  padding: '15px',
                  backgroundColor: theme.colors.surface,
                  borderRadius: '8px'
                }}>
                  <div><strong>Name:</strong> {selectedStaff.name}</div>
                  <div><strong>Employee ID:</strong> {selectedStaff.employeeId}</div>
                  <div><strong>Email:</strong> {selectedStaff.email}</div>
                  <div><strong>Phone:</strong> {selectedStaff.phone}</div>
                  <div><strong>Role:</strong> {selectedStaff.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                  <div><strong>Department:</strong> {selectedStaff.department.replace(/\b\w/g, l => l.toUpperCase())}</div>
                  <div><strong>Shift:</strong> {selectedStaff.shift.replace(/\b\w/g, l => l.toUpperCase())}</div>
                  <div><strong>Joining Date:</strong> {formatDate(selectedStaff.joiningDate)}</div>
                  <div><strong>Salary:</strong> KES {selectedStaff.salary?.toLocaleString()}</div>
                  <div><strong>Status:</strong> 
                    <span style={{ 
                      color: getStatusColor(selectedStaff.status),
                      fontWeight: '600',
                      marginLeft: '5px'
                    }}>
                      {selectedStaff.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Performance */}
              {selectedStaff.performance && (
                <div style={{ marginBottom: '25px' }}>
                  <h3 style={{ margin: '0 0 15px 0', color: theme.colors.text }}>Performance Metrics</h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '15px',
                    padding: '15px',
                    backgroundColor: theme.colors.surface,
                    borderRadius: '8px'
                  }}>
                    <div><strong>Overall Rating:</strong> ⭐ {selectedStaff.performance.rating}/5</div>
                    <div><strong>Attendance:</strong> {selectedStaff.performance.attendance}%</div>
                    <div><strong>Punctuality:</strong> {selectedStaff.performance.punctuality}%</div>
                    <div><strong>Patient Feedback:</strong> {selectedStaff.performance.patientFeedback}/5</div>
                  </div>
                </div>
              )}

              {/* Leave Details */}
              {selectedStaff.leaveDetails && (
                <div style={{ marginBottom: '25px' }}>
                  <h3 style={{ margin: '0 0 15px 0', color: theme.colors.text }}>Leave Information</h3>
                  <div style={{
                    padding: '15px',
                    backgroundColor: '#fff3cd',
                    borderRadius: '8px',
                    border: '1px solid #ffeaa7'
                  }}>
                    <div><strong>Type:</strong> {selectedStaff.leaveDetails.type}</div>
                    <div><strong>Period:</strong> {formatDate(selectedStaff.leaveDetails.startDate)} - {formatDate(selectedStaff.leaveDetails.endDate)}</div>
                    <div><strong>Reason:</strong> {selectedStaff.leaveDetails.reason}</div>
                  </div>
                </div>
              )}

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
    </div>
  );
};

export default StaffManagement;