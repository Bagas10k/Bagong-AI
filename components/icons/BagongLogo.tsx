import React from 'react';

export const BagongLogo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Head shape */}
    <path d="M12 2a10 10 0 0 0-8.89 14.47L3 18l1.53 1.11A10 10 0 1 0 12 2z"></path>
    {/* Eyes */}
    <circle cx="9" cy="10" r="1.5"></circle>
    <circle cx="15" cy="10" r="1.5"></circle>
    {/* Playful smile */}
    <path d="M9 15c1 1 2 1.5 3 1.5s2-.5 3-1.5"></path>
    {/* AI element - a small circuit on the forehead */}
    <path d="M11 6h2"></path>
    <path d="M12 6V5"></path>
  </svg>
);