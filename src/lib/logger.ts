type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  ts: number;
  [key: string]: unknown;
}

function log(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>
) {
  const entry: LogEntry = { level, message, ts: Date.now(), ...context };
  const line = JSON.stringify(entry) + "\n";
  if (level === "error") process.stderr.write(line);
  else process.stdout.write(line);
}

export const logger = {
  info: (message: string, context?: Record<string, unknown>) =>
    log("info", message, context),

  warn: (message: string, context?: Record<string, unknown>) =>
    log("warn", message, context),

  error: (
    message: string,
    error?: unknown,
    context?: Record<string, unknown>
  ) =>
    log("error", message, {
      error:
        error instanceof Error
          ? { message: error.message, stack: error.stack }
          : String(error),
      ...context,
    }),
};
