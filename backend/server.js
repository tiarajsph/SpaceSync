const express = require('express');
const cors = require('cors');
require('dotenv').config();
const expireBookings = require('./utils/expireBookings');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const timetableRoutes = require('./routes/timetableRoutes');
;


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/timetable', timetableRoutes);


// Health check
app.get('/', (req, res) => {
  res.json({ message: 'SpaceSync API is running' });
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Run auto-expiry every 1 minute
setInterval(expireBookings, 60 * 1000);
