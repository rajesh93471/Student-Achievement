import type { CSSProperties } from "react";

export function UniversityWordmark({
  alt = "Vignan's Deemed to be University logo",
  className,
  style,
}: {
  alt?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <img
      src="/brand/vignan-logo.png"
      alt={alt}
      className={className}
      style={style}
    />
  );
}
