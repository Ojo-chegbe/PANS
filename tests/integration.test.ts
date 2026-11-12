import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { shutdown } from "../scripts/shutdown";
import type { Payload } from "payload";
import {
  registerEvent,
  requestMentor,
  mentorshipStatus,
  enroll,
  completeLesson,
  submitContent,
} from "../src/services/actions";
import {
  checkout,
  confirmPayment,
  cancelOrder,
  issueRefund,
  reconcileRefund,
} from "../src/services/commerce";
import { isStaff, type Actor, type RecordData } from "../src/lib/domain";
import {
  recoverPassword,
  requestAccessEmail,
  verifyAccount,
} from "../src/services/account-access";
let payload: Payload,
  admin: any,
  student: any,
  other: any,
  contributor: any,
  mentor: any,
  event: any,
  course: any,
  lesson: any,
  file: any,
  resource: any;
let rootClient: any,
  testDatabase = "",
  originalDatabaseURL = "";
let originalResendKey: string | undefined, originalSMTPHost: string | undefined;
const system = { system: true, skipAudit: true };
before(
  async () => {
    if (existsSync(".env.local")) process.loadEnvFile(".env.local");
    assert.ok(
      process.env.DATABASE_URL,
      "Integration tests require the documented local PostgreSQL setup.",
    );
    originalDatabaseURL = process.env.DATABASE_URL!;
    const localDatabaseURL =
      process.env.LOCAL_DATABASE_URL || originalDatabaseURL;
    assert.ok(
      ["localhost", "127.0.0.1"].includes(new URL(localDatabaseURL).hostname),
      "Isolated integration tests must use local PostgreSQL, never the Neon app database.",
    );
    originalResendKey = process.env.RESEND_API_KEY;
    originalSMTPHost = process.env.SMTP_HOST;
    delete process.env.RESEND_API_KEY;
    delete process.env.SMTP_HOST;
    const { Client } = await import("pg");
    rootClient = new Client({ connectionString: localDatabaseURL });
    await rootClient.connect();
    testDatabase = "pans_test_" + Date.now();
    await rootClient.query("CREATE DATABASE " + testDatabase);
    const url = new URL(localDatabaseURL);
    url.pathname = "/" + testDatabase;
    process.env.DATABASE_URL = url.href;
    const { getPayload } = await import("payload");
    const config = (await import("../src/payload.config")).default;
    payload = await getPayload({ config });
    const user = async (name: string, roles: any) =>
      payload.create({
        collection: "users",
        data: {
          name,
          email: name + "@example.test",
          password: "A-test-password-that-is-long",
          roles,
          _verified: true,
        },
        overrideAccess: true,
        context: system,
      });
    admin = await user("admin", ["admin"]);
    student = await user("student", ["student"]);
    other = await user("other", ["student"]);
    contributor = await user("contributor", ["student", "contributor"]);
    mentor = await user("mentor", ["mentor"]);
    file = await payload.create({
      collection: "files",
      data: {
        label: "Test protected guide",
        visibility: "private",
        owner: admin.id,
      },
      file: {
        name: "protected-test.zip",
        mimetype: "application/zip",
        data: Buffer.from(
          "504b0506000000000000000000000000000000000000",
          "hex",
        ),
        size: 22,
      },
      overrideAccess: true,
      context: system,
    });
    course = await payload.create({
      collection: "courses",
      data: {
        title: "Test course",
        slug: "test-course",
        description: "A course used only in the isolated integration database.",
        isFree: true,
        reviewStatus: "approved",
        _status: "published",
      },
      overrideAccess: true,
      context: system,
    });
    lesson = await payload.create({
      collection: "lessons",
      data: {
        title: "Test lesson",
        slug: "test-lesson",
        description: "A private lesson.",
        course: course.id,
        position: 1,
        attachments: [{ file: file.id }],
        reviewStatus: "approved",
        _status: "published",
      },
      overrideAccess: true,
      context: system,
    });
    event = await payload.create({
      collection: "events",
      data: {
        title: "Test workshop",
        slug: "test-workshop",
        description: "A workshop with one available place.",
        capacity: 1,
        startsAt: new Date(Date.now() + 86400000).toISOString(),
        registrationDeadline: new Date(Date.now() + 3600000).toISOString(),
        eventStatus: "upcoming",
        reviewStatus: "approved",
        _status: "published",
      },
      overrideAccess: true,
      context: system,
    });
    resource = await payload.create({
      collection: "resources",
      data: {
        title: "Pending resource",
        slug: "pending-resource",
        description: "This draft must stay private.",
        resourceType: "Article",
        reviewStatus: "pending",
        _status: "draft",
        owner: contributor.id,
      },
      overrideAccess: true,
      context: system,
    });
  },
  { timeout: 180000 },
);
after(async () => {
  if (payload) await shutdown(payload);
  if (rootClient && testDatabase) {
    await rootClient.query("DROP DATABASE " + testDatabase + " WITH (FORCE)");
    await rootClient.end();
  }
  process.env.DATABASE_URL = originalDatabaseURL;
  if (originalResendKey === undefined) delete process.env.RESEND_API_KEY;
  else process.env.RESEND_API_KEY = originalResendKey;
  if (originalSMTPHost === undefined) delete process.env.SMTP_HOST;
  else process.env.SMTP_HOST = originalSMTPHost;
});
test("public users cannot read pending submissions or protected lessons", async () => {
  const drafts = await payload.find({
    collection: "resources",
    where: { id: { equals: resource.id } },
    overrideAccess: false,
  });
  assert.equal(drafts.totalDocs, 0);
  await assert.rejects(
    payload.findByID({
      collection: "lessons",
      id: lesson.id,
      overrideAccess: false,
    }),
  );
  await assert.rejects(
    payload.findByID({
      collection: "files",
      id: file.id,
      overrideAccess: false,
      user: student,
    }),
  );
});

test("verification resend rotates tokens, hides account existence and consumes a link once", async () => {
  const send = payload.sendEmail;
  const adapterSend = payload.email.sendEmail;
  const messages: any[] = [];
  payload.email.sendEmail = payload.sendEmail = async (message: any) => {
    messages.push(message);
    return {};
  };
  try {
    const user = await payload.create({
      collection: "users",
      data: {
        name: "Recover verification",
        email: "verify-recovery@example.test",
        password: "Original-password-for-recovery",
        roles: ["student"],
      },
      overrideAccess: true,
      context: system,
    });
    const token = (mail: any) =>
      decodeURIComponent(
        String(mail.html).match(/verify-email\?token=([^"<\s]+)/)![1],
      );
    const initial = token(messages.at(-1));
    const known = await requestAccessEmail(payload, "verification", {
      email: user.email,
    });
    const newest = token(messages.at(-1));
    assert.notEqual(initial, newest);
    const unknown = await requestAccessEmail(payload, "verification", {
      email: "no-account@example.test",
    });
    assert.deepEqual(unknown, known);
    await assert.rejects(
      requestAccessEmail(payload, "verification", { email: user.email }),
      (error: any) => error.status === 429,
    );
    await assert.rejects(
      verifyAccount(payload, initial),
      /invalid|already been used/,
    );
    const results = await Promise.allSettled([
      verifyAccount(payload, newest),
      verifyAccount(payload, newest),
    ]);
    assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
    assert.equal(results.filter((r) => r.status === "rejected").length, 1);
    const verified = await payload.findByID({
      collection: "users",
      id: user.id,
      overrideAccess: true,
    });
    assert.equal(verified._verified, true);
    const before = messages.length;
    assert.deepEqual(
      await requestAccessEmail(payload, "verification", {
        email: student.email,
      }),
      known,
    );
    assert.equal(messages.length, before);
  } finally {
    payload.sendEmail = send;
    payload.email.sendEmail = adapterSend;
  }
});

test("password recovery rejects weak/reused links and revokes every existing session", async () => {
  const send = payload.sendEmail;
  const adapterSend = payload.email.sendEmail;
  const messages: any[] = [];
  payload.email.sendEmail = payload.sendEmail = async (message: any) => {
    messages.push(message);
    return {};
  };
  try {
    const email = "password-recovery@example.test";
    const password = "Original-recovery-password";
    await payload.create({
      collection: "users",
      data: {
        name: "Recovery member",
        email,
        password,
        roles: ["student"],
        _verified: true,
      },
      overrideAccess: true,
      context: system,
    });
    const a = await payload.login({
      collection: "users",
      data: { email, password },
    });
    const b = await payload.login({
      collection: "users",
      data: { email, password },
    });
    const authenticated = async (token: string | undefined) =>
      (
        await payload.auth({
          headers: new Headers({ authorization: `JWT ${token}` }),
        })
      ).user;
    assert.ok(await authenticated(a.token));
    assert.ok(await authenticated(b.token));
    const known = await requestAccessEmail(payload, "reset", { email });
    const unknown = await requestAccessEmail(payload, "reset", {
      email: "no-reset-account@example.test",
    });
    assert.deepEqual(known, unknown);
    const token = decodeURIComponent(
      String(messages.at(-1).html).match(
        /reset-password\?token=([^"<\s]+)/,
      )![1],
    );
    await assert.rejects(
      recoverPassword(payload, { token, password: "short" }),
    );
    const result = await recoverPassword(payload, {
      token,
      password: "A-new-long-password-for-recovery",
    });
    assert.equal(result.redirect, "/sign-in?reset=success");
    assert.equal(await authenticated(a.token), null);
    assert.equal(await authenticated(b.token), null);
    await assert.rejects(
      recoverPassword(payload, { token, password }),
      /expired|already been used/,
    );
    await assert.rejects(
      payload.login({ collection: "users", data: { email, password } }),
    );
    const fresh = await payload.login({
      collection: "users",
      data: { email, password: "A-new-long-password-for-recovery" },
    });
    assert.ok(await authenticated(fresh.token));
  } finally {
    payload.sendEmail = send;
    payload.email.sendEmail = adapterSend;
  }
});

test("expired reset links cannot change passwords and recovery cannot verify an account", async () => {
  const user = await payload.create({
    collection: "users",
    data: {
      name: "Unverified recovery",
      email: "unverified-recovery@example.test",
      password: "Original-password-that-is-long",
      roles: ["student"],
    },
    overrideAccess: true,
    context: system,
  });
  const token = await payload.forgotPassword({
    collection: "users",
    data: { email: user.email },
    disableEmail: true,
  });
  await payload.db.updateOne({
    collection: "users",
    id: user.id,
    data: {
      resetPasswordExpiration: new Date(Date.now() - 1000).toISOString(),
    },
    returning: false,
  });
  await assert.rejects(
    recoverPassword(payload, {
      token,
      password: "A-new-password-that-is-long",
    }),
    /expired/,
  );
  const newest = await payload.forgotPassword({
    collection: "users",
    data: { email: user.email },
    disableEmail: true,
  });
  await recoverPassword(payload, {
    token: newest,
    password: "A-new-password-that-is-long",
  });
  const after = await payload.findByID({
    collection: "users",
    id: user.id,
    overrideAccess: true,
  });
  assert.equal(after._verified, false);
  await assert.rejects(
    payload.login({
      collection: "users",
      data: { email: user.email, password: "A-new-password-that-is-long" },
    }),
  );
});
test("a student cannot change roles or another member profile", async () => {
  const updated = await payload.update({
    collection: "users",
    id: student.id,
    data: {
      name: student.name,
      phone: "00000000000",
      level: "300L",
      department: "Pharmacy",
      bio: "",
    },
    overrideAccess: false,
    user: student,
  });
  assert.equal(updated.level, "300L");
  assert.equal(isStaff(updated as Actor), false);
  await assert.rejects(
    payload.update({
      collection: "users",
      id: student.id,
      data: { roles: ["admin"] },
      overrideAccess: false,
      user: student,
    }),
  );
  await assert.rejects(
    payload.update({
      collection: "users",
      id: other.id,
      data: { name: "Changed" },
      overrideAccess: false,
      user: student,
    }),
  );
  const fresh = await payload.findByID({
    collection: "users",
    id: student.id,
    overrideAccess: true,
  });
  assert.equal(isStaff(fresh as Actor), false);
});
test("contributor submissions stay pending and cannot be published by their owner", async () => {
  await submitContent(payload, contributor, {
    kind: "resources",
    title: "Contributor resource",
    description: "A useful resource awaiting an editorial review.",
    category: "Academic",
    resourceType: "Article",
    url: "https://example.test/resource",
  });
  const docs = await payload.find({
    collection: "resources",
    where: { slug: { contains: "contributor-resource" } },
    overrideAccess: true,
  });
  assert.equal(docs.docs.length, 1);
  assert.equal(docs.docs[0].reviewStatus, "pending");
  assert.equal(
    String(
      typeof docs.docs[0].owner === "object"
        ? docs.docs[0].owner?.id
        : docs.docs[0].owner,
    ),
    String(contributor.id),
  );
  await assert.rejects(
    payload.update({
      collection: "resources",
      id: docs.docs[0].id,
      data: { _status: "published", reviewStatus: "approved" },
      overrideAccess: false,
      user: contributor,
    }),
  );
});
test("simultaneous registrations cannot overbook an event and repeated requests are idempotent", async () => {
  const input = {
    event: event.id,
    phone: "",
    level: "300L",
    department: "Pharmacy",
    membership: true,
  };
  const results = await Promise.allSettled([
    registerEvent(payload, student, input),
    registerEvent(payload, other, input),
  ]);
  assert.equal(results.filter((x) => x.status === "fulfilled").length, 1);
  const rows = await payload.find({
    collection: "registrations",
    where: { event: { equals: event.id } },
    overrideAccess: true,
    depth: 0,
  });
  assert.equal(rows.totalDocs, 1);
  const winner =
    String(rows.docs[0].owner) === String(student.id) ? student : other;
  await registerEvent(payload, winner, input);
  assert.equal(
    (
      await payload.count({
        collection: "registrations",
        where: { event: { equals: event.id } },
        overrideAccess: true,
      })
    ).totalDocs,
    1,
  );
});
test("free enrolment grants lesson and file access only to the enrolled member", async () => {
  await enroll(payload, student, { course: course.id });
  await enroll(payload, student, { course: course.id });
  const accessible = await payload.findByID({
    collection: "lessons",
    id: lesson.id,
    overrideAccess: false,
    user: student,
  });
  assert.equal(accessible.id, lesson.id);
  const allowed = await payload.findByID({
    collection: "files",
    id: file.id,
    overrideAccess: false,
    user: student,
  });
  assert.equal(allowed.id, file.id);
  await assert.rejects(
    payload.findByID({
      collection: "files",
      id: file.id,
      overrideAccess: false,
      user: other,
    }),
  );
  assert.equal(
    (
      await payload.count({
        collection: "enrollments",
        where: { owner: { equals: student.id } },
        overrideAccess: true,
      })
    ).totalDocs,
    1,
  );
  await completeLesson(payload, student, { lesson: lesson.id });
  await completeLesson(payload, student, { lesson: lesson.id });
  assert.equal(
    (
      await payload.count({
        collection: "progress",
        where: { owner: { equals: student.id } },
        overrideAccess: true,
      })
    ).totalDocs,
    1,
  );
});
test("free checkout grants exactly one entitlement and does not expose private orders", async () => {
  const product = await payload.create({
    collection: "products",
    data: {
      title: "Free test guide",
      slug: "free-test-guide",
      description: "An actual protected test file.",
      type: "digital",
      file: file.id,
      price: 0,
      salesOpen: true,
      reviewStatus: "approved",
      _status: "published",
    },
    overrideAccess: true,
    context: system,
  });
  const result = await checkout(payload, other, {
    items: [{ product: product.id, quantity: 1 }],
  });
  assert.match(result.redirect, /^\/account\/orders\//);
  const orders = await payload.find({
    collection: "orders",
    where: { owner: { equals: other.id } },
    depth: 0,
    overrideAccess: true,
  });
  assert.equal(orders.docs[0].paymentStatus, "paid");
  await assert.rejects(
    payload.findByID({
      collection: "orders",
      id: orders.docs[0].id,
      overrideAccess: false,
      user: student,
    }),
  );
  assert.equal(
    (
      await payload.count({
        collection: "entitlements",
        where: {
          and: [
            { owner: { equals: other.id } },
            { product: { equals: product.id } },
          ],
        },
        overrideAccess: true,
      })
    ).totalDocs,
    1,
  );
});
test("mentorship status changes respect ownership and assignment", async () => {
  await requestMentor(payload, student, {
    phone: "",
    level: "300L",
    interest: "Research",
    careerGoal: "Clinical research",
    preferredType: "Pharmacist",
    message: "I would like guidance on starting a research project.",
  });
  const docs = await payload.find({
    collection: "mentorship-requests",
    where: { owner: { equals: student.id } },
    depth: 0,
    overrideAccess: true,
  });
  const request = docs.docs[0];
  await assert.rejects(
    mentorshipStatus(payload, other, { id: request.id, status: "accepted" }),
  );
  await payload.update({
    collection: "mentorship-requests",
    id: request.id,
    data: { assignedMentor: mentor.id, status: "assigned" },
    overrideAccess: true,
    context: system,
  });
  await mentorshipStatus(payload, mentor, {
    id: request.id,
    status: "accepted",
  });
  assert.equal(
    (
      await payload.findByID({
        collection: "mentorship-requests",
        id: request.id,
        overrideAccess: true,
      })
    ).status,
    "accepted",
  );
});

test("paid checkout, duplicate confirmation and verified full refunds preserve access rules", async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.PAYSTACK_SECRET_KEY;
  process.env.PAYSTACK_SECRET_KEY = "sk_test_local_only";
  let reference = "";
  let amount = 250000;
  let refunds = 0;
  globalThis.fetch = async (input, options) => {
    const url = new URL(String(input));
    assert.equal(url.hostname, "api.paystack.co");
    let data: any;
    if (url.pathname === "/transaction/initialize") {
      const body = JSON.parse(String(options?.body));
      reference = body.reference;
      data = { authorization_url: "https://checkout.paystack.com/local-test" };
    } else if (
      url.pathname.startsWith("/transaction/verify/") ||
      url.pathname === "/transaction/7331"
    )
      data = {
        id: 7331,
        reference,
        amount,
        currency: "NGN",
        status: "success",
        customer: { email: student.email },
      };
    else if (url.pathname === "/refund" && options?.method === "POST") {
      refunds++;
      data = { id: 912, status: "pending" };
    } else if (url.pathname === "/refund/912")
      data = {
        id: 912,
        transaction: 7331,
        amount: 250000,
        currency: "NGN",
        status: "processed",
      };
    else throw new Error("Unexpected payment request in isolated tests.");
    return Response.json({ status: true, data });
  };
  try {
    const paidFile = await payload.create({
      collection: "files",
      data: { label: "Paid test file", visibility: "private", owner: admin.id },
      file: {
        name: "paid-test.zip",
        mimetype: "application/zip",
        data: Buffer.from(
          "504b0506000000000000000000000000000000000000",
          "hex",
        ),
        size: 22,
      },
      overrideAccess: true,
      context: system,
    });
    const product = await payload.create({
      collection: "products",
      data: {
        title: "Paid test guide",
        slug: "paid-test-guide",
        description: "A protected file for payment verification tests.",
        type: "digital",
        file: paidFile.id,
        price: 250000,
        salesOpen: true,
        reviewStatus: "approved",
        _status: "published",
      },
      overrideAccess: true,
      context: system,
    });
    await checkout(payload, student, {
      items: [{ product: product.id, quantity: 1 }],
    });
    amount = 1;
    await assert.rejects(confirmPayment(payload, reference, student));
    amount = 250000;
    const order = await confirmPayment(payload, reference, student);
    await confirmPayment(payload, reference, student);
    assert.equal(order.paymentStatus, "paid");
    assert.equal(
      (
        await payload.count({
          collection: "entitlements",
          where: {
            and: [
              { owner: { equals: student.id } },
              { product: { equals: product.id } },
            ],
          },
          overrideAccess: true,
        })
      ).totalDocs,
      1,
    );
    assert.equal(
      (
        await payload.findByID({
          collection: "files",
          id: paidFile.id,
          overrideAccess: false,
          user: student,
        })
      ).id,
      paidFile.id,
    );
    await assert.rejects(issueRefund(payload, student, order.id));
    await issueRefund(payload, admin, order.id);
    await issueRefund(payload, admin, order.id);
    assert.equal(refunds, 1);
    await reconcileRefund(payload, 912);
    await reconcileRefund(payload, 912);
    assert.equal(
      (
        await payload.findByID({
          collection: "orders",
          id: order.id,
          overrideAccess: true,
        })
      ).paymentStatus,
      "refunded",
    );
    await assert.rejects(
      payload.findByID({
        collection: "files",
        id: paidFile.id,
        overrideAccess: false,
        user: student,
      }),
    );
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.PAYSTACK_SECRET_KEY;
    else process.env.PAYSTACK_SECRET_KEY = originalKey;
  }
});

test("reservation retries do not reserve stock twice and late payments cannot create negative stock", async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.PAYSTACK_SECRET_KEY;
  process.env.PAYSTACK_SECRET_KEY = "sk_test_local_only";
  let reference = "",
    status = "pending";
  let initializations = 0;
  globalThis.fetch = async (input, options) => {
    const url = new URL(String(input));
    assert.equal(url.hostname, "api.paystack.co");
    if (url.pathname === "/transaction/initialize") {
      reference = JSON.parse(String(options?.body)).reference;
      initializations++;
      return Response.json({
        status: true,
        data: {
          authorization_url: "https://checkout.paystack.com/local-stock-test",
        },
      });
    }
    return Response.json({
      status: true,
      data: {
        id: 7441,
        reference,
        status,
        amount: 100000,
        currency: "NGN",
        customer: { email: other.email },
      },
    });
  };
  try {
    const product = await payload.create({
      collection: "products",
      data: {
        title: "Physical test item",
        slug: "physical-test-item",
        description: "An isolated inventory test item.",
        type: "physical",
        price: 100000,
        stock: 1,
        salesOpen: true,
        reviewStatus: "approved",
        _status: "published",
      },
      overrideAccess: true,
      context: system,
    });
    const input = { items: [{ product: product.id, quantity: 1 }] };
    await checkout(payload, other, input);
    await checkout(payload, other, input);
    assert.equal(initializations, 1);
    assert.equal(
      (
        await payload.findByID({
          collection: "products",
          id: product.id,
          overrideAccess: true,
        })
      ).stock,
      0,
    );
    const found = await payload.find({
      collection: "orders",
      where: { reference: { equals: reference } },
      limit: 1,
      overrideAccess: true,
    });
    const order = found.docs[0];
    await cancelOrder(payload, other, order.id, true);
    assert.equal(
      (
        await payload.findByID({
          collection: "products",
          id: product.id,
          overrideAccess: true,
        })
      ).stock,
      1,
    );
    await payload.update({
      collection: "products",
      id: product.id,
      data: { stock: 0 },
      overrideAccess: true,
      context: system,
    });
    status = "success";
    await confirmPayment(payload, reference, other);
    const paid = await payload.findByID({
      collection: "orders",
      id: order.id,
      overrideAccess: true,
    });
    assert.equal(paid.paymentStatus, "paid");
    assert.equal(paid.fulfilment, "needs-attention");
    assert.equal(
      (
        await payload.findByID({
          collection: "products",
          id: product.id,
          overrideAccess: true,
        })
      ).stock,
      0,
    );
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.PAYSTACK_SECRET_KEY;
    else process.env.PAYSTACK_SECRET_KEY = originalKey;
  }
});

test("contributors can revise requested changes without gaining publication rights", async () => {
  await payload.update({
    collection: "resources",
    id: resource.id,
    data: {
      reviewStatus: "changes-requested",
      reviewNotes: "Please expand the source information.",
    },
    overrideAccess: true,
    context: system,
  });
  await submitContent(payload, contributor, {
    id: resource.id,
    kind: "resources",
    title: "Revised resource",
    description: "An expanded resource with clearer source information.",
    category: "Academic",
    resourceType: "Article",
    url: "https://example.test/revised",
  });
  const revised = await payload.findByID({
    collection: "resources",
    id: resource.id,
    draft: true,
    overrideAccess: true,
  });
  assert.equal(revised.reviewStatus, "pending");
  assert.equal(revised._status, "draft");
  assert.equal(revised.title, "Revised resource");
  await assert.rejects(
    submitContent(payload, other, {
      id: resource.id,
      kind: "resources",
      title: "Not my resource",
      description: "This change must never be accepted by the platform.",
      category: "Academic",
      resourceType: "Article",
    }),
  );
});
