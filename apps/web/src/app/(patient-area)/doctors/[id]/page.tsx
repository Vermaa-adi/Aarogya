import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";


const DAY_NAMES = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

const DAY_LABELS: Record<string, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

export default async function DoctorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  if (!supabase) redirect("/auth/login");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Fetch doctor profile
  const { data: doctor } = await supabase
    .from("doctor_profiles")
    .select(
      "id, user_id, name, specialties, languages, qualification, experience_years, license_no, bio, fee_inr, availability, rating_avg, rating_count, is_verified, avatar_url"
    )
    .eq("id", id)
    .eq("is_verified", true)
    .single();

  if (!doctor) {
    notFound();
  }

  // Fetch recent reviews
  const { data: reviews } = await supabase
    .from("ratings")
    .select(
      "id, score, review, created_at, patient_id, patient_profiles(name)"
    )
    .eq("doctor_id", doctor.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const initials = doctor.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Parse availability
  const availability =
    (doctor.availability as Record<string, { start: string; end: string }[]>) ||
    {};

  return (
    <div>
      {/* Back button */}
      <Link
        href="/doctors"
        className="inline-flex items-center gap-1 text-xs text-ink-mid hover:text-teal mb-4 no-underline"
      >
        ← Back to Doctors
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Doctor card */}
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-start gap-4">
              {doctor.avatar_url ? (
                <img
                  src={doctor.avatar_url}
                  alt={doctor.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-border"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-teal-light text-teal font-bold text-xl flex items-center justify-center flex-shrink-0">
                  {initials}
                </div>
              )}

              <div className="flex-1">
                <h1 className="font-serif text-xl font-semibold text-ink">
                  {doctor.name}
                </h1>
                <p className="text-sm text-ink-mid mt-0.5">
                  {doctor.specialties?.join(", ") || "General Medicine"}
                </p>

                {/* Quick stats */}
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    <span className="text-amber">★</span>
                    <span className="text-sm font-medium text-ink">
                      {doctor.rating_avg
                        ? doctor.rating_avg.toFixed(1)
                        : "New"}
                    </span>
                    <span className="text-xs text-ink-light">
                      ({doctor.rating_count} review
                      {doctor.rating_count !== 1 ? "s" : ""})
                    </span>
                  </div>

                  {/* Experience */}
                  {doctor.experience_years && (
                    <span className="text-xs text-ink-mid">
                      📅 {doctor.experience_years} yrs
                    </span>
                  )}

                  {/* Fee */}
                  {doctor.fee_inr && (
                    <span className="text-xs font-medium text-teal bg-teal-light px-2 py-0.5 rounded-full">
                      ₹{doctor.fee_inr} / session
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          {doctor.bio && (
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="text-sm font-semibold text-ink mb-2">About</h2>
              <p className="text-sm text-ink-mid leading-relaxed">
                {doctor.bio}
              </p>
            </div>
          )}

          {/* Details */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="text-sm font-semibold text-ink mb-3">Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {doctor.qualification && (
                <div>
                  <p className="text-[10px] text-ink-light uppercase tracking-wider">
                    Qualification
                  </p>
                  <p className="text-sm text-ink">{doctor.qualification}</p>
                </div>
              )}
              {doctor.languages && doctor.languages.length > 0 && (
                <div>
                  <p className="text-[10px] text-ink-light uppercase tracking-wider">
                    Languages
                  </p>
                  <p className="text-sm text-ink">
                    {doctor.languages.join(", ")}
                  </p>
                </div>
              )}
              {doctor.license_no && (
                <div>
                  <p className="text-[10px] text-ink-light uppercase tracking-wider">
                    License No.
                  </p>
                  <p className="text-sm text-ink">{doctor.license_no}</p>
                </div>
              )}
              {doctor.experience_years && (
                <div>
                  <p className="text-[10px] text-ink-light uppercase tracking-wider">
                    Experience
                  </p>
                  <p className="text-sm text-ink">
                    {doctor.experience_years} years
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="text-sm font-semibold text-ink mb-4">
              Patient Reviews
            </h2>
            {!reviews || reviews.length === 0 ? (
              <p className="text-xs text-ink-light">No reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => {
                  const patientProfile = review.patient_profiles as { name: string } | null;
                  return (
                    <div
                      key={review.id}
                      className="border-b border-border pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span
                              key={i}
                              className={`text-xs ${i < review.score ? "text-amber" : "text-gray-300"}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-[10px] text-ink-light">
                          {new Date(review.created_at).toLocaleDateString(
                            "en-IN",
                            { month: "short", year: "numeric" }
                          )}
                        </span>
                      </div>
                      {review.review && (
                        <p className="text-xs text-ink-mid leading-relaxed">
                          &quot;{review.review}&quot;
                        </p>
                      )}
                      <p className="text-[10px] text-ink-light mt-1">
                        — {patientProfile?.name || "Anonymous"}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* CTA */}
          <div className="bg-white rounded-xl border border-border p-6 text-center">
            <p className="text-sm font-medium text-ink mb-1">
              Ready to consult?
            </p>
            <p className="text-xs text-ink-light mb-4">
              {doctor.fee_inr
                ? `₹${doctor.fee_inr} per session`
                : "Contact for fee details"}
            </p>
            <Link
              href={`/doctors/${doctor.id}/book`}
              className="block w-full py-2.5 px-4 bg-teal hover:bg-teal-dark text-white font-medium text-sm rounded-lg shadow-sm transition-colors no-underline text-center"
            >
              Book Appointment
            </Link>
          </div>

          {/* Availability Preview */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h3 className="text-sm font-semibold text-ink mb-3">
              Weekly Availability
            </h3>
            {Object.keys(availability).length === 0 ? (
              <p className="text-xs text-ink-light">
                No availability set yet.
              </p>
            ) : (
              <div className="space-y-2">
                {DAY_NAMES.map((day) => {
                  const slots = availability[day];
                  if (!slots || slots.length === 0) return null;
                  return (
                    <div key={day} className="flex items-start gap-2">
                      <span className="text-xs font-medium text-ink w-8">
                        {DAY_LABELS[day]}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {slots.map((slot, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-teal-light text-teal-dark px-1.5 py-0.5 rounded"
                          >
                            {slot.start}–{slot.end}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
