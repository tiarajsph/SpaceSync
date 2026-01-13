import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, CheckCircle2 } from "lucide-react";

export default function ClaimRoomDialog({ room, isOpen, onClose, onSubmit }) {
  const [duration, setDuration] = useState(30);
  const [purpose, setPurpose] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = () => {
    setIsSuccess(true);
    onSubmit(room, duration, purpose);
  };

  const handleClose = () => {
    setIsSuccess(false);
    setDuration(30);
    setPurpose("");
    onClose();
  };

  if (!room) return null;

  const endTime = new Date();
  endTime.setMinutes(endTime.getMinutes() + duration);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-[var(--color-navy)]/95 text-[var(--color-light)] border-[var(--color-blue)] backdrop-blur-md">
        {!isSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Claim Room {room.name}
              </DialogTitle>
              <DialogDescription>
                Reserve this room for your club activity
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="space-y-3">
                <label className="text-sm font-medium">Duration</label>
                <div className="grid grid-cols-3 gap-2">
                  {[15, 30, 45].map((mins) => (
                    <Button
                      key={mins}
                      variant={duration === mins ? "default" : "outline"}
                      className="w-full"
                      onClick={() => setDuration(mins)}
                    >
                      {mins} min
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">
                  Purpose (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Club Meeting, Practice Session"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>

              <Button size="lg" className="w-full" onClick={handleSubmit}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Claim Room
              </Button>
            </div>
          </>
        ) : (
          <div className="py-8 text-center space-y-4 animate-fade-in">
            <div className="mx-auto w-16 h-16 rounded-full bg-success/20 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Room Secured!</h3>
              <p className="text-muted-foreground mt-1">
                {room.name} is yours until{" "}
                <strong>
                  {endTime.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </strong>
              </p>
            </div>
            <Button variant="outline" className="mt-4" onClick={handleClose}>
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
