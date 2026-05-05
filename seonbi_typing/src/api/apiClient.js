const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const ACCESS_TOKEN_STORAGE_KEY = "accessToken";

function buildHeaders(headers = {}, requiresAuth = false) {
  const nextHeaders = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (requiresAuth) {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);

    if (!accessToken) {
      throw new Error("로그인이 필요합니다.");
    }

    nextHeaders.Authorization = `Bearer ${accessToken}`;
  }

  return nextHeaders;
}

export async function requestJson(path, options = {}) {
  if (!API_BASE_URL) {
    throw new Error("REACT_APP_API_BASE_URL 환경 변수가 설정되지 않았습니다.");
  }

  const { requiresAuth = false, headers, ...restOptions } = options;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...restOptions,
    headers: buildHeaders(headers, requiresAuth),
  });

  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch (error) {
      data = text;
    }
  }

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null
        ? data.message || data.error || "요청 처리 중 오류가 발생했습니다."
        : data || "요청 처리 중 오류가 발생했습니다.";

    throw new Error(message);
  }

  return data;
}