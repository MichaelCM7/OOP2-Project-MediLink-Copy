import React, { useState, useEffect } from 'react';

const PatientRequests = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [responseData, setResponseData] = useState({
    action: '',
    appointmentDate: '',
    appointmentTime: '',
    notes: ''
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, filter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockRequests = [
        {
          id: 1,
          patientName: 'John Smith',
          patientId: 'P001',
          patientAge: 45,
          patientGender: 'Male',
          requestDate: '2024-01-20',
          preferredDate: '2024-01-22',
          preferredTime: '10:00 AM',
          appointmentType: 'Consultation',
          reason: 'Chest pain and shortness of breath',
          urgency: 'high',
          status: 'pending',
          insurance: 'Blue Cross Blue Shield',
          previousVisit: '2023-12-15',
          notes: 'Patient reports symptoms started 3 days ago. No fever.',
          contactInfo: {
            phone: '(555) 123-4567',
            email: 'john.smith@email.com'
          }
        },
        {
          id: 2,
          patientName: 'Mary Johnson',
          patientId: 'P002',
          patientAge: 32,
          patientGender: 'Female',
          requestDate: '2024-01-19',
          preferredDate: '2024-01-23',
          preferredTime: '2:00 PM',
          appointmentType: 'Follow-up',
          reason: 'Blood pressure medication adjustment',
          urgency: 'medium',
          status: 'pending',
          insurance: 'Aetna',
          previousVisit: '2024-01-05',
          notes: 'Recent BP readings have been elevated despite current medication.',
          contactInfo: {
            phone: '(555) 234-5678',
            email: 'mary.johnson@email.com'
          }
        },
        {
          id: 3,
          patientName: 'Robert Davis',
          patientId: 'P003',
          patientAge: 28,
          patientGender: 'Male',
          requestDate: '2024-01-18',
          preferredDate: '2024-01-21',
          preferredTime: '11:30 AM',
          appointmentType: 'Consultation',
          reason: 'Annual physical examination',
          urgency: 'low',
          status: 'approved',
          insurance: 'UnitedHealthcare',
          previousVisit: '2023-01-15',
          notes: 'Routine annual checkup. No current health concerns.',
          contactInfo: {
            phone: '(555) 345-6789',
            email: 'robert.davis@email.com'
          }
        },
        {
          id: 4,
          patientName: 'Lisa Wilson',
          patientId: 'P004',
          patientAge: 55,
          patientGender: 'Female',
          requestDate: '2024-01-17',
          preferredDate: '2024-01-20',
          preferredTime: '9:00 AM',
          appointmentType: 'Urgent',
          reason: 'Severe migraine headaches',
          urgency: 'high',
          status: 'declined',
          insurance: 'Cigna',
          previousVisit: '2023-11-22',
          notes: 'Patient reports frequent headaches over past week.',
          contactInfo: {
            phone: '(555) 456-7890',
            email: 'lisa.wilson@email.com'
          },
          declineReason: 'Unable to accommodate urgent request. Referred to emergency care.'
        }
      ];
      setRequests(mockRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = [...requests];
    
    if (filter !== 'all') {
      filtered = filtered.filter(request => request.status === filter);
    }

    // Sort by urgency and date
    filtered.sort((a, b) => {
      const urgencyOrder = { high: 3, medium: 2, low: 1 };
      if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
        return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
      }
      return new Date(a.requestDate) - new Date(b.requestDate);
    });

    setFilteredRequests(filtered);
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRequestAction = (request, action) => {
    setSelectedRequest(request);
    setResponseData({
      action,
      appointmentDate: action === 'approve' ? request.preferredDate : '',
      appointmentTime: action === 'approve' ? request.preferredTime : '',
      notes: ''
    });
    setShowModal(true);
  };

  const handleSubmitResponse = async () => {
    setLoading(true);
    try {
      // API call to respond to request
      console.log('Responding to request:', selectedRequest.id, responseData);
      
      // Update local state
      setRequests(prev =>
        prev.map(request =>
          request.id === selectedRequest.id
            ? {
                ...request,
                status: responseData.action === 'approve' ? 'approved' : 'declined',
                appointmentDate: responseData.appointmentDate,
                appointmentTime: responseData.appointmentTime,
                responseNotes: responseData.notes,
                declineReason: responseData.action === 'decline' ? responseData.notes : undefined
              }
            : request
        )
      );
      
      setShowModal(false);
      setSelectedRequest(null);
      setResponseData({ action: '', appointmentDate: '', appointmentTime: '', notes: '' });
    } catch (error) {
      console.error('Error responding to request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPatientHistory = (patientId) => {
    console.log('View patient history for:', patientId);
    // Navigate to patient history page
  };

  if (loading && !showModal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading patient requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Patient Requests</h1>
          <p className="text-gray-600">Review and respond to appointment requests</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Requests' },
              { key: 'pending', label: 'Pending' },
              { key: 'approved', label: 'Approved' },
              { key: 'declined', label: 'Declined' }
            ].map((filterOption) => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === filterOption.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
            <p className="text-gray-600">
              {filter === 'pending' 
                ? 'No pending requests at the moment'
                : 'No requests match your current filter'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {request.patientName}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(
                            request.urgency
                          )}`}
                        >
                          {request.urgency} priority
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            request.status
                          )}`}
                        >
                          {request.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Age:</span> {request.patientAge}
                        </div>
                        <div>
                          <span className="font-medium">Gender:</span> {request.patientGender}
                        </div>
                        <div>
                          <span className="font-medium">Insurance:</span> {request.insurance}
                        </div>
                        <div>
                          <span className="font-medium">Type:</span> {request.appointmentType}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Request Details</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><span className="font-medium">Requested Date:</span> {request.requestDate}</p>
                        <p><span className="font-medium">Preferred Date:</span> {request.preferredDate}</p>
                        <p><span className="font-medium">Preferred Time:</span> {request.preferredTime}</p>
                        <p><span className="font-medium">Reason:</span> {request.reason}</p>
                        <p><span className="font-medium">Last Visit:</span> {request.previousVisit}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Additional Notes</h4>
                      <p className="text-sm text-gray-600 mb-4">{request.notes}</p>

                      <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><span className="font-medium">Phone:</span> {request.contactInfo.phone}</p>
                        <p><span className="font-medium">Email:</span> {request.contactInfo.email}</p>
                      </div>
                    </div>
                  </div>

                  {request.status === 'declined' && request.declineReason && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="font-medium text-red-900 mb-1">Decline Reason</h4>
                      <p className="text-sm text-red-700">{request.declineReason}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-6 flex items-center justify-between">
                    <button
                      onClick={() => handleViewPatientHistory(request.patientId)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View Patient History
                    </button>

                    {request.status === 'pending' && (
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleRequestAction(request, 'decline')}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleRequestAction(request, 'approve')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          Approve
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Response Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {responseData.action === 'approve' ? 'Approve Request' : 'Decline Request'}
                </h3>

                {selectedRequest && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium">{selectedRequest.patientName}</h4>
                    <p className="text-sm text-gray-600">{selectedRequest.reason}</p>
                  </div>
                )}

                <div className="space-y-4">
                  {responseData.action === 'approve' ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Appointment Date
                        </label>
                        <input
                          type="date"
                          value={responseData.appointmentDate}
                          onChange={(e) => setResponseData(prev => ({ 
                            ...prev, 
                            appointmentDate: e.target.value 
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Appointment Time
                        </label>
                        <input
                          type="time"
                          value={responseData.appointmentTime}
                          onChange={(e) => setResponseData(prev => ({ 
                            ...prev, 
                            appointmentTime: e.target.value 
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                    </>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Decline Reason
                      </label>
                      <textarea
                        value={responseData.notes}
                        onChange={(e) => setResponseData(prev => ({ 
                          ...prev, 
                          notes: e.target.value 
                        }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Please provide a reason for declining..."
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      value={responseData.notes}
                      onChange={(e) => setResponseData(prev => ({ 
                        ...prev, 
                        notes: e.target.value 
                      }))}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Any additional notes for the patient..."
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitResponse}
                    disabled={loading}
                    className={`px-4 py-2 rounded-lg text-white font-medium ${
                      responseData.action === 'approve'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-red-600 hover:bg-red-700'
                    } disabled:opacity-50`}
                  >
                    {loading ? 'Processing...' : 
                     responseData.action === 'approve' ? 'Approve Request' : 'Decline Request'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientRequests;