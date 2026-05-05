import { requestJson } from "./apiClient";

function buildAuthUser(authData) {
  if (!authData) {
    return null;
  }

  return {
    name: authData.name,
    loginId: authData.loginId,
    totalSolvedCount: authData.totalSolvedCount,
    currentStreak: authData.currentStreak,
    currentRank: authData.currentRank,
    nextRank: authData.nextRank,
    remainingToNextRank: authData.remainingToNextRank,
    todaySentence: authData.todaySentence,
  };
}

export function loginUser({ loginId, password }) {
  return requestJson("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      loginId,
      password,
    }),
  });
}

export function signupUser({ name, loginId, password }) {
  return requestJson("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({
      name,
      loginId,
      password,
    }),
  });
}

export function getCurrentUser() {
  return requestJson("/api/auth/me", {
    method: "GET",
    requiresAuth: true,
  });
}

export function saveAuthData(authData) {
  const nextAuthUser = buildAuthUser(authData);

  if (!nextAuthUser) {
    return null;
  }

  if (authData?.accessToken) {
    localStorage.setItem("accessToken", authData.accessToken);
  }

  localStorage.setItem("authUser", JSON.stringify(nextAuthUser));
  return nextAuthUser;
}

export function getSavedAuthUser() {
  const rawUser = localStorage.getItem("authUser");

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch (error) {
    localStorage.removeItem("authUser");
    return null;
  }
}

export function getAccessToken() {
  return localStorage.getItem("accessToken");
}

export function clearAuthData() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("authUser");
}