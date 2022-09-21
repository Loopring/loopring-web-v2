import { App } from "./app.js";
import { SplashScreen } from "./splash-screen.js";
import { WinScreen } from "./win-screen.js";
import { useState } from "react";
import "./index.css";
/** @enum {string} */
const GameModes = {
  splash: "splash",
  gameplay: "gameplay",
  win: "win",
};

/**
 * Our root component for the game.
 * Controls what to render.
 */
export const SlayTheWeb = () => {
  const [state, setState] = useState({
    gameMode: GameModes.splash || "splash",
  });
  const handleNewGame = () => {
    setState({ gameMode: GameModes.gameplay });
    // Clear any previous saved game.
    window.history.pushState("", document.title, window.location.pathname);
  };
  const handleWin = () => {
    setState({ gameMode: GameModes.win });
  };
  const handleLoose = () => {
    setState({ gameMode: GameModes.splash });
  };
  return (
    <>
      {state.gameMode === GameModes.splash && (
        <SplashScreen
          onNewGame={handleNewGame()}
          onContinue={handleNewGame()}
        />
      )}
      {state.gameMode === GameModes.gameplay && (
        <App onWin={handleWin()} onLoose={handleLoose()} />
      )}
      {state.gameMode === GameModes.win && (
        <WinScreen onNewGame={handleNewGame()} />
      )}
    </>
  );
};
