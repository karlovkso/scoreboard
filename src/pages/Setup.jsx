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
    <div className="container-fluid mt-4 mb-3 px-4">
      <button
        className="std-btn btn btn-info mb-3 fw-bold"
        onClick={() => navigate("/")}
      >
        GO TO HOME
      </button>

      <div className="row">
        <div className="col-md-4 mb-3">
          <label className="form-label">TIME PER QUARTER (MINUTES)</label>
          <input
            type="number"
            className="form-control"
            placeholder="TIME PER QUARTER"
            name="timePerQuarter"
            value={formData.timePerQuarter}
            onChange={handleOtherChange}
          />
        </div>

        <div className="col-md-4 mb-3">
          <label className="form-label">TIMEOUT PER QUARTER</label>
          <input
            type="number"
            className="form-control"
            placeholder="TIMEOUT PER QUARTER"
            name="timeoutPerQuarter"
            value={formData.timeoutPerQuarter}
            onChange={handleOtherChange}
          />
        </div>

        <div className="col-md-4 mb-3">
          <label className="form-label">TIMEOUT DURATION (SECONDS)</label>
          <input
            type="number"
            className="form-control"
            placeholder="TIMEOUT DURATION"
            name="timeoutDuration"
            value={formData.timeoutDuration}
            onChange={handleOtherChange}
          />
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">TEAM FOULS</label>
          <input
            type="number"
            className="form-control"
            placeholder="TEAM FOULS"
            name="teamFouls"
            value={formData.teamFouls}
            onChange={handleOtherChange}
          />
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">PLAYER FOULS</label>
          <input
            type="number"
            className="form-control"
            placeholder="PLAYER FOULS"
            name="playerFouls"
            value={formData.playerFouls}
            onChange={handleOtherChange}
          />
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">NUMBER OF TEAMS</label>
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
          <h5>TEAM {index + 1}</h5>

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
