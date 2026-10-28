require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Thiếu biến môi trường MONGODB_URI');
  process.exit(1);
}

app.listen(PORT, () => console.log(`Backend đang chạy tại cổng ${PORT}`));

mongoose
  .connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 })
  .then(() => console.log('Đã kết nối MongoDB Atlas'))
  .catch((err) => {
    // Thoát để nền tảng (Render/Docker) tự khởi động lại thay vì chạy mãi ở trạng thái lỗi
    console.error('Kết nối MongoDB thất bại:', err.message);
    process.exit(1);
  });
