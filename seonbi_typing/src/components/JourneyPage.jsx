import "./JourneyPage.css";
import HeroSection from "./HeroSection";
import MapSection from "./MapSection";

const ORNAMENT_SRC = `${process.env.PUBLIC_URL}/intro/intro-factor.svg`;

function JourneyPage({ authUser, onAuthChange, onLogout, onOpenHistory, onSelectProblem }) {
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

      <section className="journey-panel map-panel" aria-label="학습 지도">
        <div className="map-panel-inner">
          <img
            className="map-page-factor"
            src={ORNAMENT_SRC}
            alt=""
            aria-hidden="true"
            draggable="false"
          />

          <MapSection
            onSelectStep={onSelectProblem}
            totalSolvedCount={authUser?.totalSolvedCount ?? 0}
          />
        </div>
      </section>

      <section className="journey-panel team-panel" aria-label="팀 소개">
        <div className="team-panel-inner">
          <div className="team-card">
            <div className="team-card-row">
              <span>디자인 이가현</span>
              <span>BE 찬우</span>
              <span>FB 찬우</span>
            </div>

            <div className="team-card-row">
              <span>장소</span>
              <span className="team-card-support">고객지원 · 010-****-****</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default JourneyPage;