import { useState } from "react";
import { signInWithGoogle } from "../firebase";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { DotPattern } from "@/components/ui/dot-pattern";
import Navbar from "./components/Navbar";

function App() {
  const navigate = useNavigate();
  const handleSignIn = () => {
    signInWithGoogle().then(() => navigate("/dashboard"));
  };
  return (
    <div>
      <div
        className="relative w-screen h-screen min-h-screen overflow-hidden flex flex-col items-center justify-center"
        style={{ backgroundColor: "var(--color-dark)" }}
      >
        <DotPattern
          className={cn(
            "text-[color:var(--color-blue)] absolute inset-0 w-full h-full"
          )}
          width={24}
          height={24}
          cr={1}
        />
        <div className="relative z-10 flex flex-col items-center justify-center gap-6 px-6 py-10 rounded-xl bg-[color:var(--color-dark)] bg-opacity-80 shadow-xl">
          <h1 className="text-3xl md:text-4xl font-bold text-[color:var(--color-light)] mb-2 text-center">
            SpaceSync MEC
          </h1>

          <p className="text-lg md:text-xl text-[color:var(--color-blue)] max-w-2xl text-center font-medium">
            SpaceSync MEC is a real-time room intelligence and micro-booking
            platform designed to eliminate unused classroom capacity on campus.
            It transforms idle infrastructure into a dynamic, accessible campus
            resource—reducing wasted space, saving time, and improving
            collaboration.
          </p>
          <button
            className="mt-4 flex items-center gap-3 px-6 py-3 rounded-lg bg-[color:var(--color-light)] text-[color:var(--color-navy)] font-semibold text-lg shadow hover:bg-[color:var(--color-blue)] hover:text-[color:var(--color-dark)] transition-colors duration-200"
            style={{ boxShadow: "0 4px 24px 0 rgba(0,0,0,0.10)" }}
            onClick={handleSignIn}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                <path
                  d="M21.805 10.023c.13.695.195 1.41.195 2.164 0 4.418-2.958 7.573-7.5 7.573-4.309 0-7.805-3.496-7.805-7.805s3.496-7.805 7.805-7.805c2.33 0 4.287.857 5.797 2.26l-2.35 2.26c-.65-.62-1.77-1.34-3.447-1.34-2.95 0-5.354 2.404-5.354 5.354s2.404 5.354 5.354 5.354c3.42 0 4.703-2.195 4.898-3.34h-4.898v-2.66h8.047z"
                  fill="#4285F4"
                ></path>
              </g>
            </svg>
            Sign in with Google
          </button>
          <div className="text-xl md:text-xl font-semibold text-[color:var(--color-blue)] mb-2 text-center">
            Looking for a free classroom? We got you! 🚀
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
