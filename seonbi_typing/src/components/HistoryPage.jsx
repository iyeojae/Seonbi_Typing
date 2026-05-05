import { useEffect, useMemo, useState } from "react";
import { getMyProblemHistory } from "../api/historyApi";
import HeroTopBar from "./HeroTopBar";
import "./HistoryPage.css";

const PROB_PATH = `${process.env.PUBLIC_URL}/prob`;
const MAP_PATH = `${process.env.PUBLIC_URL}/map`;
const INTRO_PATH = `${process.env.PUBLIC_URL}/intro`;

function formatSolvedAt(value) {
  if (!value) {
    return "기록 시간 없음";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "기록 시간 없음";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getHistoryErrorMessage(error) {
  if (error?.message === "Failed to fetch") {
    return "기록을 불러오지 못했습니다. 서버 상태 또는 CORS 설정을 확인해주세요.";
  }

  return error?.message || "기록을 불러오지 못했습니다.";
}

function HistoryPage({ authUser, onExitHistory, onLogout, onOpenHistory }) {
  const [historyItems, setHistoryItems] = useState([]);
  const [loadState, setLoadState] = useState("loading");
  const [loadError, setLoadError] = useState("");
  const summary = useMemo(() => {
    const solvedCount = historyItems.length;
    const correctCount = historyItems.filter((item) => item.correct).length;
    const accuracy = solvedCount > 0 ? Math.round((correctCount / solvedCount) * 100) : 0;
    const latestSolvedAt = historyItems[0]?.solvedAt || "";

    return {
      solvedCount,
      correctCount,
      accuracy,
      latestSolvedAt: formatSolvedAt(latestSolvedAt),
    };
  }, [historyItems]);

  useEffect(() => {
    let isDisposed = false;

    async function loadHistory() {
      try {
        setLoadState("loading");
        setLoadError("");
        const response = await getMyProblemHistory();

        if (isDisposed) {
          return;
        }

        setHistoryItems(response);
        setLoadState("ready");
      } catch (error) {
        if (isDisposed) {
          return;
        }

        setLoadError(getHistoryErrorMessage(error));
        setLoadState("error");
      }
    }

    loadHistory();

    return () => {
      isDisposed = true;
    };
  }, []);

  return (
    <main
      className="history-page"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/assets/paper-texture.png)`,
      }}
    >
      <header className="history-header">
        <img className="history-header-image" src={`${PROB_PATH}/header.png`} alt="" aria-hidden="true" />
        <div className="history-header-overlay">
          <HeroTopBar
            authUser={authUser}
            onLogoClick={onExitHistory}
            onLogout={onLogout}
            onOpenHistory={onOpenHistory}
            showLoginTrigger={false}
            variant="compact"
          />
        </div>
      </header>

      <section className="history-stage" aria-label="내가 푼 문제 기록">
        <img
          className="history-wave history-wave--top"
          src={`${MAP_PATH}/map-wave.png`}
          alt=""
          aria-hidden="true"
          draggable="false"
        />
        <img
          className="history-wave history-wave--bottom"
          src={`${MAP_PATH}/map-wave.png`}
          alt=""
          aria-hidden="true"
          draggable="false"
        />
        <img
          className="history-stone history-stone--left"
          src={`${PROB_PATH}/stone1.svg`}
          alt=""
          aria-hidden="true"
          draggable="false"
        />
        <img
          className="history-stone history-stone--right"
          src={`${PROB_PATH}/stone4.svg`}
          alt=""
          aria-hidden="true"
          draggable="false"
        />

        <div className="history-shell">
          <aside className="history-aside">
            <div className="history-title-block">
              <span className="history-eyebrow">수양 기록첩</span>
              <h1 className="history-title">내가 푼 문제</h1>
              <p className="history-subtitle">
                푼 문제와 풀이 흔적을 한 장의 기록첩처럼 모아 두었느니라.
              </p>
              <img
                className="history-factor"
                src={`${INTRO_PATH}/intro-factor.svg`}
                alt=""
                aria-hidden="true"
                draggable="false"
              />
            </div>

            <div className="history-summary-grid">
              <article className="history-summary-card">
                <span className="history-summary-label">총 기록</span>
                <strong className="history-summary-value">{summary.solvedCount}</strong>
                <span className="history-summary-foot">쌓인 풀이 수</span>
              </article>

              <article className="history-summary-card">
                <span className="history-summary-label">정답률</span>
                <strong className="history-summary-value">{`${summary.accuracy}%`}</strong>
                <span className="history-summary-foot">맞힌 문제 비율</span>
              </article>

              <article className="history-summary-card history-summary-card--wide">
                <span className="history-summary-label">가장 최근 수양</span>
                <strong className="history-summary-value history-summary-value--small">
                  {summary.latestSolvedAt}
                </strong>
                <span className="history-summary-foot">
                  {summary.correctCount > 0
                    ? `${summary.correctCount}개의 문제를 바르게 풀었느니라.`
                    : "아직 바르게 푼 문제 기록이 없느니라."}
                </span>
              </article>
            </div>

            <div className="history-character-card">
              <img
                className="history-character"
                src={`${PROB_PATH}/relax_hoonjang.svg`}
                alt="훈장님 캐릭터"
                draggable="false"
              />

              <div className="history-character-bubble">
                <p>
                  {historyItems.length > 0
                    ? "문장을 익힌 흔적이 차곡차곡 쌓였구나. 틀린 기록도 풀이의 자취이니 꼼꼼히 다시 살펴보거라."
                    : "아직 기록이 없구나. 지도로 돌아가 첫 문제부터 천천히 풀어 보거라."}
                </p>
              </div>
            </div>
          </aside>

          <section className="history-board" aria-live="polite">
            {loadState === "loading" ? (
              <div className="history-empty-card">
                <p className="history-empty-title">수양 기록을 펼치고 있느니 잠시 기다리거라.</p>
                <p className="history-empty-text">훈장님이 지난 풀이들을 한데 모으고 있도다.</p>
              </div>
            ) : loadState === "error" ? (
              <div className="history-empty-card">
                <p className="history-empty-title">기록을 불러오지 못했느니라.</p>
                <p className="history-empty-text">{loadError}</p>
                <div className="history-empty-actions">
                  <button type="button" className="history-action-button" onClick={onExitHistory}>
                    지도 화면으로 돌아가기
                  </button>
                </div>
              </div>
            ) : historyItems.length === 0 ? (
              <div className="history-empty-card">
                <p className="history-empty-title">아직 남겨진 풀이 기록이 없느니라.</p>
                <p className="history-empty-text">
                  지도의 문제를 풀면 이곳에 네가 쓴 뜻풀이와 훈장님의 평이 차곡차곡 남게 된다.
                </p>
                <div className="history-empty-actions">
                  <button type="button" className="history-action-button" onClick={onExitHistory}>
                    문제 풀러 가기
                  </button>
                </div>
              </div>
            ) : (
              <div className="history-card-list">
                {historyItems.map((item, index) => (
                  <article key={item.historyId} className="history-record-card">
                    <div className="history-record-top">
                      <div className="history-record-badges">
                        <span className="history-record-chip">{`${item.historyId}번 기록`}</span>
                        <span
                          className={`history-record-result ${item.correct ? "is-correct" : "is-incorrect"}`}
                        >
                          {item.correct ? "풀이 완료" : "다시 볼 문제"}
                        </span>
                      </div>

                      <time className="history-record-time" dateTime={item.solvedAt}>
                        {formatSolvedAt(item.solvedAt)}
                      </time>
                    </div>

                    <div className="history-record-main">
                      <div className="history-record-headline">
                        <span className="history-record-order">{String(index + 1).padStart(2, "0")}</span>
                        <div className="history-record-texts">
                          <h2 className="history-record-original">{item.originalText}</h2>
                          <p className="history-record-reading">{item.readingText}</p>
                        </div>
                      </div>

                      <div className="history-record-grid">
                        <section className="history-record-panel">
                          <span className="history-record-label">의미</span>
                          <p className="history-record-body">{item.meaning}</p>
                        </section>

                        <section className="history-record-panel history-record-panel--answer">
                          <span className="history-record-label">내가 적은 답</span>
                          <p className="history-record-body">{item.userAnswer}</p>
                        </section>
                      </div>

                      <section className="history-record-explanation">
                        <span className="history-record-label">훈장님 평</span>
                        <p className="history-record-body">{item.explanation}</p>
                      </section>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

export default HistoryPage;