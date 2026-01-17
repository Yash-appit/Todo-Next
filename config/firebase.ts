
// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, FacebookAuthProvider } from 'firebase/auth';
import { getMessaging, getToken } from 'firebase/messaging';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAibXUuaf2o7CCJRo9qUptVLlYRzX2niVE",
  authDomain: "todo-resume-ab0a2.firebaseapp.com",
  projectId: "todo-resume-ab0a2",
  storageBucket: "todo-resume-ab0a2.firebasestorage.app",
  messagingSenderId: "283331759071",
  appId: "1:283331759071:web:4365c7063b84211485926a",
  measurementId: "G-E4ZSRVKQPZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
let messaging: any = null;

if (typeof window !== 'undefined') {
  messaging = getMessaging(app);
}

export { auth, googleProvider, facebookProvider, messaging };
// Configure Google Auth Provider (optional settings)
googleProvider.setCustomParameters({
    prompt: 'select_account', // Force account selection
});



export async function getFCMToken() {
    try {
      // Request permission for notifications (required for web)
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        // Get the FCM token
        const currentToken = await getToken(messaging, { 
          vapidKey: 'BM5pwiaQhJ85FWWuMDNIN2LhVonmmnjWt1TEtA-v7N7qE3vUsrbQuCgOZQeVN-Ol-Nq2UNfOac8k1G4gdJjWYRA' // Get this from Firebase Console -> Project Settings -> Cloud Messaging
          
        });
        
        if (currentToken) {
          // console.log('FCM Token:', currentToken);
          return currentToken;
        } else {
          console.log('No registration token available. Request permission to generate one.');
          return null;
        }
      } else {
        console.log('Notification permission denied');
        return null;
      }
    } catch (error) {
      console.error('An error occurred while retrieving token:', error);
      return null;
    }
  }