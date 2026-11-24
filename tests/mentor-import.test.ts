import test from "node:test";
import assert from "node:assert/strict";
import { prepareMentors, linkedinURL } from "../scripts/import-mentors";

const row = {
  "Full Name": "Test Mentor",
  "Studio Photo":
    "https://drive.google.com/u/0/open?usp=forms_web&id=portrait-a",
  "Current Role / Workplace:": "Pharmacist",
  "Short Bio (5-10 lines)":
    "A pharmacist supporting students.\n\nInterested in public health.",
  "  Areas you can offer  Mentorship ":
    "1. Public health\n2. Academic guidance",
  "One Advice for Students (Quote)": "Keep learning.",
  "LinkedIn Link": "linkedin.com/in/test-mentor?utm_source=share",
  "WhatsApp / Email (private)": "private@example.com / +23412345678",
  "Do you agree we publish your contact info on the website? ": "No",
};
const photos = {
  files: [
    { id: "portrait-a", portrait: ".data/mentor-import/portraits/a.webp" },
  ],
};

test("contact refusal excludes contact details and LinkedIn from public CMS data", () => {
  const [mentor] = prepareMentors([row], photos);
  const publicJSON = JSON.stringify(mentor.data);
  assert.doesNotMatch(publicJSON, /private@example|23412345678|linkedin\.com/);
  assert.equal(mentor.data.linkedin, null);
  assert.deepEqual(mentor.data.expertise, [
    "Public health",
    "Academic guidance",
  ]);
  assert.equal(mentor.data.yearsExperience, null);
  assert.equal(mentor.data.capacity, null);
  assert.match(publicJSON, /Keep learning/);
  assert.equal(mentor.photoID, "portrait-a");
});

test("explicit consent includes submitted contact and cleans LinkedIn tracking", () => {
  const [mentor] = prepareMentors(
    [
      {
        ...row,
        "Do you agree we publish your contact info on the website? ": "Yes",
      },
    ],
    photos,
  );
  assert.match(JSON.stringify(mentor.data.content), /private@example.com/);
  assert.equal(mentor.data.linkedin, "https://linkedin.com/in/test-mentor");
  assert.throws(() => linkedinURL("https://linkedin.com.evil.example/in/name"));
});

test("photo matching requires exact Drive IDs and rejects duplicates or missing uploads", () => {
  assert.throws(
    () =>
      prepareMentors([row], {
        files: [{ id: "different-id", portrait: "a.webp" }],
      }),
    /Missing staged photo/,
  );
  assert.throws(
    () =>
      prepareMentors([row, { ...row, "Full Name": "Another Mentor" }], photos),
    /Duplicate mentor or photo/,
  );
  assert.throws(
    () =>
      prepareMentors(
        [{ ...row, "Studio Photo": "https://example.com/?id=portrait-a" }],
        photos,
      ),
    /Google Drive/,
  );
});
