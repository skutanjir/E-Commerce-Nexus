import InfoLayout from '../../components/ui/InfoLayout';

export default function AboutUs() {
    return (
        <InfoLayout
            title="About Us"
            subtitle="Redefining premium commerce for the modern lifestyle since 2026."
        >
            <div className="space-y-12">
                <section>
                    <h2 className="text-3xl font-display font-bold text-surface-900 mb-6">Our Story</h2>
                    <p className="text-surface-600 leading-relaxed">
                        Founded in Jakarta in 2026, Nuxes began with a simple vision: to create a curated marketplace where quality craftsmanship meets contemporary design. We believe that the products you surround yourself with should be as durable as they are beautiful.
                    </p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8">
                    <div className="bg-surface-50 p-8 rounded-3xl">
                        <h3 className="text-xl font-bold text-surface-900 mb-4">Our Mission</h3>
                        <p className="text-surface-600">To empower artisans and designers by providing a platform that values quality over quantity, and sustainability over trends.</p>
                    </div>
                    <div className="bg-surface-50 p-8 rounded-3xl">
                        <h3 className="text-xl font-bold text-surface-900 mb-4">Our Vision</h3>
                        <p className="text-surface-600">To become the world's most trusted destination for premium essentials that enrich everyday life.</p>
                    </div>
                </div>

                <section>
                    <h2 className="text-3xl font-display font-bold text-surface-900 mb-6">Our Values</h2>
                    <ul className="space-y-4">
                        <li className="flex gap-4">
                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">1</span>
                            <div>
                                <h4 className="font-bold text-surface-900">Uncompromising Quality</h4>
                                <p className="text-surface-600">We source only the finest materials and partner with master craftsmen.</p>
                            </div>
                        </li>
                        <li className="flex gap-4">
                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">2</span>
                            <div>
                                <h4 className="font-bold text-surface-900">Ethical Sourcing</h4>
                                <p className="text-surface-600">Transparency is core to our operations. We know exactly who made your products.</p>
                            </div>
                        </li>
                        <li className="flex gap-4">
                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">3</span>
                            <div>
                                <h4 className="font-bold text-surface-900">Innovation</h4>
                                <p className="text-surface-600">We constantly seek new ways to improve the shopping experience and product design.</p>
                            </div>
                        </li>
                    </ul>
                </section>
            </div>
        </InfoLayout>
    );
}
