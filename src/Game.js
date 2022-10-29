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

  const [showLog, setShowLog] = React.useState(false);

  // Information about the player
  let playerInfo = {
    x: 500,
    y: 300,
    h: 50,
    w: 50,
    speed: { x: 0, y: 0 },
    acc: { x: 0, y: 0 },
    moveSpeed: 0.02,
    friction: 0.5,
    maxAcc: 3,
    maxSpeed: 20,
  };
  // Information about the score and walls
  let worldInfo = {
    score: 0,
    walls: {
      north: { pos: 30, moving: false, shrinking: false, max: 300, min: 25, speed: 0.2 },
      south: { pos: 920, moving: false, shrinking: false, max: 900, min: 600, speed: 1 },
      west: { pos: 30, moving: false, shrinking: false, max: 300, min: 10, speed: 0.7 },
      east: { pos: 900, moving: false, shrinking: false, max: 900, min: 700, speed: 0.4 },
    },
  };
  // Where the collectable is and what extra range there is for the player to pick up
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

  // keep array of keysActive updated with the current keys being held
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

  // clearing the canvas to be off-white
  function clearScreen() {
    ctx.fillStyle = "#F0F0F0";
    ctx.fillRect(0, 0, c.width, c.height);
  }

  function screen() {
    // Draw background for screen each frame
    clearScreen();
    // Intro text and score
    if (worldInfo.score === 0) {
      ctx.fillStyle = "blue";
      ctx.font = "49px serif";
      ctx.fillText("WASD to Move around", 70, 100);
    } else {
      ctx.fillStyle = "gray";
      ctx.font = "300px serif";
      ctx.fillText(worldInfo.score, ((worldInfo.walls.east.pos - worldInfo.walls.west.pos) / 2) - 110, ((worldInfo.walls.south.pos - worldInfo.walls.north.pos) / 2) + 100);
    }
    // drawing player
    ctx.fillStyle = "blue";
    ctx.fillRect(playerInfo.x, playerInfo.y, playerInfo.w, playerInfo.h);
    // For animating parts of the game
    timer++;
    // walls
    walls();

    // debug log toggle
    if (showLog) {
      ctx.fillStyle = "white";
      ctx.font = "13px serif";
      ctx.fillText(JSON.stringify(playerInfo), 10, 20);
    }

    // summon collectable
    drawCollectable();
  }
  let timer = 0;

  function walls() {
    // draw walls
    ctx.fillStyle = "brown";
    ctx.fillRect(0, worldInfo.walls.south.pos, c.width, c.height); // south
    ctx.fillRect(0, 0, c.width, worldInfo.walls.north.pos); // north
    ctx.fillRect(0, 0, worldInfo.walls.west.pos, c.height); // west
    ctx.fillRect(worldInfo.walls.east.pos, 0, c.width, c.height); // east

    // Triggering wall movement at a certain score
    if (!worldInfo.walls.east.moving && worldInfo.score > 4) {
      worldInfo.walls.east.moving = true;
      worldInfo.walls.east.shrinking = true;
    }
    if (!worldInfo.walls.south.moving && worldInfo.score > 15) {
      worldInfo.walls.south.moving = true;
      worldInfo.walls.south.shrinking = false;
    }
    if (!worldInfo.walls.west.moving && worldInfo.score > 30) {
      worldInfo.walls.west.moving = true;
      worldInfo.walls.west.shrinking = false;
    }
    if (!worldInfo.walls.north.moving && worldInfo.score > 40) {
      worldInfo.walls.north.moving = true;
      worldInfo.walls.north.shrinking = false;
    }

    // SPEED UP WALLS FOR INFINITY
    if (worldInfo.score > 60) {
      worldInfo.walls.west.speed = worldInfo.score / 60;
      worldInfo.walls.north.speed = worldInfo.score / 100;
      worldInfo.walls.south.speed = worldInfo.score / 55;
      worldInfo.walls.east.speed = worldInfo.score / 120;
    }

    // checking each wall's movement, switching direction if neccessary
    Object.keys(worldInfo.walls).forEach((direction) => {
      if (worldInfo.walls[direction].moving) {
        collectableOutOfBounds(direction);
        if (worldInfo.walls[direction].shrinking) {
          worldInfo.walls[direction].pos -=
            worldInfo.walls[direction].speed;
          if (
            worldInfo.walls[direction].pos < worldInfo.walls[direction].min
          ) {
            worldInfo.walls[direction].shrinking = false;
          }
        } else {
          worldInfo.walls[direction].pos +=
            worldInfo.walls[direction].speed;
          if (
            worldInfo.walls[direction].pos > worldInfo.walls[direction].max
          ) {
            worldInfo.walls[direction].shrinking = true;
          }
        }
      }
    });
  }

  // Moving walls will move over collectable unless they switch direction thanks to this function
  function collectableOutOfBounds(direction) {
    switch (direction) {
      case "south":
        if (collectableInfo.y > worldInfo.walls.south.pos) {
          worldInfo.walls.south.shrinking = false;
        }
        break;
      case "east":
        if (collectableInfo.x > worldInfo.walls.east.pos) {
          worldInfo.walls.east.shrinking = false;
        }
        break;
      case "west":
        if (collectableInfo.x < worldInfo.walls.west.pos) {
          worldInfo.walls.west.shrinking = true;
        }
        break;
      case "north":
        if (collectableInfo.y < worldInfo.walls.north.pos) {
          worldInfo.walls.north.shrinking = true;
        }
        break;
      default:
        break;
    }
  }

  function drawCollectable() {
    ctx.fillStyle = "gold";
    // Saving position to return to after rotating drawing context
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
    if (keysActive.includes("w")) {
      playerInfo.acc.y -= playerInfo.moveSpeed;
    }
    if (keysActive.includes("s")) {
      playerInfo.acc.y += playerInfo.moveSpeed;
    }

    // friction when not moving
    if (!keysActive.includes("d") && !keysActive.includes("a")) {
      playerInfo.acc.x = 0;
      playerInfo.speed.x > 0
        ? (playerInfo.speed.x -= playerInfo.friction)
        : (playerInfo.speed.x += playerInfo.friction);
      if (Math.abs(playerInfo.speed.x) < playerInfo.friction * 2) {
        playerInfo.speed.x = 0;
      }
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

    // bouncing player off of walls
    if (
      playerInfo.x < worldInfo.walls.west.pos ||
      playerInfo.x + playerInfo.w > worldInfo.walls.east.pos
    ) {
      playerInfo.speed.x = -playerInfo.speed.x;
      playerInfo.acc.x = -playerInfo.acc.x;
      playerInfo.x < worldInfo.walls.west.pos
        ? (playerInfo.x += 10)
        : (playerInfo.x -= 10);
    }
    if (
      playerInfo.y < worldInfo.walls.north.pos ||
      playerInfo.y + playerInfo.h > worldInfo.walls.south.pos
    ) {
      playerInfo.speed.y = -playerInfo.speed.y;
      playerInfo.acc.y = -playerInfo.acc.y;
      playerInfo.y < worldInfo.walls.north.pos
        ? (playerInfo.y += 10)
        : (playerInfo.y -= 10);
    }

    // clamping accelleration and speed
    if (playerInfo.acc.x > playerInfo.maxAcc) {
      playerInfo.acc.x = playerInfo.maxAcc;
    }
    if (playerInfo.acc.x < -playerInfo.maxAcc) {
      playerInfo.acc.x = -playerInfo.maxAcc;
    }
    if (playerInfo.acc.y > playerInfo.maxAcc) {
      playerInfo.acc.y = playerInfo.maxAcc;
    }
    if (playerInfo.acc.y < -playerInfo.maxAcc) {
      playerInfo.acc.y = -playerInfo.maxAcc;
    }
    if (playerInfo.speed.x > playerInfo.maxSpeed) {
      playerInfo.speed.x = playerInfo.maxSpeed;
    }
    if (playerInfo.speed.x < -playerInfo.maxSpeed) {
      playerInfo.speed.x = -playerInfo.maxSpeed;
    }
    if (playerInfo.speed.y > playerInfo.maxSpeed) {
      playerInfo.speed.y = playerInfo.maxSpeed;
    }
    if (playerInfo.speed.y < -playerInfo.maxSpeed) {
      playerInfo.speed.y = -playerInfo.maxSpeed;
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
        worldInfo.walls.west.pos,
        worldInfo.walls.east.pos
      );
      collectableInfo.y = randomNumber(
        worldInfo.walls.north.pos,
        worldInfo.walls.south.pos
      );
    }
    // Render to the canvas
    screen();
  }

  // For spawning a new collectable
  function randomNumber(min, max) {
    return Math.random() * (max - min) + min;
  }
  return (
    <>
      <h1>React Game Example</h1>
      <nav>
        <h3>How high can you go? How many points can you collect? Before the bouncy walls drive you CRAZY?!?!</h3>
        <button onClick={() => setShowLog(prevVal => !prevVal)}>Debug Info</button>
      </nav>
    </>
  );
}
