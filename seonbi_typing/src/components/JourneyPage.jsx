import { useEffect, useRef, useState } from "react";
import "./JourneyPage.css";
import FestivalSection from "./FestivalSection";
import HeroSection from "./HeroSection";
import MapSection from "./MapSection";

const SECOND_SECTION_SRC = `${process.env.PUBLIC_URL}/assets/second-section.png`;
const SECOND_SECTION_ANIMATION_MS = 3000;
const SCROLL_LOCK_KEYS = new Set([
  "ArrowUp",
  "ArrowDown",
  "PageUp",
  "PageDown",
  "Home",
  "End",
  " ",
  "Spacebar",
]);

function JourneyPage({ authUser, onAuthChange, onLogout, onOpenHistory, onSelectProblem }) {
  const secondPanelRef = useRef(null);
  const secondPanelTimeoutRef = useRef(null);
  const isScrollLockedRef = useRef(false);
  const secondPanelPhaseRef = useRef("idle");
  const lockedScrollYRef = useRef(0);
  const scrollLockListenersRef = useRef({
    onWheel: null,
    onTouchMove: null,
    onKeyDown: null,
    onScroll: null,
  });
  const [secondPanelPhase, setSecondPanelPhase] = useState("idle");

  useEffect(() => {
    function removeScrollLockListeners() {
      const listeners = scrollLockListenersRef.current;

      if (listeners.onWheel) {
        document.removeEventListener("wheel", listeners.onWheel);
      }

      if (listeners.onTouchMove) {
        document.removeEventListener("touchmove", listeners.onTouchMove);
      }

      if (listeners.onKeyDown) {
        document.removeEventListener("keydown", listeners.onKeyDown);
      }

      if (listeners.onScroll) {
        window.removeEventListener("scroll", listeners.onScroll);
      }

      scrollLockListenersRef.current = {
        onWheel: null,
        onTouchMove: null,
        onKeyDown: null,
        onScroll: null,
      };
    }

    function lockScroll() {
      if (isScrollLockedRef.current) {
        return;
      }

      lockedScrollYRef.current = window.scrollY;

      const onWheel = (event) => {
        event.preventDefault();
      };

      const onTouchMove = (event) => {
        event.preventDefault();
      };

      const onKeyDown = (event) => {
        if (SCROLL_LOCK_KEYS.has(event.key)) {
          event.preventDefault();
        }
      };

      const onScroll = () => {
        if (!isScrollLockedRef.current) {
          return;
        }

        if (Math.abs(window.scrollY - lockedScrollYRef.current) > 1) {
          window.scrollTo(0, lockedScrollYRef.current);
        }
      };

      scrollLockListenersRef.current = {
        onWheel,
        onTouchMove,
        onKeyDown,
        onScroll,
      };

      document.addEventListener("wheel", onWheel, { passive: false });
      document.addEventListener("touchmove", onTouchMove, { passive: false });
      document.addEventListener("keydown", onKeyDown, { passive: false });
      window.addEventListener("scroll", onScroll, { passive: true });
      isScrollLockedRef.current = true;
    }

    function unlockScroll() {
      if (!isScrollLockedRef.current) {
        return;
      }

      removeScrollLockListeners();
      window.scrollTo(0, lockedScrollYRef.current);
      isScrollLockedRef.current = false;
    }

    function getFixedHeaderHeight() {
      return document.querySelector(".hero-top-bar--fixed")?.getBoundingClientRect().height || 0;
    }

    function maybeStartSecondPanelAnimation() {
      if (secondPanelPhaseRef.current !== "idle") {
        return;
      }

      const secondPanel = secondPanelRef.current;

      if (!secondPanel) {
        return;
      }

      const panelRect = secondPanel.getBoundingClientRect();
      const headerHeight = getFixedHeaderHeight();
      const isPanelPinned = panelRect.top <= headerHeight && panelRect.bottom > window.innerHeight;

      if (!isPanelPinned) {
        return;
      }

      lockScroll();
      secondPanelPhaseRef.current = "animating";
      setSecondPanelPhase("animating");
      secondPanelTimeoutRef.current = window.setTimeout(() => {
        unlockScroll();
        secondPanelPhaseRef.current = "complete";
        setSecondPanelPhase("complete");
      }, SECOND_SECTION_ANIMATION_MS);
    }

    maybeStartSecondPanelAnimation();
    window.addEventListener("scroll", maybeStartSecondPanelAnimation, { passive: true });
    window.addEventListener("resize", maybeStartSecondPanelAnimation);

    return () => {
      window.removeEventListener("scroll", maybeStartSecondPanelAnimation);
      window.removeEventListener("resize", maybeStartSecondPanelAnimation);

      if (secondPanelTimeoutRef.current) {
        window.clearTimeout(secondPanelTimeoutRef.current);
      }

      removeScrollLockListeners();
      unlockScroll();
    };
  }, []);

  return (
    <main
      className="journey-page"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/assets/paper-texture.png)`,
      }}
    >
      <section className="journey-panel hero-panel">
        <HeroSection
          authUser={authUser}
          onAuthChange={onAuthChange}
          onLogout={onLogout}
          onOpenHistory={onOpenHistory}
        />
      </section>

      <section
        ref={secondPanelRef}
        className={`journey-panel second-panel ${
          secondPanelPhase !== "idle" ? "is-revealed" : ""
        }`}
        aria-label="문양 전환 섹션"
      >
        <div className="second-panel-sticky">
          <div className="second-panel-frame">
            <img
              className="second-panel-image"
              src={SECOND_SECTION_SRC}
              alt=""
              aria-hidden="true"
              draggable="false"
            />
          </div>
        </div>
      </section>

      <section className="journey-panel map-panel" aria-label="학습 지도">
        <div className="map-panel-inner">
          <MapSection
            onSelectStep={onSelectProblem}
            totalSolvedCount={authUser?.totalSolvedCount ?? 0}
          />
        </div>
      </section>

      <FestivalSection />
    </main>
  );
}

export default JourneyPage;