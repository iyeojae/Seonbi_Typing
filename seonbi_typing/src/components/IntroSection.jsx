import "./IntroSection.css";

function clamp(v, min, max) {
  return Math.min(Math.max(v, min), max);
}

/*
 * IntroSection — 문양 전환 레이어 (z-index 5, 최상단)
 *
 * App.js에서 통합 progress를 받아 동작한다. 자체 스크롤 추적 없음.
 *
 * progress 0.00–0.08 : 등장 (opacity 0→1)
 * progress 0.08–0.40 : 크게 고정 (scale 2.6)
 * progress 0.40–0.88 : 축소 (scale 2.6→1.0) + 지도 상단 중앙으로 이동
 */
function IntroSection({ progress = 0 }) {
  const opacity = clamp(progress / 0.08, 0, 1);
  const shrinkT = clamp((progress - 0.40) / 0.48, 0, 1); // 0.40→0.88
  const scale = 2.6 - shrinkT * 1.6;    // 2.6 → 1.0
  const translateY = 6 - shrinkT * 43;  // 6vh → -37vh (지도 상단 중앙)

  return (
    <div className="intro-layer" aria-label="지도 진입 문양">
      <img
        className="journey-factor"
        src={`${process.env.PUBLIC_URL}/intro/intro-factor.svg`}
        alt=""
        aria-hidden="true"
        draggable="false"
        style={{
          transform: `translate3d(-50%, calc(-50% + ${translateY}vh), 0) scale(${scale.toFixed(4)})`,
          opacity,
        }}
      />
    </div>
  );
}

export default IntroSection;
