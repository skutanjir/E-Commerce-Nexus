import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

export default function AboutUs() {
  return (
    <>
      {/*  TopNavBar  */}
      <Navbar />
      <main className="pt-16">
        {/*  Hero Section  */}
        <section className="relative h-[819px] flex items-center justify-start overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              className="w-full h-full object-cover brightness-[0.4]"
              data-alt="Modern high-tech workspace in Jakarta with glass walls and skyline view at dusk, soft cinematic lighting and futuristic atmosphere"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCyuBrUMnxPTde9LY2sT6b-87Eb-xHHob8-Rcmxp9DbMiptTS8j2Og5YAJqlQ3Tp5D2miRKpHjtltP-UHvKRk02VnGGnuuohEYjYbV-NnPi-3XH8TxtOG6-58fVorUto6HpbHHqjFayetuwARqKA18UCOUJKvDjLQP4m45jqeOjtHqrPTJGsKkl27DW3ah7hJP2-QfxCKnpOaVWrGb8rF05W7GcRaBfxicfP-IAqEN8QCzNqIMMhwhKjq-j6WCECwZB-aFBAnTYwZM"
            />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
            <div className="max-w-3xl">
              <h1 className="text-white text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 leading-tight">
                Membangun Ekosistem Digital untuk Indonesia
              </h1>
              <p className="text-white/80 text-xl md:text-2xl font-light mb-8 max-w-xl">
                NEXUS lebih dari sekadar marketplace. Ini adalah kurator digital
                yang dirancang untuk gaya hidup modern.
              </p>
              <button className="bg-gradient-to-r from-primary to-primary-container text-on-primary px-8 py-4 rounded font-semibold transition-transform active:scale-95 editorial-shadow">
                Pelajari Lebih Lanjut
              </button>
            </div>
          </div>
        </section>
        {/*  Our Story Section  */}
        <section className="py-24 bg-surface-container-low">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-on-surface mb-8">
                Cerita Kami
              </h2>
              <div className="space-y-6 text-on-surface-variant leading-relaxed text-lg">
                <p>
                  Didirikan pada tahun 2024, NEXUS lahir dari visi sederhana namun ambisius:
                  mendefinisikan ulang cara Indonesia merasakan dunia digital.
                  Di tengah lautan kebisingan, kami memilih untuk menjadi sinyal yang jelas.
                </p>
                <p>
                  Sebagai "Kurator Digital", kami tidak sekadar mendaftarkan produk; kami memilih
                  teknologi dan gaya hidup esensial yang meningkatkan standar kehidupan.
                  Akar kami tertancap kuat pada semangat Nusantara, dipadukan dengan
                  dorongan tanpa henti untuk inovasi global.
                </p>
              </div>
            </div>
            <div className="order-1 md:order-2 rounded-xl overflow-hidden editorial-shadow bg-surface-container-lowest p-4">
              <img
                className="rounded-lg w-full h-[400px] object-cover"
                data-alt="Elegant minimalist office interior in Indonesia with tropical plants, wooden textures, and warm ambient sunlight through large windows"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBOFgqgG77rtw-TcpfF0lHye_MCiMkwbM4baiY0yPCGmirOid0DzWMWvd5UN6m_Zroa7d5ey_sgVaMPOd21Jl6TmS9oFdn-H4TgxtM_zRj9yMAXJnZU524wPe86QE2qhyfA0QuY8t013uF4M1mEyEezMUzK7z3rTnsK-T5gZtXDcxGj24DDKFPe6tkM0BzgzWSUqh9V5wYu1fEGwSeOAOQ8IDQS8ep-8RMeE8NAWyytd-b2zss0523nkEe-YAAWiDmL7wI4nzMlyRg"
              />
            </div>
          </div>
        </section>
        {/*  Statistics Section  */}
        <section className="py-20 bg-surface-container-highest border-y border-outline-variant/10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              <div>
                <div className="text-5xl font-black text-primary mb-2">1M+</div>
                <div className="text-on-surface-variant font-medium">
                  Pengguna Aktif
                </div>
              </div>
              <div>
                <div className="text-5xl font-black text-primary mb-2">
                  50k+
                </div>
                <div className="text-on-surface-variant font-medium">
                  Merchant Terpercaya
                </div>
              </div>
              <div>
                <div className="text-5xl font-black text-primary mb-2">
                  24/7
                </div>
                <div className="text-on-surface-variant font-medium">
                  Dukungan Pelanggan
                </div>
              </div>
            </div>
          </div>
        </section>
        {/*  Our Mission Pillars  */}
        <section className="py-24 bg-surface">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-extrabold tracking-tight mb-4">
                Misi Kami
              </h2>
              <div className="w-20 h-1 bg-primary mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/*  Innovation  */}
              <div className="bg-surface-container-lowest p-10 rounded-xl editorial-shadow hover:translate-y-[-4px] transition-transform duration-300 group">
                <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
                  <span className="material-symbols-outlined text-primary group-hover:text-white">
                    lightbulb
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-4">Inovasi</h3>
                <p className="text-on-surface-variant">
                  Melampaui batasan dengan teknologi mutakhir dan solusi digital
                  yang dilokalkan untuk kepulauan Nusantara.
                </p>
              </div>
              {/*  Quality  */}
              <div className="bg-surface-container-lowest p-10 rounded-xl editorial-shadow hover:translate-y-[-4px] transition-transform duration-300 group">
                <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
                  <span className="material-symbols-outlined text-primary group-hover:text-white">
                    verified
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-4">Kualitas</h3>
                <p className="text-on-surface-variant">
                  Hanya memilih yang terbaik. Setiap merchant dan produk melewati
                  seleksi ketat demi keunggulan.
                </p>
              </div>
              {/*  Trust  */}
              <div className="bg-surface-container-lowest p-10 rounded-xl editorial-shadow hover:translate-y-[-4px] transition-transform duration-300 group">
                <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
                  <span className="material-symbols-outlined text-primary group-hover:text-white">
                    shield
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-4">Kepercayaan</h3>
                <p className="text-on-surface-variant">
                  Membangun hubungan jangka panjang melalui transparansi,
                  keamanan, dan keandalan kelas dunia.
                </p>
              </div>
            </div>
          </div>
        </section>
        {/*  Core Values Section (Asymmetric Bento)  */}
        <section className="py-24 bg-surface-container-low">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-4 bg-primary text-on-primary p-12 rounded-xl flex flex-col justify-end">
                <h2 className="text-3xl font-black mb-4">Nilai-Nilai Kami</h2>
                <p className="text-primary-fixed-dim">
                  DNA dari setiap keputusan yang kami buat di NEXUS.
                </p>
              </div>
              <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-surface-container-lowest p-8 rounded-xl editorial-shadow">
                  <h4 className="text-lg font-bold text-primary mb-2">
                    Pelanggan Utama
                  </h4>
                  <p className="text-on-surface-variant">
                    Perjalanan Anda adalah prioritas kami. Kami mendengarkan,
                    beradaptasi, dan melayani dengan empati.
                  </p>
                </div>
                <div className="bg-surface-container-lowest p-8 rounded-xl editorial-shadow">
                  <h4 className="text-lg font-bold text-primary mb-2">
                    Integritas
                  </h4>
                  <p className="text-on-surface-variant">
                    Kejujuran dalam setiap transaksi. Kami memegang teguh
                    janji kami, selalu.
                  </p>
                </div>
                <div className="md:col-span-2 bg-surface-container-lowest p-8 rounded-xl editorial-shadow">
                  <h4 className="text-lg font-bold text-primary mb-2">
                    Keunggulan
                  </h4>
                  <p className="text-on-surface-variant">
                    Rata-rata bukan kamus kami. Kami berusaha mencapai puncak
                    dalam kurasi produk dan pengalaman pengguna.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/*  Leadership Section  */}
        <section className="py-24 bg-surface">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-extrabold mb-16 tracking-tight">
              Kenali Tim Kami
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 max-w-4xl mx-auto">
              <div className="group flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 editorial-shadow">
                  <span className="material-symbols-outlined text-primary text-4xl">person</span>
                </div>
                <h4 className="text-xl font-bold">Erick Haidar Rahmat</h4>
                <p className="text-primary font-medium text-sm tracking-widest uppercase mt-1">
                  3124500047
                </p>
              </div>
              <div className="group flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 editorial-shadow">
                  <span className="material-symbols-outlined text-primary text-4xl">person</span>
                </div>
                <h4 className="text-xl font-bold">Sulistyo Fajar Pratama</h4>
                <p className="text-primary font-medium text-sm tracking-widest uppercase mt-1">
                  3124500037
                </p>
              </div>
              <div className="group flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 editorial-shadow">
                  <span className="material-symbols-outlined text-primary text-4xl">person</span>
                </div>
                <h4 className="text-xl font-bold">Wina Rahmalia</h4>
                <p className="text-primary font-medium text-sm tracking-widest uppercase mt-1">
                  3124500052
                </p>
              </div>
            </div>
          </div>
        </section>
        {/*  CTA Section  */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto rounded-3xl overflow-hidden relative min-h-[400px] flex items-center justify-center editorial-shadow">
            <img
              className="absolute inset-0 w-full h-full object-cover brightness-50"
              data-alt="Abstract colorful light streaks on a dark background representing digital connectivity and network flow, premium aesthetic"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcgwdZ8sUHf8jrnj7ayhZWETrSJ4HjofUriFkCTHQ_-quhDWBvxYw-cMmZ2FEfPco-Bp_RpROYQyIG_Ur4tAaNd9-jltWuYp2BmgMP-aCNXR7S4tF5nJt0EZAMC4P0V8iFp9rnaP2IM3AS4B_rmhWzstOLp93priTvGbEe9tkHSXV0rj39siTV4vkmVRfle7KlmPoF2WFez5Mqf8hq0dmkBZwEB4U2r9fZfeY20yd3jUzWHo6Y5DBmFk2LlLmGGtvAZ9yRnIbSp-A"
            />
            <div className="relative z-10 text-center text-white px-6">
              <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
                Siap Merasakan Pengalaman NEXUS?
              </h2>
              <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                Bergabunglah dengan komunitas yang menghargai kualitas dan inovasi
                di atas segalanya. Mulai perjalanan Anda bersama Kurator Digital kami.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-primary px-10 py-4 rounded-lg font-bold text-lg transition-transform active:scale-95 shadow-xl">
                  Mulai Belanja
                </button>
                <button className="bg-transparent border border-white/30 backdrop-blur-sm text-white px-10 py-4 rounded-lg font-bold text-lg hover:bg-white/10 transition-colors">
                  Pelajari Lebih Lanjut
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      {/*  Footer  */}
      <Footer />
    </>
  );
}
