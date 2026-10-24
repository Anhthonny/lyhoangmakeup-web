'use strict';
// Compile in a temporary copy: source files on the Mac remain untouched.
// Only this sanitized directory is published by Netlify.
const fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process');
const C=require('./admin/shop-core.js'),root=__dirname,out=path.join(root,'dist');
const source=JSON.parse(fs.readFileSync(path.join(root,'data/shop-admin.json'),'utf8'));
if(!Array.isArray(source.products))throw Error('data/shop-admin.json thiếu products');
const publicShop=C.publicData(source);
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'lyhoang-shop-build-'));
const skip=new Set(['.git','node_modules','dist','.netlify','.env','data/shop-admin.json','data/shop.json']);
function filter(src){const rel=path.relative(root,src).split(path.sep).join('/');if(!rel)return true;const top=rel.split('/')[0];return !skip.has(rel)&&!skip.has(top)&&!top.startsWith('.')&&!/backup/i.test(top)&&!(/\.(zip|xlsx|xls|bak)$/i.test(rel));}
try{
 fs.cpSync(root,temp,{recursive:true,filter,dereference:false});
 fs.mkdirSync(path.join(temp,'data'),{recursive:true});
 fs.writeFileSync(path.join(temp,'data/shop.json'),JSON.stringify(publicShop,null,2)+'\n');
 // Remove old generated shop HTML so hidden/deleted products cannot leave stale pages.
 function clearShopHtml(dir){if(!fs.existsSync(dir))return;for(const e of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isDirectory())clearShopHtml(f);else if(e.isFile()&&e.name.endsWith('.html'))fs.unlinkSync(f);}}
 clearShopHtml(path.join(temp,'cua-hang'));
 cp.execFileSync(process.execPath,[path.join(temp,'build.js')],{cwd:temp,stdio:'inherit'});
 if(fs.existsSync(path.join(temp,'data/shop-admin.json')))throw Error('Dữ liệu giá mua lọt vào thư mục xuất bản.');
 const check=JSON.parse(fs.readFileSync(path.join(temp,'data/shop.json'),'utf8'));
 if(check.products.some(p=>'purchase_cost' in p||'markup_factor' in p||'pricing_mode' in p))throw Error('Dữ liệu nội bộ lọt vào JSON công khai.');
 // Build-only scripts are unnecessary on the published site.
 for(const name of ['build-shop.js','build.js','netlify.toml','package.json','package-lock.json'])fs.rmSync(path.join(temp,name),{force:true});
 fs.rmSync(out,{recursive:true,force:true});fs.cpSync(temp,out,{recursive:true});
 console.log('Shop: '+publicShop.products.length+' sản phẩm công khai. Xuất bản dist/; không chứa nguồn giá mua.');
}finally{fs.rmSync(temp,{recursive:true,force:true});}
