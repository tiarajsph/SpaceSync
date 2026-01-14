import { useState } from "react";
import {
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import RoomCard from "../components/RoomCard.jsx";
const initialRooms = [
  { id: 1, name: "A-204", status: "available", freeFor: 45 },
  { id: 2, name: "A-205", status: "unverified", freeFor: 32 },
  { id: 3, name: "B-101", status: "occupied", freeFor: 0 },
  { id: 4, name: "B-102", status: "available", freeFor: 60 },
];

const statusConfig = {
  available: {
    icon: CheckCircle2,
    label: "Available",
    color: "text-green-600",
  },
  unverified: {
    icon: AlertCircle,
    label: "Unverified",
    color: "text-yellow-500",
  },
  occupied: { icon: XCircle, label: "Occupied", color: "text-red-600" },
};

export default function Dashboard() {
  const [rooms] = useState(initialRooms);
  return (
    <div
      className="min-h-screen p-8"
      style={{ backgroundColor: "var(--color-dark)" }}
    >
      <h1 className="text-2xl font-bold mb-6 text-white">Room Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>
    </div>
  );
}
