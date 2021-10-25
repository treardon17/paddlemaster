const Madrone = require('madronejs').default;
const i2cBus = require('i2c-bus');
const Pca9685Driver = require('pca9685').Pca9685Driver;

module.exports = Madrone.Model.create({
  channel: undefined,
  minRange: 0,
  maxRange: 0,
  startPos: undefined,
  currentPos: undefined,
  driverOptions: undefined,
  pwm: undefined,
  active: false,
  instructionQueue: [],

  $init({ channel, startAngle, minRange, maxRange, driverOptions } = {}) {
    this.channel = channel;
    this.minRange = minRange;
    this.maxRange = maxRange;
    this.startPos = this.getAngle(startAngle ?? this.minRange);
    this.driverOptions = driverOptions || {
      i2c: i2cBus.openSync(1),
      address: 0x40,
      frequency: 50,
      debug: false,
    };
  },

  initDriver() {
    return new Promise((resolve, reject) => {
      this.pwm = new Pca9685Driver(this.driverOptions, (err) => {
        if (err){
          reject();
        } else {
          resolve();
        }
      });
    });
  },

  async start() {
    await this.initDriver();
    await this.pos(this.startPos);
  },

  getTimeToPos(pos) {
    return Math.abs(this.currentPos - pos);
  },

  addInstruction(instruction, run = true) {
    if (typeof instruction === 'function') {
      this.instructionQueue.push(instruction);
    }

    if (run) {
      this.runInstructionIfNeeded();
    }
  },

  async runInstructionIfNeeded() {
    if (this.instructionQueue.length && !this.active) {
      try {
        this.active = true;
        await this.instructionQueue.shift()()
      } catch (e) {
        console.error(`instruction failed: (channel ${this.channel})`, e);
      } finally {
        this.active = false;
        await this.runInstructionIfNeeded();
      }
    }
  },

  getAngle(angle) {
    return ((angle / 180) * (this.maxRange - this.minRange)) + this.minRange;
  },

  setAngle(angle) {
    const newAngle = this.getAngle(angle);

    return this.pos(newAngle);
  },

  pos(pos) {
    return new Promise((resolve, reject) => {
      this.addInstruction(() => this.setPos(pos).then(resolve).catch(reject), true);
    });
  },

  setPos(pos) {
    return new Promise((resolve, reject) => {
      if (!this.pwm) reject(new Error('PWM not initialized'));

      let goToPos;
  
      switch (true) {
        case pos === this.currentPos:
          break;
        case typeof pos !== 'number':
        case pos <= this.minRange:
          goToPos = this.minRange;
          break;
        case pos >= this.maxRange:
          goToPos = this.maxRange;
          break;
        default:
          goToPos = pos;
          break;
      }
  
      if (goToPos != null) {
        this.pwm.setPulseLength(this.channel, goToPos);
        setTimeout(resolve, this.getTimeToPos(goToPos));
        this.currentPos = goToPos;
      }
    });
  },
});
