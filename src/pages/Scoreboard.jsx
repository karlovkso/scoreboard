import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const MATCH_KEY = "match_history";
const SETUP_KEY = "setup_data";

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
    { name: match.team1, score: match.score1 },
    { name: match.team2, score: match.score2 },
  ]);

  const updateScore = (i, delta) => {
    setScores((prev) =>
      prev.map((t, idx) =>
        idx === i ? { ...t, score: Math.max(0, t.score + delta) } : t
      )
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

  return (
    <div className="container mt-4">
      <button
        className="std-btn btn btn-info mb-3 fw-bold"
        onClick={() => navigate("/summary")}
      >
        GO TO SUMMARY
      </button>

      {scores.map((t, i) => (
        <div key={i} className="border p-3 mb-3 rounded">
          <h3>{t.name}</h3>
          <h4>Score: {t.score}</h4>
          <button
            className="btn btn-success me-1"
            onClick={() => updateScore(i, 1)}
          >
            +1
          </button>
          <button
            className="btn btn-success me-1"
            onClick={() => updateScore(i, 2)}
          >
            +2
          </button>
          <button
            className="btn btn-success me-1"
            onClick={() => updateScore(i, 3)}
          >
            +3
          </button>
          <button className="btn btn-danger" onClick={() => updateScore(i, -1)}>
            -1
          </button>
        </div>
      ))}

      <button className="btn btn-danger w-100" onClick={endGame}>
        END GAME
      </button>
    </div>
  );
};

export default Scoreboard;
