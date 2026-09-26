import { BookOpen, Feather, Sparkles, FolderArchive, Image as ImageIcon, Calendar } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: 'book' | 'feather' | 'sparkle' | 'folder' | 'image' | 'calendar';
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, icon = 'feather', actionText, onAction }: EmptyStateProps) {
  const IconComp = {
    book: BookOpen,
    feather: Feather,
    sparkle: Sparkles,
    folder: FolderArchive,
    image: ImageIcon,
    calendar: Calendar,
  }[icon];

  return (
    <div className="py-20 px-6 text-center max-w-lg mx-auto flex flex-col items-center justify-center">
      <div className="w-14 h-14 rounded-full bg-stone-100 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 flex items-center justify-center text-amber-800/80 dark:text-amber-500/80 mb-5 shadow-xs">
        <IconComp className="w-6 h-6 stroke-[1.5]" />
      </div>
      <h3 className="font-serif text-2xl text-stone-900 dark:text-stone-100 mb-2 font-medium">
        {title}
      </h3>
      <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed max-w-md mb-6">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 text-xs uppercase tracking-widest font-medium hover:bg-stone-800 dark:hover:bg-white transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
