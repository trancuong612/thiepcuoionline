# Lời Hẹn Studio 💌

**Website tạo thiệp cưới online, mô hình A:** chỉ chủ studio được tạo/chỉnh sửa/xuất bản thiệp. Khách chỉ nhận link để xem, xác nhận tham dự và gửi lời chúc.

- Remix v2 + Vite
- **Toàn bộ route/component dùng JavaScript `.js` và `.jsx`**, không dùng TypeScript/TSX.
- Prisma ORM v6 + PostgreSQL
- 3 template riêng: `Romantic.jsx`, `Minimal.jsx`, `Traditional.jsx`
- Kho mẫu, trang admin, xem trước theo thời gian thực, tạo/sửa/xuất bản/ẩn/xóa thiệp, đường dẫn riêng và QR
- RSVP lưu database, lời chúc có duyệt trước khi hiển thị
- Tải ảnh lên Cloudinary (nếu cấu hình tài khoản), hoặc nhập URL ảnh trực tiếp

## 1. Yêu cầu

- Node.js 20.19+ hoặc Node.js 22
- npm
- PostgreSQL 14+; nếu có Docker, có thể dùng `docker compose up -d` để chạy PostgreSQL cục bộ.

## 2. Cài đặt

```bash
npm install
cp .env.example .env
```

Windows PowerShell: `Copy-Item .env.example .env`.

Sửa `.env`: **ADMIN_PASSWORD** thật mạnh (ít nhất 14 ký tự), **SESSION_SECRET** ngẫu nhiên (tối thiểu 32 ký tự), và **DATABASE_URL** trỏ tới PostgreSQL. Ví dụ trong `.env.example` chỉ dùng local.

Nếu dùng PostgreSQL qua Docker:

```bash
docker compose up -d
npm run db:generate
npm run db:push
npm run dev
```

Mở `http://localhost:3000`. Vào `/admin/login` để đăng nhập và tạo thiệp.

> Với PostgreSQL đã có sẵn, bỏ qua `docker compose up -d`. Lệnh `db:push` phù hợp khi phát triển ban đầu; triển khai thực tế nên chuyển sang Prisma migrations.

## 3. Quy trình tạo thiệp

1. Đăng nhập `/admin/login` bằng `ADMIN_PASSWORD`.
2. Vào thư viện `/templates`, xem trước ba thiết kế.
3. Chọn mẫu, điền cô dâu/chú rể, ngày giờ, địa điểm, thông tin hai gia đình, câu chuyện.
4. Dán URL ảnh hoặc bật Cloudinary để upload từ máy; sửa bên trái, xem trước bên phải.
5. **Lưu thiệp** (mặc định là bản nháp). Bấm **Lưu & xuất bản** để có link `/i/<slug>`.
6. Gửi link/mã QR cho khách. Xem RSVP và duyệt lời chúc trong màn hình chỉnh sửa thiệp.

## 4. Upload ảnh Cloudinary (tùy chọn)

Điền trong `.env`:

```env
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
```

Server gửi ảnh lên Cloudinary qua API có chữ ký, không lộ API secret ra browser. Mỗi ảnh tối đa 7 MB; JPEG, PNG, WebP, AVIF. Nếu không cấu hình, vẫn có thể dán URL ảnh trực tiếp. Khi triển khai thật, **không lưu ảnh vào ổ cứng tạm của host**.

## 5. File quan trọng

- `app/components/templates/*.jsx`: từng template với hero và bố cục riêng.
- `app/components/InvitationSections.jsx`: các phần nội dung/tính năng chia sẻ (album, lịch, RSVP, lời chúc, quà mừng).
- `app/components/EditorForm.jsx`: form sửa dữ liệu và preview tức thì.
- `app/lib/invitations.js`: dữ liệu chuẩn và sanitization.
- `app/routes/admin.*.jsx`: các trang quản trị và upload.
- `app/routes/i.$slug.jsx`: thiệp công khai.
- `prisma/schema.prisma`: thiết kế database.

## 6. Cần hoàn thiện trước khi kinh doanh chính thức

Đây là **MVP nền tảng**, chưa phải SaaS thương mại hoàn chỉnh. Trước khi có lưu lượng thật:

- Rate limiting + CAPTCHA hoặc Turnstile cho login, RSVP và lời chúc để tránh spam/tấn công.
- Cơ chế sao lưu PostgreSQL, theo dõi lỗi, kiểm thử e2e và kiểm tra bảo mật.
- Chính sách dữ liệu khách mời, xin phép hiển thị tên/lời chúc, quyền xoá dữ liệu.
- Cấu hình `APP_URL` đúng tên miền và HTTPS, kiểm tra tải ảnh/âm thanh trên thiết bị thật.
- Thêm nhiều mẫu thiết kế/hiệu ứng, chỉnh sửa WYSIWYG và quản lý khách hàng khi cần mở rộng.

**Bảo mật:** không commit `.env`, không sử dụng mật khẩu mẫu khi deploy. Lưu ý dữ liệu RSVP có thể gồm thông tin cá nhân của khách mời và phải được bảo vệ phù hợp.

## 7. Xem nhanh giao diện trước khi cài npm

Mở trực tiếp `preview.html` trong trình duyệt. Đây là **bản demo giao diện tĩnh**, không thể tạo hoặc lưu thiệp. Website thực tế cần chạy Remix và database như ở mục 2.
