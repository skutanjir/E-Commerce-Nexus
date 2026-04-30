import { useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

export default function FAQ() {
  const faqs = [
    { q: "Bagaimana cara membuat akun di NEXUS?", a: "Klik tombol 'Daftar' di pojok kanan atas, isi data diri Anda, dan verifikasi email Anda." },
    { q: "Apakah belanja di NEXUS aman?", a: "Ya, kami menggunakan sistem keamanan enkripsi SSL dan partner pembayaran terpercaya untuk menjamin keamanan data Anda." },
    { q: "Metode pembayaran apa saja yang tersedia?", a: "Kami menerima Transfer Bank (VA), GoPay, OVO, Dana, dan Kartu Kredit." },
    { q: "Bagaimana cara membatalkan pesanan?", a: "Pesanan dapat dibatalkan melalui halaman 'Pesanan Saya' selama statusnya masih 'Pending'." },
    { q: "Apakah ada biaya pengiriman?", a: "Saat ini seluruh pengiriman di NEXUS adalah GRATIS ke seluruh Indonesia." },
    { q: "Berapa lama pesanan saya sampai?", a: "Estimasi 2-5 hari kerja tergantung lokasi Anda." },
    { q: "Apakah saya bisa menukar ukuran baju?", a: "Bisa, selama stok tersedia dan memenuhi syarat kebijakan retur kami (maksimal 7 hari)." },
    { q: "Bagaimana jika barang yang diterima rusak?", a: "Segera hubungi Help Center kami dengan melampirkan video unboxing untuk proses penggantian." },
    { q: "Dimana saya bisa melihat nomor resi?", a: "Nomor resi akan muncul di halaman 'Lacak Pesanan' setelah status pesanan berubah menjadi 'Dikirim'." },
    { q: "Bagaimana cara menjadi seller di NEXUS?", a: "Hubungi tim kemitraan kami melalui email di partner@nexus-ecommerce.com." }
  ];

  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-surface-container-lowest flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-20 max-w-4xl mx-auto px-4 w-full">
        <h1 className="text-3xl font-black text-on-surface mb-8">FAQ (Tanya Jawab)</h1>
        
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className="bg-surface-container-low rounded-2xl border border-outline-variant/10 overflow-hidden shadow-sm transition-all"
            >
              <button 
                onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
                className="w-full px-8 py-5 flex justify-between items-center text-left hover:bg-primary/5 transition-colors"
              >
                <span className="font-bold text-on-surface">{faq.q}</span>
                <span className={`material-symbols-outlined transition-transform duration-300 ${expandedIndex === idx ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>
              <div 
                className={`px-8 transition-all duration-300 ease-in-out ${expandedIndex === idx ? 'py-5 max-h-40 border-t border-outline-variant/10' : 'max-h-0'}`}
              >
                <p className="text-on-surface-variant text-sm leading-relaxed">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
