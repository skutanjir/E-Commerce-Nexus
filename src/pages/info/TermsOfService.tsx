import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-surface-container-lowest flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-20 max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-black text-on-surface mb-8">Syarat Layanan</h1>
        
        <div className="prose prose-slate max-w-none space-y-6 text-on-surface-variant">
          <section>
            <h2 className="text-xl font-bold text-on-surface mb-4">1. Ketentuan Penggunaan</h2>
            <p>Dengan mengakses platform NEXUS, Anda setuju untuk terikat oleh syarat dan ketentuan ini. Layanan kami hanya tersedia untuk individu yang dapat membentuk kontrak yang mengikat secara hukum sesuai hukum Indonesia.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-4">2. Aturan Platform</h2>
            <p>Pengguna dilarang melakukan tindakan yang merusak integritas sistem, menyalahgunakan data pengguna lain, atau melakukan transaksi penipuan. Pelanggaran terhadap aturan ini dapat berakibat pada penangguhan akun secara permanen.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-4">3. Tanggung Jawab Pengguna</h2>
            <p>Anda bertanggung jawab penuh atas kerahasiaan informasi akun dan password Anda. Segala aktivitas yang terjadi di bawah akun Anda adalah tanggung jawab Anda sepenuhnya.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-4">4. Penyelesaian Sengketa</h2>
            <p>Setiap perselisihan yang timbul dari penggunaan layanan kami akan diupayakan untuk diselesaikan secara musyawarah mufakat sebelum menempuh jalur hukum sesuai yurisdiksi Indonesia.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
