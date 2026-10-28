const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const booksRouter = require('./routes/books');

const app = express();

// CORS_ORIGIN: danh sách địa chỉ frontend được phép, cách nhau bằng dấu phẩy
// (ví dụ https://web-235186.onrender.com). Để trống hoặc "*" thì cho phép mọi nguồn.
const allowedOrigins = (process.env.CORS_ORIGIN || '*')
  .split(',')
  .map((origin) => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean);
app.use(cors({ origin: allowedOrigins.includes('*') ? '*' : allowedOrigins }));
app.use(express.json());

// Kiểm tra trạng thái backend và kết nối MongoDB
app.get('/health', (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({
    status: connected ? 'ok' : 'error',
    database: connected ? 'connected' : 'disconnected',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// Trả 503 khi chưa kết nối được cơ sở dữ liệu
app.use('/api', (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'Không thể kết nối cơ sở dữ liệu' });
  }
  next();
});

app.use('/api/books', booksRouter);

app.use((req, res) => {
  res.status(404).json({ message: 'Không tìm thấy endpoint' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'JSON không hợp lệ' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Dữ liệu gửi lên quá lớn' });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: 'bookId đã tồn tại' });
  }
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors: Object.values(err.errors).map((e) => e.message) });
  }
  console.error(err.message);
  res.status(500).json({ message: 'Lỗi máy chủ' });
});

module.exports = app;
