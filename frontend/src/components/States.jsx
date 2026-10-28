import Icon from './Icon.jsx';

export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="grid" aria-busy="true" aria-label="Đang tải danh sách sách">
      {Array.from({ length: count }, (_, i) => (
        <div className="card skeleton-card" key={i}>
          <div className="skeleton skeleton-cover" />
          <div className="card-body">
            <div className="skeleton skeleton-line" style={{ width: '80%' }} />
            <div className="skeleton skeleton-line" style={{ width: '50%' }} />
            <div className="skeleton skeleton-line" style={{ width: '65%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ searching, onAdd, onClear }) {
  return (
    <div className="state">
      <div className="state-icon"><Icon name="book" size={28} /></div>
      <h3>{searching ? 'Không tìm thấy sách phù hợp' : 'Chưa có cuốn sách nào'}</h3>
      <p>
        {searching
          ? 'Thử từ khóa khác hoặc tìm theo tên sách, tác giả, thể loại.'
          : 'Thêm cuốn sách đầu tiên để bắt đầu xây dựng thư viện của bạn.'}
      </p>
      {searching ? (
        <button className="btn btn-secondary" onClick={onClear}>Xóa tìm kiếm</button>
      ) : (
        <button className="btn btn-primary" onClick={onAdd}><Icon name="plus" size={16} />Thêm sách</button>
      )}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="state state-error" role="alert">
      <div className="state-icon"><Icon name="alert" size={28} /></div>
      <h3>Không tải được danh sách sách</h3>
      <p>{message}</p>
      <button className="btn btn-primary" onClick={onRetry}><Icon name="refresh" size={16} />Thử lại</button>
    </div>
  );
}
