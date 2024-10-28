// // login.js
// import firebase from 'firebase/app';
// import 'firebase/auth';
// import './firebase-config'; // Nhập cấu hình Firebase

// // Tạo một provider cho Google
// const provider = new firebase.auth.GoogleAuthProvider();

// // Lấy phần tử DOM
// const loginWithGGButton = document.getElementById('loginwithGG');

// // Thêm sự kiện click vào nút
// loginWithGGButton.addEventListener('click', () => {
//   // Đăng nhập bằng Google
//   firebase
//     .auth()
//     .signInWithPopup(provider)
//     .then((result) => {
//       // Lấy ID token
//       result.user.getIdToken().then((token) => {
//         console.log('ID Token:', token);
//         // Gửi token này đến backend của bạn để xác thực
//         fetch('http://localhost:5657/api/auth/verify-token-google', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({ token }), // Gửi token vào body
//         })
//           .then((response) => response.json())
//           .then((data) => {
//             console.log('Backend response:', data);
//           })
//           .catch((error) => {
//             console.error('Error sending token to backend:', error);
//           });
//       });
//     })
//     .catch((error) => {
//       console.error('Error during sign-in:', error);
//     });
// });
