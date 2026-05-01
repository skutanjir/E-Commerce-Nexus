const fs = require('fs');

// Home.tsx
let home = fs.readFileSync('src/pages/home/Home.tsx', 'utf8');
home = home.replace(
  /src=\{product\.image_url \|\| "https:\/\/images\.unsplash\.com\/[^"]+"\}/g,
  'src={product.image_url || ""}'
);
home = home.replace(
  /<img\s+className="([^"]+)"\s+src=\{product\.image_url \|\| ""\}\s+alt=\{product\.name\}\s*\/>/g,
  `{product.image_url ? (
        <img className="$1" src={product.image_url} alt={product.name} />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-surface-container-low text-outline">
          <span className="material-symbols-outlined text-4xl">inventory_2</span>
        </div>
      )}`
);

home = home.replace(
  /<div className="flex items-center gap-1 mb-2">\s*<span className="material-symbols-outlined text-sm text-amber-400"[^>]*>star<\/span>\s*<span className="text-xs font-bold text-on-surface">5\.0<\/span>/g,
  `<div className="flex items-center gap-1 mb-2">
        {(product as any).reviews && (product as any).reviews.length > 0 ? (
          <>
            <span className="material-symbols-outlined text-sm text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="text-xs font-bold text-on-surface">{((product as any).reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / (product as any).reviews.length).toFixed(1)}</span>
          </>
        ) : (
          <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Belum ada rating</span>
        )}`
);
fs.writeFileSync('src/pages/home/Home.tsx', home);

// Catalogue.tsx
let catalog = fs.readFileSync('src/pages/shop/Catalogue.tsx', 'utf8');
catalog = catalog.replace(
  /src=\{product\.image_url \|\| "https:\/\/images\.unsplash\.com\/[^"]+"\}/g,
  'src={product.image_url || ""}'
);
catalog = catalog.replace(
  /<img\s+className="([^"]+)"\s+src=\{product\.image_url \|\| ""\}\s+alt=\{product\.name\}\s*\/>/g,
  `{product.image_url ? (
        <img className="$1" src={product.image_url} alt={product.name} />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-surface-container-low text-outline">
          <span className="material-symbols-outlined text-4xl">inventory_2</span>
        </div>
      )}`
);

catalog = catalog.replace(
  /<div className="flex items-center gap-0\.5 mb-1\.5">\s*\{\[1,2,3,4,5\]\.map\(s => \(\s*<span key=\{s\} className="material-symbols-outlined text-xs text-amber-400"[^>]*>star<\/span>\s*\)\)\}\s*<span className="text-\[10px\] text-on-surface-variant ml-1">5\.0<\/span>\s*<\/div>/g,
  `<div className="flex items-center gap-0.5 mb-1.5">
        {(product as any).reviews && (product as any).reviews.length > 0 ? (
          <>
            <span className="material-symbols-outlined text-sm text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="text-[10px] text-on-surface-variant ml-1">{((product as any).reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / (product as any).reviews.length).toFixed(1)}</span>
          </>
        ) : (
          <span className="text-[10px] font-bold text-outline">Belum ada rating</span>
        )}
      </div>`
);
fs.writeFileSync('src/pages/shop/Catalogue.tsx', catalog);

// ProductDetail.tsx
let pd = fs.readFileSync('src/pages/shop/ProductDetail.tsx', 'utf8');
pd = pd.replace(
  /<img src=\{product\.image_url \|\| "\/placeholder\.jpg"\} className="w-full h-full object-cover" \/>/g,
  '{product.image_url ? <img src={product.image_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-surface-container-low"><span className="material-symbols-outlined text-outline text-4xl">inventory_2</span></div>}'
);

if (!pd.includes('Ulasan Pembeli')) {
  pd = pd.replace(
    /<\/main>\s*<Footer \/>/g,
    `  {/* Ulasan Pelanggan */}
        <div className="mt-12 bg-surface-container-lowest rounded-3xl p-8 lg:p-12 border border-outline-variant/10">
          <h2 className="text-2xl font-black text-on-surface mb-8">Ulasan Pembeli</h2>
          {(product as any).reviews && (product as any).reviews.length > 0 ? (
            <div className="space-y-6">
              {(product as any).reviews.map((review: any) => (
                <div key={review.id} className="pb-6 border-b border-outline-variant/10 last:border-0 last:pb-0">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-10 h-10 rounded-full bg-surface-container-low overflow-hidden flex items-center justify-center flex-shrink-0 border border-outline-variant/10">
                      {review.user_avatar ? (
                        <img src={review.user_avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-outline text-xl">person</span>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-on-surface text-sm">{review.user_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className={\`material-symbols-outlined text-[14px] \${review.rating >= star ? 'text-amber-400' : 'text-slate-300'}\`} style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          ))}
                        </div>
                        <span className="text-[10px] text-on-surface-variant">
                          {new Date(review.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-on-surface leading-relaxed ml-14">{review.comment}</p>
                  )}
                  {review.seller_reply && (
                    <div className="mt-3 ml-14 p-4 bg-surface-container-low rounded-xl rounded-tl-sm border border-outline-variant/10">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1">Balasan Penjual</p>
                      <p className="text-sm text-on-surface-variant leading-relaxed">{review.seller_reply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-4xl text-outline mb-2">reviews</span>
              <p className="text-on-surface-variant">Belum ada ulasan untuk produk ini.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />`
  );
  fs.writeFileSync('src/pages/shop/ProductDetail.tsx', pd);
}
