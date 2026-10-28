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
├── frontend/    # Giao diện React (Vite)
│   └── src/     # components/, services/, hooks/
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

### Frontend

```bash
cd frontend
cp .env.example .env     # chỉnh VITE_API_URL nếu backend không chạy ở localhost:5000
npm install
npm run dev              # http://localhost:3000
```

Địa chỉ backend được xác định theo thứ tự ưu tiên:
1. `frontend/public/config.js` (`window.__APP_CONFIG__.API_URL`): sửa được sau khi build, tiện khi triển khai.
2. Biến `VITE_API_URL` lúc build.
3. Mặc định `http://localhost:5000`.

Chức năng: xem danh sách, tìm kiếm, xem chi tiết, thêm, sửa, xóa sách; có trạng thái đang tải, thông báo lỗi và thông báo kết quả thao tác.

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

## Docker

Backend được đóng gói bằng `backend/Dockerfile` (Node 22 Alpine, chạy bằng user `node`). Image **không chứa** `.env` hay chuỗi kết nối; `MONGODB_URI` được truyền khi chạy container.

- Image theo quy ước đặt tên: `235186phamminhkha/backend`
- Đã đẩy lên Docker Hub (tài khoản `pkha0780`): https://hub.docker.com/r/pkha0780/backend

```bash
docker pull pkha0780/backend:latest
```

```bash
# Build image
cd backend
docker build -t 235186phamminhkha/backend:latest .

# Chạy container (truyền biến môi trường lúc chạy)
docker run -d --name backend -p 5000:5000 \
  -e MONGODB_URI="<chuỗi kết nối MongoDB Atlas>" \
  235186phamminhkha/backend:latest
# hoặc: docker run -d -p 5000:5000 --env-file .env 235186phamminhkha/backend:latest

# Kiểm tra
curl http://localhost:5000/health

# Đẩy lên Docker Hub
docker login
docker tag 235186phamminhkha/backend:latest pkha0780/backend:latest
docker push pkha0780/backend:latest
```

Biến môi trường khi chạy container: `MONGODB_URI` (bắt buộc), `PORT` (mặc định 5000). Nếu thiếu `MONGODB_URI`, container thoát ngay và báo lỗi.

### Docker cho frontend

`frontend/Dockerfile` build 2 giai đoạn: Node 22 build ứng dụng React, sau đó nginx phục vụ tệp tĩnh (hỗ trợ SPA, cache tệp có hash). Địa chỉ backend không nhúng cứng vào image mà được ghi vào `config.js` khi container khởi động, nên đổi được bằng biến môi trường mà không cần build lại.

- Image theo quy ước đặt tên: `235186phamminhkha/frontend`
- Đã đẩy lên Docker Hub (tài khoản `pkha0780`): https://hub.docker.com/r/pkha0780/frontend

```bash
# Build image
cd frontend
docker build -t 235186phamminhkha/frontend:latest .

# Chạy container, trỏ tới backend
docker run -d --name frontend -p 8080:80 \
  -e API_URL=http://localhost:5000 \
  235186phamminhkha/frontend:latest
# Mở http://localhost:8080

# Đẩy lên Docker Hub
docker tag 235186phamminhkha/frontend:latest pkha0780/frontend:latest
docker push pkha0780/frontend:latest
```

Biến môi trường khi chạy container: `API_URL` (địa chỉ backend, ví dụ `https://api-235186.onrender.com`) và `PORT` (cổng nginx, mặc định 80).

Chạy cả hai container trên máy: khởi động backend (xem phần Docker ở trên) rồi chạy frontend với `API_URL=http://localhost:5000`.

Triển khai Render sẽ được bổ sung sau.

## Lưu ý bảo mật

Không đưa tệp `.env`, mật khẩu, access token hoặc chuỗi kết nối MongoDB lên GitHub.
