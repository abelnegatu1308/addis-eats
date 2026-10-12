import HomeHero from "./components/HomeHero";

export const metadata = {
  title: { absolute: "Addis Eats | A table worth gathering around" },
  description:
    "Discover Ethiopian comfort food made with patience, bright spices, and the generous spirit of an Addis Ababa table.",
};

export default function HomePage() {
  return (
    <main>
      <HomeHero />
      <section className="story-strip" id="how-it-works">
        <span className="story-number">01</span>
        <h2>Made with patience.<br /><em>Shared with joy.</em></h2>
        <p>Every dish begins with the same belief: food tastes better when there is a story behind it.</p>
      </section>
    </main>
  );
}