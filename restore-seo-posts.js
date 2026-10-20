'use strict';
/*
  KHÔI PHỤC 10 BÀI BLOG ĐẦU TIÊN VỀ BẢN CHUẨN SEO
  ------------------------------------------------
  Ngày 17/10 các bài này đã có tiêu đề, mô tả và nội dung dài chuẩn SEO. Sau đó file data/blog.json bị
  ghi đè bằng bản gốc (ngắn, chưa SEO). Script này đưa 10 bài về lại bản chuẩn SEO (lấy từ seo-posts-backup.json),
  đồng thời thêm chuyển hướng 301 từ địa chỉ cũ sang địa chỉ mới vào netlify.toml để không mất lượt truy cập/Google.
  Chạy:  node restore-seo-posts.js --thu   (chỉ báo cáo)    |    node restore-seo-posts.js   (thực hiện)
  Chạy lại nhiều lần vẫn an toàn. Không đụng tới các bài khác (bài 11 trở đi giữ nguyên).
*/
const fs = require('fs'), path = require('path');
const ROOT = __dirname, DRY = process.argv.includes('--thu');
const slug = s => String(s || '').toLowerCase().replace(/đ/g, 'd').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const BLOG = path.join(ROOT, 'data', 'blog.json'), TOML = path.join(ROOT, 'netlify.toml');
const data = JSON.parse(fs.readFileSync(BLOG, 'utf8'));
const backup = JSON.parse(fs.readFileSync(path.join(ROOT, 'seo-posts-backup.json'), 'utf8'));
const redirects = [];
let restored = 0, already = 0, missing = 0;

backup.forEach(e => {
  const sOld = slug(e.orig_title), sNew = slug(e.post.title);
  const iOld = data.posts.findIndex(p => slug(p.title) === sOld);
  const iNew = data.posts.findIndex(p => slug(p.title) === sNew);
  if (iOld > -1) {
    data.posts[iOld] = e.post; restored++;
    console.log('KHÔI PHỤC', '/blog/' + sOld + '/  →  /blog/' + sNew + '/');
    if (sOld !== sNew) redirects.push([sOld, sNew]);
  } else if (iNew > -1) { already++; console.log('đã chuẩn SEO ', '/blog/' + sNew + '/'); }
  else { missing++; console.log('KHÔNG THẤY  ', e.orig_title, '(đã bị đổi tên hoặc xóa — bỏ qua)'); }
});
console.log(`\nKhôi phục ${restored}, đã chuẩn sẵn ${already}, không thấy ${missing}.`);

if (DRY) { console.log('(Chạy thử — chưa ghi file.)'); process.exit(0); }
if (restored) fs.writeFileSync(BLOG, JSON.stringify(data, null, 2) + '\n');

let toml = fs.readFileSync(TOML, 'utf8');
const MARK = '# --- chuyen huong bai blog cu sang dia chi chuan SEO (tu dong) ---';
if (redirects.length && !toml.includes(MARK)) {
  const block = MARK + '\n' + redirects.map(([a, b]) => `[[redirects]]\n  from = "/blog/${a}"\n  to = "/blog/${b}/"\n  status = 301\n  force = true\n`).join('\n') + '\n';
  const at = toml.search(/\[\[redirects\]\]\s*\n\s*from = "\/\*"/);
  toml = at > -1 ? toml.slice(0, at) + block + toml.slice(at) : toml.replace(/\s*$/, '\n\n') + block;
  fs.writeFileSync(TOML, toml);
  console.log('Đã thêm', redirects.length, 'chuyển hướng 301 vào netlify.toml.');
}
if (restored) console.log('Đã ghi data/blog.json.');
