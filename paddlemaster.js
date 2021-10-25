const Servo = require('./servo');
const Madrone = require('madronejs').default;

const servoConfig = { minRange: 500, maxRange: 2500 };
const YES_ANGLE = 180;
const NO_ANGLE = 0;
const NEUTRAL_ANGLE = 90;
const UP_ANGLE = 170;
const DOWN_ANGLE = 80;

const wait = (time) => new Promise((resolve) => {
  setTimeout(resolve, time);
});

module.exports = Madrone.Model.create({
  upServo: undefined,
  answerServo: undefined,
  waitTime: 5000,

  $init() {
    this.start();
  },

  async start() {
    try {
      this.answerServo = Servo.create({ channel: 0, startAngle: NEUTRAL_ANGLE, ...servoConfig });
      this.upServo = Servo.create({ channel: 1, startAngle: DOWN_ANGLE, ...servoConfig });
      await Promise.all([this.answerServo.start(), this.upServo.start()]);
    } catch (e) {
      console.error('error:', e);
    }
  },

  async goDown() {
    // down/neutral
    await this.answerServo.setAngle(NEUTRAL_ANGLE);
    await this.upServo.setAngle(DOWN_ANGLE);
  },

  async goUp() {
    await this.upServo.setAngle(UP_ANGLE);
  },

  async answerYes() {
    await this.goUp();
    await this.answerServo.setAngle(YES_ANGLE);
    await wait(this.waitTime);
    await this.goDown();
  },

  async answerNo() {
    await this.goUp();
    await this.answerServo.setAngle(NO_ANGLE);
    await wait(this.waitTime);
    await this.goDown();
  }
});

