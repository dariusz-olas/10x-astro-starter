import { spawn, ChildProcess } from "child_process";

let serverProcess: ChildProcess | null = null;

export async function setup() {
  console.log("🚀 Starting dev server for integration tests...");

  return new Promise<void>((resolve, reject) => {
    serverProcess = spawn("npm", ["run", "dev"], {
      stdio: "pipe",
      shell: true,
      env: { ...process.env, PORT: process.env.TEST_API_PORT || "4321" },
    });

    let output = "";
    const timeout = setTimeout(() => {
      reject(new Error("Server failed to start within 30 seconds"));
    }, 30000);

    serverProcess.stdout?.on("data", (data) => {
      output += data.toString();
      console.log(`[dev server] ${data.toString().trim()}`);

      // Czekaj na komunikat o uruchomieniu serwera
      if (output.includes("astro") && output.includes("ready")) {
        clearTimeout(timeout);
        console.log("✅ Dev server started successfully");
        setTimeout(resolve, 2000); // Poczekaj dodatkowe 2s na pełne uruchomienie
      }
    });

    serverProcess.stderr?.on("data", (data) => {
      console.error(`[dev server error] ${data.toString().trim()}`);
    });

    serverProcess.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    serverProcess.on("exit", (code) => {
      if (code !== 0 && code !== null) {
        clearTimeout(timeout);
        reject(new Error(`Server exited with code ${code}`));
      }
    });
  });
}

export async function teardown() {
  console.log("🛑 Stopping dev server...");

  if (serverProcess) {
    return new Promise<void>((resolve) => {
      serverProcess!.on("exit", () => {
        console.log("✅ Dev server stopped");
        resolve();
      });

      // Spróbuj graceful shutdown
      serverProcess!.kill("SIGTERM");

      // Po 5 sekundach wymuś zatrzymanie
      setTimeout(() => {
        if (serverProcess && !serverProcess.killed) {
          serverProcess.kill("SIGKILL");
        }
        resolve();
      }, 5000);
    });
  }
}
