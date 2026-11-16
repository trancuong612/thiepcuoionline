import { Form } from "@remix-run/react";
import { useEffect, useState } from "react";
import ScrollReveal from "./ScrollReveal";
import { safeUrl } from "../lib/invitations";

function getDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}
function localizedDate(value) {
  const date = getDate(value);
  return date
    ? new Intl.DateTimeFormat("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date)
    : "Đang cập nhật";
}

function EventCard({ data, side }) {
  const groom = side === "groom";
  const raw = groom
    ? data.groomEventDate || data.eventDate
    : data.brideEventDate || data.eventDate;
  const date = getDate(raw);
  const title = groom
    ? data.groomEventTitle || "Lễ thành hôn"
    : data.brideEventTitle || "Lễ vu quy";
  const venue = groom
    ? data.groomVenue || data.venue
    : data.brideVenue || data.venue;
  const address = groom
    ? data.groomAddress || data.address
    : data.brideAddress || data.address;
  const map = safeUrl(
    groom ? data.groomMapUrl || data.mapUrl : data.brideMapUrl || data.mapUrl,
  );
  return (
    <article className="sig-event-card">
      <div className="sig-event-card-top">
        <span>{groom ? "NHÀ TRAI" : "NHÀ GÁI"}</span>
        <span>✧</span>
      </div>
      <h3>{title}</h3>
      <div className="sig-event-date-large">
        <span>
          {date
            ? new Intl.DateTimeFormat("vi-VN", { weekday: "long" }).format(date)
            : "Ngày cưới"}
        </span>
        <strong>{date ? String(date.getDate()).padStart(2, "0") : "--"}</strong>
        <span>
          {date
            ? `THÁNG ${String(date.getMonth() + 1).padStart(
                2,
                "0",
              )} · ${date.getFullYear()}`
            : "Đang cập nhật"}
        </span>
      </div>
      <p className="sig-event-time-small">
        {date
          ? new Intl.DateTimeFormat("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            }).format(date)
          : ""}{" "}
        · {localizedDate(raw)}
      </p>
      <div className="sig-event-location">
        <span>⌖</span>
        <strong>{venue || "Địa điểm tổ chức"}</strong>
        <p>{address || "Thông tin địa điểm sẽ cập nhật"}</p>
      </div>
      {map && (
        <a
          className="sig-outline"
          target="_blank"
          rel="noopener noreferrer"
          href={map}>
          XEM CHỈ ĐƯỜNG ↗
        </a>
      )}
    </article>
  );
}

function EventsSection({ data }) {
  return (
    <section className="sig-section sig-section-events" id="sig-events">
      <span className="sig-label">THE WEDDING INVITATION</span>
      <h2 className="sig-section-heading">Trân trọng kính mời</h2>
      <p className="sig-section-lead">
        Hai gia đình trân trọng kính mời bạn đến chung vui và chứng kiến khoảnh
        khắc hạnh phúc của chúng mình.
      </p>
      <div className="sig-family-row">
        <div>
          <span>GIA ĐÌNH NHÀ GÁI</span>
          <p>{data.brideParents || "Gia đình cô dâu"}</p>
        </div>
        <span className="sig-family-flourish" aria-hidden="true">
          ❦
        </span>
        <div>
          <span>GIA ĐÌNH NHÀ TRAI</span>
          <p>{data.groomParents || "Gia đình chú rể"}</p>
        </div>
      </div>
      <div className="sig-event-list">
        <EventCard data={data} side="bride" />
        <EventCard data={data} side="groom" />
      </div>
    </section>
  );
}

function WeddingCalendar({ groomDate, brideDate }) {
  const main = getDate(groomDate) || getDate(brideDate);
  if (!main) return null;
  const year = main.getFullYear();
  const month = main.getMonth();
  const nDays = new Date(year, month + 1, 0).getDate();
  const blank = (new Date(year, month, 1).getDay() + 6) % 7;
  const cells = [
    ...Array(blank).fill(null),
    ...Array.from({ length: nDays }, (_, i) => i + 1),
  ];
  const bride = getDate(brideDate);
  function isDateMarked(day, date) {
    return (
      date &&
      day === date.getDate() &&
      date.getMonth() === month &&
      date.getFullYear() === year
    );
  }
  return (
    <div className="sig-calendar" aria-label="Lịch tháng đánh dấu ngày cưới">
      <div className="sig-calendar-heading">
        <span>
          {new Intl.DateTimeFormat("en-US", { month: "long" }).format(main)}
        </span>
        <strong>{year}</strong>
      </div>
      <div className="sig-calendar-grid">
        {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((week) => (
          <b key={week}>{week}</b>
        ))}
        {cells.map((day, i) => {
          const mainDay = isDateMarked(day, main);
          const brideDay = isDateMarked(day, bride);
          return (
            <span
              key={i}
              className={mainDay || brideDay ? "is-wedding-day" : ""}>
              {day || ""}
              {(mainDay || brideDay) && <i aria-label="Ngày cưới">♡</i>}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function Countdown({ dateString }) {
  const [remaining, setRemaining] = useState(null);
  useEffect(() => {
    const future = getDate(dateString)?.getTime();
    if (!future) return;
    const tick = () => {
      let diff = Math.max(0, future - Date.now());
      const d = Math.floor(diff / 86400000);
      diff %= 86400000;
      const h = Math.floor(diff / 3600000);
      diff %= 3600000;
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining([d, h, m, s]);
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [dateString]);
  return (
    <div className="sig-countdown" aria-label="Đếm ngược đến ngày cưới">
      {(remaining || ["--", "--", "--", "--"]).map((value, i) => (
        <div key={i}>
          <strong>{String(value).padStart(2, "0")}</strong>
          <small>{["Ngày", "Giờ", "Phút", "Giây"][i]}</small>
        </div>
      ))}
    </div>
  );
}

function CalendarSection({ data }) {
  const date = data.groomEventDate || data.eventDate;
  return (
    <section className="sig-section sig-section-calendar">
      <span className="sig-label">A DATE TO REMEMBER</span>
      <h2 className="sig-section-heading sig-script">Our Special Day</h2>
      <WeddingCalendar groomDate={date} brideDate={data.brideEventDate} />
      <p className="sig-label sig-countdown-label">COUNTDOWN TO FOREVER</p>
      <Countdown dateString={date} />
      <div className="sig-calendar-doodle" aria-hidden="true">
        ♡ · ✧ · ♡
      </div>
    </section>
  );
}

function ScheduleSection({ data }) {
  const timeline = Array.isArray(data.timeline) ? data.timeline : [];
  const colors = Array.isArray(data.dressCodeColors)
    ? data.dressCodeColors
    : [];
  if (!timeline.length && !colors.length) return null;
  return (
    <section className="sig-section sig-section-schedule">
      {timeline.length > 0 && (
        <div className="sig-schedule-part">
          <span className="sig-label">THE CELEBRATION</span>
          <h2 className="sig-script sig-schedule-title">Timeline</h2>
          <div className="sig-timeline">
            {timeline.map((item, i) => (
              <div
                className="sig-timeline-item"
                key={`${item.time}-${item.title}-${i}`}>
                <time>{item.time}</time>
                <span className="sig-timeline-symbol" aria-hidden="true">
                  ✧
                </span>
                <p>{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {colors.length > 0 && (
        <div className="sig-schedule-part sig-dress-block">
          <span className="sig-label">WE LOVE THESE COLORS</span>
          <h2 className="sig-script sig-schedule-title">Dress code</h2>
          <p>
            Chúng mình rất vui nếu bạn chọn những gam màu này cho ngày đặc biệt.
          </p>
          <div className="sig-colors">
            {colors.map((c, i) => (
              <span
                key={`${c}-${i}`}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function StorySection({ data }) {
  return (
    <section className="sig-section sig-section-story">
      <span className="sig-label">TWO HEARTS · ONE SOUL</span>
      <h2 className="sig-script">Our Forever Haven</h2>
      <div className="sig-story-ornament" aria-hidden="true">
        ✧ ♡ ✧
      </div>
      <p>
        {data.story ||
          "Từ hai người xa lạ, chúng mình đã tìm thấy một mái nhà trong nhau."}
      </p>
    </section>
  );
}

function GallerySection({ images }) {
  if (!images.length) return null;
  return (
    <section className="sig-section sig-section-gallery" id="gallery">
      <span className="sig-label">THE BEAUTIFUL MOMENTS</span>
      <h2 className="sig-script">The Album</h2>
      <div className="sig-gallery-grid">
        {images.slice(0, 18).map((url, i) => (
          <figure
            key={`${url}-${i}`}
            className={`sig-photo sig-photo-${i % 7}`}>
            <img src={url} alt={`Khoảnh khắc cưới ${i + 1}`} loading="lazy" />
            {i === 0 && <figcaption>Our love story</figcaption>}
          </figure>
        ))}
      </div>
    </section>
  );
}

function RSVPSection({ data, preview, feedback }) {
  if (!data.showRsvp) return null;
  return (
    <section className="sig-section sig-section-rsvp" id="rsvp">
      <span className="sig-label">KINDLY REPLY</span>
      <h2 className="sig-script">Be Our Guest</h2>
      <p className="sig-section-lead">
        Hãy xác nhận sự hiện diện của bạn để hai gia đình chuẩn bị đón tiếp chu
        đáo nhất nhé!
      </p>
      <Form
        method="post"
        className="sig-form"
        onSubmit={preview ? (event) => event.preventDefault() : undefined}>
        <input type="hidden" name="intent" value="rsvp" />
        <input
          className="honey"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />
        <label>
          Họ và tên
          <input
            name="guestName"
            placeholder="Tên của bạn"
            required
            maxLength={100}
            disabled={preview}
          />
        </label>
        <label>
          Bạn là khách mời bên
          <select name="guestSide" defaultValue="groom" disabled={preview}>
            <option value="groom">Nhà trai</option>
            <option value="bride">Nhà gái</option>
          </select>
        </label>
        <label>
          Xác nhận tham dự
          <select name="attendance" defaultValue="yes" disabled={preview}>
            <option value="yes">Mình sẽ tham dự</option>
            <option value="no">Rất tiếc, mình không thể tham dự</option>
          </select>
        </label>
        <label>
          Số khách tham dự
          <input
            name="partySize"
            type="number"
            min="1"
            max="10"
            defaultValue="1"
            disabled={preview}
          />
        </label>
        <label>
          Lời nhắn (không bắt buộc)
          <textarea
            name="note"
            rows={2}
            maxLength={1000}
            placeholder="Gửi đôi lời nhắn yêu thương..."
            disabled={preview}
          />
        </label>
        <button type="submit" disabled={preview}>
          GỬI LỜI NHẮN & XÁC NHẬN
        </button>
        {preview && (
          <p className="sig-form-message">
            Đây là bản xem trước. Mẫu xác nhận hoạt động khi thiệp đã xuất bản.
          </p>
        )}
        {!preview && feedback && ["rsvp", "error"].includes(feedback.type) && (
          <p className="sig-form-message" role="status">
            {feedback.message}
          </p>
        )}
      </Form>
    </section>
  );
}

function GiftCard({ data, side }) {
  const groom = side === "groom";
  const bank = groom ? data.groomGiftBank || data.giftBank : data.brideGiftBank;
  const name = groom ? data.groomGiftName || data.giftName : data.brideGiftName;
  const account = groom
    ? data.groomGiftAccount || data.giftAccount
    : data.brideGiftAccount;
  const qr = safeUrl(
    groom ? data.groomGiftQrImage || data.giftQrImage : data.brideGiftQrImage,
  );
  if (!bank && !account && !qr) return null;
  return (
    <article className="sig-bank-card">
      <span>{groom ? "MỪNG CƯỚI NHÀ TRAI" : "MỪNG CƯỚI NHÀ GÁI"}</span>
      <strong>{bank}</strong>
      <p>{name}</p>
      <b>{account}</b>
      {qr && (
        <img
          src={qr}
          alt={`QR mừng cưới ${groom ? "nhà trai" : "nhà gái"}`}
          loading="lazy"
        />
      )}
    </article>
  );
}
function GiftsSection({ data }) {
  const has =
    data.showGift &&
    [
      data.groomGiftBank,
      data.groomGiftAccount,
      data.groomGiftQrImage,
      data.brideGiftBank,
      data.brideGiftAccount,
      data.brideGiftQrImage,
      data.giftBank,
      data.giftAccount,
    ].some(Boolean);
  if (!has) return null;
  return (
    <section className="sig-section sig-section-gifts" id="gifts">
      <span className="sig-label">WITH LOVE</span>
      <h2 className="sig-script">Wedding Gift</h2>
      <p className="sig-section-lead">
        Sự hiện diện và lời chúc của bạn đã là món quà quý giá nhất.
      </p>
      <div className="sig-gift-list">
        <GiftCard data={data} side="groom" />
        <GiftCard data={data} side="bride" />
      </div>
    </section>
  );
}

function WishesSection({ data, preview, wishes, feedback }) {
  if (!data.showWishes) return null;
  const displayWishes = Array.isArray(wishes) ? wishes : [];
  return (
    <section className="sig-section sig-section-wishes" id="wishes">
      <span className="sig-label">LOVE NOTES</span>
      <h2 className="sig-script">Words of Love</h2>
      {displayWishes.length > 0 && (
        <div className="sig-wish-carousel" aria-label="Lời chúc từ khách mời">
          <div className="sig-wish-track">
            {[...displayWishes, ...displayWishes].map((wish, i) => (
              <blockquote key={`${wish.id || i}-${i}`}>
                <p>“{wish.message}”</p>
                <cite>— {wish.guestName}</cite>
              </blockquote>
            ))}
          </div>
        </div>
      )}
      <Form
        method="post"
        className="sig-form"
        onSubmit={preview ? (event) => event.preventDefault() : undefined}>
        <input type="hidden" name="intent" value="wish" />
        <input
          className="honey"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />
        <label>
          Tên của bạn
          <input
            name="guestName"
            placeholder="Họ và tên"
            required
            maxLength={100}
            disabled={preview}
          />
        </label>
        <label>
          Lời chúc
          <textarea
            name="message"
            placeholder="Gửi lời chúc đến cô dâu chú rể..."
            required
            minLength={2}
            maxLength={1000}
            rows={3}
            disabled={preview}
          />
        </label>
        <button type="submit" disabled={preview}>
          GỬI LỜI CHÚC
        </button>
        {preview && (
          <p className="sig-form-message">
            Lời chúc sẽ được gửi khi thiệp được xuất bản.
          </p>
        )}
        {!preview && feedback && ["wish", "error"].includes(feedback.type) && (
          <p className="sig-form-message" role="status">
            {feedback.message}
          </p>
        )}
      </Form>
    </section>
  );
}
function ThanksSection({ data }) {
  const cover = safeUrl(data.coverImage);
  return (
    <footer className="sig-thanks">
      {cover && (
        <img src={cover} alt="" loading="lazy" className="sig-thanks-photo" />
      )}
      <div className="sig-thanks-content">
        <span className="sig-script">Thank you</span>
        <p>Cảm ơn bạn đã cùng chúng mình lưu giữ ngày hạnh phúc!</p>
        <strong>
          {data.bride} <i>&</i> {data.groom}
        </strong>
        <small> WITH LOVE</small>
      </div>
    </footer>
  );
}

export default function SignatureWeddingSections({
  data,
  preview = false,
  wishes = [],
  feedback,
  theme = "midnight",
}) {
  const images = Array.isArray(data.gallery)
    ? data.gallery.map(safeUrl).filter(Boolean)
    : [];
  const common = { data, preview, feedback };
  return (
    <>
      <ScrollReveal
        refreshKey={`${theme}:${images.length}:${data.showGift}:${data.showRsvp}`}
      />
      {theme === "midnight" ? (
        <>
          <ScheduleSection data={data} />
          <EventsSection data={data} />
          <CalendarSection data={data} />
          <StorySection data={data} />
          <GallerySection images={images} />
          <RSVPSection {...common} />
          <GiftsSection data={data} />
          <WishesSection {...common} wishes={wishes} />
        </>
      ) : (
        <>
          <EventsSection data={data} />
          <CalendarSection data={data} />
          <StorySection data={data} />
          <RSVPSection {...common} />
          <GallerySection images={images} />
          <WishesSection {...common} wishes={wishes} />
          <GiftsSection data={data} />
          <ScheduleSection data={data} />
        </>
      )}
      <ThanksSection data={data} />
    </>
  );
}
