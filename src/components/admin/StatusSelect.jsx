import React from 'react';

export default function StatusSelect({ value, onChange, options = ['pending','active','completed'], className = '' }) {
  return (
    <select
      value={value || options[0]}
      onChange={(e) => onChange(e.target.value)}
      className={`text-xs border border-gray-300 rounded px-2 py-1 ${className}`}
    >
      {options.map(opt => <option key={opt} value={opt}>{opt[0].toUpperCase() + opt.slice(1)}</option>)}
    </select>
  );
}
