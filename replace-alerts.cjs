const fs = require('fs');

const files = [
  'src/pages/admin/Chat.tsx',
  'src/pages/admin/Orders.tsx',
  'src/pages/dashboard/Chat.tsx',
  'src/pages/dashboard/OrderDetail.tsx',
  'src/pages/dashboard/Orders.tsx',
  'src/pages/shop/Checkout.tsx',
  'src/pages/shop/ProductDetail.tsx',
  'src/pages/admin/Categories.tsx',
  'src/pages/admin/Products.tsx',
  'src/pages/dashboard/Addresses.tsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  let oriContent = content;

  content = content.replace(/alert\((['"`])([^'"`]*(?:gagal|habis|kosong|maksimal|terlebih|batal)[^'"`]*)\1\)/gi, "toast($1$2$1, 'error')");
  content = content.replace(/alert\((err[^)]*)\)/g, "toast($1, 'error')");
  content = content.replace(/alert\((['"`])([^'"`]*(?:Terima kasih|diselesaikan|berhasil)[^'"`]*)\1\)/gi, "toast($1$2$1, 'success')");
  content = content.replace(/alert\(([^)]+)\)/g, "toast($1)");

  content = content.replace(/!confirm\(([^)]+)\)/g, "!(await confirmAction($1))");

  if (content !== oriContent) {
    const level = (file.match(/\//g) || []).length;
    const importPath = '../'.repeat(level - 1) + 'contexts/PopupContext';
    
    if (!content.includes('PopupContext')) {
      content = `import { usePopup } from '${importPath}';\n` + content;
    }

    if (!content.includes('usePopup()')) {
      if (file.includes('Chat.tsx')) {
        content = content.replace(/(function ChatList\([^)]*\)\s*\{)/, "$1\n  const { toast, confirm: confirmAction } = usePopup();");
        content = content.replace(/(function ChatDetail\([^)]*\)\s*\{)/, "$1\n  const { toast, confirm: confirmAction } = usePopup();");
        content = content.replace(/(export default function \w+\([^)]*\)\s*\{)/, "$1\n  const { toast, confirm: confirmAction } = usePopup();");
      } else {
        content = content.replace(/(export default function \w+\([^)]*\)\s*\{)/, "$1\n  const { toast, confirm: confirmAction } = usePopup();");
      }
    }
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
  }
});
