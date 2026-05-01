const fs = require('fs');

// 1. WebSocket Fix
const socketFiles = [
  'src/pages/dashboard/Chat.tsx',
  'src/components/layout/DashboardNav.tsx',
  'src/components/layout/Navbar.tsx',
  'src/pages/admin/Orders.tsx',
  'src/pages/admin/Chat.tsx'
];
for(let f of socketFiles) {
  if(fs.existsSync(f)) {
    let c = fs.readFileSync(f, 'utf8');
    if(!c.includes('reconnectionAttempts')) {
       c = c.replace(/const socket = io\(SOCKET_URL, \{/g, 'const socket = io(SOCKET_URL, { reconnectionAttempts: 3, reconnectionDelayMax: 10000, timeout: 5000,');
       fs.writeFileSync(f, c);
    }
  }
}

// 2. Button Voucher Fix
const buttonFiles = [
  'src/pages/home/Home.tsx',
  'src/pages/LandingPage.tsx'
];
for(let f of buttonFiles) {
  if(fs.existsSync(f)) {
    let c = fs.readFileSync(f, 'utf8');
    if(!c.includes('usePopup')) {
        c = c.replace('import { useUser }', 'import { usePopup } from "../../contexts/PopupContext";\nimport { useUser }');
    }
    if(!c.includes('const { toast } = usePopup();')) {
        c = c.replace(/(export default function \w+\(\) \{)/, '$1\n  const { toast } = usePopup();\n');
    }
    
    // Replace the button
    const searchRegex = /<button className="bg-white text-primary px-10 py-4([^>]*)>([^<]+)<\/button>/g;
    c = c.replace(searchRegex, '<button onClick={() => toast("Voucher MEGA11 berhasil diklaim, cek di halaman cart Anda!", "success")} className="bg-white text-primary px-10 py-4$1>$2</button>');
    fs.writeFileSync(f, c);
  }
}

// 3. ProductDetail Review Fix
const pdPath = 'src/pages/shop/ProductDetail.tsx';
if(fs.existsSync(pdPath)) {
  let c = fs.readFileSync(pdPath, 'utf8');
  
  const handlers = `
  const handleReplyReview = async (reviewId: string, replyText: string) => {
    try {
      await api.put(\`/products/\${product!.id}/reviews/\${reviewId}/reply\`, { reply: replyText });
      toast("Balasan berhasil dikirim!", "success");
      setProduct(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          reviews: prev.reviews.map((r: any) => r.id === reviewId ? { ...r, seller_reply: replyText } : r)
        };
      });
    } catch (err: any) {
      toast(err.response?.data?.error || "Gagal membalas ulasan", "error");
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!await confirmAction("Hapus ulasan ini permanen?")) return;
    try {
      await api.delete(\`/products/\${product!.id}/reviews/\${reviewId}\`);
      toast("Ulasan berhasil dihapus!", "success");
      setProduct(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          reviews: prev.reviews.filter((r: any) => r.id !== reviewId)
        };
      });
    } catch (err: any) {
      toast(err.response?.data?.error || "Gagal menghapus ulasan", "error");
    }
  };
  `;

  if(!c.includes('handleReplyReview')) {
    c = c.replace('const handleToggleWishlist = async () => {', handlers + '\n  const handleToggleWishlist = async () => {');
  }

  const sellerUI = `
                  {currentUser?.id === product?.seller_id && (
                    <div className="mt-4 flex gap-4 ml-14">
                      {!review.seller_reply && (
                        <button
                          onClick={() => {
                            const reply = prompt('Tulis balasan Anda untuk '+review.user_name+':');
                            if (reply) handleReplyReview(review.id, reply);
                          }}
                          className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">reply</span>
                          Balas Ulasan
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="text-xs text-error font-bold hover:underline flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                        Hapus
                      </button>
                    </div>
                  )}
  `;

  if(!c.includes('Tulis balasan Anda')) {
     const match = '{review.seller_reply && (';
     const replaceWith = sellerUI + '\n                  ' + match;
     c = c.replace(match, replaceWith);
  }
  
  fs.writeFileSync(pdPath, c);
}
