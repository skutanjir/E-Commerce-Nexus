import InfoLayout from '../../components/ui/InfoLayout';
import { Download, ExternalLink } from 'lucide-react';

export default function Press() {
    const pressReleases = [
        { title: 'Nuxes Announces Global Expansion & New Designer Collections', date: 'March 1, 2026' },
        { title: 'Sustainability Report 2025: Achieving Net-Zero Operations', date: 'January 15, 2026' },
        { title: 'Series B Funding: $50M to Revolutionize Premium Commerce', date: 'November 10, 2025' },
    ];

    return (
        <InfoLayout
            title="Press"
            subtitle="Resources and updates for journalists and media partners."
        >
            <div className="space-y-16">
                <section>
                    <h2 className="text-3xl font-display font-bold text-surface-900 mb-8">Latest Press Releases</h2>
                    <div className="space-y-4">
                        {pressReleases.map((pr) => (
                            <div key={pr.title} className="p-6 bg-surface-50 rounded-2xl flex items-center justify-between hover:bg-surface-100 transition-colors cursor-pointer group">
                                <div>
                                    <p className="text-xs text-primary-600 font-bold uppercase tracking-wider mb-1">{pr.date}</p>
                                    <h3 className="font-bold text-surface-900 group-hover:text-primary-600 transition-colors">{pr.title}</h3>
                                </div>
                                <Download size={20} className="text-surface-400 group-hover:text-primary-500 transition-colors" />
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <h2 className="text-3xl font-display font-bold text-surface-900 mb-8">Media Kit</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-8 border border-surface-100 rounded-3xl">
                            <h3 className="text-xl font-bold text-surface-900 mb-2">Brand Assets</h3>
                            <p className="text-surface-600 text-sm mb-6">Logo suite, brand colors, and usage guidelines for official use.</p>
                            <button className="flex items-center gap-2 text-primary-600 font-bold hover:text-primary-700 transition-colors">
                                Download .ZIP <Download size={16} />
                            </button>
                        </div>
                        <div className="p-8 border border-surface-100 rounded-3xl">
                            <h3 className="text-xl font-bold text-surface-900 mb-2">Executive Bios</h3>
                            <p className="text-surface-600 text-sm mb-6">Learn more about the visionaries behind Nuxes leadership team.</p>
                            <button className="flex items-center gap-2 text-primary-600 font-bold hover:text-primary-700 transition-colors">
                                View Bios <ExternalLink size={16} />
                            </button>
                        </div>
                    </div>
                </section>

                <div className="p-10 bg-surface-900 rounded-3xl text-white">
                    <h3 className="text-2xl font-bold mb-4">Media Inquiries</h3>
                    <p className="text-surface-400 mb-6">For interviews, press samples, or additional information, please contact our PR team.</p>
                    <div className="space-y-2">
                        <p className="font-bold">General Inquiries: <span className="text-primary-400 font-normal">press@nuxes.com</span></p>
                        <p className="font-bold">European Region: <span className="text-primary-400 font-normal">press.eu@nuxes.com</span></p>
                    </div>
                </div>
            </div>
        </InfoLayout>
    );
}
