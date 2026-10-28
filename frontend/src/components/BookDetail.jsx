import { useEffect, useState } from 'react';
import Modal from './Modal.jsx';
import Icon from './Icon.jsx';
import { booksApi } from '../services/api.js';
import { coverStyle, stockInfo } from '../utils.js';

function Detail({ label, value }) {
  return (
    <div className="detail-item">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default function BookDetail({ book: initial, onClose, onEdit, onDelete }) {
  const [book, setBook] = useState(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    booksApi
      .get(initial.bookId)
      .then((fresh) => active && setBook(fresh))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [initial.bookId]);

  const stock = stockInfo(book.quantity);

  return (
    <Modal title="Chi tiết sách" onClose={onClose} size="lg">
      <div className="modal-body">
        {error && (
          <div className="alert alert-error" role="alert">
            <Icon name="alert" size={16} />
            <div>{error}</div>
          </div>
        )}
        <div className={`detail ${loading ? 'is-loading' : ''}`}>
          <div className="cover cover-large" style={coverStyle(book.bookId + book.title)}>
            <span className="cover-letter">{book.title.charAt(0).toUpperCase()}</span>
          </div>
          <div className="detail-main">
            <span className="chip">{book.category}</span>
            <h3 className="detail-title">{book.title}</h3>
            <p className="detail-author">{book.author}</p>
            <p className="detail-desc">{book.description || 'Chưa có mô tả cho cuốn sách này.'}</p>
            <dl className="detail-grid">
              <Detail label="Mã sách" value={book.bookId} />
              <Detail label="ISBN" value={book.isbn} />
              <Detail label="Nhà xuất bản" value={book.publisher} />
              <Detail label="Năm xuất bản" value={book.publishYear} />
              <Detail label="Số lượng" value={<span className={`badge badge-${stock.tone}`}>{stock.label}</span>} />
            </dl>
          </div>
        </div>
      </div>
      <footer className="modal-footer">
        <button className="btn btn-ghost-danger" onClick={() => onDelete(book)}>
          <Icon name="trash" size={16} />Xóa
        </button>
        <button className="btn btn-primary" onClick={() => onEdit(book)}>
          <Icon name="edit" size={16} />Sửa thông tin
        </button>
      </footer>
    </Modal>
  );
}
