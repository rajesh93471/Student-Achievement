"use client";

export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <>
      <style>{`
        @keyframes skeletonShimmer {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }
        .sk-bone {
          border-radius: 8px;
          background: linear-gradient(
            90deg,
            #161616 0%,
            #1e1e1e 40%,
            #242424 50%,
            #1e1e1e 60%,
            #161616 100%
          );
          background-size: 800px 100%;
          animation: skeletonShimmer 1.6s ease-in-out infinite;
        }
      `}</style>
      <div className={`sk-bone${className ? ` ${className}` : ""}`} style={style} />
    </>
  );
}