const cron = require("node-cron");
const { Op } = require("sequelize");
const { Boats } = require("./models");

async function updateBoats() {
  const today = new Date();
  const boats = await Boats.findAll({
    where: {
      [Op.and]: [{ endDate: { [Op.not]: "" } }],
      isDone: false,
    },
    raw: true,
  });

  for (const boat of boats) {
    if (new Date(boat.endDate) <= today) {
      await Boats.update({ isDone: true }, { where: { boatId: boat.boatId } });
      console.log(`Boat ${boat.boatId} 수정 완료`);
    }
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

const scheduledTask = cron.schedule("0 0 * * *", scheduleBoatsUpdate, {
  scheduled: true,
  timezone: "Asia/Seoul",
});

scheduledTask.start();
