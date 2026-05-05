import { requestJson } from "./apiClient";

export async function getMyProblemHistory() {
  const response = await requestJson("/api/me/problem-history", {
    method: "GET",
    requiresAuth: true,
  });

  if (!Array.isArray(response)) {
    return [];
  }

  return [...response].sort((left, right) => {
    const leftTime = new Date(left?.solvedAt || 0).getTime();
    const rightTime = new Date(right?.solvedAt || 0).getTime();
    return rightTime - leftTime;
  });
}