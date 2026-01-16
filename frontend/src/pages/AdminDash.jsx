import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import { getAllBookings } from "../../api";
import { getAllUsers, assignUserRole, revokeUserRole } from "../../api";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api";

function AdminDash() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assignForm, setAssignForm] = useState({
    email: "",
    role: "student",
    batch: "",
    clubName: "",
  });
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState(null);
  const [assignSuccess, setAssignSuccess] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      if (!u) {
        navigate("/");
      } else {
        setUser(u);
        const t = await u.getIdToken();
        setToken(t);
        // Check admin role
        fetch(`${API_BASE_URL}/users/me`, {
          method: "GET",
          headers: { Authorization: `Bearer ${t}` },
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.role === "admin") {
              setIsAdmin(true);
            } else {
              setIsAdmin(false);
              navigate("/dashboard");
            }
          });
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (isAdmin && token) {
      setLoading(true);
      setError(null);
      // Fetch users
      getAllUsers(token)
        .then((users) => setUsers(users))
        .catch(() => setError("Failed to fetch users"));
      // Fetch bookings
      getAllBookings(token)
        .then((data) => setBookings(data))
        .catch(() => setError("Failed to fetch bookings"))
        .finally(() => setLoading(false));
    }
  }, [isAdmin, token]);

  const handleAssignRole = async (e) => {
    e.preventDefault();
    setAssignLoading(true);
    setAssignError(null);
    setAssignSuccess("");
    try {
      await assignUserRole(token, assignForm);
      setAssignSuccess("Role assigned successfully");
      setAssignForm({ email: "", role: "student", batch: "", clubName: "" });
      // Refresh users
      const users = await getAllUsers(token);
      setUsers(users);
    } catch (err) {
      setAssignError(err.message);
    } finally {
      setAssignLoading(false);
    }
  };

  const handleRevokeRole = async (email) => {
    setAssignLoading(true);
    setAssignError(null);
    setAssignSuccess("");
    try {
      await revokeUserRole(token, email);
      setAssignSuccess("Role revoked successfully");
      // Refresh users
      const users = await getAllUsers(token);
      setUsers(users);
    } catch (err) {
      setAssignError(err.message);
    } finally {
      setAssignLoading(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--color-dark)] p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-[var(--color-light)] mb-6">
          Admin Dashboard
        </h1>

        {/* Assign Role Form */}
        <div className="bg-[var(--color-navy)]/90 rounded-xl p-6 mb-8 border border-[var(--color-blue)]/30">
          <h2 className="text-xl font-semibold text-[var(--color-light)] mb-4">
            Assign Role
          </h2>
          <form className="space-y-4" onSubmit={handleAssignRole}>
            <div>
              <label className="block text-sm text-[var(--color-light)] mb-1">
                User Email
              </label>
              <input
                type="email"
                required
                value={assignForm.email}
                onChange={(e) =>
                  setAssignForm((f) => ({ ...f, email: e.target.value }))
                }
                className="w-full px-4 py-2 rounded-lg bg-[var(--color-dark)] border border-[var(--color-light)]/20 text-[var(--color-light)] placeholder-[var(--color-light)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)]"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--color-light)] mb-1">
                Role
              </label>
              <select
                value={assignForm.role}
                onChange={(e) =>
                  setAssignForm((f) => ({ ...f, role: e.target.value }))
                }
                className="w-full px-4 py-2 rounded-lg bg-[var(--color-dark)] border border-[var(--color-light)]/20 text-[var(--color-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)]"
              >
                <option value="student">Student</option>
                <option value="club_lead">Club Lead</option>
                <option value="verified_rep">Class Rep</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {assignForm.role === "verified_rep" && (
              <div>
                <label className="block text-sm text-[var(--color-light)] mb-1">
                  Batch
                </label>
                <input
                  type="text"
                  value={assignForm.batch}
                  onChange={(e) =>
                    setAssignForm((f) => ({ ...f, batch: e.target.value }))
                  }
                  className="w-full px-4 py-2 rounded-lg bg-[var(--color-dark)] border border-[var(--color-light)]/20 text-[var(--color-light)] placeholder-[var(--color-light)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)]"
                />
              </div>
            )}
            {assignForm.role === "club_lead" && (
              <div>
                <label className="block text-sm text-[var(--color-light)] mb-1">
                  Club Name
                </label>
                <input
                  type="text"
                  value={assignForm.clubName}
                  onChange={(e) =>
                    setAssignForm((f) => ({ ...f, clubName: e.target.value }))
                  }
                  className="w-full px-4 py-2 rounded-lg bg-[var(--color-dark)] border border-[var(--color-light)]/20 text-[var(--color-light)] placeholder-[var(--color-light)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)]"
                />
              </div>
            )}
            <button
              type="submit"
              disabled={assignLoading}
              className="w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 bg-[var(--color-blue)] text-[var(--color-dark)] hover:bg-[var(--color-light)] hover:text-[var(--color-navy)]"
            >
              {assignLoading ? "Assigning..." : "Assign Role"}
            </button>
            {assignError && (
              <div className="text-red-400 text-sm mt-2">{assignError}</div>
            )}
            {assignSuccess && (
              <div className="text-green-400 text-sm mt-2">{assignSuccess}</div>
            )}
          </form>
        </div>

        {/* User List */}
        <div className="bg-[var(--color-navy)]/90 rounded-xl p-6 mb-8 border border-[var(--color-blue)]/30">
          <h2 className="text-xl font-semibold text-[var(--color-light)] mb-4">
            All Users
          </h2>
          {loading ? (
            <div className="text-[var(--color-light)]">Loading users...</div>
          ) : error ? (
            <div className="text-red-400">{error}</div>
          ) : (
            <table className="w-full text-left text-[var(--color-light)]">
              <thead>
                <tr className="border-b border-[var(--color-blue)]/30">
                  <th className="py-2">Email</th>
                  <th className="py-2">Role</th>
                  <th className="py-2">Batch/Club</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.uid}
                    className="border-b border-[var(--color-light)]/10"
                  >
                    <td className="py-2">{u.email}</td>
                    <td className="py-2">{u.role}</td>
                    <td className="py-2">
                      {u.batch || u.metadata?.clubName || "-"}
                    </td>
                    <td className="py-2">
                      {u.role !== "student" && (
                        <button
                          onClick={() => handleRevokeRole(u.email)}
                          className="px-3 py-1 rounded bg-red-500 text-white text-xs hover:bg-red-600"
                        >
                          Revoke Role
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Booking Overview */}
        <div className="bg-[var(--color-navy)]/90 rounded-xl p-6 border border-[var(--color-blue)]/30">
          <h2 className="text-xl font-semibold text-[var(--color-light)] mb-4">
            All Bookings
          </h2>
          {loading ? (
            <div className="text-[var(--color-light)]">Loading bookings...</div>
          ) : error ? (
            <div className="text-red-400">{error}</div>
          ) : (
            <table className="w-full text-left text-[var(--color-light)]">
              <thead>
                <tr className="border-b border-[var(--color-blue)]/30">
                  <th className="py-2">Room</th>
                  <th className="py-2">User</th>
                  <th className="py-2">Purpose</th>
                  <th className="py-2">Start</th>
                  <th className="py-2">Expires</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-[var(--color-light)]/10"
                  >
                    <td className="py-2">{b.room_id}</td>
                    <td className="py-2">{b.user_email}</td>
                    <td className="py-2">{b.purpose}</td>
                    <td className="py-2">
                      {b.start_time
                        ? new Date(b.start_time).toLocaleString()
                        : "-"}
                    </td>
                    <td className="py-2">
                      {b.expires_at
                        ? new Date(b.expires_at).toLocaleString()
                        : "-"}
                    </td>
                    <td className="py-2">{b.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDash;
