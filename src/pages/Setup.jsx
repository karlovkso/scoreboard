import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY = "setup_data";

const Setup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    teamNumber: "",
    teams: [],
    timePerQuarter: "",
    timeoutPerQuarter: "",
    timeoutDuration: "",
    teamFouls: "",
    playerFouls: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setFormData(JSON.parse(saved));
    }
  }, []);

  const persist = (data) => {
    setFormData(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const handleTeamNumberChange = (e) => {
    const number = parseInt(e.target.value) || 0;

    persist(
      ((prev) => {
        const teams = [...prev.teams];
        while (teams.length < number) {
          teams.push({
            teamName: "",
            teamColor: "#000000",
            teamPlayerNames: "",
          });
        }
        while (teams.length > number) {
          teams.pop();
        }
        return { ...prev, teamNumber: e.target.value, teams };
      })(formData)
    );
  };

  const handleTeamChange = (index, e) => {
    const { name, value } = e.target;
    const teams = [...formData.teams];
    teams[index] = { ...teams[index], [name]: value };
    persist({ ...formData, teams });
  };

  const handleOtherChange = (e) => {
    persist({ ...formData, [e.target.name]: e.target.value });
  };

  const handleContinue = () => {
    navigate("/summary");
  };

  return (
    <div className="container mt-3 mb-3">
      <button
        className="std-btn btn btn-info mb-3 fw-bold"
        onClick={() => navigate("/")}
      >
        GO TO HOME
      </button>

      <div className="row">
        <div className="col-md-4 mb-3">
          <label className="form-label">Time per Quarter (minutes)</label>
          <input
            type="number"
            className="form-control"
            placeholder="Time per Quarter"
            name="timePerQuarter"
            value={formData.timePerQuarter}
            onChange={handleOtherChange}
          />
        </div>

        <div className="col-md-4 mb-3">
          <label className="form-label">Timeout per Quarter</label>
          <input
            type="number"
            className="form-control"
            placeholder="Timeout per Quarter"
            name="timeoutPerQuarter"
            value={formData.timeoutPerQuarter}
            onChange={handleOtherChange}
          />
        </div>

        <div className="col-md-4 mb-3">
          <label className="form-label">Timeout Duration (seconds)</label>
          <input
            type="number"
            className="form-control"
            placeholder="Timeout Duration"
            name="timeoutDuration"
            value={formData.timeoutDuration}
            onChange={handleOtherChange}
          />
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">Team Fouls</label>
          <input
            type="number"
            className="form-control"
            placeholder="Team Fouls"
            name="teamFouls"
            value={formData.teamFouls}
            onChange={handleOtherChange}
          />
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">Player Fouls</label>
          <input
            type="number"
            className="form-control"
            placeholder="Player Fouls"
            name="playerFouls"
            value={formData.playerFouls}
            onChange={handleOtherChange}
          />
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">Number of Teams</label>
        <input
          type="number"
          className="form-control"
          value={formData.teamNumber}
          min={1}
          onChange={handleTeamNumberChange}
        />
      </div>

      {formData.teams.map((team, index) => (
        <div key={index} className="border p-3 mb-3 rounded">
          <h5>Team {index + 1}</h5>

          <input
            className="form-control mb-2"
            placeholder="Team Name"
            name="teamName"
            value={team.teamName}
            onChange={(e) => handleTeamChange(index, e)}
          />

          <input
            type="color"
            className="form-control form-control-color mb-2"
            name="teamColor"
            value={team.teamColor}
            onChange={(e) => handleTeamChange(index, e)}
          />

          <input
            className="form-control mb-2"
            placeholder="Player Names"
            name="teamPlayerNames"
            value={team.teamPlayerNames}
            onChange={(e) => handleTeamChange(index, e)}
          />
        </div>
      ))}

      <button
        className="std-btn btn btn-info fw-bold w-100"
        onClick={handleContinue}
      >
        CONTINUE
      </button>
    </div>
  );
};

export default Setup;
