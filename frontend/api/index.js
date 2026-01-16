// Admin API functions
export async function getAllUsers(token) {
  const response = await fetch(`${API_BASE_URL}/admin/users`, {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) {
    let errorMessage = `Failed to fetch users: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      const errorText = await response.text().catch(() => "");
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }
  const data = await response.json();
  return data.users || [];
}

export async function assignUserRole(token, assignForm) {
  const payload = {
    targetEmail: assignForm.email,
    role: assignForm.role,
    metadata: {},
  };
  if (assignForm.role === "verified_rep")
    payload.metadata.batch = assignForm.batch;
  if (assignForm.role === "club_lead")
    payload.metadata.clubName = assignForm.clubName;
  const response = await fetch(`${API_BASE_URL}/admin/assign-role`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    let errorMessage = `Failed to assign role: ${response.status}`;
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

export async function revokeUserRole(token, email) {
  const response = await fetch(`${API_BASE_URL}/admin/revoke-role`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ targetEmail: email }),
  });
  if (!response.ok) {
    let errorMessage = `Failed to revoke role: ${response.status}`;
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
// User API functions
export async function getCurrentUserRole(token) {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) {
    let errorMessage = `Failed to get user role: ${response.status}`;
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
export async function getAllBookings(token) {
  const response = await fetch(`${API_BASE_URL}/bookings`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

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

export async function bookRoom(roomId, userId, token, duration, purpose) {
  const response = await fetch(`${API_BASE_URL}/bookings/book`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ roomId, userId, duration, purpose }),
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
