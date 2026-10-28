import Icon from './Icon.jsx';

export default function Toasts({ toasts, onDismiss }) {
  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`} role={toast.type === 'error' ? 'alert' : 'status'}>
          <Icon name={toast.type === 'error' ? 'alert' : 'check'} />
          <span>{toast.message}</span>
          <button className="icon-btn" onClick={() => onDismiss(toast.id)} aria-label="Đóng thông báo">
            <Icon name="x" size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
