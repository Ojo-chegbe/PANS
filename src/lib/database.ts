/** Keep the existing PostgreSQL driver and transactions when connecting to Neon. */
export function postgresConnection(connectionString: string) {
  let neon = false;
  try {
    const url = new URL(connectionString);
    neon = url.hostname.endsWith(".neon.tech");
    if (neon) {
      url.searchParams.set("sslmode", "verify-full");
      connectionString = url.href;
    }
  } catch {
    throw new Error("DATABASE_URL must be a valid PostgreSQL connection URL.");
  }
  return {
    pool: {
      connectionString,
      ...(neon
        ? { max: 5, connectionTimeoutMillis: 30_000, idleTimeoutMillis: 10_000 }
        : {}),
    },
    // Hosted data is changed by versioned migrations, not development auto-push.
    ...(neon ? { push: false, disableCreateDatabase: true } : {}),
  };
}
