import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { supabase } from "../../lib/supabase";

import type { Category } from "../../types";

type CategoryWithCount = Category & { product_count?: number };

interface SupabaseCategoryResponse extends Category {
  products: { count: number }[];
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data, error: fetchError } = await supabase
          .from("categories")
          .select("*, products(count)");

        if (fetchError) throw fetchError;

        const formattedData = (data as SupabaseCategoryResponse[] | null)?.map((cat) => ({
          ...cat,
          product_count: cat.products?.[0]?.count || 0,
        })) || [];

        setCategories(formattedData as CategoryWithCount[]);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-20 px-8 max-w-7xl mx-auto min-h-screen">
        <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-8 font-label">
          <Link className="hover:text-primary transition-colors" to="/">
            Home
          </Link>
          <span className="material-symbols-outlined text-xs">
            chevron_right
          </span>
          <span className="text-on-surface font-medium">Categories</span>
        </nav>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="p-8 bg-error/10 text-error rounded-xl text-center">
            {error}
          </div>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                className="group relative aspect-[4/5] overflow-hidden rounded-lg bg-surface-container-lowest editorial-shadow transition-all duration-300 hover:-translate-y-1"
                to={`/categories/${category.slug}`}
              >
                <img
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  alt={category.name}
                  src={category.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-on-background/80 via-on-background/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6 w-full">
                  <span className="text-xs uppercase tracking-widest text-primary-fixed mb-1 block font-bold">
                    {category.product_count} Products
                  </span>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </section>
        )}

        <section className="mt-20 p-12 rounded-xl bg-surface-container-low border border-outline-variant/10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold mb-2">
              Can't find a specific category?
            </h2>
            <p className="text-on-surface-variant">
              Our concierge service can help you source items from categories
              not yet listed or provide personalized recommendations based on
              your tastes.
            </p>
          </div>
          <button className="px-8 py-3 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold rounded-lg active:scale-95 transition-all editorial-shadow">
            Contact Concierge
          </button>
        </section>
      </main>
      <Footer />
    </>
  );
}
