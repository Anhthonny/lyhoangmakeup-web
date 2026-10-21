// Chạy 1 lần: thêm 3 ô Ảnh Hero, Feedback thực tế, Bảng giá tham khảo vào Admin (admin/config.yml).
// Giữ nguyên toàn bộ cấu hình có sẵn của bạn.
const fs = require('fs');
const f = 'admin/config.yml';
let c = fs.readFileSync(f, 'utf8');
if (c.includes('name: "hero_image_1"')) { console.log('Admin đã có các ô mới, không cần làm gì thêm.'); process.exit(0); }
const anchor = "- { label: \"Chữ nút 2\", name: \"btn_course_text\", widget: \"string\", required: false }\n";
const block = "          - { label: \"Ảnh Hero 1 (ảnh lớn hình vòm, bên trái)\", name: \"hero_image_1\", widget: \"image\", required: false, hint: \"KÍCH THƯỚC: 900 x 1260 px (ảnh dọc, tỉ lệ 5:7). Dung lượng dưới 300 KB, WebP hoặc JPG. Để trống sẽ dùng ảnh Cổng 1. Gương mặt nên nằm ở nửa trên ảnh.\" }\n          - { label: \"Ảnh Hero 2 (ảnh nhỏ, góc trên bên phải)\", name: \"hero_image_2\", widget: \"image\", required: false, hint: \"KÍCH THƯỚC: 700 x 740 px (gần vuông). Dung lượng dưới 200 KB, WebP hoặc JPG. Để trống sẽ dùng ảnh của thẻ Phong cách đầu tiên.\" }\n          - { label: \"Ảnh Hero 3 (ảnh nhỏ, góc dưới bên phải)\", name: \"hero_image_3\", widget: \"image\", required: false, hint: \"KÍCH THƯỚC: 700 x 700 px (vuông). Dung lượng dưới 200 KB, WebP hoặc JPG. Để trống sẽ dùng ảnh Cổng 3.\" }\n          - { label: \"Tiêu đề khối Feedback thực tế\", name: \"feedback_title\", widget: \"string\", required: false, hint: \"Ví dụ: Feedback thực tế từ khách hàng\" }\n          - { label: \"Hình ảnh Feedback thực tế (ngay đầu trang chủ)\", name: \"feedback_images\", widget: \"list\", required: false, hint: \"Ảnh chụp tin nhắn/đánh giá của khách. KÍCH THƯỚC: rộng 800 px, cao tự do (ảnh dọc cũng được). Dung lượng dưới 250 KB mỗi ảnh, WebP hoặc JPG. Nên dùng 6 đến 12 ảnh. Chưa có ảnh nào thì khối này tự ẩn.\", fields: [{ label: \"Ảnh feedback\", name: \"image\", widget: \"image\" }, { label: \"Chú thích (không bắt buộc, ví dụ: Cô dâu Ngọc Anh)\", name: \"caption\", widget: \"string\", required: false }] }\n          - { label: \"Tiêu đề khối Bảng giá tham khảo\", name: \"price_title\", widget: \"string\", required: false, hint: \"Mặc định: Bảng giá tham khảo. Số tiền lấy tự động từ mục Bảng giá dịch vụ & Học phí.\" }\n          - { label: \"Ghi chú dưới Bảng giá tham khảo\", name: \"price_note\", widget: \"text\", required: false }\n";
const opt = "{label: \"Video 3 cột\", value: \"video\"}";
const addOpt = "{label: \"Hình ảnh Feedback thực tế\", value: \"feedback\"},{label: \"Bảng giá tham khảo\", value: \"price\"},";
if (!c.includes(anchor)) { console.error('Không tìm thấy vị trí chèn trong ' + f + '. Hãy gửi lại cho Claude.'); process.exit(1); }
c = c.replace(anchor, anchor + block);
if (c.includes(opt) && !c.includes('value: "feedback"')) c = c.replace(opt, addOpt + opt);
fs.writeFileSync(f, c);
console.log('Đã cập nhật admin/config.yml: thêm Ảnh Hero 1-3, Feedback thực tế, Bảng giá tham khảo.');
