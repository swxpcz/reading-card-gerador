const titleInput = document.getElementById("title");
const progressInput = document.getElementById("progress");
const coverInput = document.getElementById("cover");
const formatInput = document.getElementById("format");

const titlePreview = document.getElementById("titlePreview");
const progressValue = document.getElementById("progressValue");
const percentPreview = document.getElementById("percentPreview");
const progressBar = document.getElementById("progressBar");
const coverPreview = document.getElementById("coverPreview");
const coverPlaceholder = document.getElementById("coverPlaceholder");
const background = document.getElementById("background");
const previewFrame = document.getElementById("previewFrame");

let coverData = null;

titleInput.addEventListener("input", updateCard);

progressInput.addEventListener("input", updateCard);

formatInput.addEventListener("change", () => {
  previewFrame.classList.toggle("story", formatInput.value === "story");
  previewFrame.classList.toggle("square", formatInput.value === "square");
});

coverInput.addEventListener("change", () => {
  const file = coverInput.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (event) => {
    coverData = event.target.result;
    coverPreview.src = coverData;
    coverPreview.style.display = "block";
    coverPlaceholder.style.display = "none";
    background.style.backgroundImage = `url("${coverData}")`;
  };

  reader.readAsDataURL(file);
});

function updateCard() {
  const title = titleInput.value.trim();
  const progress = progressInput.value;

  titlePreview.textContent = title || "Seu livro aqui";
  progressValue.textContent = `${progress}%`;
  percentPreview.textContent = `${progress}%`;
  progressBar.style.width = `${progress}%`;
}

document.getElementById("reset").addEventListener("click", () => {
  titleInput.value = "";
  progressInput.value = 65;
  coverInput.value = "";
  coverData = null;

  coverPreview.src = "";
  coverPreview.style.display = "none";
  coverPlaceholder.style.display = "flex";
  background.style.backgroundImage = "";

  updateCard();
});

document.getElementById("download").addEventListener("click", async () => {
  const card = document.getElementById("preview");

  if (typeof html2canvas === "undefined") {
    await loadHtml2Canvas();
  }

  const canvas = await html2canvas(card, {
    scale: 3,
    useCORS: true,
    backgroundColor: null,
    logging: false
  });

  const link = document.createElement("a");
  const safeTitle = (titleInput.value.trim() || "reading-card")
    .replace(/[^a-z0-9À-ÿ]+/gi, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  link.download = `${safeTitle || "reading-card"}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
});

function loadHtml2Canvas() {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

updateCard();
