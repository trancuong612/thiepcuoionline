import { Link } from "@remix-run/react";
import { TEMPLATES } from "../lib/templates";
export const meta = () => [
  { title: "Lời Hẹn Studio | Thiệp cưới online" },
  {
    name: "description",
    content:
      "Thiết kế thiệp cưới trực tuyến tinh tế, cá nhân hóa trong vài phút.",
  },
];
export default function Home() {
  return (
    <main className="site-page">
      <nav className="site-nav">
        <Link to="/" className="brand">
          lời hẹn<span>✦</span>
        </Link>
        <div className="nav-links">
          <Link to="/templates">Bộ sưu tập</Link>
          <Link to="/admin">Quản trị ↗</Link>
        </div>
      </nav>
      <section className="home-hero">
        <div className="home-copy">
          <span className="eyebrow">WEDDING INVITATION ATELIER</span>
          <h1>
            Mỗi câu chuyện tình yêu xứng đáng một <em>lời hẹn</em> riêng.
          </h1>
          <p>
            Tạo thiệp cưới trực tuyến từ những thiết kế tinh tế. Thay tên, ngày
            cưới, hình ảnh và gửi đi lời mời thật đáng nhớ.
          </p>
          <div className="hero-actions">
            <Link className="button" to="/templates">
              Khám phá mẫu thiệp <span>↗</span>
            </Link>
            <Link className="text-button" to="/admin">
              Vào trang quản trị →
            </Link>
          </div>
          <div className="hero-note">
            <span>✦</span> Cá nhân hoá từng chi tiết <span>✦</span> Gửi link &
            QR <span>✦</span> RSVP & lời chúc
          </div>
        </div>
        <div className="hero-art">
          <div className="art-arch">
            <div className="arch-border">
              <span className="art-top">THE WEDDING OF</span>
              <b>
                Ngọc Anh
                <br />
                <i>&</i>
                <br />
                Minh Quân
              </b>
              <div className="art-line">✥</div>
              <span>14.02.2027</span>
            </div>
          </div>
          <div className="art-stamp">
            made with
            <br />
            love ♡
          </div>
          <div className="art-flower flower-one">✽</div>
          <div className="art-flower flower-two">❀</div>
        </div>
      </section>
      <section className="home-collection">
        <div className="section-heading">
          <span className="eyebrow">THE COLLECTION</span>
          <h2>Thiết kế có sẵn, dấu ấn chỉ riêng bạn.</h2>
          <p>
            Ba hướng thẩm mỹ khác nhau. Từ buổi lễ cổ điển, hiện đại đến đậm
            chất truyền thống.
          </p>
        </div>
        <div className="template-grid">
          {TEMPLATES.map((t) => (
            <Link
              to={`/templates/${t.id}`}
              className={`template-card thumb-${t.id}`}
              key={t.id}>
              <div className="template-thumb">
                <span className="thumb-overline">THE WEDDING OF</span>
                <b>{t.id === "traditional" ? "囍" : "N & M"}</b>
                <span className="thumb-subline">14 • 02 • 2027</span>
              </div>
              <div className="template-info">
                <div>
                  <h3>{t.name}</h3>
                  <small>{t.style}</small>
                </div>
                <span className="round-arrow">↗</span>
              </div>
            </Link>
          ))}
        </div>
        <div className="center">
          <Link className="button button-outline" to="/templates">
            Xem tất cả mẫu thiệp
          </Link>
        </div>
      </section>
      <footer className="site-footer">
        <span className="brand">
          lời hẹn<span>✦</span>
        </span>
        <small>Tạo nên những lời mời thật đáng nhớ. © 2026</small>
      </footer>
    </main>
  );
}
