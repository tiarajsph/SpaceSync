import { Button } from "@/components/ui/button";
import { Search, Upload as UploadIcon } from "lucide-react";

export default function RoomActionsBar({
  showFreeRooms,
  onFindFreeRooms,
  onUploadClick,
  roomsCount,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
      <p className="text-xs sm:text-sm text-[var(--color-light)]">
        Showing {roomsCount} room{roomsCount !== 1 ? "s" : ""}
        {showFreeRooms && ` (free available)`}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={showFreeRooms ? "default" : "outline"}
          size="sm"
          className={
            showFreeRooms
              ? "bg-[var(--color-blue)] text-[var(--color-dark)] hover:bg-[var(--color-blue)]/90 text-xs sm:text-sm"
              : "text-[var(--color-light)] text-xs sm:text-sm"
          }
          onClick={onFindFreeRooms}
        >
          <Search className="h-4 w-4 mr-1" />
          <span className="hidden xs:inline">Find</span> Free Rooms
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="text-[var(--color-light)] text-xs sm:text-sm"
          onClick={onUploadClick}
        >
          <UploadIcon className="h-4 w-4 mr-1" />
          <span className="hidden xs:inline">Upload</span> TimeTable
        </Button>
      </div>
    </div>
  );
}
