const Servo = require('./servo');
const Madrone = require('madronejs').default;
const express = require('express');
const ip = require('ip');

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
  waitTime: undefined,
  port: undefined,
  serverApp: undefined,
  busy: false,

  get ipAddress() {
    return ip.address();
  },

  $init({ waitTime, port } = {}) {
    this.waitTime = waitTime ?? 5000;
    this.port = port ?? 3000;
  },

  start() {
    return Promise.all([this.startServos(), this.startServer()]);
  },

  async startServer() {
    this.serverApp = express();
    this.serverApp.use(express.urlencoded({ extended: true }));
    this.serverApp.use(express.json());

    this.serverApp.post('/answer', (req, res) => {
      if (this.busy) {
        res.send('busy');
      } else {
        this.handleAnswer(req.body);
        res.send('success');
      }
    });

    this.serverApp.listen(this.port, () => {
      console.log(`Paddlemaster listening http://${this.ipAddress}:${this.port}`);
    });
  },

  async startServos() {
    try {
      this.answerServo = Servo.create({ channel: 0, startAngle: NEUTRAL_ANGLE, ...servoConfig });
      this.upServo = Servo.create({ channel: 1, startAngle: DOWN_ANGLE, ...servoConfig });
      await Promise.all([this.answerServo.start(), this.upServo.start()]);
    } catch (e) {
      console.error('error:', e);
    }
  },

  async handleAnswer({ value, waitTime } = {}) {
    try {
      this.busy = true;
      if (value === true) {
        await this.answerYes(waitTime);
      } else if (value === false) {
        await this.answerNo(waitTime);
      }
    } catch (e) {
      console.error('Could not handle answer', e);
    } finally {
      this.busy = false;
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

  async answerYes(waitTime) {
    await this.goUp();
    await this.answerServo.setAngle(YES_ANGLE);
    await wait(waitTime ?? this.waitTime);
    await this.goDown();
  },

  async answerNo(waitTime) {
    await this.goUp();
    await this.answerServo.setAngle(NO_ANGLE);
    await wait(waitTime ?? this.waitTime);
    await this.goDown();
  }
});

