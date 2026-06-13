"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function CarouselBackground({ mediaUrls }: { mediaUrls: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (mediaUrls.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % mediaUrls.length);
    }, 4000); // Cambia cada 4 segundos

    return () => clearInterval(interval);
  }, [mediaUrls]);

  if (mediaUrls.length === 0) return null;

  return (
    <>
      {mediaUrls.map((url, index) => {
        const isVideo = url.endsWith('.mp4') || url.endsWith('.webm') || url.startsWith('data:video/');
        const isActive = index === currentIndex;
        const isEven = index % 2 === 0;

        return (
          <div 
            key={index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: isActive ? 1 : 0,
              transition: 'opacity 1s ease-in-out',
              animation: isEven ? 'panLeft 15s alternate infinite linear' : 'panRight 15s alternate infinite linear',
              zIndex: 0
            }}
          >
            {isVideo ? (
              <video 
                src={url} 
                autoPlay 
                muted 
                loop 
                playsInline 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            ) : (
              <img 
                src={url} 
                alt={`Fondo ${index}`} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            )}
          </div>
        );
      })}
      
      {/* Overlay oscuro para legibilidad del texto */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.85))',
        zIndex: 1
      }} />
    </>
  );
}
