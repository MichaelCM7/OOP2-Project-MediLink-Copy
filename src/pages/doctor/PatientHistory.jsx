import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { patientService } from '../../services/patientService';
import { appointmentService } from '../../services/appointmentService';
import { prescriptionService } from '../../services/prescriptionService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import './PatientHistory.css';

const PatientHistory = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [patientData, setPatientData] = useState({
    patient: null,
    medicalHistory: [],
    appointments: [],
    prescriptions: [],
    labResults: [],
    vitals: [],
    allergies: [],
    medications: [],
    familyHistory: [],
    socialHistory: {},
    immunizations: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    dateRange: 'ALL',
    recordType: 'ALL',
    search: ''
  });

  useEffect(() => {
    if (patientId) {
      fetchPatientHistory();
    }
  }, [patientId]);

  const fetchPatientHistory = async () => {
    try {
      setLoading(true);
      const [
        patientResponse,
        historyResponse,
        appointmentsResponse,
        prescriptionsResponse,
        labResultsResponse,
        vitalsResponse
      ] = await Promise.all([
        patientService.getPatientProfile(patientId),
        patientService.getMedicalHistory(patientId),
        appointmentService.getPatientAppointments(patientId),
        prescriptionService.getPatientPrescriptions(patientId),
        patientService.getLabResults(patientId),
        patientService.getVitals(patientId)
      ]);

      setPatientData({
        patient: patientResponse.data,
        medicalHistory: historyResponse.data.medicalHistory || [],
        appointments: appointmentsResponse.data || [],
        prescriptions: prescriptionsResponse.data || [],
        labResults: labResultsResponse.data || [],
        vitals: vitalsResponse.data || [],
        allergies: historyResponse.data.allergies || [],
        medications: historyResponse.data.currentMedications || [],
        familyHistory: historyResponse.data.familyHistory || [],
        socialHistory: historyResponse.data.socialHistory || {},
        immunizations: historyResponse.data.immunizations || []
      });
    } catch (err) {
      setError('Failed to load patient history');
      console.error('Patient history fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    try {
      setAddingNote(true);
      setError('');

      await patientService.addMedicalNote(patientId, {
        note: newNote.trim(),
        doctorId: user.id,
        type: 'GENERAL_NOTE'
      });

      setSuccess('Medical note added successfully!');
      setShowAddNoteModal(false);
      setNewNote('');
      
      // Refresh history
      fetchPatientHistory();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to add medical note');
    } finally {
      setAddingNote(false);
    }
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
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
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getVitalStatus = (vital, value) => {
    const ranges = {
      systolicBP: { normal: [90, 120], warning: [120, 140], critical: [140, 180] },
      diastolicBP: { normal: [60, 80], warning: [80, 90], critical: [90, 120] },
      heartRate: { normal: [60, 100], warning: [100, 120], critical: [120, 150] },
      temperature: { normal: [97.8, 99.1], warning: [99.1, 100.4], critical: [100.4, 103] },
      oxygenSaturation: { normal: [95, 100], warning: [90, 95], critical: [0, 90] }
    };

    const range = ranges[vital];
    if (!range || !value) return 'normal';

    if (value >= range.normal[0] && value <= range.normal[1]) return 'normal';
    if (value >= range.warning[0] && value <= range.warning[1]) return 'warning';
    return 'critical';
  };

  const renderOverview = () => (
    <div className="overview-content">
      {/* Patient Summary */}
      <div className="patient-summary">
        <div className="summary-card patient-info">
          <h3>Patient Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Full Name:</label>
              <span>{patientData.patient?.firstName} {patientData.patient?.lastName}</span>
            </div>
            <div className="info-item">
              <label>Age:</label>
              <span>{calculateAge(patientData.patient?.dateOfBirth)} years</span>
            </div>
            <div className="info-item">
              <label>Gender:</label>
              <span>{patientData.patient?.gender || 'Not specified'}</span>
            </div>
            <div className="info-item">
              <label>Blood Type:</label>
              <span>{patientData.patient?.bloodType || 'Unknown'}</span>
            </div>
            <div className="info-item">
              <label>Phone:</label>
              <span>{patientData.patient?.phoneNumber}</span>
            </div>
            <div className="info-item">
              <label>Email:</label>
              <span>{patientData.patient?.email}</span>
            </div>
          </div>
        </div>

        <div className="summary-card recent-activity">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            <div className="activity-item">
              <span className="activity-icon">📅</span>
              <div className="activity-details">
                <p>Last Appointment</p>
                <span>{patientData.appointments[0] ? formatDate(patientData.appointments[0].appointmentDate) : 'No appointments'}</span>
              </div>
            </div>
            <div className="activity-item">
              <span className="activity-icon">💊</span>
              <div className="activity-details">
                <p>Last Prescription</p>
                <span>{patientData.prescriptions[0] ? formatDate(patientData.prescriptions[0].prescribedDate) : 'No prescriptions'}</span>
              </div>
            </div>
            <div className="activity-item">
              <span className="activity-icon">🔬</span>
              <div className="activity-details">
                <p>Last Lab Result</p>
                <span>{patientData.labResults[0] ? formatDate(patientData.labResults[0].testDate) : 'No lab results'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Information */}
      {(patientData.allergies.length > 0 || patientData.medications.length > 0) && (
        <div className="critical-info">
          {patientData.allergies.length > 0 && (
            <div className="alert-card allergies">
              <h3>⚠️ Allergies</h3>
              <div className="allergies-list">
                {patientData.allergies.map((allergy, index) => (
                  <div key={index} className="allergy-item">
                    <span className="allergy-name">{allergy.allergen}</span>
                    <span className={`severity ${allergy.severity?.toLowerCase()}`}>
                      {allergy.severity}
                    </span>
                    {allergy.reaction && (
                      <span className="reaction">Reaction: {allergy.reaction}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {patientData.medications.length > 0 && (
            <div className="alert-card medications">
              <h3>💊 Current Medications</h3>
              <div className="medications-list">
                {patientData.medications.slice(0, 5).map((medication, index) => (
                  <div key={index} className="medication-item">
                    <span className="medication-name">{medication.name}</span>
                    <span className="dosage">{medication.dosage}</span>
                    <span className="frequency">{medication.frequency}</span>
                  </div>
                ))}
                {patientData.medications.length > 5 && (
                  <button 
                    className="btn-text"
                    onClick={() => setActiveTab('medications')}
                  >
                    +{patientData.medications.length - 5} more medications
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Latest Vitals */}
      {patientData.vitals.length > 0 && (
        <div className="latest-vitals">
          <h3>Latest Vitals</h3>
          <div className="vitals-grid">
            {patientData.vitals[0] && Object.entries(patientData.vitals[0].measurements || {}).map(([vital, value]) => (
              <div key={vital} className={`vital-card ${getVitalStatus(vital, value)}`}>
                <span className="vital-name">{vital.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                <span className="vital-value">{value}</span>
                <span className="vital-unit">{getVitalUnit(vital)}</span>
              </div>
            ))}
          </div>
          <span className="vitals-date">
            Recorded: {formatDateTime(patientData.vitals[0]?.recordedAt)}
          </span>
        </div>
      )}
    </div>
  );

  const renderMedicalHistory = () => (
    <div className="medical-history-content">
      <div className="history-header">
        <h3>Medical History</h3>
        <button 
          className="btn-primary"
          onClick={() => setShowAddNoteModal(true)}
        >
          + Add Note
        </button>
      </div>

      <div className="history-timeline">
        {patientData.medicalHistory.length > 0 ? (
          patientData.medicalHistory.map((record, index) => (
            <div key={index} className="timeline-item">
              <div className="timeline-marker">
                <span className={`marker-icon ${record.type?.toLowerCase()}`}>
                  {getRecordIcon(record.type)}
                </span>
              </div>
              
              <div className="timeline-content">
                <div className="record-header">
                  <h4>{record.title || record.type}</h4>
                  <span className="record-date">{formatDate(record.date)}</span>
                </div>
                
                <p className="record-description">{record.description}</p>
                
                {record.doctorName && (
                  <span className="record-doctor">Dr. {record.doctorName}</span>
                )}
                
                {record.attachments && record.attachments.length > 0 && (
                  <div className="record-attachments">
                    {record.attachments.map((attachment, idx) => (
                      <button key={idx} className="attachment-btn">
                        📎 {attachment.name}
                      </button>
                    ))}
                  </div>
                )}
                
                <button 
                  className="btn-text view-details"
                  onClick={() => {
                    setSelectedRecord(record);
                    setShowRecordModal(true);
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No medical history recorded</h3>
            <p>Medical history will appear here as it's added</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderAppointments = () => (
    <div className="appointments-content">
      <h3>Appointment History</h3>
      
      <div className="appointments-list">
        {patientData.appointments.length > 0 ? (
          patientData.appointments.map((appointment, index) => (
            <div key={index} className="appointment-record">
              <div className="appointment-header">
                <div className="appointment-date">
                  <span className="date">{formatDate(appointment.appointmentDate)}</span>
                  <span className="time">{appointment.appointmentTime}</span>
                </div>
                <span className={`status ${appointment.status?.toLowerCase()}`}>
                  {appointment.status}
                </span>
              </div>
              
              <div className="appointment-details">
                <h4>{appointment.type || 'General Consultation'}</h4>
                {appointment.chiefComplaint && (
                  <p className="chief-complaint">
                    <strong>Chief Complaint:</strong> {appointment.chiefComplaint}
                  </p>
                )}
                {appointment.diagnosis && (
                  <p className="diagnosis">
                    <strong>Diagnosis:</strong> {appointment.diagnosis}
                  </p>
                )}
                {appointment.treatmentPlan && (
                  <p className="treatment">
                    <strong>Treatment:</strong> {appointment.treatmentPlan}
                  </p>
                )}
                {appointment.notes && (
                  <p className="notes">
                    <strong>Notes:</strong> {appointment.notes}
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h3>No appointment history</h3>
            <p>Previous appointments will be listed here</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderPrescriptions = () => (
    <div className="prescriptions-content">
      <h3>Prescription History</h3>
      
      <div className="prescriptions-list">
        {patientData.prescriptions.length > 0 ? (
          patientData.prescriptions.map((prescription, index) => (
            <div key={index} className="prescription-record">
              <div className="prescription-header">
                <span className="prescription-date">{formatDate(prescription.prescribedDate)}</span>
                <span className={`status ${prescription.status?.toLowerCase()}`}>
                  {prescription.status}
                </span>
              </div>
              
              <div className="prescription-details">
                <div className="medications-prescribed">
                  {prescription.medications?.map((med, idx) => (
                    <div key={idx} className="medication-prescribed">
                      <h4>{med.name}</h4>
                      <div className="med-details">
                        <span className="dosage">Dosage: {med.dosage}</span>
                        <span className="frequency">Frequency: {med.frequency}</span>
                        <span className="duration">Duration: {med.duration}</span>
                      </div>
                      {med.instructions && (
                        <p className="instructions">
                          <strong>Instructions:</strong> {med.instructions}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                
                {prescription.notes && (
                  <p className="prescription-notes">
                    <strong>Notes:</strong> {prescription.notes}
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon">💊</div>
            <h3>No prescription history</h3>
            <p>Prescribed medications will be listed here</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderLabResults = () => (
    <div className="lab-results-content">
      <h3>Laboratory Results</h3>
      
      <div className="lab-results-list">
        {patientData.labResults.length > 0 ? (
          patientData.labResults.map((result, index) => (
            <div key={index} className="lab-result-record">
              <div className="lab-result-header">
                <h4>{result.testName}</h4>
                <span className="test-date">{formatDate(result.testDate)}</span>
              </div>
              
              <div className="lab-result-details">
                <div className="results-grid">
                  {result.results?.map((item, idx) => (
                    <div key={idx} className={`result-item ${item.status?.toLowerCase()}`}>
                      <span className="test-parameter">{item.parameter}</span>
                      <span className="test-value">{item.value} {item.unit}</span>
                      <span className="reference-range">
                        Ref: {item.referenceRange}
                      </span>
                      {item.status && item.status !== 'NORMAL' && (
                        <span className={`status-flag ${item.status.toLowerCase()}`}>
                          {item.status}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                
                {result.interpretation && (
                  <p className="lab-interpretation">
                    <strong>Interpretation:</strong> {result.interpretation}
                  </p>
                )}
                
                {result.notes && (
                  <p className="lab-notes">
                    <strong>Notes:</strong> {result.notes}
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🔬</div>
            <h3>No lab results</h3>
            <p>Laboratory test results will appear here</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderVitals = () => (
    <div className="vitals-content">
      <h3>Vital Signs History</h3>
      
      <div className="vitals-history">
        {patientData.vitals.length > 0 ? (
          patientData.vitals.map((vital, index) => (
            <div key={index} className="vital-record">
              <div className="vital-header">
                <span className="vital-date">{formatDateTime(vital.recordedAt)}</span>
                <span className="recorded-by">Recorded by: {vital.recordedBy || 'N/A'}</span>
              </div>
              
              <div className="vital-measurements">
                {Object.entries(vital.measurements || {}).map(([measurement, value]) => (
                  <div key={measurement} className={`measurement ${getVitalStatus(measurement, value)}`}>
                    <span className="measurement-name">
                      {measurement.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                    <span className="measurement-value">
                      {value} {getVitalUnit(measurement)}
                    </span>
                  </div>
                ))}
              </div>
              
              {vital.notes && (
                <p className="vital-notes">
                  <strong>Notes:</strong> {vital.notes}
                </p>
              )}
            </div>
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>No vital signs recorded</h3>
            <p>Vital signs measurements will be displayed here</p>
          </div>
        )}
      </div>
    </div>
  );

  const getRecordIcon = (type) => {
    const icons = {
      DIAGNOSIS: '🔍',
      PROCEDURE: '⚕️',
      SURGERY: '🏥',
      MEDICATION: '💊',
      ALLERGY: '⚠️',
      VACCINATION: '💉',
      NOTE: '📝',
      default: '📋'
    };
    return icons[type] || icons.default;
  };

  const getVitalUnit = (vital) => {
    const units = {
      systolicBP: 'mmHg',
      diastolicBP: 'mmHg',
      heartRate: 'bpm',
      temperature: '°F',
      oxygenSaturation: '%',
      weight: 'lbs',
      height: 'in',
      respiratoryRate: '/min'
    };
    return units[vital] || '';
  };

  if (loading) return <LoadingSpinner />;

  if (!patientData.patient) {
    return (
      <div className="patient-history">
        <div className="error-state">
          <h2>Patient not found</h2>
          <p>The requested patient record could not be found.</p>
          <button 
            className="btn-primary"
            onClick={() => navigate('/doctor/patients')}
          >
            Back to Patients
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-history">
      <div className="history-header">
        <div className="header-content">
          <button 
            className="back-btn"
            onClick={() => navigate('/doctor/patients')}
          >
            ← Back to Patients
          </button>
          
          <div className="patient-title">
            <div className="patient-avatar">
              {patientData.patient.profileImage ? (
                <img src={patientData.patient.profileImage} alt="Patient" />
              ) : (
                <div className="avatar-placeholder">
                  {patientData.patient.firstName?.[0]}{patientData.patient.lastName?.[0]}
                </div>
              )}
            </div>
            <div className="patient-info">
              <h1>{patientData.patient.firstName} {patientData.patient.lastName}</h1>
              <p>{calculateAge(patientData.patient.dateOfBirth)} years old • {patientData.patient.gender}</p>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <button 
            className="btn-outline"
            onClick={() => navigate(`/doctor/appointments/new?patientId=${patientId}`)}
          >
            📅 New Appointment
          </button>
          <button 
            className="btn-outline"
            onClick={() => navigate(`/doctor/prescriptions/new?patientId=${patientId}`)}
          >
            💊 New Prescription
          </button>
          <button 
            className="btn-primary"
            onClick={() => setShowAddNoteModal(true)}
          >
            📝 Add Note
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

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📋 Medical History
        </button>
        <button 
          className={`tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
          onClick={() => setActiveTab('appointments')}
        >
          📅 Appointments ({patientData.appointments.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'prescriptions' ? 'active' : ''}`}
          onClick={() => setActiveTab('prescriptions')}
        >
          💊 Prescriptions ({patientData.prescriptions.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'labs' ? 'active' : ''}`}
          onClick={() => setActiveTab('labs')}
        >
          🔬 Lab Results ({patientData.labResults.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'vitals' ? 'active' : ''}`}
          onClick={() => setActiveTab('vitals')}
        >
          📊 Vitals ({patientData.vitals.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'history' && renderMedicalHistory()}
        {activeTab === 'appointments' && renderAppointments()}
        {activeTab === 'prescriptions' && renderPrescriptions()}
        {activeTab === 'labs' && renderLabResults()}
        {activeTab === 'vitals' && renderVitals()}
      </div>

      {/* Record Details Modal */}
      {showRecordModal && selectedRecord && (
        <Modal onClose={() => setShowRecordModal(false)} size="large">
          <div className="record-details-modal">
            <h3>{selectedRecord.title || selectedRecord.type}</h3>
            
            <div className="record-meta">
              <span className="record-date">{formatDate(selectedRecord.date)}</span>
              {selectedRecord.doctorName && (
                <span className="record-doctor">Dr. {selectedRecord.doctorName}</span>
              )}
            </div>
            
            <div className="record-content">
              <p>{selectedRecord.description}</p>
              
              {selectedRecord.details && (
                <div className="additional-details">
                  <h4>Additional Details:</h4>
                  <pre>{JSON.stringify(selectedRecord.details, null, 2)}</pre>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => setShowRecordModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Note Modal */}
      {showAddNoteModal && (
        <Modal onClose={() => setShowAddNoteModal(false)}>
          <div className="add-note-modal">
            <h3>Add Medical Note</h3>
            
            <div className="form-group">
              <label>Medical Note</label>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Enter medical note or observation..."
                rows="6"
              />
            </div>

            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => setShowAddNoteModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={handleAddNote}
                disabled={addingNote || !newNote.trim()}
              >
                {addingNote ? 'Adding...' : 'Add Note'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PatientHistory;