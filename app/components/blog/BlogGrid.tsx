import type { BlogPost } from "~/routes/blog";

interface BlogGridProps {
    posts: BlogPost[];
}

export default function BlogGrid({ posts }: BlogGridProps) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 mb-12">
            {posts.map((post) => (
                <article key={post.id} className="group cursor-pointer">
                    {/* Container image compact */}
                    <div className="grid [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))] gap-2 mb-12">
                        <img
                            src={post.image}
                            alt={post.title}
                            loading="lazy"
                            className="w-[90%] h-full object-cover transition-transform duration-300 group-hover:scale-105 mx-auto"
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
