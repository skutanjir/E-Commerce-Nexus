import InfoLayout from '../../components/ui/InfoLayout';
import { Briefcase, Heart, Globe, Users } from 'lucide-react';

export default function Careers() {
    const perks = [
        { icon: Globe, title: 'Remote First', desc: 'Work from anywhere in the world with our distributed team.' },
        { icon: Heart, title: 'Wellness', desc: 'Comprehensive health coverage and mental health support.' },
        { icon: Users, title: 'Ownership', desc: 'Stock options and a high degree of autonomy in your role.' },
        { icon: Briefcase, title: 'Growth', desc: 'Annual budget for learning and development.' },
    ];

    const openings = [
        { title: 'Senior Frontend Engineer', dept: 'Engineering', location: 'Remote' },
        { title: 'Product Designer (UX/UI)', dept: 'Design', location: 'Remote / Jakarta' },
        { title: 'Growth Marketing Manager', dept: 'Marketing', location: 'Remote' },
        { title: 'Customer Experience Lead', dept: 'Operations', location: 'Jakarta' },
    ];

    return (
        <InfoLayout
            title="Careers"
            subtitle="Build the future of commerce with us. We're looking for talented individuals to join our growing team."
        >
            <div className="space-y-16">
                <section>
                    <h2 className="text-3xl font-display font-bold text-surface-900 mb-8 text-center">Why Nuxes?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {perks.map((perk) => (
                            <div key={perk.title} className="p-6 border border-surface-100 rounded-3xl hover:bg-surface-50 transition-colors">
                                <perk.icon className="text-primary-500 mb-4" size={24} />
                                <h3 className="font-bold text-surface-900 mb-2">{perk.title}</h3>
                                <p className="text-surface-600 text-sm leading-relaxed">{perk.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-display font-bold text-surface-900">Open Positions</h2>
                        <span className="px-3 py-1 bg-surface-100 text-surface-600 text-sm font-medium rounded-full">4 Openings</span>
                    </div>
                    <div className="space-y-4">
                        {openings.map((job) => (
                            <div key={job.title} className="group flex items-center justify-between p-6 bg-surface-50 rounded-2xl hover:bg-white hover:shadow-xl hover:shadow-primary-900/5 transition-all cursor-pointer border border-transparent hover:border-primary-100">
                                <div>
                                    <h3 className="font-bold text-surface-900 group-hover:text-primary-600 transition-colors">{job.title}</h3>
                                    <div className="flex gap-4 mt-2">
                                        <span className="text-sm text-surface-500">{job.dept}</span>
                                        <span className="text-sm text-surface-400">•</span>
                                        <span className="text-sm text-surface-500">{job.location}</span>
                                    </div>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-surface-400 group-hover:bg-primary-500 group-hover:text-white transition-all shadow-sm">
                                    →
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="bg-primary-900 rounded-3xl p-10 text-center text-white">
                    <h3 className="text-2xl font-bold mb-4">Don't see a perfect fit?</h3>
                    <p className="text-primary-100 mb-8">We're always looking for passionate people. Send us your resume and we'll keep you in mind for future openings.</p>
                    <button className="px-8 py-4 bg-white text-primary-900 font-bold rounded-xl hover:bg-primary-50 transition-colors">
                        General Application
                    </button>
                </div>
            </div>
        </InfoLayout>
    );
}
