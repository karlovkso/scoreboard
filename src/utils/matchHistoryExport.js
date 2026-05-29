import * as XLSX from "xlsx";

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

const buildExportRows = (history) =>
  history.map((match, index) => ({
    "Match #": index + 1,
    "Team 1": match.team1 ?? "",
    "Score 1": match.score1 ?? 0,
    "Team 2": match.team2 ?? "",
    "Score 2": match.score2 ?? 0,
    Winner: match.winner ?? "In Progress",
    Status: match.winner ? "Completed" : "In Progress",
    Date: match.date ?? "",
  }));

export const exportMatchHistoryToExcel = (
  history,
  fileName = "match-history.xlsx",
) => {
  if (!Array.isArray(history) || history.length === 0) {
    throw new Error("No match history available to export.");
  }

  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.json_to_sheet(buildExportRows(history));

  XLSX.utils.book_append_sheet(workbook, sheet, "Match History");
  XLSX.writeFile(workbook, fileName);
};
