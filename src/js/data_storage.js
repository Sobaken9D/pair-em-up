export const DataStorage = {
  setClassicModeData(data) {
    localStorage.setItem("classicModeData", JSON.stringify(data));
  },

  getClassicModeData() {
    const data = localStorage.getItem("classicModeData");
    return data ? JSON.parse(data) : {};
  },

  clearClassicModeData() {
    localStorage.removeItem("classicModeData");
  },

  setRandomModeData(data) {
    localStorage.setItem("randomModeData", JSON.stringify(data));
  },

  getRandomModeData() {
    const data = localStorage.getItem("randomModeData");
    return data ? JSON.parse(data) : {};
  },

  clearRandomModeData() {
    localStorage.removeItem("randomModeData");
  },

  setChaoticModeData(data) {
    localStorage.setItem("chaoticModeData", JSON.stringify(data));
  },

  getChaoticModeData() {
    const data = localStorage.getItem("chaoticModeData");
    return data ? JSON.parse(data) : {};
  },

  clearChaoticModeData() {
    localStorage.removeItem("chaoticModeData");
  },

  addScoreHistoryData(data) {
    const existingData = this.getScoreHistoryData() || [];
    const updatedData = [...existingData, data];
    localStorage.setItem("scoreHistoryData", JSON.stringify(updatedData));
  },

  getScoreHistoryData() {
    const data = localStorage.getItem("scoreHistoryData");
    return data ? JSON.parse(data) : [];
  },

  clearScoreHistoryData() {
    localStorage.removeItem("scoreHistoryData");
  },
}