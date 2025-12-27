import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const MATCH_KEY = "match_history";
const SETUP_KEY = "setup_data";
const TOTAL_PERIODS = 4;

const Scoreboard = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const matchIndex = state?.matchIndex;

  const setup = JSON.parse(localStorage.getItem(SETUP_KEY));
  const history = JSON.parse(localStorage.getItem(MATCH_KEY)) || [];

  if (!setup || matchIndex === undefined) {
    return <p>No game data available.</p>;
  }

  const match = history[matchIndex];

  const [scores, setScores] = useState([
    {
      name: match.team1,
      score: match.score1,
      color:
        setup.teams.find((t) => t.teamName === match.team1)?.teamColor ||
        "#000000",
    },
    {
      name: match.team2,
      score: match.score2,
      color:
        setup.teams.find((t) => t.teamName === match.team2)?.teamColor ||
        "#000000",
    },
  ]);

  const [period, setPeriod] = useState(1);
  const [timeLeft, setTimeLeft] = useState(setup.timePerQuarter * 60);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // if time reaches zero
            clearInterval(timerRef.current);
            setIsRunning(false); // stop the timer
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullScreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const parseTime = (str) => {
    const parts = str.split(":").map(Number);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return parts[0] * 60 + parts[1];
    }
    return timeLeft;
  };

  const updateScore = (i, delta) => {
    setScores((prev) =>
      prev.map((t, idx) =>
        idx === i ? { ...t, score: Math.max(0, t.score + delta) } : t
      )
    );
  };

  const togglePause = () => {
    setIsRunning((prev) => !prev);
  };

  const nextQuarter = () => {
    if (period < TOTAL_PERIODS) {
      setPeriod((prev) => prev + 1);
      setTimeLeft(setup.timePerQuarter * 60);
      setIsRunning(false);
    } else {
      alert("All quarters completed. End the game.");
    }
  };

  const endGame = () => {
    const [a, b] = scores;
    history[matchIndex] = {
      ...match,
      score1: a.score,
      score2: b.score,
      winner: a.score > b.score ? a.name : b.score > a.score ? b.name : null,
    };
    localStorage.setItem(MATCH_KEY, JSON.stringify(history));
    navigate("/summary");
  };

  const handleTimerEdit = (e) => {
    const newTime = parseTime(e.currentTarget.innerText);
    setTimeLeft(newTime);
  };

  const handlePeriodEdit = (e) => {
    const newPeriod = parseInt(e.currentTarget.innerText) || 1;
    setPeriod(Math.min(Math.max(newPeriod, 1), TOTAL_PERIODS));
  };

  return (
    <div className="container mt-4">
      <div className="d-flex gap-2">
        <button
          className="std-btn btn btn-info fw-bold"
          onClick={() => navigate("/summary")}
        >
          GO TO SUMMARY
        </button>
        <button
          className="std-btn btn btn-info fw-bold"
          onClick={() => {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen();
            } else {
              document.exitFullscreen();
            }
          }}
        >
          {isFullScreen ? (
            <i className="fa-solid fa-compress"></i>
          ) : (
            <i className="fa-solid fa-expand"></i>
          )}
        </button>
        <button className="btn btn-danger fw-bold" onClick={endGame}>
          END
        </button>
      </div>

      {/* Timer and Period */}
      <div className="text-center">
        <h1
          className="text-warning fw-bold"
          contentEditable
          suppressContentEditableWarning
          onBlur={handleTimerEdit}
          style={{
            fontSize: "20rem",
            border: "none",
            outline: "none",
          }}
        >
          {formatTime(timeLeft)}
        </h1>
      </div>
      <div className="d-flex gap-3 align-items-start">
        {scores.map((t, i) => (
          <React.Fragment key={i}>
            {/* Team */}
            <div style={{ minWidth: "200px", flex: "1 1 200px" }}>
              <h3
                className="text-center m-0 fw-bold"
                style={{
                  backgroundColor: t.color,
                  color: "white",
                }}
              >
                {t.name}
              </h3>
              <div className="text-center">
                <h4
                  className="fw-bold"
                  contentEditable
                  suppressContentEditableWarning
                  style={{
                    fontSize: "15rem",
                    border: "none",
                    outline: "none",
                  }}
                >
                  {t.score}
                </h4>
                <div className="d-flex justify-content-center flex-wrap gap-2">
                  <button
                    className="btn btn-success"
                    onClick={() => updateScore(i, 1)}
                  >
                    +1
                  </button>
                  <button
                    className="btn btn-success"
                    onClick={() => updateScore(i, 2)}
                  >
                    +2
                  </button>
                  <button
                    className="btn btn-success"
                    onClick={() => updateScore(i, 3)}
                  >
                    +3
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => updateScore(i, -1)}
                  >
                    -1
                  </button>
                </div>
              </div>
            </div>

            {/* Insert period panel after first team */}
            {i === 0 && (
              <div className="text-center" style={{ minWidth: "250px" }}>
                <h3 className="m-0 fw-bold">PERIOD</h3>
                <h3
                  className="text-warning fw-bold"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={handlePeriodEdit}
                  style={{ fontSize: "10rem", border: "none", outline: "none" }}
                >
                  {period}
                </h3>
                <div className="d-flex justify-content-center gap-2 mt-2">
                  <button className="btn btn-warning" onClick={togglePause}>
                    {isRunning ? (
                      <i className="fa-solid fa-pause"></i>
                    ) : (
                      <i className="fa-solid fa-play"></i>
                    )}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={nextQuarter}
                    disabled={period >= TOTAL_PERIODS}
                  >
                    <i className="fa-solid fa-forward-step"></i>
                  </button>
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Scoreboard;
