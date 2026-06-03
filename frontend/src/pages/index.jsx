import { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom'

// ── Google Fonts injected once ──────────────────────────────────────────────
const FONT_LINK = "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;1,9..144,300;1,9..144,400&family=DM+Sans:wght@300;400;500&display=swap";
// ── Design tokens ────────────────────────────────────────────────────────────
const T = {
  teal:       "#0F6E56",
  tealMid:    "#1D9E75",
  tealLight:  "#E1F5EE",
  tealDark:   "#085041",
  amber:      "#BA7517",
  amberLight: "#FAEEDA",
  offWhite:   "#F7F6F2",
  ink:        "#1A1A1A",
  inkMid:     "#4A4A4A",
  inkLight:   "#8A8A8A",
  white:      "#FFFFFF",
  border:     "rgba(0,0,0,0.08)",
};

// ── Inline styles helper ─────────────────────────────────────────────────────
const s = (obj) => obj;

// ── Reusable components ──────────────────────────────────────────────────────
function Badge({ children, variant = "teal" }) {
  const colors = {
    teal:  { bg: T.tealLight,  color: T.tealDark },
    amber: { bg: T.amberLight, color: "#633806" },
    white: { bg: "rgba(255,255,255,0.15)", color: T.white },
  };
  const c = colors[variant];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: c.bg, color: c.color, fontSize: 12, fontWeight: 500, padding: "4px 10px", borderRadius: 20, fontFamily: "'DM Sans', sans-serif" }}>
      {children}
    </span>
  );
}

function Btn({ children, variant = "primary", onClick, style = {} }) {
  const base = { display: "inline-flex", alignItems: "center", gap: 7, padding: "11px 22px", borderRadius: 10, fontSize: 14, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "all 0.18s ease", border: "none" };
  const variants = {
    primary:   { background: T.teal,  color: T.white },
    secondary: { background: "transparent", color: T.teal, border: `1.5px solid ${T.teal}` },
    white:     { background: T.white, color: T.teal },
    ghost:     { background: "rgba(255,255,255,0.12)", color: T.white, border: "1px solid rgba(255,255,255,0.2)" },
  };
  return <button style={{ ...base, ...variants[variant], ...style }} onClick={onClick}>{children}</button>;
}

// ── Animated counter ─────────────────────────────────────────────────────────
function Counter({ to, suffix = "", prefix = "" }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0;
        const step = Math.ceil(to / 40);
        const t = setInterval(() => {
          start = Math.min(start + step, to);
          setVal(start);
          if (start >= to) clearInterval(t);
        }, 30);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
}

// ── FAQ accordion ────────────────────────────────────────────────────────────
function Accordion({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${T.border}`, overflow: "hidden" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ width: "100%", background: "none", border: "none", padding: "20px 0", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", textAlign: "left", gap: 16 }}
      >
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 500, color: T.ink, lineHeight: 1.4 }}>{q}</span>
        <span style={{ color: T.teal, fontSize: 22, fontWeight: 300, flexShrink: 0, transform: open ? "rotate(45deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>+</span>
      </button>
      <div style={{ maxHeight: open ? 300 : 0, overflow: "hidden", transition: "max-height 0.3s ease" }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: T.inkMid, lineHeight: 1.8, paddingBottom: 20 }}>{a}</p>
      </div>
    </div>
  );
}

// ── Doctor card ──────────────────────────────────────────────────────────────
function DoctorCard({ initials, name, specialty, rating, reviews, lang, fee, available, accent }) {
  const accentColors = {
    teal:   { bg: T.tealLight,  text: T.tealDark },
    amber:  { bg: T.amberLight, text: "#633806" },
    blue:   { bg: "#EAF3FB",    text: "#0C447C" },
  };
  const ac = accentColors[accent] || accentColors.teal;
  return (
    <div style={{ background: T.white, borderRadius: 16, border: `1px solid ${T.border}`, padding: 20, transition: "transform 0.2s, box-shadow 0.2s" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.08)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{ width: 46, height: 46, borderRadius: "50%", background: ac.bg, color: ac.text, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 500, fontSize: 14, flexShrink: 0, fontFamily: "'DM Sans', sans-serif" }}>{initials}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, color: T.ink, margin: 0 }}>{name}</p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: T.inkLight, margin: "2px 0 0" }}>{specialty}</p>
            </div>
            {available && <Badge variant="teal">● Available</Badge>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, margin: "8px 0" }}>
            <span style={{ color: "#EF9F27", fontSize: 12 }}>★★★★★</span>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 500, color: T.ink }}>{rating}</span>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: T.inkLight }}>({reviews})</span>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
            <Badge variant="teal">{lang}</Badge>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, color: T.ink }}>₹{fee} <span style={{ fontWeight: 400, color: T.inkLight }}>/consult</span></p>
            <Btn variant="primary" style={{ padding: "7px 14px", fontSize: 12 }}>Book slot</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Step card ────────────────────────────────────────────────────────────────
function StepCard({ num, icon, title, desc }) {
  return (
    <div style={{ textAlign: "center", padding: "0 12px" }}>
      <div style={{ position: "relative", display: "inline-block", marginBottom: 20 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: T.tealLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>{icon}</div>
        <div style={{ position: "absolute", top: -4, right: -4, width: 22, height: 22, background: T.teal, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 500, color: T.white }}>{num}</div>
      </div>
      <p style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 500, color: T.ink, marginBottom: 8 }}>{title}</p>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: T.inkMid, lineHeight: 1.7 }}>{desc}</p>
    </div>
  );
}

// ── Specialty pill ───────────────────────────────────────────────────────────
function SpecPill({ icon, label }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "16px 12px", borderRadius: 12, background: T.white, border: `1px solid ${T.border}`, cursor: "pointer", transition: "all 0.18s", minWidth: 90 }}
      onMouseEnter={e => { e.currentTarget.style.background = T.tealLight; e.currentTarget.style.borderColor = T.tealMid; }}
      onMouseLeave={e => { e.currentTarget.style.background = T.white; e.currentTarget.style.borderColor = T.border; }}
    >
      <span style={{ fontSize: 24 }}>{icon}</span>
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 500, color: T.inkMid, textAlign: "center" }}>{label}</span>
    </div>
  );
}

// ── Testimonial card ─────────────────────────────────────────────────────────
function Testimonial({ quote, name, location, rating }) {
  return (
    <div style={{ background: T.white, borderRadius: 16, border: `1px solid ${T.border}`, padding: 24 }}>
      <div style={{ color: "#EF9F27", fontSize: 14, marginBottom: 12 }}>{"★".repeat(rating)}</div>
      <p style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", fontSize: 15, color: T.ink, lineHeight: 1.7, marginBottom: 16 }}>"{quote}"</p>
      <div>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, color: T.ink }}>{name}</p>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: T.inkLight }}>{location}</p>
      </div>
    </div>
  );
}

// ── Main LandingPage component ───────────────────────────────────────────────
export default function LandingPage() {
  const [searchSpecialty, setSearchSpecialty] = useState("");
  const [searchLocation, setSearchLocation]   = useState("");
  const [mobileMenuOpen, setMobileMenuOpen]   = useState(false);
  const [scrolled, setScrolled]               = useState(false);

  useEffect(() => {
    // Inject Google Fonts
    if (!document.getElementById("aarogya-fonts")) {
      const link = document.createElement("link");
      link.id   = "aarogya-fonts";
      link.rel  = "stylesheet";
      link.href = FONT_LINK;
      document.head.appendChild(link);
    }
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = ["Find Doctors", "Specialties", "How It Works", "About/FAQ"];

  const faqs = [
    { q: "Is Aarogya available in rural areas?", a: "Yes. Aarogya is designed specifically with rural India in mind. You only need a basic smartphone and a 2G/3G internet connection to consult a doctor. We also support voice-based consultations for users with limited literacy." },
    { q: "Which languages are supported?", a: "We currently support Hindi, English, Tamil, Bengali, Telugu, Marathi, and Kannada. More languages are being added regularly. You can set your preferred language from your profile settings." },
    { q: "How are doctors verified on Aarogya?", a: "Every doctor goes through a thorough verification process. They must submit their medical degree, MCI/state council registration certificate, and a government ID. Our admin team manually reviews and approves each application before the doctor can accept patients." },
    { q: "Is my medical data safe?", a: "Absolutely. All data is encrypted at rest and in transit. We comply with India's Digital Personal Data Protection (DPDP) Act 2023. Your medical records are only visible to you and the doctor you choose to share them with." },
    { q: "What happens if I miss my appointment?", a: "You can reschedule up to 2 hours before the appointment for free. If you miss a session without rescheduling, 50% of the consultation fee may be deducted as a cancellation charge, depending on the doctor's policy." },
    { q: "Can Aarogya replace emergency medical care?", a: "No. Aarogya is meant for non-emergency consultations, follow-ups, and general health advice. In case of a medical emergency, please call 112 or visit the nearest hospital immediately. We display this disclaimer at all times in the app." },
    { q: "How do I pay for a consultation?", a: "You can pay via UPI (GPay, PhonePe, Paytm), debit/credit card, or net banking. Cash payments are not supported. Razorpay powers our secure payment gateway." },
    { q: "Can I get a prescription through Aarogya?", a: "Yes. After a video consultation, doctors can issue a digital prescription which is saved in your records and can be downloaded as a PDF. These are valid prescriptions signed by licensed practitioners." },
  ];

  const doctors = [
    { initials: "RS", name: "Dr. Reena Sharma", specialty: "Cardiologist · 12 yrs", rating: "4.9", reviews: "143", lang: "Hindi, English", fee: 500, available: true,  accent: "teal" },
    { initials: "AP", name: "Dr. Arun Pillai",  specialty: "General Physician · 8 yrs", rating: "4.7", reviews: "89", lang: "Tamil, English", fee: 300, available: true,  accent: "amber" },
    { initials: "NV", name: "Dr. Nisha Verma",  specialty: "Pediatrician · 10 yrs", rating: "4.8", reviews: "211", lang: "Hindi, Bengali", fee: 400, available: false, accent: "blue" },
  ];

  const specialties = [
    { icon: "🫀", label: "Cardiology" },
    { icon: "🧠", label: "Neurology" },
    { icon: "👶", label: "Pediatrics" },
    { icon: "🦴", label: "Orthopedics" },
    { icon: "🧬", label: "Dermatology" },
    { icon: "👁️", label: "Ophthalmology" },
    { icon: "🦷", label: "Dentistry" },
    { icon: "🧘", label: "Psychiatry" },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: T.offWhite, minHeight: "100vh", color: T.ink }}>

      {/* ── NAVBAR ── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: scrolled ? "rgba(255,255,255,0.95)" : T.offWhite, backdropFilter: scrolled ? "blur(12px)" : "none", borderBottom: scrolled ? `1px solid ${T.border}` : "1px solid transparent", transition: "all 0.25s ease", padding: "0 5vw" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <div style={{ width: 34, height: 34, background: T.teal, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 3v12M3 9h12" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
                <circle cx="9" cy="9" r="7.5" stroke="white" strokeWidth="1.5" strokeDasharray="3 2"/>
              </svg>
            </div>
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 500, color: T.ink }}>Aarogya</span>
          </div>

          {/* Desktop links */}
          <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
            {navLinks.map(l => (
              <a key={l} href="#" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: T.inkMid, textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={e => e.target.style.color = T.teal}
                onMouseLeave={e => e.target.style.color = T.inkMid}
              >{l}</a>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="secondary" style={{ padding: "8px 18px" }}>Log in</Btn>
            <Btn variant="primary"   style={{ padding: "8px 18px" }}>Sign up free</Btn>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ background: `linear-gradient(135deg, ${T.teal} 0%, #0A5040 60%, #073830 100%)`, padding: "80px 5vw 0", overflow: "hidden", position: "relative" }}>
        {/* Background circles */}
        <div style={{ position: "absolute", top: -80, right: -80, width: 400, height: 400, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: 60, left: -60, width: 250, height: 250, borderRadius: "50%", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 420px", gap: 60, alignItems: "flex-end" }}>
          {/* Left */}
          <div style={{ paddingBottom: 80 }}>
            <Badge variant="white" style={{ marginBottom: 20 }}>🇮🇳 Made for India</Badge>
            <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(38px, 5vw, 58px)", fontWeight: 500, color: T.white, lineHeight: 1.15, margin: "16px 0 20px" }}>
              Healthcare that<br />
              <em style={{ fontStyle: "italic", color: "#9FE1CB" }}>comes to you,</em><br />
              wherever you are.
            </h1>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 17, color: "rgba(255,255,255,0.75)", lineHeight: 1.75, maxWidth: 480, marginBottom: 32 }}>
              Connect with 1,200+ verified doctors in your language. Book consultations, share records, get prescriptions — all from your phone.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 40 }}>
              <Btn variant="white" style={{ fontSize: 15, padding: "12px 24px" }}>📅 Book a consultation</Btn>
              <Btn variant="ghost" style={{ fontSize: 15, padding: "12px 24px" }}>▶ See how it works</Btn>
            </div>
            {/* Trust stats */}
            <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
              {[["1,200+","Verified doctors"], ["18+","Specialties"], ["50,000+","Consultations done"], ["4.8★","Average rating"]].map(([n, l]) => (
                <div key={l}>
                  <p style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 500, color: T.white, margin: 0 }}>{n}</p>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.55)", margin: "2px 0 0" }}>{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right – search card */}
          <div style={{ background: T.white, borderRadius: "20px 20px 0 0", padding: 28, boxShadow: "0 -8px 40px rgba(0,0,0,0.12)", alignSelf: "flex-end" }}>
            <p style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 500, color: T.ink, marginBottom: 4 }}>Find the right doctor</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: T.inkLight, marginBottom: 20 }}>Search by specialty, language, or location</p>

            {/* Specialty input */}
            <div style={{ position: "relative", marginBottom: 10 }}>
              <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>🩺</span>
              <input
                value={searchSpecialty}
                onChange={e => setSearchSpecialty(e.target.value)}
                placeholder="Specialty (e.g. Cardiologist)"
                style={{ width: "100%", padding: "11px 12px 11px 40px", border: `1.5px solid ${T.border}`, borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: T.ink, background: T.offWhite, outline: "none", boxSizing: "border-box" }}
                onFocus={e => e.target.style.borderColor = T.teal}
                onBlur={e => e.target.style.borderColor = T.border}
              />
            </div>

            {/* Location input */}
            <div style={{ position: "relative", marginBottom: 10 }}>
              <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>📍</span>
              <input
                value={searchLocation}
                onChange={e => setSearchLocation(e.target.value)}
                placeholder="District or city"
                style={{ width: "100%", padding: "11px 12px 11px 40px", border: `1.5px solid ${T.border}`, borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: T.ink, background: T.offWhite, outline: "none", boxSizing: "border-box" }}
                onFocus={e => e.target.style.borderColor = T.teal}
                onBlur={e => e.target.style.borderColor = T.border}
              />
            </div>

            {/* Language select */}
            <div style={{ position: "relative", marginBottom: 16 }}>
              <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>🌐</span>
              <select style={{ width: "100%", padding: "11px 12px 11px 40px", border: `1.5px solid ${T.border}`, borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: T.inkMid, background: T.offWhite, outline: "none", boxSizing: "border-box", appearance: "none" }}>
                <option>Any language</option>
                <option>Hindi</option>
                <option>Tamil</option>
                <option>Bengali</option>
                <option>Telugu</option>
                <option>Marathi</option>
              </select>
            </div>

            <Btn variant="primary" style={{ width: "100%", justifyContent: "center", padding: "13px", fontSize: 15 }}>🔍 Search doctors</Btn>

            {/* Popular searches */}
            <div style={{ marginTop: 14 }}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: T.inkLight, marginBottom: 8 }}>Popular:</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {["General Physician", "Cardiologist", "Pediatrics", "Dermatology"].map(s => (
                  <span key={s} onClick={() => setSearchSpecialty(s)} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, background: T.offWhite, border: `1px solid ${T.border}`, borderRadius: 20, padding: "4px 10px", cursor: "pointer", color: T.inkMid, transition: "all 0.15s" }}
                    onMouseEnter={e => { e.target.style.background = T.tealLight; e.target.style.color = T.tealDark; }}
                    onMouseLeave={e => { e.target.style.background = T.offWhite; e.target.style.color = T.inkMid; }}
                  >{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <section style={{ background: T.white, padding: "18px 5vw", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "center", gap: "clamp(20px,4vw,60px)", flexWrap: "wrap", alignItems: "center" }}>
          {["🔒 DPDP Act Compliant", "✅ MCI Verified Doctors", "🌐 8 Indian Languages", "📱 Works on 2G/3G", "🚫 Not for emergencies"].map(t => (
            <span key={t} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: T.inkMid, fontWeight: 400 }}>{t}</span>
          ))}
        </div>
      </section>

      {/* ── SPECIALTIES ── */}
      <section style={{ padding: "80px 5vw", background: T.offWhite }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <Badge variant="teal" style={{ marginBottom: 14 }}>18+ specialties</Badge>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 500, color: T.ink, marginBottom: 12 }}>Every specialty,<br /><em style={{ fontStyle: "italic", color: T.teal }}>one platform</em></h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: T.inkMid, maxWidth: 480, margin: "0 auto" }}>From routine check-ups to specialist consultations — find the right care without leaving home.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 12 }}>
            {specialties.map(sp => <SpecPill key={sp.label} {...sp} />)}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: "80px 5vw", background: T.white }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <Badge variant="teal" style={{ marginBottom: 14 }}>Simple & fast</Badge>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 500, color: T.ink }}>Consult a doctor in<br /><em style={{ fontStyle: "italic", color: T.teal }}>4 easy steps</em></h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 32 }}>
            <StepCard num="1" icon="📝" title="Create your profile" desc="Sign up with your phone number and add basic health information. Takes under 2 minutes." />
            <StepCard num="2" icon="🔍" title="Search & filter" desc="Browse verified doctors by specialty, language, location, and availability." />
            <StepCard num="3" icon="📅" title="Book a slot" desc="Pick a date and time that works for you. Instant confirmation, no waiting." />
            <StepCard num="4" icon="🎥" title="Consult & get care" desc="Join your video call, share reports, and receive a digital prescription afterward." />
          </div>
        </div>
      </section>

      {/* ── FEATURED DOCTORS ── */}
      <section style={{ padding: "80px 5vw", background: T.offWhite }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 36, flexWrap: "wrap", gap: 16 }}>
            <div>
              <Badge variant="teal" style={{ marginBottom: 12 }}>Top rated this week</Badge>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(26px, 3vw, 36px)", fontWeight: 500, color: T.ink }}>Meet our <em style={{ fontStyle: "italic", color: T.teal }}>verified</em> doctors</h2>
            </div>
            <Btn variant="secondary">View all doctors →</Btn>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {doctors.map(d => <DoctorCard key={d.name} {...d} />)}
          </div>
        </div>
      </section>

      {/* ── STATS BANNER ── */}
      <section style={{ background: `linear-gradient(135deg, ${T.teal} 0%, #0A5040 100%)`, padding: "60px 5vw" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 32, textAlign: "center" }}>
          {[{ to: 1200, suffix: "+", label: "Verified doctors" }, { to: 18, suffix: "+", label: "Specialties" }, { to: 50000, suffix: "+", label: "Consultations done" }, { to: 22, suffix: " states", label: "Across India" }].map(({ to, suffix, label }) => (
            <div key={label}>
              <p style={{ fontFamily: "'Fraunces', serif", fontSize: 42, fontWeight: 500, color: T.white, margin: 0 }}><Counter to={to} suffix={suffix} /></p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.65)", margin: "6px 0 0" }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: "80px 5vw", background: T.white }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <Badge variant="teal" style={{ marginBottom: 14 }}>Real patients, real stories</Badge>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 500, color: T.ink }}>What our patients <em style={{ fontStyle: "italic", color: T.teal }}>say</em></h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            <Testimonial rating={5} quote="Living in a village 40km from the nearest hospital, Aarogya has been life-changing. I consulted a cardiologist in Hindi from my home." name="Ramesh Yadav" location="Sitapur, Uttar Pradesh" />
            <Testimonial rating={5} quote="My daughter had a fever at midnight. Within 20 minutes I had a doctor on a call, a prescription ready. Incredible service." name="Sujatha Krishnamurthy" location="Vellore, Tamil Nadu" />
            <Testimonial rating={4} quote="The doctor was so patient and explained everything in Marathi. I uploaded my reports and she reviewed them right there on the call." name="Priya Deshmukh" location="Nashik, Maharashtra" />
          </div>
        </div>
      </section>

      {/* ── FOR DOCTORS CTA ── */}
      <section style={{ padding: "80px 5vw", background: T.amberLight }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr auto", gap: 40, alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <Badge variant="amber" style={{ marginBottom: 14 }}>Are you a doctor?</Badge>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(26px, 3.5vw, 38px)", fontWeight: 500, color: T.ink, marginBottom: 12 }}>Expand your reach.<br /><em style={{ fontStyle: "italic", color: T.amber }}>Practice from anywhere.</em></h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: T.inkMid, lineHeight: 1.7, maxWidth: 520 }}>Join 1,200+ doctors already on Aarogya. Set your own hours, consult patients across India, and grow your practice with zero overhead.</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Btn variant="primary" style={{ padding: "13px 28px", fontSize: 15 }}>Register as a doctor →</Btn>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: T.inkLight, textAlign: "center" }}>Free to join · Verified in 48 hrs</p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#111", color: "rgba(255,255,255,0.7)", padding: "48px 5vw 28px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 40, flexWrap: "wrap" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ width: 30, height: 30, background: T.teal, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M9 3v12M3 9h12" stroke="white" strokeWidth="2.2" strokeLinecap="round"/></svg>
                </div>
                <span style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 500, color: T.white }}>Aarogya</span>
              </div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, lineHeight: 1.7, maxWidth: 260 }}>Telemedicine for every Indian. Bridging the gap between patients and doctors across 22 states.</p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, marginTop: 14, color: "rgba(255,255,255,0.35)" }}>⚠️ Not for medical emergencies. Call 112 for emergencies.</p>
            </div>
            {[["Patients", ["Find doctors","Book appointment","My records","Prescriptions","Support"]], ["Doctors", ["Join as doctor","Doctor dashboard","Verification","Fees & payments","Help centre"]], ["Company", ["About us","FAQ","Privacy policy","Terms of service","Contact"]]].map(([title, links]) => (
              <div key={title}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, color: T.white, marginBottom: 14 }}>{title}</p>
                {links.map(l => <p key={l} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, marginBottom: 8, cursor: "pointer" }}
                  onMouseEnter={e => e.target.style.color = T.white}
                  onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.7)"}
                >{l}</p>)}
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 20, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12 }}>© 2025 Aarogya Health Pvt. Ltd. All rights reserved.</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12 }}>Built with ❤️ for Bharat</p>
          </div>
        </div>
      </footer>
    </div>
  );
}