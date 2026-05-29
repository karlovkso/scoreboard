const DEFAULT_SHOTCLOCK_DURATION = 24;
const DEFAULT_TIMEOUT_DURATION = 0;

export const normalizeNumericValue = (value, fallbackValue) => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : fallbackValue;
};

export const getConfiguredShotclockDuration = (
  setup,
  fallbackValue = DEFAULT_SHOTCLOCK_DURATION,
) => normalizeNumericValue(setup?.shotclockDuration, fallbackValue);

export const getConfiguredTimeoutDuration = (
  setup,
  fallbackValue = DEFAULT_TIMEOUT_DURATION,
) => normalizeNumericValue(setup?.timeoutDuration, fallbackValue);

export const findTeamDetails = (setup, teamName) =>
  setup?.teams?.find((team) => team.teamName === teamName);

const sanitizePlayerEntry = (player, index) => {
  if (typeof player === "string") {
    const playerName = player.trim();
    return playerName.length > 0
      ? {
          name: playerName,
          fouls: 0,
          originalIndex: index,
        }
      : null;
  }

  if (player && typeof player === "object") {
    const playerName =
      typeof player.name === "string" ? player.name.trim() : "";

    if (playerName.length === 0) {
      return null;
    }

    return {
      name: playerName,
      fouls: normalizeNumericValue(player.fouls, 0),
      originalIndex: index,
    };
  }

  return null;
};

export const sanitizePlayerRoster = (players = []) => {
  if (!Array.isArray(players)) {
    return [];
  }

  return players
    .map((player, index) => sanitizePlayerEntry(player, index))
    .filter(Boolean);
};

export const buildPlayerRoster = (setup, teamName) => {
  const teamDetails = findTeamDetails(setup, teamName);
  const rawPlayers = teamDetails?.teamPlayerNames || "";

  return sanitizePlayerRoster(
    rawPlayers
      .split(",")
      .map((playerName) => playerName.trim())
      .filter(Boolean),
  );
};

export const buildInitialScores = (setup, match) => {
  const team1Details = findTeamDetails(setup, match.team1);
  const team2Details = findTeamDetails(setup, match.team2);

  const team1Players =
    Array.isArray(match.players) && match.players[0]
      ? sanitizePlayerRoster(match.players[0])
      : buildPlayerRoster(setup, match.team1);
  const team2Players =
    Array.isArray(match.players) && match.players[1]
      ? sanitizePlayerRoster(match.players[1])
      : buildPlayerRoster(setup, match.team2);

  return [
    {
      name: match.team1,
      score: normalizeNumericValue(match.score1, 0),
      color: team1Details?.teamColor || "#000000",
      fouls: normalizeNumericValue(match.teamFouls?.[0], 0),
      timeouts: normalizeNumericValue(
        match.teamTimeouts?.[0],
        normalizeNumericValue(setup.timeoutPerQuarter, 0),
      ),
      players: team1Players,
    },
    {
      name: match.team2,
      score: normalizeNumericValue(match.score2, 0),
      color: team2Details?.teamColor || "#000000",
      fouls: normalizeNumericValue(match.teamFouls?.[1], 0),
      timeouts: normalizeNumericValue(
        match.teamTimeouts?.[1],
        normalizeNumericValue(setup.timeoutPerQuarter, 0),
      ),
      players: team2Players,
    },
  ];
};

export const buildMatchSnapshot = ({
  match,
  scores,
  timeLeft,
  shotclockLeft,
  shotclockRunning,
  period,
  activeTimeoutTeam,
  timeoutLeft,
  isRunning,
  winner,
}) => ({
  ...match,
  score1: normalizeNumericValue(scores[0]?.score, 0),
  score2: normalizeNumericValue(scores[1]?.score, 0),
  winner,
  timeLeft: normalizeNumericValue(timeLeft, 0),
  shotclockLeft: normalizeNumericValue(
    shotclockLeft,
    DEFAULT_SHOTCLOCK_DURATION,
  ),
  shotclockRunning,
  period: normalizeNumericValue(period, 1),
  teamTimeouts: scores.map((score) => normalizeNumericValue(score.timeouts, 0)),
  teamFouls: scores.map((score) => normalizeNumericValue(score.fouls, 0)),
  players: scores.map((score) => sanitizePlayerRoster(score.players)),
  activeTimeoutTeam,
  timeoutLeft: normalizeNumericValue(timeoutLeft, 0),
  isRunning,
  lastUpdated: new Date().toISOString(),
});
