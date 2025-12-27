import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY = "match_history";

const Summary = () => {
  const navigate = useNavigate();
  const storedData = localStorage.getItem("setup_data");
  const formData = storedData ? JSON.parse(storedData) : null;

  const [showModal, setShowModal] = useState(false);
  const [team1, setTeam1] = useState("");
  const [team2, setTeam2] = useState("");
  const [matchHistory, setMatchHistory] = useState([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem(STORAGE_KEY);
    if (savedHistory) {
      setMatchHistory(JSON.parse(savedHistory));
    }
  }, []);

  const saveMatchHistory = (history) => {
    setMatchHistory(history);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  };

  const handleStartGame = () => {
    if (!team1 || !team2 || team1 === team2) {
      alert("Please select two different teams.");
      return;
    }

    const selectedTeams = formData.teams.filter(
      (team) => team.teamName === team1 || team.teamName === team2
    );

    const newMatch = {
      team1,
      team2,
      score1: 0,
      score2: 0,
      winner: null,
      date: new Date().toLocaleString(),
    };

    const updatedHistory = [...matchHistory, newMatch];
    saveMatchHistory(updatedHistory);

    navigate("/scoreboard", {
      state: {
        teams: selectedTeams,
        timePerQuarter: formData.timePerQuarter,
        timeoutDuration: formData.timeoutDuration,
        teamFouls: formData.teamFouls,
        playerFouls: formData.playerFouls,
        matchIndex: updatedHistory.length - 1,
      },
    });
  };

  const handleHistoryClick = (index) => {
    const match = matchHistory[index];
    const selectedTeams = formData.teams.filter(
      (team) => team.teamName === match.team1 || team.teamName === match.team2
    );

    navigate("/scoreboard", {
      state: {
        teams: selectedTeams,
        timePerQuarter: formData.timePerQuarter,
        timeoutDuration: formData.timeoutDuration,
        teamFouls: formData.teamFouls,
        playerFouls: formData.playerFouls,
        matchIndex: index,
      },
    });
  };

  return (
    <div className="container mt-3 mb-3 position-relative">
      <button
        className="std-btn btn btn-info mb-3 fw-bold"
        onClick={() => navigate("/setup")}
      >
        GO TO SETUP
      </button>

      {/* Game Summary */}
      <div className="row mb-2">
        <div className="col-md-4">
          <p>
            <strong>Number of Teams:</strong> {formData.teamNumber}
          </p>
        </div>
        <div className="col-md-4">
          <p>
            <strong>Time per Quarter:</strong> {formData.timePerQuarter} minutes
          </p>
        </div>
        <div className="col-md-4">
          <p>
            <strong>Timeout Duration:</strong> {formData.timeoutDuration}{" "}
            seconds
          </p>
        </div>
        <div className="col-md-4">
          <p>
            <strong>Team Fouls:</strong> {formData.teamFouls}
          </p>
        </div>
        <div className="col-md-4">
          <p>
            <strong>Player Fouls:</strong> {formData.playerFouls}
          </p>
        </div>
      </div>

      {/* Teams */}
      {formData.teams.map((team, index) => (
        <div
          key={index}
          className="p-3 mb-3 rounded"
          style={{ backgroundColor: team.teamColor }}
        >
          <h5 className="fw-bold">{team.teamName}</h5>
          <p>
            <strong>Players:</strong> {team.teamPlayerNames}
          </p>
        </div>
      ))}

      {/* Start Game Button */}
      <button
        className="std-success-btn btn btn-success fw-bold w-100"
        onClick={() => setShowModal(true)}
      >
        START GAME
      </button>

      {/* Match History */}
      {matchHistory.length > 0 && (
        <div className="mt-4">
          <h4 className="fw-bold">Match History</h4>
          <ul className="list-group">
            {matchHistory.map((match, index) => (
              <li
                key={index}
                className="list-group-item list-group-item-action"
                style={{ cursor: "pointer" }}
                onClick={() => handleHistoryClick(index)}
              >
                <strong>{match.team1}</strong> ({match.score1}) vs{" "}
                <strong>{match.team2}</strong> ({match.score2})
                <br />
                <span className="text-success">
                  {match.winner ? `Winner: ${match.winner}` : "In Progress"}
                </span>
                <br />
                <small className="text-muted">{match.date}</small>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Select Teams to Match Up</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Team 1</label>
                  <select
                    className="form-select"
                    value={team1}
                    onChange={(e) => setTeam1(e.target.value)}
                  >
                    <option value="">Select Team</option>
                    {formData.teams.map((team, idx) => (
                      <option key={idx} value={team.teamName}>
                        {team.teamName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Team 2</label>
                  <select
                    className="form-select"
                    value={team2}
                    onChange={(e) => setTeam2(e.target.value)}
                  >
                    <option value="">Select Team</option>
                    {formData.teams.map((team, idx) => (
                      <option key={idx} value={team.teamName}>
                        {team.teamName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
                <button className="btn btn-primary" onClick={handleStartGame}>
                  Start Game
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Summary;
