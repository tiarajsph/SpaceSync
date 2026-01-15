import { CheckCircle2, XCircle } from "lucide-react";

// Transform backend room data to frontend format
export function transformRoom(backendRoom) {
  return {
    id: backendRoom.id,
    name: backendRoom.room_id || backendRoom.name || `Room ${backendRoom.id}`,
    status: backendRoom.status || "occupied", // Only "available" or "occupied"
    freeFor:
      backendRoom.freeFor || (backendRoom.status === "available" ? 60 : 0),
    reason: backendRoom.reason || null,
    confidence:
      backendRoom.confidence || (backendRoom.status === "available" ? 85 : 100),
    current_booking_id: backendRoom.current_booking_id || null,
  };
}

// Status configuration
export const statusConfig = {
  available: {
    icon: CheckCircle2,
    label: "Available",
    emoji: "🟢",
    colorClass: "text-status-available",
    bgClass: "bg-status-available/20",
    borderClass: "border-status-available/50",
  },
  occupied: {
    icon: XCircle,
    label: "Occupied",
    emoji: "🔴",
    colorClass: "text-status-occupied",
    bgClass: "bg-status-occupied/20",
    borderClass: "border-status-occupied/50",
  },
};
