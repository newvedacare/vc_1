"use client";

import Image from "next/image";
import { useInView } from "react-intersection-observer";

interface KeyBenefit {
  text: string;
}

interface Product {
  title: string;
  description: string;
  benefits: KeyBenefit[];
  image: string;
}

export function FeaturedProducts() {
  const products: Product[] = [
    {
      title: "Premium Hair Oil",
      description: "Clinically proven to stop hair fall in 4 weeks and promote new hair growth. Perfect for post-pregnancy hair care.",
      benefits: [
        { text: "Stops hair fall in 4 weeks" },
        { text: "Promotes new hair growth" },
        { text: "Post-pregnancy hair care" },
        { text: "100% natural ingredients" }
      ],
      image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15"
    },
    {
      title: "Pain Relief Oil",
      description: "Advanced Ayurvedic formula for arthritis, joint pain, knee pain, neck pain, and nerve pain relief.",
      benefits: [
        { text: "Relieves chronic pain" },
        { text: "Reduces inflammation" },
        { text: "Improves mobility" },
        { text: "Fast-acting formula" }
      ],
      image: "https://images.unsplash.com/photo-1519824145371-296894a0daa9"
    },
    {
      title: "Memory Booster Oil",
      description: "Natural support for enhanced concentration in children and long-term brain health for adults.",
      benefits: [
        { text: "Improves focus" },
        { text: "Enhances memory" },
        { text: "Supports brain function" },
        { text: "Safe for children" }
      ],
      image: "https://images.unsplash.com/photo-1532187643603-ba119ca4109e"
    },
    {
      title: "VedaHairCare Ayurvedic Hair Oil",
      description: "Traditional Ayurvedic hair oil blend for nourishment, growth, and scalp health. Made with premium herbs and oils.",
      benefits: [
        { text: "Deep nourishment" },
        { text: "Promotes hair growth" },
        { text: "Improves scalp health" },
        { text: "Premium herbal blend" }
      ],
      image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-16">Featured Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {products.map((product, index) => (
            <div 
              key={index} 
              className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 items-start`}
            >
              <div className="w-full md:w-1/2">
                <div className="aspect-[4/3] relative overflow-hidden rounded-lg">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    loading="lazy"
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="w-full md:w-1/2">
                <h3 className="text-2xl font-semibold mb-4">{product.title}</h3>
                <p className="text-gray-600 mb-6">{product.description}</p>
                <h4 className="text-sm font-medium text-gray-900 mb-4">Key Benefits:</h4>
                <ul className="space-y-3">
                  {product.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-blue-600" />
                      </div>
                      <span className="text-gray-600 text-sm">{benefit.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
