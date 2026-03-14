const BOOKS = [
  { name: "Genesis", chapters: 50 },
  { name: "Exodus", chapters: 40 },
  { name: "Leviticus", chapters: 27 },
  { name: "Numbers", chapters: 36 },
  { name: "Deuteronomy", chapters: 34 },
  { name: "Joshua", chapters: 24 },
  { name: "Judges", chapters: 21 },
  { name: "Ruth", chapters: 4 },
  { name: "1 Samuel", chapters: 31 },
  { name: "2 Samuel", chapters: 24 },
  { name: "1 Kings", chapters: 22 },
  { name: "2 Kings", chapters: 25 },
  { name: "1 Chronicles", chapters: 29 },
  { name: "2 Chronicles", chapters: 36 },
  { name: "Ezra", chapters: 10 },
  { name: "Nehemiah", chapters: 13 },
  { name: "Esther", chapters: 10 },
  { name: "Job", chapters: 42 },
  { name: "Psalms", chapters: 150 },
  { name: "Proverbs", chapters: 31 },
  { name: "Ecclesiastes", chapters: 12 },
  { name: "Song of Solomon", chapters: 8 },
  { name: "Isaiah", chapters: 66 },
  { name: "Jeremiah", chapters: 52 },
  { name: "Lamentations", chapters: 5 },
  { name: "Ezekiel", chapters: 48 },
  { name: "Daniel", chapters: 12 },
  { name: "Hosea", chapters: 14 },
  { name: "Joel", chapters: 3 },
  { name: "Amos", chapters: 9 },
  { name: "Obadiah", chapters: 1 },
  { name: "Jonah", chapters: 4 },
  { name: "Micah", chapters: 7 },
  { name: "Nahum", chapters: 3 },
  { name: "Habakkuk", chapters: 3 },
  { name: "Zephaniah", chapters: 3 },
  { name: "Haggai", chapters: 2 },
  { name: "Zechariah", chapters: 14 },
  { name: "Malachi", chapters: 4 },
  { name: "Matthew", chapters: 28 },
  { name: "Mark", chapters: 16 },
  { name: "Luke", chapters: 24 },
  { name: "John", chapters: 21 },
  { name: "Acts", chapters: 28 },
  { name: "Romans", chapters: 16 },
  { name: "1 Corinthians", chapters: 16 },
  { name: "2 Corinthians", chapters: 13 },
  { name: "Galatians", chapters: 6 },
  { name: "Ephesians", chapters: 6 },
  { name: "Philippians", chapters: 4 },
  { name: "Colossians", chapters: 4 },
  { name: "1 Thessalonians", chapters: 5 },
  { name: "2 Thessalonians", chapters: 3 },
  { name: "1 Timothy", chapters: 6 },
  { name: "2 Timothy", chapters: 4 },
  { name: "Titus", chapters: 3 },
  { name: "Philemon", chapters: 1 },
  { name: "Hebrews", chapters: 13 },
  { name: "James", chapters: 5 },
  { name: "1 Peter", chapters: 5 },
  { name: "2 Peter", chapters: 3 },
  { name: "1 John", chapters: 5 },
  { name: "2 John", chapters: 1 },
  { name: "3 John", chapters: 1 },
  { name: "Jude", chapters: 1 },
  { name: "Revelation", chapters: 22 },
];

const elements = {
  lengthMode: document.getElementById("lengthMode"),
  rangeOptions: document.getElementById("rangeOptions"),
  minRange: document.getElementById("minRange"),
  maxRange: document.getElementById("maxRange"),
  translation: document.getElementById("translation"),
  randomizeBtn: document.getElementById("randomizeBtn"),
  copyBtn: document.getElementById("copyBtn"),
  status: document.getElementById("status"),
  reference: document.getElementById("reference"),
  verseText: document.getElementById("verseText"),
};

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandomBook() {
  return BOOKS[getRandomInt(0, BOOKS.length - 1)];
}

function buildReference(book, chapter, verseStart, verseEnd) {
  if (!verseStart) {
    return `${book} ${chapter}`;
  }
  if (verseEnd && verseEnd !== verseStart) {
    return `${book} ${chapter}:${verseStart}-${verseEnd}`;
  }
  return `${book} ${chapter}:${verseStart}`;
}

function getTranslationQuery() {
  const value = elements.translation.value;
  return value === "default" ? "" : `?translation=${encodeURIComponent(value)}`;
}

async function fetchPassage(reference) {
  const url = `https://bible-api.com/${encodeURIComponent(reference)}${getTranslationQuery()}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Unable to fetch passage.");
  }
  return response.json();
}

async function fetchChapter(book, chapter) {
  const reference = buildReference(book, chapter);
  return fetchPassage(reference);
}

function getVerseCount(chapterData) {
  if (!chapterData.verses || chapterData.verses.length === 0) {
    return 0;
  }
  return Math.max(...chapterData.verses.map((verse) => verse.verse));
}

function clampRangeValues(minValue, maxValue) {
  let min = Number(minValue);
  let max = Number(maxValue);
  if (Number.isNaN(min)) {
    min = 2;
  }
  if (Number.isNaN(max)) {
    max = 6;
  }
  if (min < 1) min = 1;
  if (max < 1) max = 1;
  if (min > max) {
    [min, max] = [max, min];
  }
  return { min, max };
}

function setStatus(message, type = "") {
  elements.status.textContent = message;
  elements.status.dataset.type = type;
}

function renderResult(data) {
  elements.reference.textContent = data.reference || "";
  elements.verseText.textContent = data.text?.trim() || "";
  elements.copyBtn.disabled = !elements.reference.textContent || !elements.verseText.textContent;
}

function clearResult() {
  elements.reference.textContent = "";
  elements.verseText.textContent = "";
  elements.copyBtn.disabled = true;
}

function getPassageText() {
  const reference = elements.reference.textContent.trim();
  const verseText = elements.verseText.textContent.trim();
  if (!reference || !verseText) {
    return "";
  }
  return `${reference}\n\n${verseText}`;
}

async function writeTextToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const helper = document.createElement("textarea");
  helper.value = text;
  helper.setAttribute("readonly", "");
  helper.style.position = "absolute";
  helper.style.left = "-9999px";
  document.body.appendChild(helper);
  helper.select();

  const successful = document.execCommand("copy");
  document.body.removeChild(helper);

  if (!successful) {
    throw new Error("Copy failed.");
  }
}

async function handleCopy() {
  const text = getPassageText();
  if (!text) {
    setStatus("Nothing to copy yet.", "error");
    return;
  }

  const originalLabel = elements.copyBtn.textContent;
  try {
    await writeTextToClipboard(text);
    elements.copyBtn.textContent = "Copied";
  } catch (error) {
    setStatus(error.message || "Unable to copy passage.", "error");
    return;
  }

  window.setTimeout(() => {
    elements.copyBtn.textContent = originalLabel;
  }, 1500);
}

async function getRandomPassage() {
  const book = pickRandomBook();
  const chapter = getRandomInt(1, book.chapters);
  const mode = elements.lengthMode.value;

  if (mode === "chapter") {
    return fetchChapter(book.name, chapter);
  }

  const chapterData = await fetchChapter(book.name, chapter);
  const verseCount = getVerseCount(chapterData);
  if (verseCount === 0) {
    throw new Error("No verses found for that chapter.");
  }

  if (mode === "single") {
    const verse = getRandomInt(1, verseCount);
    return fetchPassage(buildReference(book.name, chapter, verse));
  }

  const { min, max } = clampRangeValues(
    elements.minRange.value,
    elements.maxRange.value
  );
  const maxAllowed = Math.min(max, verseCount);
  const minAllowed = Math.min(min, maxAllowed);
  const length = getRandomInt(minAllowed, maxAllowed);
  const start = getRandomInt(1, verseCount - length + 1);
  const end = start + length - 1;
  return fetchPassage(buildReference(book.name, chapter, start, end));
}

async function handleRandomize() {
  setStatus("Loading...", "loading");
  clearResult();
  elements.randomizeBtn.disabled = true;

  try {
    const data = await getRandomPassage();
    renderResult(data);
    setStatus("", "");
  } catch (error) {
    setStatus(error.message || "Something went wrong.", "error");
  } finally {
    elements.randomizeBtn.disabled = false;
  }
}

function updateRangeVisibility() {
  const isRange = elements.lengthMode.value === "range";
  elements.rangeOptions.setAttribute("aria-hidden", String(!isRange));
  elements.rangeOptions.classList.toggle("hidden", !isRange);
}

elements.lengthMode.addEventListener("change", updateRangeVisibility);
elements.randomizeBtn.addEventListener("click", handleRandomize);
elements.copyBtn.addEventListener("click", handleCopy);
updateRangeVisibility();
