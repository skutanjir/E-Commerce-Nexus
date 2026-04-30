import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

export default function ShippingInfo() {
  return (
    <div className="min-h-screen bg-surface-container-lowest flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-20 max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-black text-on-surface mb-8">Informasi Pengiriman</h1>
        
        <div className="prose prose-slate max-w-none space-y-6 text-on-surface-variant">
          <section>
            <h2 className="text-xl font-bold text-on-surface mb-4">Estimasi Waktu Pengiriman</h2>
            <p>Pengiriman biasanya memakan waktu 2-5 hari kerja tergantung pada lokasi tujuan. Pesanan yang dilakukan sebelum jam 15:00 WIB akan diproses di hari yang sama.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-4">Area Pengiriman</h2>
            <p>Saat ini NEXUS melayani pengiriman ke seluruh wilayah di Indonesia menggunakan jasa kurir terpercaya mitra kami.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-4">Biaya Pengiriman</h2>
            <p className="font-bold text-primary">GRATIS ONGKIR!</p>
            <p>Sebagai bentuk apresiasi bagi pelanggan kami, saat ini seluruh pengiriman produk di NEXUS tidak dikenakan biaya kirim (Syarat dan Ketentuan berlaku).</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-4">Cara Melacak</h2>
            <p>Setelah pesanan dikirim, Anda akan menerima email konfirmasi berisi nomor resi. Anda dapat melacak posisi paket melalui halaman 'Lacak Pesanan' di platform kami.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
