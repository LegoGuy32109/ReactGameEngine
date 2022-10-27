import React from "react";

export default function GraphicDemo() {
  const [visibleInfo, setVisibleInfo] = React.useState({
    showText: true,
    showBorder: true,
    showMandlebrot: true,
    showMandleZoomed: false,
    showImg: false,
    showDraw: true,
  });
  var c = document.getElementById("canvas");
  var ctx = c.getContext("2d");

  // clearing the canvas to be white
  function clearScreen() {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, c.width, c.height);
  }
  clearScreen();

  // image displaying
  if (visibleInfo.showImg) {
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 50, 50);
    };
    img.src = "./wow.jpeg";
  }

  // function to draw pixels of certain sizes
  const pixel = function (x, y, c, p = 1) {
    ctx.fillStyle = c;
    ctx.fillRect(x * p, y * p, p, p);
  };

  // function to generate a mandlebrot set
  function mandleBrot(scale, xcord, ycord) {
    for (let x = 0; x < c.width; x++) {
      for (let y = 0; y < c.height; y++) {
        pixel(x, y, "black");
        let dx = (x - c.width / 2) / scale + xcord;
        let dy = (y - c.height / 2) / scale + ycord;
        let a = dx;
        let b = dy;
        for (let t = 20; t < 200; t++) {
          let d = a * a - b * b + dx;
          b = 2 * (a * b) + dy;
          a = d;
          if (d > 200) {
            pixel(x, y, "rgb(" + t + "," + t * 3 + "," + t * 0.5 + ")");
            break;
          }
        }
      }
    }
  }
  // option to toggle between two mandlebrot generations
  if (visibleInfo.showMandlebrot) {
    visibleInfo.showMandleZoomed
      ? mandleBrot(30000, -0.6, 0.62)
      : mandleBrot(390, -0.3, 0);
  }

  // little smiley face on the right
  if (visibleInfo.showDraw) {
    ctx.strokeStyle = "green";
    ctx.lineWidth = 4;
    let addX = 700;
    let addY = 100;
    ctx.beginPath();
    ctx.arc(addX + 75, addY + 75, 60, 0, Math.PI * 2, true);
    ctx.moveTo(addX + 90, addY + 75);
    ctx.arc(addX + 75, addY + 75, 15, 0, Math.PI, false);
    ctx.moveTo(addX + 55, addY + 45);
    ctx.arc(addX + 50, addY + 45, 5, 0, Math.PI * 2, true);
    ctx.moveTo(addX + 105, addY + 45);
    ctx.arc(addX + 100, addY + 45, 5, 0, Math.PI * 2, true);
    ctx.stroke();
  }

  // draws border of a certain size
  function drawBorder(color, pixelSize) {
    for (let x = 0; x < c.width / pixelSize; x++) {
      pixel(x, 0, color, pixelSize);
    }
    for (let x = 0; x < c.width / pixelSize; x++) {
      pixel(x, c.height / pixelSize - 1, color, pixelSize);
    }
    for (let y = 0; y < c.height / pixelSize; y++) {
      pixel(0, y, color, pixelSize);
    }
    for (let y = 0; y < c.height / pixelSize; y++) {
      pixel(c.width / pixelSize - 1, y, color, pixelSize);
    }
  }
  if (visibleInfo.showBorder) {
    drawBorder("red", 10);
  }

  // simple canvas text
  if (visibleInfo.showText) {
    ctx.fillStyle = "blue";
    ctx.font = "49px serif";
    ctx.fillText("HTML5 canvas is awesome!", 60, 800);
  }

  // basic UI to toggle elements in demo
  return (
    <>
      <h1>2D Graphics Demo</h1>
      <button
        onClick={() =>
          setVisibleInfo((prevInfo) => ({
            ...prevInfo,
            showBorder: !prevInfo.showBorder,
          }))
        }
      >
        Border
      </button>
      <button
        title="Will lag website"
        onClick={() =>
          setVisibleInfo((prevInfo) => ({
            ...prevInfo,
            showMandlebrot: !prevInfo.showMandlebrot,
          }))
        }
      >
        Mandlebrot
      </button>
      {visibleInfo.showMandlebrot && (
        <button
          onClick={() =>
            setVisibleInfo((prevInfo) => ({
              ...prevInfo,
              showMandleZoomed: !prevInfo.showMandleZoomed,
            }))
          }
        >
          Zoomed Mandlebrot set
        </button>
      )}
      <button
        onClick={() =>
          setVisibleInfo((prevInfo) => ({
            ...prevInfo,
            showImg: !prevInfo.showImg,
          }))
        }
      >
        Wacky Image
      </button>
      <button
        onClick={() =>
          setVisibleInfo((prevInfo) => ({
            ...prevInfo,
            showText: !prevInfo.showText,
          }))
        }
      >
        Text
      </button>
      <button
        onClick={() =>
          setVisibleInfo((prevInfo) => ({
            ...prevInfo,
            showDraw: !prevInfo.showDraw,
          }))
        }
      >
        Drawing
      </button>
    </>
  );
}
