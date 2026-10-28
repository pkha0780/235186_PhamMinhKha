import { useState } from 'react';
import Modal from './Modal.jsx';

export default function ConfirmDialog({ book, onCancel, onConfirm }) {
  const [busy, setBusy] = useState(false);

  const handleConfirm = async () => {
    setBusy(true);
    await onConfirm(book);
    setBusy(false);
  };

  return (
    <Modal title="Xóa sách" onClose={busy ? () => {} : onCancel} size="sm">
      <div className="modal-body">
        <p className="confirm-text">
          Bạn sắp xóa <strong>{book.title}</strong> ({book.bookId}). Hành động này không thể hoàn tác.
        </p>
      </div>
      <footer className="modal-footer">
        <button className="btn btn-secondary" onClick={onCancel} disabled={busy}>Giữ lại</button>
        <button className="btn btn-danger" onClick={handleConfirm} disabled={busy}>
          {busy ? 'Đang xóa…' : 'Xóa sách'}
        </button>
      </footer>
    </Modal>
  );
}
