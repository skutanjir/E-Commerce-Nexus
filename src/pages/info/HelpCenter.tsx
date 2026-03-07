import InfoLayout from '../../components/ui/InfoLayout';
import { Search, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function HelpCenter() {
    const [openIdx, setOpenIdx] = useState<number | null>(0);

    const faqs = [
        { q: 'How do I track my order?', a: 'Once your order ships, you will receive an email with a tracking link. You can also view your order status in your Buyer Dashboard under "Orders".' },
        { q: 'What is your return policy?', a: 'We offer a 30-day return policy for unused items in their original packaging. Please visit our Returns page for detailed instructions.' },
        { q: 'Can I change my shipping address?', a: 'Address changes can be made within 1 hour of placing your order. Please contact support immediately for assistance.' },
        { q: 'Do you ship internationally?', a: 'Yes, we ship to over 50 countries worldwide. International shipping rates and delivery times vary by location.' },
    ];

    return (
        <InfoLayout
            title="Help Center"
            subtitle="Everything you need to know about shopping with Nuxes."
        >
            <div className="space-y-12">
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search for articles, questions, or topics..."
                        className="w-full pl-12 pr-4 py-4 bg-surface-50 border border-surface-100 rounded-2xl outline-none focus:border-primary-500 transition-colors"
                    />
                </div>

                <section>
                    <h2 className="text-2xl font-display font-bold text-surface-900 mb-8">Popular Questions</h2>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <div key={i} className="border border-surface-100 rounded-2xl overflow-hidden">
                                <button
                                    onClick={() => setOpenIdx(openIdx === i ? null : i)}
                                    className="w-full flex items-center justify-between p-6 text-left hover:bg-surface-50 transition-colors"
                                >
                                    <span className="font-bold text-surface-900">{faq.q}</span>
                                    <ChevronDown size={20} className={`text-surface-400 transition-transform ${openIdx === i ? 'rotate-180' : ''}`} />
                                </button>
                                {openIdx === i && (
                                    <div className="px-6 pb-6 text-surface-600 leading-relaxed text-sm">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-8 bg-primary-50 rounded-3xl">
                        <h3 className="text-xl font-bold text-primary-900 mb-2">Chat with us</h3>
                        <p className="text-primary-700 text-sm mb-6">Our support team is available Mon-Fri, 9am - 6pm WIB.</p>
                        <button className="px-6 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors">Start Live Chat</button>
                    </div>
                    <div className="p-8 bg-blue-50 rounded-3xl">
                        <h3 className="text-xl font-bold text-blue-900 mb-2">Email Support</h3>
                        <p className="text-blue-700 text-sm mb-6">Response time is typically within 24 business hours.</p>
                        <button className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">Submit a Ticket</button>
                    </div>
                </div>
            </div>
        </InfoLayout>
    );
}
