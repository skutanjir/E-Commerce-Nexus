export interface Category {
    name: string;
    slug: string;
    image: string;
    count: number;
}

export const categories: Category[] = [
    {
        name: 'Electronics',
        slug: 'Electronics',
        image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600&q=80',
        count: 42,
    },
    {
        name: 'Clothing',
        slug: 'Clothing',
        image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80',
        count: 86,
    },
    {
        name: 'Accessories',
        slug: 'Accessories',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
        count: 54,
    },
    {
        name: 'Shoes',
        slug: 'Shoes',
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80',
        count: 37,
    },
    {
        name: 'Home',
        slug: 'Home',
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
        count: 65,
    },
    {
        name: 'Bags',
        slug: 'Bags',
        image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80',
        count: 28,
    },
];
