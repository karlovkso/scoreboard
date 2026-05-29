const storageAvailable = () => {
  try {
    const testKey = "__scoreboard_storage_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    console.warn("Local storage is unavailable:", error);
    return false;
  }
};

const tryParseJson = (rawValue) => {
  try {
    return JSON.parse(rawValue);
  } catch {
    return rawValue;
  }
};

export const readStoredValue = (key, fallbackValue = null) => {
  if (!storageAvailable()) {
    return fallbackValue;
  }

  const rawValue = window.localStorage.getItem(key);
  if (rawValue === null) {
    return fallbackValue;
  }

  return tryParseJson(rawValue);
};

export const readStoredArray = (key, fallbackValue = []) => {
  const value = readStoredValue(key, fallbackValue);
  return Array.isArray(value) ? value : fallbackValue;
};

export const readStoredObject = (key, fallbackValue = null) => {
  const value = readStoredValue(key, fallbackValue);
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value
    : fallbackValue;
};

export const readStoredString = (key, fallbackValue = "") => {
  const value = readStoredValue(key, fallbackValue);
  return typeof value === "string" ? value : fallbackValue;
};

export const writeStoredValue = (key, value) => {
  if (!storageAvailable()) {
    return false;
  }

  try {
    const serializedValue =
      typeof value === "string" ? value : JSON.stringify(value);

    window.localStorage.setItem(key, serializedValue);
    return true;
  } catch (error) {
    console.error(`Failed to persist storage value for ${key}:`, error);
    return false;
  }
};
