import React from "react";

const FoulModal = ({ isOpen, teamPlayers, onClose, onSelectPlayer }) => {
  if (!isOpen) return null;

  return (
    <div className="modal" style={{ display: "block" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">WHO'S FOUL?</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            {teamPlayers.map((player, index) => (
              <button
                key={index}
                className="std-info-modal-btn btn btn-info m-1 fw-bold"
                onClick={() => onSelectPlayer(index)}
              >
                {player.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoulModal;
