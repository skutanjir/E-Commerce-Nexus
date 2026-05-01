const fs = require('fs');

// Create a gentle middleware that sets req.user to null without firing 401
let authTs = fs.readFileSync('../nexus-backend/src/middleware/auth.ts', 'utf8');
if (!authTs.includes('optionalAuthenticate')) {
  authTs += `
export async function optionalAuthenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    next();
    return;
  }

  try {
    const isBlacklisted = await redis.get(\`blacklist:\${token}\`);
    if (isBlacklisted) {
      next();
      return;
    }

    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (err) {
    next();
  }
}
`;
  fs.writeFileSync('../nexus-backend/src/middleware/auth.ts', authTs);
}

// Update the router to use the new optionalAuthenticate for `/me`
let routeStr = fs.readFileSync('../nexus-backend/src/routes/auth.ts', 'utf8');
routeStr = routeStr.replace(
  "import { authenticate } from '../middleware/auth';",
  "import { authenticate, optionalAuthenticate } from '../middleware/auth';"
);

routeStr = routeStr.replace(
  "router.get('/me', authenticate, async (req: Request, res: Response) => {",
  "router.get('/me', optionalAuthenticate, async (req: Request, res: Response) => {"
);

routeStr = routeStr.replace(
  /const userId = req.user\?\.userId \|\| \(req.user as any\)\?\.id;\s+if \(!userId\) \{\s+return res.status\(401\).json\(\{ error: 'Unauthorized' \}\);\s+\}/g,
  `const userId = req.user?.userId || (req.user as any)?.id;
    if (!userId) {
      return res.status(200).json({ user: null, profile: null });
    }`
);

fs.writeFileSync('../nexus-backend/src/routes/auth.ts', routeStr);
