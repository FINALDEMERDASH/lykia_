"use client";

import { ImageSequenceCanvas } from "@/components/ImageSequenceCanvas";
import {
  MotionValue,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "framer-motion";
import type { CSSProperties } from "react";
import { KeyboardEvent, TouchEvent, WheelEvent, useEffect, useRef, useState } from "react";

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
  {
    day: "Monday",
    sessions: [
      ["07:00", "Rise & Reform", "Elena Vance"],
      ["10:30", "Nail Spa Ritual", "Lina A."],
      ["18:00", "Core Sculpt", "Marcus T."],
    ],
  },
  {
    day: "Tuesday",
    sessions: [
      ["08:00", "Posture Clinic", "Elena Vance"],
      ["13:00", "Signature Manicure", "Maya R."],
      ["19:00", "Private Reformer", "Julian Rossi"],
    ],
  },
  {
    day: "Wednesday",
    sessions: [
      ["07:00", "Rise & Reform", "Marcus T."],
      ["12:30", "Gel Polish Ritual", "Lina A."],
      ["18:30", "Mat Flow", "Sasha Blanc"],
    ],
  },
  {
    day: "Thursday",
    sessions: [
      ["08:30", "Mat Flow", "Sienna B."],
      ["15:00", "Spa Pedicure", "Maya R."],
      ["20:00", "Core Sculpt", "Marcus T."],
    ],
  },
  {
    day: "Friday",
    sessions: [
      ["07:00", "Rise & Reform", "Elena Vance"],
      ["11:00", "Nail Strengthening", "Lina A."],
      ["17:30", "Classical Mat", "Sasha Blanc"],
    ],
  },
  {
    day: "Saturday",
    sessions: [
      ["09:00", "Core Sculpt", "Marcus T."],
      ["13:30", "Minimal Nail Art", "Maya R."],
      ["18:00", "Private Session", "Elena Vance"],
    ],
  },
  {
    day: "Sunday",
    sessions: [
      ["10:00", "Posture Clinic", "Elena Vance"],
      ["14:00", "Bridal Atelier Set", "Lina A."],
      ["19:00", "Restorative Reformer", "Julian Rossi"],
    ],
  },
] as const;

const arabicTimetable = [
  {
    day: "الإثنين",
    sessions: [
      ["07:00", "رايز آند ري فورم", "إيلينا فانس"],
      ["10:30", "طقس سبا الأظافر", "لينا أ."],
      ["18:00", "كور سكلبت", "ماركوس ت."],
    ],
  },
  {
    day: "الثلاثاء",
    sessions: [
      ["08:00", "عيادة القوام", "إيلينا فانس"],
      ["13:00", "مانيكير سيغنتشر", "مايا ر."],
      ["19:00", "ري فورمر خاص", "جوليان روسي"],
    ],
  },
  {
    day: "الأربعاء",
    sessions: [
      ["07:00", "رايز آند ري فورم", "ماركوس ت."],
      ["12:30", "جل بوليش", "لينا أ."],
      ["18:30", "مات فلو", "ساشا بلانك"],
    ],
  },
  {
    day: "الخميس",
    sessions: [
      ["08:30", "مات فلو", "سيينا ب."],
      ["15:00", "سبا باديكير", "مايا ر."],
      ["20:00", "كور سكلبت", "ماركوس ت."],
    ],
  },
  {
    day: "الجمعة",
    sessions: [
      ["07:00", "رايز آند ري فورم", "إيلينا فانس"],
      ["11:00", "تقوية الأظافر", "لينا أ."],
      ["17:30", "مات كلاسيك", "ساشا بلانك"],
    ],
  },
  {
    day: "السبت",
    sessions: [
      ["09:00", "كور سكلبت", "ماركوس ت."],
      ["13:30", "فن أظافر بسيط", "مايا ر."],
      ["18:00", "جلسة خاصة", "إيلينا فانس"],
    ],
  },
  {
    day: "الأحد",
    sessions: [
      ["10:00", "عيادة القوام", "إيلينا فانس"],
      ["14:00", "باقة العروس", "لينا أ."],
      ["19:00", "ري فورمر ترميمي", "جوليان روسي"],
    ],
  },
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
    price: "900",
    period: "month",
    body: "A precise entry point for new members building consistency.",
    features: ["4 group sessions", "Equipment induction", "App booking access"],
    cta: "Start Journey",
  },
  {
    name: "Pro",
    badge: "Recommended",
    price: "3,500",
    period: "month",
    body: "The balanced membership for regular practice and visible progression.",
    features: ["12 group classes", "1 private session", "Priority booking window"],
    cta: "Join Pro",
  },
  {
    name: "Unlimited",
    badge: "All Access",
    price: "6,000",
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

const siteCopy = {
  en: {
    navItems,
    philosophyCards,
    equipment,
    classes,
    nailSpaServices,
    etiquette,
    timetable,
    coaches,
    pricing,
    corporate,
    faqs,
    bookNow: "Download Our App",
    languageLabel: "العربية",
    srOnlyTitle: "LYKIA ATELIER Reception Entrance",
    entrance: {
      label: "Entrance / Reception",
      firstEyebrow: "LYKIA ATELIER",
      firstTitle: "Enter quietly",
      firstBody: "Scroll forward through the glass doors and into a warm reception.",
      secondEyebrow: "Arrival",
      secondTitle: "The doors open to calm",
      secondBody: "A soft-lit threshold leads from the facade into the reception space.",
      reception: "Reception",
      welcome: "Welcome in.",
      arrived: "You have arrived at the LYKIA ATELIER reception.",
      scroll: "Scroll for the atelier",
      startHint: "Scroll to enter",
    },
    studio: {
      eyebrow: "Studio",
      title: "Luxurious Pilates Atelier and Nail Bar",
      body: "Where mindful movement meets refined beauty care. LYKIA is a tactile, sensory escape for precision Pilates, quiet nail rituals, and a slower return to yourself.",
      pilatesCta: "Pilates",
      nailCta: "Nail Spa",
      stat: "5 max capacity per class",
      statBody: "Infrared warmth, custom aromatherapy, handcrafted changing suites.",
    },
    philosophy: {
      eyebrow: "The LYKIA Philosophy",
      title: "Architecture before intensity.",
      body: "Most studios focus on the carve. We focus on the architecture: precise movement, unhurried instruction, and the body-mind harmony that makes strength last.",
    },
    luxury: {
      eyebrow: "Organic Luxury",
      title: "Calm is the material.",
      body: "Luxury is not excess here. It is quiet temperature, soft light, warm surfaces, and an environment that makes the transition from outside world to inner focus feel seamless.",
    },
    classHeading: {
      eyebrow: "Classes",
      title: "The Art of Movement",
      body: "Every session is curated: classical Pilates principles balanced with contemporary athletic refinement.",
    },
    nailHeading: {
      eyebrow: "Nail Spa",
      title: "Care rituals with the same precision.",
      body: "The nail spa follows the Pilates language: quiet timing, detailed technique, warm materials, and a finished result that feels polished without excess.",
      cardEyebrow: "Atelier Pairing",
      pairingNotes: [
        "Book movement and nail care together for a slower, more complete studio visit.",
        "Start with Reformer strength, then move into a calm manicure or pedicure ritual.",
        "Reserve a private session and nail spa finish for events, travel days, or a full reset.",
      ],
    },
    timetableHeading: {
      eyebrow: "Timetable",
      title: "The Weekly Flow",
      body: "Booking opens seven days in advance. Choose the rhythm that meets your week.",
    },
    coachesHeading: {
      eyebrow: "Coaches",
      title: "The Curators",
      body: "Our instructors are architects of movement, each with a distinct lens on precision, flow, and individual evolution.",
    },
    pricingHeading: {
      eyebrow: "Pricing",
      title: "Investment in Grace.",
      body: "Transparent pricing for a bespoke Pilates experience, from introductory journeys to dedicated memberships.",
      monthly: "Monthly",
      currency: "SR",
    },
    corporateHeading: {
      eyebrow: "Corporate",
      title: "Elevate Employee Productivity",
      body: "Corporate wellness programs engineered to optimize cognitive function, physical longevity, and a culture of high-performance vitality.",
    },
    faqHeading: {
      eyebrow: "Clarity & Movement",
      title: "Your Path Unfolded.",
      body: "Find answers to the common questions about your practice at our atelier.",
    },
    contact: {
      eyebrow: "Connect with our atelier",
      title: "Reach out for your practice.",
      body: "Book classes, manage memberships, explore services, and keep your LYKIA visits organized from the app.",
      appEyebrow: "LYKIA Mobile",
      appTitle: "Your atelier, in your pocket.",
      appBody: "Download the app to reserve Pilates sessions, schedule nail spa rituals, view membership details, and receive studio updates from Riyadh.",
      appCta: "Download Our App",
      locationTitle: "Riyadh Studio",
      locationBody: "A calm LYKIA atelier in Riyadh for Pilates sessions, nail spa rituals, and private wellness appointments.",
      quote: "Pilates is the complete coordination of body, mind, and spirit.",
      quoteBy: "Joseph Pilates",
    },
    footer: {
      tagline: "Precision in motion.",
      colOne: ["Studio", "Classes", "Nail Spa", "Timetable"],
      colTwo: ["Pricing", "Corporate", "FAQ"],
      colThree: ["Contact", "Privacy", "Terms"],
    },
  },
  ar: {
    navItems: [
      ["الاستوديو", "studio"],
      ["حصص البيلاتس", "classes"],
      ["نيل سبا", "nail-spa"],
      ["العضويات", "pricing"],
      ["الجدول", "timetable"],
      ["المدربات", "coaches"],
      ["الشركات", "corporate"],
      ["الأسئلة", "faq"],
    ],
    philosophyCards: [
      ["تنسيق خاص", "حصص صغيرة مصممة حول القوام، التحكم، التنفس، وقوة هادئة تدوم."],
      ["ذكاء حركي", "كل تسلسل يدرس بدقة تشريحية وإيقاع واضح وتدرج مدروس."],
      ["هدوء مقصود", "تجربة خالية من الضجيج، تترك فقط المواد الدافئة، التدريب الخبير، والتركيز."],
    ],
    equipment: ["أجهزة ري فورمر Allegro 2", "كراسي وندا", "جدار كاديلاك", "أدوات مخصصة"],
    classes: [
      {
        title: "ريفورمر بيلاتس",
        meta: "50 دقيقة / مستوى متوسط إلى قوي",
        body: "حصة مقاومة على جهاز الريفورمر لتحسين القوام، قوة الكور، المرونة، والتحكم العضلي.",
      },
      {
        title: "مات بيلاتس كلاسيك",
        meta: "45 دقيقة / مستوى تأسيسي",
        body: "تمارين حصيرة كلاسيكية تركّز على التنفس، المحاذاة، الثبات، وانتقالات بيلاتس نظيفة.",
      },
      {
        title: "جلسات بيلاتس خاصة",
        meta: "60 أو 90 دقيقة / تدريب شخصي",
        body: "برنامج فردي على الريفورمر والكاديلاك والوندا حسب هدفك، مستوى لياقتك، واحتياج جسمك.",
      },
    ],
    nailSpaServices: [
      {
        title: "مانيكير سيغنتشر",
        meta: "45 دقيقة / عناية باليدين",
        body: "تحضير الأظافر، تنظيف الكيوتكل، برد وتشكيل، ترطيب، ولمسة لون نهائية من لوحة النيل بار.",
      },
      {
        title: "جل بوليش",
        meta: "60 دقيقة / ثبات طويل",
        body: "تطبيق جل بوليش لامع مع تحضير دقيق، طبقات متوازنة، واختيار لون مناسب لطول الأظافر وشكلها.",
      },
      {
        title: "باديكير سبا",
        meta: "60 دقيقة / عناية بالقدمين",
        body: "نقع للقدمين، تنظيف وتشكيل الأظافر، تقشير، مساج خفيف، ولمسة بوليش نهائية.",
      },
      {
        title: "تقوية الأظافر",
        meta: "40 دقيقة / ترميم",
        body: "علاج مركز للأظافر الضعيفة باستخدام تحضير لطيف وطبقات تقوية.",
      },
      {
        title: "نيل آرت بسيط",
        meta: "إضافة / حسب التصميم",
        body: "خطوط رفيعة، تفاصيل ناعمة، وفرنش أو لمسات كروم هادئة حسب شكل الأظافر.",
      },
      {
        title: "باقة العروس",
        meta: "90 دقيقة / مناسبات",
        body: "مانيكير وباديكير كامل للمناسبات والتصوير ولحظات الزفاف الهادئة.",
      },
    ],
    etiquette: [
      ["ماذا أرتدي؟", "ملابس رياضية مريحة ومناسبة للجسم وجوارب مانعة للانزلاق لحركة آمنة ونظيفة."],
      ["الوصول", "احضري مبكرا لتسجيل الدخول والهدوء قبل بداية الحصة."],
      ["ملاحظات صحية", "شاركي أي إصابة أو حمل أو مرحلة تعاف حتى نعدل الحصة بعناية."],
    ],
    timetable: [
      ["الإثنين", "07:00", "رايز آند ري فورم", "إيلينا فانس"],
      ["الثلاثاء", "08:00", "عيادة القوام", "إيلينا فانس"],
      ["الأربعاء", "07:00", "رايز آند ري فورم", "ماركوس ت."],
      ["الخميس", "08:30", "مات فلو", "سيينا ب."],
      ["الجمعة", "07:00", "رايز آند ري فورم", "إيلينا فانس"],
      ["السبت", "09:00", "كور سكلبت", "ماركوس ت."],
      ["الأحد", "10:00", "عيادة القوام", "إيلينا فانس"],
    ],
    coaches: [
      ["إيلينا فانس", "المؤسسة والمديرة الإبداعية", "هادئة، دقيقة تشريحيا، وترميمية بعمق."],
      ["ماركوس ثورن", "اختصاصي الأداء الرياضي", "إيقاع قوي وعالي الشدة مع تركيز على القوة."],
      ["ساشا بلانك", "اختصاصية المنهج الكلاسيكي", "انسيابية، صعبة، وملتزمة بالتقاليد الأصلية."],
      ["جوليان روسي", "التأهيل وصحة العمود الفقري", "لطيف، تدريجي، ويركز على السلامة."],
    ],
    pricing: [
      {
        name: "البداية",
        badge: "ابدأ",
        price: "900",
        period: "شهريا",
        body: "مدخل دقيق للأعضاء الجدد لبناء الالتزام.",
        features: ["4 حصص جماعية", "تعريف بالأجهزة", "حجز عبر التطبيق"],
        cta: "ابدأ الرحلة",
      },
      {
        name: "برو",
        badge: "الأكثر اختيارا",
        price: "3,500",
        period: "شهريا",
        body: "عضوية متوازنة للممارسة المنتظمة والتقدم الواضح.",
        features: ["12 حصة جماعية", "جلسة خاصة واحدة", "أولوية في الحجز"],
        cta: "انضم إلى برو",
      },
      {
        name: "غير محدود",
        badge: "وصول كامل",
        price: "6,000",
        period: "شهريا",
        body: "لمن يريد حرية كاملة في جدول الاستوديو.",
        features: ["حصص جماعية غير محدودة", "خصم 15% في البوتيك", "دعم مميز"],
        cta: "اختر غير محدود",
      },
    ],
    corporate: [
      ["حصص داخل مقر العمل", "جلسات حركة للفرق التي تحتاج تركيزا ودعما للقوام ووضوحا ذهنيا."],
      ["عقود الشركات", "شراكات طويلة المدى مع حصص متكررة وحجز مدربين مخصص."],
      ["خصومات الموظفين", "عضويات مدعومة للفرق في مواقع الاستوديو."],
      ["ريتريت تنفيذي", "تجارب عافية متعددة الأيام تجمع الحركة والتغذية والتخطيط."],
    ],
    faqs: [
      ["ماذا أرتدي؟", "ارتدي ملابس رياضية مناسبة وجوارب مانعة للانزلاق. فريقنا يرشدك إذا كانت هذه زيارتك الأولى."],
      ["هل يجب أن أكون رياضية؟", "لا. الحصص تبدأ من مستواك وتتدرج مع قوتك ومرونتك وتحكمك."],
      ["كيف أستخدم التطبيق؟", "استخدمي التطبيق لحجز الحصص وإدارة العضوية والاطلاع على الجدول وشراء الرصيد."],
      ["من أين أبدأ؟", "ابدئي بحصة تأسيسية أو تقييم خاص قبل الانتقال إلى حصص الري فورمر الأقوى."],
    ],
    bookNow: "حملي التطبيق",
    languageLabel: "English",
    srOnlyTitle: "مدخل استقبال ليكيا أتيليه",
    entrance: {
      label: "المدخل / الاستقبال",
      firstEyebrow: "ليكيا أتيليه",
      firstTitle: "ادخلي بهدوء",
      firstBody: "مرري للأمام عبر الأبواب الزجاجية حتى تصلي إلى استقبال دافئ.",
      secondEyebrow: "الوصول",
      secondTitle: "الأبواب تفتح على الهدوء",
      secondBody: "عتبة مضاءة بنعومة تقودك من الواجهة إلى مساحة الاستقبال.",
      reception: "الاستقبال",
      welcome: "أهلا بك.",
      arrived: "لقد وصلت إلى استقبال ليكيا أتيليه.",
      scroll: "مرري لاكتشاف الأتيليه",
      startHint: "مرري للدخول",
    },
    studio: {
      eyebrow: "استوديو بيلاتس",
      title: "أتيليه بيلاتس فاخر ونيل بار",
      body: "استوديو بيلاتس بوتيك يجمع حصص الريفورمر، المات، والجلسات الخاصة مع نيل بار هادئ للعناية بالمانيكير والباديكير.",
      pilatesCta: "حصص البيلاتس",
      nailCta: "نيل سبا",
      stat: "سعة الحصة ٥ أشخاص كحد أقصى",
      statBody: "ريفورمر، مات بيلاتس، مساحة تجهيز هادئة، وتجربة تدريب مركزة.",
    },
    philosophy: {
      eyebrow: "فلسفة ليكيا",
      title: "البنية قبل الشدة.",
      body: "نركز على بنية الحركة: دقة، إرشاد هادئ، وتناغم بين الجسم والذهن يجعل القوة تستمر.",
    },
    luxury: {
      eyebrow: "فخامة عضوية",
      title: "الهدوء هو المادة.",
      body: "الفخامة هنا ليست مبالغة. إنها حرارة هادئة وضوء ناعم ومواد دافئة وانتقال سلس من الخارج إلى التركيز الداخلي.",
    },
    classHeading: {
      eyebrow: "حصص البيلاتس",
      title: "ريفورمر، مات، وجلسات خاصة",
      body: "اختاري الحصة المناسبة لمستواك: تدريب ريفورمر، مات بيلاتس، أو جلسة خاصة لرفع اللياقة والتحكم والقوة.",
    },
    nailHeading: {
      eyebrow: "نيل سبا",
      title: "مانيكير وباديكير بلمسة احترافية.",
      body: "نيل سبا يقدم تحضير الأظافر، جل بوليش، باديكير سبا، تقوية الأظافر، ونيل آرت بسيط بنتيجة أنيقة وطويلة الثبات.",
      cardEyebrow: "باقة بيلاتس + نيل سبا",
      pairingNotes: [
        "ابدئي بحصة ريفورمر، ثم اختتمي الزيارة بمانيكير جل هادئ.",
        "احجزي جلسة بيلاتس خاصة مع باديكير سبا ليوم عناية كامل.",
        "اختاري باقة حركة وعناية: تدريب للجسم ولمسة نهائية للأظافر.",
      ],
    },
    timetableHeading: {
      eyebrow: "الجدول",
      title: "إيقاع الأسبوع",
      body: "يفتح الحجز قبل سبعة أيام. اختاري الإيقاع الذي يناسب أسبوعك.",
    },
    coachesHeading: {
      eyebrow: "المدربون",
      title: "منسقو الحركة",
      body: "مدربونا معماريون للحركة، لكل منهم رؤية خاصة للدقة والانسيابية والتطور الفردي.",
    },
    pricingHeading: {
      eyebrow: "الأسعار",
      title: "استثمار في الرشاقة.",
      body: "أسعار واضحة لتجربة بيلاتس مخصصة، من البداية حتى العضويات المنتظمة.",
      monthly: "شهري",
      currency: "ر.س",
    },
    corporateHeading: {
      eyebrow: "الشركات",
      title: "ارفعي إنتاجية الفريق",
      body: "برامج عافية للشركات مصممة لدعم التركيز، اللياقة طويلة المدى، وثقافة أداء متوازنة.",
    },
    faqHeading: {
      eyebrow: "وضوح وحركة",
      title: "طريقك يتضح.",
      body: "إجابات على الأسئلة الشائعة حول ممارستك في الأتيليه.",
    },
    contact: {
      eyebrow: "تواصلي مع الأتيليه",
      title: "اقتربي من ممارستك.",
      body: "احجزي الحصص، أديري العضوية، اكتشفي الخدمات، ونظمي زياراتك إلى ليكيا عبر التطبيق.",
      appEyebrow: "تطبيق ليكيا",
      appTitle: "الأتيليه في جيبك.",
      appBody: "حملي التطبيق لحجز حصص البيلاتس، جدولة طقوس سبا الأظافر، متابعة العضوية، واستقبال تحديثات استوديو الرياض.",
      appCta: "حملي التطبيق",
      locationTitle: "استوديو الرياض",
      locationBody: "أتيليه هادئ في الرياض لحصص البيلاتس وطقوس سبا الأظافر والمواعيد الخاصة.",
      quote: "البيلاتس هو التنسيق الكامل بين الجسد والعقل والروح.",
      quoteBy: "جوزيف بيلاتس",
    },
    footer: {
      tagline: "دقة في الحركة.",
      colOne: ["الاستوديو", "حصص البيلاتس", "نيل سبا", "الجدول"],
      colTwo: ["الأسعار", "الشركات", "الأسئلة"],
      colThree: ["تواصل", "الخصوصية", "الشروط"],
    },
  },
} as const;

const glassCard =
  "rounded-[8px] border border-[var(--glass-border)] bg-[var(--glass-card)] shadow-[0_28px_80px_var(--shadow),inset_0_1px_0_var(--inner-highlight),inset_0_-1px_0_rgba(168,84,29,0.08)] backdrop-blur-2xl";
const glassWarm =
  "rounded-[8px] border border-[var(--warm-border)] bg-[var(--glass-warm)] shadow-[0_28px_80px_var(--shadow),inset_0_1px_0_var(--inner-highlight),inset_0_-1px_0_rgba(168,84,29,0.1)] backdrop-blur-2xl";
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
      <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--accent)]">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-balance text-4xl font-semibold leading-[0.98] text-[var(--ink)] sm:text-6xl lg:text-7xl">
        {title}
      </h2>
      {body ? <p className="mt-6 text-pretty text-base leading-7 text-[var(--muted)]">{body}</p> : null}
    </motion.div>
  );
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <motion.article {...cardMotion} whileHover={liftHover} className={`${glassCard} p-6`}>
      <h3 className="text-xl font-semibold text-[var(--ink)]">{title}</h3>
      <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{body}</p>
    </motion.article>
  );
}

export default function Home() {
  const progress = useMotionValue(0);
  const mainRef = useRef<HTMLElement | null>(null);
  const touchYRef = useRef<number | null>(null);
  const [language, setLanguage] = useState<"en" | "ar">("en");
  const [isDark, setIsDark] = useState(false);
  const [hasArrived, setHasArrived] = useState(false);
  const [pairingNoteIndex, setPairingNoteIndex] = useState(0);
  const arrivedOpacity = useTransform(progress, [0.86, 1], [0, 1]);
  const arrivedY = useTransform(progress, [0.86, 1], [20, 0]);
  const startHintOpacity = useTransform(progress, [0, 0.035, 0.12], [1, 1, 0]);
  const startHintY = useTransform(progress, [0, 0.12], [0, 18]);
  const copy = siteCopy[language];
  const isArabic = language === "ar";
  const timetableItems = isArabic ? arabicTimetable : timetable;
  const pairingNote = copy.nailHeading.pairingNotes[pairingNoteIndex] ?? copy.nailHeading.pairingNotes[0];
  const pairingNotesCount = copy.nailHeading.pairingNotes.length;
  const themeStyle = {
    "--page-bg": isDark ? "#2A1114" : "#E6CCB9",
    "--surface-bg": isDark ? "#3A181C" : "#F8EFE9",
    "--band-bg": isDark ? "#210C0F" : "#E6CCB9",
    "--soft-bg": isDark ? "#4A2327" : "#F3E1D3",
    "--ink": isDark ? "#FFF0EA" : "#21140E",
    "--muted": isDark ? "rgba(255,224,214,0.76)" : "#6F5545",
    "--soft-text": isDark ? "rgba(255,224,214,0.66)" : "#8A6A57",
    "--accent": isDark ? "#B75B52" : "#A8541D",
    "--accent-deep": isDark ? "#8E3C38" : "#8F4517",
    "--rose-muted": isDark ? "#A46A66" : "#D4B097",
    "--rose-soft": isDark ? "#5A2D31" : "#FFF3EA",
    "--glass-card": isDark ? "rgba(122,64,67,0.36)" : "rgba(230,204,185,0.38)",
    "--glass-warm": isDark ? "rgba(183,91,82,0.24)" : "rgba(212,176,151,0.34)",
    "--glass-border": isDark ? "rgba(255,205,194,0.22)" : "rgba(255,243,234,0.7)",
    "--warm-border": isDark ? "rgba(255,205,194,0.3)" : "rgba(255,233,216,0.75)",
    "--shadow": isDark ? "rgba(18,5,7,0.44)" : "rgba(168,84,29,0.16)",
    "--inner-highlight": isDark ? "rgba(255,226,218,0.14)" : "rgba(255,246,238,0.72)",
  } as CSSProperties;

  const scrub = (delta: number) => {
    progress.set(clampProgress(progress.get() + delta));
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const interval = window.setInterval(() => {
      setPairingNoteIndex((current) => (current + 1) % pairingNotesCount);
    }, 4200);

    return () => window.clearInterval(interval);
  }, [pairingNotesCount]);

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
      lang={language}
      dir={isArabic ? "rtl" : "ltr"}
      style={themeStyle}
      className={`h-[100svh] bg-[var(--page-bg)] text-[var(--ink)] ${
        hasArrived ? "overflow-y-auto" : "touch-none overflow-hidden"
      }`}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <h1 className="sr-only">{copy.srOnlyTitle}</h1>

      <section className="relative h-[100svh] overflow-hidden sm:h-dvh" aria-label="Enter reception">
        <div className="flex h-screen w-full items-center justify-center">
          <ImageSequenceCanvas
            progress={progress}
            frameCount={FRAME_COUNT}
            className="h-full w-full"
            objectFit="responsive"
          />
        </div>

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(109,70,65,0.26)_0%,rgba(168,84,29,0)_36%,rgba(168,84,29,0)_64%,rgba(109,70,65,0.28)_100%)] sm:bg-[radial-gradient(circle_at_center,rgba(168,84,29,0)_36%,rgba(109,70,65,0.26)_100%)]" />

        <div className="pointer-events-none absolute left-5 top-5 z-30 text-xs font-semibold uppercase tracking-[0.32em] text-white/85 drop-shadow-[0_2px_16px_rgba(0,0,0,0.9)] sm:left-8 sm:top-8">
          LYKIA ATELIER
        </div>

        <div className="pointer-events-none absolute bottom-5 right-5 z-30 text-right text-[0.65rem] font-medium uppercase tracking-[0.24em] text-white/45 sm:bottom-8 sm:right-8">
          {copy.entrance.label}
        </div>

        <motion.div
          style={{ opacity: startHintOpacity, y: startHintY }}
          className="pointer-events-none absolute inset-x-0 bottom-[7svh] z-30 mx-auto flex w-fit flex-col items-center gap-3 px-6 text-center sm:bottom-8"
        >
          <p className="rounded-full border border-white/20 bg-black/20 px-5 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-white/75 shadow-2xl shadow-black/35 backdrop-blur-xl">
            {copy.entrance.startHint}
          </p>
          <div className="h-10 w-px overflow-hidden bg-white/15">
            <motion.div
              animate={{ y: ["-100%", "100%"] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              className="h-1/2 w-full bg-white/75"
            />
          </div>
        </motion.div>

        <CopyBlock
          progress={progress}
          eyebrow={copy.entrance.firstEyebrow}
          title={copy.entrance.firstTitle}
          body={copy.entrance.firstBody}
          range={[0, 0.12, 0.32]}
        />

        <CopyBlock
          progress={progress}
          eyebrow={copy.entrance.secondEyebrow}
          title={copy.entrance.secondTitle}
          body={copy.entrance.secondBody}
          range={[0.28, 0.46, 0.68]}
          align="left"
        />

        <motion.div
          style={{ opacity: arrivedOpacity, y: arrivedY }}
          className="pointer-events-none absolute inset-x-0 bottom-[9svh] z-30 mx-auto max-w-xl px-6 text-center sm:bottom-10"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-white/50">
            {copy.entrance.reception}
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold text-white/95 sm:text-5xl">
            {copy.entrance.welcome}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/65">
            {copy.entrance.arrived}
          </p>
          <p className="mt-6 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-white/45">
            {copy.entrance.scroll}
          </p>
        </motion.div>
      </section>

      <div className="bg-[var(--surface-bg)]">
        <header
          dir="ltr"
          className="sticky top-0 z-40 border-b border-[var(--rose-muted)]/35 bg-[var(--surface-bg)] px-5 py-1.5 backdrop-blur-xl sm:px-8"
        >
          <nav className="mx-auto flex max-w-7xl flex-col gap-1.5" aria-label="Main navigation">
            <div className="flex min-w-0 items-center justify-between gap-1">
              <button
                type="button"
                onClick={() => scrollToSection("studio")}
                className="max-w-[74px] truncate text-left text-[0.68rem] font-bold uppercase tracking-[0.06em] text-[var(--ink)] sm:max-w-none sm:text-sm sm:tracking-[0.08em]"
              >
                LYKIA ATELIER
              </button>
              <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                <button
                  type="button"
                  onClick={() => scrollToSection("contact")}
                  className="rounded-full bg-[var(--accent)] px-2.5 py-1.5 text-[0.58rem] font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[var(--accent-deep)] sm:px-4 sm:text-[0.7rem] sm:tracking-[0.12em]"
                >
                  <span className="sm:hidden">{isArabic ? "تطبيق" : "App"}</span>
                  <span className="hidden sm:inline">{copy.bookNow}</span>
                </button>
                <button
                  type="button"
                  aria-label="Toggle language"
                  aria-pressed={isArabic}
                  onClick={() => setLanguage(isArabic ? "en" : "ar")}
                  dir="ltr"
                  className="flex h-7 w-[68px] items-center rounded-full border border-[var(--rose-muted)]/70 bg-[var(--glass-card)] p-1 text-[0.54rem] font-bold uppercase tracking-[0.06em] text-[var(--soft-text)] shadow-[inset_0_1px_0_var(--inner-highlight)] transition hover:border-[var(--accent)] sm:w-[76px] sm:text-[0.58rem] sm:tracking-[0.08em]"
                >
                  <span className={`grid h-5 flex-1 place-items-center rounded-full transition ${
                    !isArabic ? "bg-[var(--accent)] text-white" : ""
                  }`}>
                    EN
                  </span>
                  <span className={`grid h-5 flex-1 place-items-center rounded-full transition ${
                    isArabic ? "bg-[var(--accent)] text-white" : ""
                  }`}>
                    AR
                  </span>
                </button>
                <button
                  type="button"
                  aria-label="Toggle dark theme"
                  aria-pressed={isDark}
                  onClick={() => setIsDark((current) => !current)}
                  className="relative flex h-7 w-[78px] items-center rounded-full border border-[var(--rose-muted)]/70 bg-[var(--glass-card)] px-1 text-[0.48rem] font-bold uppercase tracking-[0.05em] text-[var(--soft-text)] shadow-[inset_0_1px_0_var(--inner-highlight)] transition hover:border-[var(--accent)] sm:w-[88px] sm:text-[0.55rem] sm:tracking-[0.08em]"
                >
                  <motion.span
                    layout
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    className={`absolute top-1 h-5 w-[34px] rounded-full bg-[var(--accent)] shadow-sm sm:w-10 ${
                      isDark ? "right-1" : "left-1"
                    }`}
                  />
                  <span className={`relative z-10 grid flex-1 place-items-center ${!isDark ? "text-white" : ""}`}>Light</span>
                  <span className={`relative z-10 grid flex-1 place-items-center ${isDark ? "text-white" : ""}`}>Dark</span>
                </button>
              </div>
            </div>
            <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-0.5 sm:-mx-8 sm:px-8 lg:mx-0 lg:justify-center lg:overflow-visible lg:px-0">
              {copy.navItems.map(([label, href]) => (
                <button
                  key={href}
                  type="button"
                  onClick={() => scrollToSection(href)}
                  className="shrink-0 rounded-full border border-[var(--rose-muted)]/55 bg-[var(--surface-bg)] px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-[var(--soft-text)] transition hover:border-[var(--accent)]/55 hover:text-[var(--accent)] lg:border-0 lg:bg-transparent lg:px-1"
                >
                  {label}
                </button>
              ))}
            </div>
          </nav>
        </header>

        <section id="studio" className="scroll-mt-32 px-6 py-20 sm:px-10 lg:px-16 lg:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <motion.div {...revealMotion}>
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--accent)]">
                {copy.studio.eyebrow}
              </p>
              <h2 className="mt-5 text-balance text-5xl font-semibold leading-[0.95] text-[var(--ink)] sm:text-7xl lg:text-8xl">
                {copy.studio.title}
              </h2>
              <p className="mt-6 max-w-lg text-sm leading-7 text-[var(--muted)] sm:text-base">
                {copy.studio.body}
              </p>
              <div className="mt-9 flex flex-wrap gap-4">
                <motion.button
                  type="button"
                  onClick={() => scrollToSection("classes")}
                  whileHover={{ y: -3, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex min-w-52 justify-center rounded-full bg-[var(--accent)] px-10 py-4 text-base font-semibold text-white transition hover:bg-[var(--accent-deep)] sm:min-w-64 sm:px-12 lg:min-w-72"
                >
                  {copy.studio.pilatesCta}
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => scrollToSection("nail-spa")}
                  whileHover={{ y: -3, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex min-w-52 justify-center rounded-full border border-[var(--accent)]/45 bg-[var(--surface-bg)] px-10 py-4 text-base font-semibold text-[var(--accent)] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] backdrop-blur-xl transition hover:border-[var(--accent)] hover:bg-[var(--band-bg)] sm:min-w-64 sm:px-12 lg:min-w-72"
                >
                  {copy.studio.nailCta}
                </motion.button>
              </div>
            </motion.div>
            <motion.div {...cardMotion} whileHover={liftHover} className={`${glassWarm} mx-auto w-full max-w-sm p-3 sm:max-w-md lg:max-w-[380px]`}>
              <motion.div
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="aspect-[4/5] rounded-[8px] bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.65),transparent_26%),linear-gradient(135deg,var(--rose-muted),var(--surface-bg)_45%,var(--accent))] bg-[length:180%_180%] p-5 sm:p-6"
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
                  className="flex h-full flex-col justify-end rounded-[8px] border border-white/35 p-5"
                >
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-[var(--accent)]">
                    {copy.studio.stat}
                  </p>
                  <p className="mt-3 max-w-sm text-xl font-semibold text-[var(--ink)] sm:text-2xl">
                    {copy.studio.statBody}
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section className="bg-[var(--band-bg)] px-6 py-20 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow={copy.philosophy.eyebrow}
              title={copy.philosophy.title}
              body={copy.philosophy.body}
            />
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {copy.philosophyCards.map(([title, body]) => (
                <InfoCard key={title} title={title} body={body} />
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-20 sm:px-10 lg:px-16">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <SectionHeading
              eyebrow={copy.luxury.eyebrow}
              title={copy.luxury.title}
              body={copy.luxury.body}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {copy.equipment.map((item) => (
                <motion.div
                  key={item}
                  {...cardMotion}
                  whileHover={liftHover}
                  className={`${glassCard} p-5 text-lg font-semibold text-[var(--ink)]`}
                >
                  {item}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="classes" className="scroll-mt-32 bg-[var(--soft-bg)] px-6 py-20 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow={copy.classHeading.eyebrow}
              title={copy.classHeading.title}
              body={copy.classHeading.body}
            />
            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {copy.classes.map((item) => (
                <motion.article
                  key={item.title}
                  {...cardMotion}
                  whileHover={liftHover}
                  className={`${glassWarm} p-7`}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
                    {item.meta}
                  </p>
                  <h3 className="mt-5 text-3xl font-semibold text-[var(--ink)]">{item.title}</h3>
                  <p className="mt-5 text-sm leading-6 text-[var(--muted)]">{item.body}</p>
                </motion.article>
              ))}
            </div>
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {copy.etiquette.map(([title, body]) => (
                <InfoCard key={title} title={title} body={body} />
              ))}
            </div>
          </div>
        </section>

        <section id="nail-spa" className="scroll-mt-32 px-6 py-20 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
              <SectionHeading
                eyebrow={copy.nailHeading.eyebrow}
                title={copy.nailHeading.title}
                body={copy.nailHeading.body}
              />
              <motion.div
                {...cardMotion}
                whileHover={liftHover}
                className="relative overflow-hidden rounded-[8px] border border-[var(--accent)]/25 bg-[var(--surface-bg)] p-7 text-[var(--ink)] shadow-[0_30px_90px_rgba(109,70,65,0.14),inset_0_1px_0_rgba(255,246,238,0.72)] backdrop-blur-2xl"
              >
                <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[var(--accent)]/12 blur-2xl" />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/45 to-transparent" />
                <p className="relative text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">
                  {copy.nailHeading.cardEyebrow}
                </p>
                <motion.p
                  key={pairingNote}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="relative mt-5 max-w-2xl text-2xl font-semibold leading-tight text-[var(--ink)]"
                >
                  {pairingNote}
                </motion.p>
                <div className="relative mt-7 flex gap-2">
                  {copy.nailHeading.pairingNotes.map((note, index) => (
                    <button
                      key={note}
                      type="button"
                      aria-label={`Show pairing note ${index + 1}`}
                      onClick={() => setPairingNoteIndex(index)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        pairingNoteIndex === index
                          ? "w-14 bg-[var(--accent)]"
                          : "w-10 bg-[var(--rose-muted)] hover:bg-[var(--accent)]"
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {copy.nailSpaServices.map((item) => (
                <motion.article
                  key={item.title}
                  {...cardMotion}
                  whileHover={liftHover}
                  className={`${glassWarm} p-7`}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
                    {item.meta}
                  </p>
                  <h3 className="mt-5 text-3xl font-semibold text-[var(--ink)]">{item.title}</h3>
                  <p className="mt-5 text-sm leading-6 text-[var(--muted)]">{item.body}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section id="timetable" className="scroll-mt-32 px-6 py-20 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow={copy.timetableHeading.eyebrow}
              title={copy.timetableHeading.title}
              body={copy.timetableHeading.body}
            />
            <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-7">
              {timetableItems.map((day) => (
                <motion.article key={day.day} {...cardMotion} whileHover={liftHover} className={`${glassCard} p-5`}>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
                    {day.day}
                  </p>
                  <div className="mt-7 space-y-5">
                    {day.sessions.map(([time, title, coach]) => (
                      <div key={`${day.day}-${time}-${title}`} className="border-t border-[var(--rose-muted)]/60 pt-4 first:border-t-0 first:pt-0">
                        <p className="text-2xl font-semibold text-[var(--ink)]">{time}</p>
                        <h3 className="mt-2 text-base font-semibold text-[var(--ink)]">{title}</h3>
                        <p className="mt-1 text-sm text-[var(--muted)]">{coach}</p>
                      </div>
                    ))}
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section id="coaches" className="scroll-mt-32 bg-[var(--band-bg)] px-6 py-20 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow={copy.coachesHeading.eyebrow}
              title={copy.coachesHeading.title}
              body={copy.coachesHeading.body}
            />
            <div className="mt-12 grid gap-5 md:grid-cols-2">
              {copy.coaches.map(([name, role, style]) => (
                <motion.article key={name} {...cardMotion} whileHover={liftHover} className={`${glassWarm} p-7`}>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
                    {role}
                  </p>
                  <h3 className="mt-4 text-3xl font-semibold text-[var(--ink)]">{name}</h3>
                  <p className="mt-5 text-sm leading-6 text-[var(--muted)]">{style}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="scroll-mt-32 px-6 py-20 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow={copy.pricingHeading.eyebrow}
              title={copy.pricingHeading.title}
              body={copy.pricingHeading.body}
            />
            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {copy.pricing.map((plan, index) => (
                <motion.article
                  key={plan.name}
                  {...cardMotion}
                  whileHover={liftHover}
                  className={`relative overflow-hidden rounded-[8px] p-7 shadow-[0_30px_90px_rgba(109,70,65,0.14),inset_0_1px_0_rgba(255,246,238,0.68)] ${
                    index === 1
                      ? "border border-[var(--accent)]/35 bg-[var(--surface-bg)] text-[var(--ink)] ring-1 ring-[var(--accent)]/20 backdrop-blur-2xl"
                      : "border border-[var(--rose-soft)]/70 bg-[var(--glass-card)] text-[var(--ink)] backdrop-blur-2xl"
                  }`}
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/45 to-transparent" />
                  {index === 1 ? (
                    <div className="pointer-events-none absolute right-5 top-5 h-16 w-16 rounded-full bg-[var(--accent)]/10 blur-2xl" />
                  ) : null}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
                        {plan.badge}
                      </p>
                      <h3 className="mt-5 text-3xl font-semibold">{plan.name}</h3>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] ${
                      index === 1 ? "bg-[var(--accent)] text-white" : "bg-[var(--accent)]/10 text-[var(--accent)]"
                    }`}>
                      {copy.pricingHeading.monthly}
                    </span>
                  </div>
                  <p className="mt-5 text-sm leading-6 text-[var(--muted)]">
                    {plan.body}
                  </p>
                  <div className="mt-8 flex items-end gap-2">
                    <span className="text-6xl font-semibold leading-none tracking-tight">{plan.price}</span>
                    <span className="pb-1 text-sm font-semibold text-[var(--accent)]">
                      {copy.pricingHeading.currency} / {plan.period}
                    </span>
                  </div>
                  <div className="mt-8 h-px bg-[var(--rose-muted)]/65" />
                  <ul className="mt-7 space-y-4 text-sm text-[var(--muted)]">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <span className={`grid size-5 place-items-center rounded-full text-[0.65rem] ${
                          index === 1 ? "bg-[var(--accent)] text-white" : "bg-[var(--accent)]/12 text-[var(--accent)]"
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
                        ? "bg-white text-[var(--accent)] hover:bg-[var(--rose-soft)]"
                        : "bg-[var(--accent)] text-white hover:bg-[var(--accent-deep)]"
                    }`}
                  >
                    {plan.cta}
                  </motion.button>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section id="corporate" className="scroll-mt-32 bg-[var(--soft-bg)] px-6 py-20 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow={copy.corporateHeading.eyebrow}
              title={copy.corporateHeading.title}
              body={copy.corporateHeading.body}
            />
            <div className="mt-12 grid gap-5 md:grid-cols-2">
              {copy.corporate.map(([title, body]) => (
                <InfoCard key={title} title={title} body={body} />
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="scroll-mt-32 px-6 py-20 sm:px-10 lg:px-16">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <SectionHeading
              eyebrow={copy.faqHeading.eyebrow}
              title={copy.faqHeading.title}
              body={copy.faqHeading.body}
            />
            <div className="space-y-4">
              {copy.faqs.map(([question, answer]) => (
                <motion.article key={question} {...cardMotion} whileHover={liftHover} className={`${glassCard} p-6`}>
                  <h3 className="text-xl font-semibold text-[var(--ink)]">{question}</h3>
                  <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{answer}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="scroll-mt-32 bg-[var(--band-bg)] px-6 py-20 sm:px-10 lg:px-16">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.9fr]">
            <div>
              <SectionHeading
                eyebrow={copy.contact.eyebrow}
                title={copy.contact.title}
                body={copy.contact.body}
              />
              <motion.div {...cardMotion} className={`${glassWarm} mt-10 p-6 sm:p-8`}>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">
                  {copy.contact.appEyebrow}
                </p>
                <h3 className="mt-4 text-3xl font-semibold leading-tight text-[var(--ink)] sm:text-4xl">
                  {copy.contact.appTitle}
                </h3>
                <p className="mt-5 max-w-xl text-sm leading-6 text-[var(--muted)]">
                  {copy.contact.appBody}
                </p>
                <motion.button
                  whileHover={{ y: -3, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-8 rounded-full bg-[var(--accent)] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-deep)]"
                >
                  {copy.contact.appCta}
                </motion.button>
              </motion.div>
            </div>
            <div className="space-y-5 lg:pt-24">
              <InfoCard title={copy.contact.locationTitle} body={copy.contact.locationBody} />
              <motion.div
                {...cardMotion}
                whileHover={liftHover}
                className="rounded-[8px] border border-[var(--rose-soft)]/35 bg-[var(--accent)]/82 p-8 text-white shadow-[0_28px_90px_rgba(109,70,65,0.26),inset_0_1px_0_rgba(255,233,216,0.35)] backdrop-blur-2xl"
              >
                <p className="text-2xl font-semibold leading-tight">
                  &quot;{copy.contact.quote}&quot;
                </p>
                <p className="mt-8 text-xs font-semibold uppercase tracking-[0.24em] text-white/60">
                  {copy.contact.quoteBy}
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        <footer className="border-t border-[var(--rose-muted)]/55 bg-[var(--surface-bg)] px-6 py-10 sm:px-10 lg:px-16">
          <div className="mx-auto grid max-w-7xl gap-8 text-sm text-[var(--muted)] md:grid-cols-4">
            <div>
              <p className="font-bold uppercase tracking-[0.12em] text-[var(--ink)]">LYKIA ATELIER</p>
              <p className="mt-3">{copy.footer.tagline}</p>
            </div>
            <p>{copy.footer.colOne.map((item) => <span key={item}>{item}<br /></span>)}</p>
            <p>{copy.footer.colTwo.map((item) => <span key={item}>{item}<br /></span>)}</p>
            <p>{copy.footer.colThree.map((item) => <span key={item}>{item}<br /></span>)}</p>
          </div>
        </footer>
      </div>
    </main>
  );
}


