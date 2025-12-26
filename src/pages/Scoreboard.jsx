import React from "react";
import { useLocation } from "react-router-dom";

const Scoreboard = () => {
  const location = useLocation();
  const gameData = location.state;

  if (!gameData) {
    return <p>No game data available. Go back to setup.</p>;
  }

  const { teams, timePerQuarter, timeoutDuration, teamFouls, playerFouls } =
    gameData;

  return (
    <div className="container mt-4">
      <p>
        <strong>Time per Quarter:</strong> {timePerQuarter} minutes
      </p>
      <p>
        <strong>Timeout Duration:</strong> {timeoutDuration} seconds
      </p>
      <p>
        <strong>Team Fouls:</strong> {teamFouls}
      </p>
      <p>
        <strong>Player Fouls:</strong> {playerFouls}
      </p>

      {teams.map((team, index) => (
        <div key={index} className="border p-3 mb-3 rounded">
          <h3>{team.teamName}</h3>
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
          <p>
            <strong>Score:</strong> 0
          </p>
        </div>
      ))}
    </div>
  );
};

export default Scoreboard;
