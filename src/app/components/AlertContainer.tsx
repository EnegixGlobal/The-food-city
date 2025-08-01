"use client";

import React, { useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';
import { useAlertStore, Alert } from '../zustand/alertStore';

const AlertComponent: React.FC<{ alert: Alert }> = ({ alert }) => {
  const { hideAlert, removeAlert } = useAlertStore();

  const handleClose = () => {
    hideAlert(alert.id);
    setTimeout(() => {
      removeAlert(alert.id);
    }, 300);
  };

  const getAlertStyles = () => {
    switch (alert.type) {
      case 'success':
        return {
          bgColor: 'bg-green-50 border-green-200',
          iconColor: 'text-green-600',
          titleColor: 'text-green-800',
          messageColor: 'text-green-700',
          icon: FaCheckCircle,
          progressBar: 'bg-green-500'
        };
      case 'error':
        return {
          bgColor: 'bg-red-50 border-red-200',
          iconColor: 'text-red-600',
          titleColor: 'text-red-800',
          messageColor: 'text-red-700',
          icon: FaExclamationCircle,
          progressBar: 'bg-red-500'
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-50 border-yellow-200',
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-800',
          messageColor: 'text-yellow-700',
          icon: FaExclamationTriangle,
          progressBar: 'bg-yellow-500'
        };
      case 'info':
        return {
          bgColor: 'bg-blue-50 border-blue-200',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-800',
          messageColor: 'text-blue-700',
          icon: FaInfoCircle,
          progressBar: 'bg-blue-500'
        };
    }
  };

  const styles = getAlertStyles();
  const IconComponent = styles.icon;

  return (
    <div
      className={`
        ${styles.bgColor} border-l-4 rounded-r-lg shadow-xl p-4 mb-3 min-w-96 max-w-md relative overflow-hidden
        transform transition-all duration-300 ease-in-out backdrop-blur-sm
        ${alert.isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}
        hover:shadow-2xl hover:scale-105
      `}
      style={{
        backdropFilter: 'blur(10px)',
        background: alert.type === 'success' ? 'rgba(240, 253, 244, 0.95)' :
                   alert.type === 'error' ? 'rgba(254, 242, 242, 0.95)' :
                   alert.type === 'warning' ? 'rgba(255, 251, 235, 0.95)' :
                   'rgba(239, 246, 255, 0.95)'
      }}
    >
      {/* Animated border glow */}
      <div 
        className={`absolute inset-0 rounded-r-lg opacity-20 animate-pulse ${
          alert.type === 'success' ? 'bg-green-400' :
          alert.type === 'error' ? 'bg-red-400' :
          alert.type === 'warning' ? 'bg-yellow-400' :
          'bg-blue-400'
        }`}
      />
      
      {/* Progress bar */}
      <div
        className={`absolute bottom-0 left-0 h-1 ${styles.progressBar} transition-all duration-[5000ms] ease-linear rounded-r-full`}
        style={{
          width: alert.isVisible ? '0%' : '100%',
          transitionDuration: `${alert.duration}ms`,
          boxShadow: `0 0 10px ${alert.type === 'success' ? '#10b981' : 
                                   alert.type === 'error' ? '#ef4444' :
                                   alert.type === 'warning' ? '#f59e0b' : '#3b82f6'}`
        }}
      />
      
      <div className="flex items-start relative z-10">
        <div className={`${styles.iconColor} mr-3 mt-0.5 animate-bounce`}>
          <IconComponent size={20} />
        </div>
        
        <div className="flex-1">
          <h4 className={`${styles.titleColor} font-bold text-sm leading-tight`}>
            {alert.title}
          </h4>
          {alert.message && (
            <p className={`${styles.messageColor} text-xs mt-1 leading-relaxed font-medium`}>
              {alert.message}
            </p>
          )}
        </div>
        
        <button
          onClick={handleClose}
          className={`${styles.iconColor} hover:opacity-70 hover:scale-110 transition-all duration-200 ml-2 p-1 rounded-full hover:bg-white hover:bg-opacity-50`}
          aria-label="Close alert"
        >
          <FaTimes size={14} />
        </button>
      </div>
    </div>
  );
};

const AlertContainer: React.FC = () => {
  const { alerts } = useAlertStore();

  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2">
      {alerts.map((alert) => (
        <AlertComponent key={alert.id} alert={alert} />
      ))}
    </div>
  );
};

export default AlertContainer;
