const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api";

export async function uploadTimetable(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/timetable/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = `Upload failed with status ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      const errorText = await response.text().catch(() => "");
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

// Room API functions
export async function getAllRooms() {
  const response = await fetch(`${API_BASE_URL}/rooms`);

  if (!response.ok) {
    let errorMessage = `Failed to fetch rooms: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      const errorText = await response.text().catch(() => "");
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function getRoomById(id) {
  const response = await fetch(`${API_BASE_URL}/rooms/${id}`);

  if (!response.ok) {
    let errorMessage = `Failed to fetch room: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      const errorText = await response.text().catch(() => "");
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function createRoom(roomData) {
  const response = await fetch(`${API_BASE_URL}/rooms`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(roomData),
  });

  if (!response.ok) {
    let errorMessage = `Failed to create room: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      const errorText = await response.text().catch(() => "");
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function seedRooms() {
  const response = await fetch(`${API_BASE_URL}/rooms/seed`, {
    method: "POST",
  });

  if (!response.ok) {
    let errorMessage = `Failed to seed rooms: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      const errorText = await response.text().catch(() => "");
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

// Booking API functions
export async function getAllBookings() {
  const response = await fetch(`${API_BASE_URL}/bookings`);

  if (!response.ok) {
    let errorMessage = `Failed to fetch bookings: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      const errorText = await response.text().catch(() => "");
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function getBookingById(id) {
  const response = await fetch(`${API_BASE_URL}/bookings/${id}`);

  if (!response.ok) {
    let errorMessage = `Failed to fetch booking: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      const errorText = await response.text().catch(() => "");
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function bookRoom(roomId, userId) {
  const response = await fetch(`${API_BASE_URL}/bookings/book`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ roomId, userId }),
  });

  if (!response.ok) {
    let errorMessage = `Failed to book room: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      const errorText = await response.text().catch(() => "");
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function deleteBooking(id) {
  const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    let errorMessage = `Failed to delete booking: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      const errorText = await response.text().catch(() => "");
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function findFreeRoomsByDayTime({ day, time }) {
  const response = await fetch(`${API_BASE_URL}/rooms/find-free`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ day, time }),
  });

  if (!response.ok) {
    let errorMessage = `Failed to find free rooms: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      const errorText = await response.text().catch(() => "");
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}
