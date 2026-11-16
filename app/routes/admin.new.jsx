import { json, redirect } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { randomBytes } from "node:crypto";
import { requireAdmin } from "../lib/auth.server";
import { db } from "../lib/db.server";
import {
  sampleContent,
  sanitizeContent,
  slugify,
  text,
} from "../lib/invitations";
import { findTemplate } from "../lib/templates";
import EditorForm from "../components/EditorForm";
export async function loader({ request }) {
  await requireAdmin(request);
  const url = new URL(request.url);
  const template = url.searchParams.get("template");
  return json({ templateId: findTemplate(template)?.id || "romantic" });
}
export async function action({ request }) {
  await requireAdmin(request);
  const form = await request.formData();
  let payload;
  try {
    payload = JSON.parse(String(form.get("payload") || "{}"));
  } catch {
    return json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }
  const content = sanitizeContent(payload);
  if (!content.bride || !content.groom || !content.eventDate)
    return json(
      { error: "Nhập tên cô dâu, chú rể và ngày giờ cưới." },
      { status: 400 },
    );
  const templateId = String(form.get("templateId") || "");
  if (
    ["midnight-pearl", "lavender-bloom"].includes(templateId) &&
    (!content.groomEventDate ||
      !content.brideEventDate ||
      !content.groomVenue ||
      !content.brideVenue ||
      !content.groomAddress ||
      !content.brideAddress)
  )
    return json(
      { error: "Cần nhập ngày giờ, địa điểm và địa chỉ cho cả hai buổi lễ." },
      { status: 400 },
    );
  if (!findTemplate(templateId))
    return json({ error: "Mẫu thiệp không hợp lệ." }, { status: 400 });
  const title =
    text(form.get("title"), 140) || `${content.bride} & ${content.groom}`;
  let slug = slugify(form.get("slug") || `${content.bride}-${content.groom}`);
  if (await db.invitation.findUnique({ where: { slug } }))
    slug = `${slug.slice(0, 55)}-${randomBytes(3).toString("hex")}`;
  const invite = await db.invitation.create({
    data: { title, slug, templateId, content, published: false },
  });
  return redirect(`/admin/invitations/${invite.id}?created=1`);
}
export default function NewInvitation() {
  const { templateId } = useLoaderData();
  const a = useActionData();
  return (
    <EditorForm
      initial={{ templateId, content: sampleContent }}
      formError={a?.error}
    />
  );
}
