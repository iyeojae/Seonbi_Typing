import { useEffect, useMemo, useState } from "react";
import "./MapSection.css";

const ALREADY_SOLVED_NOTICE = "이미 푼 문제는 다시 풀 수 없습니다. 푼 문제 목록에서 확인해보세요.";
const ALREADY_PROB_CARD_PATH = `${process.env.PUBLIC_URL}/map/already-prob.png`;
const MAP_IMAGE_PATH = `${process.env.PUBLIC_URL}/map/map-big.png`;
const STEP_ICON_PATH = `${process.env.PUBLIC_URL}/map/step.svg`;
const STEP_HOVER_ICON_PATH = `${process.env.PUBLIC_URL}/map/step-onclick.svg`;

const STEP_SLOTS = [
  { id: 1, label: "1", x: 40.5, y: 5.9 },
  { id: 2, label: "2", x: 27.6, y: 15.5 },
  { id: 3, label: "3", x: 44.1, y: 22.7 },
  { id: 4, label: "4", x: 68.9, y: 31.6 },
  { id: 5, label: "5", x: 77.1, y: 42.1 },
  { id: 6, label: "6", x: 73.8, y: 54.9 },
  { id: 7, label: "7", x: 61.5, y: 65.4 },
  { id: 8, label: "8", x: 74.2, y: 76.9 },
  { id: 9, label: "9", x: 48.3, y: 86.1 },
  { id: 10, label: "10", x: 19.4, y: 90.8 },
];

const MAP_PAGE_SIZE = STEP_SLOTS.length;

function getInitialPage(totalSolvedCount) {
  return Math.max(1, Math.ceil((totalSolvedCount + 1) / MAP_PAGE_SIZE));
}

function getStepLabelClassName(stepLabel) {
  if (stepLabel.length >= 3) {
    return "is-three-digits";
  }

  if (stepLabel.length >= 2) {
    return "is-two-digits";
  }

  return "";
}

function MapSection({ className = "", onSelectStep, totalSolvedCount = 0 }) {
  const rootClassName = ["map-section", className].filter(Boolean).join(" ");
  const safeSolvedCount = Math.max(0, Number(totalSolvedCount) || 0);
  const totalPageCount = Math.max(1, Math.ceil((safeSolvedCount + 1) / MAP_PAGE_SIZE));
  const [currentPage, setCurrentPage] = useState(() => getInitialPage(safeSolvedCount));
  const [isSolvedNoticeOpen, setIsSolvedNoticeOpen] = useState(false);
  const currentPageSteps = useMemo(
    () =>
      STEP_SLOTS.map((step) => {
        const stepId = (currentPage - 1) * MAP_PAGE_SIZE + step.id;
        const stepLabel = String(stepId);

        return {
          ...step,
          id: stepId,
          label: stepLabel,
          isSolved: stepId <= safeSolvedCount,
          isCurrent: stepId === safeSolvedCount + 1,
          labelClassName: getStepLabelClassName(stepLabel),
        };
      }),
    [currentPage, safeSolvedCount]
  );

  useEffect(() => {
    setCurrentPage(getInitialPage(safeSolvedCount));
  }, [safeSolvedCount]);

  function handlePrevPage() {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  }

  function handleNextPage() {
    setCurrentPage((prev) => Math.min(totalPageCount, prev + 1));
  }

  function handleStepSelect(step) {
    if (step.isSolved) {
      setIsSolvedNoticeOpen(true);
      return;
    }

    onSelectStep?.(step.id);
  }

  function handleCloseSolvedNotice() {
    setIsSolvedNoticeOpen(false);
  }

  return (
    <div className={rootClassName} aria-label="학습 지도">
      {currentPage > 1 && (
        <button
          type="button"
          className="map-nav-button map-nav-button--prev"
          onClick={handlePrevPage}
          aria-label="이전 단계 묶음 보기"
        >
          {"<"}
        </button>
      )}

      <div className="map-stage-shell">
        <div className="map-stage">
          <img
            className="map-wave-image"
            src={MAP_IMAGE_PATH}
            alt=""
            aria-hidden="true"
            draggable="false"
          />

          {totalPageCount > 1 && (
            <div className="map-page-indicator" aria-live="polite">
              {`${currentPage} / ${totalPageCount}`}
            </div>
          )}

          <div className="map-step-list" aria-label="학습 단계">
            {currentPageSteps.map((step) => (
              <button
                key={step.id}
                type="button"
                className={`map-step-marker ${step.isSolved ? "is-solved" : ""} ${
                  step.isCurrent ? "is-current" : ""
                }`}
                onClick={() => handleStepSelect(step)}
                style={{
                  "--x": `${step.x}%`,
                  "--y": `${step.y}%`,
                }}
                aria-label={`${step.label}단계${step.isSolved ? " 이미 완료됨" : ""}`}
              >
                <img
                  className="map-step-icon map-step-icon--default"
                  src={STEP_ICON_PATH}
                  alt=""
                  aria-hidden="true"
                  draggable="false"
                />
                <img
                  className="map-step-icon map-step-icon--hover"
                  src={STEP_HOVER_ICON_PATH}
                  alt=""
                  aria-hidden="true"
                  draggable="false"
                />
                {step.isSolved && <span className="map-step-solved-badge" aria-hidden="true">풂</span>}
                <span className={`map-step-label ${step.labelClassName}`}>
                  {step.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {currentPage < totalPageCount && (
        <button
          type="button"
          className="map-nav-button map-nav-button--next"
          onClick={handleNextPage}
          aria-label="다음 단계 묶음 보기"
        >
          {">"}
        </button>
      )}

      {isSolvedNoticeOpen && (
        <div
          className="map-notice-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="이미 푼 문제 안내"
          onClick={handleCloseSolvedNotice}
        >
          <div className="map-notice-card" onClick={(event) => event.stopPropagation()}>
            <img
              className="map-notice-card-image"
              src={ALREADY_PROB_CARD_PATH}
              alt=""
              aria-hidden="true"
              draggable="false"
            />

            <div className="map-notice-card-content">
              <p className="map-notice-card-message">{ALREADY_SOLVED_NOTICE}</p>

              <button
                type="button"
                className="map-notice-card-button"
                onClick={handleCloseSolvedNotice}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MapSection;