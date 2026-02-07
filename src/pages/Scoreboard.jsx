import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FullscreenBtn from "../components/FullscreenBtn";
import ColorBgBtn from "../components/ColorBgBtn";
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

  const [scores, setScores] = useState(() => {
    const makePlayersFromSetup = (teamName) =>
      setup.teams
        .find((t) => t.teamName === teamName)
        .teamPlayerNames.split(",")
        .map((p) => ({ name: p.trim(), fouls: 0 }));

    const p0 =
      match.players && match.players[0]
        ? match.players[0]
        : makePlayersFromSetup(match.team1);
    const p1 =
      match.players && match.players[1]
        ? match.players[1]
        : makePlayersFromSetup(match.team2);

    return [
      {
        name: match.team1,
        score: typeof match.score1 === "number" ? match.score1 : 0,
        color: setup.teams.find((t) => t.teamName === match.team1).teamColor,
        fouls: (match.teamFouls && match.teamFouls[0]) || 0,
        timeouts:
          (match.teamTimeouts && match.teamTimeouts[0]) ||
          setup.timeoutPerQuarter,
        players: p0,
      },
      {
        name: match.team2,
        score: typeof match.score2 === "number" ? match.score2 : 0,
        color: setup.teams.find((t) => t.teamName === match.team2).teamColor,
        fouls: (match.teamFouls && match.teamFouls[1]) || 0,
        timeouts:
          (match.teamTimeouts && match.teamTimeouts[1]) ||
          setup.timeoutPerQuarter,
        players: p1,
      },
    ];
  });

  const [period, setPeriod] = useState(match.period || 1);
  const [timeLeft, setTimeLeft] = useState(
    typeof match.timeLeft === "number"
      ? match.timeLeft
      : setup.timePerQuarter * 60
  );
  const [isRunning, setIsRunning] = useState(!!match.isRunning);

  const [shotclockLeft, setShotclockLeft] = useState(
    typeof match.shotclockLeft === "number"
      ? match.shotclockLeft
      : setup.shotclockDuration || 24
  );
  const [shotclockRunning, setShotclockRunning] = useState(
    !!match.shotclockRunning
  );

  const [timeoutLeft, setTimeoutLeft] = useState(
    typeof match.timeoutLeft === "number" ? match.timeoutLeft : 0
  );
  const [activeTimeoutTeam, setActiveTimeoutTeam] = useState(
    typeof match.activeTimeoutTeam === "number" ? match.activeTimeoutTeam : null
  );

  const [showFoulModal, setShowFoulModal] = useState(false);
  const [foulTeamIndex, setFoulTeamIndex] = useState(null);
  const [hoveredTeamIndex, setHoveredTeamIndex] = useState(null);

  const timerRef = useRef(null);
  const timeoutRef = useRef(null);
  const shotclockRef = useRef(null);

  useEffect(() => {
    if (!isRunning) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsRunning(false);
          handleBuzzer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  useEffect(() => {
    if (timeoutLeft <= 0) return;

    timeoutRef.current = setInterval(() => {
      setTimeoutLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timeoutRef.current);
          setActiveTimeoutTeam(null);
          handleBuzzer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timeoutRef.current);
  }, [timeoutLeft]);

  useEffect(() => {
    if (!shotclockRunning) return;

    shotclockRef.current = setInterval(() => {
      setShotclockLeft((prev) => {
        if (prev <= 1) {
          clearInterval(shotclockRef.current);
          setShotclockRunning(false);
          handleBuzzer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(shotclockRef.current);
  }, [shotclockRunning]);

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

  const handleTimeout = (i) => {
    if (scores[i].timeouts === 0 || timeoutLeft > 0) return;

    setIsRunning(false);
    setActiveTimeoutTeam(i);
    setTimeoutLeft(setup.timeoutDuration);

    setScores((prev) =>
      prev.map((t, idx) => (idx === i ? { ...t, timeouts: t.timeouts - 1 } : t))
    );
  };

  const togglePause = () => {
    setIsRunning((prev) => !prev);
    setShotclockRunning((prev) => !prev);

    if (timeoutLeft > 0) {
      clearInterval(timeoutRef.current);
      setTimeoutLeft(0);
      setActiveTimeoutTeam(null);
    }
  };

  const resetShotclock = () => {
    setShotclockLeft(setup.shotclockDuration || 24);
    setShotclockRunning(false);
    clearInterval(shotclockRef.current);
  };

  const resetShotclock14 = () => {
    setShotclockLeft(setup.shotclockDuration || 14);
    setShotclockRunning(false);
    clearInterval(shotclockRef.current);
  };

  const toggleShotclock = () => {
    setShotclockRunning((prev) => !prev);
  };

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
    setShotclockLeft(setup.shotclockDuration || 24);
    setShotclockRunning(false);
    clearInterval(shotclockRef.current);

    setScores((prev) =>
      prev.map((team) => ({
        ...team,
        timeouts: setup.timeoutPerQuarter,
        players: team.players,
        fouls: 0,
      }))
    );
  };

  const endGame = () => {
    const [a, b] = scores;
    const currentHistory = JSON.parse(localStorage.getItem(MATCH_KEY)) || [];
    const updatedMatch = {
      ...match,
      score1: a.score,
      score2: b.score,
      winner: a.score > b.score ? a.name : b.score > a.score ? b.name : null,
      timeLeft,
      shotclockLeft,
      shotclockRunning,
      period,
      teamTimeouts: scores.map((s) => s.timeouts),
      teamFouls: scores.map((s) => s.fouls),
      players: scores.map((s) => s.players),
      activeTimeoutTeam,
      timeoutLeft,
      isRunning,
      lastUpdated: new Date().toISOString(),
    };
    currentHistory[matchIndex] = updatedMatch;
    localStorage.setItem(MATCH_KEY, JSON.stringify(currentHistory));
    navigate("/summary");
  };

  const handleSaveAndNavigate = () => {
    const [a, b] = scores;
    const currentHistory = JSON.parse(localStorage.getItem(MATCH_KEY)) || [];
    const updatedMatch = {
      ...match,
      score1: a.score,
      score2: b.score,
      winner: null,
      timeLeft,
      shotclockLeft,
      shotclockRunning,
      period,
      teamTimeouts: scores.map((s) => s.timeouts),
      teamFouls: scores.map((s) => s.fouls),
      players: scores.map((s) => s.players),
      activeTimeoutTeam,
      timeoutLeft,
      isRunning,
      lastUpdated: new Date().toISOString(),
    };
    currentHistory[matchIndex] = updatedMatch;
    localStorage.setItem(MATCH_KEY, JSON.stringify(currentHistory));
    navigate("/summary");
  };

  const handleTimerEdit = (e) => {
    setTimeLeft(parseTime(e.currentTarget.innerText));
  };

  const handlePeriodEdit = (e) => {
    const val = parseInt(e.currentTarget.innerText) || 1;
    setPeriod(Math.min(Math.max(val, 1), TOTAL_PERIODS));
  };

  const handleShotclockEdit = (e) => {
    const raw = e.currentTarget.innerText || "";
    const digits = raw.replace(/[^0-9]/g, "");
    const val = parseInt(digits, 10);
    if (!isNaN(val)) {
      setShotclockLeft(Math.max(0, val));
    }
    setShotclockRunning(false);
    clearInterval(shotclockRef.current);
  };

  const handleBuzzer = () => {
    const audio = new Audio(buzzer);
    audio.volume = 1.0;
    audio.play().catch((err) => console.error("Error playing sound:", err));

    if (timeoutLeft > 0) {
      clearInterval(timeoutRef.current);
      setTimeoutLeft(0);
      setActiveTimeoutTeam(null);
      setIsRunning(false);
    }
  };

  const handleFoul = (teamIndex, playerIdx) => {
    setScores((prev) =>
      prev.map((t, idx) => {
        if (idx === teamIndex) {
          const newPlayers = t.players.map((p, i) =>
            i === playerIdx ? { ...p, fouls: p.fouls + 1 } : p
          );
          return { ...t, players: newPlayers, fouls: t.fouls + 1 };
        }
        return t;
      })
    );
    setShowFoulModal(false);
  };

  return (
    <div className="container-fluid mt-4 mb-3 px-4">
      <div className="d-flex gap-2">
        <ColorBgBtn />
        <button
          className="std-btn btn btn-info fw-bold"
          onClick={handleSaveAndNavigate}
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
              <div style={{ position: "relative" }}>
                <h3
                  className="text-center m-0 fw-bold"
                  style={{ backgroundColor: t.color, color: "white" }}
                  onMouseEnter={() => setHoveredTeamIndex(i)}
                  onMouseLeave={() => setHoveredTeamIndex(null)}
                >
                  {t.name}
                </h3>
                {(hoveredTeamIndex === i ||
                  t.players.some((p) => {
                    const playerFoulsLimit = parseInt(setup.playerFouls) || 0;
                    return (
                      p.fouls === playerFoulsLimit - 1 ||
                      p.fouls === playerFoulsLimit
                    );
                  })) && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: "0",
                      backgroundColor: "rgba(0,0,0,0.9)",
                      color: "white",
                      padding: "10px",
                      borderRadius: "5px",
                      zIndex: 10,
                      minWidth: "200px",
                    }}
                  >
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                      {hoveredTeamIndex === i
                        ? t.players.map((p, idx) => {
                            const playerFoulsLimit =
                              parseInt(setup.playerFouls) || 0;
                            const isWarning = p.fouls === playerFoulsLimit - 1;
                            const isDanger = p.fouls === playerFoulsLimit;
                            return (
                              <li
                                key={idx}
                                className={
                                  isWarning
                                    ? "text-warning"
                                    : isDanger
                                    ? "text-danger"
                                    : ""
                                }
                                style={{ marginBottom: "5px" }}
                              >
                                {p.name}: <span>{p.fouls}</span> fouls
                              </li>
                            );
                          })
                        : t.players
                            .filter((p) => {
                              const playerFoulsLimit =
                                parseInt(setup.playerFouls) || 0;
                              return (
                                p.fouls === playerFoulsLimit - 1 ||
                                p.fouls === playerFoulsLimit
                              );
                            })
                            .map((p, idx) => {
                              const playerFoulsLimit =
                                parseInt(setup.playerFouls) || 0;
                              const isWarning =
                                p.fouls === playerFoulsLimit - 1;
                              const isDanger = p.fouls === playerFoulsLimit;
                              return (
                                <li
                                  key={idx}
                                  className={
                                    isWarning
                                      ? "text-warning"
                                      : isDanger
                                      ? "text-danger"
                                      : ""
                                  }
                                  style={{ marginBottom: "5px" }}
                                >
                                  {p.name}: <span>{p.fouls}</span> fouls
                                </li>
                              );
                            })}
                    </ul>
                  </div>
                )}
              </div>

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

                  <button
                    className="btn btn-outline-danger fw-bold"
                    onClick={() => {
                      setFoulTeamIndex(i);
                      setShowFoulModal(true);
                      setIsRunning(false);
                    }}
                  >
                    FOUL
                  </button>
                </div>
              </div>
            </div>

            {i === 0 && (
              <div className="text-center">
                <h3 className="m-0 fw-bold">SHOTCLOCK</h3>
                <h3
                  className="text-warning fw-bold"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={handleShotclockEdit}
                  style={{ fontSize: "10rem", border: "none", outline: "none" }}
                >
                  {shotclockLeft}
                </h3>

                <div className="d-flex justify-content-center gap-2 mt-2">
                  <button
                    className="btn btn-secondary fw-bold"
                    onClick={resetShotclock14}
                  >
                    14
                  </button>
                  <button className="btn btn-warning" onClick={toggleShotclock}>
                    {shotclockRunning ? (
                      <i className="fa-solid fa-pause"></i>
                    ) : (
                      <i className="fa-solid fa-play"></i>
                    )}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={resetShotclock}
                  >
                    <i className="fa-solid fa-arrow-rotate-left"></i>
                  </button>
                </div>

                <h3 className="m-0 fw-bold mt-3">PERIOD</h3>
                <h3
                  className="text-warning fw-bold"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={handlePeriodEdit}
                  style={{
                    fontSize: "7.5rem",
                    border: "none",
                    outline: "none",
                  }}
                >
                  {period}
                </h3>

                <div className="d-flex justify-content-center gap-2 mt-2">
                  <button className="btn btn-danger" onClick={handleBuzzer}>
                    <i className="fa-solid fa-bullhorn"></i>
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

      {showFoulModal && (
        <div className="modal" style={{ display: "block" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">WHO'S FOUL?</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowFoulModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {scores[foulTeamIndex].players.map((player, idx) => (
                  <button
                    key={idx}
                    className="std-info-modal-btn btn btn-info m-1 fw-bold"
                    onClick={() => handleFoul(foulTeamIndex, idx)}
                  >
                    {player.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scoreboard;
