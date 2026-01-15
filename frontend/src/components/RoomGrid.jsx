import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import RoomCard from "./RoomCard";

export default function RoomGrid({
  rooms,
  isLoading,
  error,
  showFreeRooms,
  onRoomClick,
  onRetry,
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 sm:py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="loader"></div>
          <p className="text-xs sm:text-sm text-[var(--color-light)]/70">
            Loading rooms...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8 sm:py-12">
        <div className="flex flex-col items-center gap-4 text-center px-4">
          <AlertCircle className="h-7 w-7 sm:h-8 sm:w-8 text-red-400" />
          <p className="text-xs sm:text-sm text-red-400 font-medium">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="border-[var(--color-blue)]/60 text-[var(--color-light)] hover:bg-[var(--color-blue)]/15"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 sm:py-12">
        <p className="text-xs sm:text-sm text-[var(--color-light)]/70 px-4 text-center">
          No rooms found{showFreeRooms ? " that are currently free" : ""}.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {rooms.map((room, index) => (
        <div
          key={room.id}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <RoomCard
            room={room}
            onClick={onRoomClick}
            minimal={!showFreeRooms}
          />
        </div>
      ))}
    </div>
  );
}
