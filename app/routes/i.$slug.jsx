import { json } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import TemplateRenderer from "../components/TemplateRenderer";
import { db } from "../lib/db.server";
import { text, safeMusicUrl } from "../lib/invitations";
import LoopMusic from "../components/LoopMusic";
export async function loader({ params }) {
  const invite = await db.invitation.findUnique({
    where: { slug: params.slug },
    include: {
      wishes: {
        where: { approved: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });
  if (!invite || !invite.published)
    throw new Response("Not found", { status: 404 });
  return json({ invite });
}
export const meta = ({ data }) => [
  {
    title: data?.invite
      ? `${data.invite.content.bride} & ${data.invite.content.groom} | Lời Hẹn`
      : "Thiệp cưới",
  },
  {
    name: "description",
    content:
      data?.invite?.content?.subtitle ||
      "Trân trọng kính mời đến dự lễ thành hôn.",
  },
];
export async function action({ request, params }) {
  const invite = await db.invitation.findUnique({
    where: { slug: params.slug },
  });
  if (!invite || !invite.published)
    throw new Response("Not found", { status: 404 });
  const form = await request.formData();
  if (form.get("company"))
    return json({ type: "silent", message: "Cảm ơn bạn!" });
  const guestName = text(form.get("guestName"), 100);
  if (guestName.length < 2)
    return json(
      { type: "error", message: "Vui lòng nhập họ tên hợp lệ." },
      { status: 400 },
    );
  const intent = String(form.get("intent"));
  if (intent === "rsvp" && invite.content.showRsvp) {
    const guestSide =
      String(form.get("guestSide")) === "bride" ? "bride" : "groom";
    const attendance = String(form.get("attendance")) === "no" ? "no" : "yes";
    const partySize = Math.min(
      10,
      Math.max(
        1,
        Number.parseInt(String(form.get("partySize") || "1"), 10) || 1,
      ),
    );
    await db.response.create({
      data: {
        invitationId: invite.id,
        guestName,
        side: guestSide,
        attendance,
        partySize,
        note: text(form.get("note"), 1000),
      },
    });
    return json({
      type: "rsvp",
      message: "Đã gửi xác nhận. Cảm ơn bạn thật nhiều!",
    });
  }
  if (intent === "wish" && invite.content.showWishes) {
    const message = text(form.get("message"), 1000);
    if (message.length < 2)
      return json(
        { type: "error", message: "Lời chúc cần ít nhất 2 ký tự." },
        { status: 400 },
      );
    await db.wish.create({
      data: { invitationId: invite.id, guestName, message, approved: false },
    });
    return json({
      type: "wish",
      message: "Đã gửi lời chúc! Nội dung sẽ hiện sau khi được duyệt.",
    });
  }
  return json(
    { type: "error", message: "Thao tác không hợp lệ." },
    { status: 400 },
  );
}
export default function Published() {
  const { invite } = useLoaderData();
  const feedback = useActionData();
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!invite.content.eventDate) return;
    const calc = () => {
      const remain = new Date(invite.content.eventDate).getTime() - Date.now();
      if (remain <= 0) {
        setTimeLeft("Hạnh phúc đã bắt đầu ♡");
        return;
      }
      const days = Math.floor(remain / 86400000),
        hours = Math.floor((remain % 86400000) / 3600000),
        minutes = Math.floor((remain % 3600000) / 60000);
      setTimeLeft(`${days} ngày · ${hours} giờ · ${minutes} phút`);
    };
    calc();
    const timer = setInterval(calc, 60000);
    return () => clearInterval(timer);
  }, [invite.content.eventDate]);
  return (
    <div className="public-invitation">
      {timeLeft &&
        !["midnight-pearl", "lavender-bloom"].includes(invite.templateId) && (
          <div className="countdown-bar">♡ &nbsp; {timeLeft} &nbsp; ♡</div>
        )}
      <TemplateRenderer
        templateId={invite.templateId}
        content={invite.content}
        wishes={invite.wishes}
        feedback={
          feedback?.type === "error"
            ? { type: "rsvp", message: feedback.message }
            : feedback
        }
      />

      {(invite.content.musicUrl ||
        ["midnight-pearl", "lavender-bloom"].includes(invite.templateId)) && (
        <LoopMusic
          src={safeMusicUrl(invite.content.musicUrl) || "/music/vaycuoi.mp3"}
          start={
            safeMusicUrl(invite.content.musicUrl)
              ? invite.content.musicStart || 0
              : 0
          }
          end={
            safeMusicUrl(invite.content.musicUrl)
              ? invite.content.musicEnd || 0
              : 0
          }
        />
      )}
    </div>
  );
}
