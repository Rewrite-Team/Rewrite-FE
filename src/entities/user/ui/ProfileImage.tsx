'use client';

import { useState } from 'react';

import Image from 'next/image';
import type { ImageProps } from 'next/image';

interface ProfileImageProps {
  alt: string;
  fallbackSrc: ImageProps['src'];
  src: string;
}

export function ProfileImage({ alt, fallbackSrc, src }: ProfileImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const imageSrc = failedSrc === src ? fallbackSrc : src;

  const handleError = () => {
    if (imageSrc === fallbackSrc) {
      return;
    }

    setFailedSrc(src);
  };

  return (
    <Image
      alt={alt}
      className="size-8 shrink-0 rounded-full border border-white object-cover"
      fetchPriority="high"
      height={32}
      loading="eager"
      onError={handleError}
      src={imageSrc}
      width={32}
    />
  );
}
