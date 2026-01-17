import { useEffect, useState } from 'react';
import { getToken } from 'firebase/messaging';
import { messaging } from './firebase';   // your firebase-init file
import { Snackbar, Alert, Button } from '@mui/material';


const setToLocalStorage = (key: string, value: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  };

  const setToSessionStorage = (key: string, value: string): void => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(key, value);
    }
  };
  const getFromSessionStorage = (key: string) => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(key);
    }
    return null;
  };
  const getFromLocalStorage = (key: string) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  };


export function useFCMToken() {
  const [open, setOpen] = useState(false);
  const [FcmToken, setFcmToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user previously blocked notifications
  const isBlocked = () => {
    try {
      return getFromLocalStorage('fcm-notifications-blocked') === 'true';
    } catch {
      // Fallback: check if browser permission is explicitly denied
      return Notification.permission === 'denied';
    }
  };

  // Save user's block decision
  const setBlocked = (blocked: boolean) => {
    try {
      if (blocked) {
        localStorage.setItem('fcm-notifications-blocked', 'true');
      } else {
        localStorage.removeItem('fcm-notifications-blocked');
      }
    } catch {
      // localStorage not available, rely on browser permission state
      console.log('localStorage not available, using browser permission state');
    }
  };

  // Directly request browser permission and get token
  const handleAllowNotifications = async () => {
    setOpen(false);
    
    try {
      // Request browser permission directly
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        console.log('Notification permission denied by browser');
        setBlocked(true);
        setLoading(false);
        return;
      }

      // Clear any previous block state since user now allowed
      setBlocked(false);

      // Fetch FCM token immediately after permission is granted
      const t = await getToken(messaging, {
        vapidKey:
          'BM5pwiaQhJ85FWWuMDNIN2LhVonmmnjWt1TEtA-v7N7qE3vUsrbQuCgOZQeVN-Ol-Nq2UNfOac8k1G4gdJjWYRA',
      });
      
      setFcmToken(t);
      console.log('FCM token retrieved successfully');
    } catch (err) {
      console.error('Error retrieving FCM token:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockNotifications = () => {
    setOpen(false);
    console.log('User declined notifications');
    setBlocked(true);
    setLoading(false);
  };

  // ---------- Main effect ----------
  useEffect(() => {
    (async () => {
      // Check if user previously blocked notifications
      if (isBlocked()) {
        console.log('Notifications previously blocked by user');
        setLoading(false);
        return;
      }

      // Check current browser permission state
      if (Notification.permission === 'granted') {
        // Permission already granted, get token directly
        try {
          const t = await getToken(messaging, {
            vapidKey:
              'BM5pwiaQhJ85FWWuMDNIN2LhVonmmnjWt1TEtA-v7N7qE3vUsrbQuCgOZQeVN-Ol-Nq2UNfOac8k1G4gdJjWYRA',
          });
          setFcmToken(t);
          console.log('Using existing notification permission');
        } catch (err) {
          console.error('Error retrieving FCM token:', err);
        } finally {
          setLoading(false);
        }
        return;
      }

      if (Notification.permission === 'denied') {
        // Browser permission explicitly denied
        console.log('Notification permission denied by browser');
        setBlocked(true);
        setLoading(false);
        return;
      }

      // Permission is 'default' - show snackbar to ask user
      setOpen(true);
    })();
  }, []);

  // ---------- Snackbar JSX ----------
  const snackbar = (
    <div className='snackbar-container'>
      <Snackbar
        open={open}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        // Don't auto-hide so user must make a choice
      >
        <Alert
          severity="info"
          action={
            <>
              <Button color="inherit" onClick={handleAllowNotifications}>
                Allow
              </Button>
              <Button color="inherit" onClick={handleBlockNotifications}>
                Block
              </Button>
            </>
          }
        >
          We'd like to send you notifications for important updates.
        </Alert>
      </Snackbar>
    </div>
  );

  return { FcmToken, loading, snackbar };
}