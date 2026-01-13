import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";

const statusConfig = {
  available: {
    icon: CheckCircle2,
    label: "Available",
    emoji: "🟢",
    colorClass: "text-status-available",
    bgClass: "bg-status-available/20",
    borderClass: "border-status-available/50",
  },
  unverified: {
    icon: AlertCircle,
    label: "Unverified",
    emoji: "🟡",
    colorClass: "text-status-unverified",
    bgClass: "bg-status-unverified/20",
    borderClass: "border-status-unverified/50",
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
      className={`${config.bgClass} ${config.borderClass} ${config.colorClass} gap-1.5`}
    >
      <span>{config.emoji}</span>
      <span>{config.label}</span>
    </Badge>
  );
}

function ConfidenceIndicator({ confidence }) {
  const getConfidenceColor = (value) => {
    if (value >= 80) return "bg-status-available";
    if (value >= 50) return "bg-status-unverified";
    return "bg-status-occupied";
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">Verification Confidence</span>
        <span className="font-medium">{confidence}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full ${getConfidenceColor(
            confidence
          )} transition-all duration-500`}
          style={{ width: `${confidence}%` }}
        />
      </div>
    </div>
  );
}

export default function RoomDetailDrawer({
  room,
  isOpen,
  onClose,
  onConfirm,
  onClaim,
  userRole,
}) {
  if (!room) return null;

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="bg-[var(--color-navy)]/95 border-t-2 border-[var(--color-blue)] text-[var(--color-light)] backdrop-blur-md">
        <div className="mx-auto w-full max-w-lg">
          <DrawerHeader className="text-left">
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-2xl flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Room {room.name}
              </DrawerTitle>
              <StatusBadge status={room.status} />
            </div>
            <DrawerDescription className="text-muted-foreground">
              {room.status === "occupied"
                ? `Currently in use: ${room.reason}`
                : room.status === "unverified"
                ? "Status needs verification"
                : "Room appears to be available"}
            </DrawerDescription>
          </DrawerHeader>

          <div className="p-4 space-y-6">
            <ConfidenceIndicator confidence={room.confidence} />

            {room.freeFor > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Available Duration</p>
                  <p className="text-sm text-muted-foreground">
                    Free for approximately {room.freeFor} minutes
                  </p>
                </div>
              </div>
            )}

            {room.reason && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Status Reason</p>
                  <p className="text-sm text-muted-foreground">{room.reason}</p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 pt-4">
              {room.status !== "occupied" && (
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => onConfirm(room)}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Confirm Availability
                </Button>
              )}

              {userRole === "clubLead" && room.status !== "occupied" && (
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full"
                  onClick={() => onClaim(room)}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Claim Room
                </Button>
              )}

              <Button
                size="lg"
                variant="outline"
                className="w-full"
                onClick={onClose}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
