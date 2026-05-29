import React, { useEffect, useState } from "react";
import { readStoredString, writeStoredValue } from "../utils/storage";

const BG_COLOR_KEY = "bg_color";

const ColorBgBtn = () => {
  const initialColor = readStoredString(BG_COLOR_KEY, "#ffffff");
  const [bgColor, setBgColor] = useState(initialColor);

  useEffect(() => {
    document.body.style.backgroundColor = bgColor;
  }, [bgColor]);

  const handleColorChange = (e) => {
    const color = e.target.value;
    setBgColor(color);
    writeStoredValue(BG_COLOR_KEY, color);
  };

  return (
    <div className="d-flex align-items-center gap-2">
      <input
        type="color"
        className="form-control form-control-color"
        value={bgColor}
        onChange={handleColorChange}
        title="Change Background Color"
        style={{ width: "50px", height: "38px" }}
      />
    </div>
  );
};

export default ColorBgBtn;
