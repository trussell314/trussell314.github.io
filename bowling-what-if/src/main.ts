const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('Unable to find the #app container');
}

app.innerHTML = `
  <main
    style="
      font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      padding: clamp(2rem, 5vw, 4rem);
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      max-width: 720px;
      margin: 0 auto;
    "
  >
    <header style="text-align: center;">
      <h1 style="margin-bottom: 0.5rem; font-size: clamp(2rem, 5vw, 3rem);">Bowling What-If</h1>
      <p style="margin: 0; color: #444; font-size: 1.1rem;">
        Explore your bowling scenarios by entering game scores below.
      </p>
    </header>

    <form style="display: flex; flex-direction: column; gap: 0.75rem;">
      <label for="bowling-scores" style="font-weight: 600; font-size: 1.05rem;">
        Enter your bowling scores, one per line.
      </label>
      <textarea
        id="bowling-scores"
        name="bowling-scores"
        rows="10"
        placeholder="Example:\n201\n198\n174"
        style="
          font: inherit;
          padding: 1rem;
          border: 1px solid #cbd5f0;
          border-radius: 0.75rem;
          resize: vertical;
          min-height: 12rem;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
        "
      ></textarea>
    </form>
  </main>
`;
