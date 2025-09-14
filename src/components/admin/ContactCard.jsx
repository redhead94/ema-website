import React, { useState } from 'react';
import { Mail, Edit, X, Check, Calendar } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function ContactCard({ c, onUpdateStatus, formatDate }) {
  const [showEditModal, setShowEditModal] = useState(false);

  const statusOptions = [
    { value: 'unread', label: 'Unread' },
    { value: 'read', label: 'Read' },
    { value: 'responded', label: 'Responded' }
  ];

  const initials = (c.name || 'C').split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:border-gray-300">
        
        {/* Header section */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center text-white font-semibold">
                {initials}
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 text-lg">{c.name}</h4>
                <p className="text-sm text-slate-500">
                  Sent {formatDate(c.createdAt)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <StatusBadge status={c.status || 'unread'} />
              <button 
                onClick={() => setShowEditModal(true)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Edit contact"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Contact Details */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
            <Mail className="w-4 h-4 text-slate-500" />
            <a className="text-sm text-slate-700 hover:text-blue-600 transition-colors truncate font-medium" 
               href={`mailto:${c.email}`}>
              {c.email}
            </a>
          </div>
        </div>

        {/* Message Content */}
        <div className="px-6 pb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">
              {c.message}
            </p>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowEditModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center text-white font-semibold">
                  {initials}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Edit Contact</h2>
                  <p className="text-sm text-gray-500">{c.name}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
              
              {/* Contact Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900">{c.email}</p>
                      <a href={`mailto:${c.email}`} className="text-sm text-blue-600 hover:text-blue-700">
                        Send Email
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Submitted</p>
                      <p className="font-medium text-gray-900">{formatDate(c.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
                <div className="grid grid-cols-1 gap-3">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => onUpdateStatus('contacts', c.id, option.value)}
                      className={`p-4 rounded-lg border transition-all text-left ${
                        (c.status || 'unread') === option.value 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{option.label}</span>
                        {(c.status || 'unread') === option.value && (
                          <Check className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Content */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Message</h3>
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">
                    {c.message}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <a 
                href={`mailto:${c.email}?subject=Re: Your Message&body=Hi ${c.name},%0D%0A%0D%0A`}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium"
              >
                Reply via Email
              </a>
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