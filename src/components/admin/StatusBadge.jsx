import React from 'react';

const COLORS = {
  pending:   'bg-yellow-100 text-yellow-800',
  approved:  'bg-green-100 text-green-800',
  active:    'bg-indigo-100 text-blue-800',
  completed: 'bg-gray-100 text-gray-800',
  unread:    'bg-red-100 text-red-800',
  read:      'bg-indigo-100 text-blue-800',
  responded: 'bg-green-100 text-green-800',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${COLORS[status] || 'bg-gray-100 text-gray-800'}`}>
      {status || 'unknown'}
    </span>
  );
}
