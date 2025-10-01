import React, { useState, useEffect } from 'react';
import { CheckCircle, X, AlertCircle, Info } from 'lucide-react';

export const Toast = ({ type = 'success', message, onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  const colors = {
    success: 'bg-green-100 border-green-400 text-green-700',
    error: 'bg-red-100 border-red-400 text-red-700',
    info: 'bg-blue-100 border-blue-400 text-blue-700',
  };

  return (
    <div className={`fixed top-5 right-5 px-4 py-3 rounded-lg shadow-lg border flex items-center z-50 animate-fade-in max-w-md ${colors[type]}`}>
      {icons[type]}
      <span className="ml-3 block sm:inline text-sm">{message}</span>
      <button onClick={onClose} className="ml-4 p-1 rounded-full hover:bg-black/10 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const LoadingButton = ({ loading, children, ...props }) => (
  <button
    {...props}
    disabled={loading || props.disabled}
    className={`${props.className} transition-all duration-200 ${loading ? 'opacity-75' : ''}`}
  >
    {loading ? (
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        <span>Cargando...</span>
      </div>
    ) : children}
  </button>
);

export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="text-center py-12">
    <Icon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
    <h3 className="text-xl font-semibold text-gray-600 mb-2">{title}</h3>
    <p className="text-gray-500 mb-6">{description}</p>
    {action}
  </div>
);