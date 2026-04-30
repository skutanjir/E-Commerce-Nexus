import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-surface-container-lowest flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-20 max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-black text-on-surface mb-8">Kebijakan Privasi</h1>
        
        <div className="prose prose-slate max-w-none space-y-6 text-on-surface-variant">
          <section>
            <h2 className="text-xl font-bold text-on-surface mb-4">1. Pengumpulan Data</h2>
            <p>Kami mengumpulkan informasi yang Anda berikan langsung kepada kami saat Anda membuat akun, melakukan pembelian, atau berkomunikasi dengan kami. Informasi ini mencakup nama, alamat email, alamat pengiriman, nomor telepon, dan detail pembayaran.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-4">2. Penggunaan Data</h2>
            <p>Kami menggunakan data Anda untuk memproses pesanan, mengelola akun Anda, meningkatkan layanan kami, dan mengirimkan informasi terkait promosi atau update produk (jika Anda menyetujuinya).</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-4">3. Keamanan</h2>
            <p>Kami mengimplementasikan langkah-langkah keamanan teknis dan organisasional untuk melindungi data pribadi Anda dari akses yang tidak sah, pengungkapan, atau kerusakan.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-4">4. Hak Pengguna</h2>
            <p>Anda memiliki hak untuk mengakses, mengoreksi, atau menghapus data pribadi Anda yang kami simpan. Anda juga dapat menarik persetujuan pemasaran kapan saja melalui pengaturan akun.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
