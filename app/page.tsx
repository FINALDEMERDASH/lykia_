"use client";

import { ImageSequenceCanvas } from "@/components/ImageSequenceCanvas";
import {
  MotionValue,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "framer-motion";
import { KeyboardEvent, TouchEvent, WheelEvent, useRef, useState } from "react";

const FRAME_COUNT = 192;
const SCROLL_SENSITIVITY = 0.00042;
const KEY_STEP = 1 / (FRAME_COUNT - 1);

const clampProgress = (value: number) => Math.min(1, Math.max(0, value));

const navItems = [
  ["Studio", "studio"],
  ["Classes", "classes"],
  ["Nail Spa", "nail-spa"],
  ["Pricing", "pricing"],
  ["Timetable", "timetable"],
  ["Coaches", "coaches"],
  ["Corporate", "corporate"],
  ["FAQ", "faq"],
] as const;

const philosophyCards = [
  ["Bespoke Curation", "Small-format sessions shaped around posture, control, breath, and a quieter kind of strength."],
  ["Kinetic Intelligence", "Every sequence is taught with anatomical precision, clear rhythm, and considered progression."],
  ["Radical Restraint", "A studio experience stripped of noise, leaving only warm materials, expert coaching, and focus."],
] as const;

const equipment = [
  "Allegro 2 Reformers",
  "Wunda Chairs",
  "Cadillac Wall",
  "Bespoke Props",
] as const;

const classes = [
  {
    title: "Reformer",
    meta: "50 minutes / moderate to high",
    body: "Dynamic resistance training for posture, strength, mobility, and controlled athletic refinement.",
  },
  {
    title: "Classical Mat",
    meta: "45 minutes / foundational",
    body: "A precise mat practice rooted in Joseph Pilates' original method, breath, and clean transitions.",
  },
  {
    title: "Private Sessions",
    meta: "60 or 90 minutes / customized",
    body: "One-on-one choreography using the reformer, Cadillac, and Wunda suite for personal goals.",
  },
] as const;

const nailSpaServices = [
  {
    title: "Signature Manicure",
    meta: "45 minutes / care ritual",
    body: "Cuticle detailing, nail shaping, hand hydration, and a polished finish in the atelier palette.",
  },
  {
    title: "Gel Polish Ritual",
    meta: "60 minutes / long wear",
    body: "High-gloss gel application with careful prep, balanced structure, and refined color selection.",
  },
  {
    title: "Spa Pedicure",
    meta: "60 minutes / restorative",
    body: "Foot soak, shaping, exfoliation, massage, and polish for a soft reset after movement.",
  },
  {
    title: "Nail Strengthening",
    meta: "40 minutes / repair",
    body: "A focused treatment for brittle or tired nails using gentle prep and strengthening layers.",
  },
  {
    title: "Minimal Nail Art",
    meta: "Add-on / bespoke",
    body: "Fine-line accents, tonal details, and restrained artwork designed to feel elegant, not loud.",
  },
  {
    title: "Bridal Atelier Set",
    meta: "90 minutes / occasion",
    body: "A complete manicure and pedicure pairing for events, shoots, and quiet luxury bridal moments.",
  },
] as const;

const etiquette = [
  ["What to Wear", "Form-fitting athletic wear and grip socks keep movement safe, clean, and uninterrupted."],
  ["Arrival", "Arrive early enough to exhale, check in, and settle before your instructor begins."],
  ["Health Notes", "Share injuries, pregnancy, or recovery details so the session can be adjusted with care."],
] as const;

const timetable = [
  ["Monday", "07:00", "Rise & Reform", "Elena Vance"],
  ["Tuesday", "08:00", "Posture Clinic", "Elena Vance"],
  ["Wednesday", "07:00", "Rise & Reform", "Marcus T."],
  ["Thursday", "08:30", "Mat Flow", "Sienna B."],
  ["Friday", "07:00", "Rise & Reform", "Elena Vance"],
  ["Saturday", "09:00", "Core Sculpt", "Marcus T."],
  ["Sunday", "10:00", "Posture Clinic", "Elena Vance"],
] as const;

const coaches = [
  ["Elena Vance", "Founder & Creative Director", "Mindful, anatomically precise, and deeply restorative."],
  ["Marcus Thorne", "Athletic Performance Specialist", "High-intensity, rhythmic, and power-focused."],
  ["Sasha Blanc", "Classical Specialist", "Fluid, challenging, and strictly traditional."],
  ["Julian Rossi", "Rehabilitation & Spinal Health", "Gentle, progressive, and safety-oriented."],
] as const;

const pricing = [
  {
    name: "Starter",
    badge: "Begin",
    price: "450",
    period: "month",
    body: "A precise entry point for new members building consistency.",
    features: ["4 group sessions", "Equipment induction", "App booking access"],
    cta: "Start Journey",
  },
  {
    name: "Pro",
    badge: "Recommended",
    price: "1,300",
    period: "month",
    body: "The balanced membership for regular practice and visible progression.",
    features: ["12 group classes", "1 private session", "Priority booking window"],
    cta: "Join Pro",
  },
  {
    name: "Unlimited",
    badge: "All Access",
    price: "2,250",
    period: "month",
    body: "For members who want complete freedom across the studio schedule.",
    features: ["Unlimited group credits", "15% boutique discount", "Premium support"],
    cta: "Go Unlimited",
  },
] as const;

const corporate = [
  ["On-Site Corporate Sessions", "Movement sessions for teams that need focus, posture support, and mental clarity."],
  ["Corporate Contracts", "Long-term partnerships with recurring sessions and dedicated instructor booking."],
  ["Employee Discounts", "Subsidized membership access for teams across studio locations."],
  ["Executive Retreats", "Multi-day wellness experiences blending movement, nutrition, and strategy."],
] as const;

const faqs = [
  ["What should I wear?", "Wear fitted athletic clothing and grip socks. The studio can guide you if you are new."],
  ["Do I need to be athletic?", "No. Sessions meet you where you are and progress with your strength, mobility, and control."],
  ["How do I use the app?", "Use the app to book classes, manage membership, view the timetable, and purchase studio credits."],
  ["Where do I start?", "Begin with Foundations or a private assessment before moving into stronger reformer classes."],
] as const;

const glassCard =
  "rounded-[8px] border border-[#FFF3EA]/70 bg-[#E6CCB9]/38 shadow-[0_28px_80px_rgba(168,84,29,0.16),inset_0_1px_0_rgba(255,246,238,0.72),inset_0_-1px_0_rgba(168,84,29,0.08)] backdrop-blur-2xl";
const glassWarm =
  "rounded-[8px] border border-[#FFE9D8]/75 bg-[#D4B097]/34 shadow-[0_28px_80px_rgba(168,84,29,0.18),inset_0_1px_0_rgba(255,246,238,0.68),inset_0_-1px_0_rgba(168,84,29,0.1)] backdrop-blur-2xl";
const revealMotion = {
  initial: { opacity: 0, y: 34, filter: "blur(10px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  viewport: { once: true, margin: "-12% 0px" },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
} as const;
const cardMotion = {
  initial: { opacity: 0, y: 28, scale: 0.98 },
  whileInView: { opacity: 1, y: 0, scale: 1 },
  viewport: { once: true, margin: "-10% 0px" },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
} as const;
const liftHover = {
  y: -6,
  scale: 1.012,
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
} as const;

type CopyBlockProps = {
  progress: MotionValue<number>;
  eyebrow: string;
  title: string;
  body: string;
  range: [number, number, number];
  align?: "center" | "left";
};

function CopyBlock({ progress, eyebrow, title, body, range, align = "center" }: CopyBlockProps) {
  const opacity = useTransform(progress, range, [0, 1, 0]);
  const y = useTransform(progress, range, [26, 0, -26]);

  return (
    <motion.div
      style={{ opacity, y }}
      className={`pointer-events-none absolute z-20 w-[min(86vw,520px)] px-5 ${
        align === "center"
          ? "inset-x-0 top-[12svh] mx-auto text-center"
          : "left-0 top-[14svh] text-left sm:left-10 sm:top-1/2 sm:-translate-y-1/2 lg:left-16"
      }`}
    >
      <p className="text-[0.68rem] font-medium uppercase tracking-[0.34em] text-white/65 drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)]">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-balance text-3xl font-semibold leading-[1.02] text-white/95 drop-shadow-[0_3px_22px_rgba(0,0,0,0.9)] sm:text-5xl lg:text-6xl">
        {title}
      </h2>
      <p className="mt-4 text-pretty text-sm leading-6 text-white/72 drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)] sm:text-base">
        {body}
      </p>
    </motion.div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  body,
  centered = false,
}: {
  eyebrow: string;
  title: string;
  body?: string;
  centered?: boolean;
}) {
  return (
    <motion.div {...revealMotion} className={centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#A8541D]">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-balance text-4xl font-semibold leading-[0.98] text-[#21140E] sm:text-6xl lg:text-7xl">
        {title}
      </h2>
      {body ? <p className="mt-6 text-pretty text-base leading-7 text-[#6F5545]">{body}</p> : null}
    </motion.div>
  );
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <motion.article {...cardMotion} whileHover={liftHover} className={`${glassCard} p-6`}>
      <h3 className="text-xl font-semibold text-[#21140E]">{title}</h3>
      <p className="mt-4 text-sm leading-6 text-[#6F5545]">{body}</p>
    </motion.article>
  );
}

export default function Home() {
  const progress = useMotionValue(0);
  const mainRef = useRef<HTMLElement | null>(null);
  const touchYRef = useRef<number | null>(null);
  const [hasArrived, setHasArrived] = useState(false);
  const arrivedOpacity = useTransform(progress, [0.86, 1], [0, 1]);
  const arrivedY = useTransform(progress, [0.86, 1], [20, 0]);

  const scrub = (delta: number) => {
    progress.set(clampProgress(progress.get() + delta));
  };

  useMotionValueEvent(progress, "change", (latest) => {
    setHasArrived(latest >= 0.995);
  });

  const handleWheel = (event: WheelEvent<HTMLElement>) => {
    const isAtReceptionTop = (mainRef.current?.scrollTop ?? 0) <= 0;

    if (hasArrived && event.deltaY < 0 && isAtReceptionTop) {
      event.preventDefault();
      setHasArrived(false);
      scrub(event.deltaY * SCROLL_SENSITIVITY);
      return;
    }

    if (hasArrived) return;

    event.preventDefault();
    scrub(event.deltaY * SCROLL_SENSITIVITY);
  };

  const handleTouchStart = (event: TouchEvent<HTMLElement>) => {
    touchYRef.current = event.touches[0]?.clientY ?? null;
  };

  const handleTouchMove = (event: TouchEvent<HTMLElement>) => {
    const currentY = event.touches[0]?.clientY;
    if (currentY === undefined || touchYRef.current === null) return;

    const deltaY = touchYRef.current - currentY;
    touchYRef.current = currentY;
    const isAtReceptionTop = (mainRef.current?.scrollTop ?? 0) <= 0;

    if (hasArrived && deltaY < 0 && isAtReceptionTop) {
      event.preventDefault();
      setHasArrived(false);
      scrub(deltaY * SCROLL_SENSITIVITY);
      return;
    }

    if (hasArrived) return;

    event.preventDefault();
    scrub(deltaY * SCROLL_SENSITIVITY);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const isAtReceptionTop = (mainRef.current?.scrollTop ?? 0) <= 0;

    if (hasArrived && ["ArrowUp", "PageUp"].includes(event.key) && isAtReceptionTop) {
      event.preventDefault();
      setHasArrived(false);
      scrub(-KEY_STEP);
      return;
    }

    if (hasArrived) return;

    if (["ArrowDown", "PageDown", " "].includes(event.key)) {
      event.preventDefault();
      scrub(KEY_STEP);
    }

    if (["ArrowUp", "PageUp"].includes(event.key)) {
      event.preventDefault();
      scrub(-KEY_STEP);
    }
  };

  return (
    <main
      ref={mainRef}
      className={`h-[100svh] bg-[#E6CCB9] text-[#21140E] ${
        hasArrived ? "overflow-y-auto" : "touch-none overflow-hidden"
      }`}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <h1 className="sr-only">LYKIA ATELIER Reception Entrance</h1>

      <section className="relative h-[100svh] overflow-hidden sm:h-dvh" aria-label="Enter reception">
        <div className="flex h-screen w-full items-center justify-center">
          <ImageSequenceCanvas
            progress={progress}
            frameCount={FRAME_COUNT}
            className="h-full w-full"
            objectFit="responsive"
          />
        </div>

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(168,84,29,0.28)_0%,rgba(168,84,29,0)_36%,rgba(168,84,29,0)_64%,rgba(168,84,29,0.3)_100%)] sm:bg-[radial-gradient(circle_at_center,rgba(168,84,29,0)_36%,rgba(168,84,29,0.28)_100%)]" />

        <div className="pointer-events-none absolute left-5 top-5 z-30 text-xs font-semibold uppercase tracking-[0.32em] text-white/85 drop-shadow-[0_2px_16px_rgba(0,0,0,0.9)] sm:left-8 sm:top-8">
          LYKIA ATELIER
        </div>

        <div className="pointer-events-none absolute bottom-5 right-5 z-30 text-right text-[0.65rem] font-medium uppercase tracking-[0.24em] text-white/45 sm:bottom-8 sm:right-8">
          Entrance / Reception
        </div>

        <CopyBlock
          progress={progress}
          eyebrow="LYKIA ATELIER"
          title="Enter quietly"
          body="Scroll forward through the glass doors and into a warm reception."
          range={[0, 0.12, 0.32]}
        />

        <CopyBlock
          progress={progress}
          eyebrow="Arrival"
          title="The doors open to calm"
          body="A soft-lit threshold leads from the facade into the reception space."
          range={[0.28, 0.46, 0.68]}
          align="left"
        />

        <motion.div
          style={{ opacity: arrivedOpacity, y: arrivedY }}
          className="pointer-events-none absolute inset-x-0 bottom-[9svh] z-30 mx-auto max-w-xl px-6 text-center sm:bottom-10"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-white/50">
            Reception
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold text-white/95 sm:text-5xl">
            Welcome in.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/65">
            You have arrived at the LYKIA ATELIER reception.
          </p>
          <p className="mt-6 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-white/45">
            Scroll for the atelier
          </p>
        </motion.div>
      </section>

      <div className="bg-[#F8EFE9]">
        <header className="sticky top-0 z-40 border-b border-[#D4B097]/45 bg-[#F8EFE9]/88 px-5 py-4 backdrop-blur-xl sm:px-8">
          <nav className="mx-auto flex max-w-7xl items-center justify-between gap-6" aria-label="Main navigation">
            <a href="#studio" className="text-sm font-bold uppercase tracking-[0.08em] text-[#21140E]">
              LYKIA ATELIER
            </a>
            <div className="hidden items-center gap-7 lg:flex">
              {navItems.map(([label, href]) => (
                <a
                  key={href}
                  href={`#${href}`}
                  className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[#8A6A57] transition hover:text-[#A8541D]"
                >
                  {label}
                </a>
              ))}
            </div>
            <a
              href="#contact"
              className="rounded-full bg-[#A8541D] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#8F4517]"
            >
              Book Now
            </a>
          </nav>
        </header>

        <section id="studio" className="px-6 py-20 sm:px-10 lg:px-16 lg:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <motion.div {...revealMotion}>
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#A8541D]">
                Studio
              </p>
              <h2 className="mt-5 text-balance text-5xl font-semibold leading-[0.95] text-[#21140E] sm:text-7xl lg:text-8xl">
                Organic Luxury Pilates
              </h2>
              <p className="mt-7 max-w-xl text-lg leading-8 text-[#6F5545]">
                Where luxury meets movement. LYKIA is designed as a tactile, sensory escape from
                the frantic pace of modern life.
              </p>
              <motion.a
                href="#classes"
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-9 inline-flex rounded-full bg-[#A8541D] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#8F4517]"
              >
                Experience the Atelier
              </motion.a>
            </motion.div>
            <motion.div {...cardMotion} whileHover={liftHover} className={`${glassWarm} p-4`}>
              <motion.div
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="aspect-[4/5] rounded-[8px] bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.65),transparent_26%),linear-gradient(135deg,#D4B097,#F8EFE9_45%,#C79776)] bg-[length:180%_180%] p-8"
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
                  className="flex h-full flex-col justify-end rounded-[8px] border border-white/35 p-6"
                >
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-[#A8541D]">
                    08 max class size
                  </p>
                  <p className="mt-3 max-w-sm text-2xl font-semibold text-[#21140E]">
                    Infrared warmth, custom aromatherapy, handcrafted changing suites.
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section className="bg-[#E6CCB9] px-6 py-20 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow="The LYKIA Philosophy"
              title="Architecture before intensity."
              body="Most studios focus on the carve. We focus on the architecture: precise movement, unhurried instruction, and the body-mind harmony that makes strength last."
            />
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {philosophyCards.map(([title, body]) => (
                <InfoCard key={title} title={title} body={body} />
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-20 sm:px-10 lg:px-16">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <SectionHeading
              eyebrow="Organic Luxury"
              title="Calm is the material."
              body="Luxury is not excess here. It is quiet temperature, soft light, warm surfaces, and an environment that makes the transition from outside world to inner focus feel seamless."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {equipment.map((item) => (
                <motion.div
                  key={item}
                  {...cardMotion}
                  whileHover={liftHover}
                  className={`${glassCard} p-5 text-lg font-semibold text-[#21140E]`}
                >
                  {item}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="classes" className="bg-[#F3E1D3] px-6 py-20 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow="Classes"
              title="The Art of Movement"
              body="Every session is curated: classical Pilates principles balanced with contemporary athletic refinement."
            />
            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {classes.map((item) => (
                <motion.article
                  key={item.title}
                  {...cardMotion}
                  whileHover={liftHover}
                  className={`${glassWarm} p-7`}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#A8541D]">
                    {item.meta}
                  </p>
                  <h3 className="mt-5 text-3xl font-semibold text-[#21140E]">{item.title}</h3>
                  <p className="mt-5 text-sm leading-6 text-[#6F5545]">{item.body}</p>
                </motion.article>
              ))}
            </div>
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {etiquette.map(([title, body]) => (
                <InfoCard key={title} title={title} body={body} />
              ))}
            </div>
          </div>
        </section>

        <section id="nail-spa" className="px-6 py-20 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
              <SectionHeading
                eyebrow="Nail Spa"
                title="Care rituals with the same precision."
                body="The nail spa follows the Pilates language: quiet timing, detailed technique, warm materials, and a finished result that feels polished without excess."
              />
              <motion.div
                {...cardMotion}
                whileHover={liftHover}
                className="rounded-[8px] border border-[#FFE9D8]/35 bg-[#A8541D]/82 p-7 text-white shadow-[0_28px_90px_rgba(168,84,29,0.28),inset_0_1px_0_rgba(255,233,216,0.35)] backdrop-blur-2xl"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/60">
                  Atelier Pairing
                </p>
                <p className="mt-5 text-2xl font-semibold leading-tight">
                  Book movement and nail care together for a slower, more complete studio visit.
                </p>
              </motion.div>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {nailSpaServices.map((item) => (
                <motion.article
                  key={item.title}
                  {...cardMotion}
                  whileHover={liftHover}
                  className={`${glassWarm} p-7`}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#A8541D]">
                    {item.meta}
                  </p>
                  <h3 className="mt-5 text-3xl font-semibold text-[#21140E]">{item.title}</h3>
                  <p className="mt-5 text-sm leading-6 text-[#6F5545]">{item.body}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section id="timetable" className="px-6 py-20 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow="Timetable"
              title="The Weekly Flow"
              body="Booking opens seven days in advance. Choose the rhythm that meets your week."
            />
            <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-7">
              {timetable.map(([day, time, title, coach]) => (
                <motion.article key={day} {...cardMotion} whileHover={liftHover} className={`${glassCard} p-5`}>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#A8541D]">
                    {day}
                  </p>
                  <p className="mt-8 text-2xl font-semibold text-[#21140E]">{time}</p>
                  <h3 className="mt-3 text-lg font-semibold text-[#21140E]">{title}</h3>
                  <p className="mt-2 text-sm text-[#6F5545]">{coach}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section id="coaches" className="bg-[#E6CCB9] px-6 py-20 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow="Coaches"
              title="The Curators"
              body="Our instructors are architects of movement, each with a distinct lens on precision, flow, and individual evolution."
            />
            <div className="mt-12 grid gap-5 md:grid-cols-2">
              {coaches.map(([name, role, style]) => (
                <motion.article key={name} {...cardMotion} whileHover={liftHover} className={`${glassWarm} p-7`}>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#A8541D]">
                    {role}
                  </p>
                  <h3 className="mt-4 text-3xl font-semibold text-[#21140E]">{name}</h3>
                  <p className="mt-5 text-sm leading-6 text-[#6F5545]">{style}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="px-6 py-20 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow="Pricing"
              title="Investment in Grace."
              body="Transparent pricing for a bespoke Pilates experience, from introductory journeys to dedicated memberships."
            />
            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {pricing.map((plan, index) => (
                <motion.article
                  key={plan.name}
                  {...cardMotion}
                  whileHover={liftHover}
                  className={`relative overflow-hidden rounded-[8px] p-7 shadow-xl shadow-[#A8541D]/8 ${
                    index === 1
                      ? "border border-[#FFE9D8]/35 bg-[#A8541D]/82 text-white backdrop-blur-2xl"
                      : "border border-[#FFF3EA]/70 bg-[#E6CCB9]/38 text-[#21140E] backdrop-blur-2xl"
                  }`}
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${index === 1 ? "text-white/65" : "text-[#A8541D]"}`}>
                        {plan.badge}
                      </p>
                      <h3 className="mt-5 text-3xl font-semibold">{plan.name}</h3>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] ${
                      index === 1 ? "bg-white/16 text-white" : "bg-[#A8541D]/10 text-[#A8541D]"
                    }`}>
                      Monthly
                    </span>
                  </div>
                  <p className={`mt-5 text-sm leading-6 ${index === 1 ? "text-white/72" : "text-[#6F5545]"}`}>
                    {plan.body}
                  </p>
                  <div className="mt-8 flex items-end gap-2">
                    <span className="text-5xl font-semibold leading-none">{plan.price}</span>
                    <span className={`pb-1 text-sm font-semibold ${index === 1 ? "text-white/60" : "text-[#A8541D]"}`}>
                      SR / {plan.period}
                    </span>
                  </div>
                  <div className={`mt-8 h-px ${index === 1 ? "bg-white/18" : "bg-[#D4B097]/65"}`} />
                  <ul className={`mt-7 space-y-4 text-sm ${index === 1 ? "text-white/82" : "text-[#5C4435]"}`}>
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <span className={`grid size-5 place-items-center rounded-full text-[0.65rem] ${
                          index === 1 ? "bg-white/16 text-white" : "bg-[#A8541D]/12 text-[#A8541D]"
                        }`}>
                          ✓
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <motion.button
                    whileHover={{ y: -2, scale: 1.015 }}
                    whileTap={{ scale: 0.98 }}
                    className={`mt-9 w-full rounded-full px-5 py-3 text-sm font-semibold transition ${
                      index === 1
                        ? "bg-white text-[#A8541D] hover:bg-[#FFF3EA]"
                        : "bg-[#A8541D] text-white hover:bg-[#8F4517]"
                    }`}
                  >
                    {plan.cta}
                  </motion.button>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section id="corporate" className="bg-[#F3E1D3] px-6 py-20 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow="Corporate"
              title="Elevate Employee Productivity"
              body="Corporate wellness programs engineered to optimize cognitive function, physical longevity, and a culture of high-performance vitality."
            />
            <div className="mt-12 grid gap-5 md:grid-cols-2">
              {corporate.map(([title, body]) => (
                <InfoCard key={title} title={title} body={body} />
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="px-6 py-20 sm:px-10 lg:px-16">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <SectionHeading
              eyebrow="Clarity & Movement"
              title="Your Path Unfolded."
              body="Find answers to the common questions about your practice at our atelier."
            />
            <div className="space-y-4">
              {faqs.map(([question, answer]) => (
                <motion.article key={question} {...cardMotion} whileHover={liftHover} className={`${glassCard} p-6`}>
                  <h3 className="text-xl font-semibold text-[#21140E]">{question}</h3>
                  <p className="mt-4 text-sm leading-6 text-[#6F5545]">{answer}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="bg-[#E6CCB9] px-6 py-20 sm:px-10 lg:px-16">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.9fr]">
            <div>
              <SectionHeading
                eyebrow="Connect with our atelier"
                title="Reach out for your practice."
                body="Book classes, manage memberships, explore services, and keep your LYKIA visits organized from the app."
              />
              <motion.div {...cardMotion} className={`${glassWarm} mt-10 p-6 sm:p-8`}>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#A8541D]">
                  LYKIA Mobile
                </p>
                <h3 className="mt-4 text-3xl font-semibold leading-tight text-[#21140E] sm:text-4xl">
                  Your atelier, in your pocket.
                </h3>
                <p className="mt-5 max-w-xl text-sm leading-6 text-[#6F5545]">
                  Download the app to reserve Pilates sessions, schedule nail spa rituals, view
                  membership details, and receive studio updates from Riyadh.
                </p>
                <motion.button
                  whileHover={{ y: -3, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-8 rounded-full bg-[#A8541D] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#8F4517]"
                >
                  Download Our App
                </motion.button>
              </motion.div>
            </div>
            <div className="space-y-5 lg:pt-24">
              <InfoCard title="Riyadh Studio" body="A calm LYKIA atelier in Riyadh for Pilates sessions, nail spa rituals, and private wellness appointments." />
              <motion.div
                {...cardMotion}
                whileHover={liftHover}
                className="rounded-[8px] border border-[#FFE9D8]/35 bg-[#A8541D]/82 p-8 text-white shadow-[0_28px_90px_rgba(168,84,29,0.28),inset_0_1px_0_rgba(255,233,216,0.35)] backdrop-blur-2xl"
              >
                <p className="text-2xl font-semibold leading-tight">
                  &quot;Pilates is the complete coordination of body, mind, and spirit.&quot;
                </p>
                <p className="mt-8 text-xs font-semibold uppercase tracking-[0.24em] text-white/60">
                  Joseph Pilates
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        <footer className="border-t border-[#D4B097]/55 bg-[#F8EFE9] px-6 py-10 sm:px-10 lg:px-16">
          <div className="mx-auto grid max-w-7xl gap-8 text-sm text-[#6F5545] md:grid-cols-4">
            <div>
              <p className="font-bold uppercase tracking-[0.12em] text-[#21140E]">LYKIA ATELIER</p>
              <p className="mt-3">Precision in motion.</p>
            </div>
            <p>Studio<br />Classes<br />Nail Spa<br />Timetable</p>
            <p>Pricing<br />Corporate<br />FAQ</p>
            <p>Contact<br />Privacy<br />Terms</p>
          </div>
        </footer>
      </div>
    </main>
  );
}
