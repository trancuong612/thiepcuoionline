import SignatureWeddingSections from "../SignatureWeddingSections";
import { safeUrl } from "../../lib/invitations";

function Pearls({ className = "" }) {
  return (
    <svg
      className={`sig-pearl-drape ${className}`}
      viewBox="0 0 400 105"
      fill="none"
      aria-hidden="true">
      <path
        d="M-15 2 C100 110 260 110 413 0"
        stroke="#f7f0df"
        strokeWidth="1.2"
        strokeDasharray="1 5"
        strokeLinecap="round"
      />
      <path
        d="M-15 24 C130 122 265 96 418 10"
        stroke="#d8cbbb"
        strokeWidth="1.1"
        strokeDasharray="1 7"
        strokeLinecap="round"
      />
      {Array.from({ length: 13 }, (_, i) => (
        <circle
          key={i}
          cx={28 + i * 27}
          cy={18 + 40 * Math.sin((i / 12) * Math.PI)}
          r={2.7 + (i % 3) * 0.7}
          fill="#f9f5eb"
          stroke="#d1c6b7"
          strokeWidth=".5"
        />
      ))}
    </svg>
  );
}

export default function MidnightPearl({ data, preview, wishes, feedback }) {
  const cover = safeUrl(data.coverImage);
  const weddingDate = data.groomEventDate || data.eventDate || "";
  const date = weddingDate ? new Date(weddingDate) : null;
  const dateValid = date && !Number.isNaN(date.getTime());
  const day = dateValid
    ? new Intl.DateTimeFormat("vi-VN", { day: "2-digit" }).format(date)
    : "--";
  const month = dateValid
    ? new Intl.DateTimeFormat("vi-VN", { month: "long" }).format(date)
    : "tháng --";
  const year = dateValid ? date.getFullYear() : "----";

  return (
    <article className="invitation signature-wedding theme-midnight-pearl">
      <header className="sig-cover sig-midnight-cover">
        <div className="sig-photo-full sig-midnight-photo">
          {cover ? (
            <img
              src={cover}
              alt={`Ảnh cưới của ${data.bride} và ${data.groom}`}
              fetchPriority="high"
            />
          ) : (
            <div className="sig-hero-placeholder">Our love story</div>
          )}
          <div className="sig-photo-shade" aria-hidden="true" />
          <div className="sig-hero-engraving" aria-hidden="true">
            ✧ &nbsp; THE WEDDING &nbsp; ✧
          </div>
          <div className="sig-cover-caption">
            <span className="sig-script sig-midnight-names">
              {data.bride}
              <em> & </em>
              {data.groom}
            </span>
            <small>WE ARE GETTING MARRIED</small>
          </div>
        </div>

        <div className="sig-midnight-envelope">
          <Pearls className="sig-pearl-left" />
          <span
            className="sig-mini-sparkle sig-mini-sparkle-one"
            aria-hidden="true">
            ✧
          </span>
          <span
            className="sig-mini-sparkle sig-mini-sparkle-two"
            aria-hidden="true">
            ✦
          </span>
          <div className="sig-save-paper">
            <span className="sig-save-top">
              TO OUR DEAREST FAMILY & FRIENDS
            </span>
            <span className="sig-script sig-save-script">Save the Date</span>
            <p className="sig-save-name">
              {data.bride} <span>&</span> {data.groom}
            </p>
            <div className="sig-save-date">
              <span>{month}</span>
              <strong>{day}</strong>
              <span>{year}</span>
            </div>
            <p className="sig-save-message">
              Trân trọng kính mời bạn đến chung vui trong ngày hạnh phúc của
              chúng mình.
            </p>
            <a href="#sig-events" className="sig-outline sig-invite-link">
              XEM THƯ MỜI <span aria-hidden="true">↗</span>
            </a>
            <span className="sig-wax-stamp" aria-hidden="true">
              L♡H
            </span>
          </div>
          <span className="sig-midnight-bottomline">
            TOGETHER, ALWAYS AND FOREVER
          </span>
        </div>
      </header>
      <SignatureWeddingSections
        data={data}
        preview={preview}
        wishes={wishes}
        feedback={feedback}
        theme="midnight"
      />
    </article>
  );
}
