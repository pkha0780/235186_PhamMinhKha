const express = require('express');
const mongoose = require('mongoose');
const Book = require('../models/Book');

const router = express.Router();

const REQUIRED_STRINGS = ['bookId', 'title', 'author', 'category', 'publisher', 'isbn'];
const FIELDS = [...REQUIRED_STRINGS, 'publishYear', 'quantity', 'description'];

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Kiểm tra dữ liệu đầu vào; partial = true khi cập nhật (PUT)
function validateBook(body, partial = false) {
  const errors = [];
  const has = (key) => body[key] !== undefined;

  for (const key of REQUIRED_STRINGS) {
    if (!partial && !has(key)) {
      errors.push(`${key} là bắt buộc`);
    } else if (has(key) && (typeof body[key] !== 'string' || !body[key].trim())) {
      errors.push(`${key} phải là chuỗi không rỗng`);
    }
  }

  const year = body.publishYear;
  if (!partial && !has('publishYear')) {
    errors.push('publishYear là bắt buộc');
  } else if (has('publishYear')) {
    const max = new Date().getFullYear() + 1;
    if (!Number.isInteger(year) || year < 1000 || year > max) {
      errors.push(`publishYear phải là số nguyên từ 1000 đến ${max}`);
    }
  }

  const qty = body.quantity;
  if (!partial && !has('quantity')) {
    errors.push('quantity là bắt buộc');
  } else if (has('quantity') && (!Number.isInteger(qty) || qty < 0)) {
    errors.push('quantity phải là số nguyên không âm');
  }

  if (has('description') && typeof body.description !== 'string') {
    errors.push('description phải là chuỗi');
  }

  return errors;
}

// Chỉ lấy các trường hợp lệ từ body
function pickFields(body) {
  const data = {};
  for (const key of FIELDS) {
    if (body[key] !== undefined) data[key] = body[key];
  }
  return data;
}

// :id có thể là _id của MongoDB hoặc bookId
function findFilter(id) {
  return mongoose.isValidObjectId(id) ? { $or: [{ _id: id }, { bookId: id }] } : { bookId: id };
}

// GET /api/books và GET /api/books?search=cloud
router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    if (search) {
      const regex = new RegExp(escapeRegex(search), 'i');
      filter.$or = [{ title: regex }, { author: regex }, { category: regex }];
    }
    const books = await Book.find(filter).sort({ bookId: 1 });
    res.json({ count: books.length, data: books });
  } catch (err) {
    next(err);
  }
});

// GET /api/books/:id
router.get('/:id', async (req, res, next) => {
  try {
    const book = await Book.findOne(findFilter(req.params.id));
    if (!book) return res.status(404).json({ message: 'Không tìm thấy sách' });
    res.json({ data: book });
  } catch (err) {
    next(err);
  }
});

// POST /api/books
router.post('/', async (req, res, next) => {
  try {
    const errors = validateBook(req.body || {});
    if (errors.length) return res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors });

    const data = pickFields(req.body);
    if (await Book.exists({ bookId: data.bookId })) {
      return res.status(409).json({ message: `bookId "${data.bookId}" đã tồn tại` });
    }
    const book = await Book.create(data);
    res.status(201).json({ message: 'Thêm sách thành công', data: book });
  } catch (err) {
    next(err);
  }
});

// PUT /api/books/:id
router.put('/:id', async (req, res, next) => {
  try {
    const errors = validateBook(req.body || {}, true);
    if (!errors.length && !Object.keys(pickFields(req.body || {})).length) {
      errors.push('Cần ít nhất một trường để cập nhật');
    }
    if (errors.length) return res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors });

    const book = await Book.findOne(findFilter(req.params.id));
    if (!book) return res.status(404).json({ message: 'Không tìm thấy sách' });

    const data = pickFields(req.body);
    if (data.bookId && data.bookId !== book.bookId && (await Book.exists({ bookId: data.bookId }))) {
      return res.status(409).json({ message: `bookId "${data.bookId}" đã tồn tại` });
    }
    book.set(data);
    await book.save();
    res.json({ message: 'Cập nhật sách thành công', data: book });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/books/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const book = await Book.findOneAndDelete(findFilter(req.params.id));
    if (!book) return res.status(404).json({ message: 'Không tìm thấy sách' });
    res.json({ message: 'Xóa sách thành công', data: book });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
