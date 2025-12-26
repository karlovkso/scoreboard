import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Summary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state;

  const [showModal, setShowModal] = useState(false);
  const [team1, setTeam1] = useState("");
  const [team2, setTeam2] = useState("");

  if (!formData) return <p>No data available</p>;

  const handleStartGame = () => {
    if (team1 && team2 && team1 !== team2) {
      const selectedTeams = formData.teams.filter(
        (team) => team.teamName === team1 || team.teamName === team2
      );

      navigate("scoreboard/scoreboard", {
        state: {
          teams: selectedTeams,
          timePerQuarter: formData.timePerQuarter,
          timeoutDuration: formData.timeoutDuration,
          teamFouls: formData.teamFouls,
          playerFouls: formData.playerFouls,
        },
      });
    } else {
      alert("Please select two different teams.");
    }
  };

  return (
    <div className="container mt-4">
      <p>
        <strong>Number of Teams:</strong> {formData.teamNumber}
      </p>
      <p>
        <strong>Time per Quarter:</strong> {formData.timePerQuarter} minutes
      </p>
      <p>
        <strong>Timeout Duration:</strong> {formData.timeoutDuration} seconds
      </p>
      <p>
        <strong>Team Fouls:</strong> {formData.teamFouls}
      </p>
      <p>
        <strong>Player Fouls:</strong> {formData.playerFouls}
      </p>

      {formData.teams.map((team, index) => (
        <div key={index} className="border p-3 mb-3 rounded">
          <h5>Team {index + 1}</h5>
          <p>
            <strong>Name:</strong> {team.teamName}
          </p>
          <p>
            <strong>Color:</strong>{" "}
            <span
              style={{
                display: "inline-block",
                width: "20px",
                height: "20px",
                backgroundColor: team.teamColor,
                border: "1px solid #000",
                verticalAlign: "middle",
              }}
            ></span>
          </p>
          <p>
            <strong>Players:</strong> {team.teamPlayerNames}
          </p>
        </div>
      ))}

      <button className="btn btn-success" onClick={() => setShowModal(true)}>
        START GAME
      </button>

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
                  <label className="form-label">Team 1:</label>
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
                  <label className="form-label">Team 2:</label>
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
