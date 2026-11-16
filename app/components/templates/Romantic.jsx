import InvitationSections from "../InvitationSections";
import { prettyDate, safeUrl } from "../../lib/invitations";

export default function Romantic({ data, preview, wishes, feedback }) {
  const bg = safeUrl(data.coverImage);

  return (
    <article className="invitation theme-romantic">
      <header
        className={`iv-hero romantic-hero ${bg ? "iv-hero-photo" : ""}`}
        style={
          bg
            ? {
                backgroundImage: `linear-gradient(rgba(44,30,28,.28),rgba(44,30,28,.45)),url('${bg}')`,
              }
            : undefined
        }>
        <div className="romantic-petal petal-a">✿</div>
        <div className="romantic-petal petal-b">✦</div>
        <div className="romantic-petal petal-c">❀</div>

        <div className="iv-hero-inner romantic-inner">
          <span className="iv-mini">THE WEDDING OF</span>

          <div className="romantic-ornament">❦</div>

          <h1>
            {data.bride}
            <span>&</span>
            {data.groom}
          </h1>

          <p>{data.subtitle}</p>

          <div className="romantic-date-card">
            <small>SAVE OUR DATE</small>
            <strong>{prettyDate(data.eventDate)}</strong>
          </div>

          <a className="iv-scroll romantic-scroll" href="#story">
            Khám phá câu chuyện ↓
          </a>
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
