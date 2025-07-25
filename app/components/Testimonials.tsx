import { useState } from "react";

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const testimonials = [
    {
      text: "Donec facilisis quam ut purus rutrum lobortis. Donec vitae odio quis nisl dapibus malesuada.",
      author: "Mic Flammez",
    },
    {
      text: "Service exceptionnel et produits de qualité. Je recommande vivement cette boutique.",
      author: "Marie Dubois",
    },
    {
      text: "Des vêtements élégants et durables. L'équipe est très à l'écoute.",
      author: "Jean Martin",
    },
  ];

  const changeIndex = (offset: number) => {
    const newIndex = (index + offset + testimonials.length) % testimonials.length;
    setIndex(newIndex);
  };

  return (
    <section className="bg-gray-100 px-4 py-8 text-center text-black text-sm">
      <h2 className="text-xl font-bold mb-4">Avis Client</h2>

      <div className="max-w-2xl mx-auto">
        <div className="text-3xl mb-2 leading-none">“</div>

        <p className="mb-2">{testimonials[index].text}</p>
        <p className="font-medium mb-3">{testimonials[index].author}</p>

        <div className="text-3xl mb-3 leading-none">”</div>

        <div className="flex justify-center items-center gap-3">
          <button onClick={() => changeIndex(-1)} className="hover:opacity-70">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex gap-1">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`w-2 h-2 rounded-full ${
                  i === index ? "bg-black" : "bg-black/30"
                }`}
              />
            ))}
          </div>

          <button onClick={() => changeIndex(1)} className="hover:opacity-70">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
