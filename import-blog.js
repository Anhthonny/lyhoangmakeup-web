'use strict';
/*
  NHẬP BÀI BLOG HÀNG LOẠT
  -----------------------
  Mỗi bài viết = 1 file .md trong thư mục bai-viet/ (xem bai-viet/_mau-bai-viet.md).
  Chạy:   node import-blog.js          (ghi vào data/blog.json)
          node import-blog.js --thu    (chạy thử, chỉ báo cáo, KHÔNG ghi file)
  - Bài chưa có (theo tiêu đề) sẽ được THÊM vào cuối danh sách.
  - Bài đã có cùng tiêu đề sẽ được CẬP NHẬT nội dung.
  - File bắt đầu bằng dấu _ (như _mau-bai-viet.md) bị bỏ qua.
*/
const fs = require('fs'), path = require('path');
const ROOT = __dirname, DIR = path.join(ROOT, 'bai-viet'), JSON_FILE = path.join(ROOT, 'data', 'blog.json');
const DRY = process.argv.includes('--thu');
const slug = s => String(s || '').toLowerCase().replace(/đ/g, 'd').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const unq = v => { v = v.trim(); if ((v[0] === '"' && v.slice(-1) === '"') || (v[0] === "'" && v.slice(-1) === "'")) v = v.slice(1, -1); return v; };

function parse(text) {
  text = text.replace(/^﻿/, '').replace(/\r\n?/g, '\n');
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { error: 'Thiếu phần đầu --- ... --- (xem file mẫu)' };
  const meta = {};
  m[1].split('\n').forEach(l => { const i = l.indexOf(':'); if (i > 0 && !/^\s*#/.test(l)) meta[l.slice(0, i).trim()] = unq(l.slice(i + 1)); });
  return { meta, body: m[2].trim() };
}

if (!fs.existsSync(DIR)) { console.log('Không thấy thư mục bai-viet/. Hãy tạo thư mục này và đặt các file .md vào.'); process.exit(1); }
const files = fs.readdirSync(DIR).filter(f => /\.md$/i.test(f) && !f.startsWith('_')).sort();
if (!files.length) { console.log('Thư mục bai-viet/ chưa có file .md nào (file bắt đầu bằng _ bị bỏ qua).'); process.exit(0); }

const raw = fs.readFileSync(JSON_FILE, 'utf8');
const data = JSON.parse(raw);
if (!Array.isArray(data.posts)) { console.log('data/blog.json không đúng định dạng (thiếu "posts").'); process.exit(1); }
const bySlug = new Map(data.posts.map((p, i) => [slug(p.title), i]));
let added = 0, updated = 0, bad = 0;

files.forEach(f => {
  const r = parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  const warn = [];
  if (r.error) { console.log('LỖI  ', f, '-', r.error); bad++; return; }
  const { meta, body } = r;
  if (!meta.title) { console.log('LỖI  ', f, '- thiếu "title:"'); bad++; return; }
  if (!body) { console.log('LỖI  ', f, '- chưa có nội dung bài'); bad++; return; }
  const d = meta.description || '';
  if (!d) warn.push('chưa có description (mô tả Google)'); else if (d.length < 110 || d.length > 165) warn.push(`description dài ${d.length} ký tự (nên 110–160)`);
  if (meta.thumbnail && !/^https?:/.test(meta.thumbnail) && !fs.existsSync(path.join(ROOT, meta.thumbnail.replace(/^\//, '')))) warn.push('không thấy ảnh ' + meta.thumbnail + ' trong thư mục anh/');
  if (meta.cta && !['cd', 'hv'].includes(meta.cta)) warn.push('cta chỉ nhận cd (đặt lịch makeup) hoặc hv (học viện)');
  const key = slug(meta.title);
  if (bySlug.has(key)) {
    /* cập nhật: chỉ ghi đè những mục có trong file .md, giữ nguyên các mục còn lại (vd ảnh đại diện) */
    const i = bySlug.get(key), upd = { title: meta.title, body };
    ['description', 'thumbnail', 'thumbnail_alt'].forEach(k => { if (meta[k]) upd[k] = meta[k]; });
    if (meta.cta) upd.cta = meta.cta === 'hv' ? 'hv' : 'cd';
    data.posts[i] = Object.assign({}, data.posts[i], upd); updated++; console.log('CẬP NHẬT', f, '→ /blog/' + key + '/'); }
  else { data.posts.push({ cta: meta.cta === 'hv' ? 'hv' : 'cd', title: meta.title, description: d, thumbnail: meta.thumbnail || '', thumbnail_alt: meta.thumbnail_alt || '', body }); bySlug.set(key, data.posts.length - 1); added++; console.log('THÊM MỚI', f, '→ /blog/' + key + '/'); }
  warn.forEach(w => console.log('   ⚠ ', w));
});

console.log(`\nTổng: thêm ${added}, cập nhật ${updated}, lỗi ${bad}. Blog sẽ có ${data.posts.length} bài.`);
if (DRY) console.log('(Chạy thử — chưa ghi file.)');
else if (bad) console.log('Có lỗi ở trên nên CHƯA ghi gì cả. Sửa các file lỗi rồi chạy lại.');
else if (added || updated) { fs.writeFileSync(JSON_FILE, JSON.stringify(data, null, 2) + '\n'); console.log('Đã ghi data/blog.json.'); }
if (bad) process.exitCode = 1;
