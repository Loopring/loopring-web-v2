import {
  html,
  Component,
} from "../web_modules/htm/preact/standalone.module.js";
import {
  weak as weakPower,
  vulnerable as vulnerablePower,
  regen as regenPower,
} from "../game/powers.js";
import { useRef, useEffect } from "react";

export const Player = (props) => {
  return <Target {...props} type="player" />;
};

export const Monster = (props) => {
  const monster = props.model;
  const state = props.gameState;
  // {damage: 6, block: 2}
  const intent = monster.intents[monster.nextIntent];

  function MonsterIntent([type, amount]) {
    const weakened = monster.powers.weak;
    const vulnerable = state.player.powers.vulnerable;

    if (type === "damage" && weakened) amount = weakPower.use(amount);
    if (type === "damage" && vulnerable) amount = vulnerablePower.use(amount);

    let tooltip = "";
    if (type === "damage") tooltip = `Will deal ${amount} damage`;
    if (type === "block") tooltip = `Will block for ${amount}`;
    if (type === "weak") tooltip = `Will apply ${amount} Weak`;
    if (type === "vulnerable") tooltip = `Will apply ${amount} Vulnerable`;

    // Don't reveal how many stacks will be applied.
    if (type === "vulnerable" || type === "weak") amount = undefined;

    return (
      <div
        class="Target-intent ${tooltip && 'tooltipped tooltipped-n'}"
        aria-label="${tooltip}"
      >
        <img alt={type} src="ui/images/${type}.png" /> ${amount}
      </div>
    );
  }

  return (
    <Target {...props} type="enemy">
      {intent && Object.entries(intent).map((intent) => MonsterIntent(intent))}
    </Target>
  );
};

const Target = (props, type, state) => {
  const mounted = useRef();
  useEffect(() => {
    if (!mounted.current) {
      // do componentDidMount logic
      mounted.current = true;
    } else {
      // do componentDidUpdate logic
      const lostHealth =
        prevProps.model.currentHealth - this.props.model.currentHealth;
      if (lostHealth > 0) this.setState({ lostHealth });
    }
  });

  const isDead = props.model.currentHealth < 1;
  const hp = isDead ? 0 : props.model.currentHealth;
  return (
    <div class={`Target${isDead ? " Target--isDead" : ""}`} data-type={type}>
      <h2>
        <span class="Target-name">{props.name}</span> {props.children}
      </h2>
      <Healthbar
        max={props.model.maxHealth}
        value={hp}
        block={props.model.block}
      />
      <Powers powers={props.model.powers} />
      <div class="Target-combatText Split">
        <FCT
          key={props.model.block}
          value={props.model.block}
          class="FCT FCT--block"
        />
        <FCT key={hp} value={state.lostHealth} />
      </div>
    </div>
  );
};

// A bar that shows the player's current and maximum health as well as any block.
function Healthbar({ value, max, block }) {
  return (
    <div class={`Healthbar ${block ? "Healthbar--hasBlock" : ""}`}>
      <p class="Healthbar-label">
        <span>
          {value}/{max}
        </span>
      </p>
      <div class="Healthbar-bar" style={`width: ${(value / max) * 100}%`}></div>
      <div
        class="Healthbar-bar Healthbar-blockBar"
        style={`width: ${(block / max) * 100}%`}
      >
        {block > 0 ? block : ""}
      </div>
    </div>
  );
}

// Shows currently active powers.
const Powers = (props) => {
  return (
    <div class="Target-powers">
      <Power amount={props.powers.vulnerable} power={vulnerablePower} />
      <Power amount={props.powers.regen} power={regenPower} />
      <Power amount={props.powers.weak} power={weakPower} />
    </div>
  );
};

const Power = ({ power, amount }) => {
  if (!amount) return null;
  return (
    <span class="tooltipped tooltipped-s" aria-label={power.description}>
      {power.name} {amount}
    </span>
  );
};

// Floating Combat Text. Give it a number and it'll animate it.
function FCT(props) {
  // This avoids animation the value "0".
  if (!props.value) return <p></p>;
  return (
    <p class="FCT" {...props}>
      {props.value}
    </p>
  );
}
