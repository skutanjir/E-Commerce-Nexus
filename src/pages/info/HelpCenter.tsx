import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

export default function HelpCenter() {
  return (
    <div className="min-h-screen bg-surface-container-lowest flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-20 max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-black text-on-surface mb-8">Pusat Bantuan</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-surface-container-low p-8 rounded-2xl border border-outline-variant/10 shadow-sm">
            <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">contact_support</span>
              Hubungi Kami
            </h2>
            <div className="space-y-4 text-on-surface-variant text-sm">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined">chat</span>
                <div>
                  <p className="font-bold text-on-surface">WhatsApp</p>
                  <p>+62 812-3456-7890</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined">mail</span>
                <div>
                  <p className="font-bold text-on-surface">Email</p>
                  <p>support@nexus-ecommerce.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined">schedule</span>
                <div>
                  <p className="font-bold text-on-surface">Jam Operasional</p>
                  <p>Senin - Minggu: 09:00 - 21:00 WIB</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-low p-8 rounded-2xl border border-outline-variant/10 shadow-sm">
            <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">quick_reference_all</span>
              FAQ Singkat
            </h2>
            <div className="space-y-3 text-sm text-on-surface-variant">
              <p><strong>Bagaimana cara memesan?</strong><br/>Pilih produk, tambahkan ke keranjang, dan lakukan checkout.</p>
              <p><strong>Metode pembayaran apa saja?</strong><br/>Kami menerima transfer bank, e-wallet, dan kartu kredit.</p>
              <p><strong>Berapa lama garansi produk?</strong><br/>Garansi bervariasi antara 1-12 bulan tergantung vendor.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
