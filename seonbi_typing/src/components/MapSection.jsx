import "./MapSection.css";

const steps = [
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

function MapSection({ className = "" }) {
  const rootClassName = ["map-section", className].filter(Boolean).join(" ");

  return (
    <div className={rootClassName} aria-label="물결 지도">
      <div className="map-stage">
        <img className="map-wave-image" src="/map/map-wave.png" alt="" aria-hidden="true" />

        <div className="map-step-list" aria-label="학습 단계">
          {steps.map((step) => (
            <button
              key={step.id}
              type="button"
              className="map-step-marker"
              style={{
                "--x": `${step.x}%`,
                "--y": `${step.y}%`,
              }}
              aria-label={`${step.label}단계`}
            >
              <img className="map-step-icon" src="/map/step.svg" alt="" aria-hidden="true" />
              <span
                className={`map-step-label ${
                  step.label.length >= 3
                    ? "is-three-digits"
                    : step.label.length >= 2
                      ? "is-two-digits"
                      : ""
                }`}
              >
                {step.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MapSection;