"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function StartCallButton({
  appointmentId,
  patientUserId,
  doctorName,
}: {
  appointmentId: string;
  patientUserId: string;
  doctorName: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [isCalling, setIsCalling] = useState(false);

  const handleStartCall = async () => {
    setIsCalling(true);

    // Send a ring broadcast to the patient
    const channel = supabase.channel(`user-${patientUserId}`);
    await channel.send({
      type: "broadcast",
      event: "ring",
      payload: {
        doctorName,
        appointmentId,
      },
    });

    // Navigate to the video room
    router.push(`/doctor/video-room/${appointmentId}`);
  };

  return (
    <button
      onClick={handleStartCall}
      disabled={isCalling}
      className="px-3 py-1.5 bg-teal hover:bg-teal-dark text-white text-xs font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50"
    >
      {isCalling ? "Calling..." : "Start Call 📹"}
    </button>
  );
}
