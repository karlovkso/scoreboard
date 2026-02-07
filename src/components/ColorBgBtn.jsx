import React, { useState, useEffect } from "react";

const BG_COLOR_KEY = "bg_color";

const ColorBgBtn = () => {
  const [bgColor, setBgColor] = useState("#ffffff");

  useEffect(() => {
    const saved = localStorage.getItem(BG_COLOR_KEY);
    if (saved) {
      setBgColor(saved);
      document.body.style.backgroundColor = saved;
    }
  }, []);

  const handleColorChange = (e) => {
    const color = e.target.value;
    setBgColor(color);
    document.body.style.backgroundColor = color;
    localStorage.setItem(BG_COLOR_KEY, color);
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
