import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { removeNotification } from '../redux/notificationSlice';

export function NotificationDisplay() {
  const dispatch = useDispatch();
  const uiNotifications = useSelector((state) => state.notifications.uiNotifications);

  useEffect(() => {
    uiNotifications.forEach((notification) => {
      // Display the notification using sonner
      switch (notification.type) {
        case 'success':
          toast.success(notification.message, {
            id: notification.id, // Use the notification id to prevent duplicates
            duration: 5000,
            onDismiss: () => dispatch(removeNotification(notification.id)),
            onAutoClose: () => dispatch(removeNotification(notification.id)),
          });
          break;
        case 'error':
          toast.error(notification.message, {
            id: notification.id,
            duration: 7000,
            onDismiss: () => dispatch(removeNotification(notification.id)),
            onAutoClose: () => dispatch(removeNotification(notification.id)),
          });
          break;
        case 'info':
        default:
          toast.info(notification.message, {
            id: notification.id,
            duration: 5000,
            onDismiss: () => dispatch(removeNotification(notification.id)),
            onAutoClose: () => dispatch(removeNotification(notification.id)),
          });
          break;
      }
    });
  }, [uiNotifications, dispatch]);

  return null; // This component doesn't render anything visible directly
}
