#!/bin/sh
# Ghi địa chỉ backend vào config.js lúc container khởi động.
# Chỉ nhận ký tự hợp lệ của một URL để tránh chèn mã vào tệp JS.
set -e

API_URL="${API_URL:-}"
case "$API_URL" in
  *[!A-Za-z0-9:/._~%?\&=#@+,-]*)
    echo "API_URL chứa ký tự không hợp lệ" >&2
    exit 1
    ;;
esac

cat > /usr/share/nginx/html/config.js <<EOF
window.__APP_CONFIG__ = { API_URL: '${API_URL}' };
EOF

echo "Frontend sẽ gọi backend tại: ${API_URL:-<mặc định>}"
