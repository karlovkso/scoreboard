import * as XLSX from "xlsx";

const DEFAULT_EXPORT_FILE_NAME = "match-history.xlsx";
const MATCH_HISTORY_SHEET_NAME = "Match History";

const normalizeCellValue = (value) => {
  if (value === null || value === undefined) return "";

  if (Array.isArray(value)) {
    return value
      .map((item) =>
        typeof item === "object" && item !== null
          ? JSON.stringify(item)
          : String(item),
      )
      .join("; ");
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
};

const formatPlayersForExport = (players, team1, team2) => {
  if (!Array.isArray(players)) {
    return "";
  }

  return players
    .map((teamPlayers, index) => {
      const teamName =
        index === 0 ? team1 : index === 1 ? team2 : `Team ${index + 1}`;
      const names = Array.isArray(teamPlayers)
        ? teamPlayers
            .map((player) => {
              if (typeof player === "string") return player;
              if (
                typeof player === "object" &&
                player !== null &&
                player.name
              ) {
                return player.name;
              }
              return "";
            })
            .filter(Boolean)
        : [];

      return names.length > 0 ? `${teamName}: ${names.join(", ")}` : "";
    })
    .filter(Boolean)
    .join(" | ");
};

const validateHistory = (history) => {
  if (!Array.isArray(history)) {
    throw new Error("Match history must be provided as an array.");
  }

  if (history.length === 0) {
    throw new Error("No match history available to export.");
  }

  history.forEach((match, index) => {
    if (match === null || typeof match !== "object") {
      throw new Error(`Invalid match entry at index ${index}.`);
    }
  });

  return history;
};

const buildExportRows = (history) =>
  history.map((match, index) => ({
    "Match #": index + 1,
    "Team 1": normalizeCellValue(match.team1),
    "Score 1": Number.isFinite(Number(match.score1)) ? Number(match.score1) : 0,
    "Team 2": normalizeCellValue(match.team2),
    "Score 2": Number.isFinite(Number(match.score2)) ? Number(match.score2) : 0,
    Winner: normalizeCellValue(match.winner) || "In Progress",
    Status: match.winner ? "Completed" : "In Progress",
    Date: normalizeCellValue(match.date),
  }));

export const exportMatchHistoryToExcel = (
  history,
  fileName = DEFAULT_EXPORT_FILE_NAME,
) => {
  const validatedHistory = validateHistory(history);
  const normalizedFileName =
    typeof fileName === "string" && fileName.trim().length > 0
      ? fileName.trim()
      : DEFAULT_EXPORT_FILE_NAME;

  try {
    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.json_to_sheet(buildExportRows(validatedHistory));

    XLSX.utils.book_append_sheet(workbook, sheet, MATCH_HISTORY_SHEET_NAME);
    XLSX.writeFile(workbook, normalizedFileName);
    return normalizedFileName;
  } catch (error) {
    throw new Error(`Unable to export match history: ${error.message}`);
  }
};
