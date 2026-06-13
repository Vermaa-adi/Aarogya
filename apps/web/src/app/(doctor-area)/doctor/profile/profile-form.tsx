"use client";

import { useActionState, useEffect, useState } from "react";
import { updateDoctorProfile } from "./actions";

type Availability = Record<string, { start: string; end: string }[]>;

export default function DoctorProfileForm({ profile }: { profile: {
  user_id: string;
  name: string;
  bio: string | null;
  fee_inr: number | null;
  experience_years: number | null;
  availability: Availability;
  avatar_url: string | null;
  users: { email: string } | null;
} }) {
  const [state, formAction, isPending] = useActionState(updateDoctorProfile, null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url);

  const [availability, setAvailability] = useState<Availability>(
    profile.availability || {}
  );

  const DAY_NAMES = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  useEffect(() => {
    if (state?.success) {
      // Defer state update to avoid synchronous cascading renders warning
      const id = setTimeout(() => setShowSuccess(true), 0);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => {
        clearTimeout(id);
        clearTimeout(timer);
      };
    }
  }, [state]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const addTimeBlock = (day: string) => {
    const dayBlocks = availability[day] || [];
    setAvailability({
      ...availability,
      [day]: [...dayBlocks, { start: "09:00", end: "17:00" }]
    });
  };

  const updateTimeBlock = (day: string, index: number, field: "start"|"end", value: string) => {
    const dayBlocks = [...(availability[day] || [])];
    dayBlocks[index] = { ...dayBlocks[index], [field]: value };
    setAvailability({ ...availability, [day]: dayBlocks });
  };

  const removeTimeBlock = (day: string, index: number) => {
    const dayBlocks = [...(availability[day] || [])];
    dayBlocks.splice(index, 1);
    setAvailability({ ...availability, [day]: dayBlocks });
  };

  return (
    <form action={formAction} className="space-y-8">
      {state?.message && !state.success && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {state.message}
        </div>
      )}
      {showSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">
          Profile updated successfully!
        </div>
      )}

      {/* Avatar & Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <label className="block text-sm font-semibold text-ink mb-3">Profile Picture</label>
          <div className="flex flex-col items-start gap-4">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar Preview" className="w-24 h-24 rounded-full object-cover border-2 border-border" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-off-white border-2 border-dashed border-border flex items-center justify-center text-2xl text-ink-light">
                👤
              </div>
            )}
            <div>
              <input
                type="file"
                name="avatar"
                id="avatar"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <label
                htmlFor="avatar"
                className="inline-block px-4 py-2 bg-white border border-border hover:bg-off-white text-ink-mid text-xs font-medium rounded-lg cursor-pointer transition-colors"
              >
                Change Picture
              </label>
            </div>
            <p className="text-[10px] text-ink-light">JPG, PNG or WebP. Max 2MB.</p>
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink-mid mb-1">Full Name</label>
            <input type="text" disabled value={profile.name} className="w-full px-3 py-2 border border-border rounded-lg text-sm text-ink bg-gray-50 cursor-not-allowed" />
            <p className="text-[10px] text-ink-light mt-1">Name cannot be changed directly after verification.</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-mid mb-1">Email</label>
            <input type="email" disabled value={profile.users?.email || ""} className="w-full px-3 py-2 border border-border rounded-lg text-sm text-ink bg-gray-50 cursor-not-allowed" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="experience_years" className="block text-xs font-medium text-ink-mid mb-1">Experience (Years)</label>
              <input 
                type="number" 
                id="experience_years" 
                name="experience_years" 
                defaultValue={profile.experience_years || ""} 
                min={0}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm text-ink bg-off-white outline-none focus:border-teal transition-all" 
              />
            </div>
            <div>
              <label htmlFor="fee_inr" className="block text-xs font-medium text-ink-mid mb-1">Consultation Fee (₹)</label>
              <input 
                type="number" 
                id="fee_inr" 
                name="fee_inr" 
                defaultValue={profile.fee_inr || ""} 
                min={0}
                step={50}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm text-ink bg-off-white outline-none focus:border-teal transition-all" 
              />
            </div>
          </div>
        </div>
      </div>

      <hr className="border-border" />

      {/* Bio */}
      <div>
        <label htmlFor="bio" className="block text-sm font-semibold text-ink mb-2">Professional Bio</label>
        <p className="text-xs text-ink-mid mb-3">Write a short introduction to help patients know you better.</p>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          defaultValue={profile.bio || ""}
          placeholder="E.g., Dr. Smith is an experienced cardiologist with over 15 years..."
          className="w-full px-3 py-2 border border-border rounded-lg text-sm text-ink bg-off-white outline-none focus:border-teal transition-all resize-none"
        />
      </div>

      <hr className="border-border" />

      {/* Availability Editor */}
      <div>
        <label className="block text-sm font-semibold text-ink mb-2">Weekly Schedule</label>
        <p className="text-xs text-ink-mid mb-4">Set your recurring weekly availability. Patients will only be able to book slots within these hours.</p>
        
        {/* Hidden input to submit the JSON data */}
        <input type="hidden" name="availability" value={JSON.stringify(availability)} />

        <div className="space-y-3">
          {DAY_NAMES.map((day) => {
            const dayBlocks = availability[day] || [];
            
            return (
              <div key={day} className="flex flex-col sm:flex-row sm:items-start gap-4 p-4 border border-border rounded-xl bg-off-white/50">
                <div className="w-32 flex-shrink-0 pt-1">
                  <span className="text-sm font-medium text-ink capitalize">{day}</span>
                </div>
                
                <div className="flex-1 space-y-2">
                  {dayBlocks.length === 0 ? (
                    <p className="text-xs text-ink-light py-1.5">Unavailable</p>
                  ) : (
                    dayBlocks.map((block, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="time"
                          value={block.start}
                          onChange={(e) => updateTimeBlock(day, idx, "start", e.target.value)}
                          className="px-2 py-1 bg-white border border-border rounded text-xs outline-none focus:border-teal"
                        />
                        <span className="text-ink-light text-xs">to</span>
                        <input
                          type="time"
                          value={block.end}
                          onChange={(e) => updateTimeBlock(day, idx, "end", e.target.value)}
                          className="px-2 py-1 bg-white border border-border rounded text-xs outline-none focus:border-teal"
                        />
                        <button
                          type="button"
                          onClick={() => removeTimeBlock(day, idx)}
                          className="ml-2 w-6 h-6 flex items-center justify-center rounded-full text-red-500 hover:bg-red-50 transition-colors"
                          title="Remove block"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                  
                  <button
                    type="button"
                    onClick={() => addTimeBlock(day)}
                    className="text-xs font-medium text-teal hover:text-teal-dark flex items-center gap-1 mt-2 transition-colors"
                  >
                    <span className="text-lg leading-none">+</span> Add Hours
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-6">
        <button
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto px-6 py-2.5 bg-teal hover:bg-teal-dark disabled:bg-teal-mid/50 text-white font-medium text-sm rounded-lg shadow-sm focus:outline-none transition-colors cursor-pointer"
        >
          {isPending ? "Saving Changes..." : "Save Profile"}
        </button>
      </div>
    </form>
  );
}
