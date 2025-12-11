// frontend/src/data/hatSacBuaData.js
// Giữ nguyên các imports ảnh trang sách (DÙ KHÔNG CÒN SỬ DỤNG, để tránh lỗi nếu các file khác dùng chung)
import hatSacBua1 from "../assets/img/chucnghedibien.png";
import hatSacBua2 from "../assets/img/chucnghethoduong.png";
import hatSacBua3 from "../assets/img/chucnghetrongbong.png";
import hatSacBua4 from "../assets/img/chucnghedayhoc.png";
import hatSacBua5 from "../assets/img/chucnghethaythuc.png";
import hatSacBua6 from "../assets/img/chucnghelaptienbanquan.png";
import hatSacBua7 from "../assets/img/chuctet.png";

import page464 from "../assets/img/pages/464.jpg";
import page465 from "../assets/img/pages/465.jpg";
import page466 from "../assets/img/pages/466.jpg";
// ... (Tất cả các imports trang sách khác)
import page487 from "../assets/img/pages/487.jpg";


const hatSacBuaData = [
  {
    id: 1,
    title: "TRỐNG CƠM",
    icon: "🎣",
    type: "Nhạc cụ Sắc Bùa",
    videoUrl: "https://res.cloudinary.com/dmiuw4ekf/video/upload/v1765380238/trong-com_wkra9b.mov",
    // Trường văn bản chi tiết:
    content: `Trống là nhạc cụ quan trọng nhất của đội hát, thường được ông bầu mang ngay trước bụng, dùng tay vỗ trống. Trống được ông bầu sử dụng để giữ nhịp và điều khiển cả đội hát.`,
    // Trường tóm tắt (dùng cho thẻ chưa mở):
    description: "Bài hát chúc nghề đi biển, cầu mong bội thu cá tôm và bình an trên biển.",
  },
  {
    id: 2,
    title: "ĐỜN CÒ",
    icon: "🪕",
    type: "Nhạc cụ Sắc Bùa",
    videoUrl: "https://res.cloudinary.com/dmiuw4ekf/video/upload/v1765427419/danco_unsiwl.mov",
    content: `Đờn cò chủ yếu là để diễn tấu phần giai điệu nền cho cuộc hát.`,
    description: "Bài hát chúc nghề đan lát, đan thúng, cầu chúc sự khéo léo, sản phẩm chất lượng và giàu có.",
  },
  {
    id: 3,
    title: "SANH TIỀN",
    icon: "🎶",
    type: "Nhạc cụ Sắc Bùa",
    videoUrl: "https://res.cloudinary.com/dmiuw4ekf/video/upload/v1704044941/hatsacbua/chucnghetrongbong.mp4",
    content: `Sanh tiền là một nhạc cụ của hát Sắc bùa Phú Lễ tạo âm thanh vui nhộn`,
    description: "Chúc tụng nghề trồng bông, chăn tằm, dệt vải, ca ngợi sự cần cù và khéo léo.",
  },
  {
    id: 4,
    title: "SANH CÁI",
    icon: "🎵",
    type: "Nhạc cụ Sắc Bùa",
    videoUrl: "https://res.cloudinary.com/dmiuw4ekf/video/upload/v1765427244/sanhtien_tmegia.mov",
    content: `Sanh cái dùng để gõ nhịp`,
    description: "Ca ngợi công đức dạy dỗ của thầy cô, cầu mong học trò chăm ngoan, giỏi giang.",
  },
];

export default hatSacBuaData;