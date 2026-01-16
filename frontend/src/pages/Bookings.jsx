import { useState, useEffect } from "react";
import { getAllBookings } from "../../api";
import { getAuth } from "firebase/auth"; // Add this import
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Calendar,
  RefreshCw,
} from "lucide-react";
import TopNav from "@/components/TopNav";

const statusConfig = {
  active: {
    label: "Active",
    emoji: "🟢",
    colorClass: "text-green-400",
    bgClass: "bg-green-500/20",
    borderClass: "border-green-500/50",
  },
  expired: {
    label: "Expired",
    emoji: "🔴",
    colorClass: "text-red-400",
    bgClass: "bg-red-500/20",
    borderClass: "border-red-500/50",
  },
};

function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.expired;
  return (
    <Badge
      variant="outline"
      className={`${config.bgClass} ${config.borderClass} ${config.colorClass} gap-1 text-xs`}
    >
      <span>{config.emoji}</span>
      <span>{config.label}</span>
    </Badge>
  );
}

function toDateObj(val) {
  if (!val) return null;
  if (typeof val.toDate === "function") return val.toDate();
  if (typeof val === "string" || typeof val === "number") return new Date(val);
  if (val._seconds) return new Date(val._seconds * 1000); // Firestore Timestamp as plain object
  return null;
}

function formatDate(val) {
  const date = toDateObj(val);
  if (!date || isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(val) {
  const date = toDateObj(val);
  if (!date || isNaN(date.getTime())) return "N/A";
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function BookingCard({ booking }) {
  const config = statusConfig[booking.status] || statusConfig.expired;
  const StatusIcon = booking.status === "active" ? CheckCircle2 : XCircle;

  return (
    <Card
      className={`border-2 ${config.borderClass} bg-[var(--color-navy)]/80 backdrop-blur-md transition-all duration-300 hover:shadow-lg`}
    >
      <CardContent className="p-3 sm:p-4 space-y-3 text-[var(--color-light)]">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
            <h3 className="font-semibold text-base sm:text-lg truncate">
              {booking.room_id}
            </h3>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        {/* Time Info */}
        <div className="space-y-2 text-xs sm:text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{formatDate(booking.start_time)}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-3.5 w-3.5 flex-shrink-0" />
            <span>
              {formatTime(booking.start_time)} -{" "}
              {formatTime(booking.expires_at)}
            </span>
          </div>
        </div>

        {/* Status Icon */}
        <div className="flex justify-end">
          <StatusIcon
            className={`h-5 w-5 ${config.colorClass} ${
              booking.status === "active" ? "animate-pulse" : ""
            }`}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // New: fetch the token
  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const auth = getAuth();
      const user = auth.currentUser;
      let token = null;
      if (user) {
        token = await user.getIdToken();
      }
      const data = await getAllBookings(token); // Pass token here
      // Sort by start_time descending (newest first)
      const sorted = data.sort((a, b) => {
        const timeA = a.start_time?.toDate
          ? a.start_time.toDate()
          : new Date(a.start_time);
        const timeB = b.start_time?.toDate
          ? b.start_time.toDate()
          : new Date(b.start_time);
        return timeB - timeA;
      });
      setBookings(sorted);
    } catch (err) {
      setError(err.message || "Failed to fetch bookings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const activeBookings = bookings.filter((b) => b.status === "active");
  const expiredBookings = bookings.filter((b) => b.status === "expired");

  return (
    <div className="min-h-screen bg-[var(--color-dark)]">
      <TopNav />

      <main className="container px-3 sm:px-4 py-4 sm:py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-light)]">
              Booking History
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-light)]/70 mt-1">
              View all room reservations
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchBookings}
            disabled={isLoading}
            className="text-[var(--color-light)] border-[var(--color-blue)]/60 hover:bg-[var(--color-blue)]/15 w-fit"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="loader"></div>
              <p className="text-xs sm:text-sm text-[var(--color-light)]/70">
                Loading bookings...
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4 text-center px-4">
              <AlertCircle className="h-8 w-8 text-red-400" />
              <p className="text-sm text-red-400 font-medium">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchBookings}
                className="border-[var(--color-blue)]/60 text-[var(--color-light)] hover:bg-[var(--color-blue)]/15"
              >
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && bookings.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4 text-center px-4">
              <Calendar className="h-12 w-12 text-[var(--color-blue)]/50" />
              <p className="text-sm text-[var(--color-light)]/70">
                No bookings found
              </p>
            </div>
          </div>
        )}

        {/* Bookings Content */}
        {!isLoading && !error && bookings.length > 0 && (
          <div className="space-y-6">
            {/* Active Bookings */}
            {activeBookings.length > 0 && (
              <section>
                <h2 className="text-sm sm:text-base font-semibold text-[var(--color-light)] mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  Active Bookings ({activeBookings.length})
                </h2>
                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {activeBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              </section>
            )}

            {/* Expired Bookings */}
            {expiredBookings.length > 0 && (
              <section>
                <h2 className="text-sm sm:text-base font-semibold text-[var(--color-light)] mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-light)]/30"></span>
                  Expired Bookings ({expiredBookings.length})
                </h2>
                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {expiredBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
