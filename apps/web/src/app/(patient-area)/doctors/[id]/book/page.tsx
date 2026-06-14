import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import BookFormClient from "./book-form";

export const dynamic = "force-dynamic";


export default async function BookAppointmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  if (!supabase) redirect("/auth/login");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Fetch doctor data
  const { data: doctor } = await supabase
    .from("doctor_profiles")
    .select("id, name, fee_inr, availability, specialties, avatar_url, is_verified")
    .eq("id", id)
    .single();

  if (!doctor || !doctor.is_verified) {
    notFound();
  }

  const initials = doctor.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const availability = (doctor.availability as Record<string, { start: string; end: string }[]>) || {};

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back button */}
      <Link
        href={`/doctors/${id}`}
        className="inline-flex items-center gap-1 text-xs text-ink-mid hover:text-teal mb-6 no-underline"
      >
        ← Back to Doctor Profile
      </Link>

      <div className="mb-6">
        <h1 className="font-serif text-2xl font-semibold text-ink">
          Book Appointment
        </h1>
        <p className="text-sm text-ink-mid mt-1">
          Select a suitable date and time for your consultation.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden mb-6">
        {/* Doctor Summary Header */}
        <div className="p-4 sm:p-6 border-b border-border bg-off-white/50 flex items-center gap-4">
          {doctor.avatar_url ? (
            <img
              src={doctor.avatar_url}
              alt={doctor.name}
              className="w-16 h-16 rounded-full object-cover border border-border"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-teal-light text-teal font-bold text-xl flex items-center justify-center flex-shrink-0">
              {initials}
            </div>
          )}
          <div>
            <h2 className="font-semibold text-ink text-lg">{doctor.name}</h2>
            <p className="text-xs text-ink-mid">
              {doctor.specialties?.join(", ") || "General Medicine"}
            </p>
            {doctor.fee_inr && (
              <p className="text-xs font-medium text-teal mt-1">
                Consultation Fee: ₹{doctor.fee_inr}
              </p>
            )}
          </div>
        </div>

        {/* Booking Form */}
        <div className="p-4 sm:p-6">
          <BookFormClient 
            doctor={{
              id: doctor.id,
              name: doctor.name,
              fee_inr: doctor.fee_inr,
              availability: availability
            }} 
          />
        </div>
      </div>
    </div>
  );
}
