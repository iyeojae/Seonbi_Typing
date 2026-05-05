import { useEffect, useState } from "react";
import {
  clearAuthData,
  getAccessToken,
  getCurrentUser,
  getSavedAuthUser,
  saveAuthData,
} from "./api/authApi";
import { clearProblemProgress } from "./api/problemApi";
import HistoryPage from "./components/HistoryPage";
import JourneyPage from "./components/JourneyPage";
import ProblemPage from "./components/ProblemPage";

function App() {
  const [authUser, setAuthUser] = useState(() => getSavedAuthUser());
  const [activeHistoryId, setActiveHistoryId] = useState(null);
  const [isHistoryPageOpen, setIsHistoryPageOpen] = useState(false);
  const isJourneyPageVisible = !activeHistoryId && !isHistoryPageOpen;

  useEffect(() => {
    if (!isJourneyPageVisible || !getAccessToken()) {
      return undefined;
    }

    let isDisposed = false;

    getCurrentUser()
      .then((response) => {
        if (isDisposed) {
          return;
        }

        const nextAuthUser = saveAuthData(response) || response;
        setAuthUser(nextAuthUser);
      })
      .catch(() => {
        if (isDisposed) {
          return;
        }
      });

    return () => {
      isDisposed = true;
    };
  }, [isJourneyPageVisible]);

  function handleLogout() {
    clearAuthData();
    clearProblemProgress();
    setAuthUser(null);
    setActiveHistoryId(null);
    setIsHistoryPageOpen(false);
  }

  function handleExitProblem() {
    setActiveHistoryId(null);
  }

  function handleOpenHistory() {
    setActiveHistoryId(null);
    setIsHistoryPageOpen(true);
  }

  function handleExitHistory() {
    setIsHistoryPageOpen(false);
  }

  if (activeHistoryId) {
    return (
      <ProblemPage
        authUser={authUser}
        historyId={activeHistoryId}
        onExitProblem={handleExitProblem}
        onOpenHistory={handleOpenHistory}
        onLogout={handleLogout}
      />
    );
  }

  if (isHistoryPageOpen) {
    return (
      <HistoryPage
        authUser={authUser}
        onExitHistory={handleExitHistory}
        onOpenHistory={handleOpenHistory}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <JourneyPage
      authUser={authUser}
      onAuthChange={setAuthUser}
      onOpenHistory={handleOpenHistory}
      onLogout={handleLogout}
      onSelectProblem={setActiveHistoryId}
    />
  );
}

export default App;
