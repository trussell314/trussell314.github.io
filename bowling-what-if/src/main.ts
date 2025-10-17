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
      max-width: 760px;
      margin: 0 auto;
      color: #0f172a;
    "
  >
    <header style="text-align: center; display: flex; flex-direction: column; gap: 0.5rem;">
      <h1 style="margin: 0; font-size: clamp(2rem, 5vw, 3rem);">Bowling What-If</h1>
      <p style="margin: 0; color: #475569; font-size: 1.1rem;">
        Calculate frame-by-frame bowling scores for every game you enter.
      </p>
    </header>

    <form id="bowling-form" style="display: flex; flex-direction: column; gap: 0.75rem;">
      <label for="bowling-scores" style="font-weight: 600; font-size: 1.05rem;">
        Enter frame-by-frame bowling scores. Use one line per game.
      </label>
      <textarea
        id="bowling-scores"
        name="bowling-scores"
        rows="10"
        placeholder="Example:\n9/ X 81 7/ X X 9- 90 X XX7"
        style="
          font: inherit;
          padding: 1rem;
          border: 1px solid #cbd5f0;
          border-radius: 0.75rem;
          resize: vertical;
          min-height: 12rem;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
          line-height: 1.5;
        "
        aria-describedby="bowling-instructions"
      ></textarea>
      <div id="bowling-instructions" style="font-size: 0.95rem; color: #475569; display: flex; flex-direction: column; gap: 0.35rem;">
        <p style="margin: 0;">Use spaces or commas to separate frames. Valid characters: <code style="background: #e2e8f0; padding: 0.1rem 0.35rem; border-radius: 0.35rem;">0-9 / - X</code></p>
        <p style="margin: 0;">Example: <code style="background: #e2e8f0; padding: 0.1rem 0.35rem; border-radius: 0.35rem;">9/ X 81 7/ X X 9- 90 X XX7</code></p>
      </div>
      <button
        type="submit"
        style="
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 0.75rem;
          padding: 0.85rem 1.5rem;
          font: inherit;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s ease;
          box-shadow: 0 8px 16px rgba(37, 99, 235, 0.25);
        "
        onmouseover="this.style.background='#1d4ed8'"
        onmouseout="this.style.background='#2563eb'"
      >
        Tell My Fortune
      </button>
    </form>

    <section
      id="form-errors"
      role="alert"
      style="display: none; border-radius: 0.75rem; padding: 1rem; background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca;"
    ></section>

    <section
      id="results"
      style="display: none; border-radius: 0.75rem; padding: 1.25rem; background: #f8fafc; border: 1px solid #cbd5f0;"
    ></section>
  </main>
`;

const form = document.querySelector<HTMLFormElement>('#bowling-form');
const textarea = document.querySelector<HTMLTextAreaElement>('#bowling-scores');
const errorsContainer = document.querySelector<HTMLDivElement>('#form-errors');
const resultsContainer = document.querySelector<HTMLDivElement>('#results');

if (!form || !textarea || !errorsContainer || !resultsContainer) {
  throw new Error('Unable to initialize the bowling score form.');
}

type Token = {
  value: string;
  startColumn: number;
};

type ParseSuccess = {
  rolls: number[];
};

type ParseFailure = {
  message: string;
  column: number;
};

const validCharacters = new Set(['X', '/', '-', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']);

function tokenize(line: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;

  while (index < line.length) {
    const char = line[index];

    if (char === ' ' || char === '\t' || char === ',') {
      index += 1;
      continue;
    }

    const start = index;

    while (index < line.length) {
      const innerChar = line[index];
      if (innerChar === ' ' || innerChar === '\t' || innerChar === ',') {
        break;
      }
      index += 1;
    }

    tokens.push({
      value: line.slice(start, index),
      startColumn: start + 1,
    });
  }

  return tokens;
}

function toPins(char: string): number {
  if (char === '-') {
    return 0;
  }

  return Number.parseInt(char, 10);
}

function ensureValidCharacters(token: Token): ParseFailure | undefined {
  for (let i = 0; i < token.value.length; i += 1) {
    const char = token.value[i];
    if (!validCharacters.has(char)) {
      return {
        message: `Invalid character "${char}".`,
        column: token.startColumn + i,
      };
    }
  }

  return undefined;
}

function parseStandardFrame(token: Token): ParseSuccess | ParseFailure {
  if (token.value === 'X') {
    return { rolls: [10] };
  }

  const invalidChar = ensureValidCharacters(token);
  if (invalidChar) {
    return invalidChar;
  }

  if (token.value.length !== 2) {
    return {
      message: 'Frames 1 through 9 must use two characters unless they are a strike ("X").',
      column: token.startColumn,
    };
  }

  const firstChar = token.value[0];
  const secondChar = token.value[1];

  if (firstChar === 'X' || firstChar === '/') {
    return {
      message: `Unexpected character "${firstChar}" at the start of the frame.`,
      column: token.startColumn,
    };
  }

  if (secondChar === 'X') {
    return {
      message: 'Only strikes can use "X" and they must occupy the entire frame.',
      column: token.startColumn + 1,
    };
  }

  const firstPins = toPins(firstChar);

  if (Number.isNaN(firstPins)) {
    return {
      message: `Invalid roll value "${firstChar}".`,
      column: token.startColumn,
    };
  }

  if (secondChar === '/') {
    return { rolls: [firstPins, 10 - firstPins] };
  }

  const secondPins = toPins(secondChar);

  if (Number.isNaN(secondPins)) {
    return {
      message: `Invalid roll value "${secondChar}".`,
      column: token.startColumn + 1,
    };
  }

  if (firstPins + secondPins > 9) {
    return {
      message: 'Open frames cannot knock down more than 9 pins without recording a spare.',
      column: token.startColumn,
    };
  }

  return { rolls: [firstPins, secondPins] };
}

function parseTenthFrame(token: Token): ParseSuccess | ParseFailure {
  const invalidChar = ensureValidCharacters(token);
  if (invalidChar) {
    return invalidChar;
  }

  if (token.value.length < 2 || token.value.length > 3) {
    return {
      message: 'Frame 10 must contain two or three rolls.',
      column: token.startColumn,
    };
  }

  const chars = token.value.split('');
  const first = chars[0];

  const resolveBonus = (char: string, previousPins: number | undefined, index: number): ParseFailure | number => {
    if (char === 'X') {
      return 10;
    }

    if (char === '/') {
      if (previousPins === undefined || previousPins === 10) {
        return {
          message: 'A spare requires a preceding roll with fewer than 10 pins.',
          column: token.startColumn + index,
        };
      }

      return 10 - previousPins;
    }

    const pins = toPins(char);

    if (Number.isNaN(pins)) {
      return {
        message: `Invalid roll value "${char}".`,
        column: token.startColumn + index,
      };
    }

    return pins;
  };

  if (first === 'X') {
    if (token.value.length !== 3) {
      return {
        message: 'A strike in the tenth frame requires two additional rolls.',
        column: token.startColumn,
      };
    }

    const second = chars[1];

    if (second === '/') {
      return {
        message: 'A spare cannot immediately follow a strike in the tenth frame.',
        column: token.startColumn + 1,
      };
    }

    const secondPins = resolveBonus(second, undefined, 1);
    if (typeof secondPins !== 'number') {
      return secondPins;
    }

    const third = chars[2];
    const thirdPins = resolveBonus(third, secondPins, 2);
    if (typeof thirdPins !== 'number') {
      return thirdPins;
    }

    return { rolls: [10, secondPins, thirdPins] };
  }

  if (first === '/' || first === 'X') {
    return {
      message: `Unexpected character "${first}" at the start of the tenth frame.`,
      column: token.startColumn,
    };
  }

  const firstPins = toPins(first);

  if (Number.isNaN(firstPins)) {
    return {
      message: `Invalid roll value "${first}".`,
      column: token.startColumn,
    };
  }

  const second = chars[1];

  if (second === '/') {
    if (token.value.length !== 3) {
      return {
        message: 'A spare in the tenth frame requires a bonus roll.',
        column: token.startColumn + 1,
      };
    }

    const third = chars[2];
    if (third === '/') {
      return {
        message: 'Only one spare can be recorded in the tenth frame.',
        column: token.startColumn + 2,
      };
    }

    const thirdPins = resolveBonus(third, undefined, 2);
    if (typeof thirdPins !== 'number') {
      return thirdPins;
    }

    return { rolls: [firstPins, 10 - firstPins, thirdPins] };
  }

  if (second === 'X') {
    return {
      message: 'Only strikes consisting of a single "X" are allowed before the tenth frame bonus rolls.',
      column: token.startColumn + 1,
    };
  }

  const secondPins = toPins(second);

  if (Number.isNaN(secondPins)) {
    return {
      message: `Invalid roll value "${second}".`,
      column: token.startColumn + 1,
    };
  }

  if (firstPins + secondPins > 9) {
    return {
      message: 'Open frames in the tenth cannot exceed a total of 9 pins.',
      column: token.startColumn,
    };
  }

  if (token.value.length === 3) {
    return {
      message: 'Open frames in the tenth frame only use two rolls.',
      column: token.startColumn + 2,
    };
  }

  return { rolls: [firstPins, secondPins] };
}

function parseLine(line: string): ParseSuccess | ParseFailure {
  const tokens = tokenize(line);

  if (tokens.length === 0) {
    return {
      message: 'Each game must include 10 frames.',
      column: 1,
    };
  }

  if (tokens.length !== 10) {
    const column =
      tokens.length > 10
        ? tokens[10]?.startColumn ?? tokens[tokens.length - 1].startColumn
        : tokens[0]?.startColumn ?? 1;

    return {
      message: `Expected 10 frames but found ${tokens.length}.`,
      column,
    };
  }

  const rolls: number[] = [];

  for (let frameIndex = 0; frameIndex < tokens.length; frameIndex += 1) {
    const token = tokens[frameIndex];

    const parsed =
      frameIndex < 9 ? parseStandardFrame(token) : parseTenthFrame(token);

    if ('message' in parsed) {
      return parsed;
    }

    rolls.push(...parsed.rolls);
  }

  return { rolls };
}

function calculateScore(rolls: number[]): number {
  let score = 0;
  let rollIndex = 0;

  for (let frame = 0; frame < 9; frame += 1) {
    const firstRoll = rolls[rollIndex];

    if (firstRoll === 10) {
      score += 10 + (rolls[rollIndex + 1] ?? 0) + (rolls[rollIndex + 2] ?? 0);
      rollIndex += 1;
      continue;
    }

    const secondRoll = rolls[rollIndex + 1];

    if (firstRoll + secondRoll === 10) {
      score += 10 + (rolls[rollIndex + 2] ?? 0);
      rollIndex += 2;
      continue;
    }

    score += firstRoll + secondRoll;
    rollIndex += 2;
  }

  const remaining = rolls.slice(rollIndex);
  return score + remaining.reduce((total, pins) => total + pins, 0);
}

function renderErrors(errors: string[]): void {
  resultsContainer.style.display = 'none';
  resultsContainer.innerHTML = '';

  if (errors.length === 0) {
    errorsContainer.style.display = 'none';
    errorsContainer.innerHTML = '';
    return;
  }

  errorsContainer.style.display = 'block';
  errorsContainer.innerHTML = `
    <strong>We found some issues:</strong>
    <ul style="margin: 0.5rem 0 0 1.25rem; padding: 0; display: flex; flex-direction: column; gap: 0.35rem;">
      ${errors.map((error) => `<li>${error}</li>`).join('')}
    </ul>
  `;
}

function renderResults(results: { lineNumber: number; score: number }[]): void {
  errorsContainer.style.display = 'none';
  errorsContainer.innerHTML = '';

  if (results.length === 0) {
    resultsContainer.style.display = 'none';
    resultsContainer.innerHTML = '';
    return;
  }

  resultsContainer.style.display = 'block';
  resultsContainer.innerHTML = `
    <h2 style="margin-top: 0; font-size: 1.35rem;">Bowling Scores</h2>
    <ol style="margin: 0; padding-left: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem;">
      ${results
        .map(
          ({ lineNumber, score }) =>
            `<li><strong>Line ${lineNumber}:</strong> ${score} points</li>`
        )
        .join('')}
    </ol>
  `;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const rawLines = textarea.value.split(/\r?\n/);
  const results: { lineNumber: number; score: number }[] = [];
  const errors: string[] = [];

  let hasAtLeastOneGame = false;

  rawLines.forEach((rawLine, index) => {
    const lineNumber = index + 1;
    const trimmed = rawLine.trim();

    if (trimmed.length === 0) {
      return;
    }

    hasAtLeastOneGame = true;

    const parsed = parseLine(rawLine);

    if ('message' in parsed) {
      errors.push(`Line ${lineNumber}, column ${parsed.column}: ${parsed.message}`);
      return;
    }

    const score = calculateScore(parsed.rolls);
    results.push({ lineNumber, score });
  });

  if (!hasAtLeastOneGame) {
    renderErrors(['Please enter at least one game.']);
    return;
  }

  if (errors.length > 0) {
    renderErrors(errors);
    return;
  }

  renderResults(results);
});
