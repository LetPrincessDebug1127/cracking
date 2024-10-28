import * as firebaseApp from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js';
import * as firebaseAuth from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';

console.log('Firebase auth:', firebaseAuth); // Dòng này cho biết trong firebase auth có những biến gì hàm gì
console.log('Firebase app:', firebaseApp); // Tương tự như trên nhưng dành cho firebase app

const firebaseConfig = {
  apiKey: 'AIzaSyB1dDkaJyBHWme7NgjbOV4JR4xdlaQryAI',
  authDomain: 'zhu-zhu-b4c42.firebaseapp.com',
  projectId: 'zhu-zhu-b4c42',
  storageBucket: 'zhu-zhu-b4c42.appspot.com',
  messagingSenderId: '543127350127',
  appId: '1:543127350127:web:186064d1322b020781d69a',
  measurementId: 'G-1B3B5L2DCT',
};

const app = firebaseApp.initializeApp(firebaseConfig);

const auth = firebaseAuth.getAuth(app);
console.log('auth:', auth.__proto__);

document.getElementById('loginwithGG').addEventListener('click', () => {
  const provider = new firebaseAuth.GoogleAuthProvider();
  firebaseAuth
    .signInWithPopup(auth, provider)
    .then((result) => {
      result.user.getIdToken().then((token) => {
        console.log('ID Token:', token);
        fetch('http://localhost:5658/api/auth/verify-token-google', {
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
