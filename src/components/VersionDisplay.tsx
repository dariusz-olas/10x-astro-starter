import { useEffect, useState } from "react";

export default function VersionDisplay() {
  const [version, setVersion] = useState<string>("");

  useEffect(() => {
    fetch("/api/version")
      .then((res) => res.json())
      .then((data) => setVersion(data.version || "unknown"))
      .catch(() => setVersion("unknown"));
  }, []);

  if (!version) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 px-3 py-1.5 bg-black/20 backdrop-blur-sm text-white/70 text-xs rounded-lg font-mono">
      v{version}
    </div>
  );
}
