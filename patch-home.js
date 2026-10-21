// Chạy 1 lần: thêm khối "Feedback thực tế" và "Bảng giá tham khảo" vào bố cục trang chủ (ngay sau khối đầu trang).
// Giữ nguyên mọi nội dung bạn đã chỉnh trong Admin.
const fs = require('fs');
const f = 'data/home.json';
const h = JSON.parse(fs.readFileSync(f, 'utf8'));
let s = Array.isArray(h.sections) ? h.sections : [];
const add = ['feedback', 'price'].filter(k => !s.includes(k));
if (add.length) {
  const i = Math.max(0, s.indexOf('hero') + 1);
  s.splice(i, 0, ...add);
  h.sections = s;
}
for (const k of ['hero_image_1', 'hero_image_2', 'hero_image_3']) if (h[k] === undefined) h[k] = '';
if (!h.feedback_title) h.feedback_title = 'Feedback thực tế từ khách hàng';
if (!Array.isArray(h.feedback_images)) h.feedback_images = [];
if (!h.price_title) h.price_title = 'Bảng giá tham khảo';
if (!h.price_note) h.price_note = 'Giá mang tính tham khảo, có thể thay đổi theo layout và thời điểm. Nhắn Zalo để được báo giá chính xác.';
fs.writeFileSync(f, JSON.stringify(h, null, 2) + '\n');
console.log('Đã cập nhật data/home.json. Thứ tự khối:', h.sections.join(' > '));
