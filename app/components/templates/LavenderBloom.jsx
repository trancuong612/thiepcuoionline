import SignatureWeddingSections from "../SignatureWeddingSections";
import { safeUrl } from "../../lib/invitations";

function LavenderSprig({ flip = false }) {
  return (
    <svg
      className={`sig-lavender-sprig ${flip ? "is-flipped" : ""}`}
      viewBox="0 0 98 162"
      fill="none"
      aria-hidden="true">
      <path
        d="M36 154C37 124 45 91 66 25"
        stroke="#748267"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M36 132Q10 111 12 94M42 113Q76 107 81 91M47 93Q20 78 23 62"
        stroke="#748267"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      {Array.from({ length: 9 }, (_, i) => {
        const y = 18 + i * 10;
        const x = 66 - i * 2.1;
        return (
          <g key={i}>
            <ellipse
              cx={x - 5}
              cy={y + 3}
              rx="5"
              ry="9"
              transform={`rotate(-35 ${x - 5} ${y + 3})`}
              fill={i % 2 ? "#a08ab0" : "#c2a8ca"}
            />
            <ellipse
              cx={x + 5}
              cy={y + 5}
              rx="5"
              ry="9"
              transform={`rotate(35 ${x + 5} ${y + 5})`}
              fill={i % 2 ? "#bc9bbf" : "#927ba8"}
            />
          </g>
        );
      })}
      <path
        d="M36 132Q22 111 12 94M42 113Q63 100 81 91"
        stroke="#748267"
        strokeWidth="1"
      />
    </svg>
  );
}

export default function LavenderBloom({ data, preview, wishes, feedback }) {
  const cover = safeUrl(data.coverImage);
  const dateRaw = data.groomEventDate || data.eventDate || "";
  const date = dateRaw ? new Date(dateRaw) : null;
  const validDate = date && !Number.isNaN(date.getTime());
  const compactDate = validDate
    ? `${String(date.getDate()).padStart(2, "0")}.${String(
        date.getMonth() + 1,
      ).padStart(2, "0")}.${date.getFullYear()}`
    : "SAVE OUR DATE";

  return (
    <article className="invitation signature-wedding theme-lavender-bloom">
      <header className="sig-cover sig-lavender-cover">
        <div className="sig-lavender-floral-corners" aria-hidden="true">
          <LavenderSprig />
          <LavenderSprig flip />
        </div>
        <div className="sig-lavender-headline">
          <span className="sig-lavender-overline">
            THE BEGINNING OF FOREVER
          </span>
          <p className="sig-lavender-title">
            WEDDING
            <br />
            INVITATION
          </p>
          <span className="sig-lavender-date-top">{compactDate}</span>
          <span className="sig-lavender-fine-rule" aria-hidden="true" />
          <h1 className="sig-script sig-lavender-names">
            {data.bride} <em>&</em> {data.groom}
          </h1>
        </div>
        <div className="sig-lavender-portrait-wrap">
          <span className="sig-photo-corner sig-corner-tl" aria-hidden="true" />
          <span className="sig-photo-corner sig-corner-br" aria-hidden="true" />
          <div className="sig-lavender-frame">
            {cover ? (
              <img
                src={cover}
                alt={`Ảnh cưới của ${data.bride} và ${data.groom}`}
                fetchPriority="high"
              />
            ) : (
              <div className="sig-photo-placeholder">Our Forever</div>
            )}
          </div>
          <div className="sig-flower-badge" aria-hidden="true">
            ✿
          </div>
        </div>
        <div className="sig-lavender-signoff">
          <span>Two hearts, one soul</span>
          <p>
            {data.subtitle ||
              "Một hành trình, hai trái tim, một lời hẹn trọn đời."}
          </p>
          <a href="#sig-events" className="sig-lavender-scroll-link">
            KHÁM PHÁ THIỆP CƯỚI <span aria-hidden="true">↓</span>
          </a>
        </div>
      </header>
      <SignatureWeddingSections
        data={data}
        preview={preview}
        wishes={wishes}
        feedback={feedback}
        theme="lavender"
      />
    </article>
  );
}
