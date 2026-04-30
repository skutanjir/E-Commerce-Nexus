import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

export default function ReturnPolicy() {
  return (
    <div className="min-h-screen bg-surface-container-lowest flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-20 max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-black text-on-surface mb-8">Kebijakan Retur</h1>
        
        <div className="prose prose-slate max-w-none space-y-6 text-on-surface-variant">
          <section>
            <h2 className="text-xl font-bold text-on-surface mb-4">Syarat Retur</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Produk dapat diretur dalam jangka waktu maksimal 7 hari setelah barang diterima.</li>
              <li>Produk harus dalam kondisi asli, belum digunakan, dan label masih terpasang.</li>
              <li>Menyertakan video unboxing sebagai bukti jika terdapat cacat atau kerusakan produk.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-4">Cara Retur</h2>
            <p>Hubungi Customer Service kami melalui WhatsApp dengan menyertakan ID Pesanan dan alasan retur. Kami akan memberikan instruksi pengiriman balik produk.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-4">Refund Policy</h2>
            <p>Dana akan dikembalikan (refund) maksimal 3 hari kerja setelah produk yang diretur kami terima dan validasi di gudang kami. Refund akan dikirimkan ke saldo e-wallet atau rekening asal Anda.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
