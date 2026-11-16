import { Link, Form, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { requireAdmin } from "../lib/auth.server";
import { db } from "../lib/db.server";
import { findTemplate } from "../lib/templates";
export async function loader({ request }) {
  await requireAdmin(request);
  const invites = await db.invitation.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { responses: true, wishes: true } } },
  });
  const pendingCloudinary = await db.cloudinaryCleanup.count();

  return json({
    invites,
    pendingCloudinary,
  });
}
export const meta = () => [{ title: "Studio quản trị | Lời Hẹn" }];
export default function Admin() {
  const { invites, pendingCloudinary } = useLoaderData();
  return (
    <main className="admin-page">
      <aside className="admin-sidebar">
        <Link to="/" className="brand">
          lời hẹn<span>✦</span>
        </Link>
        <div className="sidebar-nav">
          <Link className="active" to="/admin">
            ▦ &nbsp; Tổng quan
          </Link>
          <Link to="/templates">♡ &nbsp; Kho mẫu thiệp</Link>
          <Link to="/admin/new">＋ &nbsp; Tạo thiệp mới</Link>
        </div>
        <div className="sidebar-bottom">
          <Form method="post" action="/admin/logout">
            <button className="sidebar-logout">Đăng xuất ↗</button>
          </Form>
        </div>
      </aside>
      <section className="admin-content">
        <div className="admin-topline">
          <span>STUDIO / OVERVIEW</span>
          <span>✦ &nbsp; Chế độ riêng tư</span>
        </div>
        <div className="dashboard-title">
          <div>
            <span className="eyebrow">WEDDING STUDIO</span>
            <h1>Quản lý thiệp cưới</h1>
            <p>Nơi mỗi lời mời bắt đầu hành trình của riêng mình.</p>
          </div>
          <Link className="button" to="/admin/new">
            ＋ Tạo thiệp mới
          </Link>
        </div>
        {pendingCloudinary > 0 && (
          <div className="cleanup-banner">
            <div>
              <strong>Cloudinary cần dọn dẹp</strong>
              <p>Còn {pendingCloudinary} ảnh chờ xóa hoặc cần thử lại.</p>
            </div>

            <Form method="post" action="/admin/cleanup">
              <button type="submit" className="button">
                Dọn ảnh Cloudinary
              </button>
            </Form>
          </div>
        )}
        <div className="stat-grid">
          <div className="stat-card">
            <span>Tổng thiệp</span>
            <strong>{invites.length}</strong>
            <small>Đã tạo trong studio</small>
          </div>
          <div className="stat-card">
            <span>Đang công khai</span>
            <strong>{invites.filter((x) => x.published).length}</strong>
            <small>Khách có thể truy cập</small>
          </div>
          <div className="stat-card">
            <span>Lượt xác nhận</span>
            <strong>
              {invites.reduce((a, x) => a + x._count.responses, 0)}
            </strong>
            <small>RSVP đã nhận</small>
          </div>
        </div>
        <div className="list-heading">
          <div>
            <h2>Thiệp của bạn</h2>
            <p>Chỉnh sửa, xem lời chúc hoặc chia sẻ đường dẫn.</p>
          </div>
          <Link to="/templates">Xem bộ mẫu →</Link>
        </div>
        {invites.length ? (
          <div className="invite-table">
            <div className="invite-table-head">
              <span>THIỆP</span>
              <span>MẪU</span>
              <span>TRẠNG THÁI</span>
              <span>KHÁCH</span>
              <span>THAO TÁC</span>
            </div>
            {invites.map((x) => (
              <div className="invite-table-row" key={x.id}>
                <div className="invitation-list-item">
                  {x.content?.coverImage ? (
                    <img
                      src={x.content.coverImage}
                      alt={x.title}
                      className="invitation-list-image"
                    />
                  ) : (
                    <div className="invitation-list-placeholder">♡</div>
                  )}

                  <div>
                    <strong>{x.title}</strong>
                    <small>/i/{x.slug}</small>
                  </div>
                </div>
                <span>{findTemplate(x.templateId)?.name || x.templateId}</span>
                <span>
                  <span
                    className={`status ${x.published ? "published" : "draft"}`}>
                    {x.published ? "Đã xuất bản" : "Bản nháp"}
                  </span>
                </span>
                <span>
                  {x._count.responses} RSVP · {x._count.wishes} lời chúc
                </span>
                <div className="table-actions">
                  <Link to={`/admin/invitations/${x.id}`}>Chỉnh sửa ↗</Link>
                  {x.published && (
                    <a href={`/i/${x.slug}`} target="_blank" rel="noreferrer">
                      Xem ↗
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div>✉</div>
            <h3>Chưa có thiệp nào cả</h3>
            <p>Hãy bắt đầu bằng một mẫu thật hợp với cặp đôi đầu tiên.</p>
            <Link className="button" to="/admin/new">
              Tạo thiệp đầu tiên ↗
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
