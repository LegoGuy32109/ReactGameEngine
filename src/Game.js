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
  let worldInfo = {
    score: 0,
    walls: { north: 30, south: 620, west: 30, east: 900 },
    wallsMovement: {
      north: { moving: false, shrinking: false, max: 300, min: 25, speed: 0.2 },
      south: { moving: false, shrinking: false, max: 900, min: 600, speed: 1 },
      west: { moving: false, shrinking: false, max: 300, min: 10, speed: 0.7 },
      east: { moving: false, shrinking: false, max: 900, min: 700, speed: 0.4 },
    },
  };
  let collectableInfo = { size: 26, x: 209, y: 300, pickUpRange: 30 };

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
    // drawing player
    ctx.fillRect(playerInfo.x, playerInfo.y, playerInfo.w, playerInfo.h);
    // For animating parts of the game
    timer++;
    // walls
    walls();

    ctx.fillStyle = "white";
    ctx.font = "13px serif";
    ctx.fillText(JSON.stringify(playerInfo), 10, 20);
    // summon collectables
    collectables();
  }
  let timer = 0;

  function walls() {
    ctx.fillStyle = "brown";
    ctx.fillRect(0, worldInfo.walls.south, c.width, c.height); // south
    ctx.fillRect(0, 0, c.width, worldInfo.walls.north); // north
    ctx.fillRect(0, 0, worldInfo.walls.west, c.height); // west
    ctx.fillRect(worldInfo.walls.east, 0, c.width, c.height); // east

    // Triggering movement at a certain score
    if (!worldInfo.wallsMovement.east.moving && worldInfo.score > 1) {
      worldInfo.wallsMovement.east.moving = true;
      worldInfo.wallsMovement.east.shrinking = true;
    }

    if (!worldInfo.wallsMovement.south.moving && worldInfo.score > 3) {
      worldInfo.wallsMovement.south.moving = true;
      worldInfo.wallsMovement.south.shrinking = false;
    }
    if (!worldInfo.wallsMovement.west.moving && worldInfo.score > 5) {
      worldInfo.wallsMovement.west.moving = true;
      worldInfo.wallsMovement.west.shrinking = false;
    }
    if (!worldInfo.wallsMovement.north.moving && worldInfo.score > 7) {
      worldInfo.wallsMovement.north.moving = true;
      worldInfo.wallsMovement.north.shrinking = false;
    }

    // checking each wall's movement, switching direction if neccessary
    Object.keys(worldInfo.wallsMovement).forEach((direction) => {
      if (worldInfo.wallsMovement[direction].moving) {
        collectableOutOfBounds(direction);
        if (worldInfo.wallsMovement[direction].shrinking) {
          worldInfo.walls[direction] -=
            worldInfo.wallsMovement[direction].speed;
          if (
            worldInfo.walls[direction] < worldInfo.wallsMovement[direction].min
          ) {
            worldInfo.wallsMovement[direction].shrinking = false;
          }
        } else {
          worldInfo.walls[direction] +=
            worldInfo.wallsMovement[direction].speed;
          if (
            worldInfo.walls[direction] > worldInfo.wallsMovement[direction].max
          ) {
            worldInfo.wallsMovement[direction].shrinking = true;
          }
        }
      }
    });
  }

  function collectableOutOfBounds(direction) {
    switch (direction) {
      case "south":
        if (collectableInfo.y > worldInfo.walls.south ) {
          worldInfo.wallsMovement.south.shrinking = false;
        }
        break;
      case "east":
        if (collectableInfo.x > worldInfo.walls.east) {
          worldInfo.wallsMovement.east.shrinking = false;
        }
        break;
      case "west":
        if (collectableInfo.x < worldInfo.walls.west) {
          worldInfo.wallsMovement.west.shrinking = true;
        }
        break;
      case "north":
        if (collectableInfo.y < worldInfo.walls.north) {
          worldInfo.wallsMovement.north.shrinking = true;
        }
        break;
      default:
        break;
    }
  }

  function collectables() {
    ctx.fillStyle = "gold";
    // One collectable being spawned
    ctx.save();
    ctx.beginPath();
    ctx.translate(collectableInfo.x, collectableInfo.y);
    ctx.rotate(((timer % 360) * Math.PI) / 180);
    ctx.rect(
      -collectableInfo.size / 2,
      -collectableInfo.size / 2,
      collectableInfo.size,
      collectableInfo.size
    );
    // This modifer for the second square makes a nice rotational complement
    ctx.rotate((((-3.4 * timer) % 360) * Math.PI) / 180);
    ctx.rect(
      -collectableInfo.size / 2,
      -collectableInfo.size / 2,
      collectableInfo.size,
      collectableInfo.size
    );
    ctx.fill();
    ctx.restore();
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

    if (
      playerInfo.x < worldInfo.walls.west ||
      playerInfo.x + playerInfo.w > worldInfo.walls.east
    ) {
      playerInfo.speed.x = -playerInfo.speed.x;
      playerInfo.acc.x = -playerInfo.acc.x;
      playerInfo.x < worldInfo.walls.west
        ? (playerInfo.x += 10)
        : (playerInfo.x -= 10);
    }

    if (
      playerInfo.y < worldInfo.walls.north ||
      playerInfo.y + playerInfo.h > worldInfo.walls.south
    ) {
      playerInfo.speed.y = -playerInfo.speed.y;
      playerInfo.acc.y = -playerInfo.acc.y;
      playerInfo.y < worldInfo.walls.north
        ? (playerInfo.y += 10)
        : (playerInfo.y -= 10);
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

    // set player movement
    playerInfo.speed.y += playerInfo.acc.y;
    playerInfo.y += playerInfo.speed.y;
    playerInfo.speed.x += playerInfo.acc.x;
    playerInfo.x += playerInfo.speed.x;

    // Check if collectible collision was made
    if (
      playerInfo.y - collectableInfo.pickUpRange <
        collectableInfo.y - collectableInfo.size / 2 &&
      playerInfo.y + playerInfo.h + collectableInfo.pickUpRange >
        collectableInfo.y + collectableInfo.size / 2 &&
      playerInfo.x - collectableInfo.pickUpRange <
        collectableInfo.x - collectableInfo.size / 2 &&
      playerInfo.x + playerInfo.w + collectableInfo.pickUpRange >
        collectableInfo.x + collectableInfo.size / 2
    ) {
      worldInfo.score++;
      // Spawn the collectible within the range of the walls
      collectableInfo.x = randomNumber(
        worldInfo.walls.west,
        worldInfo.walls.east
      );
      collectableInfo.y = randomNumber(
        worldInfo.walls.north,
        worldInfo.walls.south
      );
    }
    // Render to the canvas
    screen();
  }

  function randomNumber(min, max) {
    return Math.random() * (max - min) + min;
  }
  return (
    <>
      <h1>JavaScript Game Example</h1>
    </>
  );
}
