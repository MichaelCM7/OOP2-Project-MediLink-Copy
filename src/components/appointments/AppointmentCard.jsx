import React from 'react';
import { Calendar, Clock, MapPin, User, Phone, MessageCircle, MoreVertical } from 'lucide-react';
import { formatDate, formatTime } from '../../utils/dateUtils';

const AppointmentCard = ({ 
  appointment, 
  onReschedule, 
  onCancel, 
  onViewDetails,
  onContactDoctor,
  showActions = true,
  variant = 'default' // 'default', 'compact', 'detailed'
}) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'rescheduled':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-300';
    }
  };

  if (variant === 'compact') {
    return (
      <div className={`card hover:shadow-md transition-shadow border-l-4 ${getPriorityColor(appointment.priority)}`}>
        <div className="card-body p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-blue-lightest rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-primary-blue" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{appointment.doctorName}</h3>
                <p className="text-sm text-gray-600">{appointment.specialty}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <Calendar className="w-4 h-4 mr-1" />
                {formatDate(appointment.date)}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-1" />
                {appointment.time}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`card hover:shadow-lg transition-shadow border-l-4 ${getPriorityColor(appointment.priority)}`}>
      <div className="card-body">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary-blue-lightest rounded-full flex items-center justify-center">
              {appointment.doctorImage ? (
                <img 
                  src={appointment.doctorImage} 
                  alt={appointment.doctorName}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-primary-blue" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {appointment.doctorName}
              </h3>
              <p className="text-primary-blue font-medium">{appointment.specialty}</p>
              {appointment.subSpecialty && (
                <p className="text-sm text-gray-600">{appointment.subSpecialty}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
              {appointment.status}
            </span>
            {showActions && (
              <div className="relative">
                <button className="p-1 hover:bg-gray-100 rounded">
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Appointment Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {formatDate(appointment.date, 'EEEE, MMMM dd, yyyy')}
              </p>
              {appointment.isToday && (
                <span className="text-xs text-green-600 font-medium">Today</span>
              )}
              {appointment.isTomorrow && (
                <span className="text-xs text-blue-600 font-medium">Tomorrow</span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">{appointment.time}</p>
              {appointment.duration && (
                <p className="text-xs text-gray-500">{appointment.duration} minutes</p>
              )}
            </div>
          </div>

          {appointment.location && (
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">{appointment.location}</p>
                {appointment.room && (
                  <p className="text-xs text-gray-500">Room {appointment.room}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Appointment Type & Reason */}
        {(appointment.type || appointment.reason) && (
          <div className="mb-4">
            {appointment.type && (
              <div className="inline-flex items-center px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700 mr-2">
                {appointment.type}
              </div>
            )}
            {appointment.reason && (
              <p className="text-sm text-gray-600 mt-2">
                <span className="font-medium">Reason:</span> {appointment.reason}
              </p>
            )}
          </div>
        )}

        {/* Additional Info */}
        {appointment.notes && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Notes:</span> {appointment.notes}
            </p>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
            {appointment.status === 'pending' && (
              <>
                <button 
                  onClick={() => onReschedule?.(appointment)}
                  className="btn btn-outline btn-sm"
                >
                  Reschedule
                </button>
                <button 
                  onClick={() => onCancel?.(appointment)}
                  className="btn btn-outline btn-sm text-red-600 border-red-300 hover:bg-red-50"
                >
                  Cancel
                </button>
              </>
            )}
            
            {appointment.status === 'confirmed' && (
              <>
                <button 
                  onClick={() => onContactDoctor?.(appointment)}
                  className="btn btn-outline btn-sm"
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Message
                </button>
                <button 
                  onClick={() => onReschedule?.(appointment)}
                  className="btn btn-outline btn-sm"
                >
                  Reschedule
                </button>
              </>
            )}

            <button 
              onClick={() => onViewDetails?.(appointment)}
              className="btn btn-primary btn-sm ml-auto"
            >
              View Details
            </button>
          </div>
        )}

        {/* Emergency Badge */}
        {appointment.isEmergency && (
          <div className="absolute top-2 right-2">
            <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
              Emergency
            </span>
          </div>
        )}

        {/* Telemedicine Badge */}
        {appointment.isTelemedicine && (
          <div className="mt-3">
            <div className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Video Consultation
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;