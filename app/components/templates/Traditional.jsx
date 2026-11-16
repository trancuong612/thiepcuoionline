import InvitationSections from "../InvitationSections";
import { prettyDate, safeUrl } from "../../lib/invitations";
export default function Traditional({ data, preview, wishes, feedback }) {
  return <article className="invitation theme-traditional"><header className="iv-hero"><div className="traditional-corner a">✿</div><div className="traditional-corner b">✿</div><div className="iv-hero-inner"><span className="iv-mini">THƯ MỜI THÀNH HÔN</span><div className="traditional-double">囍</div><p className="traditional-title">Trăm năm hạnh phúc</p><h1>{data.bride}<span>❦</span>{data.groom}</h1><p>{data.subtitle}</p><div className="iv-hero-date">{prettyDate(data.eventDate)}</div>{safeUrl(data.coverImage) && <img className="traditional-portrait" src={safeUrl(data.coverImage)} alt="Ảnh cặp đôi" />}</div></header><InvitationSections data={data} preview={preview} wishes={wishes} feedback={feedback}/></article>;
}
