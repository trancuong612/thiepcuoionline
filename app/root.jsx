import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
  isRouteErrorResponse,
} from "@remix-run/react";
import stylesheet from "./styles/app.css?url";

export const links = () => [
  { rel: "stylesheet", href: stylesheet },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Great+Vibes&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&display=swap",
  },
];
export const meta = () => [
  { title: "Lời Hẹn | Thiệp cưới trực tuyến" },
  {
    name: "description",
    content: "Thiết kế và xuất bản thiệp cưới của riêng bạn.",
  },
];
export function Layout({ children }) {
  return (
    <html lang="vi">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
export default function App() {
  return <Outlet />;
}
export function ErrorBoundary() {
  const error = useRouteError();
  const status = isRouteErrorResponse(error) ? error.status : 500;
  return (
    <main className="error-page">
      <h1>{status === 404 ? "Không tìm thấy trang" : "Có lỗi xảy ra"}</h1>
      <p>
        {status === 404
          ? "Địa chỉ này không tồn tại hoặc thiệp chưa được xuất bản."
          : "Vui lòng thử lại sau."}
      </p>
      <a className="button" href="/">
        Về trang chủ
      </a>
    </main>
  );
}
