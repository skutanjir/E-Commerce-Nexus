const fs = require('fs');

function replaceInFile(file, search, replace) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.split(search).join(replace);
    fs.writeFileSync(file, content);
  }
}

// Re-add toast to Chat.tsx specifically
let adminChat = fs.readFileSync('src/pages/admin/Chat.tsx', 'utf8');
adminChat = adminChat.replace(/function ChatPanel\(\{\s*order,\s*sellerId,\s*onClose\s*\}\s*:\s*\{\s*order:\s*any;\s*sellerId:\s*string\s*\|\s*null;\s*onClose:\s*\(\)\s*=>\s*void\s*\}\)\s*\{/, "function ChatPanel({ order, sellerId, onClose }: { order: any; sellerId: string | null; onClose: () => void }) {\n  const { toast } = usePopup();");
adminChat = adminChat.replace(/function ChatPanel\(\{\s*order,\s*sellerId,\s*onClose\s*\}\s*:\s*\{\s*order:\s*Order;\s*sellerId:\s*string\s*\|\s*null;\s*onClose:\s*\(\)\s*=>\s*void\s*\}\)\s*\{/, "function ChatPanel({ order, sellerId, onClose }: { order: Order; sellerId: string | null; onClose: () => void }) {\n  const { toast } = usePopup();");
fs.writeFileSync('src/pages/admin/Chat.tsx', adminChat);

// Handle the Navbar.tsx missing property issue
let nav = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf8');
nav = nav.replace(/user\?\.userId/g, 'user?.id');
fs.writeFileSync('src/components/layout/Navbar.tsx', nav);
