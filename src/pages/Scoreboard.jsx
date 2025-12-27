import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FullscreenBtn from "../components/FullscreenBtn";
import buzzer from "../assets/buzzer.mp3";

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
      color: setup.teams.find((t) => t.teamName === match.team1).teamColor,
      fouls: setup.teamFouls,
      timeouts: setup.timeoutPerQuarter,
    },
    {
      name: match.team2,
      score: match.score2,
      color: setup.teams.find((t) => t.teamName === match.team2).teamColor,
      fouls: setup.teamFouls,
      timeouts: setup.timeoutPerQuarter,
    },
  ]);

  const [period, setPeriod] = useState(1);
  const [timeLeft, setTimeLeft] = useState(setup.timePerQuarter * 60);
  const [isRunning, setIsRunning] = useState(false);

  /* ⏱ TIMEOUT STATE */
  const [timeoutLeft, setTimeoutLeft] = useState(0);
  const [activeTimeoutTeam, setActiveTimeoutTeam] = useState(null);

  const timerRef = useRef(null);
  const timeoutRef = useRef(null);

  /* GAME CLOCK */
  useEffect(() => {
    if (!isRunning) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  /* TIMEOUT CLOCK */
  useEffect(() => {
    if (timeoutLeft <= 0) return;

    timeoutRef.current = setInterval(() => {
      setTimeoutLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timeoutRef.current);
          setActiveTimeoutTeam(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timeoutRef.current);
  }, [timeoutLeft]);

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

  /* ⏸ TEAM TIMEOUT */
  const handleTimeout = (i) => {
    if (scores[i].timeouts === 0 || timeoutLeft > 0) return;

    setIsRunning(false);
    setActiveTimeoutTeam(i);
    setTimeoutLeft(setup.timeoutDuration);

    setScores((prev) =>
      prev.map((t, idx) => (idx === i ? { ...t, timeouts: t.timeouts - 1 } : t))
    );
  };

  const togglePause = () => setIsRunning((prev) => !prev);

  const nextQuarter = () => {
    if (period >= TOTAL_PERIODS) {
      alert("All quarters completed. End the game.");
      return;
    }

    setPeriod((p) => p + 1);
    setTimeLeft(setup.timePerQuarter * 60);
    setIsRunning(false);
    setTimeoutLeft(0);
    setActiveTimeoutTeam(null);

    setScores((prev) =>
      prev.map((team) => ({
        ...team,
        timeouts: setup.timeoutPerQuarter,
      }))
    );
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
    setTimeLeft(parseTime(e.currentTarget.innerText));
  };

  const handlePeriodEdit = (e) => {
    const val = parseInt(e.currentTarget.innerText) || 1;
    setPeriod(Math.min(Math.max(val, 1), TOTAL_PERIODS));
  };

  const handleBuzzer = () => {
    const audio = new Audio(buzzer);
    audio.volume = 1.0;
    audio.play().catch((err) => console.error("Error playing sound:", err));
  };

  return (
    <div className="container-fluid mt-4 mb-3 px-4">
      <div className="d-flex gap-2">
        <button
          className="std-btn btn btn-info fw-bold"
          onClick={() => navigate("/summary")}
        >
          GO TO SUMMARY
        </button>
        <FullscreenBtn />
        <button className="btn btn-danger fw-bold" onClick={endGame}>
          END
        </button>
      </div>

      <div className="text-center">
        <h1
          className="text-warning fw-bold"
          contentEditable
          suppressContentEditableWarning
          onBlur={handleTimerEdit}
          style={{ fontSize: "25rem", border: "none", outline: "none" }}
        >
          {formatTime(timeLeft)}
        </h1>
      </div>

      <div className="d-flex gap-3 align-items-start">
        {scores.map((t, i) => (
          <React.Fragment key={i}>
            <div
              style={{
                minWidth: "200px",
                flex: "1 1 200px",
                borderColor: t.color,
                borderWidth: "3px",
                borderStyle: "solid",
                borderRadius: "10px",
              }}
            >
              <h3
                className="text-center m-0 fw-bold"
                style={{ backgroundColor: t.color, color: "white" }}
              >
                {t.name}
              </h3>

              <div className="text-center p-2">
                <h4
                  className="fw-bold text-danger"
                  style={{ fontSize: "15rem" }}
                >
                  {t.score}
                </h4>

                <div className="d-flex justify-content-between">
                  <div className="d-flex gap-2 align-items-center">
                    <h4 className="fw-bold" style={{ fontSize: "3rem" }}>
                      TIMEOUTS:
                    </h4>
                    <h4
                      className="fw-bold text-warning"
                      style={{ fontSize: "6rem" }}
                    >
                      {t.timeouts}
                    </h4>
                  </div>

                  <div className="d-flex gap-2 align-items-center">
                    <h4 className="fw-bold" style={{ fontSize: "3rem" }}>
                      FOULS:
                    </h4>
                    <h4
                      className="fw-bold text-warning"
                      style={{ fontSize: "6rem" }}
                    >
                      {t.fouls}
                    </h4>
                  </div>
                </div>

                <div className="d-flex justify-content-between">
                  <div className="d-flex gap-2 align-items-center">
                    <button
                      className="btn btn-outline-success fw-bold"
                      onClick={() => handleTimeout(i)}
                      disabled={t.timeouts === 0 || timeoutLeft > 0}
                    >
                      TIMEOUT
                    </button>
                    <h4
                      className="fw-bold text-warning mb-0"
                      style={{ fontSize: "1.5rem" }}
                      hidden={activeTimeoutTeam !== i}
                    >
                      {timeoutLeft}
                    </h4>
                  </div>

                  <div className="d-flex gap-2">
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

                  <button className="btn btn-outline-danger fw-bold">
                    FOUL
                  </button>
                </div>
              </div>
            </div>

            {i === 0 && (
              <div className="text-center">
                <h3 className="m-0 fw-bold">PERIOD</h3>
                <h3
                  className="text-warning fw-bold"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={handlePeriodEdit}
                  style={{ fontSize: "10rem" }}
                >
                  {period}
                </h3>

                <div className="d-flex justify-content-center gap-2 mt-2">
                  <button className="btn btn-danger">
                    <i
                      className="fa-solid fa-bullhorn"
                      onClick={handleBuzzer}
                    ></i>
                  </button>
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
