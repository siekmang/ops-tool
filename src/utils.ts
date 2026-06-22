import { Command } from "@tauri-apps/plugin-shell";
import { type } from "@tauri-apps/plugin-os";

let osType = type();
let lxdToolsDir: string | undefined;

if (osType === "macos") lxdToolsDir = "/Users/siekmang/Dev/Work/lxd-tools";
if (osType === "windows")
  lxdToolsDir = "C:/Users/GSiekman/Documents/GitHub/lxd-tools";

export async function testLxdTools() {
  if (!lxdToolsDir) {
    logToWindow("LXD Tools path not configured for this operating system.");
    return;
  }

  let command = await Command.create("npm test", [], {
    cwd: lxdToolsDir,
  }).execute();
  let output = command.stdout ?? command.stderr;

  logToWindow(output);
}

export function logToWindow(message: string, type = "info") {
	let consoleWindow = document.getElementById("console-window");
	let timestamp = new Date().toLocaleTimeString();

	if (!consoleWindow || !clearBtn) {
		console.error("No consoleWindow found.");
		return;
	}

  // Create a new log entry line
  let logLine = document.createElement("div");
  logLine.className = `log-${type}`;
  logLine.textContent = `[${timestamp}] ${message}`;

  // Optional color coding based on log severity
  if (type === "error") logLine.style.color = "#ff6b6b";
  if (type === "success") logLine.style.color = "#51cf66";
  if (type === "warning") logLine.style.color = "#fcc419";

  // Append the log
  consoleWindow.appendChild(logLine);

  // Auto-scroll to the bottom
	consoleWindow.scrollTop = consoleWindow.scrollHeight;
}

// Clear button functionality
export function clearBtn() {
	let consoleWindow = document.getElementById("console-window");

	if(!consoleWindow) return

	consoleWindow.innerHTML = "";
}
