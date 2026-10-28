# 235186_PhamMinhKha – Hệ thống quản lý sách trên nền tảng đám mây

- **Sinh viên:** Phạm Minh Kha
- **MSSV:** 235186
- **LỚP:** DH23TIN05
- **Học phần:** Điện toán đám mây

## Mô tả đề tài

Ứng dụng quản lý sách gồm giao diện frontend (React), backend API (Node.js, Express) và cơ sở dữ liệu MongoDB Atlas. Người dùng có thể xem danh sách, tìm kiếm, xem chi tiết, thêm, sửa và xóa sách. Mã nguồn được quản lý bằng GitHub, đóng gói bằng Docker, lưu image trên Docker Hub và triển khai trên Render.

## Liên kết nộp bài

| Hạng mục | Liên kết |
|---|---|
| Repository GitHub | https://github.com/pkha0780/235186_PhamMinhKha |
| Frontend (Render) | https://web-235186.onrender.com |
| Backend API (Render) | https://api-235186.onrender.com |
| Kiểm tra backend | https://api-235186.onrender.com/health |
| Docker Hub backend | https://hub.docker.com/r/pkha0780/backend |
| Docker Hub frontend | https://hub.docker.com/r/pkha0780/frontend |

Gói Free của Render sẽ ngủ khi không có truy cập, nên lần mở đầu tiên có thể chậm 30–60 giây.

## Kiến trúc

```
Trình duyệt ──► Frontend (nginx, web-235186) ──► Backend API (Express, api-235186) ──► MongoDB Atlas
                  React tĩnh + config.js           REST /api/books, /health             235186_PhamMinhKha.books
```

Dữ liệu hiển thị trên giao diện luôn được lấy qua API từ MongoDB Atlas, không có dữ liệu cứng trong mã nguồn.

## Công nghệ sử dụng

- Frontend: React 19, Vite
- Backend: Node.js 22, Express, Mongoose
- Cơ sở dữ liệu: MongoDB Atlas
- Công cụ: Git/GitHub, Docker, Docker Hub, Render

## Cấu trúc dự án

```
235186_PhamMinhKha/
├── backend/                  # Node.js + Express API
│   ├── src/                  # index.js, app.js, models/, routes/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── .env.example
├── frontend/                 # Giao diện React (Vite)
│   ├── src/                  # components/, services/, hooks/
│   ├── public/config.js      # địa chỉ backend, sửa được sau khi build
│   ├── Dockerfile            # build bằng Node, phục vụ bằng nginx
│   ├── nginx.conf.template
│   ├── docker-entrypoint.sh  # ghi API_URL vào config.js khi container khởi động
│   └── .env.example
├── .gitattributes
├── .gitignore
└── README.md
```

## Cơ sở dữ liệu

MongoDB Atlas, database `235186_PhamMinhKha`, collection `books`.

| Trường | Kiểu | Ghi chú |
|---|---|---|
| `bookId` | String | Bắt buộc, duy nhất (ví dụ `B001`) |
| `title` | String | Tên sách, bắt buộc |
| `author` | String | Tác giả, bắt buộc |
| `category` | String | Thể loại, bắt buộc |
| `publisher` | String | Nhà xuất bản, bắt buộc |
| `publishYear` | Number | Năm xuất bản, bắt buộc |
| `isbn` | String | Mã ISBN, bắt buộc |
| `quantity` | Number | Số lượng, số nguyên không âm, bắt buộc |
| `description` | String | Mô tả, không bắt buộc |

## Chạy trên máy

### Backend

Yêu cầu: Node.js >= 18 và một cluster MongoDB Atlas.

```bash
cd backend
cp .env.example .env     # điền MONGODB_URI thật vào .env
npm install
npm start                # http://localhost:5000
```

| Biến (`backend/.env`) | Ý nghĩa |
|---|---|
| `MONGODB_URI` | Chuỗi kết nối MongoDB Atlas (bắt buộc, thiếu thì backend thoát ngay) |
| `PORT` | Cổng chạy backend (mặc định 5000) |
| `CORS_ORIGIN` | Tùy chọn. Địa chỉ frontend được phép gọi API, nhiều địa chỉ cách nhau bằng dấu phẩy. Để trống thì cho phép mọi nguồn |

### Frontend

```bash
cd frontend
cp .env.example .env     # chỉnh VITE_API_URL nếu backend không chạy ở localhost:5000
npm install
npm run dev              # http://localhost:3000
```

Địa chỉ backend được xác định theo thứ tự ưu tiên:
1. `window.__APP_CONFIG__.API_URL` trong `config.js`: sửa được sau khi build, dùng khi triển khai.
2. Biến `VITE_API_URL` lúc build.
3. Mặc định `http://localhost:5000`.

## API

| Phương thức | Endpoint | Chức năng |
|---|---|---|
| GET | `/health` | Kiểm tra backend và kết nối database |
| GET | `/api/books` | Lấy danh sách sách |
| GET | `/api/books?search=cloud` | Tìm theo tên sách, tác giả, thể loại (không phân biệt hoa thường) |
| GET | `/api/books/:id` | Xem một sách (`:id` là `bookId` hoặc `_id`) |
| POST | `/api/books` | Thêm sách mới (`bookId` không được trùng) |
| PUT | `/api/books/:id` | Cập nhật sách |
| DELETE | `/api/books/:id` | Xóa sách |

Mã lỗi: `400` dữ liệu không hợp lệ hoặc JSON hỏng, `404` không tìm thấy, `409` trùng `bookId`, `413` nội dung quá lớn, `503` chưa kết nối được database.

## Docker

Image **không chứa** `.env`, mật khẩu hay chuỗi kết nối. Mọi cấu hình được truyền bằng biến môi trường khi chạy container.

### Backend

`backend/Dockerfile`: Node 22 Alpine, chỉ cài dependencies production, chạy bằng user `node`.

```bash
cd backend
docker build -t 235186phamminhkha/backend:latest .
docker run -d --name backend -p 5000:5000 \
  -e MONGODB_URI="<chuỗi kết nối MongoDB Atlas>" \
  235186phamminhkha/backend:latest
curl http://localhost:5000/health
```

Biến khi chạy container: `MONGODB_URI` (bắt buộc), `PORT` (mặc định 5000), `CORS_ORIGIN` (tùy chọn).

### Frontend

`frontend/Dockerfile`: build 2 giai đoạn, Node build ứng dụng React rồi nginx phục vụ tệp tĩnh (hỗ trợ SPA, cache tệp có hash trong tên). Địa chỉ backend không nhúng vào image mà được ghi vào `config.js` lúc container khởi động, nên đổi bằng biến môi trường mà không cần build lại.

```bash
cd frontend
docker build -t 235186phamminhkha/frontend:latest .
docker run -d --name frontend -p 8080:80 \
  -e API_URL=http://localhost:5000 \
  235186phamminhkha/frontend:latest
# Mở http://localhost:8080
```

Biến khi chạy container: `API_URL` (địa chỉ backend), `PORT` (cổng nginx, mặc định 80).

### Docker Hub

Image được build với tên theo quy ước (`235186phamminhkha/backend`, `235186phamminhkha/frontend`) và đẩy lên Docker Hub của tài khoản `pkha0780`, nên tên trên Docker Hub là:

```bash
docker pull pkha0780/backend:latest
docker pull pkha0780/frontend:latest
```

Quy trình đẩy image:

```bash
docker login
docker tag 235186phamminhkha/backend:latest pkha0780/backend:latest
docker push pkha0780/backend:latest
docker tag 235186phamminhkha/frontend:latest pkha0780/frontend:latest
docker push pkha0780/frontend:latest
```

## Triển khai trên Render

Cả hai dịch vụ là Web Service dạng **Existing Image**, lấy image từ Docker Hub (Render không phải build lại). Region Singapore, Instance Type Free.

| Dịch vụ | Tên Render | Image | Health Check | Biến môi trường |
|---|---|---|---|---|
| Backend API | `api-235186` | `docker.io/pkha0780/backend:latest` | `/health` | `MONGODB_URI`, `CORS_ORIGIN` |
| Frontend | `web-235186` | `docker.io/pkha0780/frontend:latest` | `/` | `API_URL` |

Giá trị cấu hình:

- `MONGODB_URI`: chuỗi kết nối MongoDB Atlas, nhập trực tiếp trong mục Environment của Render, không đưa vào mã nguồn hay image.
- `CORS_ORIGIN` = `https://web-235186.onrender.com`: chỉ frontend này được gọi API.
- `API_URL` = `https://api-235186.onrender.com` (không có dấu `/` ở cuối).
- `PORT` do Render cấp, cả hai dịch vụ tự đọc.
- MongoDB Atlas → Network Access cần cho phép `0.0.0.0/0` vì Render không có IP cố định.
- Sau khi đổi image hoặc biến môi trường, chọn **Manual Deploy → Deploy latest reference** để Render chạy bản mới.

## Kiểm thử hệ thống đã triển khai

```bash
API=https://api-235186.onrender.com
curl $API/health                       # {"status":"ok","database":"connected",...}
curl "$API/api/books"                  # xem danh sách
curl "$API/api/books?search=clean"     # tìm kiếm
curl -X POST $API/api/books -H "Content-Type: application/json" \
  -d '{"bookId":"B005","title":"Sách thử","author":"Tester","category":"Test","publisher":"NXB","publishYear":2024,"isbn":"9780000000005","quantity":3}'
curl -X PUT $API/api/books/B005 -H "Content-Type: application/json" -d '{"quantity":5}'
curl -X DELETE $API/api/books/B005
```

Đã kiểm tra:

- Các API thêm, xem, tìm kiếm (có dấu tiếng Việt), cập nhật, xóa qua URL công khai.
- Các trường hợp lỗi: trùng `bookId` (409), thiếu hoặc sai dữ liệu (400), JSON hỏng (400), sách hoặc endpoint không tồn tại (404).
- CORS: frontend trên Render gọi được backend, nguồn lạ không được.
- Giao diện đã triển khai: tải danh sách, tìm kiếm, xem chi tiết, thêm, sửa, xóa; trạng thái đang tải, trống và lỗi kết nối.
- Danh sách hiển thị trên giao diện trùng khớp với dữ liệu trong MongoDB Atlas.

## Lưu ý bảo mật

Không đưa tệp `.env`, mật khẩu, access token hoặc chuỗi kết nối MongoDB lên GitHub. Tệp `.env` đã được loại bằng `.gitignore` và `.dockerignore`; repository chỉ có `.env.example` với giá trị mẫu.
