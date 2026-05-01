const fs = require('fs');

let pd = fs.readFileSync('src/pages/shop/ProductDetail.tsx', 'utf8');

const target = `<img
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                src={product.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60"}
              />`;

const replacement = `{product.image_url ? (
                <img
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                  src={product.image_url}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-surface-container-low text-outline">
                  <span className="material-symbols-outlined text-8xl opacity-50">inventory_2</span>
                </div>
              )}`;

pd = pd.replace(target, replacement);

fs.writeFileSync('src/pages/shop/ProductDetail.tsx', pd);
console.log("Image updated");