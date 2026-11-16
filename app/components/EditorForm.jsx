import { useState } from "react";
import { Form, Link, useNavigation } from "@remix-run/react";
import { TEMPLATES } from "../lib/templates";
import { sampleContent } from "../lib/invitations";
import TemplateRenderer from "./TemplateRenderer";
import MusicPicker from "./MusicPicker";
const textFields = [
  { name: "bride", label: "Tên cô dâu", required: true },
  { name: "groom", label: "Tên chú rể", required: true },
  { name: "brideParents", label: "Thông tin nhà gái" },
  { name: "groomParents", label: "Thông tin nhà trai" },
  { name: "subtitle", label: "Lời mời ngắn" },
  { name: "story", label: "Chuyện tình yêu", multiline: true },
  { name: "eventTitle", label: "Tên buổi lễ" },
  {
    name: "eventDate",
    label: "Ngày giờ cưới",
    type: "datetime-local",
    required: true,
  },
  { name: "venue", label: "Địa điểm tổ chức" },
  { name: "address", label: "Địa chỉ chi tiết" },
  { name: "mapUrl", label: "Đường dẫn Google Maps", type: "url" },
];

function PhotoUploader({ onUpload, label }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState("");

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || uploading) return;

    setUploading(true);
    setError("");
    setUploadedUrl("");

    try {
      const formData = new FormData();
      formData.append("photo", file);

      const response = await fetch("/admin/upload", {
        method: "POST",
        body: formData,
        credentials: "same-origin",
      });

      const result = await response.json();

      if (!response.ok || !result.url) {
        throw new Error(result.error || "Không thể tải ảnh lên Cloudinary");
      }

      // Cập nhật trực tiếp ảnh vào dữ liệu thiệp
      onUpload(result.url);

      setUploadedUrl(result.url);
    } catch (err) {
      setError(err.message || "Upload ảnh thất bại");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="upload-control">
      <label className="upload-picker">
        {uploading ? "⏳ Đang tải ảnh..." : `📷 ${label}`}

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={handleUpload}
          disabled={uploading}
        />
      </label>

      {uploading && (
        <p style={{ color: "#927463", marginTop: 8 }}>
          Đang upload lên Cloudinary, vui lòng đợi...
        </p>
      )}

      {error && (
        <p className="error-text" role="alert">
          {error}
        </p>
      )}

      {uploadedUrl && (
        <div style={{ marginTop: 12 }}>
          <img
            src={uploadedUrl}
            alt="Ảnh đã tải lên"
            style={{
              width: 150,
              height: 185,
              objectFit: "cover",
              borderRadius: 10,
              border: "1px solid #eee",
            }}
            onError={() =>
              setError("Đã upload nhưng không tải được ảnh từ Cloudinary")
            }
          />

          <p style={{ color: "#37835b", fontSize: 12 }}>
            ✓ Đã upload lên Cloudinary
          </p>

          <a
            href={uploadedUrl}
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: 12, textDecoration: "underline" }}>
            Kiểm tra ảnh trên Cloudinary ↗
          </a>
        </div>
      )}
    </div>
  );
}

export default function EditorForm({
  initial = {},
  invitationId = null,
  formError = "",
}) {
  const [templateId, setTemplateId] = useState(
    initial.templateId || "romantic",
  );
  const [title, setTitle] = useState(
    initial.title || "Thiệp cưới của chúng mình",
  );
  const [slug, setSlug] = useState(initial.slug || "");
  const [data, setData] = useState(() => {
    const previous = initial.content || {};
    return {
      ...sampleContent,
      ...previous,
      groomEventDate:
        previous.groomEventDate ||
        previous.eventDate ||
        sampleContent.groomEventDate,
      brideEventDate:
        previous.brideEventDate ||
        previous.eventDate ||
        sampleContent.brideEventDate,
    };
  });
  const navigation = useNavigation();
  const update = (key, value) =>
    setData((old) => ({
      ...old,
      [key]: value,
      ...(key === "groomEventDate" ? { eventDate: value } : {}),
      ...(key === "eventDate" ? { groomEventDate: value } : {}),
    }));
  const busy = navigation.state !== "idle";
  const signature = ["midnight-pearl", "lavender-bloom"].includes(templateId);
  const updateTimeline = (index, key, value) =>
    setData((old) => ({
      ...old,
      timeline: (old.timeline || []).map((row, i) =>
        i === index ? { ...row, [key]: value } : row,
      ),
    }));
  const updateColor = (index, value) =>
    setData((old) => ({
      ...old,
      dressCodeColors: (old.dressCodeColors || []).map((c, i) =>
        i === index ? value : c,
      ),
    }));
  return (
    <div className="editor-layout">
      <div className="editor-panel">
        <div className="editor-head">
          <Link to="/admin" className="back-link">
            ← Quản lý thiệp
          </Link>
          <h1>{invitationId ? "Chỉnh sửa thiệp" : "Tạo thiệp cưới mới"}</h1>
          <p>Một mẫu thiết kế, vô số câu chuyện riêng.</p>
        </div>
        <Form method="post" className="editor-form">
          <input type="hidden" name="payload" value={JSON.stringify(data)} />
          <div className="editor-section">
            <div className="step-label">01 / THÔNG TIN THIỆP</div>
            <div className="field">
              <label htmlFor="title">Tên nội bộ của thiệp</label>
              <input
                id="title"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={140}
              />
            </div>
            <div className="field">
              <label htmlFor="slug">Địa chỉ thiệp (slug)</label>
              <div className="input-prefix">
                <span>/i/</span>
                <input
                  id="slug"
                  name="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="ten-chu-re-ten-co-dau"
                  maxLength={64}
                />
              </div>
              <small>
                Để trống sẽ tự tạo từ tên cặp đôi. Chỉ dùng chữ, số và dấu gạch
                nối.
              </small>
            </div>
            <div className="field">
              <label htmlFor="templateId">Mẫu thiệp</label>
              <select
                id="templateId"
                name="templateId"
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}>
                {TEMPLATES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} · {item.style}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="editor-section">
            <div className="step-label">02 / NỘI DUNG</div>
            {textFields
              .filter(
                (item) =>
                  !signature ||
                  ![
                    "eventTitle",
                    "eventDate",
                    "venue",
                    "address",
                    "mapUrl",
                  ].includes(item.name),
              )
              .map((item) => (
                <div className="field" key={item.name}>
                  <label htmlFor={item.name}>{item.label}</label>
                  {item.multiline ? (
                    <textarea
                      id={item.name}
                      rows="4"
                      value={data[item.name] || ""}
                      onChange={(e) => update(item.name, e.target.value)}
                    />
                  ) : (
                    <input
                      id={item.name}
                      type={item.type || "text"}
                      required={item.required}
                      value={data[item.name] || ""}
                      placeholder={
                        item.name === "bride"
                          ? "Nhập tên cô dâu"
                          : item.name === "groom"
                          ? "Nhập tên chú rể"
                          : ""
                      }
                      onChange={(e) => update(item.name, e.target.value)}
                    />
                  )}
                </div>
              ))}
          </div>

          {signature && (
            <div className="editor-section">
              <div className="step-label">02A / HAI BUỔI LỄ RIÊNG</div>
              {[
                {
                  side: "bride",
                  label: "NHÀ GÁI",
                  date: "brideEventDate",
                  title: "brideEventTitle",
                  venue: "brideVenue",
                  address: "brideAddress",
                  map: "brideMapUrl",
                },
                {
                  side: "groom",
                  label: "NHÀ TRAI",
                  date: "groomEventDate",
                  title: "groomEventTitle",
                  venue: "groomVenue",
                  address: "groomAddress",
                  map: "groomMapUrl",
                },
              ].map((event) => (
                <fieldset key={event.side} className="signature-editor-group">
                  <legend>{event.label}</legend>
                  {[
                    [event.title, "Tên buổi lễ", "text"],
                    [event.date, "Ngày và giờ", "datetime-local"],
                    [event.venue, "Địa điểm", "text"],
                    [event.address, "Địa chỉ chi tiết", "text"],
                    [event.map, "Link Google Maps", "url"],
                  ].map(([key, label, type]) => (
                    <div className="field" key={key}>
                      <label htmlFor={key}>{label}</label>
                      <input
                        id={key}
                        type={type}
                        required={[
                          event.date,
                          event.venue,
                          event.address,
                        ].includes(key)}
                        value={data[key] || ""}
                        onChange={(e) => update(key, e.target.value)}
                      />
                    </div>
                  ))}
                </fieldset>
              ))}
              <fieldset className="signature-editor-group">
                <legend>TIMELINE CHƯƠNG TRÌNH</legend>
                {(data.timeline || []).map((item, i) => (
                  <div className="signature-editor-row" key={i}>
                    <input
                      aria-label={`Giờ mục ${i + 1}`}
                      placeholder="10:30"
                      value={item.time}
                      onChange={(e) =>
                        updateTimeline(i, "time", e.target.value)
                      }
                    />
                    <input
                      aria-label={`Nội dung mục ${i + 1}`}
                      placeholder="Đón khách"
                      value={item.title}
                      onChange={(e) =>
                        updateTimeline(i, "title", e.target.value)
                      }
                    />
                    <button
                      type="button"
                      onClick={() =>
                        update(
                          "timeline",
                          data.timeline.filter((_, j) => i !== j),
                        )
                      }>
                      Xóa
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  disabled={(data.timeline || []).length >= 12}
                  onClick={() =>
                    update("timeline", [
                      ...(data.timeline || []),
                      { time: "", title: "" },
                    ])
                  }>
                  ＋ Thêm mốc thời gian
                </button>
              </fieldset>
              <fieldset className="signature-editor-group">
                <legend>DRESS CODE</legend>
                <div className="signature-editor-colors">
                  {(data.dressCodeColors || []).map((color, i) => (
                    <div key={i}>
                      <input
                        type="color"
                        aria-label={`Màu số ${i + 1}`}
                        value={color}
                        onChange={(e) => updateColor(i, e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          update(
                            "dressCodeColors",
                            data.dressCodeColors.filter((_, j) => i !== j),
                          )
                        }>
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  disabled={(data.dressCodeColors || []).length >= 6}
                  onClick={() =>
                    update("dressCodeColors", [
                      ...(data.dressCodeColors || []),
                      "#d6c5d5",
                    ])
                  }>
                  ＋ Thêm màu
                </button>
              </fieldset>
            </div>
          )}
          <div className="editor-section">
            <div className="step-label">03 / ẢNH & ÂM NHẠC</div>

            {/* ẢNH BÌA */}
            <div className="field">
              <label>01. Ảnh bìa thiệp cưới</label>

              <PhotoUploader
                label="Chọn ảnh bìa"
                onUpload={(url) => update("coverImage", url)}
              />

              {data.coverImage ? (
                <div style={{ marginTop: 15 }}>
                  <img
                    src={data.coverImage}
                    alt="Ảnh bìa hiện tại"
                    style={{
                      width: "100%",
                      maxWidth: 250,
                      height: 280,
                      objectFit: "cover",
                      borderRadius: 12,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => update("coverImage", "")}>
                    Xóa ảnh bìa
                  </button>
                </div>
              ) : (
                <small>
                  Chưa có ảnh riêng. Thiệp xem trước sẽ hiển thị ảnh mẫu.
                </small>
              )}
            </div>

            {/* ALBUM ẢNH */}
            <div className="field">
              <label>02. Album ảnh cưới</label>

              <PhotoUploader
                label="Thêm ảnh vào album"
                onUpload={(url) =>
                  setData((old) => ({
                    ...old,
                    gallery: [...(old.gallery || []), url],
                  }))
                }
              />

              <div className="editor-gallery-grid">
                {(data.gallery || []).map((src, index) => (
                  <div className="editor-gallery-item" key={`${src}-${index}`}>
                    <img src={src} alt={`Ảnh album ${index + 1}`} />

                    <button
                      type="button"
                      onClick={() =>
                        setData((old) => ({
                          ...old,
                          gallery: old.gallery.filter((_, i) => i !== index),
                        }))
                      }>
                      × Xóa
                    </button>
                  </div>
                ))}
              </div>

              <small>
                Tải nhiều ảnh để tạo album. Ảnh mới sẽ tự xuất hiện trong mẫu
                thiệp.
              </small>
            </div>

            {/* NHẠC NỀN */}

            <div className="field">
              <MusicPicker
                musicUrl={data.musicUrl || ""}
                musicStart={data.musicStart || 0}
                musicEnd={data.musicEnd || 0}
                onChange={(values) =>
                  setData((old) => ({
                    ...old,
                    ...values,
                  }))
                }
              />
            </div>
          </div>

          <div className="editor-section">
            <div className="step-label">04 / TƯƠNG TÁC & QUÀ MỪNG</div>
            <div className="switches">
              {[
                { key: "showRsvp", label: "Cho phép xác nhận tham dự" },
                { key: "showWishes", label: "Cho phép gửi lời chúc" },
                { key: "showGift", label: "Hiện thông tin quà mừng" },
              ].map((item) => (
                <label key={item.key} className="switch-row">
                  <input
                    type="checkbox"
                    checked={Boolean(data[item.key])}
                    onChange={(e) => update(item.key, e.target.checked)}
                  />
                  {item.label}
                </label>
              ))}
            </div>
            {data.showGift && signature && (
              <>
                {[
                  { side: "groom", label: "NHÀ TRAI" },
                  { side: "bride", label: "NHÀ GÁI" },
                ].map(({ side, label }) => (
                  <fieldset className="signature-editor-group" key={side}>
                    <legend>QUÀ MỪNG {label}</legend>
                    {[
                      ["GiftBank", "Ngân hàng"],
                      ["GiftName", "Tên chủ tài khoản"],
                      ["GiftAccount", "Số tài khoản"],
                      ["GiftQrImage", "Đường dẫn ảnh QR"],
                    ].map(([suffix, fieldLabel]) => (
                      <div className="field" key={suffix}>
                        <label>{fieldLabel}</label>
                        <input
                          value={data[side + suffix] || ""}
                          onChange={(e) =>
                            update(side + suffix, e.target.value)
                          }
                        />
                      </div>
                    ))}
                    <PhotoUploader
                      label={`Upload QR ${label}`}
                      onUpload={(url) => update(side + "GiftQrImage", url)}
                    />
                  </fieldset>
                ))}
              </>
            )}
            {data.showGift && !signature && (
              <>
                <div className="field">
                  <label>Ngân hàng</label>
                  <input
                    value={data.giftBank || ""}
                    onChange={(e) => update("giftBank", e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Chủ tài khoản</label>
                  <input
                    value={data.giftName || ""}
                    onChange={(e) => update("giftName", e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Số tài khoản</label>
                  <input
                    value={data.giftAccount || ""}
                    onChange={(e) => update("giftAccount", e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>URL ảnh QR chuyển khoản</label>
                  <input
                    type="text"
                    value={data.giftQrImage || ""}
                    onChange={(e) => update("giftQrImage", e.target.value)}
                    placeholder="Upload ảnh QR hoặc nhập URL"
                  />
                  <PhotoUploader
                    label="Chọn ảnh QR từ máy"
                    onUpload={(url) => update("giftQrImage", url)}
                  />
                </div>
              </>
            )}
          </div>
          {formError && <p className="error-text">{formError}</p>}
          <div className="sticky-actions">
            <button
              name="intent"
              value="save"
              type="submit"
              className="button"
              disabled={busy}>
              {busy ? "Đang lưu..." : "Lưu thiệp"}
            </button>
            {invitationId && (
              <button
                name="intent"
                value="publish"
                type="submit"
                className="button button-outline"
                disabled={busy}>
                Lưu & xuất bản
              </button>
            )}
          </div>
        </Form>
      </div>
      <aside className="preview-panel">
        <div className="preview-toolbar">
          <span>
            <i className="live-dot" /> Xem trước trực tiếp
          </span>
          <span>↳ Mobile preview</span>
        </div>
        <div className="phone-shell">
          <div className="phone-notch" />
          <TemplateRenderer templateId={templateId} content={data} preview />
        </div>
      </aside>
    </div>
  );
}
