import React from "react";
import * as d3 from "d3";
/*
Looking for a way to run setInterval more reliably showed me this article
https://reactfordataviz.com/articles/game-loop-hooks/
The lirary d3 is used to manipulate html pages visually, I'm using it's
timer method as it's less laggy then setInterval.
*/

export default function Game() {
  // I have the canvas grabbed at the beginning of the function
  var c = document.getElementById("canvas");
  var ctx = c.getContext("2d");
  // Keeps a array of current keys being pressed
  let keysActive = [];
  let playerInfo = {
    x: 50,
    y: 50,
    h: 50,
    w: 50,
    speed: { x: 0, y: 0 },
    acc: { x: 0, y: 0 },
    moveSpeed: 0.02,
    friction: 0.5,
  };
  let worldInfo = { ground: 600 };

  // Attach keyboard listeners when page renders
  React.useEffect(() => {
    document.addEventListener("keydown", detectKeyAction, true);
    document.addEventListener("keyup", detectKeyAction, true);
  });

  React.useEffect(() => {
    // The lower two lines act as the update, repeating 60 times a second
    const t = d3.timer(update);
    return () => t.stop();
  }, [update]);

  const detectKeyAction = (e) => {
    let keyUp = e.type === "keyup";
    let keyDown = e.type === "keydown";
    if (keyDown && !keysActive.includes(e.key)) {
      keysActive = [...keysActive, e.key];
    }
    if (keyUp) {
      keysActive = keysActive.filter((key) => key !== e.key);
    }
  };

  // clearing the canvas to be white
  function clearScreen() {
    ctx.fillStyle = "#F0F0F0";
    ctx.fillRect(0, 0, c.width, c.height);
  }

  function screen() {
    clearScreen();
    ctx.fillStyle = "blue";
    ctx.font = "49px serif";
    ctx.fillText("WASD to Move around", 40, 60);
    ctx.fillRect(playerInfo.x, playerInfo.y, playerInfo.w, playerInfo.h);
    ctx.fillStyle = "brown";
    ctx.fillRect(0, worldInfo.ground, c.width, 30);
    ctx.arc(100, 75, 50, 0 * Math.PI, 1.5 * Math.PI);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  function update() {
    // take in user input
    if (keysActive.includes("a")) {
      playerInfo.acc.x -= playerInfo.moveSpeed;
    }
    if (keysActive.includes("d")) {
      playerInfo.acc.x += playerInfo.moveSpeed;
    }
    if (!keysActive.includes("d") && !keysActive.includes("a")) {
      playerInfo.acc.x = 0;
      playerInfo.speed.x > 0
        ? (playerInfo.speed.x -= playerInfo.friction)
        : (playerInfo.speed.x += playerInfo.friction);
      if (Math.abs(playerInfo.speed.x) < playerInfo.friction * 2) {
        playerInfo.speed.x = 0;
      }
    }
    if (keysActive.includes("w")) {
      playerInfo.acc.y -= playerInfo.moveSpeed;
    }
    if (keysActive.includes("s")) {
      playerInfo.acc.y += playerInfo.moveSpeed;
    }
    if (!keysActive.includes("s") && !keysActive.includes("w")) {
      playerInfo.acc.y = 0;
      playerInfo.speed.y > 0
        ? (playerInfo.speed.y -= playerInfo.friction)
        : (playerInfo.speed.y += playerInfo.friction);
      if (Math.abs(playerInfo.speed.y) < playerInfo.friction * 2) {
        playerInfo.speed.y = 0;
      }
    }

    if (playerInfo.x < 0 || playerInfo.x + playerInfo.w > c.width) {
      playerInfo.speed.x = -playerInfo.speed.x;
      playerInfo.acc.x = -playerInfo.acc.x;
      playerInfo.x < 0 ? (playerInfo.x += 10) : (playerInfo.x -= 10);
    }

    if (playerInfo.y < 0 || playerInfo.y + playerInfo.h > worldInfo.ground) {
      playerInfo.speed.y = -playerInfo.speed.y;
      playerInfo.acc.y = -playerInfo.acc.y;
      playerInfo.y < 0 ? (playerInfo.y += 10) : (playerInfo.y -= 10);
    }

    // clamping accelleration
    if (playerInfo.acc.x > 3) {
      playerInfo.acc.x = 3;
    }
    if (playerInfo.acc.x < -3) {
      playerInfo.acc.x = -3;
    }
    if (playerInfo.acc.y > 3) {
      playerInfo.acc.y = 3;
    }
    if (playerInfo.acc.y < -3) {
      playerInfo.acc.y = -3;
    }
    if (playerInfo.speed.x > 30) {
      playerInfo.speed.x = 30;
    }
    if (playerInfo.speed.x < -30) {
      playerInfo.speed.x = -30;
    }
    if (playerInfo.speed.y > 30) {
      playerInfo.speed.y = 30;
    }
    if (playerInfo.speed.y < -30) {
      playerInfo.speed.y = -30;
    }

    playerInfo.speed.y += playerInfo.acc.y;
    playerInfo.y += playerInfo.speed.y;
    playerInfo.speed.x += playerInfo.acc.x;
    playerInfo.x += playerInfo.speed.x;

    // Render to the canvas
    screen();
    ctx.font = "13px serif";
    ctx.fillText(JSON.stringify(playerInfo), 10, 20);
  }

  return (
    <>
      <h1>JavaScript Game Example</h1>
    </>
  );
}
