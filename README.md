# 235186_PhamMinhKha – Hệ thống quản lý sách trên nền tảng đám mây

- **Sinh viên:** Phạm Minh Kha
- **MSSV:** 235186
- **Học phần:** Điện toán đám mây

## Mô tả đề tài

Ứng dụng quản lý sách gồm giao diện frontend, backend API và cơ sở dữ liệu MongoDB Atlas. Mã nguồn được quản lý bằng GitHub, đóng gói bằng Docker và triển khai trên Render.

## Công nghệ sử dụng

- Frontend: React
- Backend: Node.js, Express
- Cơ sở dữ liệu: MongoDB Atlas
- Công cụ: Git/GitHub, Docker, Docker Hub, Render

## Cấu trúc dự án

```
235186_PhamMinhKha/
├── backend/     # Node.js + Express API
│   └── src/     # app.js, index.js, models/, routes/
├── frontend/    # Giao diện React (sẽ bổ sung)
├── .gitignore
└── README.md
```

## Hướng dẫn cài đặt và chạy

### Backend

Yêu cầu: Node.js >= 18 và một cluster MongoDB Atlas.

```bash
cd backend
cp .env.example .env     # điền MONGODB_URI thật vào .env
npm install
npm start                # http://localhost:5000
```

Biến môi trường (`backend/.env`):

| Biến | Ý nghĩa |
|---|---|
| `PORT` | Cổng chạy backend (mặc định 5000) |
| `MONGODB_URI` | Chuỗi kết nối MongoDB Atlas |

### API

| Phương thức | Endpoint | Chức năng |
|---|---|---|
| GET | `/health` | Kiểm tra trạng thái backend và kết nối database |
| GET | `/api/books` | Lấy danh sách sách |
| GET | `/api/books?search=cloud` | Tìm theo tên sách, tác giả, thể loại |
| GET | `/api/books/:id` | Xem một sách (`:id` là `bookId` hoặc `_id`) |
| POST | `/api/books` | Thêm sách mới (`bookId` không được trùng) |
| PUT | `/api/books/:id` | Cập nhật sách |
| DELETE | `/api/books/:id` | Xóa sách |

Frontend, Docker và triển khai Render sẽ được bổ sung sau.

## Lưu ý bảo mật

Không đưa tệp `.env`, mật khẩu, access token hoặc chuỗi kết nối MongoDB lên GitHub.
