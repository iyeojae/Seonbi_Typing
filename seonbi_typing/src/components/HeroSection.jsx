import "./HeroSection.css";

const HERO_PATH = `${process.env.PUBLIC_URL}/hero`;

function HeroSection({ className = "" }) {
  const rootClassName = ["hero-section", className].filter(Boolean).join(" ");

  return (
    <div className={rootClassName} aria-label="영주의 지혜 히어로 섹션">
      <img
        className="hero-frame"
        src={`${HERO_PATH}/hero-frame-wide.png`}
        alt=""
        aria-hidden="true"
      />

      <div className="hero-canvas">
        <img
          className="hero-logo"
          src={`${HERO_PATH}/sunbi-typing-logo.svg`}
          alt="선비 타이핑"
        />

        <div className="hero-auth">
          <button className="hero-login-btn" type="button">
            로그인
          </button>
        </div>

        <div className="hero-copy">
          <h1 className="hero-title">영주의 지혜</h1>
          <p className="hero-subtitle">배움은 쌓이고 지혜는 깊어진다.</p>
        </div>

        <img
          className="hero-character"
          src={`${HERO_PATH}/hoonjang-character.svg`}
          alt="훈장님 캐릭터"
        />
      </div>
    </div>
  );
}

export default HeroSection;