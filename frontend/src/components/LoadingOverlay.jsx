import React from "react";

const messages = [
  "Scanning seasons and fabrics…",
  "Balancing comfort and style…",
  "Finding pieces that fit your vibe…",
  "Checking availability and pricing…",
];

export default function LoadingOverlay({ text }) {

  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % messages.length), 1500);
    return () => clearInterval(t);
  }, []);
  
  const display = text || messages[idx];

  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/60 backdrop-blur-sm">
      {/* animated ring */}
      <div className="relative flex flex-col items-center gap-5">
        <div className="relative h-20 w-20">
          <svg className="h-20 w-20" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="grad" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#4F7FFF" />
                <stop offset="100%" stopColor="#F2546D" />
              </linearGradient>
            </defs>
            {/* track */}
            <circle
              cx="50" cy="50" r="40"
              stroke="rgba(255,255,255,0.15)" strokeWidth="8" fill="none"
            />
            {/* animated arc */}
            <circle
              cx="50" cy="50" r="40"
              stroke="url(#grad)" strokeWidth="8" fill="none"
              strokeDasharray="200" strokeDashoffset="180"
              strokeLinecap="round"
              style={{
                transformOrigin: "50% 50%",
                animation: "spin 1s linear infinite"
              }}
            />
          </svg>
          {/* glow */}
          <div className="absolute inset-0 blur-2xl opacity-30 bg-[radial-gradient(circle_at_center,_#4F7FFF,_transparent_60%)]" />
        </div>

        <div className="text-center">
          <p className="text-white text-lg font-semibold">{display}</p>
          <p className="text-white/70 text-sm mt-1">
            Matching occasion • style • season • body type
          </p>
        </div>
      </div>

      {/* keyframes (scoped) */}
      <style>{`
        @keyframes spin { 
          0% { transform: rotate(0deg); } 
          100% { transform: rotate(360deg); } 
        }
      `}</style>
    </div>
  );
}
