import { Link } from "@remix-run/react";
import { TEMPLATES } from "../lib/templates";
export const meta = () => [{ title: "Bộ sưu tập | Lời Hẹn" }];
export default function Templates() {
  return (
    <main className="site-page">
      <nav className="site-nav">
        <Link to="/" className="brand">
          lời hẹn<span>✦</span>
        </Link>
        <div className="nav-links">
          <Link to="/">Trang chủ</Link>
          <Link to="/admin">Quản trị ↗</Link>
        </div>
      </nav>
      <section className="page-heading">
        <span className="eyebrow">CHOOSE YOUR STYLE</span>
        <h1>Chọn một lời hẹn thật riêng.</h1>
        <p>Bộ sưu tập thiết kế được chăm chút cho từng phong cách lễ cưới.</p>
      </section>
      <div className="template-grid templates-page-grid">
        {TEMPLATES.map((t) => (
          <Link
            className={`template-card thumb-${t.id}`}
            to={`/templates/${t.id}`}
            key={t.id}>
            <div
              className="template-thumb"
              style={{
                backgroundImage: `linear-gradient(
    rgba(0,0,0,0.10),
    rgba(0,0,0,0.28)
  ), url(${
    t.id === "romantic"
      ? "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=85"
      : t.id === "minimal"
      ? "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=800&q=85"
      : t.id === "midnight-pearl"
      ? "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800&q=85"
      : t.id === "lavender-bloom"
      ? "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=85"
      : "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800&q=85"
  })`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                color: "#ffffff",
              }}>
              <span className="thumb-overline">THE WEDDING OF</span>
              <b>{t.id === "traditional" ? "囍" : "N & M"}</b>
              <span className="thumb-subline">14 • 02 • 2027</span>
            </div>
            <div className="template-info">
              <div>
                <span className="eyebrow">{t.badge}</span>
                <h3>{t.name}</h3>
                <small>{t.description}</small>
              </div>
              <span className="round-arrow">↗</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
