import { requestJson } from "./apiClient";

const PROBLEM_PROGRESS_STORAGE_KEY = "problemProgress";

function readProblemProgress() {
  const rawValue = localStorage.getItem(PROBLEM_PROGRESS_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch (error) {
    localStorage.removeItem(PROBLEM_PROGRESS_STORAGE_KEY);
    return null;
  }
}

function sanitizeProblemProgress(progressData) {
  if (!progressData) {
    return null;
  }

  return {
    historyId: progressData.historyId,
    problemId: progressData.problemId,
    sentenceId: progressData.sentenceId,
    isTodaySentence: Boolean(progressData.isTodaySentence),
    completed: Boolean(progressData.completed),
    reviewMode: Boolean(progressData.reviewMode),
    inProgress: Boolean(progressData.inProgress),
    originalText: progressData.originalText || "",
    readingText: progressData.readingText || "",
    meaning: progressData.meaning || "",
    shuffledWords: Array.isArray(progressData.shuffledWords) ? progressData.shuffledWords : [],
  };
}

export function getSavedProblemProgress(historyId) {
  const cachedProgress = readProblemProgress();

  if (!cachedProgress || cachedProgress.historyId !== historyId) {
    return null;
  }

  return sanitizeProblemProgress(cachedProgress);
}

export function saveProblemProgress(progressData) {
  localStorage.setItem(
    PROBLEM_PROGRESS_STORAGE_KEY,
    JSON.stringify(sanitizeProblemProgress(progressData))
  );
}

export function clearProblemProgress() {
  localStorage.removeItem(PROBLEM_PROGRESS_STORAGE_KEY);
}

export async function startProblem(historyId) {
  const response = await requestJson("/api/problems/start", {
    method: "POST",
    requiresAuth: true,
    body: JSON.stringify({ historyId }),
  });

  const sanitized = sanitizeProblemProgress(response);
  saveProblemProgress(sanitized);
  return sanitized;
}

export async function submitOrderAnswer(problemId, answer) {
  return requestJson(`/api/problems/order-answer/${problemId}`, {
    method: "POST",
    requiresAuth: true,
    body: JSON.stringify({ answer }),
  });
}

export async function submitCopyTypingAnswer(problemId, answer) {
  return requestJson(`/api/problems/copy-typing/${problemId}`, {
    method: "POST",
    requiresAuth: true,
    body: JSON.stringify({ answer }),
  });
}

export async function submitBlindTypingAnswer(problemId, answer) {
  return requestJson(`/api/problems/blind-typing/${problemId}`, {
    method: "POST",
    requiresAuth: true,
    body: JSON.stringify({ answer }),
  });
}