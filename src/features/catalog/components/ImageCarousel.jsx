import React, { useState, useEffect, useMemo } from 'react';
import './ImageCarousel.css';

 function ImageCarousel({ images = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Default image fallback if array is empty
  const imageList = useMemo(() => {
    return images.length > 0 
      ? images 
      : ['https://placehold.co/500x500?text=No+Image'];
  }, [images]);

  // Auto-swipe every 3 seconds (3000ms)
  useEffect(() => {
    setCurrentIndex(0); // Reset index whenever image array changes (e.g. on variant change)
  }, [images]);

  useEffect(() => {
    if (imageList.length <= 1) return; // Don't auto-swipe if only 1 image

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % imageList.length);
    }, 3000);

    return () => clearInterval(timer); // Clean up interval on unmount or change
  }, [imageList]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? imageList.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % imageList.length);
  };

  return (
    <div className="carousel-container">
      <div className="carousel-main-wrapper">
        <img
          src={imageList[currentIndex]}
          alt={`Product view ${currentIndex + 1}`}
          className="carousel-image"
        />

        {imageList.length > 1 && (
          <>
            <button className="carousel-arrow left" onClick={handlePrev} aria-label="Previous">
              &#10094;
            </button>
            <button className="carousel-arrow right" onClick={handleNext} aria-label="Next">
              &#10095;
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {imageList.length > 1 && (
        <div className="carousel-thumbnails">
          {imageList.map((imgUrl, idx) => (
            <button
              key={idx}
              className={`thumbnail-btn ${idx === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(idx)}
            >
              <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="thumbnail-img" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageCarousel;