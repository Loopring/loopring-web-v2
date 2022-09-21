import { useState } from "react";
import CardChooser from "./card-chooser.js";

export default CampfireRoom = () => {
  const [state, setState] = useState();
  const rest = () => {
    onChoose("rest");
  };
  const choose = (choice, reward) => {
    setState({
      choice,
      reward,
      isChoosingCard: !this.state.isChoosingCard,
    });
    if (reward) {
      onChoose(choice, reward);
    }
  };
  const onSelectCard = (card) => {
    choose(state.choice, card);
  };
  const { gameState } = props; //TODO
  const { choice, isChoosingCard } = state;
  let label = "";
  if (choice === "upgradeCard") label = "Choose a card to upgrade";
  if (choice === "removeCard") label = "Choose a card to remove";
  return (
    <>
      <h1 center medium>
        Campfire
      </h1>
      <ul class="Options">
        {isChoosingCard ? (
          <li>
            <button onclick={() => setState({ isChoosingCard: false })}>
              Cancel
            </button>
          </li>
        ) : (
          <>
            <li>
              <button onclick={() => rest()}>Rest</button>
            </li>
            <li>
              <button onclick={() => choose("upgradeCard")}>
                Upgrade card
              </button>
            </li>
            <li>
              <button onclick={() => choose("removeCard")}>Remove card</button>
            </li>
          </>
        )}
      </ul>
      {isChoosingCard && (
        <>
          <br />
          <p center>{label}</p>
          <CardChooser
            gameState={gameState}
            cards={gameState.deck}
            didSelectCard={(card) => onSelectCard(card)}
          />
        </>
      )}
      <p center>
        <button onclick={() => onContinue()}>No, thanks</button>
      </p>
    </>
  );
};
