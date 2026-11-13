import test from "node:test";
import assert from "node:assert/strict";
import type { Payload } from "payload";
import { requestSession } from "../src/lib/request-session";

test("anonymous page requests skip CMS initialization", async () => {
  let initializations = 0;
  const user = await requestSession(new Headers(), async () => {
    initializations++;
    throw new Error("Anonymous requests should not initialize the CMS");
  });
  assert.equal(user, null);
  assert.equal(initializations, 0);
});

test("cookie and authorization requests still use Payload authentication", async () => {
  const user = { id: 42, email: "student@example.test", collection: "users" };
  const credentialHeaders: Record<string, string>[] = [
    { cookie: "payload-token=session-token" },
    { authorization: "JWT session-token" },
    { authorization: "Bearer session-token" },
    { authorization: "users API-Key test-key" },
  ];
  for (const credentials of credentialHeaders) {
    const headers = new Headers(credentials);
    let authentications = 0;
    const result = await requestSession(
      headers,
      async () =>
        ({
          auth: async (options: { headers: Headers }) => {
            authentications++;
            assert.equal(options.headers, headers);
            return { user };
          },
        }) as unknown as Payload,
    );
    assert.equal(result, user);
    assert.equal(authentications, 1);
  }
});

test("invalid sessions remain anonymous according to Payload", async () => {
  const user = await requestSession(
    new Headers({ cookie: "payload-token=invalid" }),
    async () =>
      ({
        auth: async () => ({ user: null }),
      }) as unknown as Payload,
  );
  assert.equal(user, null);
});
