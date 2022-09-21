export const WinScreen = (newgame) => (
  <article class="Splash">
    <h1>Well done. You won.</h1>
    <p>
      <button autofocus onClick={() => newgame()}>
        Play again
      </button>
    </p>
  </article>
);
