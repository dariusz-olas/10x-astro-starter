import { useEffect, useState } from "react";
import { createClientLogger } from "../lib/logger-client";
import type { VersionResponse } from "../types";

// Logger instance dla komponentu
const logger = createClientLogger({ component: "VersionDisplay" });

export default function VersionDisplay() {
  const [version, setVersion] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        setLoading(true);
        await logger.debug("Fetching version from API");

        const res = await fetch("/api/version");

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = (await res.json()) as VersionResponse;
        const fetchedVersion = data.version || "unknown";

        setVersion(fetchedVersion);
        setError(false);

        await logger.info("Version fetched successfully", { version: fetchedVersion });
      } catch (err) {
        await logger.error("Failed to fetch version", {}, err);
        setVersion("unknown");
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchVersion();
  }, []);

  // Nie wyświetlaj podczas ładowania
  if (loading || !version) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 px-3 py-1.5 bg-black/20 backdrop-blur-sm text-white/70 text-xs rounded-lg font-mono sm:block hidden"
      role="status"
      aria-label={`Application version ${version}`}
      title={error ? "Version fetch failed" : `Application version: ${version}`}
    >
      v{version}
      {error && (
        <span className="ml-1 text-red-400" aria-label="Version fetch failed">
          ⚠
        </span>
      )}
    </div>
  );
}
