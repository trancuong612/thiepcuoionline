import { json, redirect } from "@remix-run/node";
import { Link, Form, useActionData, useLoaderData } from "@remix-run/react";
import { QRCodeSVG } from "qrcode.react";
import EditorForm from "../components/EditorForm";
import { requireAdmin } from "../lib/auth.server";
import { db } from "../lib/db.server";
import { sanitizeContent, slugify, text } from "../lib/invitations";
import { findTemplate } from "../lib/templates";
import {
  getImageIds,
  cleanupCloudinaryAssets,
} from "../lib/cloudinary-cleanup.server";
export async function loader({ request, params }) {
  await requireAdmin(request);
  const invite = await db.invitation.findUnique({
    where: { id: params.id },
    include: {
      responses: { orderBy: { createdAt: "desc" }, take: 100 },
      wishes: { orderBy: { createdAt: "desc" }, take: 100 },
    },
  });
  if (!invite) throw new Response("Not found", { status: 404 });
  return json({
    invite,
    publicUrl: `${
      process.env.APP_URL?.replace(/\/$/, "") || new URL(request.url).origin
    }/i/${invite.slug}`,
  });
}
export async function action({ request, params }) {
  await requireAdmin(request);
  const invite = await db.invitation.findUnique({ where: { id: params.id } });
  if (!invite) throw new Response("Not found", { status: 404 });
  const form = await request.formData();
  const intent = String(form.get("intent") || "save");

  if (intent === "delete") {
    // Lấy các ảnh đang thuộc thiệp này.
    const publicIds = getImageIds(invite.content);

    // Ghi tác vụ dọn ảnh và xóa thiệp trong một transaction.
    await db.$transaction(async (tx) => {
      if (publicIds.length) {
        await tx.cloudinaryCleanup.createMany({
          data: publicIds.map((publicId) => ({ publicId })),
          skipDuplicates: true,
        });
      }

      await tx.invitation.delete({
        where: { id: invite.id },
      });
    });

    // Thử dọn Cloudinary ngay sau khi xóa thiệp.
    // Nếu thất bại, tác vụ vẫn nằm trong database.
    await cleanupCloudinaryAssets();

    return redirect("/admin?deleted=1");
  }

  if (intent === "unpublish") {
    await db.invitation.update({
      where: { id: invite.id },
      data: { published: false },
    });
    return redirect(`/admin/invitations/${invite.id}`);
  }
  if (intent.startsWith("approve:")) {
    const id = intent.slice(8);
    await db.wish.updateMany({
      where: { id, invitationId: invite.id },
      data: { approved: true },
    });
    return redirect(`/admin/invitations/${invite.id}#guestbook`);
  }
  if (intent.startsWith("hide:")) {
    const id = intent.slice(5);
    await db.wish.updateMany({
      where: { id, invitationId: invite.id },
      data: { approved: false },
    });
    return redirect(`/admin/invitations/${invite.id}#guestbook`);
  }
  let payload;
  try {
    payload = JSON.parse(String(form.get("payload") || "{}"));
  } catch {
    return json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }
  const content = sanitizeContent(payload);
  if (!content.bride || !content.groom || !content.eventDate)
    return json(
      { error: "Thiếu tên cô dâu, chú rể hoặc ngày giờ cưới." },
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
  ) {
    return json(
      { error: "Cần nhập ngày giờ, địa điểm và địa chỉ của cả hai buổi lễ." },
      { status: 400 },
    );
  }
  if (!findTemplate(templateId))
    return json({ error: "Mẫu thiệp không hợp lệ" }, { status: 400 });
  const slug = slugify(form.get("slug") || `${content.bride}-${content.groom}`);
  const other = await db.invitation.findUnique({ where: { slug } });
  if (other && other.id !== invite.id)
    return json(
      { error: "Địa chỉ thiệp đã được sử dụng. Hãy đổi slug." },
      { status: 409 },
    );
  await db.invitation.update({
    where: { id: invite.id },
    data: {
      title: text(form.get("title"), 140),
      templateId,
      slug,
      content,
      published: intent === "publish" ? true : invite.published,
    },
  });
  return redirect(`/admin/invitations/${invite.id}?saved=1`);
}
export default function EditInvitation() {
  const { invite, publicUrl } = useLoaderData();
  const a = useActionData();
  return (
    <>
      <div className="edit-status-bar">
        <span className={`status ${invite.published ? "published" : "draft"}`}>
          {invite.published ? "● Đã công khai" : "● Bản nháp"}
        </span>
        <span>
          {invite.published
            ? "Khách có thể xem thiệp qua link"
            : "Chỉ bạn có thể xem trước thiệp"}
        </span>
        {invite.published && (
          <>
            <a href={publicUrl} target="_blank" rel="noreferrer">
              Xem thiệp ↗
            </a>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(publicUrl)}>
              Sao chép link
            </button>
          </>
        )}
      </div>
      <EditorForm
        key={invite.id}
        initial={invite}
        invitationId={invite.id}
        formError={a?.error}
      />
      <section className="after-editor">
        <div className="admin-extra-heading">
          <div>
            <h2>Xuất bản & quản lý khách</h2>
            <p>Các xác nhận tham dự và lời chúc thuộc về riêng thiệp này.</p>
          </div>
          <Link to="/admin">← Studio</Link>
        </div>
        {invite.published && (
          <div className="published-box">
            <div className="qr-card">
              <QRCodeSVG value={publicUrl} size={142} />
            </div>
            <div>
              <h3>Link thiệp cưới</h3>
              <a href={publicUrl} target="_blank" rel="noreferrer">
                {publicUrl}
              </a>
              <p>In mã QR này vào thiệp giấy hoặc gửi đường dẫn trực tiếp.</p>
              <Form method="post">
                <button
                  className="button button-outline"
                  name="intent"
                  value="unpublish">
                  Ẩn thiệp khỏi công khai
                </button>
              </Form>
            </div>
          </div>
        )}
        <div className="guest-list">
          <h3>
            Khách xác nhận tham dự ({invite.responses.length}
            {invite.responses.length === 100 ? "+" : ""})
          </h3>
          {invite.responses.length ? (
            <div className="response-list">
              {invite.responses.map((r) => (
                <div key={r.id}>
                  <b>{r.guestName}</b>
                  <span>
                    {r.side === "bride"
                      ? "Nhà gái · "
                      : r.side === "groom"
                      ? "Nhà trai · "
                      : ""}
                    {r.attendance === "yes"
                      ? `Có tham dự · ${r.partySize} người`
                      : "Không tham dự"}
                  </span>
                  <small>{r.note}</small>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted">Chưa có phản hồi.</p>
          )}
        </div>
        <div className="guest-list" id="guestbook">
          <h3>
            Duyệt lời chúc ({invite.wishes.length}
            {invite.wishes.length === 100 ? "+" : ""})
          </h3>
          <p className="muted">
            Lời chúc mới được giữ ẩn cho đến khi bạn duyệt.
          </p>
          {invite.wishes.length ? (
            <div className="response-list">
              {invite.wishes.map((w) => (
                <div key={w.id}>
                  <b>
                    {w.guestName}{" "}
                    <span
                      className={`status ${
                        w.approved ? "published" : "draft"
                      }`}>
                      {w.approved ? "Đã duyệt" : "Chờ duyệt"}
                    </span>
                  </b>
                  <p>{w.message}</p>
                  <Form method="post">
                    <button
                      className="small-action"
                      name="intent"
                      value={`${w.approved ? "hide" : "approve"}:${w.id}`}>
                      {w.approved ? "Ẩn lời chúc" : "Duyệt hiển thị"}
                    </button>
                  </Form>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted">Chưa có lời chúc.</p>
          )}
        </div>
        <details className="danger-zone">
          <summary>Xóa thiệp vĩnh viễn</summary>
          <p>
            Thao tác này sẽ xóa vĩnh viễn thiệp, lời chúc, danh sách xác nhận
            tham dự và yêu cầu xóa các ảnh Cloudinary riêng của thiệp.
          </p>
          <Form
            method="post"
            onSubmit={(e) => {
              if (
                !window.confirm("Bạn chắc chắn muốn xóa vĩnh viễn thiệp này?")
              )
                e.preventDefault();
            }}>
            <button
              type="submit"
              className="button-danger"
              name="intent"
              value="delete">
              Xóa vĩnh viễn
            </button>
          </Form>
        </details>
      </section>
    </>
  );
}
