import gsap from "./animations.js";
// @ts-ignore
import { Flip } from "../web_modules/gsap/Flip.js";

//import Flip from 'https://slaytheweb-assets.netlify.app/gsap/Flip.js'

// Game logic
import createNewGame from "../game/new-game.js";
import { createCard, getCardRewards } from "../game/cards.js";
import {
  getCurrRoom,
  isCurrRoomCompleted,
  isDungeonCompleted,
} from "../game/utils-state.js";
import * as backend from "../game/backend.js";

// UI Components
import Cards from "./cards.js";
import Map from "./map.js";
import { Overlay, OverlayWithButton } from "./overlays.js";
import { Player, Monster } from "./player.js";
import CardChooser from "./card-chooser.js";
import CampfireRoom from "./campfire.js";
import Menu from "./menu.js";
import StartRoom from "./start-room.js";
import DungeonStats from "./dungeon-stats.js";
import enableDragDrop from "./dragdrop.js";

// Temporary hack to disabled sounds without touching game code.
import realSfx from "./sounds.js";
import { useEffect, useState } from "react";
const sfx = {};
Object.keys(realSfx).forEach((key) => {
  sfx[key] = () => null;
});

const load = () =>
  JSON.parse(decodeURIComponent(window.location.hash.split("#")[1]));

export const App = () => {
  const base = undefined;
  const [state, setState] = useState({});
  const game = {};
  const overlayIndex = 11;

  useEffect(() => {
    // Set up a new game
    const game = createNewGame();
    setState(game.state, dealCards);

    sfx.startGame();

    // If there is a saved game state, use it.
    const savedGameState = window.location.hash && load();
    if (savedGameState) {
      game.state = savedGameState;
      setState(savedGameState, dealCards);
    }

    enableConsole();
  });

  const enableConsole = () => {
    // Enable a "console" in the browser.
    console.log(`Welcome to the Slay The Web Console. Some examples:
stw.game.state.player.maxHealth = 999; stw.update()
stw.game.enqueue({type: 'drawCards', amount: 2})
stw.update()
stw.dealCards()`);
    // @ts-ignore
    window.stw = {
      game: game,
      update: update.bind(this),
      createCard,
      dealCards: dealCards.bind(this),
      iddqd() {
        // console.log(game.state)
        game.enqueue({ type: "iddqd" });
        update(() => {
          // console.log(game.state)
        });
      },
      getRuns() {
        return backend.getRuns();
      },
      postRun() {
        return backend.postRun(game);
      },
    };
  };
  const update = (callback) => {
    game.dequeue();
    setState(game.state, callback);
  };
  const undo = () => {
    game.undo();
    setState(game.state, dealCards);
  };
  /**
   * Plays a card while juggling DOM animations and set state.
   * @param {string} cardId
   * @param {string} target
   * @param {HTMLElement} cardElement
   */
  const playCard = (cardId, target, cardElement) => {
    // Play the card.
    const card = state.hand.find((c) => c.id === cardId);
    game.enqueue({ type: "playCard", card, target });

    const supportsFlip = typeof Flip !== "undefined";
    let flip;

    // For the hand animation later.
    if (supportsFlip) flip = Flip.getState(".Hand .Card");

    // Create a clone on top of the card to animate.
    const clone = cardElement.cloneNode(true);
    base.appendChild(clone);
    if (supportsFlip) Flip.fit(clone, cardElement, { absolute: true });

    // Update state and re-enable dragdrop
    update(() => {
      enableDragDrop(base, playCard);

      sfx.playCard({ card, target });

      // Animate cloned card away
      gsap.effects.playCard(clone).then(() => {
        clone.parentNode.removeChild(clone);
      });

      // Reposition hand
      if (supportsFlip) {
        Flip.from(flip, {
          duration: 0.3,
          ease: "power3.inOut",
          absolute: true,
        });
      }
    });
  };
  const endTurn = () => {
    sfx.endTurn();
    gsap.effects.discardHand(".Hand .Card", {
      onComplete: reallyEndTurn.bind(this),
    });
    function reallyEndTurn() {
      game.enqueue({ type: "endTurn" });
      update(dealCards);
    }
  };
  // Animate the cards in and make sure any new cards are draggable.
  const dealCards = () => {
    gsap.effects.dealCards(".Hand .Card");
    sfx.startTurn();
    enableDragDrop(base, playCard);
  };
  const toggleOverlay = (el) => {
    if (typeof el === "string") el = base.querySelector(el);
    el.toggleAttribute("open");
    el.style.zIndex = overlayIndex;
    overlayIndex++;
  };
  const handleShortcuts = (event) => {
    const { key } = event;
    const keymap = {
      e: () => endTurn(),
      u: () => undo(),
      Escape: () => {
        // let openOverlays = base.querySelectorAll('.Overlay:not(#Menu)[open]')
        let openOverlays = base.querySelectorAll(
          "#Deck[open], #DrawPile[open], #DiscardPile[open], #Map[open]"
        );
        openOverlays.forEach((el) => el.removeAttribute("open"));
        toggleOverlay("#Menu");
      },
      d: () => toggleOverlay("#Deck"),
      a: () => toggleOverlay("#DrawPile"),
      s: () => toggleOverlay("#DiscardPile"),
      m: () => toggleOverlay("#Map"),
    };
    keymap[key] && keymap[key]();
  };
  const handlePlayerReward = (choice, card) => {
    game.enqueue({ type: "addCardToDeck", card });
    setState({ didPickCard: card });
    update();
  };
  const handleCampfireChoice = (choice, reward) => {
    // Depending on the choice, run an action.
    if (choice === "rest") {
      reward = Math.floor(game.state.player.maxHealth * 0.3);
      game.enqueue({
        type: "addHealth",
        target: "player",
        amount: reward,
      });
    }
    if (choice === "upgradeCard") {
      game.enqueue({ type: "upgradeCard", card: reward });
    }
    if (choice === "removeCard") {
      game.enqueue({ type: "removeCard", card: reward });
    }
    // Store the result.
    game.enqueue({ type: "makeCampfireChoice", choice, reward });
    // Update twice (because two actions were enqueued)
    update(update);
    goToNextRoom();
  };
  const goToNextRoom = () => {
    console.log("Go to next room, toggling map");
    toggleOverlay("#Map");
  };
  const handleMapMove = (move) => {
    console.log("Made a move");
    toggleOverlay("#Map");
    setState({ didPickCard: false });
    game.enqueue({ type: "move", move });
    update(dealCards);
  };

  if (!state.player) return;
  const isDead = state.player.currentHealth < 1;
  const didWin = isCurrRoomCompleted(state);
  const didWinEntireGame = isDungeonCompleted(state);
  const room = getCurrRoom(state);
  const noEnergy = !state.player.currentEnergy;

  // There's a lot here because I did not want to split into too many files.
  return (
    <>
      <div classname="App" tabindex="0" onKeyDown={(e) => handleShortcuts(e)}>
        <figure classname="App-background" data-room-index={state.dungeon.y} />
      </div>

      {room.type === "start DISABLED" && (
        <>
          <Overlay>
            <StartRoom onContinue={goToNextRoom} />
          </Overlay>
        </>
      )}

      {isDead && (
        <Overlay>
          <p center>You are dead.</p>
          <DungeonStats state={state} />
          <button onclick={() => onLoose()}>Try again?</button>
        </Overlay>
      )}

      {didWinEntireGame && (
        <Overlay>
          <p center>
            <button onclick={() => onWin()}>You win!</button>
          </p>
          <DungeonStats state={state} />
        </Overlay>
      )}

      {!didWinEntireGame && didWin && room.type === "monster" && (
        <Overlay>
          <h1 center medium>
            Victory. Onwards!
          </h1>
          {!state.didPickCard ? (
            <>
              <p center>
                Here is your reward. Pick a card to add to your deck.
              </p>
              <CardChooser
                cards={getCardRewards(3)}
                didSelectCard={(card) => handlePlayerReward("addCard", card)}
              />
            </>
          ) : (
            <p center>
              Added <strong>{state.didPickCard.name}</strong> to your deck.
            </p>
          )}
          <p center>
            <button onclick={() => goToNextRoom()}>Go to next room</button>
          </p>
        </Overlay>
      )}

      {room.type === "campfire" && (
        <Overlay>
          <CampfireRoom
            gameState={state}
            onChoose={handleCampfireChoice}
            onContinue={goToNextRoom}
          />
        </Overlay>
      )}

      <div classname="Targets Split">
        <div classname="Targets-group">
          <Player model={state.player} name="Player" />
        </div>
        <div classname="Targets-group">
          {room.monsters &&
            room.monsters.map((monster) => (
              <Monster model={monster} gameState={state} />
            ))}
        </div>
      </div>

      <div classname='Split {noEnergy ? "no-energy" : ""}'>
        <div classname="EnergyBadge">
          <span
            classname="tooltipped tooltipped-e tooltipped-multiline"
            aria-label="Cards costs energy and this badge shows how much you have left this turn. Next turn your energy is refilled."
          >
            {state.player.currentEnergy}/{state.player.maxEnergy}
          </span>
        </div>
        <p classname="Actions">
          <button classname="EndTurn" onclick={() => endTurn()}>
            <u>E</u>nd turn
          </button>
        </p>
      </div>

      <div classname="Hand">
        <Cards gameState={state} type="hand" />
      </div>

      <OverlayWithButton id="Menu" topleft>
        <button onClick={() => toggleOverlay("#Menu")}>
          <u>Esc</u>ape
        </button>
        <div classname="Overlay-content">
          <Menu gameState={state} game={game} onUndo={() => undo()} />
        </div>
      </OverlayWithButton>

      <OverlayWithButton id="Map" open topright key={1}>
        {room.type !== "start" && (
          <button align-right onClick={() => toggleOverlay("#Map")}>
            <u>M</u>ap
          </button>
        )}
        <div classname="Overlay-content">
          <Map dungeon={state.dungeon} onMove={handleMapMove} />
        </div>
      </OverlayWithButton>

      <OverlayWithButton id="Deck" topright topright2>
        <button onClick={() => toggleOverlay("#Deck")}>
          <u>D</u>eck {state.deck.length}
        </button>
        <div classname="Overlay-content">
          <Cards gameState={state} type="deck" />
        </div>
      </OverlayWithButton>

      <OverlayWithButton id="DrawPile" bottomleft>
        <button
          classname="tooltipped tooltipped-ne"
          aria-label="The cards you'll draw next in random order"
          onClick={() => toggleOverlay("#DrawPile")}
        >
          Dr<u>a</u>w pile {state.drawPile.length}
        </button>
        <div classname="Overlay-content">
          <Cards gameState={state} type="drawPile" />
        </div>
      </OverlayWithButton>

      <OverlayWithButton id="DiscardPile" bottomright>
        <button
          onClick={() => toggleOverlay("#DiscardPile")}
          align-right
          classname="tooltipped tooltipped-nw tooltipped-multiline"
          aria-label="Cards you've already played. Once the draw pile is empty, these cards are shuffled into your draw pile."
        >
          Di<u>s</u>card pile {state.discardPile.length}
        </button>
        <div classname="Overlay-content">
          <Cards gameState={state} type="discardPile" />
        </div>
      </OverlayWithButton>
    </>
  );
};
