interface ImportMetaEnv {
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_ANON_KEY: string;
  readonly OPENROUTER_API_KEY: string;
  // Logging configuration
  readonly LOG_ENABLED?: string; // "true" | "false" - enable/disable logging to files
  readonly LOG_LEVEL?: string; // "DEBUG" | "INFO" | "WARNING" | "ERROR" | "CRITICAL" - minimum log level
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
