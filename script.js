const titleInput = document.getElementById("title");
const progressInput = document.getElementById("progress");
const blurInput = document.getElementById("blur");
const coverInput = document.getElementById("cover");
const formatInput = document.getElementById("format");

const titlePreview = document.getElementById("titlePreview");
const progressValue = document.getElementById("progressValue");
const blurValue = document.getElementById("blurValue");
const percentPreview = document.getElementById("percentPreview");
const progressBar = document.getElementById("progressBar");

const coverPreview = document.getElementById("coverPreview");
const coverPlaceholder = document.getElementById("coverPlaceholder");
const background = document.getElementById("background");
const previewFrame = document.getElementById("previewFrame");

const downloadStatus = document.getElementById("downloadStatus");

let coverData = null;


/* =========================
   PRÉVIA
========================= */

function updatePreview() {

  const title =
    titleInput.value.trim() || "Seu livro aqui";

  const progress =
    Number(progressInput.value);

  const blur =
    Number(blurInput.value);


  titlePreview.textContent = title;

  progressValue.textContent =
    `${progress}%`;

  percentPreview.textContent =
    `${progress}%`;

  progressBar.style.width =
    `${progress}%`;

  blurValue.textContent =
    `${blur}px`;

  background.style.filter =
    `blur(${blur}px)`;
}


/* =========================
   EVENTOS
========================= */

titleInput.addEventListener(
  "input",
  updatePreview
);


progressInput.addEventListener(
  "input",
  updatePreview
);


blurInput.addEventListener(
  "input",
  updatePreview
);


/* =========================
   FORMATO
========================= */

formatInput.addEventListener(
  "change",
  () => {

    const isStory =
      formatInput.value === "story";

    previewFrame.classList.toggle(
      "story",
      isStory
    );

    previewFrame.classList.toggle(
      "square",
      !isStory
    );
  }
);


/* =========================
   UPLOAD DA CAPA
========================= */

coverInput.addEventListener(
  "change",
  () => {

    const file =
      coverInput.files[0];

    if (!file) {
      return;
    }


    const reader =
      new FileReader();


    reader.onload =
      function (event) {

        coverData =
          event.target.result;


        coverPreview.src =
          coverData;


        coverPreview.style.display =
          "block";


        coverPlaceholder.style.display =
          "none";


        background.style.backgroundImage =
          `url("${coverData}")`;

      };


    reader.readAsDataURL(file);

  }
);


/* =========================
   RESET
========================= */

document
  .getElementById("reset")
  .addEventListener(
    "click",
    () => {

      titleInput.value = "";

      progressInput.value = 65;

      blurInput.value = 25;

      coverInput.value = "";

      coverData = null;


      coverPreview.src = "";

      coverPreview.style.display =
        "none";


      coverPlaceholder.style.display =
        "flex";


      background.style.backgroundImage =
        "";


      updatePreview();

    }
  );


/* =========================
   DOWNLOAD
========================= */

document
  .getElementById("download")
  .addEventListener(
    "click",
    generatePNG
  );


async function generatePNG() {

  downloadStatus.textContent =
    "Gerando PNG...";


  try {

    const width = 1080;

    const isStory =
      formatInput.value === "story";

    const height =
      isStory
        ? 1920
        : 1080;


    const canvas =
      document.createElement("canvas");


    canvas.width =
      width;

    canvas.height =
      height;


    const ctx =
      canvas.getContext("2d");


    /*
    ========================================
    FUNDO BASE
    ========================================
    */

    ctx.fillStyle =
      "#26221f";


    ctx.fillRect(
      0,
      0,
      width,
      height
    );


    /*
    ========================================
    CARREGAR CAPA
    ========================================
    */

    let image = null;


    if (coverData) {

      image =
        await loadImage(
          coverData
        );

    }


    /*
    ========================================
    FUNDO DESFOCADO

    Não usamos mais:

    ctx.filter = blur()

    porque alguns celulares não
    exportam esse efeito corretamente.

    Em vez disso fazemos um blur
    visual diretamente no canvas.
    ========================================
    */

    if (image) {

      const blur =
        Number(
          blurInput.value
        );


      drawBlurredBackground(
        ctx,
        image,
        width,
        height,
        blur
      );

    }


    /*
    ========================================
    OVERLAY
    ========================================
    */

    const gradient =
      ctx.createLinearGradient(
        0,
        0,
        0,
        height
      );


    gradient.addColorStop(
      0,
      "rgba(0,0,0,.28)"
    );


    gradient.addColorStop(
      .35,
      "rgba(0,0,0,.16)"
    );


    gradient.addColorStop(
      1,
      "rgba(0,0,0,.72)"
    );


    ctx.fillStyle =
      gradient;


    ctx.fillRect(
      0,
      0,
      width,
      height
    );


    /*
    ========================================
    CAPA CENTRAL
    ========================================
    */

    const coverWidth =
      width * .52;


    const coverHeight =
      coverWidth * 1.5;


    const coverX =
      (width - coverWidth) / 2;


    const coverY =
      height * .20;


    if (image) {

      ctx.save();


      ctx.shadowColor =
        "rgba(0,0,0,.35)";


      ctx.shadowBlur =
        45;


      ctx.shadowOffsetY =
        15;


      drawImageCover(
        ctx,
        image,
        coverX,
        coverY,
        coverWidth,
        coverHeight
      );


      ctx.restore();

    } else {

      ctx.fillStyle =
        "rgba(255,255,255,.14)";


      ctx.fillRect(
        coverX,
        coverY,
        coverWidth,
        coverHeight
      );


      ctx.fillStyle =
        "#ffffff";


      ctx.font =
        '600 50px "Playfair Display", Georgia, serif';


      ctx.textAlign =
        "center";


      ctx.fillText(
        "CAPA",
        width / 2,
        coverY + coverHeight / 2
      );

    }


    /*
    ========================================
    TEXTO
    ========================================
    */

    let y =
      coverY +
      coverHeight +
      height * .10;


    ctx.textAlign =
      "center";


    ctx.fillStyle =
      "rgba(255,255,255,.75)";


    ctx.font =
      '700 24px "DM Sans", Arial, sans-serif';


    ctx.fillText(
      "MINHA LEITURA ATUAL",
      width / 2,
      y
    );


    /*
    ========================================
    TÍTULO
    ========================================
    */

    y += 70;


    const title =
      titleInput.value.trim()
      || "Seu livro aqui";


    ctx.fillStyle =
      "#ffffff";


    ctx.font =
      '700 76px "Playfair Display", Georgia, serif';


    const lines =
      wrapText(
        ctx,
        title,
        width * .78
      );


    const lineHeight =
      82;


    lines
      .slice(0, 3)
      .forEach(
        (line, index) => {

          ctx.fillText(
            line,
            width / 2,
            y + index * lineHeight
          );

        }
      );


    /*
    ========================================
    PROGRESSO
    ========================================
    */

    y +=
      Math.min(
        lines.length,
        3
      ) * lineHeight + 70;


    const progress =
      Number(
        progressInput.value
      );


    const barX =
      width * .12;


    const barWidth =
      width * .76;


    ctx.textAlign =
      "left";


    ctx.fillStyle =
      "rgba(255,255,255,.8)";


    ctx.font =
      '700 22px "DM Sans", Arial, sans-serif';


    ctx.fillText(
      "PROGRESSO",
      barX,
      y
    );


    ctx.textAlign =
      "right";


    ctx.fillStyle =
      "#ffffff";


    ctx.font =
      '700 30px "DM Sans", Arial, sans-serif';


    ctx.fillText(
      `${progress}%`,
      barX + barWidth,
      y
    );


    /*
    ========================================
    BARRA
    ========================================
    */

    y += 18;


    ctx.fillStyle =
      "rgba(255,255,255,.28)";


    ctx.fillRect(
      barX,
      y,
      barWidth,
      6
    );


    ctx.fillStyle =
      "#ffffff";


    ctx.fillRect(
      barX,
      y,
      barWidth * (progress / 100),
      6
    );


    /*
    ========================================
    MARCA
    ========================================
    */

    ctx.textAlign =
      "center";


    ctx.fillStyle =
      "rgba(255,255,255,.55)";


    ctx.font =
      '700 16px "DM Sans", Arial, sans-serif';


    ctx.fillText(
      "feito por menegonlucas",
      width / 2,
      height * .95
    );


    /*
    ========================================
    PNG
    ========================================
    */

    const blob =
      await canvasToBlob(
        canvas
      );


    const url =
      URL.createObjectURL(
        blob
      );


    const isMobile =
      /Android|iPhone|iPad|iPod/i
        .test(
          navigator.userAgent
        );


    if (isMobile) {

      const newWindow =
        window.open(
          url,
          "_blank"
        );


      if (!newWindow) {

        window.location.href =
          url;

      }


      downloadStatus.textContent =
        "Imagem aberta. Toque e segure para salvar o PNG.";

    } else {

      const link =
        document.createElement("a");


      link.href =
        url;


      link.download =
        `${getFileName()}.png`;


      document.body.appendChild(
        link
      );


      link.click();


      link.remove();


      downloadStatus.textContent =
        "PNG baixado.";

    }


    setTimeout(
      () => {

        URL.revokeObjectURL(
          url
        );

      },
      60000
    );


  } catch (error) {

    console.error(error);


    downloadStatus.textContent =
      "Não foi possível gerar o PNG.";

  }

}


/* ==================================================
   BLUR REAL DO FUNDO
================================================== */

function drawBlurredBackground(
  ctx,
  image,
  width,
  height,
  blur
) {

  /*
     Primeiro criamos um canvas menor.

     Isso deixa o processamento do blur
     muito mais leve no celular.
  */

  const scale =
    0.25;


  const smallWidth =
    Math.max(
      1,
      Math.round(
        width * scale
      )
    );


  const smallHeight =
    Math.max(
      1,
      Math.round(
        height * scale
      )
    );


  const smallCanvas =
    document.createElement(
      "canvas"
    );


  smallCanvas.width =
    smallWidth;


  smallCanvas.height =
    smallHeight;


  const smallCtx =
    smallCanvas.getContext(
      "2d"
    );


  /*
     Desenhamos a capa reduzida.
  */

  drawImageCover(
    smallCtx,
    image,
    -30,
    -30,
    smallWidth + 60,
    smallHeight + 60
  );


  /*
     Quanto maior o valor do slider,
     mais vezes deslocamos a imagem.

     Isso cria um blur consistente
     sem depender de ctx.filter.
  */

  if (blur === 0) {

    ctx.drawImage(
      smallCanvas,
      0,
      0,
      width,
      height
    );

    return;

  }


  /*
     Quantidade de camadas.

     0-10 = 4
     11-20 = 7
     21-30 = 10
     31-45 = 14
  */

  const layers =
    Math.max(
      4,
      Math.round(
        4 +
        blur * 0.22
      )
    );


  const spread =
    blur * 2.2;


  /*
     Primeira imagem.
  */

  ctx.globalAlpha =
    0.16;


  ctx.drawImage(
    smallCanvas,
    0,
    0,
    width,
    height
  );


  /*
     Camadas deslocadas.
  */

  for (
    let i = 0;
    i < layers;
    i++
  ) {

    const angle =
      (
        Math.PI * 2 * i
      ) / layers;


    const distance =
      spread;


    const offsetX =
      Math.cos(angle) *
      distance;


    const offsetY =
      Math.sin(angle) *
      distance;


    ctx.drawImage(
      smallCanvas,
      offsetX,
      offsetY,
      width,
      height
    );

  }


  /*
     Mais uma camada central
     para preencher o fundo.
  */

  ctx.globalAlpha =
    0.45;


  ctx.drawImage(
    smallCanvas,
    0,
    0,
    width,
    height
  );


  ctx.globalAlpha =
    1;

}


/* =========================
   CARREGAR IMAGEM
========================= */

function loadImage(src) {

  return new Promise(
    (
      resolve,
      reject
    ) => {

      const image =
        new Image();


      image.onload =
        () => resolve(image);


      image.onerror =
        reject;


      image.src =
        src;

    }
  );

}


/* =========================
   COVER
========================= */

function drawImageCover(
  ctx,
  image,
  x,
  y,
  width,
  height
) {

  const imageRatio =
    image.width /
    image.height;


  const boxRatio =
    width /
    height;


  let sourceWidth =
    image.width;


  let sourceHeight =
    image.height;


  let sourceX =
    0;


  let sourceY =
    0;


  if (
    imageRatio >
    boxRatio
  ) {

    sourceWidth =
      image.height *
      boxRatio;


    sourceX =
      (
        image.width -
        sourceWidth
      ) / 2;

  } else {

    sourceHeight =
      image.width /
      boxRatio;


    sourceY =
      (
        image.height -
        sourceHeight
      ) / 2;

  }


  ctx.drawImage(

    image,

    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,

    x,
    y,
    width,
    height

  );

}


/* =========================
   QUEBRA DO TÍTULO
========================= */

function wrapText(
  ctx,
  text,
  maxWidth
) {

  const words =
    text.split(/\s+/);


  const lines = [];

  let line = "";


  for (
    const word of words
  ) {

    const test =
      line
        ? `${line} ${word}`
        : word;


    if (
      ctx.measureText(test)
        .width <= maxWidth
      ||
      !line
    ) {

      line =
        test;

    } else {

      lines.push(
        line
      );

      line =
        word;

    }

  }


  if (line) {

    lines.push(
      line
    );

  }


  return lines;

}


/* =========================
   CANVAS → PNG
========================= */

function canvasToBlob(
  canvas
) {

  return new Promise(
    (
      resolve,
      reject
    ) => {

      canvas.toBlob(
        blob => {

          if (blob) {

            resolve(
              blob
            );

          } else {

            reject(
              new Error(
                "Erro ao criar PNG"
              )
            );

          }

        },
        "image/png"
      );

    }
  );

}


/* =========================
   NOME DO ARQUIVO
========================= */

function getFileName() {

  const title =
    titleInput.value.trim()
    || "reading-card";


  return title

    .replace(
      /[^a-z0-9À-ÿ]+/gi,
      "-"
    )

    .replace(
      /^-|-$/g,
      ""
    )

    .toLowerCase()

    || "reading-card";

}


/* =========================
   INICIALIZAÇÃO
========================= */

updatePreview();