const input = document.getElementById("chapterInput");
const analyzeBtn = document.getElementById("analyzeBtn");

function getSentences(text) {
  return text
    .replace(/\s+/g, " ")
    .trim()
    .match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
}

function countWords(text) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!word) return 0;
  if (word.length <= 3) return 1;

  word = word.replace(/e$/, "");
  const groups = word.match(/[aeiouy]+/g);
  return Math.max(1, groups ? groups.length : 1);
}

function calculateReadability(text, sentences, words) {
  if (!words || !sentences.length) return 0;

  const wordList = text.match(/[A-Za-z]+/g) || [];
  let syllables = 0;

  wordList.forEach(word => {
    syllables += countSyllables(word);
  });

  const score =
    206.835 -
    1.015 * (words / sentences.length) -
    84.6 * (syllables / words);

  return Math.max(0, Math.min(100, score));
}

function difficultyScore(sentence) {
  const words = countWords(sentence);
  const wordList = sentence.match(/[A-Za-z]+/g) || [];
  const syllables = wordList.reduce((sum, word) => sum + countSyllables(word), 0);

  // Higher = harder.
  return (words / Math.max(1, 1)) + (syllables * 0.7);
}

function getLevel(score) {
  if (score >= 90) return "Very easy";
  if (score >= 80) return "Easy";
  if (score >= 70) return "Fairly easy";
  if (score >= 60) return "Standard";
  if (score >= 50) return "Fairly difficult";
  if (score >= 30) return "Difficult";
  return "Very difficult";
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

analyzeBtn.addEventListener("click", () => {
  const text = input.value.trim();

  if (!text) {
    alert("Please paste a chapter first.");
    return;
  }

  const sentences = getSentences(text);
  const words = countWords(text);
  const score = calculateReadability(text, sentences, words);

  document.getElementById("results").classList.remove("hidden");
  document.getElementById("score").textContent = score.toFixed(1);
  document.getElementById("level").textContent = getLevel(score);
  document.getElementById("wordCount").textContent = words;
  document.getElementById("sentenceCount").textContent = sentences.length;

  const hardest = [...sentences]
    .map(sentence => ({
      sentence,
      difficulty: difficultyScore(sentence)
    }))
    .sort((a, b) => b.difficulty - a.difficulty)
    .slice(0, 5);

  const list = document.getElementById("hardestSentences");
  list.innerHTML = hardest.map((item, index) => `
    <div class="sentence">
      <strong>${index + 1}.</strong> ${escapeHtml(item.sentence)}
    </div>
  `).join("");

  const hardestSet = new Set(hardest.map(item => item.sentence.trim()));

  const preview = sentences.map(sentence => {
    const safe = escapeHtml(sentence);
    return hardestSet.has(sentence.trim())
      ? `<span class="highlight">${safe}</span>`
      : safe;
  }).join(" ");

  document.getElementById("preview").innerHTML = preview;
});
