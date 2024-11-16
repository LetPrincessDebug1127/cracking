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
| `user_id`          | STRING (FK)      | ID của user trong MongoDB          |
| `task_description` | VARCHAR(255)     | Mô tả nhiệm vụ                     |
| `completed`        | BOOLEAN          | Trạng thái hoàn thành (true/false) |
| `date`             | DATE             | Ngày tạo nhiệm vụ                  |

---

### Notes

- **MongoDB** được sử dụng để lưu thông tin người dùng như `username`, `password`, và các trường bảo mật khác.
- **SQL** được sử dụng để quản lý dữ liệu có cấu trúc rõ ràng liên quan đến severity và daily tasks.
- **Kết hợp MongoDB và SQL**: Dữ liệu `user_id` trong SQL là `_id` từ MongoDB, giúp liên kết hai loại cơ sở dữ liệu.

**Tối ưu hóa xử lý:** Chỉ cần truy vấn DailyTasks để kiểm tra trạng thái hoàn thành hàng ngày, sau đó cập nhật SeverityProfiles.

Mối quan hệ giữa hai bảng SeverityProfiles và DailyTasks là **một-nhiều (one-to-many)**, dựa trên `user_id`:

Một người dùng (dữ liệu từ bảng SeverityProfiles) có thể có nhiều nhiệm vụ hàng ngày (DailyTasks) để hoàn thành.
`user_id` trong bảng DailyTasks là khóa ngoại liên kết với `user_id ` trong bảng SeverityProfiles.

**Mô tả quan hệ:**

SeverityProfiles lưu thông tin tổng quan về mức độ nghiêm trọng của bệnh và số lượng **"sun points"** của người dùng.

DailyTasks lưu chi tiết các nhiệm vụ hàng ngày của từng người dùng. Khi người dùng hoàn thành tất cả nhiệm vụ trong một ngày:

- Điểm "sun points" trong bảng SeverityProfiles tăng lên.

- Khi sun_points đạt 30, giảm severity_percentage trong bảng SeverityProfiles và đặt lại sun_points về 0.
