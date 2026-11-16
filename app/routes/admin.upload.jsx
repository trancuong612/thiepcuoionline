import { json } from "@remix-run/node";
import { createHash } from "node:crypto";
import { requireAdmin } from "../lib/auth.server";

export async function loader() {
  throw new Response("Method Not Allowed", { status: 405 });
}

export async function action({ request }) {
  await requireAdmin(request);

  const cloud = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const key = process.env.CLOUDINARY_API_KEY?.trim();
  const secret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (!cloud || !key || !secret) {
    return json(
      { error: "Thiếu cấu hình Cloudinary trong .env" },
      { status: 400 },
    );
  }

  try {
    const form = await request.formData();
    const file = form.get("photo");

    if (!file || typeof file === "string" || !file.size) {
      return json({ error: "Chưa chọn ảnh" }, { status: 400 });
    }

    if (file.size > 7 * 1024 * 1024) {
      return json({ error: "Ảnh không được vượt quá 7MB" }, { status: 400 });
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
    ];

    if (!allowedTypes.includes(file.type)) {
      return json(
        { error: "Chỉ hỗ trợ JPG, PNG, WebP và AVIF" },
        { status: 400 },
      );
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const folder = "loi-hen-weddings";

    const signature = createHash("sha1")
      .update(`folder=${folder}&timestamp=${timestamp}${secret}`)
      .digest("hex");

    const body = new FormData();

    body.append(
      "file",
      new Blob([await file.arrayBuffer()], { type: file.type }),
      file.name || "wedding-photo.jpg",
    );

    body.append("folder", folder);
    body.append("timestamp", timestamp);
    body.append("api_key", key);
    body.append("signature", signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(
        cloud,
      )}/image/upload`,
      {
        method: "POST",
        body,
      },
    );

    const result = await response.json();

    if (!response.ok || !result.secure_url) {
      throw new Error(result.error?.message || "Cloudinary upload thất bại");
    }

    return json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      source: "cloudinary",
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);

    return json(
      { error: `Không thể tải ảnh: ${error.message}` },
      { status: 502 },
    );
  }
}
