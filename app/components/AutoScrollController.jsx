import { useEffect, useRef, useState } from "react";

// Bắt đầu cuộn sau thao tác "Mở thiệp".
// Cuộn tự động tạm dừng khi khách tự tương tác để không cản việc đọc / RSVP.
export default function AutoScrollController() {
  const [mode, setMode] = useState("ready"); // ready | playing | paused | ended
  const modeRef = useRef("ready");
  const frameRef = useRef(0);
  const startTimerRef = useRef(0);
  const lastFrameRef = useRef(0);
  const targetYRef = useRef(0);

  useEffect(() => {
    function setNext(value) {
      modeRef.current = value;
      setMode(value);
    }
    function cancelFrame() {
      window.cancelAnimationFrame(frameRef.current);
      lastFrameRef.current = 0;
    }
    function stop() {
      if (modeRef.current !== "playing") return;
      cancelFrame();
      setNext("paused");
    }
    function step(timestamp) {
      if (modeRef.current !== "playing") return;
      if (document.hidden) { stop(); return; }
      if (lastFrameRef.current) {
        const delta = Math.min(timestamp - lastFrameRef.current, 60);
        const distance = delta * 0.030; // ~30px/giây, đủ chậm để đọc thiệp
        targetYRef.current += distance;
        window.scrollTo({ top: targetYRef.current, behavior: "auto" });
      }
      lastFrameRef.current = timestamp;
      const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      if (max - window.scrollY <= 3) {
        cancelFrame();
        setNext("ended");
        return;
      }
      frameRef.current = window.requestAnimationFrame(step);
    }
    function play() {
      if (modeRef.current === "playing") return;
      const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      if (window.scrollY >= max - 3) window.scrollTo({ top: 0, behavior: "auto" });
      targetYRef.current = window.scrollY;
      setNext("playing");
      cancelFrame();
      frameRef.current = window.requestAnimationFrame(step);
    }
    function onOpened() {
      window.clearTimeout(startTimerRef.current);
      if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
        setNext("paused");
        return;
      }
      startTimerRef.current = window.setTimeout(play, 1450);
    }
    function onToggle() {
      if (modeRef.current === "playing") stop();
      else play();
    }
    function onTouchStart(event) {
      if (!event.target?.closest?.("[data-auto-scroll-toggle]")) stop();
    }
    function onPointerDown(event) {
      if (!event.target?.closest?.("[data-auto-scroll-toggle], [data-music-toggle]")) stop();
    }
    function onKeyDown(event) {
      if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) stop();
    }
    window.addEventListener("loihen:open", onOpened);
    window.addEventListener("loihen:autoscroll-toggle", onToggle);
    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("focusin", stop);
    document.addEventListener("visibilitychange", stop);
    return () => {
      window.clearTimeout(startTimerRef.current);
      cancelFrame();
      window.removeEventListener("loihen:open", onOpened);
      window.removeEventListener("loihen:autoscroll-toggle", onToggle);
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("focusin", stop);
      document.removeEventListener("visibilitychange", stop);
    };
  }, []);

  // Trạng thái ready: nút sẽ hiện sau khi bấm mở thiệp (được overlay che trước đó).
  return <button type="button" data-auto-scroll-toggle className={`sig-auto-scroll-control is-${mode}`}
    onClick={() => window.dispatchEvent(new Event("loihen:autoscroll-toggle"))}
    aria-label={mode === "playing" ? "Tạm dừng tự cuộn" : "Tiếp tục tự cuộn"}
    aria-pressed={mode === "playing"}
    title={mode === "playing" ? "Tạm dừng tự cuộn" : "Tự cuộn thiệp"}>
    <span aria-hidden="true">{mode === "playing" ? "Ⅱ" : "↓"}</span>
    <span>{mode === "playing" ? "Dừng cuộn" : "Tự cuộn"}</span>
  </button>;
}
