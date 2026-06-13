'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ScrollAnimationProps {
  children: React.ReactNode;
  className?: string;
  delay?: string;
  style?: React.CSSProperties;
}

export default function ScrollAnimation({ children, className = '', delay = '', style }: ScrollAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -100px 0px' }
    );

    const currentRef = domRef.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  return (
    <div
      ref={domRef}
      className={`animate-on-scroll ${isVisible ? 'visible' : ''} ${delay} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
