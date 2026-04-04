const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];

export async function uploadStudentFile({
  file,
  token,
  apiUrl,
}: {
  file: File;
  token: string;
  apiUrl: string;
}) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Only PDF, JPG, and PNG files are allowed");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File size must be 5MB or smaller");
  }

  const response = await fetch(`${apiUrl}/documents/upload-url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Upload initialization failed" }));
    throw new Error(error.message || "Upload initialization failed");
  }

  const payload = (await response.json()) as {
    key: string;
    uploadUrl: string;
    fileUrl: string;
    mock?: boolean;
    mode?: string;
  };

  if (!payload.mock) {
    if (payload.mode === "local") {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("key", payload.key);

      const uploadResponse = await fetch(payload.uploadUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("File upload failed");
      }
    } else {
      const uploadResponse = await fetch(payload.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("File upload failed");
      }
    }
  }

  return {
    fileUrl: payload.fileUrl,
    fileKey: payload.key,
    mimeType: file.type,
    size: file.size,
  };
}
