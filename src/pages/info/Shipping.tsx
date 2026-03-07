import InfoLayout from '../../components/ui/InfoLayout';
import { Truck, Clock, Shield } from 'lucide-react';

export default function Shipping() {
    return (
        <InfoLayout
            title="Shipping Information"
            subtitle="Fast, reliable, and secure delivery to your doorstep."
        >
            <div className="space-y-12">
                <div className="grid grid-cols-3 gap-4 py-8 border-y border-surface-100">
                    <div className="text-center">
                        <Truck className="mx-auto text-primary-500 mb-3" size={24} />
                        <h4 className="font-bold text-sm">Free Delivery</h4>
                        <p className="text-xs text-surface-500">Over $100</p>
                    </div>
                    <div className="text-center">
                        <Clock className="mx-auto text-primary-500 mb-3" size={24} />
                        <h4 className="font-bold text-sm">Fast Shipping</h4>
                        <p className="text-xs text-surface-500">2-5 Days</p>
                    </div>
                    <div className="text-center">
                        <Shield className="mx-auto text-primary-500 mb-3" size={24} />
                        <h4 className="font-bold text-sm">Fully Insured</h4>
                        <p className="text-xs text-surface-500">Global Coverage</p>
                    </div>
                </div>

                <section>
                    <h2 className="text-2xl font-display font-bold text-surface-900 mb-6">Shipping Rates</h2>
                    <div className="overflow-hidden rounded-2xl border border-surface-100">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-surface-50 font-bold text-surface-900">
                                <tr>
                                    <th className="p-4">Selection</th>
                                    <th className="p-4">Delivery Time</th>
                                    <th className="p-4 text-right">Cost</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-100">
                                <tr>
                                    <td className="p-4">Standard Shipping</td>
                                    <td className="p-4">5-7 Business Days</td>
                                    <td className="p-4 text-right">$9.00</td>
                                </tr>
                                <tr>
                                    <td className="p-4 font-medium">Free Shipping (Orders $100+)</td>
                                    <td className="p-4">5-7 Business Days</td>
                                    <td className="p-4 text-right">FREE</td>
                                </tr>
                                <tr>
                                    <td className="p-4">Express Shipping</td>
                                    <td className="p-4">2-3 Business Days</td>
                                    <td className="p-4 text-right">$25.00</td>
                                </tr>
                                <tr>
                                    <td className="p-4">International Priority</td>
                                    <td className="p-4">3-5 Business Days</td>
                                    <td className="p-4 text-right">$45.00</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-display font-bold text-surface-900 mb-4">Handling Times</h2>
                    <p className="text-surface-600 leading-relaxed">
                        Orders are typically processed and shipped within 1-2 business days. During peak seasons or promotional periods, processing times may extend to 3-4 business days. You will receive an email confirmation with tracking details once your package is on its way.
                    </p>
                </section>
            </div>
        </InfoLayout>
    );
}
