import { signInWithGoogle, signOutUser, auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { signOut, onAuthStateChanged } from "firebase/auth";

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  const handleSignIn = () => {
    signInWithGoogle().then(() => navigate("/dashboard"));
  };

  const handleSignOut = () => {
    signOutUser().then(() => navigate("/"));
  };

  return (
    <nav
      className="w-full flex items-center justify-between px-8 py-4 bg-[color:var(--color-navy)] text-[color:var(--color-light)] shadow-md z-10"
      style={{ position: "relative" }}
    >
      <span className="text-2xl font-bold tracking-wide">SpaceSync</span>
      {user ? (
        <div className="flex items-center gap-3">
          {user.photoURL && (
            <img
              src={user.photoURL}
              alt="profile"
              className="w-8 h-8 rounded-full border-2 border-[color:var(--color-blue)]"
            />
          )}
          <button
            className="px-5 py-2 rounded-md font-medium bg-[color:var(--color-blue)] text-[color:var(--color-dark)] hover:bg-[color:var(--color-light)] hover:text-[color:var(--color-navy)] transition-colors duration-200"
            onClick={handleSignOut}
          >
            Log Out
          </button>
        </div>
      ) : (
        <button
          className="px-5 py-2 rounded-md font-medium bg-[color:var(--color-blue)] text-[color:var(--color-dark)] hover:bg-[color:var(--color-light)] hover:text-[color:var(--color-navy)] transition-colors duration-200"
          onClick={handleSignIn}
        >
          Sign In
        </button>
      )}
    </nav>
  );
}