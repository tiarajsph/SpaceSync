import React from "react";

export default function Navbar() {
  return (
    <nav
      className="w-full flex items-center justify-between px-8 py-4 bg-[color:var(--color-navy)] text-[color:var(--color-light)] shadow-md z-10"
      style={{ position: "relative" }}
    >
      <span className="text-2xl font-bold tracking-wide">SpaceSync</span>
      <button className="px-5 py-2 rounded-md font-medium bg-[color:var(--color-blue)] text-[color:var(--color-dark)] hover:bg-[color:var(--color-light)] hover:text-[color:var(--color-navy)] transition-colors duration-200">
        Sign In
      </button>
    </nav>
  );
}
