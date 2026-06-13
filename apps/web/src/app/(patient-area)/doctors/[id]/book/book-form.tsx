"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBooking } from "./actions";

interface DoctorData {
  id: string;
  name: string;
  fee_inr: number | null;
  availability: Record<string, { start: string; end: string }[]>;
}

const DAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export default function BookFormClient({ doctor }: { doctor: DoctorData }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createBooking, null);
  
  // Slot selection state
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);

  // Generate today + next 13 days for date selection
  const next14Days = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i); // Start from today
    return d;
  });

  useEffect(() => {
    if (state?.success) {
      router.push("/appointments?booked=true");
      router.refresh();
    }
  }, [state, router]);

  useEffect(() => {
    if (!selectedDate) {
      setTimeout(() => {
        setAvailableTimeSlots([]);
        setSelectedTime("");
      }, 0);
      return;
    }

    const dateObj = new Date(selectedDate);
    const dayOfWeek = DAY_NAMES[dateObj.getDay()];
    const dayAvailability = doctor.availability[dayOfWeek] || [];

    // Check if selected date is today
    const now = new Date();
    const isToday =
      dateObj.getFullYear() === now.getFullYear() &&
      dateObj.getMonth() === now.getMonth() &&
      dateObj.getDate() === now.getDate();

    // Simple slot generation: divide blocks into 30 min intervals
    const slots: string[] = [];
    dayAvailability.forEach((block) => {
      const [startH, startM] = block.start.split(":").map(Number);
      const [endH, endM] = block.end.split(":").map(Number);
      
      let currentH = startH;
      let currentM = startM;
      
      while (currentH < endH || (currentH === endH && currentM < endM)) {
        const timeString = `${currentH.toString().padStart(2, '0')}:${currentM.toString().padStart(2, '0')}`;

        // If today, skip slots that are in the past (give 30 min buffer)
        if (isToday) {
          const slotMinutes = currentH * 60 + currentM;
          const nowMinutes = now.getHours() * 60 + now.getMinutes() + 30;
          if (slotMinutes >= nowMinutes) {
            slots.push(timeString);
          }
        } else {
          slots.push(timeString);
        }
        
        currentM += 30;
        if (currentM >= 60) {
          currentM -= 60;
          currentH += 1;
        }
      }
    });

    setTimeout(() => {
      setAvailableTimeSlots(slots);
      setSelectedTime(""); // Reset time when date changes
    }, 0);
  }, [selectedDate, doctor.availability]);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="doctorId" value={doctor.id} />
      
      {state?.message && !state.success && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {state.message}
        </div>
      )}

      {/* Date Picker */}
      <div>
        <label className="block text-sm font-semibold text-ink mb-3">
          1. Select a Date
        </label>
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {next14Days.map((date) => {
            const dateStr = date.toISOString().split("T")[0];
            const isSelected = selectedDate === dateStr;
            const dayOfWeek = DAY_NAMES[date.getDay()];
            const hasSlots = (doctor.availability[dayOfWeek] || []).length > 0;

            return (
              <button
                key={dateStr}
                type="button"
                disabled={!hasSlots}
                onClick={() => setSelectedDate(dateStr)}
                className={`flex-shrink-0 w-[72px] p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  isSelected
                    ? "border-teal bg-teal-light/50 text-teal-dark shadow-sm"
                    : hasSlots
                    ? "border-border bg-white hover:border-teal/50 cursor-pointer"
                    : "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                }`}
              >
                <span className="text-[10px] uppercase font-medium">
                  {date.toLocaleDateString("en-US", { weekday: "short" })}
                </span>
                <span className="text-xl font-serif font-semibold">
                  {date.getDate()}
                </span>
                <span className="text-[10px] text-ink-light">
                  {date.toLocaleDateString("en-US", { month: "short" })}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Picker */}
      {selectedDate && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <label className="block text-sm font-semibold text-ink mb-3">
            2. Select a Time Slot
          </label>
          <input type="hidden" name="date" value={selectedDate} />
          <input type="hidden" name="time" value={selectedTime} />
          
          {availableTimeSlots.length === 0 ? (
            <p className="text-sm text-ink-light py-4 text-center border border-dashed border-border rounded-lg">
              No slots available on this date.
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {availableTimeSlots.map((time) => {
                const isSelected = selectedTime === time;
                // Format for display
                const [h, m] = time.split(":");
                const hour = parseInt(h, 10);
                const ampm = hour >= 12 ? "PM" : "AM";
                const displayHour = hour % 12 || 12;
                const displayTime = `${displayHour}:${m} ${ampm}`;

                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSelectedTime(time)}
                    className={`py-2 px-1 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? "border-teal bg-teal text-white shadow-sm"
                        : "border-border bg-white hover:border-teal text-ink-mid"
                    }`}
                  >
                    {displayTime}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Reason for Visit */}
      {selectedTime && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <label htmlFor="reason" className="block text-sm font-semibold text-ink mb-2">
            3. Reason for Visit (Optional)
          </label>
          <p className="text-xs text-ink-light mb-2">
            Briefly describe your symptoms so the doctor can prepare.
          </p>
          <textarea
            id="reason"
            name="reason"
            rows={3}
            placeholder="e.g. Fever and throat pain for 2 days..."
            className="w-full px-3.5 py-2 border border-border rounded-lg text-sm text-ink bg-off-white outline-none focus:border-teal transition-all resize-none"
          />
        </div>
      )}

      {/* Submit */}
      {selectedTime && (
        <div className="pt-4 animate-in fade-in duration-300">
          <div className="bg-amber-light/30 border border-amber/20 rounded-lg p-4 mb-4 flex items-start gap-3">
            <span className="text-amber text-lg mt-0.5">ℹ️</span>
            <div>
              <p className="text-sm font-medium text-ink">Confirm Booking</p>
              <p className="text-xs text-ink-mid mt-1 leading-relaxed">
                You are requesting an appointment with {doctor.name}. 
                {doctor.fee_inr ? ` The consultation fee is ₹${doctor.fee_inr}.` : ""}
                <br />
                The doctor will review and confirm your request shortly.
              </p>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 px-4 bg-teal hover:bg-teal-dark disabled:bg-teal-mid/50 text-white font-medium text-sm rounded-lg shadow-sm transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isPending ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Requesting Appointment...
              </>
            ) : (
              "Request Appointment"
            )}
          </button>
        </div>
      )}
    </form>
  );
}
