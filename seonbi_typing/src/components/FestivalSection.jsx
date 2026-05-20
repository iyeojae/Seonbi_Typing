import { useEffect, useRef, useState } from "react";
import "./FestivalSection.css";

const FESTIVAL_ITEMS = [
  {
    id: "seonbi-culture",
    title: "한국선비 문화축제",
    imageSrc: "https://umq1gm7a8386.edge.naverncp.com/data2/content/image/2026/04/09/.cache/512/20260409500044.jpg",
    linkHref: "https://yctf.or.kr/seonbi/",
  },
  {
    id: "sobaeksan-azalea",
    title: "소백산철쭉제",
    imageSrc: "https://yctf.or.kr/azalea/images/2026/card1.jpg",
    linkHref: "https://yctf.or.kr/azalea/",
  },
  {
    id: "siwon-one",
    title: "시원 (one)축제",
    imageSrc: "https://yctf.or.kr/pg/data/editor/2406/thumb-c8ddebe29bc9f609666a08d95cc42fc6_1718842625_69_365x280.jpg",
    linkHref: "https://yctf.or.kr/sione/",
  },
  {
    id: "museum-bridge",
    title: "무섬외나무다리축제",
    imageSrc: "https://yctf.or.kr/museom/images/2025/mv-img.png?v=1",
    linkHref: "https://yctf.or.kr/museom/",
  },
  {
    id: "market-harvest",
    title: "영주장날 농특산물 대축제",
    imageSrc: "https://yctf.or.kr/aspf/images/2025/mv-img2025.png?v=2",
    linkHref: "https://yctf.or.kr/aspf/",
  },
];

const DECORATIONS = [
  {
    id: "line",
    fileName: "Vector 228.svg",
    className: "festival-decoration--line",
  },
  {
    id: "bloom-right",
    fileName: "Group 335.svg",
    className: "festival-decoration--bloom-right",
    layer: "background",
  },
  {
    id: "cloud",
    fileName: "Group 360.svg",
    className: "festival-decoration--cloud",
  },
  {
    id: "birds",
    fileName: "Group 339.svg",
    className: "festival-decoration--birds",
  },
  {
    id: "star-small",
    fileName: "Star 1.svg",
    className: "festival-decoration--star-small",
  },
  {
    id: "star-large",
    fileName: "Star 2.svg",
    className: "festival-decoration--star-large",
  },
  {
    id: "flower-bottom",
    fileName: "Group 340.svg",
    className: "festival-decoration--flower-bottom",
  },
  {
    id: "leaf-bottom",
    fileName: "Group 362.svg",
    className: "festival-decoration--leaf-bottom",
  },
];

function getFestivalAssetPath(fileName) {
  return encodeURI(`${process.env.PUBLIC_URL}/festival/${fileName}`);
}

function getFestivalLinkProps(linkHref) {
  if (!linkHref) {
    return {};
  }

  if (/^https?:\/\//i.test(linkHref)) {
    return {
      target: "_blank",
      rel: "noreferrer",
    };
  }

  return {};
}

const BACKGROUND_DECORATIONS = DECORATIONS.filter(
  (decoration) => decoration.layer === "background"
);

const FOREGROUND_DECORATIONS = DECORATIONS.filter(
  (decoration) => decoration.layer !== "background"
);

function FestivalSection() {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return undefined;
    }

    if (typeof IntersectionObserver !== "function") {
      setIsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && entry.intersectionRatio <= 0) {
          return;
        }

        setIsVisible(true);
        observer.disconnect();
      },
      {
        threshold: 0.01,
        rootMargin: "0px 0px -5% 0px",
      }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`festival-section ${isVisible ? "is-visible" : ""}`}
      aria-labelledby="festival-section-title"
    >
      <div className="festival-decorations festival-decorations--background" aria-hidden="true">
        {BACKGROUND_DECORATIONS.map((decoration, index) => (
          <img
            key={decoration.id}
            className={`festival-decoration ${decoration.className}`}
            src={getFestivalAssetPath(decoration.fileName)}
            alt=""
            draggable="false"
            style={{ "--festival-order": index + 1 }}
          />
        ))}
      </div>

      <div className="festival-decorations festival-decorations--foreground" aria-hidden="true">
        {FOREGROUND_DECORATIONS.map((decoration, index) => (
          <img
            key={decoration.id}
            className={`festival-decoration ${decoration.className}`}
            src={getFestivalAssetPath(decoration.fileName)}
            alt=""
            draggable="false"
            style={{ "--festival-order": index + 1 }}
          />
        ))}
      </div>

      <div className="festival-section-inner">
        <header className="festival-copy-block">
          <h2 id="festival-section-title" className="festival-title">
            문장 너머의 영주를 만나다
          </h2>

          <p className="festival-description">
            선비 문화와 계절 축제, 그리고 영주의 다양한 이야기 속에서
            <br />
            문장이 태어난 공간을 직접 경험해보세요.
          </p>
        </header>

        <div className="festival-showcase">
          <p className="festival-showcase-label">영주의 축제들</p>

          <ul className="festival-card-grid">
            {FESTIVAL_ITEMS.map((festival, index) => (
              <li
                key={festival.id}
                className="festival-card-item"
                style={{ "--festival-card-order": index + 1 }}
              >
                {(() => {
                  const cardHref = festival.linkHref || festival.imageSrc;
                  const linkProps = getFestivalLinkProps(cardHref);

                  return (
                    <article className="festival-card" aria-label={festival.title}>
                      {cardHref ? (
                        <a
                          className="festival-card-link"
                          href={cardHref}
                          aria-label={`${festival.title} 페이지로 이동`}
                          {...linkProps}
                        >
                          <div className="festival-card-media">
                            {festival.imageSrc ? (
                              <img
                                className="festival-card-image"
                                src={festival.imageSrc}
                                alt={festival.title}
                                draggable="false"
                              />
                            ) : (
                              <div className="festival-card-placeholder" aria-hidden="true" />
                            )}
                          </div>

                          <h3 className="festival-card-title">{festival.title}</h3>
                        </a>
                      ) : (
                        <>
                          <div className="festival-card-media">
                            <div className="festival-card-placeholder" aria-hidden="true" />
                          </div>

                          <h3 className="festival-card-title">{festival.title}</h3>
                        </>
                      )}
                    </article>
                  );
                })()}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default FestivalSection;