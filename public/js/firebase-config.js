import * as firebaseApp from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js';
import * as firebaseAuth from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import {
  getMessaging,
  getToken,
  onMessage,
} from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging.js';

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyB1dDkaJyBHWme7NgjbOV4JR4xdlaQryAI',
  authDomain: 'zhu-zhu-b4c42.firebaseapp.com',
  projectId: 'zhu-zhu-b4c42',
  storageBucket: 'zhu-zhu-b4c42.appspot.com',
  messagingSenderId: '543127350127',
  appId: '1:543127350127:web:186064d1322b020781d69a',
  measurementId: 'G-1B3B5L2DCT',
};

// Initialize Firebase app
const app = firebaseApp.initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = firebaseAuth.getAuth(app);
console.log('Firebase Auth:', auth.__proto__);

// Sign-in with Google
document.getElementById('loginwithGG').addEventListener('click', () => {
  const provider = new firebaseAuth.GoogleAuthProvider();
  firebaseAuth
    .signInWithPopup(auth, provider)
    .then((result) => {
      result.user.getIdToken().then((token) => {
        console.log('ID Token:', token);
        fetch('http://localhost:5667/api/auth/verify-token-google', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idToken: token }),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log(data);
          })
          .catch((error) => {
            console.error(error);
          });
      });
    })
    .catch((error) => {
      console.error('Error during sign-in:', error);
    });
});

// Firebase Messaging
const messaging = getMessaging(app);

// Request permission for notifications and get the token
async function requestPermissionAndGetToken() {
  try {
    console.log('Requesting notification permission...');
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      console.log('Notification permission granted.');

      const currentToken = await getToken(messaging, {
        vapidKey:
          'BB2JcGJ8ni1z2rbf8uHA_gAzUU6NICilSqe6r_A0pneDTtwMeC7eP7GTU39WPnAJRT1JR5Ojq-9AocEZcxIxRFU',
      });

      if (currentToken) {
        console.log('FCM Token:', currentToken);
      } else {
        console.log('No registration token available.');
      }
    } else {
      console.log('Notification permission denied.');
    }
  } catch (err) {
    console.error('Error during permission request or token retrieval:', err);
  }
}
console.log('check here');

// Register the Service Worker
if ('serviceWorker' in navigator) {
  console.log('check here');
  navigator.serviceWorker
    .register('/firebase-messaging-sw.js', { type: 'module' })

    .then((registration) => {
      console.log('Service Worker registered with scope:', registration.scope);

      // Attach the service worker to Firebase Messaging
      getToken(messaging, {
        vapidKey:
          'BB2JcGJ8ni1z2rbf8uHA_gAzUU6NICilSqe6r_A0pneDTtwMeC7eP7GTU39WPnAJRT1JR5Ojq-9AocEZcxIxRFU',
        serviceWorkerRegistration: registration,
      })
        .then((currentToken) => {
          if (currentToken) {
            console.log('FCM Token:', currentToken);
          } else {
            console.log('No registration token available.');
          }
        })
        .catch((err) => {
          console.error('Error retrieving FCM token:', err);
        });
    })
    .catch((err) => {
      console.error('Service Worker registration failed:', err);
    });
} else {
  console.warn('Service Worker is not supported in this browser.');
}

// Listen for foreground messages
onMessage(messaging, (payload) => {
  console.log('Foreground message received: ', payload);

  // Display the notification
  const notificationTitle = 'Foreground Message Title';
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png',
  };

  // Show notification
  new Notification(notificationTitle, notificationOptions);
});

// Add event listener for requesting permission and getting the token
document
  .getElementById('request-permission')
  .addEventListener('click', requestPermissionAndGetToken);
