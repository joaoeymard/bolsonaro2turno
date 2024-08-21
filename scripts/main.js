// Seleção de elementos do DOM
const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");
const $main = document.querySelector("#main");
const $menu = document.querySelector("#menu");

// Carregamento da fonte personalizada
const pantonFont = new FontFace(
  "myPantonFont",
  "url(./assets/panton-extrabold.otf)"
);
pantonFont.load().then(function (font) {
  document.fonts.add(font); // Adiciona a fonte ao documento
});

// Função para alternar entre as páginas
function tooglePages() {
  $menu.classList.toggle("hidden");
  $main.classList.toggle("hidden");
}

// Carregamento de imagens
const baseImageFigure = new Image();
baseImageFigure.src = "./apoioaobrasil.png?v=2";

const baseImageFiltro = new Image();
baseImageFiltro.src = "./bannerInicialBrasil.png?v=2";

const baseImageMascara = new Image();
baseImageMascara.src = "./mascaraBrasil.png?v=2";

let baseImageUsuario = new Image();

// Eventos de clique nos botões
document.querySelectorAll(".btnActions").forEach((b) => {
  b.addEventListener("click", clickMenu, true);
});
document.querySelector("input[type=text]").addEventListener("keyup", (ev) => {
  ev.preventDefault();
  drawFigureName();
});

// Função que gera as ações dos cliques nos botões
function clickMenu(ev) {
  const target = ev.currentTarget;
  const { mtype } = target.dataset;

  switch (mtype) {
    case "figure-name":
      tooglePages();
      document.querySelector("input[name=yourname]").type = "text";
      document.querySelector("input[name=yourname]").value = "";
      drawFigureName();

      break;
    case "filter-photo":
      tooglePages();
      document.querySelector("input[name=yourname]").type = "file";
      document.querySelector("input[name=yourname]").value = "";
      document.querySelector("input[name=yourname]").file = "";
      // drawArte();

      break;
    case "page-back":
      tooglePages();
      break;
    case "save":
      saveImage(ev);
      break;
    case "share":
      shareImage(ev);
      break;
  }
}

// Função para desenhar a figura e o nome caso exista
function drawFigureName() {
  const $input = document.querySelector("input[name=yourname]");

  context.drawImage(baseImageFigure, 0, 0);
  context.save();

  if ($input.value.trim()) {
    context.translate(1080 / 2, 335);
    context.rotate((-6.81 * Math.PI) / 180);

    context.textBaseline = "middle";
    context.font = "125px myPantonFont";

    const width = context.measureText($input.value.trim()).width;

    context.fillStyle = "#0c67ce";
    roundRect(context, -width / 2 - 45, -175 / 2, width + 45 * 2, 175, 21.66);

    context.fillStyle = "white";
    context.fillText($input.value.trim(), -width / 2, 0);
    context.restore();
  }
}

// Função para desenhar um retângulo com bordas arredondadas
function roundRect(ctx, x, y, width, height, radius = 5) {
  if (typeof radius === "number") {
    radius = { tl: radius, tr: radius, br: radius, bl: radius };
  } else {
    radius = { tl: 0, tr: 0, br: 0, bl: 0, ...radius };
  }

  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(
    x + width,
    y + height,
    x + width - radius.br,
    y + height
  );
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
  ctx.fill();
}

// Função assíncrona para compartilhar a imagem
async function shareImage() {
  try {
    gtag("event", "share");

    canvas.toBlob((blob) => {
      const filesArray = [
        new File(
          [blob],
          document.querySelector("input").value.trim() + ".jpg",
          {
            type: "image/jpeg",
            lastModified: new Date().getTime(),
          }
        ),
      ];

      const shareData = {
        files: filesArray,
      };

      navigator.share(shareData);
    }, "image/jpeg");
  } catch (error) {
    console.error("Erro ao compartilhar a imagem:", error);
  }
}

// Função para salvar a imagem (a ser implementada)
function saveImage() {
  // Implementar a funcionalidade de salvar imagem
}
