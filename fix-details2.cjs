const fs = require('fs');

// 1. Backend Fix - Add PUT and DELETE endpoints to routes/products.ts
const backendPath = '../nexus-backend/src/routes/products.ts';
if (fs.existsSync(backendPath)) {
  let c = fs.readFileSync(backendPath, 'utf8');

  const newRoutes = `
// PUT /:id/reviews/:reviewId/reply - reply to a review (seller only)
router.put('/:id/reviews/:reviewId/reply', authenticate, requireSeller, async (req: Request, res: Response): Promise<void> => {
  const { reply } = req.body;
  try {
    // Verify product belongs to this seller
    const prodCheck = await pool.query('SELECT seller_id FROM products WHERE id = $1', [req.params.id]);
    if (prodCheck.rows[0]?.seller_id !== req.user!.userId) {
      res.status(403).json({ error: 'Only the product seller can reply to reviews.' });
      return;
    }

    const result = await pool.query(
      'UPDATE product_reviews SET seller_reply = $1 WHERE id = $2 AND product_id = $3 RETURNING *',
      [reply, req.params.reviewId, req.params.id]
    );

    if (!result.rows[0]) {
      res.status(404).json({ error: 'Review not found.' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save reply' });
  }
});

// DELETE /:id/reviews/:reviewId - delete a review (seller only)
router.delete('/:id/reviews/:reviewId', authenticate, requireSeller, async (req: Request, res: Response): Promise<void> => {
  try {
    // Verify product belongs to this seller
    const prodCheck = await pool.query('SELECT seller_id FROM products WHERE id = $1', [req.params.id]);
    if (prodCheck.rows[0]?.seller_id !== req.user!.userId) {
      res.status(403).json({ error: 'Only the product seller can delete reviews.' });
      return;
    }

    const result = await pool.query(
      'DELETE FROM product_reviews WHERE id = $1 AND product_id = $2 RETURNING *',
      [req.params.reviewId, req.params.id]
    );

    if (!result.rows[0]) {
      res.status(404).json({ error: 'Review not found.' });
      return;
    }
    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});
`;

  if (!c.includes('/reviews/:reviewId/reply')) {
    // Insert before the last export default router
    c = c.replace('export default router;', newRoutes + '\nexport default router;');
    fs.writeFileSync(backendPath, c);
    console.log('Backend routes updated.');
  }
}

// 2. React UI Fix - Custom Modal for Reply in ProductDetail.tsx
const pdPath = 'src/pages/shop/ProductDetail.tsx';
if (fs.existsSync(pdPath)) {
  let c = fs.readFileSync(pdPath, 'utf8');

  // Insert state variables for custom Reply modal
  if (!c.includes('showReplyModal')) {
    c = c.replace('const [isWishlisted, setIsWishlisted] = useState(false);', 
      'const [isWishlisted, setIsWishlisted] = useState(false);\n  const [showReplyModal, setShowReplyModal] = useState(false);\n  const [replyReviewId, setReplyReviewId] = useState<string | null>(null);\n  const [replyText, setReplyText] = useState("");\n  const [replyUserName, setReplyUserName] = useState("");');
  }

  // Update existing button in the Review Map
  const btnSearchRegex = /const reply = prompt\('Tulis balasan Anda untuk '\+review\.user_name\+':'\);\s*if \(reply\) handleReplyReview\(review\.id, reply\);/;
  const replacePrompt = `
                            setReplyReviewId(review.id);
                            setReplyUserName(review.user_name);
                            setReplyText('');
                            setShowReplyModal(true);
  `;
  c = c.replace(btnSearchRegex, replacePrompt);

  // Function to actually submit the reply from Modal
  const submitReplyFromModal = `
  const submitReply = () => {
    if (!replyReviewId || !replyText.trim()) return;
    handleReplyReview(replyReviewId, replyText);
    setShowReplyModal(false);
  };
  `;
  
  if (!c.includes('const submitReply = () =>')) {
     c = c.replace('const handleReplyReview = async', submitReplyFromModal + '\n  const handleReplyReview = async');
  }

  // Inject Custom Modal UI at the bottom before Final Render End
  const customModalUI = `
        {/* Modal Balasan Penjual */}
        {showReplyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-2xl scale-in">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-on-surface">Balas Ulasan {replyUserName}</h3>
                <button onClick={() => setShowReplyModal(false)} className="text-on-surface-variant hover:text-error">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="mb-4">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Tulis balasan Anda sebagai penjual..."
                  className="w-full border border-outline-variant/20 rounded-xl p-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary min-h-[120px] resize-none"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-on-surface-variant border border-outline-variant/30 hover:bg-surface-container-low transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={submitReply}
                  disabled={!replyText.trim()}
                  className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20"
                >
                  Kirim Balasan
                </button>
              </div>
            </div>
          </div>
        )}`;

  if (!c.includes('Modal Balasan Penjual')) {
    c = c.replace(/\s*<\/main>\s*<Footer \/>\s*<\/>/g, '\n' + customModalUI + '\n      </main>\n      <Footer />\n    </>');
  }

  fs.writeFileSync(pdPath, c);
  console.log('Custom Modal injected into ProductDetail.tsx');
}
