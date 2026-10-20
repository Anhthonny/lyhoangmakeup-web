'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = __dirname;
const SITE = 'https://lyhoangmakeup.com';
const rd = f => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')); } catch (e) { return null; } };
const tpl = fs.readFileSync(path.join(ROOT, 'template.html'), 'utf8');
const data = { site: rd('data/site.json'), home: rd('data/home.json'), price: rd('data/price.json'), blog: rd('data/blog.json'), shop: rd('data/shop.json'), look: rd('data/look.json'), rules: rd('data/rules.json'), seo: rd('data/seo.json') };

const script = tpl.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/)[1];
const els = {};
const mk = () => ({ innerHTML: '', textContent: '', classList: { add() {}, remove() {}, toggle() {} }, style: {}, dataset: {}, setAttribute() {}, addEventListener() {}, nextElementSibling: null });
const ctx = {
  document: { querySelector: s => els[s] || (els[s] = mk()), querySelectorAll: () => [], createTreeWalker: () => ({ nextNode: () => null }), addEventListener() {} },
  NodeFilter: { SHOW_TEXT: 4 }, nav: mk(), cart: mk(), addEventListener() {}, scrollTo() {},
  location: { hash: '', pathname: '/', search: '' }, history: { pushState() {}, replaceState() {} },
  localStorage: { getItem() { return null; }, setItem() {} }, navigator: {},
  fetch: () => new Promise(() => {}), console, Date, setTimeout, Promise
};
ctx.window = ctx; vm.createContext(ctx);
vm.runInContext(script + ';globalThis.__api={P,CFG,post,posts,slug,CD,MK,applyCfg,rebuildShop,SV,H,V,LK,esc,product,shop,plist,pslug,pimg,pprice,CAT_META};', ctx);
const A = ctx.__api;
const arr = (o, k) => (o && Array.isArray(o[k])) ? o[k] : null;
A.CFG.site = data.site; A.CFG.home = data.home; A.CFG.price = data.price;
A.CFG.blog = arr(data.blog, 'posts'); A.CFG.shop = arr(data.shop, 'products');
A.CFG.look = arr(data.look, 'categories'); A.CFG.rules = arr(data.rules, 'rules');
A.applyCfg(); A.rebuildShop();

const SV = k => A.V('site', k), PV = k => A.V('price', k), HV = k => A.V('home', k);
const BR = SV('brand_name') || 'Lý Hoàng Makeup & Academy';
const TEL = SV('hotline_display');
const BRS = BR.replace(/ ?& ?Academy/, '');
const rules = (A.CFG.rules || []).filter(r => r && r.find);
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function applyText(html) {
  if (!rules.length) return html;
  return html.replace(/>([^<]+)</g, (m, t) => { rules.forEach(r => { t = t.split(r.find).join(r.replace || ''); }); return '>' + t + '<'; });
}
const abs = u => !u ? '' : /^https?:/.test(u) ? u : SITE + '/' + String(u).replace(/^\/+/, '');
const cut = (s, n) => { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s; };

const CAT_SEO = {
  'trang-diem': {
    name: 'Trang điểm',
    title: `Mỹ phẩm & Dụng cụ Trang điểm chuyên nghiệp | ${BRS}`,
    desc: `Kem nền, che khuyết điểm, phấn phủ, bảng mắt, má hồng, son môi và cốp đồ nghề makeup do ${BRS} tuyển chọn tại Biên Hòa, Đồng Nai.`
  },
  'phu-kien-toc': {
    name: 'Phụ kiện tóc',
    title: `Phụ kiện tóc cô dâu, Máy làm tóc & Gôm xịt tạo kiểu | ${BRS}`,
    desc: `Gôm xịt tóc, máy uốn duỗi, lược chia tóc chuyên nghiệp và trâm cài, băng đô pha lê cô dâu do ${BRS} chọn dùng tại Biên Hòa.`
  },
  'cham-soc-da': {
    name: 'Chăm sóc da',
    title: `Chăm sóc da & Cấp ẩm tiền Makeup (Skin Prep) | ${BRS}`,
    desc: `Nước tẩy trang, xịt khoáng, toner, kem dưỡng ẩm và mặt nạ phục hồi da trước khi đánh nền do ${BRS} khuyên dùng.`
  },
  'nuoc-hoa': {
    name: 'Nước hoa',
    title: `Nước hoa Nữ, Nam & Nước hoa chiết chính hãng | ${BRS}`,
    desc: `Tuyển tập nước hoa nữ, nam, unisex và ống chiết mini lưu hương quyến rũ cho cô dâu và đi tiệc tại ${BRS} Biên Hòa.`
  }
};

/* ---- danh sách trang */
const SKIP = /-old$|^\/hoc-vien\/chuyen-nghiep$|^\/hoc-vien\/master$/;
let paths = Object.keys(A.P).filter(p => !SKIP.test(p));
const posts = A.posts();
posts.forEach(b => paths.push('/blog/' + A.slug(b.title)));
Object.keys(CAT_SEO).forEach(k => paths.push('/cua-hang/' + k));
A.plist().forEach(p => paths.push('/cua-hang/' + A.pslug(p)));
paths = Array.from(new Set(paths));

/* ---- tiêu đề + mô tả mặc định cho từng trang */
const LOC = 'Biên Hòa, Đồng Nai';
function defMeta(p) {
  const CD = A.CD, MK = A.MK;
  const M = {
    '/': [`${BRS} | Trang điểm cô dâu & học makeup Biên Hòa`, `Trang điểm cô dâu, tiệc, kỷ yếu theo từng gương mặt và đào tạo makeup 1:1 tại Tân Triều, ${LOC}. Đặt lịch: ${TEL}.`],
    '/ve-master': [`Master Lý Hoàng | Chuyên gia makeup 10 năm tại Biên Hòa`, `Câu chuyện, triết lý cầm cọ và lộ trình nghề của Master Lý Hoàng, người đứng sau ${BR} tại ${LOC}.`],
    '/dich-vu': [`Dịch vụ trang điểm cô dâu & tiệc tại Biên Hòa | ${BRS}`, `Makeup cô dâu, lễ hỏi, đi tiệc, sự kiện, kỷ yếu tại ${LOC}. Bảng giá minh bạch, Master làm trực tiếp, có buổi thử layout.`],
    '/dich-vu/co-dau': [`Trang điểm cô dâu Biên Hòa | Gói Signature | ${BRS}`, `Gói cô dâu Signature ${PV('signature_price')}: Master làm 100%, test makeup chuyên sâu, tặng makeup mẹ cô dâu, dặm phấn suốt tiệc. Đặt lịch ${TEL}.`],
    '/dich-vu/tiec-su-kien': [`Makeup đi tiệc, sự kiện tại Biên Hòa | Bảng giá | ${BRS}`, `Bảng giá makeup đi tiệc, sự kiện, chủ tiệc tại tiệm hoặc tại nhà ở ${LOC}. Gồm làm tóc hoàn chỉnh. Đặt lịch ${TEL}.`],
    '/dich-vu/ky-yeu': [`Makeup kỷ yếu, chụp ảnh tại Biên Hòa | ${BRS}`, `Makeup kỷ yếu, tốt nghiệp trong trẻo, bền màu dưới nắng, giá ${PV('kyyeu_price')}, gồm làm tóc. Tại ${LOC}.`],
    '/hoc-vien': [`Học makeup Biên Hòa | Học viện ${BRS.replace(' Makeup','')}`, `Học makeup cá nhân 1:1 từ con số 0 đến nhận khách thực tế tại ${LOC}. Thực hành trên mẫu thật, ca sáng hoặc tối linh hoạt.`],
    '/hoc-vien/co-ban-1-1': [`Khóa Makeup Cá Nhân 1:1 tại Biên Hòa | ${BRS}`, `5 buổi kèm 1:1, học phí ${PV('academy_price')}: phân tích da, kỹ thuật nền, mắt má môi, tự makeup nhiều layout và 3 kiểu tóc.`],
    '/lookbook': [`Lookbook makeup cô dâu, Hàn Quốc, Douyin | ${BRS}`, `Bộ sưu tập layout trong trẻo Hàn Quốc, Douyin sắc sảo, cô dâu truyền thống và tone Tây do Master Lý Hoàng thực hiện tại ${LOC}.`],
    '/blog': [`Blog làm đẹp: makeup cô dâu, tóc, chăm da | ${BRS}`, `Kinh nghiệm chọn layout, chăm da trước ngày cưới, kiểu tóc cô dâu và học makeup cho người mới từ Master Lý Hoàng.`],
    '/cua-hang': [`Cửa hàng cọ, mỹ phẩm, phụ kiện tóc, nước hoa | ${BRS}`, `Bộ cọ trang điểm, bông mút, xịt khóa nền, phụ kiện tóc cô dâu, chăm sóc da và nước hoa do ${BR} tuyển chọn.`],
    '/quiz': [`Trắc nghiệm chọn layout makeup hợp gương mặt | ${BRS}`, `Trả lời 3 câu hỏi về dáng mặt, phong cách và làn da để nhận gợi ý layout makeup phù hợp với bạn.`],
    '/dat-lich': [`Đặt lịch makeup | ${BRS}`, `Điền thông tin để đặt lịch makeup tại tiệm hoặc tại nhà ở ${LOC}. Hotline/Zalo ${TEL}.`]
  };
  if (M[p]) return { t: M[p][0], d: M[p][1] };
  let m;
  if ((m = p.match(/^\/hoc-vien\/(.+)$/)) && CD[m[1]]) return { t: `${CD[m[1]][0]} | Học viện ${BRS.replace(' Makeup','')} Biên Hòa`, d: cut(`${CD[m[1]][2]} Học trực tiếp cùng Master Lý Hoàng tại ${LOC}.`, 158) };
  if ((m = p.match(/^\/ve-master\/(.+)$/)) && MK[m[1]]) return { t: `${MK[m[1]][0]} | Master Lý Hoàng`, d: cut(`${MK[m[1]][1]} Master Lý Hoàng, ${BR}, ${LOC}.`, 158) };
  if ((m = p.match(/^\/cua-hang\/(.+)$/))) {
    if (CAT_SEO[m[1]]) {
      const c = CAT_SEO[m[1]];
      const firstProd = A.plist().find(x => x.category === c.name);
      return { t: c.title, d: cut(c.desc, 158), img: firstProd ? A.pimg(firstProd, 0) : null, cat: c, catSlug: m[1] };
    }
    const pp = A.plist().find(x => A.pslug(x) === m[1]);
    if (pp) return { t: cut(pp.name, 52) + ` | ${BRS}`, d: cut((String(pp.short_desc || '').split(/(?<=\.)\s/)[0] || pp.name), 125) + ` Sản phẩm ${BRS} chọn dùng.`, img: A.pimg(pp, 0), prod: pp };
  }
  if ((m = p.match(/^\/blog\/(.+)$/))) { const b = posts.find(x => A.slug(x.title) === m[1]); if (b) return { t: (String(b.title).indexOf(BRS) > -1 ? String(b.title) : `${b.title} | ${BRS}`), d: cut(String(b.description || '').length < 110 ? (b.description + ' Chia sẻ từ Master Lý Hoàng, ' + BRS + ' tại ' + LOC + '.') : b.description, 158), img: b.thumbnail, post: b }; }
  return { t: BR, d: cut(HV('hero_desc'), 158) };
}
const seoOver = (data.seo && Array.isArray(data.seo.pages)) ? data.seo.pages : [];
const norm = p => '/' + String(p || '').replace(/^\/+|\/+$/g, '');
function metaFor(p) {
  const m = defMeta(p);
  const o = seoOver.find(x => x && norm(x.path) === norm(p));
  if (o) { if (o.title) m.t = o.title; if (o.description) m.d = o.description; if (o.image) m.img = o.image; }
  if (!m.img && p === '/dich-vu' && PV('service_banner')) m.img = PV('service_banner');
  m.u = SITE + (p === '/' ? '/' : p + '/');
  m.img = abs(m.img || SV('logo') || 'anh/logo-ly-hoang-makeup-artist-bien-hoa.webp');
  return m;
}

/* ---- dữ liệu có cấu trúc */
function jsonld(p, m) {
  const sameAs = ['facebook', 'tiktok', 'youtube'].map(k => SV(k)).filter(Boolean);
  const biz = {
    '@context': 'https://schema.org', '@type': 'HealthAndBeautyBusiness', '@id': SITE + '/#business', name: BR, url: SITE + '/',
    image: abs(SV('logo')), telephone: '+84' + String(SV('hotline_tel')).replace(/^0/, ''), email: SV('email') || undefined,
    address: { '@type': 'PostalAddress', streetAddress: SV('address'), addressLocality: 'Biên Hòa', addressRegion: 'Đồng Nai', addressCountry: 'VN' },
    areaServed: ['Biên Hòa', 'Đồng Nai', 'TP.HCM'], hasMap: SV('map_url') || undefined, sameAs,
    openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '07:00', closes: '21:00' }]
  };
  if (p === '/') return [biz, { '@context': 'https://schema.org', '@type': 'WebSite', name: BR, url: SITE + '/', inLanguage: 'vi' }];
  const out = [];
  if (m.cat) {
    const cProds = A.plist().filter(x => x.category === m.cat.name);
    out.push({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: m.cat.title,
      description: m.cat.desc,
      url: m.u,
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: cProds.length,
        itemListElement: cProds.map((x, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          url: SITE + '/cua-hang/' + A.pslug(x) + '/',
          name: x.name
        }))
      }
    });
  }
  if (m.prod) {
    const pp = m.prod, pr = A.pprice(pp);
    const pd = {
      '@context': 'https://schema.org', '@type': 'Product', name: pp.name,
      description: cut(pp.short_desc, 300) || pp.name, sku: pp.code || undefined,
      category: pp.subcategory ? `${pp.category} > ${pp.subcategory}` : pp.category,
      brand: { '@type': 'Brand', name: BR },
      image: [0, 1, 2].map(i => A.pimg(pp, i)).filter(Boolean).map(abs), url: m.u,
      offers: { '@type': 'Offer', url: m.u, priceCurrency: 'VND', price: pr ? String(pr) : "0", availability: 'https://schema.org/InStock', itemCondition: 'https://schema.org/NewCondition', seller: { '@type': 'Organization', name: BR } }
    };
    out.push(pd);
  }
  if (m.post) out.push({ '@context': 'https://schema.org', '@type': 'BlogPosting', headline: m.post.title, description: cut(m.post.description, 200), image: m.img, mainEntityOfPage: m.u, inLanguage: 'vi', author: { '@type': 'Organization', name: BR }, publisher: { '@type': 'Organization', name: BR, logo: { '@type': 'ImageObject', url: abs(SV('logo')) } } });
  const parts = p.split('/').filter(Boolean); let acc = '';
  const items = [{ '@type': 'ListItem', position: 1, name: 'Trang chủ', item: SITE + '/' }];
  if (m.prod && m.prod.category) {
    const cSlug = A.slug(m.prod.category);
    items.push({ '@type': 'ListItem', position: 2, name: 'Cửa hàng', item: SITE + '/cua-hang/' });
    items.push({ '@type': 'ListItem', position: 3, name: m.prod.category, item: SITE + '/cua-hang/' + cSlug + '/' });
    items.push({ '@type': 'ListItem', position: 4, name: m.prod.name, item: m.u });
  } else {
    parts.forEach((s, i) => { acc += '/' + s; const last = i === parts.length - 1; items.push({ '@type': 'ListItem', position: i + 2, name: last ? (m.cat ? m.cat.name : m.t.split(' | ')[0]) : ({ 'cua-hang': 'Cửa hàng', 'dich-vu': 'Dịch vụ', 'hoc-vien': 'Học viện', 've-master': 'Về Master', blog: 'Blog', lookbook: 'Lookbook' }[s] || s.replace(/-/g, ' ')), item: SITE + acc + '/' }); });
  }
  out.push({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items });
  return out;
}
const NOINDEX = new Set(['/dat-lich']);
function head(p, m) {
  const ver = [];
  if (SV('google_verification')) ver.push(`<meta name="google-site-verification" content="${esc(SV('google_verification'))}">`);
  if (SV('bing_verification')) ver.push(`<meta name="msvalidate.01" content="${esc(SV('bing_verification'))}">`);
  const isPost = !!m.post;
  return [
    `<title>${esc(m.t)}</title>`,
    `<meta name="description" content="${esc(m.d)}">`,
    `<link rel="canonical" href="${m.u}">`,
    `<meta name="robots" content="${NOINDEX.has(p) ? 'noindex,follow' : 'index,follow,max-image-preview:large'}">`,
    `<meta property="og:type" content="${isPost ? 'article' : 'website'}"><meta property="og:site_name" content="${esc(BR)}"><meta property="og:locale" content="vi_VN">`,
    `<meta property="og:title" content="${esc(m.t)}"><meta property="og:description" content="${esc(m.d)}"><meta property="og:url" content="${m.u}"><meta property="og:image" content="${m.img}">`,
    `<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(m.t)}"><meta name="twitter:description" content="${esc(m.d)}"><meta name="twitter:image" content="${m.img}">`,
    `<meta name="geo.region" content="VN-39"><meta name="geo.placename" content="Biên Hòa, Đồng Nai">`,
    ...ver,
    ...jsonld(p, m).map(o => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`)
  ].join('\n');
}

/* ---- ghép trang */
const seoMap = {};
paths.forEach(p => { const m = metaFor(p); seoMap[p] = { t: m.t, d: m.d, u: m.u }; });
const seoScript = '<script>window.__SEO=' + JSON.stringify(seoMap).replace(/</g, '\\u003c') + ';</script>';
const footer = applyText(els['#ft'].innerHTML);
function renderBody(p) {
  const h = p.indexOf('/blog/') === 0 ? A.post(p.slice(6)) : p.indexOf('/cua-hang/') === 0 ? A.product(p.slice(10)) : A.P[p]();
  return applyText(A.LK(h));
}
function write(file, content) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, content); }
let n = 0;
paths.forEach(p => {
  const m = metaFor(p);
  let h = tpl;
  h = h.replace('<!--SEO-->', () => head(p, m) + '\n' + seoScript);
  h = h.replace('<!--APP-->', () => renderBody(p));
  h = h.replace('<!--FOOT-->', () => footer);
  h = h.replace(/(<img class="lg" id="hlg" src=")[^"]*(")/, (a, b, c) => b + esc(SV('logo') || 'anh/logo-ly-hoang-makeup-artist-bien-hoa.webp') + c);
  h = h.replace(/(<b id="hbn">)[^<]*(<\/b>)/, (a, b, c) => b + esc(BR) + c);
  const file = p === '/' ? path.join(ROOT, 'index.html') : path.join(ROOT, p, 'index.html');
  write(file, h); n++;
});

/* ---- sitemap, robots, 404 */
const today = new Date().toISOString().slice(0, 10);
const pri = p => p === '/' ? '1.0' : /^\/(dich-vu|hoc-vien|lookbook|cua-hang\/(trang-diem|phu-kien-toc|cham-soc-da|nuoc-hoa))(\/[^/]+)?$/.test(p) ? '0.8' : '0.6';
const urls = paths.filter(p => !NOINDEX.has(p)).map(p => `  <url><loc>${SITE}${p === '/' ? '/' : p + '/'}</loc><lastmod>${today}</lastmod><priority>${pri(p)}</priority></url>`);
write(path.join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);
write(path.join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: ${SITE}/sitemap.xml\n`);
write(path.join(ROOT, '404.html'), `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Không tìm thấy trang | ${esc(BR)}</title><style>body{font-family:Montserrat,system-ui,sans-serif;background:#fdfbf4;color:#2a2112;display:grid;place-content:center;min-height:100vh;text-align:center}a{color:#8a6410}</style></head><body><h1>Không tìm thấy trang</h1><p><a href="/">Về trang chủ ${esc(BR)}</a></p></body></html>`);
console.log('Đã tạo', n, 'trang, sitemap.xml, robots.txt, 404.html');
