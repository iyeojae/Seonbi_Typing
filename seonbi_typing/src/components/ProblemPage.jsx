import { Fragment, useEffect, useState } from "react";
import {
  clearProblemProgress,
  getSavedProblemProgress,
  startProblem,
  submitBlindTypingAnswer,
  submitCopyTypingAnswer,
  submitOrderAnswer,
} from "../api/problemApi";
import HeroTopBar from "./HeroTopBar";
import { HERO_PATH } from "./heroUi";
import "./ProblemPage.css";

const PROB_PATH = `${process.env.PUBLIC_URL}/prob`;
const MAP_PATH = `${process.env.PUBLIC_URL}/map`;
const EMPTY_INTRO_LINES = ["", "", ""];
const INTRO_LINE_COUNT = 3;
const INTRO_LETTER_REVEAL_DELAY = 52;
const INTRO_LINE_REVEAL_DELAY = 420;
const BUBBLE_REVEAL_DELAY = 36;
const GENERIC_ORDER_INCORRECT = "흠, 단어의 자리가 아직 흐트러졌구나. 다시 차근차근 맞춰 보거라.";
const GENERIC_ORDER_CORRECT = "옳다. 문장의 호흡을 반듯하게 잘 세웠구나.";
const GENERIC_COPY_INCORRECT = "띄어쓰기와 문장 부호를 다시 한 번 가다듬어 보거라.";
const GENERIC_COPY_CORRECT = "좋다. 훈장님이 준 문장을 또렷하게 잘 옮겨 적었구나.";
const GENERIC_BLIND_INCORRECT = "아직 뜻풀이의 결이 조금 어긋났구나. 다시 한 번 차분히 생각해 보거라.";
const GENERIC_BLIND_CORRECT = "좋다. 뜻을 네 것으로 잘 풀어냈구나. 이제 지도로 돌아가 보거라.";
const ALREADY_SOLVED_NOTICE = "이미 푼 문제는 다시 풀 수 없습니다.";

const STONE_DECORATIONS = [
  { file: "stone1.svg", className: "problem-stone problem-stone--top-right" },
  { file: "stone2.svg", className: "problem-stone problem-stone--mid-right" },
  { file: "stone3.svg", className: "problem-stone problem-stone--bottom-left" },
  { file: "stone4.svg", className: "problem-stone problem-stone--bottom-right" },
];

function getProblemCharacterSrc(mood) {
  if (mood === "uncorrect") {
    return `${PROB_PATH}/uncorrect_hoonjang.svg`;
  }

  if (mood === "angry") {
    return `${PROB_PATH}/angry_hoonjang.svg`;
  }

  if (mood === "relax") {
    return `${PROB_PATH}/relax_hoonjang.svg`;
  }

  return `${HERO_PATH}/hoonjang-character.svg`;
}

function buildSentence(words) {
  return words.join(" ").replace(/\s+([,.!?])/g, "$1").trim();
}

function normalizeSentence(value) {
  return value.replace(/\s+/g, " ").trim();
}

function getIntroThirdLine(readingText) {
  if (!readingText) {
    return "이제 차근차근 풀어 보거라.";
  }

  return `이 글의 음은 ${readingText} 이니라. 이제 차근차근 풀어 보거라.`;
}

function getResponseMessage(response, fallbackMessage) {
  if (typeof response?.gptReason === "string" && response.gptReason.trim()) {
    return response.gptReason.trim();
  }

  if (typeof response?.gptCorrect === "string" && response.gptCorrect.trim()) {
    return response.gptCorrect.trim();
  }

  return fallbackMessage;
}

function isBlindStageSolved(response) {
  return Boolean(
    response?.completed || response?.nextStep === "COMPLETED" || response?.gptCorrect === true
  );
}

function isAlreadyCompletedProblemError(message) {
  if (typeof message !== "string") {
    return false;
  }

  const normalizedMessage = message.trim().toLowerCase();
  return normalizedMessage.includes("already completed");
}

function ProblemPage({ historyId, onExitProblem }) {
  const cachedProblem = getSavedProblemProgress(historyId);
  const [problemData, setProblemData] = useState(() => cachedProblem);
  const [loadState, setLoadState] = useState(() => (cachedProblem ? "ready" : "loading"));
  const [loadError, setLoadError] = useState("");
  const [revealedLines, setRevealedLines] = useState(EMPTY_INTRO_LINES);
  const [activeLineIndex, setActiveLineIndex] = useState(0);
  const [problemPhase, setProblemPhase] = useState("intro");
  const [arrangedWordIndexes, setArrangedWordIndexes] = useState([]);
  const [draggedWordIndex, setDraggedWordIndex] = useState(null);
  const [activeDropIndex, setActiveDropIndex] = useState(null);
  const [isBankDropActive, setIsBankDropActive] = useState(false);
  const [isAlreadySolvedError, setIsAlreadySolvedError] = useState(false);
  const [copyInput, setCopyInput] = useState("");
  const [blindInput, setBlindInput] = useState("");
  const [phaseMessageTarget, setPhaseMessageTarget] = useState("");
  const [phaseMessageText, setPhaseMessageText] = useState("");
  const [phaseMessageTone, setPhaseMessageTone] = useState("guide");
  const [canAdvancePhase, setCanAdvancePhase] = useState(false);
  const [pendingNextStep, setPendingNextStep] = useState(null);
  const [characterMood, setCharacterMood] = useState("normal");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const originalText = problemData?.originalText || "";
  const readingText = problemData?.readingText || "";
  const meaning = problemData?.meaning || "";
  const shuffledWords = Array.isArray(problemData?.shuffledWords) ? problemData.shuffledWords : [];
  const introLine1 = originalText;
  const introLine2 = meaning;
  const introLine3 = getIntroThirdLine(readingText);
  const orderGuideLine = originalText;
  const copyGuideLine = `${meaning} 이제는 그냥 치지 말고 한 글자 한 글자 새기면서 입력해 보거라.`;
  const blindGuideLine = `${originalText} 이제는 외운 대로 베끼지 말고, 뜻을 이해한 대로 적어 보거라.`;
  const isIntroPhase = problemPhase === "intro";
  const isOrderPhase = problemPhase === "ORDER";
  const isCopyPhase = problemPhase === "COPY_TYPING";
  const isBlindPhase = problemPhase === "BLIND_TYPING";
  const isIntroComplete = activeLineIndex >= INTRO_LINE_COUNT;
  const isPhaseMessageTyping =
    !isIntroPhase &&
    phaseMessageTarget.length > 0 &&
    phaseMessageText.length < phaseMessageTarget.length;
  const arrangedWords = arrangedWordIndexes
    .map((index) => shuffledWords[index])
    .filter((word) => typeof word === "string" && word.length > 0);
  const availableWordIndexes = shuffledWords.reduce((indexes, _, index) => {
    if (!arrangedWordIndexes.includes(index)) {
      indexes.push(index);
    }

    return indexes;
  }, []);
  const currentGuideLine = isOrderPhase
    ? orderGuideLine
    : isCopyPhase
      ? copyGuideLine
      : blindGuideLine;
  const isPhasePanelReady =
    !isIntroPhase && (phaseMessageTone !== "guide" || phaseMessageText === currentGuideLine);
  const arrangedSentence = buildSentence(arrangedWords);
  const currentBubbleToneClassName =
    phaseMessageTone === "positive"
      ? "is-positive"
      : phaseMessageTone === "warning"
        ? "is-warning"
        : "";
  const primaryButtonLabel = isIntroPhase ? "다음" : canAdvancePhase ? "다음" : "제출";
  const isPrimaryButtonDisabled = loadState !== "ready"
    ? true
    : isIntroPhase
      ? !isIntroComplete
      : canAdvancePhase
        ? isPhaseMessageTyping
        : isOrderPhase
          ? arrangedWordIndexes.length !== shuffledWords.length || isSubmitting || isPhaseMessageTyping
          : isCopyPhase
            ? !copyInput.trim() || isSubmitting || isPhaseMessageTyping
            : !blindInput.trim() || isSubmitting || isPhaseMessageTyping;

  useEffect(() => {
    const savedProgress = getSavedProblemProgress(historyId);

    if (savedProgress) {
      setProblemData(savedProgress);
      setLoadState("ready");
    } else {
      setProblemData(null);
      setLoadState("loading");
    }

    setLoadError("");
      setIsAlreadySolvedError(false);

    let isDisposed = false;

    startProblem(historyId)
      .then((response) => {
        if (isDisposed) {
          return;
        }

        setProblemData(response);
        setIsAlreadySolvedError(false);
        setLoadState("ready");
      })
      .catch((error) => {
        if (isDisposed) {
          return;
        }

        if (savedProgress) {
          setProblemData(savedProgress);
          setLoadState("ready");
          return;
        }

        const nextMessage = error.message || "문제를 불러오지 못했습니다.";
        const isSolvedError = isAlreadyCompletedProblemError(nextMessage);

        setLoadError(isSolvedError ? ALREADY_SOLVED_NOTICE : nextMessage);
        setIsAlreadySolvedError(isSolvedError);
        setLoadState("error");
      });

    return () => {
      isDisposed = true;
    };
  }, [historyId]);

  useEffect(() => {
    if (!problemData) {
      return;
    }

    setRevealedLines(EMPTY_INTRO_LINES);
    setActiveLineIndex(0);
    setProblemPhase("intro");
    setArrangedWordIndexes([]);
    setDraggedWordIndex(null);
    setActiveDropIndex(null);
    setIsBankDropActive(false);
    setCopyInput("");
    setBlindInput("");
    setPhaseMessageTarget("");
    setPhaseMessageText("");
    setPhaseMessageTone("guide");
    setCanAdvancePhase(false);
    setPendingNextStep(null);
    setCharacterMood("normal");
    setIsSubmitting(false);
  }, [problemData]);

  useEffect(() => {
    if (!isIntroPhase || activeLineIndex >= INTRO_LINE_COUNT) {
      return undefined;
    }

    const currentLine =
      activeLineIndex === 0 ? introLine1 : activeLineIndex === 1 ? introLine2 : introLine3;
    const currentText = revealedLines[activeLineIndex];
    const timeoutId = window.setTimeout(() => {
      if (currentText.length < currentLine.length) {
        setRevealedLines((prev) => {
          const next = [...prev];
          next[activeLineIndex] = currentLine.slice(0, currentText.length + 1);
          return next;
        });
        return;
      }

      setActiveLineIndex((prev) => prev + 1);
    }, currentText.length < currentLine.length ? INTRO_LETTER_REVEAL_DELAY : INTRO_LINE_REVEAL_DELAY);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [activeLineIndex, introLine1, introLine2, introLine3, isIntroPhase, revealedLines]);

  useEffect(() => {
    if (isIntroPhase || !phaseMessageTarget || phaseMessageText.length >= phaseMessageTarget.length) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setPhaseMessageText(phaseMessageTarget.slice(0, phaseMessageText.length + 1));
    }, BUBBLE_REVEAL_DELAY);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isIntroPhase, phaseMessageTarget, phaseMessageText]);

  useEffect(() => {
    if (isIntroPhase || phaseMessageTone !== "warning" || isPhaseMessageTyping) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setCharacterMood("normal");
    }, 320);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isIntroPhase, isPhaseMessageTyping, phaseMessageTone]);

  function showGuideMessage(nextPhase, guideLine) {
    setProblemPhase(nextPhase);
    setPhaseMessageTone("guide");
    setPhaseMessageTarget(guideLine);
    setPhaseMessageText("");
    setCanAdvancePhase(false);
    setPendingNextStep(null);
    setCharacterMood("normal");
    setIsSubmitting(false);
  }

  function handleStartOrderPhase() {
    setArrangedWordIndexes([]);
    setDraggedWordIndex(null);
    setActiveDropIndex(null);
    setIsBankDropActive(false);
    showGuideMessage("ORDER", orderGuideLine);
  }

  function handleStartCopyPhase() {
    setCopyInput("");
    showGuideMessage("COPY_TYPING", copyGuideLine);
  }

  function handleStartBlindPhase() {
    setBlindInput("");
    showGuideMessage("BLIND_TYPING", blindGuideLine);
  }

  function clearArrangeDragState() {
    setDraggedWordIndex(null);
    setActiveDropIndex(null);
    setIsBankDropActive(false);
  }

  function restoreOrderGuideState() {
    if (canAdvancePhase) {
      return;
    }

    setPhaseMessageTone("guide");
    setPhaseMessageTarget(orderGuideLine);
    setPhaseMessageText(orderGuideLine);
    setCharacterMood("normal");
  }

  function handleArrangeWordDragStart(event, wordIndex) {
    if (!isOrderPhase || isSubmitting || canAdvancePhase) {
      event.preventDefault();
      return;
    }

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(wordIndex));
    setDraggedWordIndex(wordIndex);
  }

  function handleArrangeWordDragEnd() {
    clearArrangeDragState();
  }

  function moveWordToDropIndex(wordIndex, dropIndex) {
    setArrangedWordIndexes((prev) => {
      const currentIndex = prev.indexOf(wordIndex);
      const next = currentIndex === -1 ? [...prev] : prev.filter((index) => index !== wordIndex);
      const adjustedDropIndex = currentIndex !== -1 && currentIndex < dropIndex
        ? dropIndex - 1
        : dropIndex;
      const normalizedDropIndex = Math.max(0, Math.min(adjustedDropIndex, next.length));

      next.splice(normalizedDropIndex, 0, wordIndex);
      return next;
    });

    restoreOrderGuideState();
  }

  function removeWordFromArrangement(wordIndex) {
    setArrangedWordIndexes((prev) => prev.filter((index) => index !== wordIndex));
    restoreOrderGuideState();
  }

  function handleArrangeDropZoneDragOver(event, dropIndex) {
    if (!isOrderPhase || isSubmitting || canAdvancePhase) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";

    if (activeDropIndex !== dropIndex) {
      setActiveDropIndex(dropIndex);
    }
  }

  function handleArrangeDrop(event, dropIndex) {
    if (!isOrderPhase || isSubmitting || canAdvancePhase) {
      return;
    }

    event.preventDefault();
    const droppedWordIndex = Number.parseInt(event.dataTransfer.getData("text/plain"), 10);
    const nextWordIndex = Number.isInteger(droppedWordIndex) ? droppedWordIndex : draggedWordIndex;

    if (Number.isInteger(nextWordIndex)) {
      moveWordToDropIndex(nextWordIndex, dropIndex);
    }

    clearArrangeDragState();
  }

  function getCardDropIndex(event, arrangedIndex) {
    const rect = event.currentTarget.getBoundingClientRect();
    const pointerX = event.clientX - rect.left;

    return pointerX >= rect.width / 2 ? arrangedIndex + 1 : arrangedIndex;
  }

  function handleArrangeCardDragOver(event, arrangedIndex) {
    if (!isOrderPhase || isSubmitting || canAdvancePhase) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "move";
    setActiveDropIndex(getCardDropIndex(event, arrangedIndex));
    setIsBankDropActive(false);
  }

  function handleArrangeCardDrop(event, arrangedIndex) {
    if (!isOrderPhase || isSubmitting || canAdvancePhase) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    const droppedWordIndex = Number.parseInt(event.dataTransfer.getData("text/plain"), 10);
    const nextWordIndex = Number.isInteger(droppedWordIndex) ? droppedWordIndex : draggedWordIndex;

    if (Number.isInteger(nextWordIndex)) {
      moveWordToDropIndex(nextWordIndex, getCardDropIndex(event, arrangedIndex));
    }

    clearArrangeDragState();
  }

  function handleArrangeSequenceDragOver(event) {
    if (!isOrderPhase || isSubmitting || canAdvancePhase || event.target !== event.currentTarget) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setActiveDropIndex(arrangedWordIndexes.length);
    setIsBankDropActive(false);
  }

  function handleArrangeSequenceDrop(event) {
    if (!isOrderPhase || isSubmitting || canAdvancePhase || event.target !== event.currentTarget) {
      return;
    }

    event.preventDefault();
    const droppedWordIndex = Number.parseInt(event.dataTransfer.getData("text/plain"), 10);
    const nextWordIndex = Number.isInteger(droppedWordIndex) ? droppedWordIndex : draggedWordIndex;

    if (Number.isInteger(nextWordIndex)) {
      moveWordToDropIndex(nextWordIndex, arrangedWordIndexes.length);
    }

    clearArrangeDragState();
  }

  function handleArrangeBankDragOver(event) {
    if (!isOrderPhase || isSubmitting || canAdvancePhase) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setIsBankDropActive(true);
    setActiveDropIndex(null);
  }

  function handleArrangeBankDrop(event) {
    if (!isOrderPhase || isSubmitting || canAdvancePhase) {
      return;
    }

    event.preventDefault();
    const droppedWordIndex = Number.parseInt(event.dataTransfer.getData("text/plain"), 10);
    const nextWordIndex = Number.isInteger(droppedWordIndex) ? droppedWordIndex : draggedWordIndex;

    if (Number.isInteger(nextWordIndex) && arrangedWordIndexes.includes(nextWordIndex)) {
      removeWordFromArrangement(nextWordIndex);
    }

    clearArrangeDragState();
  }

  function handleCopyInputChange(event) {
    setCopyInput(event.target.value);
  }

  function handleResetCopy() {
    setCopyInput("");
  }

  function handleBlindInputChange(event) {
    setBlindInput(event.target.value);
  }

  function handleResetBlind() {
    setBlindInput("");
  }

  async function handleOrderSubmit() {
    if (!problemData?.problemId) {
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await submitOrderAnswer(problemData.problemId, arrangedSentence);
      const isSuccess = Boolean(response?.correct);

      setPhaseMessageTone(isSuccess ? "positive" : "warning");
      setPhaseMessageTarget(
        getResponseMessage(
          response,
          isSuccess ? GENERIC_ORDER_CORRECT : GENERIC_ORDER_INCORRECT
        )
      );
      setPhaseMessageText("");
      setCanAdvancePhase(isSuccess);
      setPendingNextStep(isSuccess ? response?.nextStep || "COPY_TYPING" : null);
      setCharacterMood(isSuccess ? "relax" : "angry");
    } catch (error) {
      setPhaseMessageTone("warning");
      setPhaseMessageTarget(error.message || GENERIC_ORDER_INCORRECT);
      setPhaseMessageText("");
      setCanAdvancePhase(false);
      setPendingNextStep(null);
      setCharacterMood("angry");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCopySubmit() {
    if (!problemData?.problemId) {
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await submitCopyTypingAnswer(
        problemData.problemId,
        normalizeSentence(copyInput)
      );
      const isSuccess = Boolean(response?.correct);

      setPhaseMessageTone(isSuccess ? "positive" : "warning");
      setPhaseMessageTarget(
        getResponseMessage(
          response,
          isSuccess ? GENERIC_COPY_CORRECT : GENERIC_COPY_INCORRECT
        )
      );
      setPhaseMessageText("");
      setCanAdvancePhase(isSuccess);
      setPendingNextStep(isSuccess ? response?.nextStep || "BLIND_TYPING" : null);
      setCharacterMood(isSuccess ? "relax" : "angry");
    } catch (error) {
      setPhaseMessageTone("warning");
      setPhaseMessageTarget(error.message || GENERIC_COPY_INCORRECT);
      setPhaseMessageText("");
      setCanAdvancePhase(false);
      setPendingNextStep(null);
      setCharacterMood("angry");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleBlindSubmit() {
    if (!problemData?.problemId) {
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await submitBlindTypingAnswer(
        problemData.problemId,
        normalizeSentence(blindInput)
      );
      const isSuccess = isBlindStageSolved(response);

      setPhaseMessageTone(isSuccess ? "positive" : "warning");
      setPhaseMessageTarget(
        getResponseMessage(
          response,
          isSuccess ? GENERIC_BLIND_CORRECT : GENERIC_BLIND_INCORRECT
        )
      );
      setPhaseMessageText("");
      setCanAdvancePhase(isSuccess);
      setPendingNextStep(isSuccess ? response?.nextStep || "COMPLETED" : null);
      setCharacterMood(isSuccess ? "relax" : "angry");

      if (isSuccess) {
        clearProblemProgress();
      }
    } catch (error) {
      setPhaseMessageTone("warning");
      setPhaseMessageTarget(error.message || GENERIC_BLIND_INCORRECT);
      setPhaseMessageText("");
      setCanAdvancePhase(false);
      setPendingNextStep(null);
      setCharacterMood("angry");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handlePrimaryAction() {
    if (isIntroPhase) {
      handleStartOrderPhase();
      return;
    }

    if (canAdvancePhase) {
      if (pendingNextStep === "COPY_TYPING") {
        handleStartCopyPhase();
        return;
      }

      if (pendingNextStep === "BLIND_TYPING") {
        handleStartBlindPhase();
        return;
      }

      onExitProblem?.();
      return;
    }

    if (isOrderPhase) {
      handleOrderSubmit();
      return;
    }

    if (isCopyPhase) {
      handleCopySubmit();
      return;
    }

    handleBlindSubmit();
  }

  return (
    <main
      className="problem-page"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/assets/paper-texture.png)`,
      }}
    >
      <div className="problem-logo-bar">
        <HeroTopBar onLogoClick={onExitProblem} showLoginTrigger={false} variant="compact" />
      </div>

      <section className="problem-stage" aria-label={`${historyId}단계 학습 문제`}>
        <div className="problem-copy-block">
          <span className="problem-step-chip">
            {problemData?.reviewMode ? `${historyId}단계 복습` : `${historyId}단계`}
          </span>
          <h1 className={`problem-heading ${isIntroPhase ? "is-intro" : ""}`}>
            {isIntroPhase
              ? "훈장님 말씀을 차근차근 새겨 보거라"
              : isOrderPhase
                ? "훈장님 말씀을 올바른 문장으로 이어 보거라"
                : isCopyPhase
                  ? "훈장님 문장을 보고 한 글자씩 새겨 적어 보거라"
                  : "이제는 한자만 보고 네가 이해한 뜻을 적어 보거라"}
          </h1>
        </div>

        {loadState === "loading" && !problemData ? (
          <div className="problem-typing-panel">
            <p className="problem-typing-caption">
              훈장님이 문제를 가져오고 있느니 잠시만 기다리거라.
            </p>
          </div>
        ) : loadState === "error" ? (
          <div className="problem-typing-panel">
            {isAlreadySolvedError ? (
              <div className="problem-notice-card" role="alert" aria-live="assertive">
                <img
                  className="problem-notice-card-image"
                  src={`${MAP_PATH}/already-prob.png`}
                  alt=""
                  aria-hidden="true"
                  draggable="false"
                />

                <div className="problem-notice-card-content">
                  <p className="problem-notice-card-message">{loadError}</p>

                  <button
                    type="button"
                    className="problem-notice-card-button"
                    onClick={onExitProblem}
                  >
                    지도로 돌아가기
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="problem-typing-caption">{loadError || "문제를 불러오지 못했느니라."}</p>

                <div className="problem-arrange-actions">
                  <button type="button" className="problem-reset-button" onClick={onExitProblem}>
                    지도로 돌아가기
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            <div className={`problem-scene ${!isIntroPhase ? "is-arrange-phase" : ""}`}>
              <div className="problem-character-column">
                <img
                  className={`problem-character ${!isIntroPhase ? `is-${characterMood}` : ""}`}
                  src={!isIntroPhase ? getProblemCharacterSrc(characterMood) : `${HERO_PATH}/hoonjang-character.svg`}
                  alt="훈장님 캐릭터"
                  draggable="false"
                />
              </div>

              <div
                className={`problem-dialogue-stack ${!isIntroPhase ? "problem-dialogue-stack--single" : ""}`}
                aria-live="polite"
              >
                {isIntroPhase ? (
                  EMPTY_INTRO_LINES.map((_, index) => {
                    const isVisible = index < activeLineIndex || revealedLines[index].length > 0;
                    const isTyping = index === activeLineIndex && !isIntroComplete;

                    return (
                      <div
                        key={`${historyId}-dialogue-${index + 1}`}
                        className={`problem-dialogue-bubble problem-dialogue-bubble--${index + 1} ${
                          isVisible ? "is-visible" : "is-hidden"
                        } ${isTyping ? "is-typing" : ""}`}
                      >
                        <p className="problem-dialogue-text">
                          {revealedLines[index] || "\u00A0"}
                          {isTyping && (
                            <span className="problem-dialogue-cursor" aria-hidden="true" />
                          )}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div
                    className={`problem-dialogue-bubble problem-dialogue-bubble--arrange problem-dialogue-bubble--typing ${currentBubbleToneClassName}`}
                  >
                    <p className="problem-dialogue-text problem-dialogue-text--arrange problem-dialogue-text--typing">
                      {phaseMessageText || "\u00A0"}
                      {isPhaseMessageTyping && (
                        <span className="problem-dialogue-cursor" aria-hidden="true" />
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {isOrderPhase && isPhasePanelReady && (
              <div className="problem-arrange-panel">
                <p className="problem-arrange-caption">
                  제시된 단어 카드를 끌어와 순서를 맞추고, 사이에 놓아 자리를 바꾸어 보거라.
                </p>

                <div className="problem-arrange-sentence" aria-live="polite">
                  <div
                    className={`problem-arrange-fill problem-arrange-fill--full ${
                      arrangedWordIndexes.length > 0 ? "has-content" : "is-empty"
                    }`}
                    onDragLeave={() => setActiveDropIndex(null)}
                  >
                    <div
                      className="problem-arrange-card-sequence"
                      role="list"
                      aria-label="완성 중인 문장"
                      onDragOver={handleArrangeSequenceDragOver}
                      onDrop={handleArrangeSequenceDrop}
                    >
                      <div
                        className={`problem-arrange-drop-slot ${activeDropIndex === 0 ? "is-active" : ""} ${
                          arrangedWordIndexes.length === 0 ? "is-empty" : ""
                        }`}
                        onDragOver={(event) => handleArrangeDropZoneDragOver(event, 0)}
                        onDrop={(event) => handleArrangeDrop(event, 0)}
                        aria-label="첫 단어 위치"
                      >
                        {arrangedWordIndexes.length === 0 && (
                          <span className="problem-arrange-placeholder">
                            단어 카드를 이곳으로 끌어와 문장을 완성해 보거라
                          </span>
                        )}
                      </div>

                      {arrangedWordIndexes.map((wordIndex, index) => (
                        <Fragment key={`${problemData.problemId}-arranged-${wordIndex}`}> 
                          <button
                            type="button"
                            className={`problem-word-card ${draggedWordIndex === wordIndex ? "is-dragging" : ""}`}
                            draggable={!isSubmitting && !canAdvancePhase}
                            onDragStart={(event) => handleArrangeWordDragStart(event, wordIndex)}
                            onDragEnd={handleArrangeWordDragEnd}
                            onDragOver={(event) => handleArrangeCardDragOver(event, index)}
                            onDrop={(event) => handleArrangeCardDrop(event, index)}
                            aria-label={`${shuffledWords[wordIndex]} 단어 카드`}
                          >
                            {shuffledWords[wordIndex]}
                          </button>

                          <div
                            className={`problem-arrange-drop-slot ${
                              activeDropIndex === index + 1 ? "is-active" : ""
                            }`}
                            onDragOver={(event) => handleArrangeDropZoneDragOver(event, index + 1)}
                            onDrop={(event) => handleArrangeDrop(event, index + 1)}
                            aria-label={`${index + 2}번째 단어 위치`}
                          />
                        </Fragment>
                      ))}
                    </div>
                  </div>
                </div>

                <div
                  className={`problem-arrange-bank ${isBankDropActive ? "is-drop-active" : ""}`}
                  aria-label="단어 선택지"
                  onDragOver={handleArrangeBankDragOver}
                  onDragLeave={() => setIsBankDropActive(false)}
                  onDrop={handleArrangeBankDrop}
                >
                  {availableWordIndexes.length > 0 ? (
                    availableWordIndexes.map((index) => (
                      <button
                        key={`${problemData.problemId}-word-${index + 1}`}
                        type="button"
                        className="problem-word-button"
                        draggable={!isSubmitting && !canAdvancePhase}
                        onDragStart={(event) => handleArrangeWordDragStart(event, index)}
                        onDragEnd={handleArrangeWordDragEnd}
                        disabled={isSubmitting || canAdvancePhase}
                      >
                        {shuffledWords[index]}
                      </button>
                    ))
                  ) : (
                    <p className="problem-arrange-bank-empty">
                      모든 단어를 올려두었구나. 순서를 바꾸려면 카드를 다시 끌어 사이에 놓아 보거라.
                    </p>
                  )}
                </div>
              </div>
            )}

            {isCopyPhase && isPhasePanelReady && (
              <div className="problem-typing-panel">
                <p className="problem-typing-caption">
                  말풍선을 보며 문장을 그대로 천천히 새겨 적어 보거라.
                </p>

                <label className="problem-typing-field">
                  <span className="problem-typing-label">문장 입력</span>
                  <textarea
                    className="problem-typing-input"
                    value={copyInput}
                    onChange={handleCopyInputChange}
                    placeholder="여기에 훈장님 문장을 또박또박 입력해 보거라."
                    rows={4}
                    spellCheck={false}
                    disabled={isSubmitting || canAdvancePhase}
                  />
                </label>

                <div className="problem-typing-actions">
                  <p className={`problem-typing-status ${canAdvancePhase ? "is-correct" : ""}`}>
                    {copyInput.trim().length === 0
                      ? "말풍선을 보고 문장을 차분히 입력해 보거라."
                      : canAdvancePhase
                        ? "좋다. 훈장님 말씀이 끝나면 다음으로 가 보거라."
                        : "띄어쓰기와 문장 부호까지 반듯하게 적어 보거라."}
                  </p>

                  <button
                    type="button"
                    className="problem-reset-button problem-reset-button--typing"
                    onClick={handleResetCopy}
                    disabled={copyInput.length === 0 || isSubmitting || canAdvancePhase}
                  >
                    다시 쓰기
                  </button>
                </div>
              </div>
            )}

            {isBlindPhase && isPhasePanelReady && (
              <div className="problem-typing-panel">
                <p className="problem-typing-caption">
                  한자만 보고 굳이 외운 문장을 베끼지 말고, 네가 이해한 대로 적어 보거라.
                </p>

                <label className="problem-typing-field">
                  <span className="problem-typing-label">이해한 뜻 입력</span>
                  <textarea
                    className="problem-typing-input"
                    value={blindInput}
                    onChange={handleBlindInputChange}
                    placeholder="한자를 보고 네가 이해한 뜻을 자유롭게 적어 보거라."
                    rows={4}
                    spellCheck={false}
                    disabled={isSubmitting || canAdvancePhase}
                  />
                </label>

                <div className="problem-typing-actions">
                  <p className={`problem-typing-status ${canAdvancePhase ? "is-correct" : ""}`}>
                    {blindInput.trim().length === 0
                      ? "한자를 보고 떠오른 뜻을 네 말로 적어 보거라."
                      : canAdvancePhase
                        ? "좋다. 훈장님 말씀이 끝나면 지도로 돌아가 보거라."
                        : "훈장님이 네 풀이를 살펴보고 계신다. 뜻을 붙잡고 다시 가다듬어 보거라."}
                  </p>

                  <button
                    type="button"
                    className="problem-reset-button problem-reset-button--typing"
                    onClick={handleResetBlind}
                    disabled={blindInput.length === 0 || isSubmitting || canAdvancePhase}
                  >
                    다시 쓰기
                  </button>
                </div>
              </div>
            )}

            <div className="problem-primary-action-bar">
              <button
                type="button"
                className="problem-next-button"
                onClick={handlePrimaryAction}
                disabled={isPrimaryButtonDisabled}
              >
                {primaryButtonLabel}
              </button>
            </div>

            {STONE_DECORATIONS.map((stone) => (
              <img
                key={stone.file}
                className={stone.className}
                src={`${PROB_PATH}/${stone.file}`}
                alt=""
                aria-hidden="true"
                draggable="false"
              />
            ))}
          </>
        )}
      </section>
    </main>
  );
}

export default ProblemPage;