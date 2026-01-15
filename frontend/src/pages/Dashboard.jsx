import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RoomDetailDrawer from "@/components/RoomDetailDrawer";
import ClaimRoomDialog from "@/components/ClaimRoomDialog";
import UploadOverlay from "@/components/Upload";
import TopNav from "@/components/TopNav";
import RoomActionsBar from "@/components/RoomActionsBar";
import RoomGrid from "@/components/RoomGrid";
import { uploadTimetable, findFreeRoomsByDayTime } from "../../api";
import { useRooms } from "@/hooks/useRooms";
import { useAuth } from "@/hooks/useAuth";
import { transformRoom } from "@/utils/roomUtils";

export default function Dashboard() {
  const {
    rooms,
    setRooms,
    isLoading: isLoadingRooms,
    setIsLoading: setIsLoadingRooms,
    error: roomsError,
    setError: setRoomsError,
    fetchRooms,
  } = useRooms();

  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [showFreeRooms, setShowFreeRooms] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [userRole] = useState("clubLead");

  // Search params (for demo, hardcoded; you can make these dynamic)
  const searchDay = "Friday";
  const searchTime = "12:30 to 3:30";

  // Handler for Find Free Rooms button
  const handleFindFreeRooms = async () => {
    if (!showFreeRooms) {
      try {
        setIsLoadingRooms(true);
        setRoomsError(null);
        const freeRooms = await findFreeRoomsByDayTime({
          day: searchDay,
          time: searchTime,
        });
        const transformedRooms = freeRooms.map((room) =>
          transformRoom({ ...room, status: "available" })
        );
        setRooms(transformedRooms);
        setShowFreeRooms(true);
      } catch (error) {
        setRoomsError(error.message || "Failed to find free rooms");
      } finally {
        setIsLoadingRooms(false);
      }
    } else {
      // If toggling off, reload all rooms
      fetchRooms();
      setShowFreeRooms(false);
    }
  };

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

  const handleClaimRoom = async (room, duration, purpose) => {
    // This callback is called after successful booking
    // Refresh rooms to show updated status
    await fetchRooms();
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />

      <main className="container px-3 sm:px-4 py-4 sm:py-6">
        <RoomActionsBar
          showFreeRooms={showFreeRooms}
          onFindFreeRooms={handleFindFreeRooms}
          onUploadClick={() => setIsUploadOpen(true)}
          onShowBookings={() => navigate("/bookings")}
          roomsCount={rooms.length}
        />

        <RoomGrid
          rooms={rooms}
          isLoading={isLoadingRooms}
          error={roomsError}
          showFreeRooms={showFreeRooms}
          onRoomClick={handleRoomClick}
          onRetry={fetchRooms}
        />
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
        userId={user?.uid}
      />

      {/* Upload Timetable Overlay */}
      <UploadOverlay
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={async (file) => {
          const result = await uploadTimetable(file);
          console.log("Timetable upload result:", result);
          setIsUploadOpen(false);
        }}
      />
    </div>
  );
}
