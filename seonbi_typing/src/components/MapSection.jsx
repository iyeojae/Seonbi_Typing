import { useEffect, useMemo, useState } from "react";
import "./MapSection.css";

const STEP_SLOTS = [
  { id: 1, label: "1", x: 31.61, y: 4.76 },
  { id: 2, label: "2", x: 17.01, y: 16.05 },
  { id: 3, label: "3", x: 36.45, y: 17.24 },
  { id: 4, label: "4", x: 69.56, y: 26.87 },
  { id: 5, label: "5", x: 75.9, y: 44.95 },
  { id: 6, label: "6", x: 80.07, y: 66.94 },
  { id: 7, label: "7", x: 45.54, y: 66.11 },
  { id: 8, label: "8", x: 62.3, y: 80.5 },
  { id: 9, label: "9", x: 38.78, y: 86.44 },
  { id: 10, label: "10", x: 15.93, y: 89.77 },
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

  return (
    <div className={rootClassName} aria-label="물결 지도">
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

      <div className="map-stage">
        <img className="map-wave-image" src="/map/map-wave.png" alt="" aria-hidden="true" />

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
              onClick={() => onSelectStep?.(step.id)}
              style={{
                "--x": `${step.x}%`,
                "--y": `${step.y}%`,
              }}
              aria-label={`${step.label}단계${step.isSolved ? " 복습 가능" : ""}`}
            >
              <img className="map-step-icon" src="/map/step.svg" alt="" aria-hidden="true" />
              {step.isSolved && <span className="map-step-solved-badge" aria-hidden="true">풂</span>}
              <span className={`map-step-label ${step.labelClassName}`}>
                {step.label}
              </span>
            </button>
          ))}
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
    </div>
  );
}

export default MapSection;