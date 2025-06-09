import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useLocation } from '../../hooks/useLocation';
import { emergencyService } from '../../services/emergencyService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './EmergencyForm.css';

const EmergencyForm = ({ onSubmit, onCancel, initialData = {} }) => {
  const { user } = useAuth();
  const { getCurrentLocation, watchLocation } = useLocation();
  
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phoneNumber: user?.phoneNumber || '',
    email: user?.email || '',
    dateOfBirth: user?.dateOfBirth || '',
    
    // Emergency Details
    emergencyType: '',
    description: '',
    severity: 'MEDIUM',
    symptoms: [],
    duration: '',
    consciousness: 'CONSCIOUS',
    breathing: 'NORMAL',
    bleeding: 'NONE',
    
    // Location Information
    location: null,
    locationDescription: '',
    
    // Medical Information
    allergies: [],
    medications: [],
    medicalConditions: [],
    
    // Contact Information
    emergencyContact: {
      name: '',
      relationship: '',
      phoneNumber: ''
    },
    
    // Additional Information
    additionalInfo: '',
    requestAmbulance: false,
    
    ...initialData
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationWatcher, setLocationWatcher] = useState(null);

  const emergencyTypes = [
    { value: 'MEDICAL', label: 'Medical Emergency', icon: '🏥' },
    { value: 'CARDIAC', label: 'Heart Attack / Cardiac', icon: '💓' },
    { value: 'STROKE', label: 'Stroke / Neurological', icon: '🧠' },
    { value: 'BREATHING', label: 'Breathing Problems', icon: '🫁' },
    { value: 'TRAUMA', label: 'Injury / Trauma', icon: '🩹' },
    { value: 'OVERDOSE', label: 'Poisoning / Overdose', icon: '💊' },
    { value: 'BURN', label: 'Burns', icon: '🔥' },
    { value: 'ALLERGIC', label: 'Allergic Reaction', icon: '⚠️' },
    { value: 'MENTAL', label: 'Mental Health Crisis', icon: '🧠' },
    { value: 'OTHER', label: 'Other Emergency', icon: '🚨' }
  ];

  const commonSymptoms = [
    'Chest pain', 'Difficulty breathing', 'Severe headache', 'Dizziness',
    'Nausea/Vomiting', 'Severe pain', 'Confusion', 'Loss of consciousness',
    'Bleeding', 'Numbness', 'Weakness', 'Fever', 'Seizure', 'Allergic reaction'
  ];

  const severityLevels = [
    { value: 'CRITICAL', label: 'Critical', color: '#ff0000', description: 'Life-threatening' },
    { value: 'HIGH', label: 'High', color: '#ff6b35', description: 'Urgent care needed' },
    { value: 'MEDIUM', label: 'Medium', color: '#f7931e', description: 'Prompt attention' },
    { value: 'LOW', label: 'Low', color: '#4dabf7', description: 'Non-urgent' }
  ];

  useEffect(() => {
    // Get initial location
    getCurrentLocation()
      .then(location => {
        setFormData(prev => ({ ...prev, location }));
      })
      .catch(err => {
        console.warn('Could not get initial location:', err);
      });

    return () => {
      if (locationWatcher) {
        locationWatcher.clearWatch();
      }
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      // Handle nested objects like emergencyContact.name
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Clear errors when user makes changes
    if (error) {
      setError('');
    }
  };

  const handleArrayChange = (field, value, isChecked) => {
    setFormData(prev => ({
      ...prev,
      [field]: isChecked 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  const handleLocationUpdate = async () => {
    setLocationLoading(true);
    try {
      const location = await getCurrentLocation();
      setFormData(prev => ({ ...prev, location }));
      setSuccess('Location updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Could not get current location. Please enter manually.');
    } finally {
      setLocationLoading(false);
    }
  };

  const validateStep = (step) => {
    const errors = [];

    switch (step) {
      case 1:
        if (!formData.emergencyType) errors.push('Emergency type is required');
        if (!formData.description.trim()) errors.push('Description is required');
        if (!formData.severity) errors.push('Severity level is required');
        break;
      
      case 2:
        if (!user) {
          if (!formData.firstName.trim()) errors.push('First name is required');
          if (!formData.lastName.trim()) errors.push('Last name is required');
          if (!formData.phoneNumber.trim()) errors.push('Phone number is required');
        }
        break;
      
      case 3:
        // Location is optional but recommended
        break;
    }

    return errors;
  };

  const handleNextStep = () => {
    const errors = validateStep(currentStep);
    if (errors.length > 0) {
      setError(errors.join(', '));
      return;
    }

    setError('');
    setCurrentStep(currentStep + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateStep(currentStep);
    if (errors.length > 0) {
      setError(errors.join(', '));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const emergencyData = {
        ...formData,
        userId: user?.id || null,
        timestamp: new Date().toISOString(),
        status: 'ACTIVE'
      };

      const response = await emergencyService.submitEmergencyForm(emergencyData);
      
      setSuccess('Emergency alert submitted successfully! Help is on the way.');
      
      if (onSubmit) {
        onSubmit(response.data);
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit emergency form. Please try again.');
      console.error('Emergency form submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderEmergencyDetails = () => (
    <div className="form-step emergency-details">
      <div className="step-header">
        <h3>Emergency Details</h3>
        <p>Tell us what's happening so we can send the right help</p>
      </div>

      <div className="emergency-types">
        <label className="field-label">Type of Emergency *</label>
        <div className="emergency-type-grid">
          {emergencyTypes.map(type => (
            <button
              key={type.value}
              type="button"
              className={`emergency-type-btn ${formData.emergencyType === type.value ? 'selected' : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, emergencyType: type.value }))}
            >
              <span className="type-icon">{type.icon}</span>
              <span className="type-label">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="description">What's happening? *</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Describe the emergency situation in detail..."
          rows="4"
          required
        />
      </div>

      <div className="severity-selector">
        <label className="field-label">Severity Level *</label>
        <div className="severity-options">
          {severityLevels.map(level => (
            <button
              key={level.value}
              type="button"
              className={`severity-btn ${formData.severity === level.value ? 'selected' : ''}`}
              style={{ '--severity-color': level.color }}
              onClick={() => setFormData(prev => ({ ...prev, severity: level.value }))}
            >
              <div className="severity-indicator"></div>
              <div className="severity-content">
                <span className="severity-label">{level.label}</span>
                <span className="severity-desc">{level.description}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="symptoms-section">
        <label className="field-label">Symptoms (select all that apply)</label>
        <div className="symptoms-grid">
          {commonSymptoms.map(symptom => (
            <label key={symptom} className="symptom-checkbox">
              <input
                type="checkbox"
                checked={formData.symptoms.includes(symptom)}
                onChange={(e) => handleArrayChange('symptoms', symptom, e.target.checked)}
              />
              <span className="checkbox-custom"></span>
              <span>{symptom}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="duration">How long has this been happening?</label>
          <select
            id="duration"
            name="duration"
            value={formData.duration}
            onChange={handleInputChange}
          >
            <option value="">Select duration</option>
            <option value="JUST_NOW">Just now</option>
            <option value="MINUTES">A few minutes</option>
            <option value="HOUR">About an hour</option>
            <option value="HOURS">Several hours</option>
            <option value="DAYS">Days</option>
            <option value="ONGOING">Ongoing condition</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="consciousness">Consciousness Level</label>
          <select
            id="consciousness"
            name="consciousness"
            value={formData.consciousness}
            onChange={handleInputChange}
          >
            <option value="CONSCIOUS">Fully conscious</option>
            <option value="DROWSY">Drowsy/Confused</option>
            <option value="UNCONSCIOUS">Unconscious</option>
            <option value="RESPONSIVE">Responsive to voice</option>
            <option value="UNRESPONSIVE">Unresponsive</option>
          </select>
        </div>
      </div>

      <div className="vital-signs">
        <div className="form-group">
          <label htmlFor="breathing">Breathing</label>
          <select
            id="breathing"
            name="breathing"
            value={formData.breathing}
            onChange={handleInputChange}
          >
            <option value="NORMAL">Normal</option>
            <option value="DIFFICULTY">Difficulty breathing</option>
            <option value="RAPID">Rapid breathing</option>
            <option value="SLOW">Slow breathing</option>
            <option value="NONE">Not breathing</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="bleeding">Bleeding</label>
          <select
            id="bleeding"
            name="bleeding"
            value={formData.bleeding}
            onChange={handleInputChange}
          >
            <option value="NONE">No bleeding</option>
            <option value="MINOR">Minor bleeding</option>
            <option value="MODERATE">Moderate bleeding</option>
            <option value="SEVERE">Severe bleeding</option>
            <option value="INTERNAL">Suspected internal bleeding</option>
          </select>
        </div>
      </div>

      <div className="ambulance-request">
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="requestAmbulance"
            checked={formData.requestAmbulance}
            onChange={handleInputChange}
          />
          <span className="checkbox-custom"></span>
          <span>Request ambulance transportation</span>
        </label>
      </div>
    </div>
  );

  const renderPersonalInfo = () => (
    <div className="form-step personal-info">
      <div className="step-header">
        <h3>Personal Information</h3>
        <p>Help emergency responders identify and contact you</p>
      </div>

      {user ? (
        <div className="user-info-display">
          <div className="user-avatar">
            {user.profileImage ? (
              <img src={user.profileImage} alt="Profile" />
            ) : (
              <div className="avatar-placeholder">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </div>
            )}
          </div>
          <div className="user-details">
            <h4>{user.firstName} {user.lastName}</h4>
            <p>{user.email}</p>
            <p>{user.phoneNumber}</p>
          </div>
          <div className="user-status">
            <span className="verified-badge">✅ Verified Account</span>
          </div>
        </div>
      ) : (
        <div className="guest-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Enter your first name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Enter your last name"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number *</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="Your phone number"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Your email address"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="dateOfBirth">Date of Birth</label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
      )}

      <div className="emergency-contact-section">
        <h4>Emergency Contact</h4>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="emergencyContact.name">Contact Name</label>
            <input
              type="text"
              id="emergencyContact.name"
              name="emergencyContact.name"
              value={formData.emergencyContact.name}
              onChange={handleInputChange}
              placeholder="Emergency contact name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="emergencyContact.relationship">Relationship</label>
            <input
              type="text"
              id="emergencyContact.relationship"
              name="emergencyContact.relationship"
              value={formData.emergencyContact.relationship}
              onChange={handleInputChange}
              placeholder="e.g., Spouse, Parent, Friend"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="emergencyContact.phoneNumber">Contact Phone</label>
          <input
            type="tel"
            id="emergencyContact.phoneNumber"
            name="emergencyContact.phoneNumber"
            value={formData.emergencyContact.phoneNumber}
            onChange={handleInputChange}
            placeholder="Emergency contact phone number"
          />
        </div>
      </div>

      <div className="medical-info-section">
        <h4>Critical Medical Information</h4>
        
        <div className="form-group">
          <label htmlFor="allergies">Allergies (separate with commas)</label>
          <input
            type="text"
            id="allergies"
            name="allergies"
            value={formData.allergies.join(', ')}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              allergies: e.target.value.split(',').map(item => item.trim()).filter(item => item)
            }))}
            placeholder="e.g., Penicillin, Peanuts, Latex"
          />
        </div>

        <div className="form-group">
          <label htmlFor="medications">Current Medications</label>
          <textarea
            id="medications"
            name="medications"
            value={formData.medications.join('\n')}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              medications: e.target.value.split('\n').map(item => item.trim()).filter(item => item)
            }))}
            placeholder="List current medications, one per line"
            rows="3"
          />
        </div>

        <div className="form-group">
          <label htmlFor="medicalConditions">Medical Conditions</label>
          <input
            type="text"
            id="medicalConditions"
            name="medicalConditions"
            value={formData.medicalConditions.join(', ')}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              medicalConditions: e.target.value.split(',').map(item => item.trim()).filter(item => item)
            }))}
            placeholder="e.g., Diabetes, Heart Disease, Asthma"
          />
        </div>
      </div>
    </div>
  );

  const renderLocationInfo = () => (
    <div className="form-step location-info">
      <div className="step-header">
        <h3>Location Information</h3>
        <p>Help emergency responders find you quickly</p>
      </div>

      <div className="location-section">
        <div className="location-status">
          {formData.location ? (
            <div className="location-found">
              <span className="status-icon">📍</span>
              <div className="location-details">
                <h4>Location Detected</h4>
                <p>Latitude: {formData.location.latitude?.toFixed(6)}</p>
                <p>Longitude: {formData.location.longitude?.toFixed(6)}</p>
                {formData.location.accuracy && (
                  <p>Accuracy: ±{Math.round(formData.location.accuracy)}m</p>
                )}
              </div>
            </div>
          ) : (
            <div className="location-not-found">
              <span className="status-icon">❌</span>
              <div className="location-details">
                <h4>Location Not Available</h4>
                <p>Unable to detect your current location</p>
              </div>
            </div>
          )}

          <button
            type="button"
            className="location-btn"
            onClick={handleLocationUpdate}
            disabled={locationLoading}
          >
            {locationLoading ? (
              <>
                <span className="loading-spinner"></span>
                Detecting...
              </>
            ) : (
              <>
                📍 Update Location
              </>
            )}
          </button>
        </div>

        <div className="form-group">
          <label htmlFor="locationDescription">Location Description</label>
          <textarea
            id="locationDescription"
            name="locationDescription"
            value={formData.locationDescription}
            onChange={handleInputChange}
            placeholder="Describe your exact location (e.g., Building name, floor, room number, landmarks, etc.)"
            rows="3"
          />
          <small>Be as specific as possible to help emergency responders find you</small>
        </div>

        <div className="form-group">
          <label htmlFor="additionalInfo">Additional Information</label>
          <textarea
            id="additionalInfo"
            name="additionalInfo"
            value={formData.additionalInfo}
            onChange={handleInputChange}
            placeholder="Any other important information for emergency responders..."
            rows="3"
          />
        </div>
      </div>

      <div className="location-tips">
        <h4>💡 Location Tips</h4>
        <ul>
          <li>Include building names, floor numbers, and room numbers</li>
          <li>Mention nearby landmarks or distinctive features</li>
          <li>Specify entrance information (front/back door, gate code, etc.)</li>
          <li>Note if location has restricted access</li>
        </ul>
      </div>
    </div>
  );

  const renderStepIndicator = () => (
    <div className="step-indicator">
      {[1, 2, 3].map(step => (
        <div
          key={step}
          className={`step ${currentStep >= step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
        >
          <div className="step-number">
            {currentStep > step ? '✓' : step}
          </div>
          <div className="step-label">
            {step === 1 && 'Emergency'}
            {step === 2 && 'Personal Info'}
            {step === 3 && 'Location'}
          </div>
        </div>
      ))}
    </div>
  );

  if (loading && !formData.emergencyType) return <LoadingSpinner />;

  return (
    <div className="emergency-form">
      <div className="form-header">
        <div className="emergency-indicator">
          <span className="emergency-icon">🚨</span>
          <h2>Emergency Alert Form</h2>
        </div>
        
        {renderStepIndicator()}
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="success-message">
          <span className="success-icon">✅</span>
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="emergency-form-content">
        {currentStep === 1 && renderEmergencyDetails()}
        {currentStep === 2 && renderPersonalInfo()}
        {currentStep === 3 && renderLocationInfo()}

        <div className="form-navigation">
          <div className="nav-left">
            {currentStep > 1 && (
              <button
                type="button"
                className="btn-secondary"
                onClick={handlePrevStep}
                disabled={loading}
              >
                ← Previous
              </button>
            )}
          </div>

          <div className="nav-right">
            {onCancel && (
              <button
                type="button"
                className="btn-outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </button>
            )}

            {currentStep < 3 ? (
              <button
                type="button"
                className="btn-primary"
                onClick={handleNextStep}
                disabled={loading}
              >
                Next →
              </button>
            ) : (
              <button
                type="submit"
                className="btn-emergency"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Sending Alert...
                  </>
                ) : (
                  <>
                    🚨 Send Emergency Alert
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>

      <div className="emergency-disclaimer">
        <p>
          <strong>⚠️ Important:</strong> For immediate life-threatening emergencies, 
          call 911 first. This form will alert nearby healthcare providers but 
          should not replace calling emergency services.
        </p>
      </div>
    </div>
  );
};

export default EmergencyForm;