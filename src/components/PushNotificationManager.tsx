import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { registerPushNotifications } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

export const PushNotificationManager = () => {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );

  useEffect(() => {
    if (user && permission === 'granted') {
      registerPushNotifications(user.id);
    }
  }, [user, permission]);

  const requestPermission = async () => {
    if (!('Notification' in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === 'granted' && user) {
      registerPushNotifications(user.id);
    }
  };

  if (!user || permission === 'granted' || !('Notification' in window)) {
    return null;
  }

  return (
    <button
      onClick={requestPermission}
      className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 rounded-full hover:bg-amber-100 transition-colors border border-amber-200"
    >
      <Bell className="w-3.5 h-3.5" />
      <span>Ativar Notificações</span>
    </button>
  );
};
