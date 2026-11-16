import { useEffect, useRef, useState } from "react";

export default function LoopMusic({ src, start = 0, end = 0 }) {
  const audioRef = useRef(null);
  const manualPauseRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const startTime = Math.max(0, Number(start) || 0);
  const endTime = Math.max(0, Number(end) || 0);

  function seekToStart(audio) {
    if (!audio || audio.readyState < 1) return;
    if (!Number.isFinite(audio.duration) || startTime >= audio.duration) return;
    if (
      audio.currentTime < startTime ||
      (endTime > startTime && audio.currentTime >= endTime)
    ) {
      audio.currentTime = startTime;
    }
  }

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !src) return;
    manualPauseRef.current = false;
    let active = true;

    // Sự kiện được phát trong chính thao tác bấm "Mở thiệp": được trình duyệt coi là user gesture.
    function onOpenInvitation() {
      if (!active || manualPauseRef.current) return;
      seekToStart(audio);
      const result = audio.play();
      if (result?.then)
        result
          .then(() => {
            if (active) setBlocked(false);
          })
          .catch(() => {
            if (active && !manualPauseRef.current) setBlocked(true);
          });
    }
    window.addEventListener("loihen:open", onOpenInvitation);
    return () => {
      active = false;
      window.removeEventListener("loihen:open", onOpenInvitation);
    };
  }, [src, startTime, endTime]);

  function handleTimeUpdate() {
    const audio = audioRef.current;
    if (audio && endTime > startTime && audio.currentTime >= endTime - 0.08) {
      audio.currentTime = startTime;
    }
  }
  function handleEnded() {
    const audio = audioRef.current;
    if (!audio || manualPauseRef.current) return;
    audio.currentTime = startTime;
    audio.play().catch(() => setBlocked(true));
  }
  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) {
      manualPauseRef.current = true;
      audio.pause();
      setBlocked(false);
    } else {
      manualPauseRef.current = false;
      seekToStart(audio);
      audio
        .play()
        .then(() => setBlocked(false))
        .catch(() => setBlocked(true));
    }
  }
  if (!src) return null;
  return (
    <div className="music-player">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onLoadedMetadata={(event) => seekToStart(event.currentTarget)}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onPlay={() => {
          setPlaying(true);
          setBlocked(false);
        }}
        onPause={() => setPlaying(false)}
        onError={() => {
          setPlaying(false);
          setBlocked(true);
        }}
      />
      <button
        type="button"
        data-music-toggle
        className={`wedding-music-toggle ${playing ? "is-playing" : ""}`}
        onClick={toggle}
        aria-label={playing ? "Tắt nhạc" : "Bật nhạc"}
        aria-pressed={playing}
        title={playing ? "Tắt nhạc" : "Bật nhạc"}>
        <svg
          viewBox="0 0 48 48"
          width="28"
          height="28"
          fill="none"
          aria-hidden="true">
          <path
            d="M24 40 C16 33 5 26 5 17 C5 8 17 5 24 14 C31 5 43 8 43 17 C43 26 32 33 24 40Z"
            fill="currentColor"
          />
          <path
            d="M27 13V30C22 26.5 18 30.5 20 34C22 37 29 34.5 29 31V18L36 16V12Z"
            fill="#fff"
          />
        </svg>
      </button>
      {blocked && !playing && (
        <small className="sig-music-tip">Chạm để bật nhạc ♫</small>
      )}
    </div>
  );
}
