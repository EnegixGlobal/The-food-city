"use client";

import { create } from 'zustand';

export interface Alert {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  isVisible: boolean;
}

interface AlertStore {
  alerts: Alert[];
  addAlert: (alert: Omit<Alert, 'id' | 'isVisible'>) => void;
  removeAlert: (id: string) => void;
  hideAlert: (id: string) => void;
  clearAllAlerts: () => void;
}

export const useAlertStore = create<AlertStore>((set, get) => ({
  alerts: [],
  
  addAlert: (alertData) => {
    const id = Math.random().toString(36).substring(2, 15);
    const newAlert: Alert = {
      ...alertData,
      id,
      isVisible: true,
      duration: alertData.duration || 5000,
    };
    
    set((state) => ({
      alerts: [...state.alerts, newAlert]
    }));
    
    // Auto remove after duration
    setTimeout(() => {
      get().hideAlert(id);
      setTimeout(() => {
        get().removeAlert(id);
      }, 300); // Wait for hide animation
    }, newAlert.duration);
  },
  
  removeAlert: (id) => {
    set((state) => ({
      alerts: state.alerts.filter((alert) => alert.id !== id)
    }));
  },
  
  hideAlert: (id) => {
    set((state) => ({
      alerts: state.alerts.map((alert) =>
        alert.id === id ? { ...alert, isVisible: false } : alert
      )
    }));
  },
  
  clearAllAlerts: () => {
    set({ alerts: [] });
  },
}));

// Helper functions for easy use
export const showAlert = {
  success: (title: string, message?: string, duration?: number) => {
    useAlertStore.getState().addAlert({
      type: 'success',
      title,
      message,
      duration
    });
  },
  
  error: (title: string, message?: string, duration?: number) => {
    useAlertStore.getState().addAlert({
      type: 'error',
      title,
      message,
      duration: duration || 6000 // Errors stay longer
    });
  },
  
  warning: (title: string, message?: string, duration?: number) => {
    useAlertStore.getState().addAlert({
      type: 'warning',
      title,
      message,
      duration
    });
  },
  
  info: (title: string, message?: string, duration?: number) => {
    useAlertStore.getState().addAlert({
      type: 'info',
      title,
      message,
      duration
    });
  },
};
