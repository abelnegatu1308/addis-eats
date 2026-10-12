"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function HomeHero() {
  const sectionRef = useRef(null);
  const [heroImageFailed, setHeroImageFailed] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Enable the subtle pointer parallax only on precise-pointer, larger screens
    // when the visitor has not requested reduced motion. Touch and mobile stay
    // completely still, and the effect is skipped entirely when unsupported.
    const canParallax =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      window.matchMedia("(min-width: 1000px)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!canParallax) return;

    let frame = 0;
    const applyParallax = (clientX, clientY) => {
      const rect = section.getBoundingClientRect();
      const nx = (clientX - rect.left) / rect.width - 0.5;
      const ny = (clientY - rect.top) / rect.height - 0.5;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        section.style.setProperty("--mx", `${(nx * 18).toFixed(1)}px`);
        section.style.setProperty("--my", `${(ny * 14).toFixed(1)}px`);
      });
    };

    const onMove = (event) => applyParallax(event.clientX, event.clientY);
    const onLeave = () => {
      cancelAnimationFrame(frame);
      section.style.setProperty("--mx", "0px");
      section.style.setProperty("--my", "0px");
    };

    section.addEventListener("pointermove", onMove);
    section.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <section className="hero" ref={sectionRef} aria-labelledby="hero-heading">
      <div className="hero-art" aria-hidden="true">
        <span className="hero-aurora hero-aurora-amber" />
        <span className="hero-aurora hero-aurora-red" />
        <span className="hero-particle hero-particle-1" />
        <span className="hero-particle hero-particle-2" />
        <span className="hero-particle hero-particle-3" />
        <span className="hero-particle hero-particle-4" />
        <span className="hero-vignette" />
      </div>

      <div className="hero-inner">
        <div className="hero-content">
          <p className="hero-eyebrow">
            <span className="hero-eyebrow-dot" aria-hidden="true" />
            Authentic Ethiopian Flavors
          </p>
          <h1 className="hero-title" id="hero-heading">
            A Taste of Ethiopia, <em>Delivered.</em>
          </h1>
          <p className="hero-sub">
            Discover your favorite Ethiopian dishes, freshly prepared and
            delivered straight to your door.
          </p>
          <div className="hero-cta-row">
            <Link href="/menu" className="hero-btn hero-btn-primary">
              Explore Our Menu
              <span aria-hidden="true">→</span>
            </Link>
            <Link href="/favorites" className="hero-btn hero-btn-secondary">
              Order Your Favorites
            </Link>
          </div>
          <ul className="hero-trust">
            <li>Authentic flavors</li>
            <li>Freshly prepared</li>
            <li>Easy ordering</li>
          </ul>
        </div>
      </div>

      <div className="hero-image-frame">
        <Image
          src={heroImageFailed ? "/images/hero.jpg" : "/images/addis-eats-hero.png"}
          alt="A cinematic spread of authentic Ethiopian dishes including Doro Wat, injera, Shiro and Tibs on a dark table"
          fill
          preload
          sizes="(max-width: 1000px) 100vw, 56vw"
          className="hero-image"
          onError={() => setHeroImageFailed(true)}
        />
      </div>
    </section>
  );
}

