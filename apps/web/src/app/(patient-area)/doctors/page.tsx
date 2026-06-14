import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";


interface SearchParams {
  q?: string;
  specialty?: string;
  language?: string;
  rating?: string;
  page?: string;
}

export default async function DoctorsListPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  if (!supabase) redirect("/auth/login");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const searchQuery = params.q || "";
  const specialtyFilter = params.specialty || "";
  const languageFilter = params.language || "";
  const minRating = parseInt(params.rating || "0", 10);
  const page = parseInt(params.page || "1", 10);
  const perPage = 12;
  const offset = (page - 1) * perPage;

  // Build query
  let query = supabase
    .from("doctor_profiles")
    .select("id, user_id, name, specialties, languages, qualification, experience_years, bio, fee_inr, rating_avg, rating_count, is_verified, avatar_url", { count: "exact" })
    .eq("is_verified", true)
    .order("rating_avg", { ascending: false })
    .range(offset, offset + perPage - 1);

  if (searchQuery) {
    query = query.or(
      `name.ilike.%${searchQuery}%,specialties.cs.{${searchQuery}}`
    );
  }

  if (specialtyFilter) {
    query = query.contains("specialties", [specialtyFilter]);
  }

  if (languageFilter) {
    query = query.contains("languages", [languageFilter]);
  }

  if (minRating > 0) {
    query = query.gte("rating_avg", minRating);
  }

  const { data: doctors, count } = await query;
  const totalPages = Math.ceil((count || 0) / perPage);

  // Get unique specialties and languages for filter options
  const { data: allDoctors } = await supabase
    .from("doctor_profiles")
    .select("specialties, languages")
    .eq("is_verified", true);

  const allSpecialties = [
    ...new Set((allDoctors || []).flatMap((d) => d.specialties || [])),
  ].sort();
  const allLanguages = [
    ...new Set((allDoctors || []).flatMap((d) => d.languages || [])),
  ].sort();

  // Build filter URL helper
  function filterUrl(overrides: Partial<SearchParams>) {
    const p = new URLSearchParams();
    const merged = { q: searchQuery, specialty: specialtyFilter, language: languageFilter, rating: minRating.toString(), page: "1", ...overrides };
    if (merged.q) p.set("q", merged.q);
    if (merged.specialty) p.set("specialty", merged.specialty);
    if (merged.language) p.set("language", merged.language);
    if (merged.rating && merged.rating !== "0") p.set("rating", merged.rating);
    if (merged.page && merged.page !== "1") p.set("page", merged.page);
    const qs = p.toString();
    return `/doctors${qs ? `?${qs}` : ""}`;
  }

  const hasFilters = searchQuery || specialtyFilter || languageFilter || minRating > 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-semibold text-ink">
          Find Doctors
        </h1>
        <p className="text-sm text-ink-mid mt-1">
          Browse verified doctors across Himachal Pradesh.
        </p>
      </div>

      {/* Search + Filters */}
      <div className="bg-white rounded-xl border border-border p-4 mb-6">
        <form className="space-y-3">
          {/* Search bar */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-light text-sm">
              🔍
            </span>
            <input
              name="q"
              type="text"
              defaultValue={searchQuery}
              placeholder="Search by name or specialty..."
              className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-sm text-ink bg-off-white outline-none focus:border-teal transition-all"
            />
          </div>

          {/* Filter row */}
          <div className="flex flex-wrap gap-2">
            <select
              name="specialty"
              defaultValue={specialtyFilter}
              className="px-3 py-1.5 border border-border rounded-lg text-xs text-ink bg-off-white outline-none focus:border-teal"
            >
              <option value="">All Specialties</option>
              {allSpecialties.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              name="language"
              defaultValue={languageFilter}
              className="px-3 py-1.5 border border-border rounded-lg text-xs text-ink bg-off-white outline-none focus:border-teal"
            >
              <option value="">All Languages</option>
              {allLanguages.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>

            <select
              name="rating"
              defaultValue={minRating.toString()}
              className="px-3 py-1.5 border border-border rounded-lg text-xs text-ink bg-off-white outline-none focus:border-teal"
            >
              <option value="0">Any Rating</option>
              <option value="3">3+ Stars</option>
              <option value="4">4+ Stars</option>
              <option value="5">5 Stars</option>
            </select>

            <button
              type="submit"
              className="px-4 py-1.5 bg-teal text-white text-xs font-medium rounded-lg hover:bg-teal-dark transition-colors cursor-pointer"
            >
              Search
            </button>

            {hasFilters && (
              <Link
                href="/doctors"
                className="px-4 py-1.5 text-xs text-ink-mid font-medium rounded-lg border border-border hover:bg-off-white transition-colors no-underline"
              >
                Clear Filters
              </Link>
            )}
          </div>
        </form>
      </div>

      {/* Results */}
      {(!doctors || doctors.length === 0) ? (
        <div className="bg-white rounded-xl border border-border p-12 text-center">
          <span className="text-4xl mb-3 block">🔍</span>
          <p className="text-sm text-ink-mid font-medium">
            No doctors found
          </p>
          <p className="text-xs text-ink-light mt-1 mb-4">
            Try adjusting your search or filters.
          </p>
          {hasFilters && (
            <Link
              href="/doctors"
              className="inline-block px-4 py-2 bg-teal text-white text-xs font-medium rounded-lg hover:bg-teal-dark transition-colors no-underline"
            >
              Clear Filters
            </Link>
          )}
        </div>
      ) : (
        <>
          <p className="text-xs text-ink-light mb-4">
            Showing {doctors.length} of {count} verified doctor
            {count !== 1 ? "s" : ""}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctors.map((doc) => {
              const initials = doc.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              return (
                <Link
                  key={doc.id}
                  href={`/doctors/${doc.id}`}
                  className="bg-white rounded-xl border border-border p-5 hover:shadow-lg hover:border-teal/30 transition-all no-underline group"
                >
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-3">
                    {doc.avatar_url ? (
                      <img
                        src={doc.avatar_url}
                        alt={doc.name}
                        className="w-12 h-12 rounded-full object-cover border border-border"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-teal-light text-teal font-semibold text-sm flex items-center justify-center">
                        {initials}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink truncate group-hover:text-teal transition-colors">
                        {doc.name}
                      </p>
                      <p className="text-xs text-ink-light truncate">
                        {doc.specialties?.join(", ") || "General"}
                      </p>
                    </div>
                  </div>

                  {/* Rating + Fee */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                      <span className="text-amber text-xs">★</span>
                      <span className="text-xs font-medium text-ink">
                        {doc.rating_avg
                          ? doc.rating_avg.toFixed(1)
                          : "New"}
                      </span>
                      {doc.rating_count > 0 && (
                        <span className="text-[10px] text-ink-light">
                          ({doc.rating_count})
                        </span>
                      )}
                    </div>
                    {doc.fee_inr && (
                      <span className="text-xs font-medium text-teal">
                        ₹{doc.fee_inr}
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5">
                    {doc.qualification && (
                      <p className="text-[10px] text-ink-mid truncate">
                        🎓 {doc.qualification}
                      </p>
                    )}
                    {doc.experience_years && (
                      <p className="text-[10px] text-ink-mid">
                        📅 {doc.experience_years} years experience
                      </p>
                    )}
                    {doc.languages && doc.languages.length > 0 && (
                      <p className="text-[10px] text-ink-mid">
                        🗣️ {doc.languages.join(", ")}
                      </p>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="mt-4 pt-3 border-t border-border">
                    <span className="text-xs font-medium text-teal group-hover:underline">
                      View Profile & Book →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {page > 1 && (
                <Link
                  href={filterUrl({ page: (page - 1).toString() })}
                  className="px-3 py-1.5 text-xs font-medium text-ink-mid border border-border rounded-lg hover:bg-off-white transition-colors no-underline"
                >
                  ← Previous
                </Link>
              )}
              <span className="text-xs text-ink-light">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={filterUrl({ page: (page + 1).toString() })}
                  className="px-3 py-1.5 text-xs font-medium text-teal border border-teal rounded-lg hover:bg-teal-light transition-colors no-underline"
                >
                  Next →
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
