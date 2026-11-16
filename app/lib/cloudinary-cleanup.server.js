import { db } from "./db.server";

const FOLDER = "loi-hen-weddings";

// Chỉ nhận ảnh do website upload vào thư mục riêng.
export function getCloudinaryPublicId(value) {
  if (!value || typeof value !== "string") return null;

  const cloud = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  if (!cloud) return null;

  try {
    const url = new URL(value);

    if (url.protocol !== "https:" || url.hostname !== "res.cloudinary.com")
      return null;

    const parts = url.pathname.split("/").filter(Boolean);

    if (parts[0] !== cloud || parts[1] !== "image" || parts[2] !== "upload")
      return null;

    const versionIndex = parts.findIndex(
      (part, i) => i >= 3 && /^v\d+$/.test(part),
    );

    if (versionIndex < 0) return null;

    const filename = decodeURIComponent(
      parts.slice(versionIndex + 1).join("/"),
    );

    if (!filename.startsWith(`${FOLDER}/`)) return null;

    const publicId = filename.replace(/\.[a-z0-9]+$/i, "");

    if (!/^loi-hen-weddings\/[a-z0-9/_-]+$/i.test(publicId)) return null;

    return publicId;
  } catch {
    return null;
  }
}

export function getImageIds(content = {}) {
  const images = [
    content?.coverImage,
    content?.giftQrImage,
    content?.groomGiftQrImage,
    content?.brideGiftQrImage,
    ...(Array.isArray(content?.gallery) ? content.gallery : []),
  ];

  return [...new Set(images.map(getCloudinaryPublicId).filter(Boolean))];
}

async function destroyImage(publicId) {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const key = process.env.CLOUDINARY_API_KEY?.trim();
  const secret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (!cloud || !key || !secret) {
    throw new Error("Thiếu cấu hình Cloudinary");
  }

  const auth = Buffer.from(`${key}:${secret}`).toString("base64");

  const body = new URLSearchParams({
    public_id: publicId,
    invalidate: "true",
  });

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(
      cloud,
    )}/image/destroy`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
      signal: AbortSignal.timeout(15000),
    },
  );

  const result = await response.json();

  if (!response.ok || !["ok", "not found"].includes(result.result)) {
    throw new Error(
      result.error?.message ||
        `Cloudinary trả về: ${result.result || response.status}`,
    );
  }

  return true;
}

// Xử lý tối đa 25 ảnh trong một lượt.
// Ảnh thất bại được giữ lại để thử xóa tiếp.
export async function cleanupCloudinaryAssets() {
  const jobs = await db.cloudinaryCleanup.findMany({
    orderBy: { createdAt: "asc" },
    take: 25,
  });

  if (!jobs.length) return 0;

  // Không xóa ảnh đang được một thiệp khác sử dụng.
  const invitations = await db.invitation.findMany({
    select: { content: true },
  });

  const inUse = new Set(
    invitations.flatMap((item) => getImageIds(item.content)),
  );

  // Giới hạn 5 yêu cầu Cloudinary song song.
  for (let i = 0; i < jobs.length; i += 5) {
    const batch = jobs.slice(i, i + 5);

    await Promise.all(
      batch.map(async (job) => {
        try {
          if (!inUse.has(job.publicId)) {
            await destroyImage(job.publicId);
          }

          await db.cloudinaryCleanup.delete({
            where: { publicId: job.publicId },
          });
        } catch (error) {
          await db.cloudinaryCleanup.update({
            where: { publicId: job.publicId },
            data: {
              attempts: { increment: 1 },
              lastError: String(error.message).slice(0, 500),
            },
          });
        }
      }),
    );
  }

  return db.cloudinaryCleanup.count();
}
