"use client";

import { useRouter } from "next/navigation";

interface VideoRoomProps {
  remoteName: string;
  role: "doctor" | "patient";
  appointmentId: string;
}

export default function VideoRoomClient({ remoteName, role, appointmentId }: VideoRoomProps) {
  const router = useRouter();

  const handleEndCall = () => {
    const redirect = role === "doctor" ? `/doctor/appointments/${appointmentId}/patient` : "/dashboard";
    router.push(redirect);
    router.refresh();
  };

  // Construct Jitsi Meet URL
  // We use a clean layout without their external UI elements to make it look embedded
  const domain = "meet.jit.si";
  const roomName = `aarogya-consult-${appointmentId}`;
  
  // Configure Jitsi to look cleaner in our iframe
  const config = {
    disableDeepLinking: true,
    prejoinPageEnabled: false,
    headerLogoUrl: "",
    hideLobbyButton: true,
    hideConferenceTimer: false,
  };
  
  const interfaceConfig = {
    HIDE_DEEP_LINKING_LOGO: true,
    SHOW_JITSI_WATERMARK: false,
    SHOW_WATERMARK_FOR_GUESTS: false,
    SHOW_BRAND_WATERMARK: false,
    TOOLBAR_BUTTONS: [
      'microphone', 'camera', 'desktop', 'fullscreen',
      'fodeviceselection', 'hangup', 'chat', 'settings',
      'videoquality', 'tileview', 'mute-everyone',
    ],
  };

  const urlObj = new URL(`https://${domain}/${roomName}`);
  urlObj.hash = `config.disableDeepLinking=true&config.prejoinPageEnabled=false&interfaceConfig.SHOW_JITSI_WATERMARK=false&interfaceConfig.SHOW_WATERMARK_FOR_GUESTS=false`;

  return (
    <div className="relative w-full flex flex-col" style={{ height: "70vh", minHeight: "500px" }}>
      {/* Jitsi Iframe */}
      <div className="flex-1 w-full h-full bg-gray-900">
        <iframe
          src={urlObj.toString()}
          allow="camera; microphone; fullscreen; display-capture; autoplay"
          className="w-full h-full border-0"
          title={`Consultation with ${remoteName}`}
        />
      </div>

      {/* Custom Control Bar (Bottom) */}
      <div className="h-16 bg-black/95 border-t border-white/10 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${
            role === "doctor" 
              ? "bg-teal/20 text-teal border border-teal/30" 
              : "bg-amber/20 text-amber border border-amber/30"
          }`}>
            {role === "doctor" ? "🩺 Host" : "👤 Patient"}
          </span>
          <span className="text-white/60 text-xs">Consultation with {remoteName}</span>
        </div>

        <div>
          <button
            onClick={handleEndCall}
            className="px-6 h-10 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-all cursor-pointer shadow-lg"
          >
            Leave Room
          </button>
        </div>
      </div>
    </div>
  );
}
