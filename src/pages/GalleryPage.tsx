import React, { useState, useMemo } from 'react';
import { GalleryItem, GalleryCategory } from '../types';
import { SEOHead } from '../components/SEOHead';
import { EmptyState } from '../components/EmptyState';
import { X, ZoomIn, Image as ImageIcon } from 'lucide-react';

interface GalleryPageProps {
  items: GalleryItem[];
  navigate: (path: string) => void;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({ items, navigate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);

  const categories = ['Todas', 'Capas', 'Conceitos', 'Ilustrações', 'Fotografias', 'Outros'];

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'Todas') return items;
    return items.filter((i) => i.category === selectedCategory);
  }, [items, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-12">
      <SEOHead
        title="Galeria Visual"
        description="Capas, ilustrações, fotografias de bastidores e conceitos visuais do autor Radjanio Silva Souza."
      />

      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <span className="text-[11px] uppercase tracking-[0.25em] text-amber-800 dark:text-amber-400 font-semibold block">
          Artes &amp; Conceitos Visuais
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
          Galeria
        </h1>
        <p className="font-editorial text-base sm:text-lg text-stone-600 dark:text-stone-300">
          Estudos visuais, capas oficiais, manuscritos fotográficos e referências estéticas dos projetos literários.
        </p>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-200/50 dark:bg-stone-900/60 rounded-md max-w-fit border border-stone-200 dark:border-stone-800">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-all cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-50 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveItem(item)}
              className="group cursor-pointer bg-white dark:bg-stone-900/40 border border-stone-200/80 dark:border-stone-800 rounded-sm overflow-hidden hover:border-stone-400 dark:hover:border-stone-700 transition-all shadow-xs"
            >
              <div className="relative aspect-square overflow-hidden bg-stone-100 dark:bg-stone-950">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <ZoomIn className="w-6 h-6 stroke-[1.5]" />
                </div>
                {item.is_demo && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 text-[9px] uppercase tracking-wider bg-stone-900/80 text-stone-200 backdrop-blur-xs rounded-xs">
                    Exemplo
                  </span>
                )}
              </div>

              <div className="p-4 space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-amber-800 dark:text-amber-400 font-semibold block">
                  {item.category}
                </span>
                <h3 className="font-serif text-base font-semibold text-stone-900 dark:text-stone-100 truncate">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-1 font-editorial">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Nenhuma imagem cadastrada na galeria"
          description={
            selectedCategory === 'Todas'
              ? 'Ainda não há registros visuais disponíveis no acervo fotográfico e conceitual.'
              : `Não há itens sob a categoria "${selectedCategory}".`
          }
          icon="image"
        />
      )}

      {/* Lightbox Modal */}
      {activeItem && (
        <div
          className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setActiveItem(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-stone-900 text-stone-100 rounded-sm overflow-hidden border border-stone-800 p-2 sm:p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveItem(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-stone-950/80 text-stone-300 hover:text-white rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="max-h-[70vh] flex items-center justify-center overflow-hidden rounded-sm bg-black">
              <img
                src={activeItem.image_url}
                alt={activeItem.title}
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>

            <div className="p-4 space-y-1">
              <div className="flex items-center gap-2 text-xs text-amber-400">
                <span>{activeItem.category}</span>
                {activeItem.is_demo && <span>· [Exemplo]</span>}
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-semibold text-white">
                {activeItem.title}
              </h2>
              {activeItem.description && (
                <p className="font-editorial text-sm text-stone-300 leading-relaxed">
                  {activeItem.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
