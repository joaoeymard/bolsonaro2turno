// Seleção de elementos do DOM
const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");
const $main = document.querySelector("#main");
const $menu = document.querySelector("#menu");
const $inputUser = $main.querySelector("input[name=user]");

// Variável para armazenar a moldura selecionada
let moldura = null;

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
  clearInputUser();

  $menu.classList.toggle("hidden");
  $main.classList.toggle("hidden");
}

function clearInputUser() {
  $inputUser.type = "text";
  $inputUser.value = "";
  $inputUser.file = "";
}

// Crie um objeto URL a partir da string da URL
const urlObj = new URL(window.location.href);

// Use URLSearchParams para acessar os parâmetros da query string
const params = new URLSearchParams(urlObj.search);

// Verifique se o parâmetro "m" existe
if (params.has("m")) {
  moldura = molduras.find((m) => m.dominio === params.get("m"));
}

// Carregamento de imagens
const baseImgEscolhaImagem = new Image();
baseImgEscolhaImagem.src = "./assets/imgEscolhaImagem.png";

const baseImageFigure = new Image();
baseImageFigure.src = moldura.imagens.figureName;

const baseImageMascara = new Image();
baseImageMascara.src = moldura.imagens.figureFilter;

let baseImageUsuario = new Image();

// Evento de carregamento da imagem de apoio ao Brasil
if (moldura.imagens.thumbnailName) {
  $menu.querySelector(".btnFigure img").src = moldura.imagens.thumbnailName;
} else {
  $menu.querySelector(".btnFigure").classList.add("hidden");
}

if (moldura.imagens.thumbnailFilter) {
  $menu.querySelector(".btnFilter img").src = moldura.imagens.thumbnailFilter;
} else {
  $menu.querySelector(".btnFilter").classList.add("hidden");
}

// Eventos de clique nos botões
document.querySelectorAll(".btnActions").forEach((b) => {
  b.addEventListener("click", clickMenu);
});
$inputUser.addEventListener("keyup", (ev) => {
  ev.preventDefault();
  drawFigureName();
});
$inputUser.addEventListener("change", (ev) => {
  ev.preventDefault();

  if ($inputUser.type === "file") drawFilterPhoto();
});

// Função que gera as ações dos cliques nos botões
function clickMenu(ev) {
  const target = ev.currentTarget;
  const { mtype } = target.dataset;

  switch (mtype) {
    case "figure-name":
      tooglePages();

      $inputUser.type = "text";
      drawFigureName();

      break;
    case "filter-photo":
      tooglePages();

      $inputUser.type = "file";
      drawFilterPhoto();

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
  const $input = $inputUser;

  context.drawImage(baseImageFigure, 0, 0);
  context.save();

  if ($input.value.trim()) {
    context.translate(
      moldura.styleName.translateX,
      moldura.styleName.translateY
    );
    context.rotate(moldura.styleName.rotate);

    context.textBaseline = "middle";
    context.font = "125px myPantonFont";

    const width = context.measureText($input.value.trim()).width;

    context.fillStyle = moldura.styleName.background;
    roundRect(context, -width / 2 - 45, -175 / 2, width + 45 * 2, 175, 21.66);

    context.fillStyle = moldura.styleName.color;
    context.fillText($input.value.trim(), -width / 2, 0);
    context.restore();
  }
}

// Função para desenhar a figura e a foto do usuário
function drawFilterPhoto() {
  const $input = $inputUser;

  context.drawImage(baseImgEscolhaImagem, 0, 0);
  context.drawImage(baseImageMascara, 0, 0);
  context.save();

  if ($input.files.length) {
    const reader = new FileReader();

    reader.onload = function (e) {
      context.clearRect(0, 0, 1080, 1080);

      baseImageUsuario.src = e.target.result;
      baseImageUsuario.onload = function () {
        if (baseImageUsuario.width < baseImageUsuario.height) {
          context.drawImage(
            baseImageUsuario,
            0,
            (baseImageUsuario.height - baseImageUsuario.width) / 2,
            baseImageUsuario.width,
            baseImageUsuario.width,
            0,
            0,
            1080,
            1080
          );
        } else {
          context.drawImage(
            baseImageUsuario,
            (baseImageUsuario.width - baseImageUsuario.height) / 2,
            0,
            baseImageUsuario.height,
            baseImageUsuario.height,
            0,
            0,
            1080,
            1080
          );
        }

        context.drawImage(baseImageMascara, 0, 0, 1080, 1080);
      };
    };

    reader.readAsDataURL($input.files[0]);
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

    const arqName = "figure" + new Date().getTime();

    canvas.toBlob((blob) => {
      const shareData = {
        files: [
          new File([blob], arqName + ".jpg", {
            type: "image/jpeg",
            lastModified: new Date().getTime(),
          }),
        ],
      };

      if (navigator.canShare && navigator.canShare(shareData)) {
        navigator
          .share(shareData)
          .then(() => {
            console.log("Compartilhado com sucesso!");
          })
          .catch((error) => {
            alert("Erro ao compartilhar: ", error.message);
          });
      } else {
        alert("Não é possível compartilhar.");
      }
    });
  } catch (error) {
    gtag("event", "exception", {
      description: "[fn:shareImage] " + (error.message || error),
      fatal: false,
    });
    alert(
      "Não foi possível compartilhar a imagem: " + (error.message || error)
    );
  }
}

// Função para salvar a imagem (a ser implementada)
function saveImage() {
  try {
    gtag("event", "download");

    const arqName = "figure" + new Date().getTime();

    const a = document.createElement("a");
    a.setAttribute("href", canvas.toDataURL("image/png"));
    a.setAttribute("download", arqName);
    a.click();
  } catch (error) {
    gtag("event", "exception", {
      description: "[fn:saveImage] " + (error.message || error),
      fatal: false,
    });
    alert("Não foi possível baixar a imagem: " + (error.message || error));
  }
}
