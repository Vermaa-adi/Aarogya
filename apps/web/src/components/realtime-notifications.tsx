"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface RealtimeNotificationsProps {
  userId: string;
  role: "DOCTOR" | "PATIENT";
  profileId?: string; // Optional, useful if we want to listen to specific profile records
}

export default function RealtimeNotifications({
  userId,
  role,
  profileId,
}: RealtimeNotificationsProps) {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (!supabase) return;

    // 1. Listen for Broadcast messages (like "Ringing")
    const channel = supabase.channel(`user-${userId}`);

    channel.on(
      "broadcast",
      { event: "ring" },
      (payload) => {
        const { doctorName, appointmentId } = payload.payload;

        // Custom toast with a Join Call action
        toast(
          (t) => (
            <div className="flex flex-col gap-2">
              <p className="font-semibold text-ink">Incoming Call!</p>
              <p className="text-sm text-ink-mid">
                {doctorName} is calling you for your consultation.
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => {
                    toast.dismiss(t.id);
                    router.push(`/video-room/${appointmentId}`);
                  }}
                  className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-medium transition-colors w-full"
                >
                  Join Call
                </button>
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-colors"
                >
                  Ignore
                </button>
              </div>
            </div>
          ),
          { duration: 30000, position: "top-right", style: { border: '1px solid #14b8a6', padding: '16px' } }
        );
      }
    );

    // 2. Listen to Database Changes on the appointments table
    if (profileId) {
      const dbChannel = supabase.channel("appointments-db-changes");

      dbChannel
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "appointments",
            filter:
              role === "DOCTOR"
                ? `doctor_id=eq.${profileId}`
                : `patient_id=eq.${profileId}`,
          },
          (payload) => {
            if (role === "DOCTOR") {
              toast.success("New appointment request received!", {
                icon: "🔔",
                position: "top-right",
              });
              router.refresh();
            }
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "appointments",
            filter:
              role === "DOCTOR"
                ? `doctor_id=eq.${profileId}`
                : `patient_id=eq.${profileId}`,
          },
          (payload) => {
            const newRecord = payload.new;
            const oldRecord = payload.old;

            if (newRecord.status !== oldRecord.status) {
              if (role === "DOCTOR" && newRecord.status === "CANCELLED") {
                toast.error("A patient cancelled their appointment.", {
                  icon: "⚠️",
                  position: "top-right",
                });
                router.refresh();
              }

              if (role === "PATIENT" && newRecord.status === "CONFIRMED") {
                toast.success("Your appointment has been confirmed!", {
                  icon: "✅",
                  position: "top-right",
                });
                router.refresh();
              }
            }
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "consult_notes",
            filter:
              role === "PATIENT"
                ? `patient_id=eq.${profileId}`
                : undefined,
          },
          (payload) => {
            if (role === "PATIENT") {
              toast.success("Doctor has added/updated your prescription and notes.", {
                icon: "📝",
                position: "top-right",
              });
              router.refresh();
            }
          }
        )
        .subscribe();

      channel.subscribe();

      return () => {
        supabase.removeChannel(channel);
        supabase.removeChannel(dbChannel);
      };
    } else {
      channel.subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [supabase, userId, role, profileId, router]);

  return null; // This is a logic-only component
}
