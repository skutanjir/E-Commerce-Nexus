import InfoLayout from '../../components/ui/InfoLayout';
import { RefreshCcw, AlertCircle } from 'lucide-react';

export default function Returns() {
    return (
        <InfoLayout
            title="Returns & Exchanges"
            subtitle="Not quite right? We've made returns simple and stress-free."
        >
            <div className="space-y-12">
                <div className="bg-surface-50 p-8 rounded-3xl border border-surface-100">
                    <h2 className="text-2xl font-bold text-surface-900 mb-4 flex items-center gap-3">
                        <RefreshCcw className="text-primary-500" />
                        30-Day Policy
                    </h2>
                    <p className="text-surface-600 leading-relaxed">
                        We accept returns for items in their original condition (unworn, unwashed, and with all tags attached) within 30 days of the delivery date. Items purchased during clearance sales are final sale and cannot be returned.
                    </p>
                </div>

                <section>
                    <h2 className="text-2xl font-display font-bold text-surface-900 mb-8">How to Return</h2>
                    <div className="space-y-8">
                        {[
                            { step: '1', title: 'Start Your Return', desc: 'Visit our online return portal with your order number and email address.' },
                            { step: '2', title: 'Prepare Package', desc: 'Pack the items securely in their original packaging if possible.' },
                            { step: '3', title: 'Ship It Back', desc: 'Print the prepaid shipping label and drop it off at any authorized carrier location.' },
                            { step: '4', title: 'Get Refunded', desc: 'Once received, we will process your refund within 7-10 business days.' },
                        ].map((item) => (
                            <div key={item.step} className="flex gap-6">
                                <span className="flex-shrink-0 w-10 h-10 bg-primary-900 text-white rounded-xl flex items-center justify-center font-bold">{item.step}</span>
                                <div>
                                    <h3 className="font-bold text-surface-900 mb-1">{item.title}</h3>
                                    <p className="text-sm text-surface-600">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="p-8 border border-amber-100 bg-amber-50 rounded-2xl flex gap-4">
                    <AlertCircle className="text-amber-600 flex-shrink-0" size={24} />
                    <div>
                        <h4 className="font-bold text-amber-900 mb-1">Exchange Policy</h4>
                        <p className="text-sm text-amber-800">For faster service, we recommend returning your item for a refund and placing a new order for the desired size or color.</p>
                    </div>
                </div>

                <div className="text-center pt-8">
                    <button className="px-10 py-4 bg-primary-900 text-white font-bold rounded-xl hover:bg-surface-800 transition-shadow shadow-xl shadow-primary-900/20">
                        Access Return Portal
                    </button>
                </div>
            </div>
        </InfoLayout>
    );
}
