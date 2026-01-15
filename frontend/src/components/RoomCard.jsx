import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, CheckCircle2, XCircle } from "lucide-react";

const statusConfig = {
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

function StatusBadge({ status }) {
  const config = statusConfig[status];
  return (
    <Badge
      variant="outline"
      className={`${config.bgClass} ${config.borderClass} ${config.colorClass} gap-1 sm:gap-1.5 text-xs sm:text-sm`}
    >
      <span>{config.emoji}</span>
      <span>{config.label}</span>
    </Badge>
  );
}

export default function RoomCard({ room, onClick, minimal }) {
  const config = statusConfig[room.status] || statusConfig["occupied"];
  const StatusIcon = config.icon;

  return (
    <Card
      className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-2 ${config.borderClass} bg-[var(--color-navy)]/80 backdrop-blur-md`}
      onClick={() => onClick(room)}
    >
      <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3 text-[var(--color-light)]">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-base sm:text-lg truncate">
            {room.name}
          </h3>
        </div>
        {!minimal && (
          <>
            <div className="flex items-start justify-between">
              <StatusBadge status={room.status} />
              <StatusIcon
                className={`h-4 w-4 sm:h-5 sm:w-5 ${config.colorClass} ${
                  room.status === "available" ? "animate-pulse-glow" : ""
                }`}
              />
            </div>
            {room.status === "available" && room.freeFor > 0 && (
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground" />
                <span>
                  Free for <strong>{room.freeFor} mins</strong>
                </span>
              </div>
            )}
            {room.reason && (
              <p className="text-xs text-muted-foreground italic truncate">
                "{room.reason}"
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
