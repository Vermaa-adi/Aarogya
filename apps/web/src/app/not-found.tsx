import Link from "next/link";

export const metadata = {
  title: "Page Not Found — Aarogya",
  description: "The page you are looking for could not be found.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-off-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Illustration */}
        <div className="mb-6">
          <div className="mx-auto w-24 h-24 bg-teal/10 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-teal"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* 404 badge */}
        <div className="inline-block px-3 py-1 bg-amber/10 text-amber font-mono text-sm font-semibold rounded-full mb-4">
          404
        </div>

        <h1 className="font-serif text-3xl font-semibold text-ink mb-3">
          Page Not Found
        </h1>
        <p className="text-ink-mid text-base mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-teal hover:bg-teal-dark text-white text-sm font-medium rounded-lg shadow-sm transition-colors duration-150 no-underline"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go Home
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-white hover:bg-cream border border-border text-ink text-sm font-medium rounded-lg transition-colors duration-150 no-underline"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
