import React, { useState, useEffect } from "react";

const FullscreenBtn = () => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullScreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <button className="std-btn btn btn-info fw-bold" onClick={toggleFullscreen}>
      {isFullScreen ? (
        <i className="fa-solid fa-compress"></i>
      ) : (
        <i className="fa-solid fa-expand"></i>
      )}
    </button>
  );
};

export default FullscreenBtn;
