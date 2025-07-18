import type { BlogPost } from "~/routes/blog";

interface BlogGridProps {
    posts: BlogPost[];
}

export default function BlogGrid({ posts }: BlogGridProps) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-12">
            {posts.map((post) => (
                <article key={post.id} className="group cursor-pointer">
                    {/* Container image compact */}
                    <div className="aspect-[3/4] overflow-hidden mb-2 bg-gray-100 rounded-sm">
                        <img 
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                            decoding="async"
                        />
                    </div>

                    {/* Contenu texte compact */}
                    <div className="space-y-0.5">
                        <h3 className="text-[20px] text-center font-medium text-black leading-tight line-clamp-2 group-hover:text-adawi-gold transition-colors duration-300">
                            {post.title}
                        </h3>
                        <p className="text-[15px] text-center text-adawi-gold font-medium">
                            {post.date}
                        </p>
                    </div>
                </article>
            ))}
        </div>
    );
}
