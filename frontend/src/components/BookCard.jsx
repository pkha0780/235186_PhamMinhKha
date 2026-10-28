import Icon from './Icon.jsx';
import { coverStyle, stockInfo } from '../utils.js';

export default function BookCard({ book, onView, onEdit, onDelete }) {
  const stock = stockInfo(book.quantity);

  return (
    <article className="card">
      <button className="card-main" onClick={() => onView(book)} aria-label={`Xem chi tiết ${book.title}`}>
        <div className="cover" style={coverStyle(book.bookId + book.title)}>
          <span className="cover-letter">{book.title.charAt(0).toUpperCase()}</span>
          <span className="cover-category">{book.category}</span>
        </div>
        <div className="card-body">
          <h3 className="card-title">{book.title}</h3>
          <p className="card-author">{book.author}</p>
          <p className="card-meta">{book.publisher} · {book.publishYear}</p>
        </div>
      </button>
      <footer className="card-footer">
        <span className={`badge badge-${stock.tone}`}>{stock.label}</span>
        <div className="card-actions">
          <button className="icon-btn" onClick={() => onEdit(book)} aria-label={`Sửa ${book.title}`} title="Sửa">
            <Icon name="edit" />
          </button>
          <button className="icon-btn icon-btn-danger" onClick={() => onDelete(book)} aria-label={`Xóa ${book.title}`} title="Xóa">
            <Icon name="trash" />
          </button>
        </div>
      </footer>
    </article>
  );
}
