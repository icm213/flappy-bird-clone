import Phaser from "phaser";
import PlayScene from "./scenes/PlayScene";

const WIDTH = 800;
const HEIGHT = 600;
const BIRD_POSITION = { x: WIDTH * 0.1, y: HEIGHT * 0.5 };

const SHARED_CONFIG = {
  width: WIDTH,
  height: HEIGHT,
  startPosition: BIRD_POSITION,
};

const config = {
  type: Phaser.AUTO,
  ...SHARED_CONFIG,
  physics: {
    default: "arcade",
    arcade: {
      debug: true,
    },
  },
  scene: [new PlayScene(SHARED_CONFIG)],
};

const VELOCITY = 200;
const PIPES_TO_RENDER = 4;

let bird = null;
let pipes = null;

let pipeHorizontalDistance = 0;

const pipeVerticalDistanceRange = [150, 250];
const pipeHorizontalDistanceRange = [400, 500];

const flapVelocity = 250;
const initalBirdPosition = { x: config.width * 0.1, y: config.height / 2 };

function preload() {
  this.load.image("pipe", "assets/pipe.png");
}

function create() {
  pipes = this.physics.add.group();

  for (let i = 0; i < PIPES_TO_RENDER; i++) {
    const upperPipe = pipes.create(0, 0, "pipe").setOrigin(0, 1);
    const lowerPipe = pipes.create(0, 0, "pipe").setOrigin(0, 0);

    placePipe(upperPipe, lowerPipe);
  }

  pipes.setVelocityX(-200);

  this.input.on("pointerdown", flap);
  this.input.keyboard.on("keydown_SPACE", flap);
}

function update(time, delta) {
  if (bird.y > config.height || bird.y < -bird.height) {
    restartBirdPosition();
  }
  recyclePipe();
}

function recyclePipe() {
  const tempPipes = [];
  pipes.getChildren().forEach((pipe) => {
    if (pipe.getBounds().right <= 0) {
      tempPipes.push(pipe);
      if (tempPipes.length === 2) {
        placePipe(...tempPipes);
      }
    }
  });
}

function placePipe(uPipe, lPipe) {
  const rightMostX = getRightMostPipe();
  let pipeVerticalDistance = Phaser.Math.Between(...pipeVerticalDistanceRange);
  let pipeVerticalPosition = Phaser.Math.Between(
    0 + 20,
    config.height - 20 - pipeVerticalDistance
  );
  let pipeHorizontalDistance = Phaser.Math.Between(
    ...pipeHorizontalDistanceRange
  );

  uPipe.x = rightMostX + pipeHorizontalDistance;
  uPipe.y = pipeVerticalPosition;

  lPipe.x = uPipe.x;
  lPipe.y = uPipe.y + pipeVerticalDistance;
}

function getRightMostPipe() {
  let rightMostX = 0;
  pipes.getChildren().forEach((pipe) => {
    rightMostX = Math.max(pipe.x, rightMostX);
  });
  return rightMostX;
}

function restartBirdPosition() {
  bird.x = initalBirdPosition.x;
  bird.y = initalBirdPosition.y;
  bird.body.velocity.y = 0;
}

function flap() {
  bird.body.velocity.y = -flapVelocity;
}

new Phaser.Game(config);
