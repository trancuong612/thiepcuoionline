import InvitationSections from "../InvitationSections";
import { prettyDate, safeUrl } from "../../lib/invitations";

export default function Minimal({ data, preview, wishes, feedback }) {
  const cover = safeUrl(data.coverImage);
  return (
    <article className="invitation theme-minimal">
      <header className="iv-hero minimal-hero-v2">
        <div className="minimal-top">
          <span>THE WEDDING EDITION</span>
          <span>EST. IN LOVE</span>
        </div>
        <div className="minimal-hero-grid">
          <div className="minimal-hero-copy">
            <span className="iv-mini">A STORY OF US</span>
            <h1>
              {data.bride}
              <span>&</span>
              {data.groom}
            </h1>
            <div className="minimal-dash" />
            <p>{data.subtitle}</p>
            <div className="minimal-info-line">
              <div>
                <small>DATE</small>
                <strong>{prettyDate(data.eventDate)}</strong>
              </div>
              <div>
                <small>VENUE</small>
                <strong>{data.venue}</strong>
              </div>
            </div>
          </div>
          <div className="minimal-cover editorial-frame">
            {cover ? (
              <img src={cover} alt="Ảnh cô dâu và chú rể" />
            ) : (
              <span>
                THE
                <br />
                WEDDING
                <br />
                EDITION
              </span>
            )}
            <span className="editorial-badge">LOVE · 2027</span>
          </div>
        </div>
        <div className="minimal-bottom">
          <span>FOREVER STARTS HERE</span>
          <span>♡</span>
        </div>
      </header>
      <InvitationSections
        data={data}
        preview={preview}
        wishes={wishes}
        feedback={feedback}
      />
    </article>
  );
}
