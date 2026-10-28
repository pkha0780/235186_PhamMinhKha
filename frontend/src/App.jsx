import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { booksApi } from './services/api.js';
import { useDebounce } from './hooks/useDebounce.js';
import { useToasts } from './hooks/useToasts.js';
import Icon from './components/Icon.jsx';
import BookCard from './components/BookCard.jsx';
import BookDetail from './components/BookDetail.jsx';
import BookForm from './components/BookForm.jsx';
import ConfirmDialog from './components/ConfirmDialog.jsx';
import Toasts from './components/Toasts.jsx';
import { EmptyState, ErrorState, SkeletonGrid } from './components/States.jsx';

export default function App() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [modal, setModal] = useState(null); // { type: 'detail' | 'form' | 'delete', book? }
  const search = useDebounce(searchInput.trim());
  const { toasts, push, dismiss } = useToasts();
  const requestId = useRef(0);

  const loadBooks = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError('');
    try {
      const data = await booksApi.list(search);
      if (id === requestId.current) setBooks(data);
    } catch (err) {
      if (id === requestId.current) setError(err.message);
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const closeModal = () => setModal(null);

  const handleSave = async (payload) => {
    const editing = modal.book;
    if (editing) {
      const { bookId, ...changes } = payload;
      await booksApi.update(editing.bookId, changes);
      push('success', `Đã cập nhật “${payload.title}”`);
    } else {
      await booksApi.create(payload);
      push('success', `Đã thêm “${payload.title}” vào thư viện`);
    }
    closeModal();
    loadBooks();
  };

  const handleDelete = async (book) => {
    try {
      await booksApi.remove(book.bookId);
      push('success', `Đã xóa “${book.title}”`);
      loadBooks();
    } catch (err) {
      push('error', err.message);
    }
    closeModal();
  };

  const stats = useMemo(
    () => ({
      titles: books.length,
      copies: books.reduce((sum, book) => sum + book.quantity, 0),
      categories: new Set(books.map((book) => book.category)).size,
    }),
    [books]
  );

  const showList = !error && books.length > 0;
  const showSkeleton = loading && !error && books.length === 0;

  return (
    <div className="app">
      <header className="topbar">
        <div className="container topbar-inner">
          <a className="brand" href="/" aria-label="Thư viện sách">
            <span className="brand-mark"><Icon name="book" size={20} /></span>
            <span className="brand-name">Thư viện sách</span>
          </a>
          <button className="btn btn-primary" onClick={() => setModal({ type: 'form' })}>
            <Icon name="plus" size={16} />Thêm sách
          </button>
        </div>
      </header>

      <main className="container main">
        <section className="intro">
          <div>
            <p className="eyebrow">Quản lý kho sách</p>
            <h1>Mọi cuốn sách của bạn,<br />gọn trong một nơi.</h1>
          </div>
          <dl className="stats" aria-label="Thống kê">
            <div><dt>Đầu sách</dt><dd>{loading && !books.length ? '–' : stats.titles}</dd></div>
            <div><dt>Tổng số lượng</dt><dd>{loading && !books.length ? '–' : stats.copies}</dd></div>
            <div><dt>Thể loại</dt><dd>{loading && !books.length ? '–' : stats.categories}</dd></div>
          </dl>
        </section>

        <div className="toolbar">
          <div className="search">
            <Icon name="search" />
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Tìm theo tên sách, tác giả hoặc thể loại…"
              aria-label="Tìm kiếm sách"
            />
          </div>
          <p className="result-count" aria-live="polite">
            {showList && (search ? `${books.length} kết quả cho “${search}”` : `${books.length} cuốn sách`)}
          </p>
        </div>

        {showSkeleton && <SkeletonGrid />}
        {!loading && error && <ErrorState message={error} onRetry={loadBooks} />}
        {!loading && !error && books.length === 0 && (
          <EmptyState
            searching={Boolean(search)}
            onAdd={() => setModal({ type: 'form' })}
            onClear={() => setSearchInput('')}
          />
        )}
        {showList && (
          <div className={`grid ${loading ? 'is-refreshing' : ''}`} aria-busy={loading}>
            {books.map((book) => (
              <BookCard
                key={book._id}
                book={book}
                onView={(b) => setModal({ type: 'detail', book: b })}
                onEdit={(b) => setModal({ type: 'form', book: b })}
                onDelete={(b) => setModal({ type: 'delete', book: b })}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="footer">
        <div className="container">235186 · Phạm Minh Kha — Điện toán đám mây</div>
      </footer>

      {modal?.type === 'detail' && (
        <BookDetail
          book={modal.book}
          onClose={closeModal}
          onEdit={(b) => setModal({ type: 'form', book: b })}
          onDelete={(b) => setModal({ type: 'delete', book: b })}
        />
      )}
      {modal?.type === 'form' && <BookForm book={modal.book} onClose={closeModal} onSubmit={handleSave} />}
      {modal?.type === 'delete' && (
        <ConfirmDialog book={modal.book} onCancel={closeModal} onConfirm={handleDelete} />
      )}

      <Toasts toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
