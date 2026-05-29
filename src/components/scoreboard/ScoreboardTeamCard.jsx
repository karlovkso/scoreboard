import React from "react";

const ScoreboardTeamCard = ({
  team,
  index,
  setup,
  hoveredTeamIndex,
  setHoveredTeamIndex,
  timeoutLeft,
  activeTimeoutTeam,
  updateScore,
  handleTimeout,
  onOpenFoulModal,
}) => {
  const playerFoulsLimit = parseInt(setup.playerFouls) || 0;

  return (
    <div
      style={{
        minWidth: "200px",
        flex: "1 1 200px",
        borderColor: team.color,
        borderWidth: "3px",
        borderStyle: "solid",
        borderRadius: "10px",
      }}
    >
      <div style={{ position: "relative" }}>
        <h3
          className="text-center m-0 fw-bold"
          style={{ backgroundColor: team.color, color: "white" }}
          onMouseEnter={() => setHoveredTeamIndex(index)}
          onMouseLeave={() => setHoveredTeamIndex(null)}
        >
          {team.name}
        </h3>
        {(hoveredTeamIndex === index ||
          team.players.some((player) => {
            return (
              player.fouls === playerFoulsLimit - 1 ||
              player.fouls === playerFoulsLimit
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
              {hoveredTeamIndex === index
                ? team.players.map((player, playerIndex) => {
                    const isWarning = player.fouls === playerFoulsLimit - 1;
                    const isDanger = player.fouls === playerFoulsLimit;
                    return (
                      <li
                        key={playerIndex}
                        className={
                          isWarning
                            ? "text-warning"
                            : isDanger
                              ? "text-danger"
                              : ""
                        }
                        style={{ marginBottom: "5px" }}
                      >
                        {player.name}: <span>{player.fouls}</span> fouls
                      </li>
                    );
                  })
                : team.players
                    .filter((player) => {
                      return (
                        player.fouls === playerFoulsLimit - 1 ||
                        player.fouls === playerFoulsLimit
                      );
                    })
                    .map((player, playerIndex) => {
                      const isWarning = player.fouls === playerFoulsLimit - 1;
                      const isDanger = player.fouls === playerFoulsLimit;
                      return (
                        <li
                          key={playerIndex}
                          className={
                            isWarning
                              ? "text-warning"
                              : isDanger
                                ? "text-danger"
                                : ""
                          }
                          style={{ marginBottom: "5px" }}
                        >
                          {player.name}: <span>{player.fouls}</span> fouls
                        </li>
                      );
                    })}
            </ul>
          </div>
        )}
      </div>

      <div className="text-center p-2">
        <h4 className="fw-bold text-danger" style={{ fontSize: "15rem" }}>
          {team.score}
        </h4>

        <div className="d-flex justify-content-between">
          <div className="d-flex gap-2 align-items-center">
            <h4 className="fw-bold" style={{ fontSize: "3rem" }}>
              TIMEOUTS:
            </h4>
            <h4 className="fw-bold text-warning" style={{ fontSize: "6rem" }}>
              {team.timeouts}
            </h4>
          </div>

          <div className="d-flex gap-2 align-items-center">
            <h4 className="fw-bold" style={{ fontSize: "3rem" }}>
              FOULS:
            </h4>
            <h4 className="fw-bold text-warning" style={{ fontSize: "6rem" }}>
              {team.fouls}
            </h4>
          </div>
        </div>

        <div className="d-flex justify-content-between">
          <div className="d-flex gap-2 align-items-center">
            <button
              className="btn btn-outline-success fw-bold"
              onClick={() => handleTimeout(index)}
              disabled={team.timeouts === 0 || timeoutLeft > 0}
            >
              TIMEOUT
            </button>
            <h4
              className="fw-bold text-warning mb-0"
              style={{ fontSize: "1.5rem" }}
              hidden={activeTimeoutTeam !== index}
            >
              {timeoutLeft}
            </h4>
          </div>

          <div className="d-flex gap-2">
            <button
              className="btn btn-success"
              onClick={() => updateScore(index, 1)}
            >
              +1
            </button>
            <button
              className="btn btn-success"
              onClick={() => updateScore(index, 2)}
            >
              +2
            </button>
            <button
              className="btn btn-success"
              onClick={() => updateScore(index, 3)}
            >
              +3
            </button>
            <button
              className="btn btn-danger"
              onClick={() => updateScore(index, -1)}
            >
              -1
            </button>
          </div>

          <button
            className="btn btn-outline-danger fw-bold"
            onClick={() => onOpenFoulModal(index)}
          >
            FOUL
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScoreboardTeamCard;
