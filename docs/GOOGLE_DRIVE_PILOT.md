# Google Drive course-delivery pilot

## Current result

The owner supplied three links referring to two unique files. A read-only, unauthenticated probe was run against both files.

- Both preview requests returned HTTP 401.
- Both download requests ended at `accounts.google.com` and returned HTML rather than media bytes.
- No file's format, size, video duration, playback, seeking, or concurrent delivery has been verified.
- No Google sharing permissions, catalogue records, course sales settings, or production storage configuration were changed.
- The supplied links have not established that Drive works as the platform's private delivery service. They establish that this test environment needs authorized access before testing the media itself.

The detailed local results are in `.data/drive-pilot/public-probe.json`. The probe inspects bounded response bodies rather than downloading entire files. Run it with explicit file IDs:

```powershell
node scripts/check-drive.mjs FILE_ID_1 FILE_ID_2
```

## Access needed for the private test

Keep the course files private. A suitable initial arrangement is a dedicated Google service account that can read only the test folder through Drive sharing permissions.

1. Open [Google Cloud Console](https://console.cloud.google.com/) with the account that will own the project. Create or select a project for the PANS integration.
2. Open **APIs & Services → Library**, find **Google Drive API**, and enable it.
3. Open **IAM & Admin → Service Accounts** and create a service account for the pilot. It does not need Project Owner or Editor roles to read Drive files explicitly shared with it.
4. Copy its service-account email address. In Google Drive, put the two samples in a dedicated test folder and share that folder with the service-account address as **Viewer**. If the account's sharing policy blocks this, resolve that policy or use an approved owner-authenticated connection instead.
5. Under the service account's **Keys** section, create a JSON key if the organization's policy permits keys. Save it locally as `.data/google-drive-service-account.json`. The `.data` folder is excluded from source control. Keep the JSON out of chat, public folders, and the repository.
6. Continue with an authenticated read-only probe using Google's authentication library. This part is pending; the current probe only tests unauthenticated links.

For the initial test, files can be uploaded to Drive by their owner. Website-to-Drive uploads require a separate authorization design; read-only sharing does not give the platform permission to upload into the owner's personal storage.

## Test sequence after access is available

1. Read names, media types, sizes, and download capability through the official API.
2. Request a small initial byte range and another range farther into each video. Check HTTP 206 and matching `Content-Range` values; do not retrieve the entire video unnecessarily.
3. Stream a representative MP4 through a local authenticated course endpoint, with no public Drive link or credential sent to the browser. Confirm the file is encoded for browser playback and that its metadata supports prompt playback.
4. Test start, pause, seek, resume, and interruption recovery on desktop and mobile.
5. Test a PDF/ZIP download through the same entitlement checks.
6. Reject anonymous users, other members without enrolment, and users whose access has been revoked. Verify shared URLs do not replace authorization.
7. Test multiple viewers at an agreed small concurrency level and record quota/rate-limit failures. Local concurrency results do not establish production capacity.
8. Test on the intended hosting platform and measure transferred data, response duration, and costs. Proxying files through the host consumes its resources as well as Drive API quotas.
9. Choose the delivery approach using the results. Do not call the pilot production-ready until authorized playback, access protection, and hosted delivery have all been verified.

## References

- [Google server-to-server authentication](https://developers.google.com/identity/protocols/oauth2/service-account)
- [Drive downloads and byte-range requests](https://developers.google.com/workspace/drive/api/guides/manage-downloads)
- [Drive API usage limits](https://developers.google.com/workspace/drive/api/guides/limits)

These are a pilot plan and observed access results, not a completed Drive storage adapter.
