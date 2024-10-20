const startButton = document.getElementById('startGame');
const guessButton = document.getElementById('guessButton');
const guessInput = document.getElementById('guessInput');
const messageDiv = document.getElementById('message');
const gameSection = document.getElementById('gameSection');
const registrationForm = document.getElementById('registrationForm');
const loginForm = document.getElementById('loginForm');
const registrationPrompt = document.getElementById('registrationPrompt');

// Người dùng chọn "Có" cho câu hỏi "có muốn đăng ký tài khoản không"
document.getElementById('registerYes').addEventListener('click', () => {
  registrationPrompt.style.display = 'none'; // Typo fixed ('dislay' -> 'display')
  registrationForm.style.display = 'block';
});

// Xử lý khi người dùng chọn "Không"
document.getElementById('registerNo').addEventListener('click', () => {
  registrationPrompt.style.display = 'none';
  startButton.style.display = 'block';
});

// Xử lý khi người dùng nhấn "Tôi đã có tài khoản"
document.getElementById('loginLink').addEventListener('click', () => {
  registrationPrompt.style.display = 'none';
  loginForm.style.display = 'block'; // Typo fixed ('loginFrom' -> 'loginForm')
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
      const data = await response.json();
      alert('Đăng ký thành công!'); // Hiển thị thông báo thành công
      startButton.style.display = 'block'; // Hiện nút bắt đầu trò chơi
      registrationForm.style.display = 'none'; // Ẩn form đăng ký
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
    alert(data.message); // Hiển thị thông báo từ server
    startButton.style.display = 'block'; // Hiện nút bắt đầu trò chơi
    loginForm.style.display = 'none'; // Ẩn form đăng nhập
  } else {
    const error = await response.json();
    alert('Đăng nhập thất bại: ' + error.message); // Hiển thị lỗi từ server
  }
});

startButton.addEventListener('click', async () => {
  messageDiv.innerText = 'Trò chơi đang bắt đầu...';
  gameSection.style.display = 'block';
});

guessButton.addEventListener('click', async () => {
  const guess = guessInput.value;
  if (!guess) {
    messageDiv.innerText = 'Vui lòng nhập số!';
    return;
  }

  const response = await fetch(
    `http://localhost:5000/game/guess?number=${guess}`,
    {
      method: 'POST',
    },
  );

  const data = await response.text();
  messageDiv.innerText = data;
  guessInput.value = '';
});
