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
                NEXUS is more than a marketplace. It's a digital curator
                designed for the modern lifestyle.
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
                Our Story
              </h2>
              <div className="space-y-6 text-on-surface-variant leading-relaxed text-lg">
                <p>
                  Founded in 2024, NEXUS emerged from a simple yet ambitious
                  vision: to redefine how Indonesia experiences the digital
                  world. In a landscape filled with noise, we chose to be the
                  signal.
                </p>
                <p>
                  As a "Digital Curator," we don't just list products; we select
                  technology and lifestyle essentials that elevate the standard
                  of living. Our roots are firmly planted in the spirit of
                  Nusantara, combined with a relentless drive for global
                  innovation.
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
                  Active Users
                </div>
              </div>
              <div>
                <div className="text-5xl font-black text-primary mb-2">
                  50k+
                </div>
                <div className="text-on-surface-variant font-medium">
                  Trusted Merchants
                </div>
              </div>
              <div>
                <div className="text-5xl font-black text-primary mb-2">
                  24/7
                </div>
                <div className="text-on-surface-variant font-medium">
                  Concierge Support
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
                Our Mission
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
                <h3 className="text-xl font-bold mb-4">Innovation</h3>
                <p className="text-on-surface-variant">
                  Pushing boundaries with cutting-edge technology and localized
                  digital solutions for the archipelago.
                </p>
              </div>
              {/*  Quality  */}
              <div className="bg-surface-container-lowest p-10 rounded-xl editorial-shadow hover:translate-y-[-4px] transition-transform duration-300 group">
                <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
                  <span className="material-symbols-outlined text-primary group-hover:text-white">
                    verified
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-4">Quality</h3>
                <p className="text-on-surface-variant">
                  Curating only the best. Every merchant and product undergoes
                  rigorous vetting for excellence.
                </p>
              </div>
              {/*  Trust  */}
              <div className="bg-surface-container-lowest p-10 rounded-xl editorial-shadow hover:translate-y-[-4px] transition-transform duration-300 group">
                <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
                  <span className="material-symbols-outlined text-primary group-hover:text-white">
                    shield
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-4">Trust</h3>
                <p className="text-on-surface-variant">
                  Building lasting relationships through transparency, security,
                  and world-class reliability.
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
                <h2 className="text-3xl font-black mb-4">Core Values</h2>
                <p className="text-primary-fixed-dim">
                  The DNA of every decision we make at NEXUS.
                </p>
              </div>
              <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-surface-container-lowest p-8 rounded-xl editorial-shadow">
                  <h4 className="text-lg font-bold text-primary mb-2">
                    Customer First
                  </h4>
                  <p className="text-on-surface-variant">
                    Your journey is our priority. We listen, adapt, and serve
                    with empathy.
                  </p>
                </div>
                <div className="bg-surface-container-lowest p-8 rounded-xl editorial-shadow">
                  <h4 className="text-lg font-bold text-primary mb-2">
                    Integrity
                  </h4>
                  <p className="text-on-surface-variant">
                    Honesty in every transaction. We stand by our promises,
                    always.
                  </p>
                </div>
                <div className="md:col-span-2 bg-surface-container-lowest p-8 rounded-xl editorial-shadow">
                  <h4 className="text-lg font-bold text-primary mb-2">
                    Excellence
                  </h4>
                  <p className="text-on-surface-variant">
                    Average is not in our vocabulary. We strive for the peak in
                    product curation and user experience.
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
              Meet Our Leadership
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
              {/*  Placeholder Founder 1  */}
              <div className="group">
                <div className="aspect-square rounded-xl overflow-hidden mb-6 editorial-shadow relative">
                  <img
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    data-alt="Professional portrait of a confident Indonesian male executive in a smart casual blazer, warm lighting, blurred corporate background"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZzR14OmvEGnv4r84Su86DL2huoy1qq2C8jFjNucO7X12puPsRfcrZ1419G2md33nN-z0lO2g6RAGjTYP1qSblpmZ_rSM6_AswkrLQWEkK_1Z68KJ0aLexubRW_9Eq9IIcdqEp9ItawJI2DHAYCHcUCXyzbdrUU61FBiTVLHSyus8CvTNoH-24tjksIcae6RGtQoem787VlLwugmS3eTUjbnBltNrA4hjQ3yb8bfHv-CTG4wOleVSEn2Yx1V5KNgCDOOR_gwvAE4U"
                  />
                </div>
                <h4 className="text-xl font-bold">Adi Nugroho</h4>
                <p className="text-primary font-medium text-sm tracking-widest uppercase">
                  CEO &amp; Founder
                </p>
              </div>
              {/*  Placeholder Founder 2  */}
              <div className="group">
                <div className="aspect-square rounded-xl overflow-hidden mb-6 editorial-shadow relative">
                  <img
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    data-alt="Elegant Indonesian female leader in a professional setting, soft natural light, minimalist aesthetic"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdnDKgzMJZMTr0wxMTXf6HmmR-1cLqllzvZxpitOJLm8uy2-7Oifdp7ul8GS-Fm9RMILKAohtcWFw0r_0qYSs_lUnfgLRchk1weIYg9nnsj_jFo7tf0VA2tw1t1T4UT-l_Xv-VjotouSlQVTifbktHt-4jVOusHEWB-0KkJMAePapPe3KC9rZ0kkmtDb_riKaWYC1GdAnwpJTw5gbq5wcaFWvfib_-G7bZ03j1Ef0i3bU7-luxswpariSSgKM3bASfkaFLpBkxqaI"
                  />
                </div>
                <h4 className="text-xl font-bold">Sari Wijaya</h4>
                <p className="text-primary font-medium text-sm tracking-widest uppercase">
                  Chief Product Officer
                </p>
              </div>
              {/*  Placeholder Founder 3  */}
              <div className="group">
                <div className="aspect-square rounded-xl overflow-hidden mb-6 editorial-shadow relative">
                  <img
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    data-alt="Young energetic Asian technology lead with glasses, creative studio lighting, soft color palette"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJsIO-pt5W7i_WqD6ykqcOqb04EBvSeSTOweZRg0lJ7BwgYmgWUGGAFEq1OxUnc9H6Yo4VoYNmU5YEWMnUj26lRcpXJvixUeDuM1o6gViI5PzFkIQtYKD6xc9_bbwZjIyIGT3cWaWcOtGD-ToR3MouVg1woEBymM7V0XkSPOPNzlcci3yVf93Afi-adFW-k9moh9BfEOFZU-Vn-zJ_O2dd_cLb_NTXRYEVvcmFunlOVRSQtQ3-dODuRPAaaoi5ebcVmI-Q0Nju7Q8"
                  />
                </div>
                <h4 className="text-xl font-bold">Budi Santoso</h4>
                <p className="text-primary font-medium text-sm tracking-widest uppercase">
                  CTO
                </p>
              </div>
              {/*  Placeholder Founder 4  */}
              <div className="group">
                <div className="aspect-square rounded-xl overflow-hidden mb-6 editorial-shadow relative">
                  <img
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    data-alt="Professional Asian woman in creative leadership, modern interior background, clean lighting"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdFFCsv141DuqDwiSpxpns4rYlw0cTvEHHaNBxDy-1ZnsX8Y8oveccQigrgUCb4rRLJ69wPMmenMhYpq4T6G8dKZI-rZTQ7LgCSaQYuu2HaF0mPT7ZtcHp1tA-vFuRuVaKJN3twKCSm5ViFKS7rI9PPax5dzH3bxHbWem77UfuTAU16UQ1JLvCuOuzEnpTC21zu6DRLCkovCskax9R_62ebCOsb0tSTQWi5lX9fM2PpE8mMV3B_JrSjjgHwnC396e8p1061SUfz6g"
                  />
                </div>
                <h4 className="text-xl font-bold">Lina Putri</h4>
                <p className="text-primary font-medium text-sm tracking-widest uppercase">
                  Head of Operations
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
                Ready to Experience the Nexus?
              </h2>
              <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                Join a community that values quality and innovation above all
                else. Start your journey with the Digital Curator.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-primary px-10 py-4 rounded-lg font-bold text-lg transition-transform active:scale-95 shadow-xl">
                  Start Shopping
                </button>
                <button className="bg-transparent border border-white/30 backdrop-blur-sm text-white px-10 py-4 rounded-lg font-bold text-lg hover:bg-white/10 transition-colors">
                  Join Community
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
