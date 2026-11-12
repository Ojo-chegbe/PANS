"use client";
import { useState } from "react";
import { ActionForm } from "./ActionForm";
import { Input, Textarea, Select } from "./Fields";
export function ContributionForm({
  initial,
}: {
  initial?: Record<string, any>;
}) {
  const [kind, setKind] = useState(initial?.kind || "resources"),
    [file, setFile] = useState<string | number | undefined>(initial?.file),
    [uploading, setUploading] = useState(false),
    [message, setMessage] = useState("");
  return (
    <>
      <div className="field">
        <label htmlFor="submission-kind">What would you like to share?</label>
        <select
          id="submission-kind"
          value={kind}
          disabled={Boolean(initial)}
          onChange={(e) => {
            setKind(e.target.value);
            setFile(undefined);
            setMessage("");
          }}
        >
          <option value="resources">Resource</option>
          <option value="articles">Article</option>
          <option value="products">Digital product</option>
        </select>
      </div>
      <ActionForm
        key={kind}
        action="submit-content"
        submit="Submit for review"
        pending="Submitting…"
        extra={{
          kind,
          ...(initial ? { id: initial.id } : {}),
          ...(file ? { file } : {}),
        }}
        numbers={["price"]}
        disabled={uploading || (kind === "products" && !file)}
      >
        <Input
          label="Title"
          name="title"
          required
          minLength={3}
          maxLength={180}
          defaultValue={initial?.title}
        />
        <Input
          label="Category"
          name="category"
          required
          maxLength={100}
          defaultValue={initial?.category}
        />
        <Textarea
          label={kind === "articles" ? "Your article" : "Description"}
          name="description"
          required
          minLength={20}
          maxLength={4000}
          defaultValue={initial?.description}
        />
        {kind === "resources" && (
          <>
            <Select
              label="Resource type"
              name="resourceType"
              defaultValue={initial?.resourceType || "Article"}
              options={[
                "Article",
                "PDF",
                "Video",
                "Website",
                "Template",
                "Course",
                "Opportunity",
              ]}
            />
            <Input
              label="Resource link (optional)"
              name="url"
              type="url"
              defaultValue={initial?.url || ""}
            />
          </>
        )}
        {kind === "products" && (
          <Input
            label="Price (₦)"
            name="price"
            type="number"
            min={0}
            step="0.01"
            defaultValue={
              initial?.price != null ? initial.price / 100 : undefined
            }
            required
          />
        )}
        {kind !== "articles" && (
          <div className="upload-field">
            <label htmlFor="contribution-file">
              {kind === "products" ? "Product file" : "Attachment (optional)"}
            </label>
            <input
              id="contribution-file"
              type="file"
              accept=".pdf,.zip"
              disabled={uploading}
              onChange={async (e) => {
                const selected = e.target.files?.[0];
                if (!selected) return;
                setUploading(true);
                setFile(undefined);
                setMessage("Uploading…");
                try {
                  const body = new FormData();
                  body.append("file", selected);
                  const response = await fetch("/api/upload-file", {
                    method: "POST",
                    body,
                  });
                  const result = await response.json();
                  if (!response.ok) throw new Error(result.message);
                  setFile(result.id);
                  setMessage(result.label + " is ready.");
                } catch (error) {
                  setMessage(
                    error instanceof Error
                      ? error.message
                      : "Upload failed. Please try again.",
                  );
                } finally {
                  setUploading(false);
                }
              }}
            />
            <small>PDF or ZIP, up to 50 MB.</small>
            {message && (
              <p className="form-note" role="status">
                {message}
              </p>
            )}
            {uploading && (
              <p className="form-note">
                Wait for the upload to finish before submitting.
              </p>
            )}
          </div>
        )}
        <p className="form-note">
          Only share work you own or have permission to distribute. The PANS
          team reviews submissions before publication.
        </p>
      </ActionForm>
    </>
  );
}
