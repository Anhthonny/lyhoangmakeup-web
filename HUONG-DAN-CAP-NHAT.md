# Hướng dẫn cập nhật website Lý Hoàng Makeup

Bản cập nhật này giữ nguyên cách vận hành hiện có: nội dung nằm trong các file JSON, Admin dùng Decap CMS, Netlify build website bằng `node build.js`.

## Các thay đổi đã có

- Thanh ưu đãi chạy ngang có thể bật hoặc tắt trong mục **Trang chủ**. Nội dung và nút dẫn tới khóa học được sửa trong Admin. Thanh đang tắt mặc định; hãy nhập thông tin đúng chương trình và số chỗ trước khi bật.
- Blog cho phép nhập tên chuyên mục chính mới. Tên chuyên mục sẽ thành bộ lọc và có trang chuyên mục riêng. Chuyên mục con và hashtag có thể tự nhập.
- Admin có ô **Tìm nhanh** khi mở Blog, Cửa hàng hoặc Lookbook. Tìm tiêu đề, tên ngành, chủ đề hoặc hashtag trong danh sách đang mở; có thể dùng Enter hoặc nút Tìm tiếp.
- Cửa hàng nhận tên ngành hàng mới. Trang sản phẩm có trường mô tả chi tiết Markdown, hỗ trợ tiêu đề, danh sách, ảnh, liên kết và bảng. Nội dung chỉ hiện khi bật **ĐÃ KIỂM DUYỆT**.
- Lookbook nhận mô tả dài và hashtag. Trên trang ảnh/video có ô tìm theo nội dung và hashtag; nội dung chi tiết hiện khi mở ảnh hoặc video.
- Đã thêm 11 bài Blog dưới dạng bản nháp (`published: false`). Cần kiểm tra nội dung, ảnh và thông tin dịch vụ trước khi bật công khai.

## Cách dùng trong Admin

### Bật thanh ưu đãi

Mở **Trang chủ** và nhập nội dung, chữ nút, đường dẫn. Bật **Bật thanh ưu đãi chạy ngang** sau khi đã xác nhận giá, điều kiện và số suất. Có thể tắt lại bằng checkbox này.

### Tìm và cập nhật bài viết

Mở **Bài viết Blog**, dùng ô **Tìm nhanh** ở góc trên bên phải để tìm theo tiêu đề, chuyên mục, chủ đề hoặc hashtag. Khi tạo bài, nhập tên chuyên mục mới vào trường chuyên mục chính; dùng cùng một cách viết để gom các bài vào cùng bộ lọc.

Các bài mới thêm đang ở trạng thái chưa xuất bản. Mở từng bài, chỉnh nội dung/ảnh nếu cần rồi bật **Hiện trên website** để công khai.

### Viết mô tả sản phẩm dài

Trong **Cửa hàng**, hoàn thiện mô tả ngắn và trường **Mô tả chi tiết**. Trường chi tiết dùng Markdown; ví dụ bảng:

```markdown
| Sản phẩm | Cách dùng |
| --- | --- |
| Kem nền | Tán lớp mỏng từ giữa mặt ra ngoài |
| Phấn phủ | Phủ nhẹ vùng dễ đổ dầu |
```

Đọc lại nội dung thực tế rồi bật **ĐÃ KIỂM DUYỆT**. Trường này cũng được đưa vào file Excel khi xuất/nhập danh sách sản phẩm.

### Tìm nội dung Lookbook

Trong **Lookbook: Hình ảnh** hoặc **Lookbook: Video**, điền mô tả và hashtag, ví dụ `#tonecamdao, #matron`. Trên website, người xem có thể tìm theo từ khóa hoặc hashtag. Có thể tìm nhanh từ Admin bằng ô góc trên bên phải.

## Cập nhật lên GitHub và Netlify

1. Tải ZIP, giải nén và sao lưu bản repo hiện tại trước khi chép các thay đổi.
2. Chép nội dung thư mục `lyhoangmakeup-web-main` vào đúng thư mục repo GitHub.
3. Chạy `node build.js` ở thư mục gốc để tạo các trang HTML, sitemap và trang 404.
4. Xem lại các trang đã thay đổi, đặc biệt trang chủ, Blog, sản phẩm và Lookbook.
5. Commit và push lên nhánh `main`. Các thao tác Publish trong Admin hiện dùng commit `[skip ci]`, nên vào Netlify → **Deploys** → **Trigger deploy** để cập nhật website.

## Khóa học online có thu phí

Website hiện là website tĩnh; dữ liệu trong `data/`, ảnh/video trong `anh/` và `media/` được tải công khai. Vì vậy, trạng thái “khóa học trả phí” hoặc chỉ ẩn video bằng JavaScript sẽ không bảo vệ được nội dung.

Trước khi tải bài học trả phí lên, cần bổ sung đăng nhập học viên, xác nhận giao dịch phía máy chủ, quyền truy cập theo khóa học và kho lưu video/tài liệu riêng có cấp quyền truy cập ngắn hạn. Không đặt video hoặc tài liệu trả phí vào `anh/`, `media/` hay các file JSON công khai. Ba bài học miễn phí có thể giữ công khai trên website hiện tại.
