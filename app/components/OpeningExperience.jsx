import { useEffect, useRef, useState } from "react";
import { prettyDate, safeUrl } from "../lib/invitations";

const DEMO_COVERS = {
  romantic:
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=1000&q=85",
  minimal:
    "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=1000&q=85",
  traditional:
    "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=1000&q=85",
  "midnight-pearl":
    "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=1000&q=85",
  "lavender-bloom":
    "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1000&q=85",
};

const THEMES = {
  romantic: {
    eyebrow: "A LOVE LETTER",
    ornament: "❦",
    title: "Our Wedding",
    button: "Mở lời hẹn",
    footer: "A beautiful beginning",
  },
  minimal: {
    eyebrow: "THE WEDDING EDITION",
    ornament: "01 / LOVE",
    title: "A Story of Us",
    button: "Khám phá câu chuyện",
    footer: "An invitation to remember",
  },
  "midnight-pearl": {
    eyebrow: "MIDNIGHT PEARL",
    ornament: "✧",
    title: "Our Forever Begins",
    button: "Mở lời hẹn",
    footer: "A timeless love story",
  },
  "lavender-bloom": {
    eyebrow: "LAVENDER BLOOM",
    ornament: "❀",
    title: "Two Hearts, One Soul",
    button: "Mở thiệp cưới",
    footer: "Blooming in love",
  },
  traditional: {
    eyebrow: "THƯ MỜI THÀNH HÔN",
    ornament: "囍",
    title: "Trăm năm hạnh phúc",
    button: "Mở hỷ thiếp",
    footer: "Trăm năm tình viên mãn",
  },
};

export default function OpeningExperience({
  variant = "romantic",
  data = {},
  demo = false,
}) {
  const themeKey = THEMES[variant] ? variant : "romantic";
  const theme = THEMES[themeKey];

  const [phase, setPhase] = useState("closed");
  const timerRef = useRef(null);
  const buttonRef = useRef(null);

  const bride = String(data?.bride || "").trim() || "Tên cô dâu";
  const groom = String(data?.groom || "").trim() || "Tên chú rể";

  const cover =
    safeUrl(data?.coverImage) || (demo ? DEMO_COVERS[themeKey] : "");

  function openInvitation() {
    if (phase !== "closed") return;

    // Kích hoạt nhạc ngay trong thao tác của khách, đồng thời lên lịch tự cuộn.
    window.dispatchEvent(
      new CustomEvent("loihen:open", { detail: { variant: themeKey } }),
    );
    setPhase("leaving");

    const duration = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches
      ? 0
      : themeKey === "traditional"
      ? 1250
      : 980;

    timerRef.current = window.setTimeout(() => {
      setPhase("done");
    }, duration);
  }

  // Khóa cuộn trang trong lúc thiệp chưa mở
  useEffect(() => {
    if (phase === "done") return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    if (phase === "closed") {
      buttonRef.current?.focus({ preventScroll: true });
    }

    function handleKeyDown(event) {
      if (event.key === "Escape" && phase === "closed") {
        openInvitation();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [phase]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      className={`wedding-opening opening-${themeKey} ${
        phase === "leaving" ? "is-leaving" : ""
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Mở thiệp cưới">
      <div className="opening-light opening-light-one" />
      <div className="opening-light opening-light-two" />

      <div className="opening-content">
        <div className="opening-paper">
          {cover && (
            <img
              src={cover}
              className="opening-photo"
              alt=""
              aria-hidden="true"
            />
          )}

          <div className="opening-photo-shade" />

          {/* Nắp phong bao dùng cho mẫu truyền thống */}
          <div className="opening-envelope-flap" aria-hidden="true" />

          <div className="opening-topline">
            <span>{theme.eyebrow}</span>
            <span>✧</span>
          </div>

          <div className="opening-center">
            <div className="opening-ornament">{theme.ornament}</div>

            <p className="opening-title">{theme.title}</p>

            <h2 className="opening-names">
              <span>{bride}</span>
              <em>&</em>
              <span>{groom}</span>
            </h2>

            <div className="opening-divider">
              <span>✦</span>
            </div>

            <p className="opening-date">{prettyDate(data?.eventDate)}</p>
          </div>

          <div className="opening-paper-footer">{theme.footer}</div>
        </div>

        <div className="opening-actions">
          <button
            ref={buttonRef}
            className="opening-enter"
            type="button"
            onClick={openInvitation}
            disabled={phase === "leaving"}>
            <span>{theme.button}</span>
            <span className="opening-button-icon">♡</span>
          </button>

          <button
            type="button"
            className="opening-skip"
            onClick={openInvitation}
            disabled={phase === "leaving"}>
            Bỏ qua giới thiệu
          </button>
        </div>
      </div>
    </div>
  );
}
