const fs = require('fs');

let disc = fs.readFileSync('src/pages/admin/Discounts.tsx', 'utf8');

disc = disc.replace(
  /const deletePromo = \(id: string\) => savePromos\(promos\.filter\(p => p\.id !== id\)\);/g,
  `const deletePromo = async (id: string) => {
    if (!(await confirmAction('Hapus promo ini?'))) return;
    savePromos(promos.filter(p => p.id !== id));
    toast('Promo berhasil dihapus.', 'success');
  };`
);

disc = disc.replace(
  /savePromos\(\[promo, \.\.\.promos\]\);\s*setForm\(\{ name: "", discount: "", start: "", end: "", products: \[\] \}\);\s*setShowForm\(false\);\s*setSaving\(false\);/g,
  `savePromos([promo, ...promos]);
      setForm({ name: "", discount: "", start: "", end: "", products: [] });
      setShowForm(false);
      setSaving(false);
      toast('Promo berhasil dibuat.', 'success');`
);

fs.writeFileSync('src/pages/admin/Discounts.tsx', disc);
