import { useState, useEffect } from "react";
import RoomCard from "@/components/RoomCard";
import RoomDetailDrawer from "@/components/RoomDetailDrawer";
import ClaimRoomDialog from "@/components/ClaimRoomDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import {
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Radio,
} from "lucide-react";

// Mock room data
const initialRooms = [
  {
    id: 1,
    name: "A-204",
    status: "available",
    freeFor: 45,
    reason: null,
    confidence: 92,
  },
  {
    id: 2,
    name: "A-205",
    status: "unverified",
    freeFor: 32,
    reason: "Last class ended",
    confidence: 65,
  },
  {
    id: 3,
    name: "B-101",
    status: "occupied",
    freeFor: 0,
    reason: "Batch in Lab",
    confidence: 100,
  },
  {
    id: 4,
    name: "B-102",
    status: "available",
    freeFor: 60,
    reason: null,
    confidence: 88,
  },
  {
    id: 5,
    name: "C-301",
    status: "unverified",
    freeFor: 15,
    reason: "Schedule gap",
    confidence: 45,
  },
  {
    id: 6,
    name: "C-302",
    status: "available",
    freeFor: 90,
    reason: null,
    confidence: 95,
  },
  {
    id: 7,
    name: "D-401",
    status: "occupied",
    freeFor: 0,
    reason: "Club Meeting",
    confidence: 100,
  },
  {
    id: 8,
    name: "D-402",
    status: "available",
    freeFor: 28,
    reason: null,
    confidence: 78,
  },
  {
    id: 9,
    name: "E-101",
    status: "unverified",
    freeFor: 50,
    reason: "No recent activity",
    confidence: 55,
  },
];

// Status configuration
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

// Live Clock Component
function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <Clock className="h-4 w-4 text-primary" />
      <span className="font-mono text-sm">
        {time.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    </div>
  );
}

// Status Badge Component
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

// Confidence Indicator Component
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

// RoomCard, RoomDetailDrawer, and ClaimRoomDialog are now imported
// from src/components to keep this page focused on data and state.

// Top Navigation Component
function TopNav() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--color-blue)]/40 bg-[var(--color-navy)]/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Center - Live Status */}
        <div className="flex items-center gap-3">
          <LiveClock />
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <Radio className="h-3 w-3 text-status-available animate-pulse-glow" />
            <span className="text-muted-foreground">Live Campus View</span>
          </div>
        </div>
      </div>
    </header>
  );
}

// Main Dashboard Component
export default function Dashboard() {
  const [rooms, setRooms] = useState(initialRooms);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false);
  const [userRole] = useState("clubLead"); // Mock: could be "student" or "clubLead"

  const handleRoomClick = (room) => {
    setSelectedRoom(room);
    setIsDrawerOpen(true);
  };

  const handleConfirmAvailability = (room) => {
    setRooms((prev) =>
      prev.map((r) =>
        r.id === room.id ? { ...r, status: "available", confidence: 100 } : r
      )
    );
    setIsDrawerOpen(false);
  };

  const handleOpenClaimDialog = (room) => {
    setIsDrawerOpen(false);
    setTimeout(() => {
      setSelectedRoom(room);
      setIsClaimDialogOpen(true);
    }, 300);
  };

  const handleClaimRoom = (room, duration, purpose) => {
    setRooms((prev) =>
      prev.map((r) =>
        r.id === room.id
          ? {
              ...r,
              status: "occupied",
              freeFor: 0,
              reason: purpose || "Club Activity",
              confidence: 100,
            }
          : r
      )
    );
  };

  // Count rooms by status
  const statusCounts = rooms.reduce(
    (acc, room) => {
      acc[room.status]++;
      return acc;
    },
    { available: 0, unverified: 0, occupied: 0 }
  );

  return (
    <div className="min-h-screen bg-background">
      <TopNav />

      <main className="container px-4 py-6">
        {/* Status Summary */}
        <div className="flex flex-wrap gap-3 mb-6">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div
              key={status}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${statusConfig[status].bgClass} border ${statusConfig[status].borderClass} text-[var(--color-light)]`}
            >
              <span>{statusConfig[status].emoji}</span>
              <span className="text-sm font-medium">
                {count} {statusConfig[status].label}
              </span>
            </div>
          ))}
        </div>

        {/* Room Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {rooms.map((room, index) => (
            <div
              key={room.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <RoomCard room={room} onClick={handleRoomClick} />
            </div>
          ))}
        </div>
      </main>

      {/* Room Detail Drawer */}
      <RoomDetailDrawer
        room={selectedRoom}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onConfirm={handleConfirmAvailability}
        onClaim={handleOpenClaimDialog}
        userRole={userRole}
      />

      {/* Claim Room Dialog */}
      <ClaimRoomDialog
        room={selectedRoom}
        isOpen={isClaimDialogOpen}
        onClose={() => setIsClaimDialogOpen(false)}
        onSubmit={handleClaimRoom}
      />
    </div>
  );
}
