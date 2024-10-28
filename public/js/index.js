const startButton = document.getElementById('startGame');
const guessButton = document.getElementById('guessButton');
const guessInput = document.getElementById('guessInput');
const messageDiv = document.getElementById('message');
const gameSection = document.getElementById('gameSection');
const registrationForm = document.getElementById('registrationForm');
const loginForm = document.getElementById('loginForm');
const registrationPrompt = document.getElementById('registrationPrompt');
const loginWGG = document.getElementById('loginwithGG');

// Người dùng chọn "Có" cho câu hỏi "Có muốn đăng ký tài khoản không"
document.getElementById('registerYes').addEventListener('click', () => {
  registrationPrompt.style.display = 'none'; // Ẩn prompt đăng ký
  registrationForm.style.display = 'block'; // Hiện form đăng ký
  loginWGG.style.display = 'none';
});

// Xử lý khi người dùng chọn "Không"
document.getElementById('registerNo').addEventListener('click', () => {
  registrationPrompt.style.display = 'none'; // Ẩn prompt đăng ký
  startButton.style.display = 'block'; // Hiện nút bắt đầu trò chơi
  loginWGG.style.display = 'none';
});

// Xử lý khi người dùng nhấn "Tôi đã có tài khoản"
document.getElementById('loginLink').addEventListener('click', () => {
  registrationPrompt.style.display = 'none'; // Ẩn prompt đăng ký
  loginForm.style.display = 'block'; // Hiện form đăng nhập
  loginWGG.style.display = 'none';
});

// Xử lý khi người dùng nhấn nút đăng ký
document
  .getElementById('registerButton')
  .addEventListener('click', async () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Gửi yêu cầu đăng ký đến máy chủ
    const response = await fetch('http://localhost:5000/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      alert('Đăng ký thành công!'); // Hiển thị thông báo thành công
      startButton.style.display = 'block'; // Hiện nút bắt đầu trò chơi
      registrationForm.style.display = 'none'; // Ẩn form đăng ký
      loginWGG.style.display = 'none';
    } else {
      const error = await response.json();
      alert('Đăng ký thất bại: ' + error.message); // Hiển thị lỗi từ server
    }
  });

// Xử lý khi người dùng nhấn nút đăng nhập
document.getElementById('loginButton').addEventListener('click', async () => {
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;

  // Gửi yêu cầu đăng nhập đến máy chủ
  const response = await fetch('http://localhost:5000/users/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (response.ok) {
    const data = await response.json();
    alert(data.message);
    startButton.style.display = 'block';
    loginForm.style.display = 'none';
    loginWGG.style.display = 'none';

    sessionStorage.setItem('username', username); // Lưu tên người dùng vào session
  } else {
    const error = await response.json();
    alert('Đăng nhập thất bại: ' + error.message); // Hiển thị lỗi từ server
  }
});

startButton.addEventListener('click', () => {
  messageDiv.innerText = 'Trò chơi đang bắt đầu...';
  gameSection.style.display = 'block';
  startButton.style.display = 'none';
  loginWGG.style.display = 'none';
});

guessButton.addEventListener('click', async () => {
  const guess = guessInput.value;
  const username = sessionStorage.getItem('username');

  if (!guess) {
    messageDiv.innerText = 'Vui lòng nhập số!';
    return;
  }

  const response = await fetch(
    `http://localhost:5000/game/guess?number=${guess}&username=${username}`,
    {
      method: 'POST',
    },
  );

  const data = await response.text();
  messageDiv.innerText = data;

  if (data.includes('Chúc mừng')) {
    logoutButton.style.display = 'block';
  }

  guessInput.value = '';
});

const logoutButton = document.getElementById('logoutButton');
const findMore = document.getElementById('find-more');

logoutButton.addEventListener('click', () => {
  sessionStorage.removeItem('username');
  startButton.style.display = 'none';
  logoutButton.style.display = 'none';
  gameSection.style.display = 'none';
  startButton.style.display = 'block';
  findMore.style.display = 'block';
  loginWGG.style.display = 'none';
});
