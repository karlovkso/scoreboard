import React, { useCallback, useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FullscreenBtn from "../components/FullscreenBtn";
import ColorBgBtn from "../components/ColorBgBtn";
import MessageModal from "../components/MessageModal";
import ScoreboardTeamCard from "../components/scoreboard/ScoreboardTeamCard";
import ShotclockPanel from "../components/scoreboard/ShotclockPanel";
import FoulModal from "../components/scoreboard/FoulModal";
import buzzer from "../assets/buzzer.mp3";
import {
  buildInitialScores,
  buildMatchSnapshot,
  getConfiguredShotclockDuration,
  getConfiguredTimeoutDuration,
  normalizeNumericValue,
} from "../utils/scoreboard";
import {
  readStoredArray,
  readStoredObject,
  writeStoredValue,
} from "../utils/storage";

const MATCH_KEY = "match_history";
const SETUP_KEY = "setup_data";
const TOTAL_PERIODS = 4;

const Scoreboard = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const matchIndex = state?.matchIndex;

  const setup = readStoredObject(SETUP_KEY, null);
  const history = readStoredArray(MATCH_KEY, []);
  const match = history[matchIndex];
  const isGameDataAvailable = Boolean(
    setup && typeof matchIndex === "number" && match,
  );

  const [scores, setScores] = useState(() =>
    isGameDataAvailable ? buildInitialScores(setup, match) : [],
  );

  const defaultTimeLeft = normalizeNumericValue(setup?.timePerQuarter, 0) * 60;
  const configuredTimeoutDuration = getConfiguredTimeoutDuration(setup, 0);

  const [period, setPeriod] = useState(match?.period || 1);
  const [timeLeft, setTimeLeft] = useState(
    typeof match?.timeLeft === "number" ? match.timeLeft : defaultTimeLeft,
  );
  const [isRunning, setIsRunning] = useState(!!match?.isRunning);

  const configuredShotclockDuration = getConfiguredShotclockDuration(setup, 24);

  const [shotclockLeft, setShotclockLeft] = useState(
    typeof match?.shotclockLeft === "number"
      ? match.shotclockLeft
      : configuredShotclockDuration,
  );
  const [shotclockRunning, setShotclockRunning] = useState(
    !!match?.shotclockRunning,
  );

  const [timeoutLeft, setTimeoutLeft] = useState(
    typeof match?.timeoutLeft === "number" ? match.timeoutLeft : 0,
  );
  const [activeTimeoutTeam, setActiveTimeoutTeam] = useState(
    typeof match?.activeTimeoutTeam === "number"
      ? match.activeTimeoutTeam
      : null,
  );

  const [showFoulModal, setShowFoulModal] = useState(false);
  const [foulTeamIndex, setFoulTeamIndex] = useState(null);
  const [hoveredTeamIndex, setHoveredTeamIndex] = useState(null);
  const [messageModal, setMessageModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  const timerRef = useRef(null);
  const timeoutRef = useRef(null);
  const shotclockRef = useRef(null);
  const audioRef = useRef(new Audio(buzzer));

  useEffect(() => {
    audioRef.current.volume = 1.0;
  }, []);

  const openMessageDialog = (title, message) => {
    setMessageModal({ isOpen: true, title, message });
  };

  const closeMessageDialog = () => {
    setMessageModal({ isOpen: false, title: "", message: "" });
  };

  const handleBuzzer = useCallback(() => {
    audioRef.current.currentTime = 0;
    audioRef.current
      .play()
      .catch((err) => console.error("Error playing sound:", err));

    if (timeoutLeft > 0) {
      clearInterval(timeoutRef.current);
      setTimeoutLeft(0);
      setActiveTimeoutTeam(null);
      setIsRunning(false);
    }
  }, [timeoutLeft]);

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
  }, [handleBuzzer, isRunning]);

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
  }, [handleBuzzer, timeoutLeft]);

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
  }, [handleBuzzer, shotclockRunning]);

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
        idx === i ? { ...t, score: Math.max(0, t.score + delta) } : t,
      ),
    );
  };

  const handleTimeout = (i) => {
    if (scores[i].timeouts === 0 || timeoutLeft > 0) return;

    setIsRunning(false);
    setActiveTimeoutTeam(i);
    setTimeoutLeft(configuredTimeoutDuration);

    setScores((prev) =>
      prev.map((t, idx) =>
        idx === i ? { ...t, timeouts: t.timeouts - 1 } : t,
      ),
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
    setShotclockLeft(configuredShotclockDuration);
    setShotclockRunning(false);
    clearInterval(shotclockRef.current);
  };

  const resetShotclock14 = () => {
    setShotclockLeft(14);
    setShotclockRunning(false);
    clearInterval(shotclockRef.current);
  };

  const toggleShotclock = () => {
    setShotclockRunning((prev) => !prev);
  };

  const nextQuarter = () => {
    if (period >= TOTAL_PERIODS) {
      openMessageDialog(
        "GAME COMPLETE",
        "All quarters completed. End the game.",
      );
      return;
    }

    setPeriod((p) => p + 1);
    setTimeLeft(normalizeNumericValue(setup.timePerQuarter, 0) * 60);
    setIsRunning(false);
    setTimeoutLeft(0);
    setActiveTimeoutTeam(null);
    setShotclockLeft(configuredShotclockDuration);
    setShotclockRunning(false);
    clearInterval(shotclockRef.current);

    setScores((prev) =>
      prev.map((team) => ({
        ...team,
        timeouts: setup.timeoutPerQuarter,
        players: team.players,
        fouls: 0,
      })),
    );
  };

  const persistMatchState = (winner) => {
    const [a, b] = scores;
    const currentHistory = readStoredArray(MATCH_KEY, []);
    const updatedMatch = buildMatchSnapshot({
      match,
      scores,
      timeLeft,
      shotclockLeft,
      shotclockRunning,
      period,
      activeTimeoutTeam,
      timeoutLeft,
      isRunning,
      winner:
        winner ??
        (a.score > b.score ? a.name : b.score > a.score ? b.name : null),
    });

    currentHistory[matchIndex] = updatedMatch;
    writeStoredValue(MATCH_KEY, currentHistory);
    navigate("/summary");
  };

  const endGame = () => {
    const [a, b] = scores;
    persistMatchState(
      a.score > b.score ? a.name : b.score > a.score ? b.name : null,
    );
  };

  const handleSaveAndNavigate = () => {
    persistMatchState(null);
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

  const handleFoul = (teamIndex, playerIdx) => {
    setScores((prev) =>
      prev.map((t, idx) => {
        if (idx === teamIndex) {
          const newPlayers = t.players.map((p, i) =>
            i === playerIdx ? { ...p, fouls: p.fouls + 1 } : p,
          );
          return { ...t, players: newPlayers, fouls: t.fouls + 1 };
        }
        return t;
      }),
    );
    setShowFoulModal(false);
  };

  if (!isGameDataAvailable) {
    return <p>No game data available.</p>;
  }

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
        {scores.map((team, index) => (
          <React.Fragment key={index}>
            <ScoreboardTeamCard
              team={team}
              index={index}
              setup={setup}
              hoveredTeamIndex={hoveredTeamIndex}
              setHoveredTeamIndex={setHoveredTeamIndex}
              timeoutLeft={timeoutLeft}
              activeTimeoutTeam={activeTimeoutTeam}
              updateScore={updateScore}
              handleTimeout={handleTimeout}
              onOpenFoulModal={(teamIndex) => {
                setFoulTeamIndex(teamIndex);
                setShowFoulModal(true);
                setIsRunning(false);
              }}
            />

            {index === 0 && (
              <ShotclockPanel
                shotclockLeft={shotclockLeft}
                shotclockRunning={shotclockRunning}
                period={period}
                isRunning={isRunning}
                totalPeriods={TOTAL_PERIODS}
                onShotclockEdit={handleShotclockEdit}
                onPeriodEdit={handlePeriodEdit}
                onResetShotclock14={resetShotclock14}
                onToggleShotclock={toggleShotclock}
                onResetShotclock={resetShotclock}
                onTogglePause={togglePause}
                onNextQuarter={nextQuarter}
                onBuzzer={handleBuzzer}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      <FoulModal
        isOpen={showFoulModal}
        teamPlayers={scores[foulTeamIndex]?.players || []}
        onClose={() => setShowFoulModal(false)}
        onSelectPlayer={(playerIndex) => handleFoul(foulTeamIndex, playerIndex)}
      />

      <MessageModal
        isOpen={messageModal.isOpen}
        title={messageModal.title}
        message={messageModal.message}
        onConfirm={closeMessageDialog}
      />
    </div>
  );
};

export default Scoreboard;
