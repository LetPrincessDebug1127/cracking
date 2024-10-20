const startButton = document.getElementById('startGame');
const guessButton = document.getElementById('guessButton');
const guessInput = document.getElementById('guessInput');
const messageDiv = document.getElementById('message');
const gameSection = document.getElementById('gameSection');
const registrationForm = document.getElementById('registrationForm');
const loginForm = document.getElementById('loginForm');
const registrationPrompt = document.getElementById('registrationPrompt');

// Người dùng chọn "Có" cho câu hỏi "Có muốn đăng ký tài khoản không"
document.getElementById('registerYes').addEventListener('click', () => {
  registrationPrompt.style.display = 'none'; // Ẩn prompt đăng ký
  registrationForm.style.display = 'block'; // Hiện form đăng ký
});

// Xử lý khi người dùng chọn "Không"
document.getElementById('registerNo').addEventListener('click', () => {
  registrationPrompt.style.display = 'none'; // Ẩn prompt đăng ký
  startButton.style.display = 'block'; // Hiện nút bắt đầu trò chơi
});

// Xử lý khi người dùng nhấn "Tôi đã có tài khoản"
document.getElementById('loginLink').addEventListener('click', () => {
  registrationPrompt.style.display = 'none'; // Ẩn prompt đăng ký
  loginForm.style.display = 'block'; // Hiện form đăng nhập
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
    sessionStorage.setItem('username', username); // Lưu tên người dùng vào session
  } else {
    const error = await response.json();
    alert('Đăng nhập thất bại: ' + error.message); // Hiển thị lỗi từ server
  }
});

// Xử lý khi người dùng nhấn nút bắt đầu trò chơi
startButton.addEventListener('click', () => {
  messageDiv.innerText = 'Trò chơi đang bắt đầu...'; // Thông báo bắt đầu trò chơi
  gameSection.style.display = 'block'; // Hiện phần chơi trò chơi
  startButton.style.display = 'none'; // Ẩn nút bắt đầu sau khi nhấn
});

/// Xử lý khi người dùng nhấn nút đoán
guessButton.addEventListener('click', async () => {
  const guess = guessInput.value;
  const username = sessionStorage.getItem('username'); // Lấy tên người dùng từ session

  if (!guess) {
    messageDiv.innerText = 'Vui lòng nhập số!'; // Thông báo nếu không có giá trị
    return;
  }

  const response = await fetch(
    `http://localhost:5000/game/guess?number=${guess}&username=${username}`, // Thêm username vào URL
    {
      method: 'POST',
    },
  );

  const data = await response.text(); // Nhận phản hồi từ server
  messageDiv.innerText = data; // Hiển thị thông điệp từ server
  guessInput.value = ''; // Xóa input đoán

  // Kiểm tra xem người dùng đã đoán đúng số hay chưa

  logoutButton.style.display = 'block'; // Hiện nút đăng xuất
});

const logoutButton = document.getElementById('logoutButton');

// Xử lý khi người dùng nhấn nút đăng xuất
logoutButton.addEventListener('click', () => {
  sessionStorage.removeItem('username'); // Xóa tên người dùng khỏi session
  startButton.style.display = 'none'; // Ẩn nút bắt đầu trò chơi
  // Hiển thị lại form đăng nhập
  logoutButton.style.display = 'none';
  gameSection.style.display = 'none';
  startButton.style.display = 'block';
});
