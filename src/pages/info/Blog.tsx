import InfoLayout from '../../components/ui/InfoLayout';

export default function Blog() {
    const posts = [
        {
            title: 'The Art of Minimalist Living: Less is More',
            excerpt: 'Discover how simplifying your surroundings can lead to a more focused and intentional life.',
            date: 'March 5, 2026',
            category: 'Lifestyle',
            image: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=800&q=80'
        },
        {
            title: 'Behind the Scenes: Sourcing Our Premium Leather',
            excerpt: 'Take a journey with us to the heart of Tuscany to meet the artisans who create our signature leather goods.',
            date: 'February 28, 2026',
            category: 'Craftsmanship',
            image: 'https://images.unsplash.com/photo-1590670311229-3705ce8f1585?w=800&q=80'
        },
        {
            title: 'Upcoming Spring 2026 Collection Preview',
            excerpt: 'A first look at the textures, colors, and designs that will define our upcoming seasonal launch.',
            date: 'February 22, 2026',
            category: 'Curation',
            image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e12?w=800&q=80'
        }
    ];

    return (
        <InfoLayout
            title="Blog"
            subtitle="Explore our latest stories, craftsmanship guides, and lifestyle inspiration."
        >
            <div className="space-y-12">
                {posts.map((post) => (
                    <article key={post.title} className="group cursor-pointer">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            <div className="aspect-[16/10] rounded-3xl overflow-hidden">
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                            </div>
                            <div>
                                <div className="flex items-center gap-4 mb-4">
                                    <span className="px-3 py-1 bg-primary-100 text-primary-600 text-xs font-bold rounded-full uppercase tracking-wider">{post.category}</span>
                                    <span className="text-sm text-surface-400">{post.date}</span>
                                </div>
                                <h3 className="text-2xl font-bold text-surface-900 group-hover:text-primary-600 transition-colors mb-4">{post.title}</h3>
                                <p className="text-surface-600 leading-relaxed mb-6">{post.excerpt}</p>
                                <span className="font-bold text-surface-900 border-b-2 border-primary-500 pb-1 hover:text-primary-600 transition-colors">Read Article</span>
                            </div>
                        </div>
                    </article>
                ))}

                <div className="pt-12 text-center border-t border-surface-100">
                    <button className="px-8 py-4 border-2 border-surface-200 text-surface-600 font-bold rounded-xl hover:border-primary-500 hover:text-primary-500 transition-all">
                        Load More Articles
                    </button>
                </div>
            </div>
        </InfoLayout>
    );
}
