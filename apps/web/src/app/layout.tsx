import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { getCurrentLocale } from "@/lib/i18n/dictionaries";
import LanguageSelector from "@/components/LanguageSelector";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aarogya — HP Government Telemedicine Platform",
  description:
    "Connect with verified doctors in Himachal Pradesh for video consultations. Book appointments, share medical records, and get prescriptions — all from your phone.",
  keywords: [
    "telemedicine",
    "Himachal Pradesh",
    "doctor consultation",
    "video call doctor",
    "rural healthcare",
    "Hindi",
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getCurrentLocale();
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {/* Emergency banner — sticky on all pages (architecture §9) */}
        <div className="sticky top-0 z-50 bg-red-600 text-white text-center text-xs sm:text-sm py-1.5 px-4 font-medium">
          ⚠️ This platform is not for medical emergencies. For emergencies,
          call <strong>108</strong>.
        </div>

        {/* Main content */}
        <main className="flex-1">{children}</main>

        <div className="fixed bottom-4 right-4 z-50">
          <LanguageSelector currentLocale={locale} />
        </div>
      </body>
    </html>
  );
}
