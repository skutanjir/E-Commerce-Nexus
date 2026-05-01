const fs = require('fs');

function replaceInFile(file, search, replace) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.split(search).join(replace);
    fs.writeFileSync(file, content);
  }
}

replaceInFile('src/components/layout/Navbar.tsx', 'user?.userId', 'user?.id');

let adminChat = fs.readFileSync('src/pages/admin/Chat.tsx', 'utf8');
if (!adminChat.includes('const { toast } = usePopup();') || adminChat.indexOf('const { toast } = usePopup();') > adminChat.indexOf('function ChatPanel')) {
   adminChat = adminChat.replace(/function ChatPanel\([^)]*\)\s*\{/, "function ChatPanel({ order, sellerId, onClose }: { order: any; sellerId: string | null; onClose: () => void }) {\n  const { toast } = usePopup();");
}
adminChat = adminChat.replace(/const \{ toast, confirm: confirmAction \} = usePopup\(\);\s*const \{ toast, confirm: confirmAction \} = usePopup\(\);/g, "const { toast, confirm: confirmAction } = usePopup();");
fs.writeFileSync('src/pages/admin/Chat.tsx', adminChat);

let adminOrders = fs.readFileSync('src/pages/admin/Orders.tsx', 'utf8');
if (!adminOrders.includes('const { toast } = usePopup();')) {
  adminOrders = adminOrders.replace(/function ChatPanel\([^)]*\)\s*\{/, "function ChatPanel({ order, sellerId, onClose }: { order: any; sellerId: string | null; onClose: () => void }) {\n  const { toast } = usePopup();");
}
fs.writeFileSync('src/pages/admin/Orders.tsx', adminOrders);

let dashChat = fs.readFileSync('src/pages/dashboard/Chat.tsx', 'utf8');
dashChat = dashChat.replace(/const \{ toast, confirm: confirmAction \} = usePopup\(\);\s*const \{ toast, confirm: confirmAction \} = usePopup\(\);/g, "const { toast, confirm: confirmAction } = usePopup();");
fs.writeFileSync('src/pages/dashboard/Chat.tsx', dashChat);
