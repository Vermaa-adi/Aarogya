"use client";

import { Suspense } from "react";
import { OtpForm } from "./otp-form";

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-12">
          <div className="animate-spin inline-block h-6 w-6 border-2 border-teal border-t-transparent rounded-full" />
          <p className="text-xs text-ink-mid mt-3">Loading...</p>
        </div>
      }
    >
      <OtpForm />
    </Suspense>
  );
}
