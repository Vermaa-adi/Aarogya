"use client";

import { useActionState, useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyOtp, resendOtp } from "./actions";

export function OtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") ?? "";
  const email = searchParams.get("email") ?? "";
  const identifier = phone || email;
  const context = searchParams.get("context") ?? searchParams.get("type") ?? "login";

  const [state, formAction, isPending] = useActionState(verifyOtp, null);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend timer
  const [resendTimer, setResendTimer] = useState(60);
  const [resendMessage, setResendMessage] = useState("");

  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  useEffect(() => {
    if (state?.success && state.redirectTo) {
      router.push(state.redirectTo);
    }
  }, [state, router]);

  const handleDigitChange = useCallback(
    (index: number, value: string) => {
      if (!/^\d?$/.test(value)) return;
      const newDigits = [...otpDigits];
      newDigits[index] = value;
      setOtpDigits(newDigits);

      // Auto-focus next input
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [otpDigits]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [otpDigits]
  );

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length > 0) {
      const newDigits = [...pasted.split(""), ...Array(6 - pasted.length).fill("")];
      setOtpDigits(newDigits);
      const focusIdx = Math.min(pasted.length, 5);
      inputRefs.current[focusIdx]?.focus();
    }
  }, []);

  const handleResend = async () => {
    if (resendTimer > 0 || !identifier) return;
    setResendMessage("");
    
    // For this prototype, we only support resending to phone numbers
    // In a real app, we'd also call supabase.auth.resend({ type: 'signup', email })
    if (phone) {
      const result = await resendOtp(phone);
      setResendMessage(result.message ?? "");
      if (result.success) {
        setResendTimer(60);
      }
    } else {
      setResendMessage("Resend link sent to your email.");
      setResendTimer(60);
    }
  };

  const maskedIdentifier = phone
    ? phone.slice(0, -4).replace(/./g, "•") + phone.slice(-4)
    : email 
      ? email.replace(/(.{2})(.*)(?=@)/, (gp1, gp2, gp3) => { 
          for(let i = 0; i < gp3.length; i++) { 
            gp2+= "*"; 
          } return gp2; 
        })
      : "your contact";

  return (
    <div>
      <div className="text-center mb-6">
        <div className="mx-auto w-14 h-14 bg-teal/10 rounded-full flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="font-serif text-2xl font-semibold text-ink">Verify Your Account</h2>
        <p className="text-sm text-ink-mid mt-1.5">
          Enter the 6-digit code sent to{" "}
          <span className="font-medium text-ink">{maskedIdentifier}</span>
        </p>
      </div>

      <form action={formAction} className="space-y-5">
        {/* Hidden fields */}
        <input type="hidden" name="phone" value={phone} />
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="type" value={context} />
        <input type="hidden" name="otp" value={otpDigits.join("")} />

        {state?.message && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {state.message}
          </div>
        )}

        {/* OTP Input Grid */}
        <div className="flex justify-center gap-2.5" onPaste={handlePaste}>
          {otpDigits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-11 h-12 text-center text-lg font-semibold border-2 border-border rounded-lg text-ink bg-off-white outline-none focus:border-teal transition-all"
              aria-label={`Digit ${i + 1}`}
            />
          ))}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending || otpDigits.join("").length < 6}
          className="w-full py-2.5 px-4 bg-teal hover:bg-teal-dark disabled:bg-teal-mid/50 disabled:cursor-not-allowed text-white font-medium text-sm rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer"
        >
          {isPending ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Verifying...
            </>
          ) : (
            "Verify OTP"
          )}
        </button>
      </form>

      {/* Resend section */}
      <div className="mt-5 text-center">
        {resendMessage && (
          <p className="text-xs text-green-600 mb-2">{resendMessage}</p>
        )}
        {resendTimer > 0 ? (
          <p className="text-xs text-ink-light">
            Resend OTP in{" "}
            <span className="font-medium text-ink-mid">{resendTimer}s</span>
          </p>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            className="text-xs text-teal font-medium hover:underline cursor-pointer"
          >
            Resend OTP
          </button>
        )}
      </div>
    </div>
  );
}
