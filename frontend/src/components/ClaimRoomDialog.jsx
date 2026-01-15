import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { bookRoom } from "../../api";

export default function ClaimRoomDialog({
  room,
  isOpen,
  onClose,
  onSubmit,
  userId,
}) {
  const [duration, setDuration] = useState(30);
  const [purpose, setPurpose] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!room || !room.id) {
      setError("Invalid room information");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      if (!userId) {
        setError(
          "You must be signed in to book a room. Please sign in and try again."
        );
        setIsLoading(false);
        return;
      }

      console.log("Booking room:", {
        roomId: room.id,
        roomName: room.name,
        userId,
      });

      await bookRoom(room.id, userId);

      setIsSuccess(true);

      if (onSubmit) {
        onSubmit(room, duration, purpose);
      }
    } catch (err) {
      console.error("Booking failed:", err);
      setError(err.message || "Failed to book room. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setIsLoading(false);
    setError(null);
    setDuration(30);
    setPurpose("");
    onClose();
  };

  if (!room) return null;

  const endTime = new Date();
  endTime.setMinutes(endTime.getMinutes() + duration);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-md bg-[var(--color-navy)]/95 text-[var(--color-light)] border-[var(--color-blue)] backdrop-blur-md p-4 sm:p-6">
        {!isSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Claim Room {room.name}
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Reserve this room for your club activity
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
              {error && (
                <div className="flex items-center gap-2 p-2 sm:p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 text-xs sm:text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2 sm:space-y-3">
                <label className="text-xs sm:text-sm font-medium">
                  Duration
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[15, 30, 45].map((mins) => (
                    <Button
                      key={mins}
                      variant={duration === mins ? "outline" : "default"}
                      className="w-full text-xs sm:text-sm py-2"
                      onClick={() => setDuration(mins)}
                      disabled={isLoading}
                    >
                      {mins} min
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <label className="text-xs sm:text-sm font-medium">
                  Purpose (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Club Meeting, Practice Session"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-3 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <Button
                size="lg"
                className="w-full text-sm sm:text-base"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Booking...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Claim Room
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <div className="py-6 sm:py-8 text-center space-y-3 sm:space-y-4 animate-fade-in">
            <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-success/20 flex items-center justify-center">
              <CheckCircle2 className="h-7 w-7 sm:h-8 sm:w-8 text-success" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-semibold">
                Room Secured!
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {room.name} is yours until{" "}
                <strong>
                  {endTime.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </strong>
              </p>
            </div>
            <Button
              variant="outline"
              className="mt-4 text-sm"
              onClick={handleClose}
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}