import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
}

export function SEOHead({ title, description }: SEOHeadProps) {
  useEffect(() => {
    const baseTitle = 'Radjanio Silva Souza';
    document.title = title ? `${title} — ${baseTitle}` : `${baseTitle} — Autor & Escritor`;

    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', description);
      }
    }
  }, [title, description]);

  return null;
}
