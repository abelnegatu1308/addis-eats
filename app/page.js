import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: { absolute: "Addis Eats | A table worth gathering around" },
  description:
    "Discover Ethiopian comfort food made with patience, bright spices, and the generous spirit of an Addis Ababa table.",
};

export default function HomePage() {
  return (
    <main>
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">A TASTE OF HOME · ADDIS ABABA</p>
          <h1>Gather around<br /><em>something</em> beautiful.</h1>
          <p className="hero-lede">Slow-cooked wot, bright spices, and the generous spirit of an Ethiopian table. Delivered warm to your door.</p>
          <Link href="/menu" className="button button-primary">Explore the menu <span>↗</span></Link>
        </div>
        <div className="hero-art">
          <Image
            src="/images/hero.jpg"
            alt="An Addis Eats table with Ethiopian stews, injera and shared dishes"
            width={1202}
            height={880}
            priority
            fetchPriority="high"
            sizes="(max-width: 700px) calc(100vw - 36px), (max-width: 1280px) calc(47.5vw - 64px), 557px"
            className="hero-image"
          />
          <span className="hero-note note-top">A TABLE WORTH GATHERING AROUND</span>
          <span className="hero-note note-bottom">INJERA · SPICE · STORY</span>
        </div>
      </section>
      <section className="story-strip">
        <span className="story-number">01</span>
        <h2>Made with patience.<br /><em>Shared with joy.</em></h2>
        <p>Every dish begins with the same belief: food tastes better when there is a story behind it.</p>
      </section>
    </main>
  );
}