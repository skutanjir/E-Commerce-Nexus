import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-50 dark:bg-slate-950 w-full py-12 mt-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8 max-w-7xl mx-auto">
        <div className="space-y-6">
          <div className="text-xl font-bold text-slate-900 dark:text-white">NEXUS</div>
          <p className="text-sm font-inter text-slate-500 dark:text-slate-400 leading-relaxed">
            Solusi belanja online terpercaya untuk gaya hidup modern. Kurasi produk berkualitas tinggi dengan pelayanan terbaik di Indonesia.
          </p>
          <div className="flex gap-4">
            <a className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white transition-all" href="#">
              <span className="material-symbols-outlined text-sm">social_leaderboard</span>
            </a>
            <a className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white transition-all" href="#">
              <span className="material-symbols-outlined text-sm">share</span>
            </a>
            <a className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white transition-all" href="#">
              <span className="material-symbols-outlined text-sm">camera</span>
            </a>
          </div>
        </div>
        <div>
          <h6 className="font-bold text-slate-900 dark:text-white mb-6">Tautan Cepat</h6>
          <ul className="space-y-4">
            <li><Link className="text-sm font-inter text-slate-500 dark:text-slate-400 hover:text-blue-500 transition-colors" to="/kebijakan-privasi">Kebijakan Privasi</Link></li>
            <li><Link className="text-sm font-inter text-slate-500 dark:text-slate-400 hover:text-blue-500 transition-colors" to="/syarat-layanan">Syarat Layanan</Link></li>
            <li><Link className="text-sm font-inter text-slate-500 dark:text-slate-400 hover:text-blue-500 transition-colors" to="/about-us">Hubungi Kami</Link></li>
            <li><Link className="text-sm font-inter text-slate-500 dark:text-slate-400 hover:text-blue-500 transition-colors" to="/info-pengiriman">Info Pengiriman</Link></li>
          </ul>
        </div>
        <div>
          <h6 className="font-bold text-slate-900 dark:text-white mb-6">Layanan Pelanggan</h6>
          <ul className="space-y-4">
            <li><Link className="text-sm font-inter text-slate-500 dark:text-slate-400 hover:text-blue-500 transition-colors" to="/pusat-bantuan">Pusat Bantuan</Link></li>
            <li><Link className="text-sm font-inter text-slate-500 dark:text-slate-400 hover:text-blue-500 transition-colors" to="/lacak-pesanan">Lacak Pesanan</Link></li>
            <li><Link className="text-sm font-inter text-slate-500 dark:text-slate-400 hover:text-blue-500 transition-colors" to="/kebijakan-retur">Kebijakan Retur</Link></li>
            <li><Link className="text-sm font-inter text-slate-500 dark:text-slate-400 hover:text-blue-500 transition-colors" to="/faq">FAQ</Link></li>
          </ul>
        </div>
      </div>
      <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 text-center">
        <p className="text-sm font-inter text-slate-500 dark:text-slate-400">© 2024 NEXUS E-commerce. Semua hak dilindungi.</p>
      </div>
    </footer>
  );
}
