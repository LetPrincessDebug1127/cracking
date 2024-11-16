## Database Schema Design

### SeverityProfiles

Bảng này lưu thông tin về mức độ nghiêm trọng (severity) và điểm thưởng (sun points) của từng người dùng.  
**`user_id`** được tham chiếu từ `_id` của bảng `User` trong MongoDB.

| **Tên cột**           | **Kiểu dữ liệu** | **Ghi chú**                                                 |
| --------------------- | ---------------- | ----------------------------------------------------------- |
| `profile_id`          | INT (PK)         | Khóa chính, tự tăng                                         |
| `user_id`             | STRING           | ID của user trong MongoDB                                   |
| `severity_percentage` | DECIMAL(5, 2)    | Mức độ severity theo %                                      |
| `sun_points`          | INT              | Điểm "mặt trời" đã tích lũy, mỗi 30 điểm giảm 0.5% severity |

---

### DailyTasks

Bảng này quản lý các nhiệm vụ hàng ngày mà người dùng cần hoàn thành để nhận điểm thưởng.  
**`user_id`** được tham chiếu từ `_id` của bảng `User` trong MongoDB.

| **Tên cột**        | **Kiểu dữ liệu** | **Ghi chú**                        |
| ------------------ | ---------------- | ---------------------------------- |
| `task_id`          | INT (PK)         | Khóa chính, tự tăng                |
| `user_id`          | STRING           | ID của user trong MongoDB          |
| `task_description` | VARCHAR(255)     | Mô tả nhiệm vụ                     |
| `completed`        | BOOLEAN          | Trạng thái hoàn thành (true/false) |
| `date`             | DATE             | Ngày tạo nhiệm vụ                  |

---

### Notes

- **MongoDB** được sử dụng để lưu thông tin người dùng như `username`, `password`, và các trường bảo mật khác.
- **SQL** được sử dụng để quản lý dữ liệu có cấu trúc rõ ràng liên quan đến severity và daily tasks.
- **Kết hợp MongoDB và SQL**: Dữ liệu `user_id` trong SQL là `_id` từ MongoDB, giúp liên kết hai loại cơ sở dữ liệu.
