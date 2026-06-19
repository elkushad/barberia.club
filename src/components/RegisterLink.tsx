"use client";

import Link from "next/link";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

interface Props {
  href?: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export default function RegisterLink({ href = "/register", className, style, children }: Props) {
  function handleClick() {
    window.fbq?.("track", "Lead");
  }
  return (
    <Link href={href} className={className} style={style} onClick={handleClick}>
      {children}
    </Link>
  );
}
