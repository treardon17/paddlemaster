const Servo = require('./servo');

const servoConfig = { minRange: 500, maxRange: 2500 };

async function start() {
  const answerServo = Servo.create({ channel: 0, ...servoConfig });
  const upServo = Servo.create({ channel: 1, ...servoConfig });

  try {
    await Promise.all([answerServo.start(), upServo.start()]);

    // down/neutral
    await answerServo.setAngle(90);
    await upServo.setAngle(80);

    // up
    await upServo.setAngle(170);

    // yes
    await answerServo.setAngle(180);
    // no
    await answerServo.setAngle(0);

    // down/neutral
    await answerServo.setAngle(90);
    await upServo.setAngle(80);
  } catch (e) {
    console.error('error:', e);
  }
}

start();
