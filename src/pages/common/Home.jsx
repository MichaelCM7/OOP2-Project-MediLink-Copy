import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { searchService } from '../../services/searchService';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const [stats, setStats] = useState({
    totalDoctors: 1248,
    totalHospitals: 342,
    totalPatients: 15647,
    emergencyResponses: 2831
  });
  const [loading, setLoading] = useState(false);

  const specialties = [
    'General Practice', 'Cardiology', 'Dermatology', 'Emergency Medicine',
    'Family Medicine', 'Internal Medicine', 'Neurology', 'Pediatrics',
    'Psychiatry', 'Surgery', 'Obstetrics & Gynecology', 'Orthopedics'
  ];

  useEffect(() => {
    fetchFeaturedDoctors();
    fetchStats();
  }, []);

  const fetchFeaturedDoctors = async () => {
    try {
      const response = await searchService.getFeaturedDoctors();
      setFeaturedDoctors(response.data || [
        {
          id: 1,
          firstName: 'Sarah',
          lastName: 'Johnson',
          specialization: 'Cardiology',
          yearsOfExperience: 15,
          averageRating: 4.9,
          totalReviews: 324,
          city: 'San Francisco',
          state: 'CA',
          profileImage: null
        },
        {
          id: 2,
          firstName: 'Michael',
          lastName: 'Chen',
          specialization: 'Pediatrics',
          yearsOfExperience: 12,
          averageRating: 4.8,
          totalReviews: 287,
          city: 'Los Angeles',
          state: 'CA',
          profileImage: null
        },
        {
          id: 3,
          firstName: 'Emily',
          lastName: 'Rodriguez',
          specialization: 'Dermatology',
          yearsOfExperience: 8,
          averageRating: 4.7,
          totalReviews: 156,
          city: 'New York',
          state: 'NY',
          profileImage: null
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch featured doctors:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await searchService.getPlatformStats();
      setStats(response.data || stats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const searchParams = new URLSearchParams();
      if (searchQuery) searchParams.append('query', searchQuery);
      if (location) searchParams.append('location', location);
      if (specialty) searchParams.append('specialty', specialty);
      
      navigate(`/search?${searchParams.toString()}`);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyClick = () => {
    if (user) {
      navigate('/emergency');
    } else {
      navigate('/emergency-guest');
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span 
          key={i} 
          className={`star ${i <= rating ? 'filled' : 'empty'}`}
        >
          ⭐
        </span>
      );
    }
    return <div className="star-rating">{stars}</div>;
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Your Health, Our Priority</h1>
            <p className="hero-subtitle">
              Connect with trusted healthcare providers, book appointments instantly, 
              and get emergency care when you need it most.
            </p>
            
            {/* Emergency Button */}
            <div className="emergency-section">
              <button 
                className="emergency-btn"
                onClick={handleEmergencyClick}
              >
                🚨 Emergency Alert
              </button>
              <span className="emergency-text">
                Get immediate help from nearby healthcare providers
              </span>
            </div>
          </div>

          <div className="hero-image">
            <div className="hero-graphic">
              <div className="medical-icon">🏥</div>
              <div className="pulse-animation"></div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="search-section">
          <div className="search-container">
            <h2>Find Healthcare Providers Near You</h2>
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-inputs">
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Search doctors, hospitals, or conditions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                </div>
                
                <div className="input-group">
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="specialty-select"
                  >
                    <option value="">All Specialties</option>
                    {specialties.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
                
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Enter your location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="location-input"
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="search-btn"
                  disabled={loading}
                >
                  {loading ? 'Searching...' : '🔍 Search'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-number">{stats.totalDoctors.toLocaleString()}+</div>
            <div className="stat-label">Verified Doctors</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{stats.totalHospitals.toLocaleString()}+</div>
            <div className="stat-label">Partner Hospitals</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{stats.totalPatients.toLocaleString()}+</div>
            <div className="stat-label">Patients Served</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{stats.emergencyResponses.toLocaleString()}+</div>
            <div className="stat-label">Emergency Responses</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="features-container">
          <h2>Why Choose Medi-Link?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📅</div>
              <h3>Easy Booking</h3>
              <p>Book appointments with top-rated doctors in just a few clicks. View real-time availability and choose your preferred time slot.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🚨</div>
              <h3>Emergency Care</h3>
              <p>Get immediate help during medical emergencies. Our system alerts nearby healthcare providers to respond quickly.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>Telemedicine</h3>
              <p>Consult with doctors remotely through secure video calls. Perfect for follow-ups and non-emergency consultations.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Digital Records</h3>
              <p>Access your complete medical history, prescriptions, and lab results anytime, anywhere. Share records with any healthcare provider.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure & Private</h3>
              <p>Your health data is protected with end-to-end encryption and HIPAA-compliant security measures.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">⭐</div>
              <h3>Verified Providers</h3>
              <p>All healthcare providers are thoroughly verified and continuously monitored for quality and safety standards.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Doctors */}
      {featuredDoctors.length > 0 && (
        <section className="featured-doctors">
          <div className="featured-container">
            <h2>Top-Rated Healthcare Providers</h2>
            <div className="doctors-grid">
              {featuredDoctors.slice(0, 6).map((doctor, index) => (
                <div key={index} className="doctor-card">
                  <div className="doctor-avatar">
                    {doctor.profileImage ? (
                      <img src={doctor.profileImage} alt={`Dr. ${doctor.firstName} ${doctor.lastName}`} />
                    ) : (
                      <div className="avatar-placeholder">
                        {doctor.firstName?.[0]}{doctor.lastName?.[0]}
                      </div>
                    )}
                  </div>
                  
                  <div className="doctor-info">
                    <h3>Dr. {doctor.firstName} {doctor.lastName}</h3>
                    <p className="specialty">{doctor.specialization}</p>
                    <p className="experience">{doctor.yearsOfExperience} years experience</p>
                    
                    <div className="doctor-rating">
                      {renderStars(Math.round(doctor.averageRating || 0))}
                      <span className="rating-text">
                        {doctor.averageRating?.toFixed(1)} ({doctor.totalReviews} reviews)
                      </span>
                    </div>
                    
                    <div className="doctor-location">
                      📍 {doctor.city}, {doctor.state}
                    </div>
                    
                    <button 
                      className="view-profile-btn"
                      onClick={() => navigate(`/doctors/${doctor.id}`)}
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="view-all-doctors">
              <button 
                className="btn-outline"
                onClick={() => navigate('/search')}
              >
                View All Doctors
              </button>
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="how-it-works">
        <div className="how-it-works-container">
          <h2>How Medi-Link Works</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Search & Find</h3>
                <p>Search for doctors by specialty, location, or specific medical conditions. Filter by availability, ratings, and insurance acceptance.</p>
              </div>
            </div>
            
            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Book Appointment</h3>
                <p>Choose your preferred date and time from available slots. Provide basic information about your health concerns.</p>
              </div>
            </div>
            
            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Get Care</h3>
                <p>Attend your appointment either in-person or through secure video consultation. Receive prescriptions and follow-up care.</p>
              </div>
            </div>
            
            <div className="step-card">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Manage Health</h3>
                <p>Access your medical records, track prescriptions, and schedule follow-up appointments all in one place.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta">
        <div className="cta-container">
          <h2>Ready to Take Control of Your Health?</h2>
          <p>Join thousands of patients who trust Medi-Link for their healthcare needs</p>
          
          <div className="cta-buttons">
            {user ? (
              <button 
                className="btn-primary large"
                onClick={() => {
                  if (user.role === 'PATIENT') navigate('/user/dashboard');
                  else if (user.role === 'DOCTOR') navigate('/doctor/dashboard');
                  else if (user.role === 'ADMIN') navigate('/admin/dashboard');
                }}
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                <button 
                  className="btn-primary large"
                  onClick={() => navigate('/signup')}
                >
                  Sign Up Now
                </button>
                <button 
                  className="btn-outline large"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </button>
              </>
            )}
          </div>
          
          <div className="cta-features">
            <div className="cta-feature">
              <span className="checkmark">✅</span>
              <span>Free to join</span>
            </div>
            <div className="cta-feature">
              <span className="checkmark">✅</span>
              <span>Secure & private</span>
            </div>
            <div className="cta-feature">
              <span className="checkmark">✅</span>
              <span>24/7 emergency support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Healthcare Providers CTA */}
      <section className="provider-cta">
        <div className="provider-cta-container">
          <div className="provider-content">
            <h2>Are You a Healthcare Provider?</h2>
            <p>Join our network of verified medical professionals and reach more patients</p>
            
            <div className="provider-benefits">
              <div className="benefit-item">
                <span className="benefit-icon">👥</span>
                <span>Expand your patient base</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">📅</span>
                <span>Streamline appointment management</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">💰</span>
                <span>Increase practice revenue</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">📱</span>
                <span>Digital practice tools</span>
              </div>
            </div>
            
            <button 
              className="btn-secondary large"
              onClick={() => navigate('/doctor/signup')}
            >
              Join as Healthcare Provider
            </button>
          </div>
          
          <div className="provider-image">
            <div className="provider-graphic">
              <div className="doctor-icon">👨‍⚕️</div>
              <div className="connect-animation"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <div className="testimonials-container">
          <h2>What Our Users Say</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"Medi-Link saved my life during a medical emergency. The response time was incredible, and I was connected to a nearby hospital within minutes."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">👤</div>
                <div className="author-info">
                  <h4>Sarah Johnson</h4>
                  <span>Patient</span>
                </div>
              </div>
              <div className="testimonial-rating">
                {renderStars(5)}
              </div>
            </div>
            
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"As a doctor, Medi-Link has helped me manage my practice more efficiently and connect with patients who need specialized care."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">👨‍⚕️</div>
                <div className="author-info">
                  <h4>Dr. Michael Chen</h4>
                  <span>Cardiologist</span>
                </div>
              </div>
              <div className="testimonial-rating">
                {renderStars(5)}
              </div>
            </div>
            
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"The telemedicine feature is fantastic. I can consult with my doctor from home, which is perfect for follow-up appointments."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">👩</div>
                <div className="author-info">
                  <h4>Emily Rodriguez</h4>
                  <span>Patient</span>
                </div>
              </div>
              <div className="testimonial-rating">
                {renderStars(5)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="newsletter">
        <div className="newsletter-container">
          <div className="newsletter-content">
            <h3>Stay Updated with Health Tips & News</h3>
            <p>Get the latest healthcare insights and platform updates delivered to your inbox</p>
            
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email address"
                className="newsletter-input"
              />
              <button type="submit" className="newsletter-btn">
                Subscribe
              </button>
            </form>
            
            <small className="newsletter-disclaimer">
              We respect your privacy. Unsubscribe anytime.
            </small>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;