import gsap from "../web_modules/gsap.js";
import { useEffect, useState } from "react";

export const SplashScreen = (onNewGame, onContinue) => {
  const [showTutorial, setShowTutorial] = useState(false);
  useEffect(() => {
    gsap.from(".Splash--fadein", { duration: 0.5, autoAlpha: 0, scale: 0.95 });
    gsap.from(".Splash--fadein .Options", {
      delay: 0.2,
      duration: 1,
      y: -20,
      scale: 0.1,
      ease: "bounce",
    });
    gsap.to(".Splash-spoder", { delay: 5, x: 420, y: 60, duration: 3 });
  }, []);
  return (
    <article className="Splash Splash--fadein">
      <h1 style={{ marginTop: "8vh" }}>Slay the Web</h1>
      <h2>A card crawl adventure for you and your browser</h2>
      <img
        className="Splash-spoder"
        src="./images/spoder.png"
        title="Oh hello"
      />
      <ul className="Options">
        {location.hash ? (
          <>
            <li>
              <button autofocus onClick={() => onNewGame}>
                Continue Game
              </button>
            </li>
            <li>
              <button autofocus onClick={() => onNewGame}>
                New Game
              </button>
            </li>
          </>
        ) : (
          <li>
            <button autofocus onClick={() => onNewGame}>
              Play
            </button>
          </li>
        )}
        <li>
          <a className="Button" href="/collection.html">
            Collection
          </a>
        </li>
        <li>
          <button
            onClick={() => setShowTutorial({ showTutorial: !showTutorial })}
          >
            Manual
          </button>
        </li>
      </ul>
      {showTutorial && (
        <div className="Splash-details Article">
          <p>
            <strong>What's going on?</strong>
          </p>
          <p>
            Slay the Web is a single player card game where you fight monsters
            to reach the end of the web. It's a game of planning and knowing
            when to play which card.
          </p>
          <p>
            Every turn you draw 5 cards from your draw pile. Cards cost energy
            to play, and you get 3 energy every turn.
          </p>
          <p>
            Cards can deal damage to monsters, block enemy attacks or make them
            weak or vulnerable. They can heal you and other things. You'll
            figure it out.
          </p>
          <p>Beware, whenever you end your turn, the monsters take turn.</p>
          <p>
            Should you manage to kill the monsters in a room before they end
            you, you'll proceed to the next room. Maybe there will be rewards.
            Can you reach the end?
          </p>
        </div>
      )}
    </article>
  );
};
