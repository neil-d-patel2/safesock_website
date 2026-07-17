import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";

export const Route = createFileRoute("/")({
  component: HeroPage,
});

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_063509_7d167302-4fd4-480b-8260-18ab572333d4.mp4";

function HeroPage() {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-[#fafaf8]">
      {/* Background video */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        src={VIDEO_URL}
      />

      <Navbar />

      {/* Foreground content */}
      <div className="relative h-full w-full">
        {/* Staggered headline */}
        <h1 className="hero-title absolute left-4 top-[18%] text-[14vw] font-medium text-white md:left-10 md:text-[13vw]">
          track
        </h1>
        <h1 className="hero-title absolute right-4 top-[32%] text-[14vw] font-medium text-white md:right-10 md:text-[13vw]">
          manage
        </h1>
        <h1 className="hero-title absolute left-[18%] top-[66%] text-[14vw] font-medium text-white md:left-[28%] md:text-[13vw]">
          recover
        </h1>

        {/* Description */}
        <p className="absolute left-6 top-[46%] max-w-[240px] font-['Source_Serif_4'] text-[15px] leading-snug text-white/90 md:left-10">
          A new modality that continuously measures how the body bears weight, giving clinicians
          real time recovery insight everywhere
        </p>

        {/* Stat — top right */}
        <div className="absolute right-6 top-[14%] md:right-24">
          <div className="flex items-center justify-end gap-3">
            <div className="hidden h-px w-24 rotate-[20deg] bg-white/40 md:block" />
            <span className="text-4xl font-medium tracking-tight md:text-5xl">
              +4m
            </span>
          </div>
          <p className="mt-1 text-right text-xs text-white/70 md:text-sm">
            surgeries a year
          </p>
        </div>

        {/* Stat — bottom left */}
        <div className="absolute bottom-20 left-6 md:bottom-24 md:left-20">
          <div className="flex items-center gap-3">
            <span className="text-4xl font-medium tracking-tight md:text-5xl">
              +54m
            </span>
            <div className="hidden h-px w-24 rotate-[-20deg] bg-white/40 md:block" />
          </div>
          <p className="mt-1 text-xs text-white/70 md:text-sm">
            with low bone mass
          </p>
        </div>

        {/* Stat — bottom right */}
        <div className="absolute bottom-16 right-6 md:bottom-20 md:right-20">
          <div className="flex items-center justify-end gap-3">
            <div className="hidden h-px w-24 rotate-[-20deg] bg-white/40 md:block" />
            <span className="text-4xl font-medium tracking-tight md:text-5xl">
              +10
            </span>
          </div>
          <p className="mt-1 text-right text-xs text-white/70 md:text-sm">
            competition wins
          </p>
        </div>
      </div>

      {/* Bottom gradient overlay */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-b from-transparent to-black" />
    </section>
  );
}
