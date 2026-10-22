// Chạy 1 lần: chuyển Lookbook cũ sang cấu trúc mới (ngành chính + ngành con) và tạo kho video.
// An toàn: giữ nguyên dữ liệu cũ, chỉ thêm mới, chạy lại nhiều lần không bị trùng.
const fs = require('fs');
const path = require('path');
const read = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return d; } };
const slug = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const guess = t => { t = slug(t);
  if (/dau/.test(t)) return ['Cô dâu', 'Truyền thống'];
  if (/ky-yeu|tot-nghiep|chup/.test(t)) return ['Kỷ yếu & Chụp ảnh', ''];
  if (/tiec|su-kien/.test(t)) return ['Tiệc & Sự kiện', ''];
  if (/hoc-vien|lop|hau-truong/.test(t)) return ['Học viên & Hậu trường', ''];
  return ['Phong cách makeup', ''];
};
const short = t => String(t || '').replace(/\s*(kết hợp|,| - ).*$/i, '').replace(/\s+/g, ' ').trim();

// 1) Ảnh
const lf = 'data/look.json';
const look = read(lf, {});
if (!Array.isArray(look.photos) || !look.photos.length) {
  const photos = [];
  (look.categories || []).forEach(c => {
    const g = guess(c.title);
    const sub = short(c.title);
    (c.images || []).forEach(im => photos.push({ image: im, title: c.title || '', category: g[0], subcategory: g[0] === 'Cô dâu' ? (g[1] || sub) : sub }));
  });
  look.photos = photos;
}
if (!look.hub_title) look.hub_title = 'Kho ảnh & video thực tế';
if (!look.hub_intro) look.hub_intro = 'Những layout makeup thật do Master Lý Hoàng thực hiện. Chọn ảnh hoặc video, lọc theo ngành để tìm đúng phong cách bạn thích.';
fs.writeFileSync(lf, JSON.stringify(look, null, 2) + '\n');

// 2) Video: lấy từ video đầu trang chủ + quét thư mục videos/
const vf = 'data/lookvideo.json';
const lv = read(vf, {});
const vids = Array.isArray(lv.videos) ? lv.videos : [];
const have = new Set(vids.map(v => String(v.src || '').replace(/^\/+/, '')));
const add = (src, poster, title) => { src = String(src || '').replace(/^\/+/, ''); if (!src || have.has(src)) return; have.add(src);
  const g = guess(title); vids.push({ src, poster: poster || '', title: title || '', category: g[0], subcategory: g[1] || '' }); };
const home = read('data/home.json', {});
(home.videos || []).forEach(v => add(v.src, v.poster, v.label));
if (fs.existsSync('videos')) fs.readdirSync('videos').filter(f => /\.(mp4|webm|mov)$/i.test(f)).forEach(f => {
  const base = f.replace(/\.[^.]+$/, ''); const title = base.replace(/^video-/, '').replace(/-/g, ' ');
  const cand = ['anh/' + base + '.jpg', 'anh/' + base + '.webp', 'anh/' + base.replace(/^video-/, 'anh-bia-') + '.jpg'].find(p => fs.existsSync(p));
  add('videos/' + f, cand || '', title.charAt(0).toUpperCase() + title.slice(1));
});
lv.videos = vids;
fs.writeFileSync(vf, JSON.stringify(lv, null, 2) + '\n');
console.log('Lookbook: ' + look.photos.length + ' ảnh, ' + vids.length + ' video đã sẵn sàng trong Admin.');
