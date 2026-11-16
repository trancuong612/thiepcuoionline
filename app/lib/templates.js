export const TEMPLATES = [
  {
    id: "romantic",
    name: "Garden Romance",
    style: "Lãng mạn",
    description: "Màu kem dịu, hoa lá, nét chữ mềm mại.",
    badge: "Được yêu thích",
    palette: "#a48273",
  },
  {
    id: "minimal",
    name: "Modern Vows",
    style: "Tối giản",
    description: "Nhiều khoảng thở, phông chữ tinh tế, đen và trắng.",
    badge: "Thanh lịch",
    palette: "#62686a",
  },
  {
    id: "traditional",
    name: "Hỷ Sắc",
    style: "Truyền thống",
    description: "Đỏ son, vàng champagne, họa tiết Á Đông.",
    badge: "Á Đông",
    palette: "#b44343",
  },
  {
    id: "midnight-pearl",
    name: "Midnight Pearl",
    style: "Luxury",
    description: "Xanh navy, trắng ngọc trai và ánh bạc.",
    badge: "Luxury",
    palette: "#24395d",
  },
  {
    id: "lavender-bloom",
    name: "Lavender Bloom",
    style: "Floral",
    description: "Tím lavender, hoa mềm mại và sắc trắng kem.",
    badge: "Romantic",
    palette: "#a48bb7",
  },
];

export function findTemplate(id) {
  return TEMPLATES.find((item) => item.id === id);
}
