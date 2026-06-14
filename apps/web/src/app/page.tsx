import Link from "next/link";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default async function LandingPage() {
  const dict = await getDictionary();
  return (
    <div className="font-sans">
      {/* ── NAVBAR ── */}
      <nav className="sticky top-8 z-40 bg-off-white/95 backdrop-blur-sm border-b border-border transition-all duration-250">
        <div className="max-w-[1200px] mx-auto h-16 flex items-center justify-between px-[5vw]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-[34px] h-[34px] bg-teal rounded-lg flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 3v12M3 9h12" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
                <circle cx="9" cy="9" r="7.5" stroke="white" strokeWidth="1.5" strokeDasharray="3 2" />
              </svg>
            </div>
            <span className="font-serif text-xl font-medium text-ink">Aarogya</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex gap-7 items-center">
            {["Find Doctors", "Specialties", "How It Works", "About"].map((label) => (
              <a
                key={label}
                href={`#${label.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-sm text-ink-mid hover:text-teal transition-colors duration-150 no-underline"
              >
                {label}
              </a>
            ))}
          </div>

          {/* Auth buttons */}
          <div className="flex gap-2">
            <Link
              href="/auth/login"
              className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-teal border border-teal hover:bg-teal-light transition-colors duration-150 no-underline"
            >
              {dict.nav.login}
            </Link>
            <Link
              href="/auth/signup"
              className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-teal hover:bg-teal-dark transition-colors duration-150 no-underline"
            >
              Sign up free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-teal via-[#0A5040] to-[#073830] px-[5vw] pt-20 pb-0 overflow-hidden relative">
        {/* Background decorative circles */}
        <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full bg-white/[0.04] pointer-events-none" />
        <div className="absolute bottom-[60px] -left-[60px] w-[250px] h-[250px] rounded-full bg-white/[0.03] pointer-events-none" />

        <div className="max-w-[1200px] mx-auto grid md:grid-cols-[1fr_420px] gap-8 md:gap-15 items-end">
          {/* Left — Hero copy */}
          <div className="pb-12 md:pb-20">
            <span className="inline-flex items-center gap-1.5 bg-white/15 text-white text-xs font-medium px-2.5 py-1 rounded-full mb-5">
              🇮🇳 Made for India
            </span>
            <h1 className="font-serif text-[clamp(38px,5vw,58px)] font-medium text-white leading-[1.15] mb-5">
              {dict.landing.title}
            </h1>
            <p className="text-[17px] text-white/75 leading-[1.75] max-w-[480px] mb-8">
              {dict.landing.subtitle}
            </p>
            <div className="flex gap-2.5 flex-wrap mb-10">
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-[15px] font-medium bg-white text-teal hover:bg-off-white transition-colors duration-150 no-underline"
              >
                📅 {dict.landing.cta_patient}
              </Link>
              <Link
                href="/auth/doctor/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-[15px] font-medium bg-white/[0.12] text-white border border-white/20 hover:bg-white/[0.2] transition-colors duration-150 no-underline"
              >
                👨‍⚕️ {dict.landing.cta_doctor}
              </Link>
            </div>
            {/* Trust stats */}
            <div className="flex gap-8 flex-wrap">
              {[
                ["1,200+", "Verified doctors"],
                ["18+", "Specialties"],
                ["50,000+", "Consultations done"],
                ["4.8★", "Average rating"],
              ].map(([num, label]) => (
                <div key={label}>
                  <p className="font-serif text-2xl font-medium text-white m-0">{num}</p>
                  <p className="text-xs text-white/55 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Search card */}
          <div className="bg-white rounded-t-[20px] p-7 shadow-[0_-8px_40px_rgba(0,0,0,0.12)] self-end hidden md:block">
            <p className="font-serif text-lg font-medium text-ink mb-1">Find the right doctor</p>
            <p className="text-sm text-ink-light mb-5">Search by specialty, language, or location</p>

            {/* Specialty input */}
            <div className="relative mb-2.5">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base">🩺</span>
              <input
                placeholder="Specialty (e.g. Cardiologist)"
                className="w-full py-2.5 pl-10 pr-3 border-[1.5px] border-border rounded-lg text-sm text-ink bg-off-white outline-none focus:border-teal transition-colors"
              />
            </div>

            {/* Location input */}
            <div className="relative mb-2.5">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base">📍</span>
              <input
                placeholder="District or city"
                className="w-full py-2.5 pl-10 pr-3 border-[1.5px] border-border rounded-lg text-sm text-ink bg-off-white outline-none focus:border-teal transition-colors"
              />
            </div>

            {/* Language select */}
            <div className="relative mb-4">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base">🌐</span>
              <select className="w-full py-2.5 pl-10 pr-3 border-[1.5px] border-border rounded-lg text-sm text-ink-mid bg-off-white outline-none appearance-none">
                <option>Any language</option>
                <option>Hindi</option>
                <option>English</option>
              </select>
            </div>

            <Link
              href="/doctors"
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg text-[15px] font-medium bg-teal text-white hover:bg-teal-dark transition-colors duration-150 no-underline"
            >
              🔍 Search doctors
            </Link>

            {/* Popular searches */}
            <div className="mt-3.5">
              <p className="text-[11px] text-ink-light mb-2">Popular:</p>
              <div className="flex flex-wrap gap-1.5">
                {["General Physician", "Cardiologist", "Pediatrics", "Dermatology"].map((s) => (
                  <span
                    key={s}
                    className="text-xs bg-off-white border border-border rounded-full px-2.5 py-1 text-ink-mid hover:bg-teal-light hover:text-teal-dark cursor-pointer transition-all duration-150"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <section className="bg-white py-4 px-[5vw] border-b border-border">
        <div className="max-w-[1200px] mx-auto flex justify-center gap-[clamp(20px,4vw,60px)] flex-wrap items-center">
          {["🔒 DPDP Act Compliant", "✅ MCI Verified Doctors", "🌐 Hindi + English", "📱 Works on 2G/3G", "🚫 Not for emergencies"].map((t) => (
            <span key={t} className="text-sm text-ink-mid">{t}</span>
          ))}
        </div>
      </section>

      {/* ── SPECIALTIES ── */}
      <section id="specialties" className="py-20 px-[5vw] bg-off-white">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 bg-teal-light text-teal-dark text-xs font-medium px-2.5 py-1 rounded-full mb-3.5">
              18+ specialties
            </span>
            <h2 className="font-serif text-[clamp(28px,4vw,40px)] font-medium text-ink mb-3">
              Every specialty,<br />
              <em className="italic text-teal">one platform</em>
            </h2>
            <p className="text-[15px] text-ink-mid max-w-[480px] mx-auto">
              From routine check-ups to specialist consultations — find the right care without leaving home.
            </p>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-3">
            {[
              { icon: "🫀", label: "Cardiology" },
              { icon: "🧠", label: "Neurology" },
              { icon: "👶", label: "Pediatrics" },
              { icon: "🦴", label: "Orthopedics" },
              { icon: "🧬", label: "Dermatology" },
              { icon: "👁️", label: "Ophthalmology" },
              { icon: "🦷", label: "Dentistry" },
              { icon: "🧘", label: "Psychiatry" },
            ].map((sp) => (
              <div
                key={sp.label}
                className="flex flex-col items-center gap-2 py-4 px-3 rounded-xl bg-white border border-border cursor-pointer hover:bg-teal-light hover:border-teal-mid transition-all duration-[180ms] min-w-[90px]"
              >
                <span className="text-2xl">{sp.icon}</span>
                <span className="text-xs font-medium text-ink-mid text-center">{sp.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-20 px-[5vw] bg-white">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-1.5 bg-teal-light text-teal-dark text-xs font-medium px-2.5 py-1 rounded-full mb-3.5">
              Simple &amp; fast
            </span>
            <h2 className="font-serif text-[clamp(28px,4vw,40px)] font-medium text-ink">
              Consult a doctor in<br />
              <em className="italic text-teal">4 easy steps</em>
            </h2>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-8">
            {[
              { num: "1", icon: "📝", title: "Create your profile", desc: "Sign up with your phone number and add basic health information. Takes under 2 minutes." },
              { num: "2", icon: "🔍", title: "Search & filter", desc: "Browse verified doctors by specialty, language, location, and availability." },
              { num: "3", icon: "📅", title: "Book a slot", desc: "Pick a date and time that works for you. Instant confirmation, no waiting." },
              { num: "4", icon: "🎥", title: "Consult & get care", desc: "Join your video call, share reports, and receive a digital prescription afterward." },
            ].map((step) => (
              <div key={step.num} className="text-center px-3">
                <div className="relative inline-block mb-5">
                  <div className="w-16 h-16 rounded-full bg-teal-light flex items-center justify-center text-[28px]">
                    {step.icon}
                  </div>
                  <div className="absolute -top-1 -right-1 w-[22px] h-[22px] bg-teal rounded-full flex items-center justify-center text-[11px] font-medium text-white">
                    {step.num}
                  </div>
                </div>
                <p className="font-serif text-[17px] font-medium text-ink mb-2">{step.title}</p>
                <p className="text-sm text-ink-mid leading-[1.7]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED DOCTORS ── */}
      <section id="find-doctors" className="py-20 px-[5vw] bg-off-white">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex justify-between items-end mb-9 flex-wrap gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 bg-teal-light text-teal-dark text-xs font-medium px-2.5 py-1 rounded-full mb-3">
                Top rated this week
              </span>
              <h2 className="font-serif text-[clamp(26px,3vw,36px)] font-medium text-ink">
                Meet our <em className="italic text-teal">verified</em> doctors
              </h2>
            </div>
            <Link
              href="/doctors"
              className="inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-medium text-teal border border-teal hover:bg-teal-light transition-colors duration-150 no-underline"
            >
              View all doctors →
            </Link>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
            {[
              { initials: "RS", name: "Dr. Reena Sharma", specialty: "Cardiologist · 12 yrs", rating: "4.9", reviews: "143", lang: "Hindi, English", fee: 500, available: true, accent: "teal" },
              { initials: "AP", name: "Dr. Arun Pillai", specialty: "General Physician · 8 yrs", rating: "4.7", reviews: "89", lang: "Hindi, English", fee: 300, available: true, accent: "amber" },
              { initials: "NV", name: "Dr. Nisha Verma", specialty: "Pediatrician · 10 yrs", rating: "4.8", reviews: "211", lang: "Hindi, Bengali", fee: 400, available: false, accent: "teal" },
            ].map((doc) => (
              <div
                key={doc.name}
                className="bg-white rounded-2xl border border-border p-5 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all duration-200"
              >
                <div className="flex gap-3 items-start">
                  <div className={`w-[46px] h-[46px] rounded-full flex items-center justify-center font-medium text-sm shrink-0 ${doc.accent === "amber" ? "bg-amber-light text-[#633806]" : "bg-teal-light text-teal-dark"}`}>
                    {doc.initials}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-ink m-0">{doc.name}</p>
                        <p className="text-xs text-ink-light mt-0.5">{doc.specialty}</p>
                      </div>
                      {doc.available && (
                        <span className="inline-flex items-center gap-1 bg-teal-light text-teal-dark text-xs font-medium px-2.5 py-1 rounded-full">
                          ● Available
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 my-2">
                      <span className="text-[#EF9F27] text-xs">★★★★★</span>
                      <span className="text-xs font-medium text-ink">{doc.rating}</span>
                      <span className="text-xs text-ink-light">({doc.reviews})</span>
                    </div>
                    <span className="inline-flex items-center gap-1 bg-teal-light text-teal-dark text-xs font-medium px-2.5 py-1 rounded-full mb-3">
                      {doc.lang}
                    </span>
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-ink">
                        ₹{doc.fee}{" "}
                        <span className="font-normal text-ink-light">/consult</span>
                      </p>
                      <Link
                        href="/auth/signup"
                        className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-medium bg-teal text-white hover:bg-teal-dark transition-colors duration-150 no-underline"
                      >
                        Book slot
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BANNER ── */}
      <section className="bg-gradient-to-br from-teal to-[#0A5040] py-16 px-[5vw]">
        <div className="max-w-[1200px] mx-auto grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-8 text-center">
          {[
            { num: "1,200+", label: "Verified doctors" },
            { num: "18+", label: "Specialties" },
            { num: "50,000+", label: "Consultations done" },
            { num: "22 states", label: "Across India" },
          ].map(({ num, label }) => (
            <div key={label}>
              <p className="font-serif text-[42px] font-medium text-white m-0">{num}</p>
              <p className="text-sm text-white/65 mt-1.5">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 px-[5vw] bg-white">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 bg-teal-light text-teal-dark text-xs font-medium px-2.5 py-1 rounded-full mb-3.5">
              Real patients, real stories
            </span>
            <h2 className="font-serif text-[clamp(28px,4vw,40px)] font-medium text-ink">
              What our patients <em className="italic text-teal">say</em>
            </h2>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
            {[
              { rating: 5, quote: "Living in a village 40km from the nearest hospital, Aarogya has been life-changing. I consulted a cardiologist in Hindi from my home.", name: "Ramesh Yadav", location: "Shimla, Himachal Pradesh" },
              { rating: 5, quote: "My daughter had a fever at midnight. Within 20 minutes I had a doctor on a call, a prescription ready. Incredible service.", name: "Sujatha Krishnamurthy", location: "Kullu, Himachal Pradesh" },
              { rating: 4, quote: "The doctor was so patient and explained everything in Hindi. I uploaded my reports and she reviewed them right there on the call.", name: "Priya Deshmukh", location: "Mandi, Himachal Pradesh" },
            ].map((t) => (
              <div key={t.name} className="bg-white rounded-2xl border border-border p-6">
                <div className="text-[#EF9F27] text-sm mb-3">{"★".repeat(t.rating)}</div>
                <p className="font-serif italic text-[15px] text-ink leading-[1.7] mb-4">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <p className="text-sm font-medium text-ink">{t.name}</p>
                  <p className="text-xs text-ink-light">{t.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOR DOCTORS CTA ── */}
      <section className="py-20 px-[5vw] bg-amber-light">
        <div className="max-w-[1200px] mx-auto grid md:grid-cols-[1fr_auto] gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-[#FAEEDA] text-[#633806] text-xs font-medium px-2.5 py-1 rounded-full border border-[#E8D5B0] mb-3.5">
              Are you a doctor?
            </span>
            <h2 className="font-serif text-[clamp(26px,3.5vw,38px)] font-medium text-ink mb-3">
              Expand your reach.<br />
              <em className="italic text-amber">Practice from anywhere.</em>
            </h2>
            <p className="text-[15px] text-ink-mid leading-[1.7] max-w-[520px]">
              Join 1,200+ doctors already on Aarogya. Set your own hours, consult patients across Himachal Pradesh, and grow your practice with zero overhead.
            </p>
          </div>
          <div className="flex flex-col gap-2.5">
            <Link
              href="/auth/doctor/signup"
              className="inline-flex items-center justify-center px-7 py-3 rounded-lg text-[15px] font-medium bg-teal text-white hover:bg-teal-dark transition-colors duration-150 no-underline"
            >
              Register as a doctor →
            </Link>
            <p className="text-xs text-ink-light text-center">Free to join · Verified in 48 hrs</p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#111] text-white/70 pt-12 pb-7 px-[5vw]">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3.5">
                <div className="w-[30px] h-[30px] bg-teal rounded-[7px] flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                    <path d="M9 3v12M3 9h12" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="font-serif text-lg font-medium text-white">Aarogya</span>
              </div>
              <p className="text-sm leading-[1.7] max-w-[260px]">
                Telemedicine for Himachal Pradesh. Bridging the gap between patients and doctors across the state.
              </p>
              <p className="text-[11px] mt-3.5 text-white/35">
                ⚠️ Not for medical emergencies. Call 108 for emergencies.
              </p>
            </div>
            {[
              ["Patients", [{label: "Find doctors", href: "/doctors"}, {label: "Book appointment", href: "/auth/signup"}, {label: "My records", href: "/auth/login"}, {label: "Support", href: "#"}]],
              ["Doctors", [{label: "Join as doctor", href: "/auth/doctor/signup"}, {label: "Doctor dashboard", href: "/auth/doctor/login"}, {label: "Help centre", href: "#"}]],
              ["Company", [{label: "About us", href: "#"}, {label: "Admin Portal", href: "/auth/admin/login"}, {label: "Admin Signup", href: "/auth/admin/signup"}, {label: "Contact", href: "#"}]],
            ].map(([title, links]) => (
              <div key={title as string}>
                <p className="text-sm font-medium text-white mb-3.5">{title as string}</p>
                {(links as {label: string, href: string}[]).map((l) => (
                  <Link key={l.label} href={l.href} className="block text-sm mb-2 cursor-pointer hover:text-white transition-colors duration-150 no-underline text-white/70">
                    {l.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
          <div className="border-t border-white/[0.08] pt-5 flex justify-between flex-wrap gap-2.5">
            <p className="text-xs">© 2026 Aarogya · HP Government Health Department</p>
            <p className="text-xs">Built with ❤️ for Himachal Pradesh</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
