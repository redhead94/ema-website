import React, { useState } from 'react';
import { Mail, Phone, DollarSign, Edit, X, Check, Calendar, ExternalLink } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function DonationCard({ d, formatDate, onUpdateStatus }) {
  const [showEditModal, setShowEditModal] = useState(false);
  const amount = d.amountDisplay || `$${((d.amountCents || 0) / 100).toFixed(2)}`;

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' }
  ];

  const initials = (d.donorName || 'D').split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:border-gray-300">
        
        {/* Header section */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-semibold">
                {initials}
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 text-lg">{d.donorName || 'Anonymous'}</h4>
                <p className="text-sm text-slate-500">
                  Donated {formatDate(d.createdAt)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <StatusBadge status={d.status} />
              <span className="text-lg font-bold text-emerald-600">{amount}</span>
              {onUpdateStatus && (
                <button 
                  onClick={() => setShowEditModal(true)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Edit donation"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Donor Details */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
              <Mail className="w-4 h-4 text-slate-500" />
              <a className="text-sm text-slate-700 hover:text-blue-600 transition-colors truncate font-medium" 
                 href={`mailto:${d.donorEmail}`}>
                {d.donorEmail || 'No email provided'}
              </a>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
              <Phone className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-700 font-medium">
                {d.donorPhone || 'No phone provided'}
              </span>
            </div>
          </div>

          {d.receiptUrl && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
              <DollarSign className="w-4 h-4 text-slate-500" />
              <a 
                href={d.receiptUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                View receipt
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        {/* Donor Message */}
        {d.donorMessage && (
          <div className="px-6 pb-6">
            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
              <p className="text-sm text-emerald-900">
                <span className="font-semibold">Message: </span>
                {d.donorMessage}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal - Only show if onUpdateStatus is provided */}
      {showEditModal && onUpdateStatus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowEditModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-semibold">
                  {initials}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Edit Donation</h2>
                  <p className="text-sm text-gray-500">{d.donorName || 'Anonymous'} • {amount}</p>
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
              
              {/* Donation Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Donation Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <DollarSign className="w-5 h-5 text-emerald-500" />
                    <div>
                      <p className="font-bold text-emerald-600 text-lg">{amount}</p>
                      <p className="text-sm text-gray-600">Donation Amount</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900">{formatDate(d.createdAt)}</p>
                      <p className="text-sm text-gray-600">Donation Date</p>
                    </div>
                  </div>
                  {d.donorEmail && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                      <Mail className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900">{d.donorEmail}</p>
                        <a href={`mailto:${d.donorEmail}`} className="text-sm text-blue-600 hover:text-blue-700">
                          Send Thank You Email
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
                <div className="grid grid-cols-2 gap-3">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => onUpdateStatus('donations', d.id, option.value)}
                      className={`p-4 rounded-lg border transition-all text-left ${
                        d.status === option.value 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{option.label}</span>
                        {d.status === option.value && (
                          <Check className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Donor Message */}
              {d.donorMessage && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Donor Message</h3>
                  <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                    <p className="text-sm text-emerald-900 leading-relaxed">
                      {d.donorMessage}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              {d.receiptUrl && (
                <a 
                  href={d.receiptUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <DollarSign className="w-4 h-4" />
                  View Receipt
                </a>
              )}
              <div className="flex items-center gap-3">
                {d.donorEmail && (
                  <a 
                    href={`mailto:${d.donorEmail}?subject=Thank you for your donation&body=Dear ${d.donorName || 'Friend'},%0D%0A%0D%0AThank you so much for your generous donation of ${amount}.%0D%0A%0D%0A`}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium"
                  >
                    Send Thank You
                  </a>
                )}
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}