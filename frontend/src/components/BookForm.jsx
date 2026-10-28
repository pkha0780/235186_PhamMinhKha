import { useState } from 'react';
import Modal from './Modal.jsx';
import Icon from './Icon.jsx';

const EMPTY = {
  bookId: '', title: '', author: '', category: '', publisher: '',
  publishYear: '', isbn: '', quantity: '', description: '',
};

function validate(values) {
  const errors = {};
  const maxYear = new Date().getFullYear() + 1;
  const required = {
    bookId: 'Nhập mã sách', title: 'Nhập tên sách', author: 'Nhập tác giả',
    category: 'Nhập thể loại', publisher: 'Nhập nhà xuất bản', isbn: 'Nhập mã ISBN',
  };
  for (const [key, message] of Object.entries(required)) {
    if (!values[key].trim()) errors[key] = message;
  }
  const year = Number(values.publishYear);
  if (values.publishYear === '' || !Number.isInteger(year) || year < 1000 || year > maxYear) {
    errors.publishYear = `Năm từ 1000 đến ${maxYear}`;
  }
  const quantity = Number(values.quantity);
  if (values.quantity === '' || !Number.isInteger(quantity) || quantity < 0) {
    errors.quantity = 'Số lượng là số nguyên không âm';
  }
  return errors;
}

function Field({ label, name, values, errors, onChange, type = 'text', disabled, hint, ...rest }) {
  return (
    <div className={`field ${errors[name] ? 'has-error' : ''}`}>
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        value={values[name]}
        disabled={disabled}
        onChange={onChange}
        aria-invalid={Boolean(errors[name])}
        aria-describedby={errors[name] ? `${name}-error` : undefined}
        {...rest}
      />
      {errors[name] ? (
        <span className="field-error" id={`${name}-error`}>{errors[name]}</span>
      ) : (
        hint && <span className="field-hint">{hint}</span>
      )}
    </div>
  );
}

export default function BookForm({ book, onClose, onSubmit }) {
  const isEdit = Boolean(book);
  const [values, setValues] = useState(
    isEdit ? Object.fromEntries(Object.keys(EMPTY).map((key) => [key, String(book[key] ?? '')])) : EMPTY
  );
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    setServerError(null);
    if (Object.keys(found).length) return;

    setSaving(true);
    const payload = {
      ...Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim()])),
      publishYear: Number(values.publishYear),
      quantity: Number(values.quantity),
    };
    try {
      await onSubmit(payload);
    } catch (err) {
      if (err.status === 409) setErrors({ bookId: err.message });
      else setServerError(err);
      setSaving(false);
    }
  };

  const fieldProps = { values, errors, onChange: handleChange };

  return (
    <Modal title={isEdit ? 'Cập nhật sách' : 'Thêm sách mới'} onClose={saving ? () => {} : onClose} size="lg">
      <form onSubmit={handleSubmit} noValidate>
        <div className="modal-body">
          {serverError && (
            <div className="alert alert-error" role="alert">
              <Icon name="alert" size={16} />
              <div>
                {serverError.message}
                {serverError.details.length > 0 && (
                  <ul>{serverError.details.map((detail) => <li key={detail}>{detail}</li>)}</ul>
                )}
              </div>
            </div>
          )}
          <div className="form-grid">
            <Field
              label="Mã sách" name="bookId" {...fieldProps} disabled={isEdit} placeholder="VD: B004"
              hint={isEdit ? 'Mã sách không thể thay đổi' : 'Duy nhất, không trùng với sách khác'}
            />
            <Field label="Mã ISBN" name="isbn" {...fieldProps} placeholder="VD: 9780132350884" />
            <div className="span-2">
              <Field label="Tên sách" name="title" {...fieldProps} placeholder="VD: Clean Code" />
            </div>
            <Field label="Tác giả" name="author" {...fieldProps} placeholder="VD: Robert C. Martin" />
            <Field label="Thể loại" name="category" {...fieldProps} placeholder="VD: Lập trình" />
            <Field label="Nhà xuất bản" name="publisher" {...fieldProps} placeholder="VD: Prentice Hall" />
            <div className="form-row-2">
              <Field
                label="Năm xuất bản" name="publishYear" type="number" inputMode="numeric"
                {...fieldProps} placeholder="2024"
              />
              <Field
                label="Số lượng" name="quantity" type="number" inputMode="numeric" min="0"
                {...fieldProps} placeholder="0"
              />
            </div>
            <div className="span-2 field">
              <label htmlFor="description">Mô tả</label>
              <textarea
                id="description" name="description" rows="3" value={values.description}
                onChange={handleChange} placeholder="Giới thiệu ngắn về nội dung cuốn sách"
              />
            </div>
          </div>
        </div>
        <footer className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>Hủy</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Đang lưu…' : isEdit ? 'Lưu thay đổi' : 'Thêm sách'}
          </button>
        </footer>
      </form>
    </Modal>
  );
}
