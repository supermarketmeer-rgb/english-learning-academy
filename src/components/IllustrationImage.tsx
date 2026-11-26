import { BookOpen } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { resolveEducationalImage } from '../utils/assetLoader';

interface IllustrationImageProps {
  src?: string;
  alt: string;
  className?: string;
}

export function resolveAssetUrl(path: string): string {
  return resolveEducationalImage(path);
}

export const IllustrationImage: React.FC<IllustrationImageProps> = ({
  src,
  alt,
  className = '',
}) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-teal-50 via-slate-50 to-amber-50 p-6 text-teal-800 dark:from-slate-800 dark:via-slate-900 dark:to-teal-950 dark:text-teal-300 ${className}`}
        role="img"
        aria-label={alt}
      >
        <BookOpen className="h-8 w-8 opacity-75" />
        <span className="text-center text-xs font-medium opacity-80">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={resolveAssetUrl(src)}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};
