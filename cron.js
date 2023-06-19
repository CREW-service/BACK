const cron = require("node-cron");
const { Boats } = require("./models");

async function updateBoats() {
  const today = new Date().toISOString().split("T")[0];
  const boats = await Boats.findAll({
    where: { endDate: today, isDone: false },
  });

  for (const boat of boats) {
    await boat.update({ isDone: true });
    console.log(`Boat ${boat.boatId} marked as done`);
  }
}

async function scheduleBoatsUpdate() {
  try {
    await updateBoats();
    console.log("업데이트 완료.");
  } catch (e) {
    console.error("마감기한 업데이트 에러", e);
  }
}

const scheduledTask = cron.schedule("0 12 * * *", scheduleBoatsUpdate, {
  scheduled: true,
  timezone: "Asia/Seoul",
});

scheduledTask.start();
