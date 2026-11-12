import type { Endpoint, PayloadRequest } from "payload";
import { z } from "zod";
import { checkOrigin } from "../lib/security";
import { DomainError } from "../lib/domain";
import {
  recoverPassword,
  requestAccessEmail,
  verifyAccount,
} from "../services/account-access";

function endpoint(
  path: string,
  run: (req: PayloadRequest) => Promise<unknown>,
): Endpoint {
  return {
    path,
    method: "post",
    handler: async (req) => {
      try {
        checkOrigin(req);
        if (Number(req.headers.get("content-length") || 0) > 8192)
          throw new DomainError("This request is too large.", 413);
        const result = await run(req);
        const headers = new Headers({ "Cache-Control": "private, no-store" });
        if (path === "/reset-password") {
          const auth = req.payload.collections.users.config.auth;
          headers.set(
            "Set-Cookie",
            `${req.payload.config.cookiePrefix}-token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${auth.cookies.secure ? "; Secure" : ""}${auth.cookies.domain ? `; Domain=${auth.cookies.domain}` : ""}`,
          );
        }
        return Response.json(result, { headers });
      } catch (error) {
        const status =
          error instanceof DomainError
            ? error.status
            : error instanceof z.ZodError || error instanceof SyntaxError
              ? 400
              : 500;
        if (status === 500)
          req.payload.logger.error("Account access request failed.");
        return Response.json(
          {
            message:
              error instanceof DomainError
                ? error.message
                : error instanceof z.ZodError
                  ? error.issues[0]?.message
                  : "We could not complete this request. Please try again.",
          },
          { status, headers: { "Cache-Control": "private, no-store" } },
        );
      }
    },
  };
}

// Override the default REST endpoints as well as the public forms, so raw tokens
// cannot bypass verification expiry or password/session rules.
export const accountEndpoints: Endpoint[] = [
  endpoint("/verify/:id", (req) =>
    verifyAccount(req.payload, req.routeParams?.id),
  ),
  endpoint("/reset-password", async (req) =>
    recoverPassword(req.payload, await req.json!()),
  ),
  endpoint("/forgot-password", async (req) =>
    requestAccessEmail(req.payload, "reset", await req.json!()),
  ),
];
