import React, { useState } from 'react';
import { Mail, Phone, Users, Calendar, MapPin, Edit, X, Check, Trash2 } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function FamilyCard({
  r,
  volunteers = [],
  onUpdateStatus,
  onDelete,
  onMatch,
  onUnmatch,
}) {
  const [showEditModal, setShowEditModal] = useState(false);

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'inactive', label: 'Inactive' }
  ];

  const initials = (r.motherName || 'F').split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:border-gray-300">
        
        {/* Header section */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-pink-500 flex items-center justify-center text-white font-semibold">
                {initials}
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 text-lg">{r.motherName || 'Family'}</h4>
                <p className="text-sm text-slate-500">
                  Registered {r.createdAt ? new Date(r.createdAt?.toDate?.() ?? r.createdAt).toLocaleDateString() : ''}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <StatusBadge status={r.status} />
              <button 
                onClick={() => setShowEditModal(true)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Edit family"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Family Details */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
              <Mail className="w-4 h-4 text-slate-500" />
              <a className="text-sm text-slate-700 hover:text-blue-600 transition-colors truncate font-medium" 
                 href={`mailto:${r.motherEmail}`}>
                {r.motherEmail || 'No email provided'}
              </a>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
              <Phone className="w-4 h-4 text-slate-500" />
              <a className="text-sm text-slate-700 hover:text-blue-600 transition-colors font-medium" 
                 href={`tel:${r.motherPhone}`}>
                {r.motherPhone || 'No phone provided'}
              </a>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
              <Users className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-800 font-medium">
                {r.numberOfChildren} children
              </span>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-800 font-medium">
                Baby born: {r.babyBirthday || 'Not specified'}
              </span>
            </div>
          </div>

          {r.address && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
              <MapPin className="w-4 h-4 text-slate-500 mt-0.5" />
              <span className="text-sm text-slate-800">{r.address}</span>
            </div>
          )}
        </div>

        {/* Assigned Volunteer */}
        {r.assignedVolunteer?.volunteerId && (
          <div className="px-6 pb-6">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-slate-500" />
              <p className="text-sm font-medium text-slate-700">Assigned Volunteer</p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-50 border border-blue-200">
              <span className="text-sm font-medium text-blue-800">
                {r.assignedVolunteer.volunteerName || 'Volunteer'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowEditModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-pink-500 flex items-center justify-center text-white font-semibold">
                  {initials}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Edit Family</h2>
                  <p className="text-sm text-gray-500">{r.motherName || 'Family'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onDelete(r)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete family"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              
              {/* Status Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
                <div className="grid grid-cols-2 gap-3">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => onUpdateStatus(r.id, option.value)}
                      className={`p-4 rounded-lg border transition-all text-left ${
                        r.status === option.value 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{option.label}</span>
                        {r.status === option.value && (
                          <Check className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Current Volunteer Assignment */}
              {r.assignedVolunteer?.volunteerId && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Currently Assigned Volunteer</h3>
                  <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-gray-500" />
                      <span className="font-medium text-gray-900">
                        {r.assignedVolunteer.volunteerName || 'Volunteer'}
                      </span>
                    </div>
                    <button 
                      onClick={() => onUnmatch(r.assignedVolunteer.volunteerId, r.id)} 
                      className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors text-sm font-medium"
                    >
                      Unassign
                    </button>
                  </div>
                </div>
              )}

              {/* Assign Volunteer */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {r.assignedVolunteer?.volunteerId ? 'Assign Different Volunteer' : 'Assign Volunteer'}
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                  {volunteers.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No volunteers available</p>
                  ) : (
                    volunteers
                      .filter(v => v.id !== r.assignedVolunteer?.volunteerId)
                      .map((volunteer) => (
                        <button
                          key={volunteer.id}
                          onClick={() => onMatch(volunteer.id, r.id)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">
                                {volunteer.volunteerName || volunteer.name || 'Volunteer'}
                              </p>
                              <p className="text-sm text-gray-500">
                                {volunteer.volunteerPhone || volunteer.phone || 'No phone'}
                              </p>
                            </div>
                            <div className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                              Assign
                            </div>
                          </div>
                        </button>
                      ))
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button 
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}