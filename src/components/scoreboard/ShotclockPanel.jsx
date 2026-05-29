import React from "react";

const ShotclockPanel = ({
  shotclockLeft,
  shotclockRunning,
  period,
  isRunning,
  totalPeriods,
  onShotclockEdit,
  onPeriodEdit,
  onResetShotclock14,
  onToggleShotclock,
  onResetShotclock,
  onTogglePause,
  onNextQuarter,
  onBuzzer,
}) => (
  <div className="text-center">
    <h3 className="m-0 fw-bold">SHOTCLOCK</h3>
    <h3
      className="text-warning fw-bold"
      contentEditable
      suppressContentEditableWarning
      onBlur={onShotclockEdit}
      style={{ fontSize: "10rem", border: "none", outline: "none" }}
    >
      {shotclockLeft}
    </h3>

    <div className="d-flex justify-content-center gap-2 mt-2">
      <button
        className="btn btn-secondary fw-bold"
        onClick={onResetShotclock14}
      >
        14
      </button>
      <button className="btn btn-warning" onClick={onToggleShotclock}>
        {shotclockRunning ? (
          <i className="fa-solid fa-pause"></i>
        ) : (
          <i className="fa-solid fa-play"></i>
        )}
      </button>
      <button className="btn btn-secondary" onClick={onResetShotclock}>
        <i className="fa-solid fa-arrow-rotate-left"></i>
      </button>
    </div>

    <h3 className="m-0 fw-bold mt-3">PERIOD</h3>
    <h3
      className="text-warning fw-bold"
      contentEditable
      suppressContentEditableWarning
      onBlur={onPeriodEdit}
      style={{
        fontSize: "7.5rem",
        border: "none",
        outline: "none",
      }}
    >
      {period}
    </h3>

    <div className="d-flex justify-content-center gap-2 mt-2">
      <button className="btn btn-danger" onClick={onBuzzer}>
        <i className="fa-solid fa-bullhorn"></i>
      </button>
      <button className="btn btn-warning" onClick={onTogglePause}>
        {isRunning ? (
          <i className="fa-solid fa-pause"></i>
        ) : (
          <i className="fa-solid fa-play"></i>
        )}
      </button>
      <button
        className="btn btn-secondary"
        onClick={onNextQuarter}
        disabled={period >= totalPeriods}
      >
        <i className="fa-solid fa-forward-step"></i>
      </button>
    </div>
  </div>
);

export default ShotclockPanel;
