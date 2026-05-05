import { useEffect, useRef, useState } from "react";
import "./HeroSection.css";
import {
  GRADE_TRACK_DOTS,
  HERO_PATH,
  RANK_GROUPS,
  getProfileIconPath,
  getRankGroup,
} from "./heroUi";

function HeroTopBar({
  authUser,
  isLoginDisabled = false,
  isLoginOpen = false,
  loginOverlayId,
  onLoginClick,
  onLogoClick,
  onOpenHistory,
  onLogout,
  showLoginTrigger = true,
  variant = "hero",
}) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isGradePanelOpen, setIsGradePanelOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const gradePanelRef = useRef(null);
  const currentRank = authUser?.currentRank || RANK_GROUPS[0].baseRank;
  const rankGroup = getRankGroup(currentRank);
  const currentRankIndex = RANK_GROUPS.findIndex((group) => group.code === rankGroup.code);

  useEffect(() => {
    if (!authUser) {
      setIsProfileMenuOpen(false);
      setIsGradePanelOpen(false);
      return undefined;
    }

    if (!isProfileMenuOpen && !isGradePanelOpen) {
      return undefined;
    }

    function handleDocumentPointerDown(event) {
      const target = event.target;

      if (profileMenuRef.current?.contains(target) || gradePanelRef.current?.contains(target)) {
        return;
      }

      setIsProfileMenuOpen(false);
      setIsGradePanelOpen(false);
    }

    document.addEventListener("mousedown", handleDocumentPointerDown);
    return () => {
      document.removeEventListener("mousedown", handleDocumentPointerDown);
    };
  }, [authUser, isProfileMenuOpen, isGradePanelOpen]);

  function handleProfileMenuToggle() {
    setIsProfileMenuOpen((prev) => !prev);
    setIsGradePanelOpen(false);
  }

  function handleGradePanelToggle() {
    setIsGradePanelOpen((prev) => !prev);
    setIsProfileMenuOpen(false);
  }

  function handleLogoutClick() {
    onLogout?.();
    setIsProfileMenuOpen(false);
    setIsGradePanelOpen(false);
  }

  function handleHistoryClick() {
    onOpenHistory?.();
    setIsProfileMenuOpen(false);
    setIsGradePanelOpen(false);
  }

  return (
    <div className={`hero-top-bar hero-top-bar--${variant}`}>
      {onLogoClick ? (
        <button
          type="button"
          className="hero-logo-button"
          onClick={onLogoClick}
          aria-label="지도 화면으로 이동"
        >
          <img
            className="hero-logo-image"
            src={`${HERO_PATH}/sunbi-typing-logo.svg`}
            alt="선비 타이핑"
          />
        </button>
      ) : (
        <img
          className="hero-logo"
          src={`${HERO_PATH}/sunbi-typing-logo.svg`}
          alt="선비 타이핑"
        />
      )}

      {(authUser || showLoginTrigger) && (
        <div className="hero-auth">
          {authUser ? (
            <div className="hero-auth-logged-in" aria-live="polite">
              <div className="hero-streak-pill">
                <img
                  className="hero-streak-icon"
                  src={`${HERO_PATH}/flame-icon.svg`}
                  alt=""
                  aria-hidden="true"
                />
                <span className="hero-streak-text">{`${authUser.currentStreak ?? 0}일째 수양중`}</span>
              </div>

              <div
                className={`hero-grade-wrap ${isGradePanelOpen ? "is-open" : ""}`}
                ref={gradePanelRef}
              >
                <button
                  type="button"
                  className="hero-grade-trigger"
                  onClick={handleGradePanelToggle}
                  aria-expanded={isGradePanelOpen}
                  aria-haspopup="dialog"
                  aria-label="등급"
                >
                  <img
                    className="hero-grade-trigger-icon"
                    src={`${HERO_PATH}/${rankGroup.icon}`}
                    alt=""
                    aria-hidden="true"
                  />
                </button>

                {isGradePanelOpen && (
                  <div className="hero-grade-panel" role="dialog" aria-label="등급 정보">
                    <span className="hero-grade-current-rank">{currentRank}</span>

                    <div className="hero-grade-track" aria-hidden="true">
                      <span className="hero-grade-track-line" />

                      <div className="hero-grade-track-dots">
                        {Array.from({ length: GRADE_TRACK_DOTS }).map((_, index) => (
                          <span
                            key={`grade-dot-${index + 1}`}
                            className={`hero-grade-track-dot ${
                              index <= currentRankIndex * 2 ? "is-active" : ""
                            }`}
                          />
                        ))}
                      </div>

                      <div className="hero-grade-icons">
                        {RANK_GROUPS.map((group, index) => {
                          const stateClassName =
                            index < currentRankIndex
                              ? "is-cleared"
                              : index === currentRankIndex
                                ? "is-current"
                                : "is-upcoming";

                          return (
                            <div
                              key={group.code}
                              className={`hero-grade-icon-slot ${stateClassName}`}
                            >
                              <img
                                className="hero-grade-icon"
                                src={`${HERO_PATH}/${group.icon}`}
                                alt=""
                                aria-hidden="true"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="hero-profile-wrap" ref={profileMenuRef}>
                <button
                  type="button"
                  className="hero-profile-trigger"
                  onClick={handleProfileMenuToggle}
                  aria-expanded={isProfileMenuOpen}
                  aria-haspopup="menu"
                >
                  <img
                    className="hero-profile-icon"
                    src={getProfileIconPath(currentRank)}
                    alt=""
                    aria-hidden="true"
                  />
                </button>

                {isProfileMenuOpen && (
                  <div className="hero-profile-menu" role="menu" aria-label="프로필 메뉴">
                    <div className="hero-profile-menu-header">
                      <strong className="hero-profile-menu-name">{authUser.name}</strong>
                      <span className="hero-profile-menu-rank">{currentRank}</span>
                    </div>

                    <button
                      type="button"
                      className="hero-profile-menu-button hero-profile-menu-button--secondary"
                      onClick={handleHistoryClick}
                    >
                      내가 푼 문제
                    </button>

                    <button
                      type="button"
                      className="hero-profile-menu-button"
                      onClick={handleLogoutClick}
                    >
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            showLoginTrigger && (
              <button
                className="hero-login-trigger"
                type="button"
                onClick={onLoginClick}
                disabled={isLoginDisabled}
                aria-expanded={isLoginOpen}
                aria-controls={loginOverlayId}
              >
                {isLoginOpen ? "닫기" : "로그인"}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default HeroTopBar;