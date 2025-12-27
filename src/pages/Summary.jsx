import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FullscreenBtn from "../components/FullscreenBtn";

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
        timeoutPerQuarter: formData.timeoutPerQuarter,
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
        timeoutPerQuarter: formData.timeoutPerQuarter,
        timeoutDuration: formData.timeoutDuration,
        teamFouls: formData.teamFouls,
        playerFouls: formData.playerFouls,
        matchIndex: index,
      },
    });
  };

  return (
    <div className="container-fluid mt-4 mb-3 px-4">
      <div className="d-flex gap-2 mb-3">
        <button
          className="std-btn btn btn-info fw-bold"
          onClick={() => navigate("/setup")}
        >
          GO TO SETUP
        </button>
        <FullscreenBtn />
      </div>

      <p>
        <strong>NUMBER OF TEAMS:</strong> {formData.teamNumber}
      </p>
      <div className="row mb-2">
        <div className="col-md-4">
          <p>
            <strong>TIME PER QUARTER:</strong> {formData.timePerQuarter} MINUTES
          </p>
        </div>
        <div className="col-md-4">
          <p>
            <strong>TIMEOUT PER QUARTER:</strong> {formData.timeoutPerQuarter}
          </p>
        </div>
        <div className="col-md-4">
          <p>
            <strong>TIMEOUT DURATION:</strong> {formData.timeoutDuration}{" "}
            SECONDS
          </p>
        </div>
        <div className="col-md-4">
          <p>
            <strong>TEAM FOULS:</strong> {formData.teamFouls}
          </p>
        </div>
        <div className="col-md-4">
          <p>
            <strong>PLAYER FOULS:</strong> {formData.playerFouls}
          </p>
        </div>
      </div>

      {formData.teams.map((team, index) => (
        <div
          key={index}
          className="p-3 mb-3 rounded"
          style={{ backgroundColor: team.teamColor }}
        >
          <h5 className="fw-bold">{team.teamName}</h5>
          <p>
            <strong>PLAYERS:</strong> {team.teamPlayerNames}
          </p>
        </div>
      ))}

      <button
        className="std-success-btn btn btn-success fw-bold w-100"
        onClick={() => setShowModal(true)}
      >
        START GAME
      </button>

      {matchHistory.length > 0 && (
        <div className="mt-4">
          <h4 className="fw-bold">MATCH HISTORY</h4>
          <ul className="list-group">
            {matchHistory
              .slice()
              .reverse()
              .map((match, index) => (
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

      {showModal && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">SELECT TEAMS TO MATCH UP</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">TEAM 1</label>
                  <select
                    className="form-select"
                    value={team1}
                    onChange={(e) => setTeam1(e.target.value)}
                  >
                    <option value="">SELECT TEAM</option>
                    {formData.teams.map((team, idx) => (
                      <option key={idx} value={team.teamName}>
                        {team.teamName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">TEAM 2</label>
                  <select
                    className="form-select"
                    value={team2}
                    onChange={(e) => setTeam2(e.target.value)}
                  >
                    <option value="">SELECT TEAM</option>
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
                  className="std-success-modal-btn btn btn-success fw-bold"
                  onClick={handleStartGame}
                >
                  START GAME
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
