import { useEffect, useRef } from "react";

export default function ScrollReveal({ refreshKey = "" }) {
  const anchorRef = useRef(null);

  useEffect(() => {
    const root = anchorRef.current?.closest(".invitation");

    if (!root || typeof IntersectionObserver === "undefined") {
      return;
    }

    // Tôn trọng lựa chọn giảm chuyển động của người dùng
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.dataset.reveal = "visible";

          // Chỉ chạy một lần, không ẩn lại khi cuộn lên
          currentObserver.unobserve(entry.target);
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -6% 0px",
      },
    );

    const targets = root.querySelectorAll(
      ".iv-section, .sig-section, .iv-photos .gallery-card, .iv-photos > img",
    );

    targets.forEach((element) => {
      if (element.dataset.reveal === "visible") return;

      element.dataset.reveal = "pending";
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, [refreshKey]);

  return <span ref={anchorRef} hidden aria-hidden="true" />;
}
