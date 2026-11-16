import Romantic from "./templates/Romantic";
import Minimal from "./templates/Minimal";
import Traditional from "./templates/Traditional";
import MidnightPearl from "./templates/MidnightPearl";
import LavenderBloom from "./templates/LavenderBloom";

import { sampleContent } from "../lib/invitations";
import OpeningExperience from "./OpeningExperience";
import AutoScrollController from "./AutoScrollController";
const components = {
  romantic: Romantic,
  minimal: Minimal,
  traditional: Traditional,
  "midnight-pearl": MidnightPearl,
  "lavender-bloom": LavenderBloom,
};

// Ảnh minh họa có sẵn cho từng mẫu thiệp
const DEMO_IMAGES = {
  romantic: {
    cover:
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800&q=85",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=85",
      "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=800&q=85",
    ],
  },

  minimal: {
    cover:
      "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=1200&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=85",
      "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=85",
      "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800&q=85",
    ],
  },

  "midnight-pearl": {
    cover:
      "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=1200&q=88",
    gallery: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=85",
      "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=900&q=85",
      "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=900&q=85",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=900&q=85",
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=900&q=85",
      "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=900&q=85",
    ],
  },
  "lavender-bloom": {
    cover:
      "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1200&q=88",
    gallery: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=85",
      "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=900&q=85",
      "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=900&q=85",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=900&q=85",
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=900&q=85",
      "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=900&q=85",
    ],
  },
  traditional: {
    cover:
      "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=1200&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=85",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=85",
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=85",
    ],
  },
};

export default function TemplateRenderer({
  templateId = "romantic",
  content = sampleContent,
  preview = false,
  wishes = [],
  feedback = null,
  showOpening = false,
}) {
  const Component = components[templateId] || Romantic;

  const demo = DEMO_IMAGES[templateId] || DEMO_IMAGES.romantic;

  const data = {
    ...sampleContent,
    ...content,
  };

  const realGallery = Array.isArray(data.gallery)
    ? data.gallery.filter(Boolean)
    : [];

  // Trong xem trước:
  // Ảnh thật thay ảnh mẫu theo đúng vị trí.
  // Các vị trí còn trống tiếp tục hiện ảnh minh họa.
  const displayGallery = preview
    ? [...realGallery, ...demo.gallery.slice(realGallery.length)]
    : realGallery;

  const displayData = {
    ...data,

    bride: data.bride || (preview ? "Tên cô dâu" : ""),
    groom: data.groom || (preview ? "Tên chú rể" : ""),

    coverImage: data.coverImage || (preview ? demo.cover : ""),

    gallery: displayGallery,
  };

  return (
    <>
      {(!preview || showOpening) && (
        <OpeningExperience
          key={templateId}
          variant={templateId}
          data={displayData}
          demo={preview}
        />
      )}

      {["midnight-pearl", "lavender-bloom"].includes(templateId) &&
        (!preview || showOpening) && <AutoScrollController />}
      <Component
        data={displayData}
        preview={preview}
        wishes={wishes}
        feedback={feedback}
      />
    </>
  );
}
