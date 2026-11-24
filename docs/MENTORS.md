# Mentor profiles

The directory, popups, and full profiles read the existing Payload `mentors` collection. Portraits belong to `media` and use the configured R2 storage. Manage imported profiles in `/admin/collections/mentors`.

The initial import uses the supplied Google Form CSV export and twelve uploaded photos. Each response is matched by its Google Drive photo ID, never by the filename. One photograph was uploaded as a single-page PDF; its embedded image was extracted before import.

Raw responses, prepared portraits, and receipts are ignored under `.data/mentor-import/`. They contain personal information and must stay out of Git and `public/`.

## Import

Provide a JSON array of response objects using the exported CSV column names, plus a photo manifest shaped as `{ "files": [{ "id": "drive-file-id", "portrait": ".data/mentor-import/portraits/photo.webp" }] }`.

Validate the complete input and inspect existing CMS records:

```powershell
npx tsx scripts/import-mentors.ts .data/mentor-import/reviewed-responses.json .data/mentor-import/photos.json
```

Create missing profiles and upload their portraits:

```powershell
npx tsx scripts/import-mentors.ts .data/mentor-import/reviewed-responses.json .data/mentor-import/photos.json --apply
```

The script loads the configured CMS environment from `.env.local`. It preserves existing profile slugs and reuses media filenames on subsequent runs; it does not delete or update existing records. A local receipt records each created profile and media ID.

Contact details and LinkedIn are included only for an explicit `Yes` to contact publication. Non-consenting contact details are never written to the public profile. LinkedIn URLs are validated and tracking parameters removed. Bios and student advice use rich text in the existing content field. Names and a few obvious export/grammar errors were cleaned in the reviewed copy; the original export is preserved.

Volunteer submissions are imported as available. The form did not request years of experience or mentee capacity, so those remain unset. Editors can change availability in the CMS. No accounts or passwords are created, and no schema migration is needed.
