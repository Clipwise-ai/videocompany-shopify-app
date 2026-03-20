/* eslint-disable react/prop-types */
import { connectPageStyles as s } from "./connectPageStyles";

const galleryColumns = [
  [
    { src: "/assetsIcon/Dashboard/image_1.png", height: "281px" },
    { src: "/assetsIcon/Dashboard/image_4.png", height: "312px" },
    { src: "/assetsIcon/Dashboard/image_7.png", height: "80px" },
  ],
  [
    { src: "/assetsIcon/Dashboard/image_2.png", height: "334px" },
    { src: "/assetsIcon/Dashboard/image_5.png", height: "334px" },
  ],
  [
    { src: "/assetsIcon/Dashboard/image_3.png", height: "260px" },
    { src: "/assetsIcon/Dashboard/image_6.png", height: "334px" },
    { src: "/assetsIcon/Dashboard/image_8.png", height: "80px" },
  ],
];

export function ConnectPageGallery() {
  return (
    <div style={{ ...s.gallerySide, display: "none" }} className="md-visible-gallery">
      <div style={s.galleryGlow} />
      <div style={s.galleryContainer}>
        {galleryColumns.map((column, index) => (
          <div key={index} style={index === 2 ? { ...s.galleryColumn, overflow: "hidden" } : s.galleryColumn}>
            {column.map((image) => (
              <img
                key={image.src}
                src={image.src}
                alt="Video Company demo"
                style={{ ...s.galleryImage, height: image.height }}
                onError={(event) => {
                  event.target.style.display = "none";
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <div style={s.galleryFadeTop} />
    </div>
  );
}
