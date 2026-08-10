import React from 'react';
import './VariantSelector.css';

function VariantSelector({
  variants = [],
  selectedColor,
  selectedSize,
  onSelectColor,
  onSelectSize,
}) {
  // Safe filtering: remove any null or undefined variants
  const validVariants = (variants || []).filter(Boolean);

  if (validVariants.length === 0) return null;

  // 1. Extract unique colors with thumbnail images matching DTO `v.imageUrl`
  const colorMap = new Map();
  validVariants.forEach((v) => {
    if (v?.color && !colorMap.has(v.color)) {
      // DTO property is `imageUrl` (single string), fallback to null
      const thumb = v.imageUrl || null;
      colorMap.set(v.color, thumb);
    }
  });
  const uniqueColors = Array.from(colorMap.entries());

  // 2. Extract available sizes for current selected color
  const availableSizes = validVariants
    .filter((v) => !selectedColor || v?.color === selectedColor)
    .map((v) => v?.size)
    .filter(Boolean);

  return (
    <div className="variant-section">
      {/* 1. Colors with Thumbnail and Name */}
      {uniqueColors.length > 0 && (
        <div>
          <p className="variant-group-title">
            Color: <strong>{selectedColor || 'Select Color'}</strong>
          </p>
          <div className="color-swatch-list">
            {uniqueColors.map(([colorName, thumbUrl]) => (
              <button
                key={colorName}
                type="button"
                className={`color-swatch-btn ${selectedColor === colorName ? 'selected' : ''}`}
                onClick={() => onSelectColor(colorName)}
              >
                {thumbUrl && (
                  <img src={thumbUrl} alt={colorName} className="color-swatch-thumb" />
                )}
                <span className="color-swatch-name">{colorName}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. Sizes */}
      {availableSizes.length > 0 && (
        <div>
          <p className="variant-group-title">
            Size: <strong>{selectedSize || 'Select Size'}</strong>
          </p>
          <div className="size-button-list">
            {availableSizes.map((size) => (
              <button
                key={size}
                type="button"
                className={`size-btn ${selectedSize === size ? 'selected' : ''}`}
                onClick={() => onSelectSize(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default VariantSelector;