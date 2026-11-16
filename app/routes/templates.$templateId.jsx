import { Link, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";

import { findTemplate } from "../lib/templates";
import { sampleContent } from "../lib/invitations";
import TemplateRenderer from "../components/TemplateRenderer";
import LoopMusic from "../components/LoopMusic";

export async function loader({ params }) {
  const template = findTemplate(params.templateId);

  if (!template) {
    throw new Response("Không tìm thấy mẫu", {
      status: 404,
    });
  }

  return json({ template });
}

export const meta = ({ data }) => [
  {
    title: `${data?.template?.name || "Template"} | Lời Hẹn`,
  },
];

export default function TemplateDemo() {
  const { template } = useLoaderData();

  const isSignatureTemplate = ["midnight-pearl", "lavender-bloom"].includes(
    template.id,
  );

  return (
    <div className="template-demo">
      <nav className="demo-nav">
        <Link to="/templates">← Về bộ sưu tập</Link>

        <div>
          <strong>{template.name}</strong>
          <span>{template.style}</span>
        </div>

        <Link className="button" to={`/admin/new?template=${template.id}`}>
          Dùng mẫu này ↗
        </Link>
      </nav>

      <div className="demo-body">
        <TemplateRenderer
          templateId={template.id}
          content={sampleContent}
          preview={true}
          showOpening={true}
        />

        {isSignatureTemplate && (
          <LoopMusic src="/music/vaycuoi.mp3" start={0} end={0} />
        )}
      </div>
    </div>
  );
}
