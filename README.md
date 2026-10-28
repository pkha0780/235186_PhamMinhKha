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
| `CORS_ORIGIN` | (Tùy chọn) Địa chỉ frontend được phép gọi API, nhiều địa chỉ cách nhau bằng dấu phẩy. Để trống thì cho phép mọi nguồn |

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

## Triển khai trên Render

Cả hai dịch vụ là Web Service dạng **Existing Image** trên Render, lấy image đã đẩy lên Docker Hub (không cần build lại trên Render). Gói Free sẽ ngủ khi không dùng, lần truy cập đầu có thể chậm 30–60 giây.

| Dịch vụ | Tên Render | Image | Biến môi trường | URL công khai |
|---|---|---|---|---|
| Backend API | `api-235186` | `docker.io/pkha0780/backend:latest` | `MONGODB_URI`, `CORS_ORIGIN` | https://api-235186.onrender.com |
| Frontend | `web-235186` | `docker.io/pkha0780/frontend:latest` | `API_URL` | https://web-235186.onrender.com |

### Frontend

- Region Singapore, Instance Type Free, Health Check Path `/`.
- `API_URL` = địa chỉ backend mà giao diện gọi tới: `https://api-235186.onrender.com` (không có dấu `/` ở cuối).
- Đã kiểm tra trên giao diện đã triển khai: xem danh sách, tìm kiếm, xem chi tiết, thêm, sửa, xóa sách.

### Backend API

- Region Singapore, Instance Type Free, Health Check Path `/health`.
- `MONGODB_URI`: chuỗi kết nối MongoDB Atlas, nhập trực tiếp trong mục Environment của Render (không đưa vào mã nguồn hay image).
- MongoDB Atlas → Network Access cần cho phép `0.0.0.0/0` vì Render không có IP cố định.
- `PORT` do Render cấp, backend tự đọc.
- CORS: `CORS_ORIGIN=https://web-235186.onrender.com` để chỉ frontend này được gọi API. Nếu không đặt biến này, backend cho phép mọi nguồn. Sau khi đổi image hoặc biến môi trường cần chọn **Manual Deploy → Deploy latest reference** để Render chạy bản mới.
- Địa chỉ API cho frontend được cấu hình qua `API_URL` của dịch vụ frontend (xem trên).

Kiểm tra trên hệ thống đã triển khai:

```bash
API=https://api-235186.onrender.com
curl $API/health                                  # {"status":"ok","database":"connected",...}
curl "$API/api/books"                             # xem danh sách
curl "$API/api/books?search=clean"                # tìm kiếm
curl -X POST $API/api/books -H "Content-Type: application/json" \
  -d '{"bookId":"B005","title":"Sách thử","author":"Tester","category":"Test","publisher":"NXB","publishYear":2024,"isbn":"9780000000005","quantity":3}'
curl -X PUT $API/api/books/B005 -H "Content-Type: application/json" -d '{"quantity":5}'
curl -X DELETE $API/api/books/B005
```

Các trường hợp lỗi đã kiểm tra: thêm trùng `bookId` (409), thiếu hoặc sai dữ liệu (400), JSON hỏng (400), sách không tồn tại (404), endpoint không có (404).

## Lưu ý bảo mật

Không đưa tệp `.env`, mật khẩu, access token hoặc chuỗi kết nối MongoDB lên GitHub.
