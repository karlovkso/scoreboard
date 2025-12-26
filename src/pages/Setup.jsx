import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Setup = () => {
  const [formData, setFormData] = useState({
    teamNumber: "",
    teams: [],
    timePerQuarter: "",
    timeoutDuration: "",
    teamFouls: "",
    playerFouls: "",
  });

  const navigate = useNavigate();

  const handleTeamNumberChange = (e) => {
    const number = parseInt(e.target.value) || 0;
    setFormData((prev) => {
      const newTeams = [...prev.teams];
      while (newTeams.length < number) {
        newTeams.push({
          teamName: "",
          teamColor: "#000000",
          teamPlayerNames: "",
        });
      }
      while (newTeams.length > number) {
        newTeams.pop();
      }
      return { ...prev, teamNumber: e.target.value, teams: newTeams };
    });
  };

  const handleTeamChange = (index, e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newTeams = [...prev.teams];
      newTeams[index] = { ...newTeams[index], [name]: value };
      return { ...prev, teams: newTeams };
    });
  };

  const handleOtherChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleButtonClick = () => {
    navigate("/summary", { state: formData });
  };

  return (
    <div className="container mt-4">
      <div className="mb-3">
        <label className="form-label">Number of Teams:</label>
        <input
          type="number"
          className="form-control"
          value={formData.teamNumber}
          onChange={handleTeamNumberChange}
          placeholder="Enter number of teams"
          min={1}
        />
      </div>

      {formData.teams.map((team, index) => (
        <div key={index} className="border p-3 mb-3 rounded">
          <h5>Team {index + 1}</h5>
          <div className="mb-2">
            <label className="form-label">Team Name:</label>
            <input
              type="text"
              className="form-control"
              name="teamName"
              value={team.teamName}
              onChange={(e) => handleTeamChange(index, e)}
              placeholder="Enter team name"
            />
          </div>
          <div className="mb-2">
            <label className="form-label">Team Color:</label>
            <input
              type="color"
              className="form-control form-control-color"
              name="teamColor"
              value={team.teamColor || "#000000"}
              onChange={(e) => handleTeamChange(index, e)}
            />
          </div>
          <div className="mb-2">
            <label className="form-label">
              Player Names (comma separated):
            </label>
            <input
              type="text"
              className="form-control"
              name="teamPlayerNames"
              value={team.teamPlayerNames}
              onChange={(e) => handleTeamChange(index, e)}
              placeholder="Enter player names"
            />
          </div>
        </div>
      ))}

      <div className="mb-3">
        <label className="form-label">Time per Quarter (minutes):</label>
        <input
          type="number"
          className="form-control"
          name="timePerQuarter"
          value={formData.timePerQuarter}
          onChange={handleOtherChange}
          placeholder="Minutes"
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Timeout Duration (seconds):</label>
        <input
          type="number"
          className="form-control"
          name="timeoutDuration"
          value={formData.timeoutDuration}
          onChange={handleOtherChange}
          placeholder="Seconds"
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Team Fouls:</label>
        <input
          type="number"
          className="form-control"
          name="teamFouls"
          value={formData.teamFouls}
          onChange={handleOtherChange}
          placeholder="Enter number of team fouls"
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Player Fouls:</label>
        <input
          type="number"
          className="form-control"
          name="playerFouls"
          value={formData.playerFouls}
          onChange={handleOtherChange}
          placeholder="Enter number of player fouls"
        />
      </div>

      <button className="std-btn btn btn-info" onClick={handleButtonClick}>
        CONTINUE
      </button>
    </div>
  );
};

export default Setup;
