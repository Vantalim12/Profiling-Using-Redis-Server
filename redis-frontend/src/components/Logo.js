// src/components/Logo.js
import React from "react";

const Logo = ({ width = 50, height = 50, className = "" }) => {
  return (
    <img
      src="/barangay-kabacsanan-logo.png"
      alt="Barangay Kabacsanan Logo"
      width={width}
      height={height}
      className={className}
    />
  );
};

export default Logo;
