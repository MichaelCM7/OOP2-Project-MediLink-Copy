import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { patientService } from '../../services/patientService';
import { appointmentService } from '../../services/appointmentService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import './PatientRecords.css';

const PatientRecords = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  // New patient form
  const [newPatient, setNewPatient] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phoneNumber: ''
    },
    insuranceInfo: {
      provider: '',
      policyNumber: '',
      groupNumber: ''
    },
    medicalInfo: {
      bloodType: '',
      allergies: '',
      currentMedications: '',
      medicalHistory: ''
    }
  });

  // Filters and search
  const [filters, setFilters] = useState({
    search: '',
    gender: 'ALL',
    ageRange: 'ALL',
    lastVisit: 'ALL',
    status: 'ALL',
    sortBy: 'name'
  });

  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [currentPage, setCurrentPage] = useState(1);
  const patientsPerPage = 12;

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [patients, filters]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await patientService.getDoctorPatients();
      setPatients(response.data || []);
    } catch (err) {
      setError('Failed to load patient records');
      console.error('Patients fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...patients];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(patient =>
        patient.firstName?.toLowerCase().includes(searchTerm) ||
        patient.lastName?.toLowerCase().includes(searchTerm) ||
        patient.email?.toLowerCase().includes(searchTerm) ||
        patient.phoneNumber?.includes(searchTerm)
      );
    }

    // Gender filter
    if (filters.gender !== 'ALL') {
      filtered = filtered.filter(patient => patient.gender === filters.gender);
    }

    // Age range filter
    if (filters.ageRange !== 'ALL') {
      filtered = filtered.filter(patient => {
        const age = calculateAge(patient.dateOfBirth);
        switch (filters.ageRange) {
          case 'CHILD': return age < 18;
          case 'ADULT': return age >= 18 && age < 65;
          case 'SENIOR': return age >= 65;
          default: return true;
        }
      });
    }

    // Last visit filter
    if (filters.lastVisit !== 'ALL') {
      const now = new Date();
      filtered = filtered.filter(patient => {
        if (!patient.lastVisit) return filters.lastVisit === 'NEVER';
        
        const lastVisit = new Date(patient.lastVisit);
        const daysDiff = Math.floor((now - lastVisit) / (1000 * 60 * 60 * 24));
        
        switch (filters.lastVisit) {
          case 'RECENT': return daysDiff <= 30;
          case 'MONTH': return daysDiff <= 90;
          case 'YEAR': return daysDiff <= 365;
          case 'OLD': return daysDiff > 365;
          default: return true;
        }
      });
    }

    // Status filter
    if (filters.status !== 'ALL') {
      filtered = filtered.filter(patient => patient.status === filters.status);
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        case 'age':
          return calculateAge(b.dateOfBirth) - calculateAge(a.dateOfBirth);
        case 'lastVisit':
          if (!a.lastVisit && !b.lastVisit) return 0;
          if (!a.lastVisit) return 1;
          if (!b.lastVisit) return -1;
          return new Date(b.lastVisit) - new Date(a.lastVisit);
        case 'appointments':
          return (b.totalAppointments || 0) - (a.totalAppointments || 0);
        default:
          return 0;
      }
    });

    setFilteredPatients(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 0;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleAddPatient = async () => {
    try {
      setError('');
      
      // Validate required fields
      const requiredFields = ['firstName', 'lastName', 'email', 'phoneNumber', 'dateOfBirth'];
      const missingFields = requiredFields.filter(field => !newPatient[field]);
      
      if (missingFields.length > 0) {
        setError(`Please fill in required fields: ${missingFields.join(', ')}`);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newPatient.email)) {
        setError('Please enter a valid email address');
        return;
      }

      await patientService.addPatient(newPatient);
      
      setSuccess('Patient added successfully!');
      setShowAddPatientModal(false);
      setNewPatient({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        emergencyContact: { name: '', relationship: '', phoneNumber: '' },
        insuranceInfo: { provider: '', policyNumber: '', groupNumber: '' },
        medicalInfo: { bloodType: '', allergies: '', currentMedications: '', medicalHistory: '' }
      });
      
      fetchPatients();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add patient');
    }
  };

  const handlePatientAction = async (action, patientId) => {
    try {
      switch (action) {
        case 'archive':
          await patientService.archivePatient(patientId);
          setSuccess('Patient archived successfully');
          break;
        case 'activate':
          await patientService.activatePatient(patientId);
          setSuccess('Patient activated successfully');
          break;
        case 'delete':
          await patientService.deletePatient(patientId);
          setSuccess('Patient deleted successfully');
          break;
        default:
          break;
      }
      
      fetchPatients();
      setShowConfirmModal(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(`Failed to ${action} patient`);
    }
  };

  const openConfirmModal = (action, patient) => {
    setConfirmAction({ action, patient });
    setShowConfirmModal(true);
  };

  const exportPatients = async () => {
    try {
      const response = await patientService.exportPatients();
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `patients-export-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      setSuccess('Patient records exported successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to export patient records');
    }
  };

  // Pagination
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  const renderPatientCard = (patient) => (
    <div key={patient.id} className="patient-card">
      <div className="patient-avatar">
        {patient.profileImage ? (
          <img src={patient.profileImage} alt="Patient" />
        ) : (
          <div className="avatar-placeholder">
            {patient.firstName?.[0]}{patient.lastName?.[0]}
          </div>
        )}
        <div className={`status-indicator ${patient.status?.toLowerCase()}`}>
          {patient.status === 'ACTIVE' && '🟢'}
          {patient.status === 'INACTIVE' && '🟡'}
          {patient.status === 'ARCHIVED' && '🔴'}
        </div>
      </div>
      
      <div className="patient-info">
        <h3>{patient.firstName} {patient.lastName}</h3>
        <p className="patient-details">
          {calculateAge(patient.dateOfBirth)} years • {patient.gender}
        </p>
        <p className="contact-info">
          📧 {patient.email}
        </p>
        <p className="contact-info">
          📞 {patient.phoneNumber}
        </p>
      </div>
      
      <div className="patient-stats">
        <div className="stat-item">
          <span className="stat-number">{patient.totalAppointments || 0}</span>
          <span className="stat-label">Appointments</span>
        </div>
        <div className="stat-item">
          <span className="stat-date">{formatDate(patient.lastVisit)}</span>
          <span className="stat-label">Last Visit</span>
        </div>
      </div>
      
      <div className="patient-actions">
        <button 
          className="btn-outline btn-sm"
          onClick={() => navigate(`/doctor/patients/${patient.id}/history`)}
        >
          📋 History
        </button>
        <button 
          className="btn-outline btn-sm"
          onClick={() => navigate(`/doctor/appointments/new?patientId=${patient.id}`)}
        >
          📅 Book
        </button>
        <button 
          className="btn-outline btn-sm"
          onClick={() => {
            setSelectedPatient(patient);
            setShowPatientModal(true);
          }}
        >
          👁️ View
        </button>
        
        <div className="more-actions">
          <button className="btn-more">⋮</button>
          <div className="actions-dropdown">
            <button onClick={() => navigate(`/doctor/prescriptions/new?patientId=${patient.id}`)}>
              💊 Prescribe
            </button>
            <button onClick={() => navigate(`/doctor/patients/${patient.id}/edit`)}>
              ✏️ Edit
            </button>
            {patient.status === 'ACTIVE' ? (
              <button 
                onClick={() => openConfirmModal('archive', patient)}
                className="text-warning"
              >
                📦 Archive
              </button>
            ) : (
              <button 
                onClick={() => openConfirmModal('activate', patient)}
                className="text-success"
              >
                ✅ Activate
              </button>
            )}
            <button 
              onClick={() => openConfirmModal('delete', patient)}
              className="text-danger"
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPatientRow = (patient) => (
    <tr key={patient.id} className="patient-row">
      <td>
        <div className="patient-cell">
          <div className="patient-avatar small">
            {patient.profileImage ? (
              <img src={patient.profileImage} alt="Patient" />
            ) : (
              <div className="avatar-placeholder">
                {patient.firstName?.[0]}{patient.lastName?.[0]}
              </div>
            )}
          </div>
          <div className="patient-name">
            <span className="name">{patient.firstName} {patient.lastName}</span>
            <span className={`status ${patient.status?.toLowerCase()}`}>
              {patient.status}
            </span>
          </div>
        </div>
      </td>
      <td>{calculateAge(patient.dateOfBirth)}</td>
      <td>{patient.gender}</td>
      <td>{patient.phoneNumber}</td>
      <td>{formatDate(patient.lastVisit)}</td>
      <td>{patient.totalAppointments || 0}</td>
      <td>
        <div className="row-actions">
          <button 
            className="btn-icon"
            onClick={() => navigate(`/doctor/patients/${patient.id}/history`)}
            title="View History"
          >
            📋
          </button>
          <button 
            className="btn-icon"
            onClick={() => navigate(`/doctor/appointments/new?patientId=${patient.id}`)}
            title="Book Appointment"
          >
            📅
          </button>
          <button 
            className="btn-icon"
            onClick={() => {
              setSelectedPatient(patient);
              setShowPatientModal(true);
            }}
            title="View Details"
          >
            👁️
          </button>
        </div>
      </td>
    </tr>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="patient-records">
      <div className="records-header">
        <div className="header-content">
          <h1>Patient Records</h1>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-number">{patients.length}</span>
              <span className="stat-label">Total Patients</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {patients.filter(p => p.status === 'ACTIVE').length}
              </span>
              <span className="stat-label">Active</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {patients.filter(p => {
                  const lastVisit = p.lastVisit ? new Date(p.lastVisit) : null;
                  const thirtyDaysAgo = new Date();
                  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                  return lastVisit && lastVisit >= thirtyDaysAgo;
                }).length}
              </span>
              <span className="stat-label">Recent Visits</span>
            </div>
          </div>
        </div>
        
        <div className="header-actions">
          <button 
            className="btn-outline"
            onClick={exportPatients}
          >
            📊 Export
          </button>
          <button 
            className="btn-primary"
            onClick={() => setShowAddPatientModal(true)}
          >
            👤 Add Patient
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span>{error}</span>
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {success && (
        <div className="success-message">
          <span>{success}</span>
          <button onClick={() => setSuccess('')}>×</button>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="records-controls">
        <div className="filters-row">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search patients..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>

          <select
            value={filters.gender}
            onChange={(e) => setFilters(prev => ({ ...prev, gender: e.target.value }))}
          >
            <option value="ALL">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <select
            value={filters.ageRange}
            onChange={(e) => setFilters(prev => ({ ...prev, ageRange: e.target.value }))}
          >
            <option value="ALL">All Ages</option>
            <option value="CHILD">Children (0-17)</option>
            <option value="ADULT">Adults (18-64)</option>
            <option value="SENIOR">Seniors (65+)</option>
          </select>

          <select
            value={filters.lastVisit}
            onChange={(e) => setFilters(prev => ({ ...prev, lastVisit: e.target.value }))}
          >
            <option value="ALL">All Visits</option>
            <option value="RECENT">Last 30 days</option>
            <option value="MONTH">Last 3 months</option>
            <option value="YEAR">Last year</option>
            <option value="OLD">Over a year ago</option>
            <option value="NEVER">Never visited</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          <select
            value={filters.sortBy}
            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
          >
            <option value="name">Sort by Name</option>
            <option value="age">Sort by Age</option>
            <option value="lastVisit">Sort by Last Visit</option>
            <option value="appointments">Sort by Appointments</option>
          </select>
        </div>

        <div className="view-controls">
          <div className="view-mode-toggle">
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              🔲 Grid
            </button>
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              📋 List
            </button>
          </div>
          
          <span className="results-count">
            {filteredPatients.length} patients found
          </span>
        </div>
      </div>

      {/* Patient List */}
      <div className="patients-container">
        {viewMode === 'grid' ? (
          <div className="patients-grid">
            {currentPatients.length > 0 ? (
              currentPatients.map(renderPatientCard)
            ) : (
              <div className="empty-state">
                <div className="empty-icon">👥</div>
                <h3>No patients found</h3>
                <p>
                  {filters.search || filters.gender !== 'ALL' || filters.ageRange !== 'ALL'
                    ? 'No patients match your current filters'
                    : 'No patients have been added yet'
                  }
                </p>
                {!filters.search && filters.gender === 'ALL' && filters.ageRange === 'ALL' && (
                  <button 
                    className="btn-primary"
                    onClick={() => setShowAddPatientModal(true)}
                  >
                    Add Your First Patient
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="patients-table-container">
            <table className="patients-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Phone</th>
                  <th>Last Visit</th>
                  <th>Appointments</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentPatients.length > 0 ? (
                  currentPatients.map(renderPatientRow)
                ) : (
                  <tr>
                    <td colSpan="7" className="empty-row">
                      <div className="empty-state">
                        <p>No patients found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            className="page-btn"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            ← Previous
          </button>
          
          <div className="page-numbers">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                className={`page-number ${currentPage === index + 1 ? 'active' : ''}`}
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </button>
            ))}
          </div>
          
          <button 
            className="page-btn"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next →
          </button>
        </div>
      )}

      {/* Patient Details Modal */}
      {showPatientModal && selectedPatient && (
        <Modal onClose={() => setShowPatientModal(false)} size="large">
          <div className="patient-details-modal">
            <div className="modal-header">
              <h3>{selectedPatient.firstName} {selectedPatient.lastName}</h3>
              <div className="patient-meta">
                <span className="age">{calculateAge(selectedPatient.dateOfBirth)} years old</span>
                <span className={`status ${selectedPatient.status?.toLowerCase()}`}>
                  {selectedPatient.status}
                </span>
              </div>
            </div>

            <div className="modal-content">
              <div className="details-grid">
                <div className="detail-section">
                  <h4>Contact Information</h4>
                  <div className="detail-item">
                    <label>Email:</label>
                    <span>{selectedPatient.email}</span>
                  </div>
                  <div className="detail-item">
                    <label>Phone:</label>
                    <span>{selectedPatient.phoneNumber}</span>
                  </div>
                  <div className="detail-item">
                    <label>Address:</label>
                    <span>
                      {selectedPatient.address ? 
                        `${selectedPatient.address}, ${selectedPatient.city}, ${selectedPatient.state} ${selectedPatient.postalCode}` : 
                        'Not provided'
                      }
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Medical Information</h4>
                  <div className="detail-item">
                    <label>Date of Birth:</label>
                    <span>{formatDate(selectedPatient.dateOfBirth)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Gender:</label>
                    <span>{selectedPatient.gender}</span>
                  </div>
                  <div className="detail-item">
                    <label>Blood Type:</label>
                    <span>{selectedPatient.bloodType || 'Unknown'}</span>
                  </div>
                </div>

                {selectedPatient.emergencyContact && (
                  <div className="detail-section">
                    <h4>Emergency Contact</h4>
                    <div className="detail-item">
                      <label>Name:</label>
                      <span>{selectedPatient.emergencyContact.name}</span>
                    </div>
                    <div className="detail-item">
                      <label>Relationship:</label>
                      <span>{selectedPatient.emergencyContact.relationship}</span>
                    </div>
                    <div className="detail-item">
                      <label>Phone:</label>
                      <span>{selectedPatient.emergencyContact.phoneNumber}</span>
                    </div>
                  </div>
                )}

                {selectedPatient.insuranceInfo && (
                  <div className="detail-section">
                    <h4>Insurance Information</h4>
                    <div className="detail-item">
                      <label>Provider:</label>
                      <span>{selectedPatient.insuranceInfo.provider}</span>
                    </div>
                    <div className="detail-item">
                      <label>Policy Number:</label>
                      <span>{selectedPatient.insuranceInfo.policyNumber}</span>
                    </div>
                    <div className="detail-item">
                      <label>Group Number:</label>
                      <span>{selectedPatient.insuranceInfo.groupNumber}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => setShowPatientModal(false)}
              >
                Close
              </button>
              <button 
                className="btn-outline"
                onClick={() => navigate(`/doctor/patients/${selectedPatient.id}/edit`)}
              >
                Edit Patient
              </button>
              <button 
                className="btn-primary"
                onClick={() => navigate(`/doctor/patients/${selectedPatient.id}/history`)}
              >
                View Full History
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Patient Modal */}
      {showAddPatientModal && (
        <Modal onClose={() => setShowAddPatientModal(false)} size="large">
          <div className="add-patient-modal">
            <h3>Add New Patient</h3>
            
            <form className="patient-form">
              <div className="form-section">
                <h4>Basic Information</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>First Name *</label>
                    <input
                      type="text"
                      value={newPatient.firstName}
                      onChange={(e) => setNewPatient(prev => ({ ...prev, firstName: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name *</label>
                    <input
                      type="text"
                      value={newPatient.lastName}
                      onChange={(e) => setNewPatient(prev => ({ ...prev, lastName: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      value={newPatient.email}
                      onChange={(e) => setNewPatient(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      value={newPatient.phoneNumber}
                      onChange={(e) => setNewPatient(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Date of Birth *</label>
                    <input
                      type="date"
                      value={newPatient.dateOfBirth}
                      onChange={(e) => setNewPatient(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Gender</label>
                    <select
                      value={newPatient.gender}
                      onChange={(e) => setNewPatient(prev => ({ ...prev, gender: e.target.value }))}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4>Address Information</h4>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Address</label>
                    <input
                      type="text"
                      value={newPatient.address}
                      onChange={(e) => setNewPatient(prev => ({ ...prev, address: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      value={newPatient.city}
                      onChange={(e) => setNewPatient(prev => ({ ...prev, city: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input
                      type="text"
                      value={newPatient.state}
                      onChange={(e) => setNewPatient(prev => ({ ...prev, state: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Postal Code</label>
                    <input
                      type="text"
                      value={newPatient.postalCode}
                      onChange={(e) => setNewPatient(prev => ({ ...prev, postalCode: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4>Emergency Contact</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Contact Name</label>
                    <input
                      type="text"
                      value={newPatient.emergencyContact.name}
                      onChange={(e) => setNewPatient(prev => ({ 
                        ...prev, 
                        emergencyContact: { ...prev.emergencyContact, name: e.target.value }
                      }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Relationship</label>
                    <input
                      type="text"
                      value={newPatient.emergencyContact.relationship}
                      onChange={(e) => setNewPatient(prev => ({ 
                        ...prev, 
                        emergencyContact: { ...prev.emergencyContact, relationship: e.target.value }
                      }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      value={newPatient.emergencyContact.phoneNumber}
                      onChange={(e) => setNewPatient(prev => ({ 
                        ...prev, 
                        emergencyContact: { ...prev.emergencyContact, phoneNumber: e.target.value }
                      }))}
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4>Medical Information</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Blood Type</label>
                    <select
                      value={newPatient.medicalInfo.bloodType}
                      onChange={(e) => setNewPatient(prev => ({ 
                        ...prev, 
                        medicalInfo: { ...prev.medicalInfo, bloodType: e.target.value }
                      }))}
                    >
                      <option value="">Select Blood Type</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                  <div className="form-group full-width">
                    <label>Known Allergies</label>
                    <textarea
                      value={newPatient.medicalInfo.allergies}
                      onChange={(e) => setNewPatient(prev => ({ 
                        ...prev, 
                        medicalInfo: { ...prev.medicalInfo, allergies: e.target.value }
                      }))}
                      rows="2"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Current Medications</label>
                    <textarea
                      value={newPatient.medicalInfo.currentMedications}
                      onChange={(e) => setNewPatient(prev => ({ 
                        ...prev, 
                        medicalInfo: { ...prev.medicalInfo, currentMedications: e.target.value }
                      }))}
                      rows="2"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Medical History</label>
                    <textarea
                      value={newPatient.medicalInfo.medicalHistory}
                      onChange={(e) => setNewPatient(prev => ({ 
                        ...prev, 
                        medicalInfo: { ...prev.medicalInfo, medicalHistory: e.target.value }
                      }))}
                      rows="3"
                    />
                  </div>
                </div>
              </div>
            </form>

            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => setShowAddPatientModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={handleAddPatient}
              >
                Add Patient
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm Action Modal */}
      {showConfirmModal && confirmAction && (
        <Modal onClose={() => setShowConfirmModal(false)}>
          <div className="confirm-modal">
            <h3>Confirm Action</h3>
            <p>
              Are you sure you want to {confirmAction.action} patient{' '}
              <strong>{confirmAction.patient.firstName} {confirmAction.patient.lastName}</strong>?
            </p>
            
            {confirmAction.action === 'delete' && (
              <div className="warning-text">
                ⚠️ This action cannot be undone. All patient records will be permanently deleted.
              </div>
            )}

            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
              <button 
                className={`btn-${confirmAction.action === 'delete' ? 'danger' : 'primary'}`}
                onClick={() => handlePatientAction(confirmAction.action, confirmAction.patient.id)}
              >
                {confirmAction.action === 'delete' ? 'Delete' : 'Confirm'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PatientRecords;