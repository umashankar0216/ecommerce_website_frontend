import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

function OfferBanner() {

  const offerImages = [
    "https://img.freepik.com/vetores-gratis/modelo-de-banner-de-venda-horizontal-plano-com-foto_23-2149000923.jpg",
    "https://img.freepik.com/free-vector/flat-horizontal-sale-banner-template_23-2149003726.jpg?w=2000",
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&h=500&fit=crop"
  ];

  return (
    <div style={{ width: "100%" }}>
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        loop={true}
        style={{
          width: "100%",
          height: "400px",
        }}
      >
        {offerImages.map((image, index) => (
          <SwiperSlide key={index}>
            <img
              src={image}
              alt={`Banner ${index + 1}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default OfferBanner;