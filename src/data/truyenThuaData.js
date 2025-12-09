import chuyendevan from "../assets/img/chuyenDeVan.JPG";
import giaoluuthpt from "../assets/img/giaoLuuTHPT.png";
import giaoluuNgheNhan from "../assets/img/giaoLuuNgheNhan.JPG"
import ngheNhan1 from "../assets/img/nghenhan1.JPG"
import ngheNhan2 from "../assets/img/nghenhan2.JPG"
import ngheNhan3 from "../assets/img/nghenhan3.JPG"
import chuyenDeVan1 from "../assets/img/cdv1.JPG"
import chuyenDeVan2 from "../assets/img/cdv2.JPG"
import chuyenDeVan3 from "../assets/img/cdv3.JPG"
import nguyenHue1 from "../assets/img/nh1.JPG"
import nguyenHue2 from "../assets/img/nh2.JPG"
import nguyenHue3 from "../assets/img/nh3.JPG"

const truyenThuaData = [
  {
    id: 1,
    title: "Giao lưu với nghệ nhân",
    content: `Giao lưu với đội Hát Sắc Bùa ở Phong Nẫm - Giồng Trôm (Bến Tre cũ)`,
    galleryImages: [
        ngheNhan1,
        ngheNhan2,
        ngheNhan3,
    ],
    image: giaoluuNgheNhan,
    year: "GIAO LƯU VỚI NGHỆ NHÂN",
    type: "Truyền thừa",
    icon: "👨🏻‍💼",
  },
  {
    id: 2,
    title: "Sinh Hoạt chuyên đề văn",
    content: `Biểu diễn trong buổi sinh hoạt chuyên đề văn`,
    galleryImages: [
        chuyenDeVan1,
        chuyenDeVan2,
        chuyenDeVan3,
    ],
    image: chuyendevan,
    year: "CHUYÊN ĐỀ VĂN",
    type: "Truyền thừa",
    icon: "🎶",
  },
  {
    id: 3,
    title: "Giao lưu các trường THPT",
    content: `Giao lưu Hát Sắc Bùa Phú Lễ với các trường THPT`,
    galleryImages: [
        nguyenHue1,
        nguyenHue2,
        nguyenHue3,
    ],
    image: giaoluuthpt,
    year: "GIAO LƯU VỚI TRƯỜNG THPT",
    type: "Truyền thừa",
    icon: "🎤",
  },
];

export default truyenThuaData;
