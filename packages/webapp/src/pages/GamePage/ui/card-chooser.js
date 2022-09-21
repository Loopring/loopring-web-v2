import { Card } from "./cards.js";

export const CardChooser = () => {
  const clickedCard = (card) => {
    didSelectCard(card);
  };
  return (
    <article class="RewardsBox">
      <div class="Cards">
        {cards.map((card) => (
          <div class="CardBox" onClick={() => clickedCard(card)}>
            {Card(card, gameState)}
          </div>
        ))}
      </div>
    </article>
  );
};
