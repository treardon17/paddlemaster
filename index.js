const Servo = require('./servo');
const Paddlemaster = require('./paddlemaster');

async function start() {
  const paddlemaster = Paddlemaster.create();

  await paddlemaster.start();

  // await paddlemaster.goDown();

  await paddlemaster.answerNo();

  // const answerServo = Servo.create({ channel: 0, ...servoConfig });
  // const upServo = Servo.create({ channel: 1, ...servoConfig });

  // try {
  //   await Promise.all([answerServo.start(), upServo.start()]);

  //   // down/neutral
  //   await answerServo.setAngle(90);
  //   await upServo.setAngle(80);

  //   // up
  //   await upServo.setAngle(170);

  //   // yes
  //   await answerServo.setAngle(180);
  //   // no
  //   await answerServo.setAngle(0);

  //   // down/neutral
  //   await answerServo.setAngle(90);
  //   await upServo.setAngle(80);
  // } catch (e) {
  //   console.error('error:', e);
  // }
}

start();
