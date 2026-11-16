export const sampleContent = {
  bride: "Cô Dâu",
  groom: "Chú Rể",
  brideParents: "Ông Nguyễn Văn An & Bà Trần Thị Hòa",
  groomParents: "Ông Phạm Văn Bình & Bà Lê Thị Mai",
  subtitle: "Trân trọng kính mời đến dự lễ thành hôn của chúng mình",
  story:
    "Có những cuộc gặp gỡ thật tình cờ, nhưng lại trở thành lời hẹn của cả một đời. Cảm ơn bạn đã là một phần trong câu chuyện của chúng mình.",
  eventTitle: "Lễ thành hôn",
  eventDate: "2027-02-14T10:30",
  venue: "Trung tâm tiệc cưới Hoa Hồng",
  address: "Hà Nội, Việt Nam",
  mapUrl: "https://www.google.com/maps",
  coverImage: "",
  gallery: [],
  musicUrl: "",
  musicStart: 0,
  musicEnd: 0,
  giftBank: "",
  giftName: "",
  giftAccount: "",
  giftQrImage: "",
  showRsvp: true,
  showWishes: true,
  showGift: false,
  groomEventDate: "2027-02-14T10:30",
  groomEventTitle: "Lễ thành hôn nhà trai",
  groomVenue: "Tư gia nhà trai",
  groomAddress: "Hà Nội, Việt Nam",
  groomMapUrl: "",
  brideEventDate: "2027-02-13T16:00",
  brideEventTitle: "Lễ vu quy nhà gái",
  brideVenue: "Tư gia nhà gái",
  brideAddress: "Hà Nội, Việt Nam",
  brideMapUrl: "",
  timeline: [
    { time: "10:30", title: "Đón khách" },
    { time: "11:00", title: "Cử hành hôn lễ" },
    { time: "11:30", title: "Khai tiệc" },
    { time: "12:30", title: "Giao lưu & chụp ảnh" },
  ],
  dressCodeColors: ["#f4f0e6", "#c2c6b5", "#d3b5ae", "#233e61"],
  groomGiftBank: "",
  groomGiftName: "",
  groomGiftAccount: "",
  groomGiftQrImage: "",
  brideGiftBank: "",
  brideGiftName: "",
  brideGiftAccount: "",
  brideGiftQrImage: "",
};

export function safeUrl(value) {
  if (!value || typeof value !== "string") return "";

  const src = value.trim();

  // Ảnh upload trong public/uploads
  // Nhạc trong public/music
  if (
    /^\/(?:uploads|music)\/[a-zA-Z0-9/_-]+\.[a-zA-Z0-9]+$/.test(src) &&
    !src.includes("..")
  ) {
    return src;
  }

  // Link ảnh bên ngoài
  try {
    const url = new URL(src);

    if (url.protocol === "http:" || url.protocol === "https:") {
      return url.href;
    }
  } catch {
    return "";
  }

  return "";
}

export function text(value, max = 500) {
  return String(value ?? "")
    .trim()
    .slice(0, max);
}

export function safeMusicUrl(value) {
  const src = String(value || "").trim();

  if (src.startsWith("/music/")) {
    const encodedName = src.slice("/music/".length);

    try {
      const filename = decodeURIComponent(encodedName);

      if (
        !filename ||
        filename.includes("/") ||
        filename.includes("\\") ||
        !filename.toLowerCase().endsWith(".mp3")
      ) {
        return "";
      }

      return `/music/${encodeURIComponent(filename)}`;
    } catch {
      return "";
    }
  }

  // Giữ tương thích với các thiệp cũ dùng URL ngoài.
  return safeUrl(src);
}

export function musicSeconds(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) return 0;

  return Math.round(Math.max(0, Math.min(number, 36000)) * 10) / 10;
}

function eventDate(value) {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(String(value || "")) &&
    !Number.isNaN(new Date(value).getTime())
    ? value
    : "";
}

function sanitizedTimeline(value) {
  return Array.isArray(value)
    ? value
        .slice(0, 12)
        .map((item) => ({
          time: text(item?.time, 30),
          title: text(item?.title, 100),
        }))
        .filter((item) => item.title)
    : [];
}

function sanitizedColors(value) {
  return Array.isArray(value)
    ? value.slice(0, 6).filter((color) => /^#[0-9a-fA-F]{6}$/.test(color))
    : [];
}

export function sanitizeContent(input) {
  const data =
    input && typeof input === "object" && !Array.isArray(input) ? input : {};
  return {
    bride: text(data.bride, 100),
    groom: text(data.groom, 100),
    brideParents: text(data.brideParents, 200),
    groomParents: text(data.groomParents, 200),
    subtitle: text(data.subtitle, 300),
    story: text(data.story, 2500),
    eventTitle: text(data.eventTitle, 100),
    eventDate: eventDate(data.eventDate) || eventDate(data.groomEventDate),
    venue: text(data.venue, 200),
    address: text(data.address, 500),
    mapUrl: safeUrl(data.mapUrl),
    coverImage: safeUrl(data.coverImage),
    gallery: Array.isArray(data.gallery)
      ? data.gallery.slice(0, 18).map(safeUrl).filter(Boolean)
      : [],
    musicUrl: safeMusicUrl(data.musicUrl),
    musicStart: musicSeconds(data.musicStart),
    musicEnd: musicSeconds(data.musicEnd),
    giftBank: text(data.giftBank, 100),
    giftName: text(data.giftName, 100),
    giftAccount: text(data.giftAccount, 100),
    giftQrImage: safeUrl(data.giftQrImage),
    showRsvp: Boolean(data.showRsvp),
    showWishes: Boolean(data.showWishes),
    showGift: Boolean(data.showGift),
    groomEventDate: eventDate(data.groomEventDate),
    groomEventTitle: text(data.groomEventTitle, 100),
    groomVenue: text(data.groomVenue, 200),
    groomAddress: text(data.groomAddress, 500),
    groomMapUrl: safeUrl(data.groomMapUrl),
    brideEventDate: eventDate(data.brideEventDate),
    brideEventTitle: text(data.brideEventTitle, 100),
    brideVenue: text(data.brideVenue, 200),
    brideAddress: text(data.brideAddress, 500),
    brideMapUrl: safeUrl(data.brideMapUrl),
    timeline: sanitizedTimeline(data.timeline),
    dressCodeColors: sanitizedColors(data.dressCodeColors),
    groomGiftBank: text(data.groomGiftBank, 100),
    groomGiftName: text(data.groomGiftName, 100),
    groomGiftAccount: text(data.groomGiftAccount, 100),
    groomGiftQrImage: safeUrl(data.groomGiftQrImage),
    brideGiftBank: text(data.brideGiftBank, 100),
    brideGiftName: text(data.brideGiftName, 100),
    brideGiftAccount: text(data.brideGiftAccount, 100),
    brideGiftQrImage: safeUrl(data.brideGiftQrImage),
  };
}

export function slugify(value) {
  const s = String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
  return s || "thiep-cuoi";
}

export function prettyDate(value) {
  if (!value) return "Chờ ngày chung đôi";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chờ ngày chung đôi";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
