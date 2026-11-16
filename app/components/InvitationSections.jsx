import { Form } from "@remix-run/react";
import { prettyDate, safeUrl } from "../lib/invitations";
import ScrollReveal from "./ScrollReveal";
export default function InvitationSections({
  data,
  preview = false,
  wishes = [],
  feedback,
}) {
  const wishLoop = wishes.slice(0, 8);

  return (
    <>
      <ScrollReveal
        refreshKey={[
          data.gallery?.length || 0,
          data.showRsvp,
          data.showWishes,
          data.showGift,
        ].join(":")}
      />

      {!preview && wishLoop.length > 0 && (
        <aside className="wish-floating-corner" aria-label="Lời chúc nổi bật">
          <div className="wish-floating-title">Lời chúc yêu thương</div>

          <div className="wish-floating-track">
            {[...wishLoop, ...wishLoop].map((wish, index) => (
              <div className="wish-floating-chip" key={`${wish.id}-${index}`}>
                <strong>{wish.guestName}</strong>
                <span>{wish.message}</span>
              </div>
            ))}
          </div>
        </aside>
      )}

      <section className="iv-section iv-story" id="story">
        <span className="iv-eyebrow">OUR LOVE STORY</span>
        <h2>Chuyện chúng mình</h2>
        <div className="iv-rule">✦</div>

        <div className="story-shell">
          <p>{data.story || "Chặng đường yêu thương của hai chúng mình."}</p>
          <div className="story-quote">
            “From this day forward, you shall not walk alone.”
          </div>
        </div>
      </section>

      <section className="iv-section iv-family">
        <span className="iv-eyebrow">WITH OUR FAMILIES</span>
        <h2>Hai gia đình</h2>

        <div className="iv-family-grid family-grid-premium">
          <div className="family-card">
            <span>Nhà gái</span>
            <strong>{data.brideParents || "Gia đình cô dâu"}</strong>
          </div>

          <span className="iv-family-mark">&</span>

          <div className="family-card">
            <span>Nhà trai</span>
            <strong>{data.groomParents || "Gia đình chú rể"}</strong>
          </div>
        </div>
      </section>

      <section className="iv-section iv-event" id="event">
        <span className="iv-eyebrow">SAVE THE DATE</span>
        <h2>{data.eventTitle || "Lễ thành hôn"}</h2>
        <div className="iv-rule">✦</div>

        <div className="event-shell">
          <div className="event-main-card">
            <div className="iv-date">{prettyDate(data.eventDate)}</div>
            <strong className="iv-venue">
              {data.venue || "Địa điểm tổ chức"}
            </strong>
            <p>{data.address}</p>

            {safeUrl(data.mapUrl) && (
              <a
                className="iv-outline-button"
                href={safeUrl(data.mapUrl)}
                target="_blank"
                rel="noopener noreferrer">
                Xem bản đồ ↗
              </a>
            )}
          </div>
        </div>
      </section>

      {data.gallery?.length > 0 && (
        <section className="iv-section iv-gallery" id="gallery">
          <span className="iv-eyebrow">OUR MEMORIES</span>
          <h2>Khoảnh khắc yêu thương</h2>

          <div className="iv-photos premium-gallery">
            {data.gallery.map((src, i) => (
              <figure className="gallery-card" key={`${src}-${i}`}>
                <img
                  src={safeUrl(src)}
                  alt={`Ảnh kỷ niệm ${i + 1}`}
                  loading="lazy"
                />
              </figure>
            ))}
          </div>
        </section>
      )}

      {data.showRsvp && (
        <section className="iv-section iv-form-section" id="rsvp">
          <span className="iv-eyebrow">KINDLY REPLY</span>
          <h2>Xác nhận tham dự</h2>
          <p>Chúng mình rất mong được đón tiếp bạn trong ngày đặc biệt này.</p>

          {!preview ? (
            <Form method="post" className="iv-form premium-form">
              <input type="hidden" name="intent" value="rsvp" />
              <input
                className="honey"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                name="company"
              />

              <label>
                Họ tên
                <input
                  name="guestName"
                  maxLength={100}
                  required
                  placeholder="Tên của bạn"
                />
              </label>

              <label>
                Tham dự
                <select name="attendance">
                  <option value="yes">Mình sẽ tham dự</option>
                  <option value="no">Rất tiếc, mình không thể đến</option>
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
                />
              </label>

              <label>
                Lời nhắn (không bắt buộc)
                <textarea
                  name="note"
                  maxLength={1000}
                  rows="2"
                  placeholder="Gửi đôi lời tới cô dâu chú rể"
                />
              </label>

              <button type="submit" className="iv-button">
                Gửi xác nhận
              </button>

              {feedback?.type === "rsvp" && (
                <p className="form-success">{feedback.message}</p>
              )}
            </Form>
          ) : (
            <div className="preview-form-hint">
              Form RSVP hoạt động sau khi xuất bản thiệp
            </div>
          )}
        </section>
      )}

      {data.showWishes && (
        <section className="iv-section iv-form-section" id="wishes">
          <span className="iv-eyebrow">GUEST BOOK</span>
          <h2>Sổ lời chúc</h2>

          {!preview ? (
            <Form method="post" className="iv-form premium-form">
              <input type="hidden" name="intent" value="wish" />
              <input
                className="honey"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                name="company"
              />

              <label>
                Tên của bạn
                <input
                  name="guestName"
                  maxLength={100}
                  required
                  placeholder="Họ tên"
                />
              </label>

              <label>
                Lời chúc
                <textarea
                  name="message"
                  maxLength={1000}
                  rows="3"
                  required
                  placeholder="Gửi lời yêu thương đến cặp đôi"
                />
              </label>

              <button type="submit" className="iv-button">
                Gửi lời chúc
              </button>

              {feedback?.type === "wish" && (
                <p className="form-success">{feedback.message}</p>
              )}
            </Form>
          ) : (
            <div className="preview-form-hint">
              Khách gửi lời chúc tại thiệp đã xuất bản
            </div>
          )}

          {wishes.length > 0 && (
            <div className="wishes-list premium-wishes-list">
              {wishes.map((wish) => (
                <div className="wish-item premium-wish-item" key={wish.id}>
                  <strong>{wish.guestName}</strong>
                  <p>{wish.message}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {data.showGift && (
        <section className="iv-section iv-gift">
          <span className="iv-eyebrow">WITH LOVE</span>
          <h2>Hộp quà mừng</h2>
          <p>Mọi lời chúc của bạn đều là món quà quý giá với chúng mình.</p>

          {data.giftBank && (
            <div className="iv-bank">
              <b>{data.giftBank}</b>
              <span>{data.giftName}</span>
              <strong>{data.giftAccount}</strong>

              {safeUrl(data.giftQrImage) && (
                <img
                  className="iv-gift-qr"
                  src={safeUrl(data.giftQrImage)}
                  alt="Mã QR mừng cưới"
                />
              )}
            </div>
          )}
        </section>
      )}

      <footer className="iv-footer">
        <div>Thank you</div>
        <p>Cảm ơn vì đã có mặt trong câu chuyện của chúng mình.</p>
        <small>
          {data.bride} & {data.groom}
        </small>
      </footer>
    </>
  );
}
