import { useState } from "react";
import { loginUser, saveAuthData, signupUser } from "../api/authApi";
import HeroTopBar from "./HeroTopBar";
import { HERO_PATH } from "./heroUi";
import "./HeroSection.css";

const EMPTY_LOGIN_FORM = {
  loginId: "",
  password: "",
};

const EMPTY_SIGNUP_FORM = {
  name: "",
  loginId: "",
  password: "",
  passwordConfirm: "",
};

function getAuthErrorMessage(error, fallbackMessage) {
  if (error?.message === "Failed to fetch") {
    return "서버에 연결할 수 없습니다. 백엔드 서버 상태 또는 CORS 설정을 확인해주세요.";
  }

  return error?.message || fallbackMessage;
}

function HeroSection({ authUser = null, className = "", onAuthChange, onLogout, onOpenHistory }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [loginForm, setLoginForm] = useState(() => ({ ...EMPTY_LOGIN_FORM }));
  const [signupForm, setSignupForm] = useState(() => ({ ...EMPTY_SIGNUP_FORM }));
  const [authMessage, setAuthMessage] = useState("");
  const rootClassName = [
    "hero-section",
    className,
    isLoginOpen ? "is-login-open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  function resetAuthForms() {
    setLoginForm({ ...EMPTY_LOGIN_FORM });
    setSignupForm({ ...EMPTY_SIGNUP_FORM });
  }

  function toggleLogin() {
    setIsLoginOpen((prev) => !prev);
    setAuthMessage("");
  }

  function closeLogin() {
    setIsLoginOpen(false);
    setAuthMessage("");
  }

  function handleAuthModeChange(mode) {
    setAuthMode(mode);
    setAuthMessage("");
  }

  function handleOverlayClick(event) {
    if (event.target === event.currentTarget) {
      closeLogin();
    }
  }

  function handleLoginChange(field, value) {
    setLoginForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    setAuthMessage("");
  }

  function handleSignupChange(field, value) {
    setSignupForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    setAuthMessage("");
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();

    if (!loginForm.loginId.trim()) {
      setAuthMessage("아이디를 입력해주세요.");
      return;
    }

    if (!loginForm.password) {
      setAuthMessage("비밀번호를 입력해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);
      setAuthMessage("");

      const data = await loginUser({
        loginId: loginForm.loginId.trim(),
        password: loginForm.password,
      });

      saveAuthData(data);
      onAuthChange?.(data);
      setAuthMessage("로그인되었습니다.");
      resetAuthForms();
      setAuthMode("login");
      setIsLoginOpen(false);
    } catch (error) {
      setAuthMessage(getAuthErrorMessage(error, "로그인에 실패했습니다."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSignupSubmit(event) {
    event.preventDefault();

    if (!signupForm.name.trim()) {
      setAuthMessage("이름을 입력해주세요.");
      return;
    }

    if (!signupForm.loginId.trim()) {
      setAuthMessage("아이디를 입력해주세요.");
      return;
    }

    if (!signupForm.password) {
      setAuthMessage("비밀번호를 입력해주세요.");
      return;
    }

    if (!signupForm.passwordConfirm) {
      setAuthMessage("비밀번호 확인을 입력해주세요.");
      return;
    }

    if (signupForm.password !== signupForm.passwordConfirm) {
      setAuthMessage("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      setIsSubmitting(true);
      setAuthMessage("");

      const data = await signupUser({
        name: signupForm.name.trim(),
        loginId: signupForm.loginId.trim(),
        password: signupForm.password,
      });

      saveAuthData(data);
      onAuthChange?.(data);
      setAuthMessage("회원가입이 완료되었습니다.");
      resetAuthForms();
      setAuthMode("login");
      setIsLoginOpen(false);
    } catch (error) {
      setAuthMessage(getAuthErrorMessage(error, "회원가입에 실패했습니다."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={rootClassName} aria-label="영주의 지혜 히어로 섹션">
      <img
        className="hero-frame"
        src={`${HERO_PATH}/hero-frame-wide.png`}
        alt=""
        aria-hidden="true"
      />

      <div className="hero-canvas">
        <HeroTopBar
          authUser={authUser}
          isLoginDisabled={isSubmitting}
          isLoginOpen={isLoginOpen}
          loginOverlayId="hero-login-overlay"
          onLoginClick={toggleLogin}
          onOpenHistory={onOpenHistory}
          onLogout={onLogout}
          variant="hero"
        />

        <div className="hero-copy">
          <h1 className="hero-title">영주의 지혜</h1>
          <p className="hero-subtitle">배움은 쌓이고 지혜는 깊어진다.</p>
        </div>

        <img
          className="hero-character"
          src={`${HERO_PATH}/hoonjang-character.svg`}
          alt="훈장님 캐릭터"
        />

        {isLoginOpen && (
          <div
            id="hero-login-overlay"
            className="hero-login-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="로그인"
            onClick={handleOverlayClick}
          >
            <div className="hero-login-card" onClick={(event) => event.stopPropagation()}>
              <button
                type="button"
                className="hero-login-close"
                onClick={closeLogin}
                aria-label="로그인 닫기"
                disabled={isSubmitting}
              >
                ×
              </button>

              <div className="hero-login-left">
                <img
                  className="hero-login-logo"
                  src={`${HERO_PATH}/sunbi-typing-logo.svg`}
                  alt="선비 타이핑"
                />
              </div>

              <div className="hero-login-divider" aria-hidden="true" />

              <div className="hero-login-panel">
                <div className="auth-tabs" role="tablist" aria-label="인증 방식 선택">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={authMode === "login"}
                    className={`auth-tab ${authMode === "login" ? "is-active" : ""}`}
                    onClick={() => handleAuthModeChange("login")}
                    disabled={isSubmitting}
                  >
                    로그인
                  </button>

                  <button
                    type="button"
                    role="tab"
                    aria-selected={authMode === "signup"}
                    className={`auth-tab ${authMode === "signup" ? "is-active" : ""}`}
                    onClick={() => handleAuthModeChange("signup")}
                    disabled={isSubmitting}
                  >
                    회원가입
                  </button>
                </div>

                {authMode === "login" ? (
                  <form className="hero-login-form" onSubmit={handleLoginSubmit}>
                    <label className="hero-login-label">
                      <span>아이디</span>
                      <input
                        type="text"
                        value={loginForm.loginId}
                        onChange={(event) => handleLoginChange("loginId", event.target.value)}
                        placeholder="아이디를 입력해주세요"
                        autoComplete="username"
                        disabled={isSubmitting}
                      />
                    </label>

                    <label className="hero-login-label">
                      <span>비밀번호</span>
                      <input
                        type="password"
                        value={loginForm.password}
                        onChange={(event) => handleLoginChange("password", event.target.value)}
                        placeholder="비밀번호를 입력해주세요"
                        autoComplete="current-password"
                        disabled={isSubmitting}
                      />
                    </label>

                    <button type="submit" className="hero-login-submit" disabled={isSubmitting}>
                      {isSubmitting ? "처리 중..." : "로그인"}
                    </button>
                  </form>
                ) : (
                  <form className="hero-login-form" onSubmit={handleSignupSubmit}>
                    <label className="hero-login-label">
                      <span>이름</span>
                      <input
                        type="text"
                        value={signupForm.name}
                        onChange={(event) => handleSignupChange("name", event.target.value)}
                        placeholder="이름을 입력해주세요"
                        autoComplete="name"
                        disabled={isSubmitting}
                      />
                    </label>

                    <label className="hero-login-label">
                      <span>아이디</span>
                      <input
                        type="text"
                        value={signupForm.loginId}
                        onChange={(event) => handleSignupChange("loginId", event.target.value)}
                        placeholder="아이디를 입력해주세요"
                        autoComplete="username"
                        disabled={isSubmitting}
                      />
                    </label>

                    <label className="hero-login-label">
                      <span>비밀번호</span>
                      <input
                        type="password"
                        value={signupForm.password}
                        onChange={(event) => handleSignupChange("password", event.target.value)}
                        placeholder="비밀번호를 입력해주세요"
                        autoComplete="new-password"
                        disabled={isSubmitting}
                      />
                    </label>

                    <label className="hero-login-label">
                      <span>비밀번호 확인</span>
                      <input
                        type="password"
                        value={signupForm.passwordConfirm}
                        onChange={(event) =>
                          handleSignupChange("passwordConfirm", event.target.value)
                        }
                        placeholder="비밀번호를 다시 입력해주세요"
                        autoComplete="new-password"
                        disabled={isSubmitting}
                      />
                    </label>

                    <button type="submit" className="hero-login-submit" disabled={isSubmitting}>
                      {isSubmitting ? "처리 중..." : "회원가입"}
                    </button>
                  </form>
                )}

                {authMessage && (
                  <p className="auth-message" role="status" aria-live="polite">
                    {authMessage}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HeroSection;