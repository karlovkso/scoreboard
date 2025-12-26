import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const goToSetup = () => {
    navigate("/setup");
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 text-center">
      <div>
        <button
          className="home-btn btn btn-info fw-bold px-5 py-4"
          onClick={goToSetup}
        >
          START
        </button>
      </div>
    </div>
  );
};

export default Home;
