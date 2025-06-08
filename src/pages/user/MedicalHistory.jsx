import React, { useState, useEffect } from 'react';

const MedicalHistory = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [medicalData, setMedicalData] = useState({
    overview: {
      bloodType: 'O+',
      allergies: ['Penicillin', 'Shellfish'],
      chronicConditions: ['Hypertension', 'Type 2 Diabetes'],
      emergencyContact: {
        name: 'Jane Doe',
        phone: '(555) 123-4567',
        relationship: 'Spouse'
      }
    },
    visits: [],
    prescriptions: [],
    labResults: [],
    vaccinations: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMedicalHistory();
  }, []);

  const fetchMedicalHistory = async () => {
    setLoading(true);
    try {
      const mockData = {
        overview: {
          bloodType: 'O+',
          allergies: ['Penicillin', 'Shellfish'],
          chronicConditions: ['Hypertension', 'Type 2 Diabetes'],
          emergencyContact: {
            name: 'Jane Doe',
            phone: '(555) 123-4567',
            relationship: 'Spouse'
          }
        },
        visits: [
          {
            id: 1,
            date: '2024-01-15',
            doctor: 'Dr. Sarah Johnson',
            specialty: 'Cardiology',
            diagnosis: 'Hypertension monitoring',
            treatment: 'Medication adjustment',
            notes: 'Blood pressure well controlled'
          },
          {
            id: 2,
            date: '2024-01-05',
            doctor: 'Dr. Emily Rodriguez',
            specialty: 'Dermatology',
            diagnosis: 'Eczema',
            treatment: 'Topical corticosteroid',
            notes: 'Skin condition improving'
          }
        ],
        prescriptions: [
          {
            id: 1,
            medication: 'Lisinopril',
            dosage: '10mg',
            frequency: 'Once daily',
            prescribedBy: 'Dr. Sarah Johnson',
            prescribedDate: '2024-01-15',
            status: 'Active'
          },
          {
            id: 2,
            medication: 'Metformin',
            dosage: '500mg',
            frequency: 'Twice daily',
            prescribedBy: 'Dr. Michael Chen',
            prescribedDate: '2023-12-20',
            status: 'Active'
          },
          {
            id: 3,
            medication: 'Hydrocortisone cream',
            dosage: '1%',
            frequency: 'As needed',
            prescribedBy: 'Dr. Emily Rodriguez',
            prescribedDate: '2024-01-05',
            status: 'Completed'
          }
        ],
        labResults: [
          {
            id: 1,
            testName: 'Complete Blood Count',
            date: '2024-01-10',
            orderedBy: 'Dr. Sarah Johnson',
            status: 'Normal',
            results: {
              'White Blood Cells': '7.2 K/uL (Normal)',
              'Red Blood Cells': '4.5 M/uL (Normal)',
              'Hemoglobin': '14.2 g/dL (Normal)',
              'Platelets': '285 K/uL (Normal)'
            }
          },
          {
            id: 2,
            testName: 'Lipid Panel',
            date: '2024-01-08',
            orderedBy: 'Dr. Sarah Johnson',
            status: 'Abnormal',
            results: {
              'Total Cholesterol': '220 mg/dL (High)',
              'LDL': '140 mg/dL (High)',
              'HDL': '45 mg/dL (Low)',
              'Triglycerides': '180 mg/dL (Normal)'
            }
          }
        ],
        vaccinations: [
          {
            id: 1,
            vaccine: 'COVID-19 (Pfizer)',
            date: '2023-10-15',
            administeredBy: 'City Health Clinic',
            nextDue: '2024-10-15'
          },
          {
            id: 2,
            vaccine: 'Influenza',
            date: '2023-09-20',
            administeredBy: 'Metro Medical Center',
            nextDue: '2024-09-20'
          }
        ]
      };
      setMedicalData(mockData);
    } catch (error) {
      console.error('Error fetching medical history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    console.log('Exporting medical data...');
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-600">Blood Type:</span>
              <span className="ml-2 text-red-600 font-medium">{medicalData.overview.bloodType}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">{medicalData.overview.emergencyContact.name}</span>
            </p>
            <p className="text-sm text-gray-600">{medicalData.overview.emergencyContact.phone}</p>
            <p className="text-sm text-gray-600">{medicalData.overview.emergencyContact.relationship}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Allergies</h3>
        {medicalData.overview.allergies.length === 0 ? (
          <p className="text-gray-500">No known allergies</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {medicalData.overview.allergies.map((allergy, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
              >
                {allergy}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Chronic Conditions</h3>
        {medicalData.overview.chronicConditions.length === 0 ? (
          <p className="text-gray-500">No chronic conditions recorded</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {medicalData.overview.chronicConditions.map((condition, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
              >
                {condition}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderVisits = () => (
    <div className="space-y-4">
      {medicalData.visits.map((visit) => (
        <div key={visit.id} className="bg-white rounded-lg border p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold">{visit.doctor}</h3>
              <p className="text-gray-600">{visit.specialty}</p>
            </div>
            <span className="text-sm text-gray-500">{visit.date}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm"><span className="font-medium">Diagnosis:</span> {visit.diagnosis}</p>
              <p className="text-sm"><span className="font-medium">Treatment:</span> {visit.treatment}</p>
            </div>
            <div>
              <p className="text-sm"><span className="font-medium">Notes:</span> {visit.notes}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderPrescriptions = () => (
    <div className="space-y-4">
      {medicalData.prescriptions.map((prescription) => (
        <div key={prescription.id} className="bg-white rounded-lg border p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold">{prescription.medication}</h3>
              <p className="text-gray-600">{prescription.dosage} - {prescription.frequency}</p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm ${
                prescription.status === 'Active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {prescription.status}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            <p>Prescribed by: {prescription.prescribedBy}</p>
            <p>Date: {prescription.prescribedDate}</p>
          </div>
        </div>
      ))}
    </div>
  );

  const renderLabResults = () => (
    <div className="space-y-4">
      {medicalData.labResults.map((lab) => (
        <div key={lab.id} className="bg-white rounded-lg border p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold">{lab.testName}</h3>
              <p className="text-gray-600">Ordered by: {lab.orderedBy}</p>
            </div>
            <div className="text-right">
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  lab.status === 'Normal'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {lab.status}
              </span>
              <p className="text-sm text-gray-500 mt-1">{lab.date}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(lab.results).map(([test, result]) => (
              <div key={test} className="text-sm">
                <span className="font-medium">{test}:</span>
                <span className="ml-2">{result}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderVaccinations = () => (
    <div className="space-y-4">
      {medicalData.vaccinations.map((vaccination) => (
        <div key={vaccination.id} className="bg-white rounded-lg border p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{vaccination.vaccine}</h3>
              <p className="text-gray-600">Administered by: {vaccination.administeredBy}</p>
              <p className="text-sm text-gray-500">Date: {vaccination.date}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-blue-600">Next Due:</p>
              <p className="text-sm text-blue-600">{vaccination.nextDue}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading medical history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Medical History</h1>
              <p className="text-gray-600">Your complete health record</p>
            </div>
            <button
              onClick={handleExportData}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Export Data
            </button>
          </div>
        </div>

        <div className="mb-6">
          <nav className="flex space-x-8 border-b border-gray-200">
            {[
              { id: 'overview', name: 'Overview' },
              { id: 'visits', name: 'Visits' },
              { id: 'prescriptions', name: 'Prescriptions' },
              { id: 'labResults', name: 'Lab Results' },
              { id: 'vaccinations', name: 'Vaccinations' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'visits' && renderVisits()}
          {activeTab === 'prescriptions' && renderPrescriptions()}
          {activeTab === 'labResults' && renderLabResults()}
          {activeTab === 'vaccinations' && renderVaccinations()}
        </div>
      </div>
    </div>
  );
};

export default MedicalHistory;