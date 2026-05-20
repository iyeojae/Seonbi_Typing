import { useEffect, useRef, useState } from "react";
import "./TourSection.css";

const TOUR_ITEMS = [
  {
    id: "museom-village",
    title: "무섬마을",
    imageSrc: "https://tong.visitkorea.or.kr/cms/resource/76/2563076_image2_1.jpg",
    position: "left",
  },
  {
    id: "buseoksa",
    title: "부석사",
    imageSrc: "https://commons.wikimedia.org/wiki/Special:FilePath/Muryangsujeon2.jpg",
    position: "center",
  },
  {
    id: "sosu-seowon",
    title: "소수 서원",
    imageSrc:
      "https://commons.wikimedia.org/wiki/Special:FilePath/%EC%86%8C%EC%88%98%EC%84%9C%EC%9B%9018807.jpg",
    position: "right",
  },
];

const DECORATIONS = [
  {
    id: "moon",
    fileName: "Ellipse 131.svg",
    className: "tour-decoration--moon",
  },
  {
    id: "cloud-left",
    fileName: "Group 145.svg",
    className: "tour-decoration--cloud-left",
  },
  {
    id: "cloud-small",
    fileName: "Group 155.svg",
    className: "tour-decoration--cloud-small",
  },
  {
    id: "cloud-right",
    fileName: "Group 354.svg",
    className: "tour-decoration--cloud-right",
  },
];

function getTourAssetPath(fileName) {
  return encodeURI(`${process.env.PUBLIC_URL}/tour/${fileName}`);
}

function TourSection() {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCardId, setHoveredCardId] = useState(null);

  useEffect(() => {
    if (isVisible) {
      return undefined;
    }

    const section = sectionRef.current;

    if (!section) {
      return undefined;
    }

    let intervalId = null;

    function cleanup() {
      window.removeEventListener("scroll", revealSection);
      window.removeEventListener("resize", revealSection);

      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
    }

    function revealSection() {
      const rect = section.getBoundingClientRect();
      const viewportHeight =
        window.innerHeight || document.documentElement.clientHeight || 0;

      if (rect.top <= viewportHeight * 0.82 && rect.bottom >= viewportHeight * 0.08) {
        setIsVisible(true);
        cleanup();
      }
    }

    revealSection();
    intervalId = window.setInterval(revealSection, 140);
    window.addEventListener("scroll", revealSection, { passive: true });
    window.addEventListener("resize", revealSection);

    return cleanup;
  }, [isVisible]);

  return (
    <section
      ref={sectionRef}
      className={`tour-section ${isVisible ? "is-visible" : ""}`}
      aria-labelledby="tour-section-title"
    >
      <div className="tour-decorations" aria-hidden="true">
        {DECORATIONS.map((decoration, index) => (
          <img
            key={decoration.id}
            className={`tour-decoration ${decoration.className}`}
            src={getTourAssetPath(decoration.fileName)}
            alt=""
            draggable="false"
            style={{ "--tour-order": index + 1 }}
          />
        ))}
      </div>

      <div className="tour-section-inner">
        <header className="tour-copy-block">
          <h2 id="tour-section-title" className="tour-title">
            문장이 머무는 공간들
          </h2>

          <p className="tour-description">오래된 기록이 머무는 영주의 공간들을 만나보세요</p>
        </header>

        <div className="tour-showcase">
          <ul className="tour-card-fan">
            {TOUR_ITEMS.map((item) => (
              <li
                key={item.id}
                className={`tour-card-item tour-card-item--${item.position} ${
                  hoveredCardId === item.id ? "is-hovered" : ""
                }`}
              >
                <article
                  className="tour-card"
                  aria-label={item.title}
                  onMouseEnter={() => setHoveredCardId(item.id)}
                  onMouseLeave={() =>
                    setHoveredCardId((currentId) =>
                      currentId === item.id ? null : currentId
                    )
                  }
                >
                  <div className="tour-card-media">
                    <img
                      className="tour-card-image"
                      src={item.imageSrc}
                      alt={`${item.title} 전경`}
                      draggable="false"
                      loading="lazy"
                    />
                  </div>

                  <h3 className="tour-card-title">{item.title}</h3>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default TourSection;
