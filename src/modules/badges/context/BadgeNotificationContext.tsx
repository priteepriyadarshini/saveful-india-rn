import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Badge, UserBadge } from '../api/types';
import BadgeEarnedModal from '../components/BadgeEarnedModal';

interface BadgeNotification {
  badge: Badge;
  earnedReason?: string;
  userBadge?: UserBadge;
}

interface BadgeNotificationContextType {
  showBadgeNotification: (badge: Badge, earnedReason?: string, userBadge?: UserBadge) => void;
  queueBadgeNotifications: (notifications: BadgeNotification[]) => void;
}

const BadgeNotificationContext = createContext<BadgeNotificationContextType | undefined>(undefined);

export const useBadgeNotification = () => {
  const context = useContext(BadgeNotificationContext);
  if (!context) {
    throw new Error('useBadgeNotification must be used within BadgeNotificationProvider');
  }
  return context;
};

export const BadgeNotificationProvider = ({ children }: { children: ReactNode }) => {
  const [queue, setQueue] = useState<BadgeNotification[]>([]);
  const [currentBadge, setCurrentBadge] = useState<BadgeNotification | null>(null);

  const handleClose = useCallback(() => {
    // Clear current badge and show next from queue
    setCurrentBadge(null);
    
    setTimeout(() => {
      setQueue(prev => {
        if (prev.length === 0) {
          return [];
        }
        const [next, ...rest] = prev;
        setCurrentBadge(next);
        return rest;
      });
    }, 300);
  }, []);

  const showBadgeNotification = useCallback((badge: Badge, earnedReason?: string, userBadge?: UserBadge) => {
    const notification: BadgeNotification = {
      badge,
      earnedReason,
      userBadge,
    };

    setCurrentBadge(prev => {
      // If no badge is currently showing, show this one immediately
      if (!prev) {
        return notification;
      }
      // Otherwise, add to queue
      setQueue(q => [...q, notification]);
      return prev;
    });
  }, []);

  const queueBadgeNotifications = useCallback((notifications: BadgeNotification[]) => {
    if (notifications.length === 0) return;

    setCurrentBadge(prev => {
      if (!prev) {
        // Show first badge immediately, queue the rest
        setQueue(notifications.slice(1));
        return notifications[0];
      }
      // Add all to queue
      setQueue(q => [...q, ...notifications]);
      return prev;
    });
  }, []);

  const contextValue: BadgeNotificationContextType = {
    showBadgeNotification,
    queueBadgeNotifications,
  };

  return (
    <BadgeNotificationContext.Provider value={contextValue}>
      {children}
      <BadgeEarnedModal
        isVisible={!!currentBadge}
        badge={currentBadge?.badge || null}
        earnedReason={currentBadge?.earnedReason}
        onClose={handleClose}
      />
    </BadgeNotificationContext.Provider>
  );
};
