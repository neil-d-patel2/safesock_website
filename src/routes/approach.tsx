import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";

export const Route = createFileRoute("/approach")({
  component: ApproachPage,
});

const ACCENT = "#1E52F3";

const SANS = "font-['Source_Sans_3']";
const SERIF = "font-['Crimson_Pro']";

/* Prose building blocks */
const P = `${SERIF} text-[1.3rem] leading-[1.55] text-black`;
const SUBTLE = `${SANS} text-[15px] text-neutral-500`;
const LABEL = `${SANS} text-[13px] font-semibold uppercase tracking-[0.14em] text-neutral-500`;

const SECTIONS = [
  { id: "what-we-believe", label: "What We Believe" },
  { id: "what-load-explains", label: "What Load Explains" },
  { id: "how-it-works", label: "How It Works" },
  { id: "traction", label: "Traction" },
  { id: "roadmap", label: "Roadmap" },
  { id: "our-story", label: "Our Story" },
  { id: "get-in-touch", label: "Get in Touch" },
];

const BELIEFS = [
  {
    lead: "Load is the master signal.",
    body: "Every cell in the human musculoskeletal system listens to one input first: the mechanical force passing through it. Bone remodels because of load. Tendon heals because of load. Muscle preserves itself only when load is present. Take it away and the body decompensates within days.",
  },
  {
    lead: "Medicine has been blind to it.",
    body: "A cardiologist has continuous ECG. An endocrinologist has continuous glucose. A neurologist has continuous EEG. The musculoskeletal physician has a six-week follow-up, a verbal recall, and a guess. The most important biological signal in human movement has never had a sensor.",
  },
  {
    lead: "The clinic is the wrong place to measure it.",
    body: "Load matters in the parking lot, the staircase, the kitchen, the gym, the spacecraft, the soldier's sixteenth mile. By the time a patient is in a clinic, the loading event is already in the past, remembered imperfectly, and unactionable.",
  },
  {
    lead: "Wearables haven't solved this.",
    body: "Step counters count steps. Heart rate monitors count beats. Nothing has ever measured the actual force the body experiences, continuously, where it matters. The hardware to do it costs $1,000 per insole, doesn't fit in a cast or a boot, and was built for a gait lab.",
  },
  {
    lead: "We built the missing instrument.",
    body: "SafeSock is the first medical-grade, cast-compatible, reimbursement-ready, continuous load-monitoring platform. We are starting in post-surgical recovery because that is where the clinical urgency, the regulatory pathway, and the reimbursement model converge first. Every other application of load monitoring follows from there.",
  },
];

const EXPLAINS = [
  {
    q: "Why surgical recovery times vary by 4x between identical patients.",
    cause: "Compliance with weight-bearing protocols.",
    today: "unknowable.",
    withLoad: "solved.",
  },
  {
    q: "Why osteoporotic fractures cluster in specific patients.",
    cause: "Cumulative under-loading and balance asymmetry.",
    today: "inferred from DEXA every two years.",
    withLoad: "detected in real time.",
  },
  {
    q: "Why elite athletes re-injure at 30% rates.",
    cause: "Return-to-play decisions made on subjective tolerance.",
    today: "clinical judgment.",
    withLoad: "objective readiness scoring.",
  },
  {
    q: "Why astronauts lose a decade of bone density in a six-month mission.",
    cause: "Inadequate in-flight loading and zero compliance feedback.",
    today: "ARED treadmill with bungees.",
    withLoad: "closed-loop countermeasure.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Slip on SafeSock",
    body: "A thin, sensor-embedded sleeve fits inside any cast, boot, or brace. No adhesives, no wires, no discomfort.",
    tags: ["Walking Boot", "Cast", "Brace"],
  },
  {
    n: "02",
    title: "Continuous data flows",
    body: "Embedded pressure sensors capture real-time load distribution and transmit wirelessly to the patient app and clinician dashboard.",
  },
  {
    n: "03",
    title: "Clinicians see everything",
    body: "Physicians access a live compliance dashboard with trend analytics, alerts, and patient-specific recovery insights.",
  },
];

const WINS = [
  { name: "America 250 Startup Competition", place: "Top 10 Nationally" },
  {
    name: "TCU Values and Ventures Competition",
    place: "Top 10 Internationally",
  },
  { name: "Duquesne National Venture Competition", place: "Top 5 Nationally" },
  { name: "Bangkok Business Challenge", place: "Top 20 Internationally" },
  {
    name: "Stu Clark New Venture Championships",
    place: "Top 15 Internationally",
  },
  { name: "Baylor New Venture Competition", place: "Top 10 Internationally" },
  {
    name: "London Business School HealthTech Challenge",
    place: "Top 15 Semifinalist",
  },
  { name: "Hopkins Hatch: MedTech Challenge", place: "2nd Place Winner" },
];

const GRANTS = [
  {
    name: "Baltimore Innovation Impact Grant",
    status: "Final Round — Awaiting $50,000",
  },
  { name: "O'Shaughnessy Ventures", status: "Funded" },
  { name: "Ignite Grant", status: "Awarded" },
  { name: "NSF Regional I-Corps", status: "In Progress" },
  { name: "Provisional Patent", status: "Filed" },
  { name: "Functional MVP", status: "Built" },
];

const PHASES = [
  {
    year: "2025",
    title: "Validation & Pilot Deployment",
    body: "Clinical validation, IRB approval, first hospital pilot sites live. Building the evidence base for continuous load monitoring in post-surgical recovery.",
  },
  {
    year: "2027",
    title: "Post-Surgical Recovery at Scale",
    body: "Four million annual U.S. cases. Reimbursement live. Nationwide rollout across orthopedic surgery centers. The wedge.",
  },
  {
    year: "2029",
    title: "Osteoporosis & Fall Prevention",
    body: "Longitudinal loading surveillance. 54 million Americans with osteoporosis or low bone mass. Existing RTM and CCM reimbursement extends naturally.",
  },
  {
    year: "2031",
    title: "Athletic Return-to-Play & Military Readiness",
    body: "The same load signal, applied to performance and operational fitness.",
  },
  {
    year: "2033",
    title: "Spaceflight Crew Health",
    body: "Microgravity countermeasures. The most extreme version of the loading problem, validated against the populations where the answers matter most on Earth.",
  },
];

function ApproachPage() {
  /* Scrollspy: track which section is crossing the upper third of the viewport */
  const [activeId, setActiveId] = useState(SECTIONS[0].id);
  const linkRefs = useRef(new Map<string, HTMLAnchorElement>());
  const [marker, setMarker] = useState({ top: 0, height: 0 });

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: "-25% 0px -65% 0px" },
    );
    for (const s of SECTIONS) {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, []);

  /* Slide the rail marker to the active link */
  useLayoutEffect(() => {
    const el = linkRefs.current.get(activeId);
    if (el) setMarker({ top: el.offsetTop, height: el.offsetHeight });
  }, [activeId]);

  return (
    <div className="min-h-screen w-full bg-white">
      {/* Reading progress (CSS scroll-driven) */}
      <span
        aria-hidden
        className="scroll-progress fixed inset-x-0 top-0 z-50 block h-[2px]"
        style={{ backgroundColor: ACCENT }}
      />

      <Navbar />

      <div className="mx-auto grid max-w-[1160px] grid-cols-1 gap-x-14 px-6 pb-24 pt-32 md:pt-36 lg:grid-cols-[170px_minmax(0,1fr)_170px]">
        {/* Contents rail */}
        <aside className="hidden lg:block">
          <nav className="sticky top-32">
            <p className={LABEL}>Contents</p>
            <ul className="relative mt-5 space-y-3 border-l border-neutral-200 pl-4">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    ref={(el) => {
                      if (el) linkRefs.current.set(s.id, el);
                    }}
                    onClick={() => setActiveId(s.id)}
                    className={`${SANS} inline-block text-[15px] transition-all duration-300 hover:translate-x-0.5 ${
                      activeId === s.id
                        ? "font-medium text-black"
                        : "text-neutral-500 hover:text-black"
                    }`}
                  >
                    {s.label}
                  </a>
                </li>
              ))}
              {/* sliding accent marker */}
              <span
                aria-hidden
                className="absolute -left-px block w-[2px] rounded-full transition-all duration-300 ease-out"
                style={{
                  top: marker.top,
                  height: marker.height,
                  backgroundColor: ACCENT,
                  opacity: marker.height ? 1 : 0,
                }}
              />
            </ul>
          </nav>
        </aside>

        {/* Essay */}
        <article className="mx-auto w-full max-w-[42rem] min-w-0">
          <header className="hero-stagger">
            <p className={LABEL} style={{ color: ACCENT }}>
              Our Approach
            </p>
            <h1
              className={`${SANS} mt-4 text-balance text-4xl font-bold leading-[1.15] tracking-tight text-black sm:text-5xl`}
            >
              The first continuous biosignal for mechanical load.
            </h1>

            <p className={`${P} mt-8`}>
              Bone, tendon, muscle, balance, aging, recovery. The body's most
              important inputs all reduce to one signal medicine has never been
              able to measure: how the human body experiences load, in real
              time, in the real world.
            </p>
            <p className={`${P} mt-5`}>
              <strong className="font-semibold">
                SafeSock is building it.
              </strong>{" "}
              Starting with the four million Americans every year who leave an
              operating room and disappear into a recovery black box.
            </p>

            <div className={`${SANS} mt-8 flex flex-wrap items-center gap-6`}>
              <a
                href="#what-we-believe"
                className="group inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-[15px] font-semibold text-white transition hover:opacity-90 active:scale-[0.98]"
                style={{ backgroundColor: ACCENT }}
              >
                Read the thesis
                <span
                  aria-hidden
                  className="transition-transform duration-300 group-hover:translate-y-0.5"
                >
                  ↓
                </span>
              </a>
              <a
                href="#get-in-touch"
                className="link-draw text-[15px] font-semibold text-black"
              >
                Partner with us
              </a>
            </div>

            {/* Figure 1 */}
            <Reveal as="figure" className="mt-14" delay={350}>
              <LoadFlowDiagram />
              <figcaption
                className={`${SANS} mt-4 text-[15px] leading-6 text-neutral-500`}
              >
                <span className="font-semibold" style={{ color: ACCENT }}>
                  Figure 1.
                </span>{" "}
                The continuous load signal. A sensor-embedded sleeve inside any
                cast, boot, or brace captures real-time load distribution and
                streams it to the patient app and a live clinician dashboard —
                closing the recovery loop that ends today at a six-week
                follow-up.
              </figcaption>
            </Reveal>
          </header>

          {/* What We Believe */}
          <Section id="what-we-believe" heading="What We Believe">
            {BELIEFS.map((b, i) => (
              <Reveal key={b.lead} className={i === 0 ? "" : "mt-5"}>
                <p className={P}>
                  <strong className="font-semibold">{b.lead}</strong> {b.body}
                </p>
              </Reveal>
            ))}

            {/* Figure 2 */}
            <Reveal as="figure" className="mt-12">
              <MissingBiosignalDiagram />
              <figcaption
                className={`${SANS} mt-4 text-[15px] leading-6 text-neutral-500`}
              >
                <span className="font-semibold" style={{ color: ACCENT }}>
                  Figure 2.
                </span>{" "}
                The missing biosignal. Cardiology, endocrinology, and neurology
                each gained a continuous monitor decades ago. Musculoskeletal
                medicine — the body's single largest source of disability —
                still runs on a six-week follow-up and a guess. SafeSock is the
                first continuous sensor for mechanical load.
              </figcaption>
            </Reveal>
          </Section>

          {/* What Load Explains */}
          <Section id="what-load-explains" heading="What Load Explains">
            <Reveal>
              <p className={P}>
                <strong className="font-semibold">
                  Load is not one problem.
                </strong>{" "}
                It is the hidden variable behind dozens of clinical questions
                medicine has never been able to answer well.
              </p>
            </Reveal>
            <ul className="mt-8 border-t border-neutral-200">
              {EXPLAINS.map((e, i) => (
                <Reveal
                  as="li"
                  key={e.q}
                  delay={Math.min(i * 70, 280)}
                  className="border-b border-neutral-200 py-6"
                >
                  <p
                    className={`${SERIF} text-[1.2rem] font-semibold leading-snug text-black`}
                  >
                    {e.q}
                  </p>
                  <p className={`${SUBTLE} mt-1.5`}>{e.cause}</p>
                  <p className={`${SANS} mt-3 text-[15px]`}>
                    <span className="text-neutral-500">Today: {e.today}</span>
                    <span className="mx-3 text-neutral-300">/</span>
                    <span className="font-semibold" style={{ color: ACCENT }}>
                      With continuous load: {e.withLoad}
                    </span>
                  </p>
                </Reveal>
              ))}
            </ul>
          </Section>

          {/* How It Works */}
          <Section id="how-it-works" heading="How It Works">
            <Reveal>
              <p className={P}>Three steps from surgery to insight.</p>
            </Reveal>
            <ol className="mt-8 border-t border-neutral-200">
              {STEPS.map((s, i) => (
                <Reveal
                  as="li"
                  key={s.n}
                  delay={Math.min(i * 80, 240)}
                  className="flex gap-6 border-b border-neutral-200 py-8"
                >
                  <span
                    className={`${SANS} pt-1 text-lg font-bold tabular-nums`}
                    style={{ color: ACCENT }}
                  >
                    {s.n}
                  </span>
                  <div className="min-w-0">
                    <h3
                      className={`${SERIF} text-[1.4rem] font-semibold text-black`}
                    >
                      {s.title}
                    </h3>
                    <p
                      className={`${SERIF} mt-2 text-[1.2rem] leading-[1.55] text-black`}
                    >
                      {s.body}
                    </p>
                    {s.tags && (
                      <p className={`${SUBTLE} mt-3`}>{s.tags.join(" · ")}</p>
                    )}
                  </div>
                </Reveal>
              ))}
            </ol>
          </Section>

          {/* Traction */}
          <Section id="traction" heading="Traction">
            <Reveal>
              <p className={P}>
                Current traction and wins. Recognized across top international
                competitions and backed by leading accelerators and grants.
              </p>

              <p className={`${LABEL} mt-10`}>As Seen In</p>
              <p
                className={`${SANS} mt-2 text-2xl font-bold tracking-tight text-black`}
              >
                NBC
              </p>

              <p className={`${LABEL} mt-10`}>Competition Wins</p>
            </Reveal>
            <ul className="mt-4 border-t border-neutral-200">
              {WINS.map((w, i) => (
                <Reveal
                  as="li"
                  key={w.name}
                  delay={Math.min(i * 45, 315)}
                  className="flex items-baseline justify-between gap-6 border-b border-neutral-200 py-3.5"
                >
                  <span className={`${SERIF} text-[1.15rem] text-black`}>
                    {w.name}
                  </span>
                  <span
                    className={`${SANS} shrink-0 text-right text-[14px] font-semibold`}
                    style={{ color: ACCENT }}
                  >
                    {w.place}
                  </span>
                </Reveal>
              ))}
            </ul>

            <Reveal>
              <p className={`${LABEL} mt-10`}>Funding and Grants</p>
            </Reveal>
            <ul className="mt-4 border-t border-neutral-200">
              {GRANTS.map((g, i) => (
                <Reveal
                  as="li"
                  key={g.name}
                  delay={Math.min(i * 45, 315)}
                  className="flex items-baseline justify-between gap-6 border-b border-neutral-200 py-3.5"
                >
                  <span className={`${SERIF} text-[1.15rem] text-black`}>
                    {g.name}
                  </span>
                  <span
                    className={`${SANS} shrink-0 text-right text-[14px] text-neutral-500`}
                  >
                    {g.status}
                  </span>
                </Reveal>
              ))}
            </ul>
          </Section>

          {/* Roadmap */}
          <Section id="roadmap" heading="Roadmap">
            <Reveal>
              <p className={P}>One platform. One signal. Five phases.</p>
            </Reveal>
            <ol className="relative mt-10 border-l border-neutral-200">
              {/* accent line that draws down the timeline with scroll */}
              <span
                aria-hidden
                className="roadmap-draw absolute -left-px top-0 h-full w-[2px]"
                style={{ backgroundColor: ACCENT }}
              />
              {PHASES.map((p, i) => (
                <Reveal
                  as="li"
                  key={p.year}
                  delay={Math.min(i * 70, 280)}
                  className="relative pb-10 pl-8 last:pb-0"
                >
                  <span
                    className="phase-dot absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: ACCENT }}
                  />
                  <p className={LABEL}>
                    Phase {i + 1} · {p.year}
                  </p>
                  <h3
                    className={`${SERIF} mt-2 text-[1.4rem] font-semibold text-black`}
                  >
                    {p.title}
                  </h3>
                  <p
                    className={`${SERIF} mt-1.5 text-[1.2rem] leading-[1.55] text-black`}
                  >
                    {p.body}
                  </p>
                </Reveal>
              ))}
            </ol>
            <Reveal className="mt-10">
              <p className={P}>
                Each phase is one product line on a single platform. The data
                flywheel compounds. The unit economics improve at every stage.
                The science of load is one science.
              </p>
            </Reveal>
          </Section>

          {/* Our Story */}
          <Section id="our-story" heading="Our Story">
            <Reveal>
              <p className={P}>
                <strong className="font-semibold">
                  Built by two students with a dream.
                </strong>{" "}
                SafeSock was born from a simple observation: millions of
                patients leave the operating room and disappear into a recovery
                black box. Raj and Akash Patel, two undergraduate students, set
                out to change that.
              </p>
            </Reveal>
            <Reveal className="mt-5">
              <p className={P}>
                The dream is straightforward: every patient recovering from a
                lower-limb surgery deserves a clinician who can see exactly how
                they are healing, in real time, from anywhere.
              </p>
            </Reveal>
            <Reveal className="mt-5">
              <p className={P}>
                To build it, Raj and Akash brought on Neil Patel as lead
                engineer. Neil's background is in gait labs, including work in
                the Nitesh Thakor Lab developing a gait-cycle model that
                predicts ground reaction forces and moments alongside hip, knee,
                and ankle joint angles. He brought that biomechanics expertise
                directly into SafeSock's sensing and signal pipeline, leading
                development alongside lead hardware engineer Vivaan Gupta to
                bring the team's first working prototype to life.
              </p>
            </Reveal>
            <Reveal className="mt-5">
              <p className={P}>
                From a dorm-room prototype to NSF Regional I-Corps validation
                and a top-10 finish at the Baylor New Venture Competition,
                SafeSock is proving that the best solutions to hard clinical
                problems can come from people who refuse to accept the status
                quo.
              </p>
            </Reveal>
            <div className="mt-10 flex flex-wrap gap-x-16 gap-y-6">
              {[
                { name: "Raj Patel", role: "Co-Founder, CEO" },
                { name: "Akash Patel", role: "Co-Founder, COO" },
                { name: "Neil Patel", role: "Lead Engineer, CTO" },
                { name: "Vivaan Gupta", role: "Lead Hardware Engineer" },
              ].map((f, i) => (
                <Reveal key={f.name} delay={Math.min(i * 70, 280)}>
                  <p
                    className={`${SERIF} text-[1.25rem] font-semibold text-black`}
                  >
                    {f.name}
                  </p>
                  <p className={`${SUBTLE} mt-0.5`}>{f.role}</p>
                </Reveal>
              ))}
            </div>
          </Section>

          {/* Get in Touch */}
          <Section id="get-in-touch" heading="Get in Touch">
            <Reveal>
              <p className={P}>
                <strong className="font-semibold">
                  Ready to transform post-surgical care?
                </strong>{" "}
                We are partnering with health systems, orthopedic groups, and
                investors.
              </p>
            </Reveal>
            <Reveal className="mt-8" delay={120}>
              <form
                className="flex flex-col gap-3 sm:flex-row"
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  type="email"
                  placeholder="your@email.com"
                  className={`${SANS} w-full rounded-md border border-neutral-300 bg-white px-4 py-2.5 text-[15px] text-black outline-none transition-shadow placeholder:text-neutral-400 focus:border-[#1E52F3] focus:ring-[3px] focus:ring-[#1E52F3]/15 sm:max-w-xs`}
                />
                <button
                  type="submit"
                  className={`${SANS} group shrink-0 rounded-md px-5 py-2.5 text-[15px] font-semibold text-white transition hover:opacity-90 active:scale-[0.98]`}
                  style={{ backgroundColor: ACCENT }}
                >
                  Get in touch{" "}
                  <span
                    aria-hidden
                    className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                  >
                    →
                  </span>
                </button>
              </form>
            </Reveal>
          </Section>

          {/* Footer */}
          <footer className="mt-24 border-t border-neutral-200 pt-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <img
                  src={`${import.meta.env.BASE_URL}safesock-logo.png`}
                  alt="SafeSock"
                  className="h-7 w-7 rounded-full object-cover"
                />
                <span
                  className={`${SANS} text-base font-bold tracking-tight text-black`}
                >
                  SafeSock
                </span>
              </div>
              <p className={SUBTLE}>
                © 2026 SafeSock LLC · All rights reserved
              </p>
            </div>
          </footer>
        </article>

        <div className="hidden lg:block" />
      </div>
    </div>
  );
}

function Section({
  id,
  heading,
  children,
}: {
  id: string;
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-20 scroll-mt-28">
      <Reveal>
        <span
          aria-hidden
          className="section-rule block h-[2px] w-7 rounded-full"
          style={{ backgroundColor: ACCENT }}
        />
        <h2
          className={`${SERIF} mb-6 mt-4 text-balance text-[2rem] font-semibold tracking-tight text-black`}
        >
          {heading}
        </h2>
      </Reveal>
      {children}
    </section>
  );
}

/* One-shot scroll reveal: adds .reveal-in the first time the element enters the viewport */
function Reveal({
  as = "div",
  className = "",
  delay = 0,
  children,
}: {
  as?: "div" | "li" | "figure";
  className?: string;
  delay?: number;
  children: React.ReactNode;
}) {
  const Tag = as as React.ElementType;
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal ${shown ? "reveal-in" : ""} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}

/* ---- Figure 1: live load-signal diagram ---- */

const PANEL_LABEL =
  "text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400";

function LoadFlowDiagram() {
  return (
    <div
      className={`${SANS} relative overflow-hidden rounded-2xl border border-neutral-200 bg-white`}
    >
      {/* top accent hairline */}
      <div
        className="h-px w-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)`,
        }}
      />

      {/* header strip */}
      <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3">
        <p className="text-[13px] font-semibold tracking-tight text-black">
          The load signal, end to end
        </p>
        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
          <span
            className="fig1-live inline-block h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: ACCENT }}
          />
          Live
        </span>
      </div>

      <div className="flex flex-col items-stretch gap-2 p-4 sm:p-5 lg:flex-row lg:items-stretch lg:gap-0">
        <CapturePanel />
        <Connector />
        <SignalPanel />
        <Connector />
        <DashboardPanel />
      </div>
    </div>
  );
}

/* Panel 1 — pressure heatmap on the insole */
function CapturePanel() {
  const dots: Array<[number, number]> = [];
  for (let y = 24; y <= 184; y += 20) {
    for (let x = 24; x <= 116; x += 20) dots.push([x, y]);
  }
  return (
    <div className="flex flex-1 flex-col rounded-xl border border-neutral-200 p-4">
      <p className={PANEL_LABEL}>On the Body</p>
      <div className="mt-3 flex flex-1 items-center justify-center">
        <svg
          viewBox="0 0 140 200"
          className="h-[168px] w-auto"
          role="img"
          aria-label="Live pressure heatmap on a sensor-embedded insole"
        >
          <defs>
            <radialGradient id="fig1-heat">
              <stop offset="0%" stopColor={ACCENT} stopOpacity="0.7" />
              <stop offset="55%" stopColor={ACCENT} stopOpacity="0.3" />
              <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
            </radialGradient>
            <clipPath id="fig1-insole">
              <path d="M70 8 C100 8 121 34 121 78 C121 112 110 132 104 156 C99 178 92 193 70 193 C48 193 41 178 36 156 C30 132 19 112 19 78 C19 34 40 8 70 8 Z" />
            </clipPath>
          </defs>

          {/* insole body */}
          <path
            d="M70 8 C100 8 121 34 121 78 C121 112 110 132 104 156 C99 178 92 193 70 193 C48 193 41 178 36 156 C30 132 19 112 19 78 C19 34 40 8 70 8 Z"
            fill="#fafafa"
            stroke="#e5e5e5"
            strokeWidth="1.5"
          />

          {/* sensor dot grid */}
          <g clipPath="url(#fig1-insole)">
            {dots.map(([x, y]) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r="1.4" fill="#d4d4d4" />
            ))}

            {/* breathing pressure zones */}
            <ellipse
              className="fig1-blob"
              cx="70"
              cy="168"
              rx="34"
              ry="30"
              fill="url(#fig1-heat)"
            />
            <ellipse
              className="fig1-blob"
              cx="72"
              cy="66"
              rx="32"
              ry="26"
              fill="url(#fig1-heat)"
              style={{ animationDelay: "-1.1s" }}
            />
            <ellipse
              className="fig1-blob"
              cx="54"
              cy="42"
              rx="16"
              ry="14"
              fill="url(#fig1-heat)"
              style={{ animationDelay: "-2.2s" }}
            />
          </g>
        </svg>
      </div>
      <p className="mt-2 text-center text-[12px] text-neutral-500">
        Sensor-embedded sleeve · boot, cast, or brace
      </p>
    </div>
  );
}

/* Panel 2 — the continuous ground-reaction-force signal (hero) */
function SignalPanel() {
  return (
    <div className="flex flex-[1.35] flex-col rounded-xl border border-neutral-200 p-4">
      <div className="flex items-center justify-between">
        <p className={PANEL_LABEL}>The Continuous Signal</p>
        <p className="text-[11px] font-medium text-neutral-400">
          Vertical Load
        </p>
      </div>
      <div className="relative mt-3 flex-1">
        <svg
          viewBox="0 0 560 180"
          className="h-full w-full"
          preserveAspectRatio="none"
          role="img"
          aria-label="A live, repeating ground-reaction-force waveform"
        >
          <defs>
            <linearGradient id="fig1-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={ACCENT} stopOpacity="0.16" />
              <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* grid */}
          <g stroke="#f0f0f0" strokeWidth="1">
            <line x1="10" y1="46" x2="550" y2="46" />
            <line x1="10" y1="93" x2="550" y2="93" />
            <line x1="10" y1="140" x2="550" y2="140" />
          </g>

          {/* area under the curve */}
          <path d={`${GRF} L 550 140 L 10 140 Z`} fill="url(#fig1-area)" />

          {/* base trace */}
          <path
            d={GRF}
            fill="none"
            stroke={ACCENT}
            strokeWidth="2.5"
            strokeOpacity="0.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* data packets flowing along the trace */}
          <path
            className="fig1-glint"
            d={GRF}
            fill="none"
            stroke={ACCENT}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="0.1 50"
            style={{ filter: `drop-shadow(0 0 3px ${ACCENT})` }}
          />

          {/* sweeping scan line */}
          <line
            className="fig1-sweep"
            x1="10"
            y1="8"
            x2="10"
            y2="140"
            stroke={ACCENT}
            strokeWidth="1.5"
            strokeOpacity="0.35"
          />
        </svg>
      </div>
      <div className="mt-2 flex items-center justify-between text-[12px] text-neutral-500">
        <span>Continuous · wireless · real time</span>
        <span className="tabular-nums text-neutral-400">200 Hz</span>
      </div>
    </div>
  );
}

/* Panel 3 — the live clinician dashboard */
function DashboardPanel() {
  return (
    <div className="flex flex-1 flex-col rounded-xl border border-neutral-200 p-4">
      <p className={PANEL_LABEL}>Live Clinician Dashboard</p>

      <Reveal className="mt-3 flex items-center gap-4">
        {/* compliance ring */}
        <svg viewBox="0 0 80 80" className="h-[72px] w-[72px] shrink-0">
          <circle
            cx="40"
            cy="40"
            r="34"
            fill="none"
            stroke="#eee"
            strokeWidth="7"
          />
          <circle
            className="fig1-ring-anim"
            cx="40"
            cy="40"
            r="34"
            fill="none"
            stroke={ACCENT}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray="213.6"
            strokeDashoffset="17.1"
            transform="rotate(-90 40 40)"
          />
          <text
            x="40"
            y="44"
            textAnchor="middle"
            className={SANS}
            fontSize="19"
            fontWeight="700"
            fill="#000"
          >
            92%
          </text>
        </svg>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold leading-tight text-black">
            Weight-bearing compliance
          </p>
          {/* sparkline */}
          <svg viewBox="0 0 120 34" className="mt-2 h-[30px] w-full">
            <polyline
              className="fig1-spark-anim"
              points="2,28 20,24 38,26 56,16 74,18 92,9 118,4"
              fill="none"
              stroke={ACCENT}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="260"
              strokeDashoffset="0"
            />
            <circle cx="118" cy="4" r="2.6" fill={ACCENT} />
          </svg>
        </div>
      </Reveal>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {["Trends", "Alerts", "EHR"].map((r) => (
          <div
            key={r}
            className="rounded-md border border-neutral-200 py-2 text-center text-[12px] font-medium text-neutral-600"
          >
            {r}
          </div>
        ))}
      </div>

      <div
        className="mt-3 flex-1 rounded-lg px-3 py-2.5"
        style={{ backgroundColor: `${ACCENT}0d` }}
      >
        <p className="text-[12.5px] font-semibold text-black">
          Recovery loop closed
        </p>
        <p className="mt-0.5 text-[11.5px] leading-snug text-neutral-500">
          No six-week black box — healing is visible from anywhere.
        </p>
      </div>
    </div>
  );
}

/* Flowing connector between panels — horizontal on desktop, vertical on mobile */
function Connector() {
  return (
    <>
      <div className="hidden shrink-0 items-center px-1 lg:flex">
        <svg viewBox="0 0 40 24" className="h-6 w-10">
          <line
            x1="2"
            y1="12"
            x2="34"
            y2="12"
            stroke="#e5e5e5"
            strokeWidth="1.5"
          />
          <line
            className="fig1-conn"
            x1="2"
            y1="12"
            x2="34"
            y2="12"
            stroke={ACCENT}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="0.1 25"
          />
          <path
            d="M31 8 L37 12 L31 16"
            fill="none"
            stroke={ACCENT}
            strokeWidth="1.5"
          />
        </svg>
      </div>
      <div className="flex justify-center py-0.5 lg:hidden">
        <svg viewBox="0 0 24 28" className="h-6 w-6">
          <line
            x1="12"
            y1="2"
            x2="12"
            y2="22"
            stroke="#e5e5e5"
            strokeWidth="1.5"
          />
          <line
            className="fig1-conn"
            x1="12"
            y1="2"
            x2="12"
            y2="22"
            stroke={ACCENT}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="0.1 18"
          />
          <path
            d="M8 19 L12 25 L16 19"
            fill="none"
            stroke={ACCENT}
            strokeWidth="1.5"
          />
        </svg>
      </div>
    </>
  );
}

/* Repeating ground-reaction-force curve: two peaks (heel strike + push-off) per gait cycle */
const GRF = (() => {
  const cycleW = 180;
  const base = 140;
  const x0 = 10;
  let d = `M ${x0} ${base}`;
  for (let i = 0; i < 3; i++) {
    const x = x0 + i * cycleW;
    d +=
      ` C ${x + 8} ${base} ${x + 16} 46 ${x + 34} 46` +
      ` C ${x + 52} 46 ${x + 60} 96 ${x + 78} 94` +
      ` C ${x + 98} 92 ${x + 104} 50 ${x + 120} 52` +
      ` C ${x + 140} 54 ${x + 150} ${base} ${x + 164} ${base}` +
      ` L ${x + 180} ${base}`;
  }
  return d;
})();

/* ---- Figure 2: the missing biosignal ---- */

const F2_W = 360;

/* Sample a function into an SVG path across the lane width */
function samplePath(fn: (x: number) => number, step = 3) {
  let d = "";
  for (let x = 0; x <= F2_W; x += step) {
    d += `${x === 0 ? "M " : "L "}${x} ${fn(x).toFixed(1)} `;
  }
  return d.trim();
}

/* ECG — flat baseline with a periodic PQRST complex */
const ECG = (() => {
  const beat = 90;
  const m = 24;
  let d = `M 0 ${m}`;
  for (let x = 0; x < F2_W; x += beat) {
    d +=
      ` L ${x + 38} ${m} L ${x + 42} ${m - 3} L ${x + 46} ${m + 4} L ${x + 49} ${m}` +
      ` L ${x + 53} ${m - 18} L ${x + 56} ${m + 12} L ${x + 59} ${m}` +
      ` L ${x + 68} ${m} Q ${x + 78} ${m - 6} ${x + 88} ${m} L ${x + 90} ${m}`;
  }
  return d;
})();

/* Continuous glucose — a slow, smooth drift */
const CGM = samplePath((x) => 24 + 9 * Math.sin(x / 23) + 3 * Math.sin(x / 7));

/* EEG — dense, layered oscillation */
const EEG = samplePath(
  (x) =>
    24 + 6 * Math.sin(x / 3.2) + 3 * Math.sin(x / 1.7) + 2 * Math.sin(x / 8),
  2,
);

/* Load — the double-hump ground-reaction-force signal, two gait cycles */
const LOAD = samplePath((x) => {
  const P = 150;
  const t = x % P;
  const hump = (c: number, w: number, h: number) =>
    h * Math.exp(-((t - c) ** 2) / (2 * w * w));
  return 38 - hump(40, 15, 20) - hump(96, 17, 17);
});

const SIGNALS = [
  { field: "Cardiology", instrument: "continuous ECG", d: ECG, dur: "3.4s" },
  {
    field: "Endocrinology",
    instrument: "continuous glucose",
    d: CGM,
    dur: "4.2s",
  },
  { field: "Neurology", instrument: "continuous EEG", d: EEG, dur: "2.6s" },
];

function MissingBiosignalDiagram() {
  return (
    <div
      className={`${SANS} overflow-hidden rounded-2xl border border-neutral-200 bg-white`}
    >
      <div
        className="h-px w-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)`,
        }}
      />

      <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3">
        <p className="text-[13px] font-semibold tracking-tight text-black">
          Continuous monitoring, by specialty
        </p>
        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
          <span
            className="fig1-live inline-block h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: ACCENT }}
          />
        </span>
      </div>

      <div className="px-4 pt-1 sm:px-5">
        {SIGNALS.map((s) => (
          <SignalLane key={s.field} {...s} />
        ))}
        <LoadLane />
      </div>

      <div className="border-t border-neutral-100 px-5 py-3">
        <p className="text-[12.5px] text-neutral-500">
          Three specialties gained a continuous sensor decades ago.{" "}
          <span className="font-semibold" style={{ color: ACCENT }}>
            Load is the fourth.
          </span>
        </p>
      </div>
    </div>
  );
}

/* An established biosignal — neutral, quietly streaming */
function SignalLane({
  field,
  instrument,
  d,
  dur,
}: {
  field: string;
  instrument: string;
  d: string;
  dur: string;
}) {
  return (
    <div className="grid grid-cols-[104px_minmax(0,1fr)] items-center gap-3 border-b border-neutral-100 py-2.5 sm:grid-cols-[168px_minmax(0,1fr)] sm:gap-5">
      <div>
        <p className="text-[13px] font-semibold leading-tight text-black">
          {field}
        </p>
        <p className="text-[11.5px] text-neutral-400">{instrument}</p>
      </div>
      <svg
        viewBox="0 0 360 48"
        preserveAspectRatio="none"
        className="h-9 w-full sm:h-10"
        aria-hidden="true"
      >
        <path
          d={d}
          fill="none"
          stroke="#d4d4d4"
          strokeWidth="1.5"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        <path
          className="fig1-glint"
          d={d}
          fill="none"
          stroke="#9ca3af"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="0.1 42"
          vectorEffect="non-scaling-stroke"
          style={{ animationDuration: dur }}
        />
      </svg>
    </div>
  );
}

/* The load lane — the missing signal, drawing itself in */
function LoadLane() {
  return (
    <div
      className="mt-1 grid grid-cols-[104px_minmax(0,1fr)] items-center gap-3 rounded-lg border-l-2 py-3 pl-3 sm:grid-cols-[168px_minmax(0,1fr)] sm:gap-5"
      style={{ borderColor: ACCENT, backgroundColor: `${ACCENT}0a` }}
    >
      <div>
        <p className="text-[13px] font-semibold leading-tight text-black">
          Musculoskeletal
        </p>
        <p className="text-[11.5px] font-semibold" style={{ color: ACCENT }}>
          SafeSock · continuous load
        </p>
      </div>
      <svg
        viewBox="0 0 360 48"
        preserveAspectRatio="none"
        className="h-11 w-full sm:h-12"
        aria-label="The load signal drawing in to fill the gap left by a six-week follow-up"
      >
        {/* the "before" state — a flat, dashed guess */}
        <line
          x1="0"
          y1="38"
          x2="360"
          y2="38"
          stroke="#d4d4d4"
          strokeWidth="1.5"
          strokeDasharray="2 9"
          vectorEffect="non-scaling-stroke"
        />
        {/* SafeSock fills it in */}
        <path
          className="fig2-fill"
          d={LOAD}
          fill="none"
          stroke={ACCENT}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={100}
          strokeDasharray="100"
          strokeDashoffset="0"
          vectorEffect="non-scaling-stroke"
          style={{ filter: `drop-shadow(0 0 3px ${ACCENT}66)` }}
        />
      </svg>
    </div>
  );
}
