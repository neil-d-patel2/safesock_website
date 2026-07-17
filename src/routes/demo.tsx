import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";

export const Route = createFileRoute("/demo")({
  component: DemoPage,
});

const DEMO_VIDEO_URL = `${import.meta.env.BASE_URL}demo.mp4`;

function DemoPage() {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-[#fafaf8]">
      {/* Background video */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        src={DEMO_VIDEO_URL}
      />

      <Navbar />

      {/* Bottom gradient overlay */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-b from-transparent to-black" />
    </section>
  );
}
