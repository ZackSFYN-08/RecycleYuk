"use client";

export default function Home() {
  // Langsung redirect saat render
  if (typeof window !== 'undefined') {
    window.location.replace('/login');
  }

  return null;
}