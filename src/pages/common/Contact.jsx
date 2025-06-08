import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { contactService } from '../../services/contactService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './Contact.css';

const Contact = () => {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user ? `${user.firstName} ${user.lastName}` : '',
    email: user?.email || '',
    phone: user?.phoneNumber || '',
    subject: '',
    category: '',
    message: '',
    priority: 'medium',
    attachments: []
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('contact');

  const categories = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'billing', label: 'Billing & Payments' },
    { value: 'emergency', label: 'Emergency Support' },
    { value: 'appointment', label: 'Appointment Issues' },
    { value: 'account', label: 'Account Problems' },
    { value: 'feedback', label: 'Feedback & Suggestions' },
    { value: 'partnership', label: 'Partnership Inquiries' },
    { value: 'media', label: 'Media & Press' },
    { value: 'other', label: 'Other' }
  ];

  const offices = [
    {
      name: 'Headquarters',
      address: '123 Healthcare Blvd, Suite 100',
      city: 'San Francisco, CA 94105',
      phone: '+1 (555) 123-4567',
      email: 'contact@medilink.com',
      hours: 'Mon-Fri: 8:00 AM - 6:00 PM PST',
      type: 'primary'
    },
    {
      name: 'East Coast Office',
      address: '456 Medical Center Dr, Floor 5',
      city: 'New York, NY 10001',
      phone: '+1 (555) 234-5678',
      email: 'east@medilink.com',
      hours: 'Mon-Fri: 9:00 AM - 5:00 PM EST',
      type: 'secondary'
    },
    {
      name: 'European Office',
      address: '789 Health Street, Building A',
      city: 'London, UK SW1A 1AA',
      phone: '+44 20 1234 5678',
      email: 'europe@medilink.com',
      hours: 'Mon-Fri: 9:00 AM - 5:00 PM GMT',
      type: 'secondary'
    }
  ];

  const supportChannels = [
    {
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      icon: '💬',
      availability: '24/7',
      action: 'Start Chat',
      type: 'chat'
    },
    {
      title: 'Phone Support',
      description: 'Speak directly with a support representative',
      icon: '📞',
      availability: 'Mon-Fri 8AM-8PM',
      action: 'Call Now',
      type: 'phone'
    },
    {
      title: 'Email Support',
      description: 'Send us an email and we\'ll respond within 24 hours',
      icon: '✉️',
      availability: 'Always available',
      action: 'Send Email',
      type: 'email'
    },
    {
      title: 'Help Center',
      description: 'Browse our comprehensive knowledge base',
      icon: '📚',
      availability: 'Always available',
      action: 'Browse Articles',
      type: 'help'
    }
  ];

  const faqItems = [
    {
      question: 'How do I book an appointment?',
      answer: 'You can book an appointment by searching for a doctor, selecting an available time slot, and confirming your booking. You\'ll receive a confirmation email with all the details.'
    },
    {
      question: 'Is my medical information secure?',
      answer: 'Yes, we use industry-standard encryption and follow HIPAA compliance guidelines to ensure your medical information is completely secure and private.'
    },
    {
      question: 'Can I cancel or reschedule my appointment?',
      answer: 'Yes, you can cancel or reschedule your appointment up to 24 hours before the scheduled time through your dashboard or by calling our support team.'
    },
    {
      question: 'Do you accept insurance?',
      answer: 'We work with most major insurance providers. You can filter doctors by insurance acceptance when searching, and verify coverage before booking.'
    },
    {
      question: 'How does the emergency alert system work?',
      answer: 'In case of emergency, click the emergency button to alert nearby healthcare providers. They\'ll receive your location and can respond immediately.'
    },
    {
      question: 'Can I use telemedicine for all appointments?',
      answer: 'Telemedicine is available for many consultation types, but some conditions may require in-person visits. Check with your doctor about availability.'
    },
    {
      question: 'How do I become a verified healthcare provider?',
      answer: 'Healthcare providers can apply through our provider signup page. We verify credentials, licenses, and conduct background checks before approval.'
    },
    {
      question: 'What if I need to contact a doctor urgently?',
      answer: 'For urgent but non-emergency situations, you can send a direct message to your doctor through the platform. For emergencies, always call 911 or use our emergency alert system.'
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'text/plain'];
    
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        setError(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      if (!allowedTypes.includes(file.type)) {
        setError(`File ${file.name} is not a supported format.`);
        return false;
      }
      return true;
    });

    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...validFiles]
    }));
  };

  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.name.trim()) errors.push('Name is required');
    if (!formData.email.trim()) errors.push('Email is required');
    if (!formData.subject.trim()) errors.push('Subject is required');
    if (!formData.category) errors.push('Category is required');
    if (!formData.message.trim()) errors.push('Message is required');
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.push('Please enter a valid email address');
    }
    
    if (formData.message.length < 10) {
      errors.push('Message must be at least 10 characters long');
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      setLoading(false);
      return;
    }

    try {
      await contactService.submitContactForm(formData);
      
      setSuccess('Thank you for contacting us! We\'ll get back to you within 24 hours.');
      
      // Reset form
      setFormData({
        name: user ? `${user.firstName} ${user.lastName}` : '',
        email: user?.email || '',
        phone: user?.phoneNumber || '',
        subject: '',
        category: '',
        message: '',
        priority: 'medium',
        attachments: []
      });
      
    } catch (err) {
      setError('Failed to submit your message. Please try again.');
      console.error('Contact form submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSupportAction = (type) => {
    switch (type) {
      case 'chat':
        // Open chat widget or navigate to chat page
        console.log('Opening chat...');
        break;
      case 'phone':
        window.open('tel:+15551234567');
        break;
      case 'email':
        setActiveTab('contact');
        setFormData(prev => ({ ...prev, category: 'general' }));
        break;
      case 'help':
        window.open('/help', '_blank');
        break;
      default:
        break;
    }
  };

  const renderContactForm = () => (
    <div className="contact-form-section">
      <div className="form-header">
        <h2>Send Us a Message</h2>
        <p>We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
      </div>

      <form onSubmit={handleSubmit} className="contact-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="Enter your email address"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter your phone number"
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="subject">Subject *</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              required
              placeholder="Brief description of your inquiry"
            />
          </div>

          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="message">Message *</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            required
            rows="6"
            placeholder="Please provide details about your inquiry..."
          />
          <small className="char-count">
            {formData.message.length}/1000 characters
          </small>
        </div>

        <div className="form-group full-width">
          <label htmlFor="attachments">Attachments</label>
          <div className="file-upload">
            <input
              type="file"
              id="attachments"
              multiple
              onChange={handleFileUpload}
              accept=".jpg,.jpeg,.png,.pdf,.txt"
              style={{ display: 'none' }}
            />
            <label htmlFor="attachments" className="file-upload-btn">
              📎 Attach Files
            </label>
            <small>Supported formats: JPG, PNG, PDF, TXT (Max 10MB each)</small>
          </div>

          {formData.attachments.length > 0 && (
            <div className="attachments-list">
              {formData.attachments.map((file, index) => (
                <div key={index} className="attachment-item">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="remove-attachment"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </div>
      </form>
    </div>
  );

  const renderSupportOptions = () => (
    <div className="support-options">
      <h2>Get Help</h2>
      <p>Choose the best way to reach us based on your needs</p>
      
      <div className="support-grid">
        {supportChannels.map((channel, index) => (
          <div key={index} className="support-card">
            <div className="support-icon">{channel.icon}</div>
            <h3>{channel.title}</h3>
            <p>{channel.description}</p>
            <div className="support-availability">
              <strong>Available:</strong> {channel.availability}
            </div>
            <button 
              className="support-action-btn"
              onClick={() => handleSupportAction(channel.type)}
            >
              {channel.action}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderOfficeLocations = () => (
    <div className="office-locations">
      <h2>Our Offices</h2>
      <div className="offices-grid">
        {offices.map((office, index) => (
          <div key={index} className={`office-card ${office.type}`}>
            <h3>{office.name}</h3>
            <div className="office-details">
              <div className="office-detail">
                <span className="detail-icon">📍</span>
                <div className="detail-content">
                  <div>{office.address}</div>
                  <div>{office.city}</div>
                </div>
              </div>
              
              <div className="office-detail">
                <span className="detail-icon">📞</span>
                <div className="detail-content">
                  <a href={`tel:${office.phone.replace(/[^\d+]/g, '')}`}>
                    {office.phone}
                  </a>
                </div>
              </div>
              
              <div className="office-detail">
                <span className="detail-icon">✉️</span>
                <div className="detail-content">
                  <a href={`mailto:${office.email}`}>
                    {office.email}
                  </a>
                </div>
              </div>
              
              <div className="office-detail">
                <span className="detail-icon">🕒</span>
                <div className="detail-content">
                  {office.hours}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFAQ = () => (
    <div className="faq-section">
      <h2>Frequently Asked Questions</h2>
      <p>Find quick answers to common questions</p>
      
      <div className="faq-list">
        {faqItems.map((item, index) => (
          <div key={index} className="faq-item">
            <div className="faq-question">
              <h3>{item.question}</h3>
            </div>
            <div className="faq-answer">
              <p>{item.answer}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="faq-footer">
        <p>Didn't find what you're looking for?</p>
        <button 
          className="btn-outline"
          onClick={() => setActiveTab('contact')}
        >
          Contact Support
        </button>
      </div>
    </div>
  );

  if (loading && !formData.message) return <LoadingSpinner />;

  return (
    <div className="contact-page">
      <div className="contact-header">
        <div className="header-content">
          <h1>Contact Us</h1>
          <p>We're here to help you with any questions or concerns about Medi-Link</p>
        </div>
      </div>

      {/* Emergency Banner */}
      <div className="emergency-banner">
        <div className="emergency-content">
          <span className="emergency-icon">🚨</span>
          <div className="emergency-text">
            <strong>Medical Emergency?</strong>
            <span>For immediate medical emergencies, call 911 or use our emergency alert system</span>
          </div>
          <button 
            className="emergency-btn"
            onClick={() => window.location.href = '/emergency'}
          >
            Emergency Alert
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
      <div className="contact-tabs">
        <button 
          className={`tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
          onClick={() => setActiveTab('contact')}
        >
          📝 Send Message
        </button>
        <button 
          className={`tab-btn ${activeTab === 'support' ? 'active' : ''}`}
          onClick={() => setActiveTab('support')}
        >
          🆘 Get Support
        </button>
        <button 
          className={`tab-btn ${activeTab === 'offices' ? 'active' : ''}`}
          onClick={() => setActiveTab('offices')}
        >
          📍 Our Offices
        </button>
        <button 
          className={`tab-btn ${activeTab === 'faq' ? 'active' : ''}`}
          onClick={() => setActiveTab('faq')}
        >
          ❓ FAQ
        </button>
      </div>

      {/* Tab Content */}
      <div className="contact-content">
        {activeTab === 'contact' && renderContactForm()}
        {activeTab === 'support' && renderSupportOptions()}
        {activeTab === 'offices' && renderOfficeLocations()}
        {activeTab === 'faq' && renderFAQ()}
      </div>

      {/* Additional Contact Information */}
      <div className="additional-info">
        <div className="info-section">
          <h3>Business Hours</h3>
          <div className="hours-list">
            <div className="hours-item">
              <span>Customer Support:</span>
              <span>24/7</span>
            </div>
            <div className="hours-item">
              <span>Phone Support:</span>
              <span>Mon-Fri: 8:00 AM - 8:00 PM</span>
            </div>
            <div className="hours-item">
              <span>Administrative:</span>
              <span>Mon-Fri: 9:00 AM - 5:00 PM</span>
            </div>
          </div>
        </div>

        <div className="info-section">
          <h3>Response Times</h3>
          <div className="response-times">
            <div className="response-item">
              <span className="priority urgent">Urgent:</span>
              <span>Within 1 hour</span>
            </div>
            <div className="response-item">
              <span className="priority high">High:</span>
              <span>Within 4 hours</span>
            </div>
            <div className="response-item">
              <span className="priority medium">Medium:</span>
              <span>Within 24 hours</span>
            </div>
            <div className="response-item">
              <span className="priority low">Low:</span>
              <span>Within 48 hours</span>
            </div>
          </div>
        </div>
      </div>

      {/* Social Media Links */}
      <div className="social-section">
        <h3>Follow Us</h3>
        <div className="social-links">
          <a href="#" className="social-link facebook">
            📘 Facebook
          </a>
          <a href="#" className="social-link twitter">
            🐦 Twitter
          </a>
          <a href="#" className="social-link linkedin">
            💼 LinkedIn
          </a>
          <a href="#" className="social-link instagram">
            📷 Instagram
          </a>
        </div>
      </div>
    </div>
  );
};

export default Contact;