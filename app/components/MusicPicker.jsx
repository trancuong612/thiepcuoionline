import { useEffect, useRef, useState } from "react";
import { useFetcher } from "@remix-run/react";

function formatTime(seconds) {
  const value = Math.max(0, Math.floor(Number(seconds) || 0));
  const minutes = Math.floor(value / 60);
  const remain = value % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remain).padStart(
    2,
    "0",
  )}`;
}

export default function MusicPicker({
  musicUrl = "",
  musicStart = 0,
  musicEnd = 0,
  onChange,
}) {
  const fetcher = useFetcher();
  const audioRef = useRef(null);

  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetcher.load("/admin/music");
  }, []);

  useEffect(() => {
    audioRef.current?.pause();
    setPlaying(false);
    setDuration(0);
    setError("");
  }, [musicUrl]);

  const tracks = fetcher.data?.tracks || [];

  const start = Number(musicStart) || 0;
  const end = Number(musicEnd) || 0;
  const effectiveEnd = end > start ? end : duration;

  function changeMusic(event) {
    onChange({
      musicUrl: event.target.value,
      musicStart: 0,
      musicEnd: 0,
    });
  }

  function handleMetadata(event) {
    const length = event.currentTarget.duration;

    if (!Number.isFinite(length) || length <= 0) return;

    const rounded = Math.round(length * 10) / 10;
    setDuration(length);

    if (end <= start || end > length) {
      onChange({
        musicStart: 0,
        musicEnd: rounded,
      });
    }
  }

  function handleTimeUpdate() {
    const audio = audioRef.current;
    if (!audio) return;

    if (effectiveEnd > start && audio.currentTime >= effectiveEnd - 0.06) {
      audio.currentTime = start;
    }
  }

  async function togglePreview() {
    const audio = audioRef.current;
    if (!audio) return;

    if (!audio.paused) {
      audio.pause();
      setPlaying(false);
      return;
    }

    try {
      setError("");
      audio.currentTime = start;
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
      setError("Không thể phát bài nhạc này.");
    }
  }

  async function replay() {
    const audio = audioRef.current;
    if (!audio || !playing) return;

    audio.currentTime = start;

    try {
      await audio.play();
    } catch {
      setPlaying(false);
    }
  }

  function changeStart(event) {
    const value = Number(event.target.value);
    const maximum = Math.max(0, effectiveEnd - 0.5);

    onChange({
      musicStart: Math.min(value, maximum),
    });

    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(value, maximum);
    }
  }

  function changeEnd(event) {
    const value = Number(event.target.value);

    onChange({
      musicEnd: Math.max(start + 0.5, value),
    });
  }

  const exists = tracks.some((track) => track.url === musicUrl);

  return (
    <div className="music-editor">
      <label htmlFor="wedding-music">Bài nhạc nền</label>

      <select id="wedding-music" value={musicUrl} onChange={changeMusic}>
        <option value="">Không sử dụng nhạc</option>

        {musicUrl && !exists && (
          <option value={musicUrl}>
            Bài nhạc đang lưu (không có trong thư viện)
          </option>
        )}

        {tracks.map((track) => (
          <option key={track.url} value={track.url}>
            {track.name}
          </option>
        ))}
      </select>

      {tracks.length === 0 && (
        <p className="music-help">
          Thư viện chưa có bài hát. Thêm file MP3 vào thư mục public/music rồi
          tải lại trang.
        </p>
      )}

      {musicUrl && (
        <>
          <audio
            ref={audioRef}
            src={musicUrl}
            preload="metadata"
            onLoadedMetadata={handleMetadata}
            onTimeUpdate={handleTimeUpdate}
            onEnded={replay}
            onError={() => setError("Không tải được file nhạc.")}
          />

          <div className="music-duration">
            <span>Độ dài bài hát</span>
            <strong>{formatTime(duration)}</strong>
          </div>

          <div className="music-range">
            <div className="music-range-heading">
              <label>Điểm bắt đầu</label>
              <strong>{formatTime(start)}</strong>
            </div>

            <input
              type="range"
              min={0}
              max={Math.max(0, effectiveEnd - 0.5)}
              step={0.1}
              value={Math.min(start, Math.max(0, effectiveEnd - 0.5))}
              disabled={!duration}
              onChange={changeStart}
            />
          </div>

          <div className="music-range">
            <div className="music-range-heading">
              <label>Điểm kết thúc</label>
              <strong>{formatTime(effectiveEnd)}</strong>
            </div>

            <input
              type="range"
              min={Math.min(duration, start + 0.5)}
              max={duration || 1}
              step={0.1}
              value={Math.min(duration || 1, effectiveEnd)}
              disabled={!duration}
              onChange={changeEnd}
            />
          </div>

          <div className="music-selection-info">
            <span>Đoạn được chọn</span>
            <strong>
              {formatTime(start)} → {formatTime(effectiveEnd)}
            </strong>
            <small>
              {Math.max(0, effectiveEnd - start).toFixed(1)} giây · Lặp liên tục
            </small>
          </div>

          <button
            type="button"
            className="button music-preview-button"
            onClick={togglePreview}
            disabled={!duration}>
            {playing ? "⏸ Tạm dừng" : "▶ Nghe thử đoạn nhạc"}
          </button>

          {error && <p className="error-text">{error}</p>}
        </>
      )}
    </div>
  );
}
