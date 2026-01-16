const express = require("express");
const cors = require("cors");
require("dotenv").config();
const expireBookings = require("./utils/expireBookings");
const roomRoutes = require("./routes/roomRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const timetableRoutes = require("./routes/timetableRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

// --- UPDATED MIDDLEWARE ---
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://frontend-mauve-gamma-89.vercel.app",
      "https://spacesync-1601.web.app",
      "https://spacesync-1601.firebaseapp.com",
      "https://spacesync-sigma.vercel.app" // ❗ NO trailing slash
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);



app.use(express.json());

// Routes
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "SpaceSync API is running on Render",
  });
});

// --- UPDATED PORT CONFIG ---
const PORT = process.env.PORT || 8081;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});

// Run auto-expiry every 1 minute
setInterval(expireBookings, 60 * 1000);
