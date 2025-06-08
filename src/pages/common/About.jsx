import React from 'react';
import { Heart, Users, Shield, Award, Target, Globe } from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: <Heart className="w-8 h-8 text-primary-blue" />,
      title: 'Patient-Centered Care',
      description: 'We put patients at the heart of everything we do, ensuring accessible and compassionate healthcare.'
    },
    {
      icon: <Shield className="w-8 h-8 text-primary-blue" />,
      title: 'Privacy & Security',
      description: 'Your health data is protected with industry-leading security measures and HIPAA compliance.'
    },
    {
      icon: <Users className="w-8 h-8 text-primary-blue" />,
      title: 'Collaboration',
      description: 'Bridging the gap between patients and healthcare providers through seamless communication.'
    },
    {
      icon: <Award className="w-8 h-8 text-primary-blue" />,
      title: 'Excellence',
      description: 'We strive for excellence in healthcare delivery and patient satisfaction.'
    }
  ];

  const team = [
    {
      name: 'Dr. Sarah Chen',
      role: 'Chief Medical Officer',
      description: 'Leading healthcare innovation with 15+ years of medical experience.',
      image: null
    },
    {
      name: 'Michael Rodriguez',
      role: 'Chief Technology Officer',
      description: 'Building secure, scalable healthcare technology solutions.',
      image: null
    },
    {
      name: 'Emily Johnson',
      role: 'VP of Patient Experience',
      description: 'Ensuring exceptional patient care and satisfaction.',
      image: null
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-blue to-primary-blue-dark text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              About Medi-Link
            </h1>
            <p className="text-xl text-primary-blue-lighter max-w-3xl mx-auto">
              We're on a mission to revolutionize healthcare access by connecting patients 
              with quality healthcare providers through innovative technology.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-4">
                <Target className="w-8 h-8 text-primary-blue mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
              </div>
              <p className="text-lg text-gray-700 mb-6">
                To make quality healthcare accessible to everyone by creating a seamless 
                platform that connects patients with healthcare providers, eliminates barriers 
                to care, and empowers individuals to take control of their health journey.
              </p>
            </div>
            
            <div>
              <div className="flex items-center mb-4">
                <Globe className="w-8 h-8 text-primary-blue mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">Our Vision</h2>
              </div>
              <p className="text-lg text-gray-700 mb-6">
                A world where every person has timely access to quality healthcare, 
                where technology bridges gaps in medical care, and where the patient-provider 
                relationship is strengthened through innovation and trust.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These core values guide everything we do and shape our commitment 
              to improving healthcare for everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="card text-center hover:shadow-lg transition-shadow">
                <div className="card-body">
                  <div className="flex justify-center mb-4">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600">
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our diverse team of healthcare professionals, technologists, and innovators 
              are dedicated to improving healthcare accessibility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="card text-center">
                <div className="card-body">
                  <div className="w-24 h-24 bg-primary-blue-lightest rounded-full flex items-center justify-center mx-auto mb-4">
                    {member.image ? (
                      <img 
                        src={member.image} 
                        alt={member.name}
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <Users className="w-12 h-12 text-primary-blue" />
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {member.name}
                  </h3>
                  <p className="text-primary-blue font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-gray-600">
                    {member.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-primary-blue text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Our Impact
            </h2>
            <p className="text-xl text-primary-blue-lighter">
              Making a difference in healthcare, one connection at a time.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-primary-blue-lighter">Patients Served</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-primary-blue-lighter">Healthcare Providers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-primary-blue-lighter">Partner Hospitals</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-primary-blue-lighter">Platform Uptime</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;