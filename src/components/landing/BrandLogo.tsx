import React from "react";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  inverted?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = "md", inverted = false }) => {
  const iconSize = size === "sm" ? 18 : size === "lg" ? 28 : 22;
  const textSize = size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg";

  return (
    <div className="flex items-center gap-2 select-none">
      {/* Bespoke overlapping brackets mark */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <path
          d="M8 5L3 12L8 19"
          stroke={inverted ? "#010736" : "#FCF1D0"}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16 5L21 12L16 19"
          stroke={inverted ? "#22396F" : "#22396F"}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line
          x1="13.5"
          y1="5"
          x2="10.5"
          y2="19"
          stroke={inverted ? "#010736" : "#FCF1D0"}
          strokeOpacity={inverted ? "0.4" : "0.5"}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <span
        className={`font-semibold tracking-tight ${textSize} ${
          inverted ? "text-ink" : "text-cream"
        }`}
      >
        codesync
      </span>
    </div>
  );
};
