const cron = require("node-cron");
const { Op } = require("sequelize");
const { Boats } = require("./models");

// 보트 업데이트 함수
const updateBoats = async () => {
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
      console.log(`보트 ${boat.boatId} 수정 완료`);
    }
  }
};

// 보트 업데이트 일정 설정 함수
const scheduleBoatsUpdate = async () => {
  try {
    await updateBoats();
    console.log("업데이트 완료.");
  } catch (e) {
    console.error("마감기한 업데이트 에러", e);
  }
};

// 크론 작업 생성 및 시작
const scheduledTask = cron.schedule("0 0 * * *", scheduleBoatsUpdate, {
  scheduled: true,
  timezone: "Asia/Seoul",
});

scheduledTask.start();
