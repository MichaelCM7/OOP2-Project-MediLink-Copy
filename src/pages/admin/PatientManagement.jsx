import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../hooks/useNotification';
import { useTheme } from '../../context/ThemeContext';

const PatientManagement = () => {
  const { get, post, put, delete: del } = useApi();
  const { showSuccess, showError, showWarning } = useNotification();
  const { theme } = useTheme();

  // State management
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: 'all', // all, active, inactive, blocked
    ageGroup: 'all', // all, child, adult, senior
    registrationDate: 'all', // all, today, week, month, year
    emergencyContact: 'all', // all, with_contact, without_contact
    insuranceStatus: 'all' // all, insured, uninsured
  });
  const [sortBy, setSortBy] = useState('created_desc');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    newToday: 0
  });

  // Form state for add/edit
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'male',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    bloodGroup: '',
    allergies: '',
    medicalHistory: '',
    insuranceProvider: '',
    insuranceNumber: '',
    status: 'active'
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Patient status options
  const PATIENT_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    BLOCKED: 'blocked',
    DECEASED: 'deceased'
  };

  const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const INSURANCE_PROVIDERS = [
    'NHIF',
    'AAR Insurance',
    'Jubilee Insurance',
    'Madison Insurance',
    'APA Insurance',
    'Britam Insurance',
    'UAP Insurance',
    'Self-Pay',
    'Other'
  ];

  // Load patients on component mount and filter changes
  useEffect(() => {
    fetchPatients();
  }, [filters, sortBy]);

  // Apply search filter
  useEffect(() => {
    applySearchFilter();
  }, [patients, searchQuery]);

  // Fetch patients from API
  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const params = {
        status: filters.status !== 'all' ? filters.status : undefined,
        ageGroup: filters.ageGroup !== 'all' ? filters.ageGroup : undefined,
        registration: filters.registrationDate !== 'all' ? filters.registrationDate : undefined,
        insurance: filters.insuranceStatus !== 'all' ? filters.insuranceStatus : undefined,
        sort: sortBy
      };

      const result = await get('/admin/patients', params);
      
      if (result.success) {
        setPatients(result.data.patients || []);
        setStats(result.data.stats || {});
      } else {
        setMockPatientData();
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      setMockPatientData();
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data for development
  const setMockPatientData = () => {
    const mockPatients = [
      {
        id: 'PAT-001',
        name: 'John Doe',
        email: 'john.doe@email.com',
        phone: '+254-700-123456',
        dateOfBirth: '1985-03-15',
        age: 39,
        gender: 'Male',
        address: '123 Main Street, Nairobi',
        emergencyContactName: 'Jane Doe',
        emergencyContactPhone: '+254-700-654321',
        bloodGroup: 'O+',
        allergies: 'Penicillin, Shellfish',
        medicalHistory: 'Hypertension, Family history of diabetes',
        insuranceProvider: 'NHIF',
        insuranceNumber: 'NHIF-12345678',
        status: PATIENT_STATUS.ACTIVE,
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        lastVisit: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        profilePicture: '/api/placeholder/80/80',
        statistics: {
          totalAppointments: 12,
          completedAppointments: 10,
          cancelledAppointments: 2,
          lastAppointment: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          totalSpent: 25000,
          averageRating: 4.5
        },
        vitals: {
          height: '175cm',
          weight: '70kg',
          bloodPressure: '120/80',
          lastUpdated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        recentAppointments: [
          {
            id: 'APT-001',
            doctorName: 'Dr. Sarah Johnson',
            specialty: 'Cardiology',
            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'completed'
          }
        ]
      },
      {
        id: 'PAT-002',
        name: 'Mary Smith',
        email: 'mary.smith@email.com',
        phone: '+254-700-789012',
        dateOfBirth: '1992-07-22',
        age: 32,
        gender: 'Female',
        address: '456 Oak Avenue, Westlands',
        emergencyContactName: 'Robert Smith',
        emergencyContactPhone: '+254-700-987654',
        bloodGroup: 'A+',
        allergies: 'None known',
        medicalHistory: 'Previous pregnancy complications',
        insuranceProvider: 'AAR Insurance',
        insuranceNumber: 'AAR-87654321',
        status: PATIENT_STATUS.ACTIVE,
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        lastVisit: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        profilePicture: '/api/placeholder/80/80',
        statistics: {
          totalAppointments: 8,
          completedAppointments: 7,
          cancelledAppointments: 1,
          lastAppointment: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          totalSpent: 18000,
          averageRating: 4.8
        },
        vitals: {
          height: '162cm',
          weight: '58kg',
          bloodPressure: '110/70',
          lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      },
      {
        id: 'PAT-003',
        name: 'Robert Johnson',
        email: 'robert.johnson@email.com',
        phone: '+254-700-345678',
        dateOfBirth: '1955-12-10',
        age: 69,
        gender: 'Male',
        address: '789 Pine Road, Karen',
        emergencyContactName: 'Susan Johnson',
        emergencyContactPhone: '+254-700-246810',
        bloodGroup: 'B-',
        allergies: 'Aspirin, Latex',
        medicalHistory: 'Diabetes Type 2, Coronary artery disease, Previous stroke',
        insuranceProvider: 'Jubilee Insurance',
        insuranceNumber: 'JUB-11223344',
        status: PATIENT_STATUS.ACTIVE,
        createdAt: new Date(Date.now() - 1000 * 24 * 60 * 60 * 1000).toISOString(),
        lastVisit: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        profilePicture: '/api/placeholder/80/80',
        statistics: {
          totalAppointments: 45,
          completedAppointments: 42,
          cancelledAppointments: 3,
          lastAppointment: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          totalSpent: 125000,
          averageRating: 4.3
        },
        vitals: {
          height: '178cm',
          weight: '82kg',
          bloodPressure: '140/90',
          lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        highRisk: true,
        riskFactors: ['Age > 65', 'Diabetes', 'Hypertension', 'Previous stroke']
      },
      {
        id: 'PAT-004',
        name: 'Emily Davis',
        email: 'emily.davis@email.com',
        phone: '+254-700-555666',
        dateOfBirth: '2010-04-18',
        age: 14,
        gender: 'Female',
        address: '321 Cedar Lane, Kilimani',
        emergencyContactName: 'Michael Davis',
        emergencyContactPhone: '+254-700-777888',
        bloodGroup: 'AB+',
        allergies: 'Peanuts',
        medicalHistory: 'Asthma',
        insuranceProvider: 'Self-Pay',
        insuranceNumber: '',
        status: PATIENT_STATUS.ACTIVE,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        lastVisit: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        profilePicture: '/api/placeholder/80/80',
        statistics: {
          totalAppointments: 3,
          completedAppointments: 3,
          cancelledAppointments: 0,
          lastAppointment: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          totalSpent: 8500,
          averageRating: 5.0
        },
        vitals: {
          height: '155cm',
          weight: '45kg',
          bloodPressure: '105/65',
          lastUpdated: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
        },
        isMinor: true,
        guardian: 'Michael Davis'
      },
      {
        id: 'PAT-005',
        name: 'James Wilson',
        email: 'james.wilson@email.com',
        phone: '+254-700-999000',
        dateOfBirth: '1978-09-05',
        age: 46,
        gender: 'Male',
        address: '654 Maple Street, Parklands',
        emergencyContactName: 'Lisa Wilson',
        emergencyContactPhone: '+254-700-111222',
        bloodGroup: 'O-',
        allergies: 'None known',
        medicalHistory: 'Lower back injury (2020)',
        insuranceProvider: 'Madison Insurance',
        insuranceNumber: 'MAD-55667788',
        status: PATIENT_STATUS.INACTIVE,
        createdAt: new Date(Date.now() - 500 * 24 * 60 * 60 * 1000).toISOString(),
        lastVisit: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        profilePicture: '/api/placeholder/80/80',
        statistics: {
          totalAppointments: 6,
          completedAppointments: 5,
          cancelledAppointments: 1,
          lastAppointment: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
          totalSpent: 15000,
          averageRating: 4.0
        },
        vitals: {
          height: '180cm',
          weight: '85kg',
          bloodPressure: '125/85',
          lastUpdated: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
        },
        inactiveReason: 'Moved to different city'
      }
    ];

    setPatients(mockPatients);
    setStats({
      total: mockPatients.length,
      active: mockPatients.filter(p => p.status === PATIENT_STATUS.ACTIVE).length,
      inactive: mockPatients.filter(p => p.status === PATIENT_STATUS.INACTIVE).length,
      newToday: mockPatients.filter(p => {
        const today = new Date();
        const createdDate = new Date(p.createdAt);
        return createdDate.toDateString() === today.toDateString();
      }).length
    });
  };

  // Apply search filter
  const applySearchFilter = () => {
    let filtered = [...patients];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(patient =>
        patient.name.toLowerCase().includes(query) ||
        patient.email.toLowerCase().includes(query) ||
        patient.phone.toLowerCase().includes(query) ||
        patient.id.toLowerCase().includes(query) ||
        patient.insuranceNumber.toLowerCase().includes(query)
      );
    }

    setFilteredPatients(filtered);
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
    if (!formData.phone.trim()) errors.phone = 'Phone is required';
    if (!formData.dateOfBirth) errors.dateOfBirth = 'Date of birth is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const patientData = {
        ...formData,
        age: calculateAge(formData.dateOfBirth)
      };

      const endpoint = selectedPatient ? `/admin/patients/${selectedPatient.id}` : '/admin/patients';
      const method = selectedPatient ? 'PUT' : 'POST';
      
      const result = selectedPatient 
        ? await put(endpoint, patientData)
        : await post(endpoint, patientData);

      if (result.success) {
        showSuccess(
          selectedPatient ? 'Patient Updated' : 'Patient Added',
          `Patient ${selectedPatient ? 'updated' : 'added'} successfully`
        );
        fetchPatients();
        resetForm();
        setShowAddModal(false);
        setShowEditModal(false);
      } else {
        showError('Operation Failed', result.error || 'Failed to save patient');
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
      dateOfBirth: '',
      gender: 'male',
      address: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      bloodGroup: '',
      allergies: '',
      medicalHistory: '',
      insuranceProvider: '',
      insuranceNumber: '',
      status: 'active'
    });
    setFormErrors({});
    setSelectedPatient(null);
  };

  // Update patient status
  const updatePatientStatus = async (patientId, newStatus) => {
    try {
      const result = await put(`/admin/patients/${patientId}/status`, {
        status: newStatus,
        updatedBy: 'Admin',
        timestamp: new Date().toISOString()
      });

      if (result.success) {
        showSuccess('Status Updated', `Patient status updated to ${newStatus}`);
        fetchPatients();
      } else {
        showError('Update Failed', result.error || 'Failed to update patient status');
      }
    } catch (error) {
      showError('Update Failed', 'Network error occurred');
    }
  };

  // Delete patient
  const deletePatient = async (patientId) => {
    if (window.confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      try {
        const result = await del(`/admin/patients/${patientId}`);
        
        if (result.success) {
          showSuccess('Patient Deleted', 'Patient has been removed from the system');
          fetchPatients();
        } else {
          showError('Delete Failed', result.error || 'Failed to delete patient');
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
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      active: '#27ae60',
      inactive: '#95a5a6',
      blocked: '#e74c3c',
      deceased: '#34495e'
    };
    return colors[status] || '#95a5a6';
  };

  // Get age group
  const getAgeGroup = (age) => {
    if (age < 18) return 'Child';
    if (age >= 65) return 'Senior';
    return 'Adult';
  };

  // Get risk level based on patient data
  const getRiskLevel = (patient) => {
    if (patient.highRisk) return 'High';
    if (patient.age >= 65 || patient.medicalHistory.includes('diabetes') || patient.medicalHistory.includes('hypertension')) {
      return 'Medium';
    }
    return 'Low';
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <div>Loading patients...</div>
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
            Patient Management
          </h1>
          <p style={{ margin: 0, color: theme.colors.textSecondary }}>
            Manage patient records, medical history, and account status
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
            + Add Patient
          </button>
          <button
            onClick={fetchPatients}
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
          { title: 'Total Patients', value: stats.total, icon: '👥', color: '#3498db' },
          { title: 'Active Patients', value: stats.active, icon: '✅', color: '#27ae60' },
          { title: 'New Today', value: stats.newToday, icon: '🆕', color: '#f39c12' },
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
              placeholder="Search by name, email, phone, or ID..."
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
              Age Group
            </label>
            <select
              value={filters.ageGroup}
              onChange={(e) => setFilters(prev => ({ ...prev, ageGroup: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px',
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="all">All Ages</option>
              <option value="child">Children (0-17)</option>
              <option value="adult">Adults (18-64)</option>
              <option value="senior">Seniors (65+)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
              Insurance
            </label>
            <select
              value={filters.insuranceStatus}
              onChange={(e) => setFilters(prev => ({ ...prev, insuranceStatus: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px',
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="all">All Insurance</option>
              <option value="insured">Insured</option>
              <option value="uninsured">Self-Pay</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patients List */}
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
            Patients ({filteredPatients.length})
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
            <option value="age_asc">Youngest First</option>
            <option value="age_desc">Oldest First</option>
            <option value="last_visit">Recent Visit</option>
          </select>
        </div>

        {filteredPatients.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: theme.colors.textMuted }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>👥</div>
            <h3 style={{ margin: '0 0 10px 0' }}>No Patients Found</h3>
            <p style={{ margin: 0 }}>No patients match your current filters</p>
          </div>
        ) : (
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {filteredPatients.map((patient) => (
              <div
                key={patient.id}
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
                      backgroundColor: `${getStatusColor(patient.status)}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      border: `2px solid ${getStatusColor(patient.status)}`
                    }}>
                      {patient.gender === 'Male' ? '👨' : patient.age < 18 ? '👧' : '👩'}
                    </div>
                  </div>

                  {/* Patient Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <h4 style={{ margin: '0 0 5px 0', color: theme.colors.text, fontSize: '16px' }}>
                          {patient.name} {patient.isMinor && '👶'}
                        </h4>
                        <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: theme.colors.textSecondary }}>
                          {patient.age} years old • {patient.gender} • {getAgeGroup(patient.age)}
                        </p>
                        <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: theme.colors.textMuted }}>
                          📧 {patient.email} • 📞 {patient.phone}
                        </p>
                        <p style={{ margin: 0, fontSize: '13px', color: theme.colors.textMuted }}>
                          ID: {patient.id} • Blood: {patient.bloodGroup} • Last visit: {formatTimeAgo(patient.lastVisit)}
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
                          backgroundColor: getStatusColor(patient.status),
                          marginBottom: '5px'
                        }}>
                          {patient.status.toUpperCase()}
                        </div>
                        {patient.highRisk && (
                          <div style={{
                            display: 'block',
                            padding: '2px 8px',
                            borderRadius: '8px',
                            fontSize: '11px',
                            fontWeight: '600',
                            color: '#e74c3c',
                            backgroundColor: '#ffebee'
                          }}>
                            HIGH RISK
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Medical Information */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: '10px',
                      marginBottom: '15px',
                      fontSize: '12px',
                      color: theme.colors.textSecondary
                    }}>
                      <div>🏥 {patient.statistics.totalAppointments} appointments</div>
                      <div>💰 KES {patient.statistics.totalSpent?.toLocaleString()}</div>
                      <div>🛡️ {patient.insuranceProvider}</div>
                      <div>⚠️ {patient.allergies || 'No allergies'}</div>
                      {patient.vitals?.bloodPressure && (
                        <div>❤️ BP: {patient.vitals.bloodPressure}</div>
                      )}
                      <div>📊 Risk: {getRiskLevel(patient)}</div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => {
                          setSelectedPatient(patient);
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
                          setSelectedPatient(patient);
                          setFormData({
                            ...patient,
                            dateOfBirth: patient.dateOfBirth || ''
                          });
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

                      {patient.status === PATIENT_STATUS.ACTIVE && (
                        <button
                          onClick={() => updatePatientStatus(patient.id, PATIENT_STATUS.INACTIVE)}
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

                      {patient.status === PATIENT_STATUS.INACTIVE && (
                        <button
                          onClick={() => updatePatientStatus(patient.id, PATIENT_STATUS.ACTIVE)}
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
                        onClick={() => deletePatient(patient.id)}
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

      {/* Add/Edit Patient Modal */}
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
                {showEditModal ? 'Edit Patient' : 'Add New Patient'}
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
                    Full Name *
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
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: `1px solid ${formErrors.dateOfBirth ? '#e74c3c' : theme.colors.border}`,
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                  {formErrors.dateOfBirth && (
                    <span style={{ fontSize: '12px', color: '#e74c3c' }}>{formErrors.dateOfBirth}</span>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
                    Blood Group
                  </label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData(prev => ({ ...prev, bloodGroup: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Select Blood Group</option>
                    {BLOOD_GROUPS.map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
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
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContactName}
                    onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactName: e.target.value }))}
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
                    Emergency Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactPhone: e.target.value }))}
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
                    Insurance Provider
                  </label>
                  <select
                    value={formData.insuranceProvider}
                    onChange={(e) => setFormData(prev => ({ ...prev, insuranceProvider: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Select Insurance</option>
                    {INSURANCE_PROVIDERS.map(provider => (
                      <option key={provider} value={provider}>{provider}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
                    Insurance Number
                  </label>
                  <input
                    type="text"
                    value={formData.insuranceNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, insuranceNumber: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
                    Allergies
                  </label>
                  <textarea
                    value={formData.allergies}
                    onChange={(e) => setFormData(prev => ({ ...prev, allergies: e.target.value }))}
                    rows={2}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: '6px',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                    placeholder="List any known allergies..."
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
                    Medical History
                  </label>
                  <textarea
                    value={formData.medicalHistory}
                    onChange={(e) => setFormData(prev => ({ ...prev, medicalHistory: e.target.value }))}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: '6px',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                    placeholder="Previous medical conditions, surgeries, family history..."
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
                  {isSubmitting ? 'Saving...' : (showEditModal ? 'Update Patient' : 'Add Patient')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Patient Details Modal */}
      {showDetails && selectedPatient && (
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
            <div style={{
              padding: '20px',
              borderBottom: `1px solid ${theme.colors.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ margin: 0, color: theme.colors.text }}>
                Patient Details - {selectedPatient.name}
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
                  <div><strong>Name:</strong> {selectedPatient.name}</div>
                  <div><strong>Age:</strong> {selectedPatient.age} years old</div>
                  <div><strong>Gender:</strong> {selectedPatient.gender}</div>
                  <div><strong>Blood Group:</strong> {selectedPatient.bloodGroup}</div>
                  <div><strong>Email:</strong> {selectedPatient.email}</div>
                  <div><strong>Phone:</strong> {selectedPatient.phone}</div>
                  <div><strong>Address:</strong> {selectedPatient.address}</div>
                  <div><strong>Emergency Contact:</strong> {selectedPatient.emergencyContactName} ({selectedPatient.emergencyContactPhone})</div>
                  <div><strong>Insurance:</strong> {selectedPatient.insuranceProvider} - {selectedPatient.insuranceNumber}</div>
                  <div><strong>Status:</strong> 
                    <span style={{ 
                      color: getStatusColor(selectedPatient.status),
                      fontWeight: '600',
                      marginLeft: '5px'
                    }}>
                      {selectedPatient.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ margin: '0 0 15px 0', color: theme.colors.text }}>Medical Information</h3>
                <div style={{
                  padding: '15px',
                  backgroundColor: theme.colors.surface,
                  borderRadius: '8px'
                }}>
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Allergies:</strong> {selectedPatient.allergies || 'None known'}
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Medical History:</strong> {selectedPatient.medicalHistory || 'No significant history'}
                  </div>
                  {selectedPatient.vitals && (
                    <div>
                      <strong>Recent Vitals:</strong> Height: {selectedPatient.vitals.height}, Weight: {selectedPatient.vitals.weight}, BP: {selectedPatient.vitals.bloodPressure}
                    </div>
                  )}
                </div>
              </div>

              {/* Statistics */}
              {selectedPatient.statistics && (
                <div style={{ marginBottom: '25px' }}>
                  <h3 style={{ margin: '0 0 15px 0', color: theme.colors.text }}>Visit Statistics</h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '15px',
                    padding: '15px',
                    backgroundColor: theme.colors.surface,
                    borderRadius: '8px'
                  }}>
                    <div><strong>Total Appointments:</strong> {selectedPatient.statistics.totalAppointments}</div>
                    <div><strong>Completed:</strong> {selectedPatient.statistics.completedAppointments}</div>
                    <div><strong>Cancelled:</strong> {selectedPatient.statistics.cancelledAppointments}</div>
                    <div><strong>Total Spent:</strong> KES {selectedPatient.statistics.totalSpent?.toLocaleString()}</div>
                    <div><strong>Last Visit:</strong> {formatTimeAgo(selectedPatient.lastVisit)}</div>
                    <div><strong>Avg Rating:</strong> ⭐ {selectedPatient.statistics.averageRating}/5</div>
                  </div>
                </div>
              )}

              {/* Risk Factors */}
              {selectedPatient.riskFactors && (
                <div style={{ marginBottom: '25px' }}>
                  <h3 style={{ margin: '0 0 15px 0', color: theme.colors.text }}>Risk Factors</h3>
                  <div style={{
                    padding: '15px',
                    backgroundColor: '#ffebee',
                    borderRadius: '8px',
                    border: '1px solid #ffcdd2'
                  }}>
                    {selectedPatient.riskFactors.map((risk, index) => (
                      <div key={index} style={{ marginBottom: '5px' }}>
                        ⚠️ {risk}
                      </div>
                    ))}
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

export default PatientManagement;