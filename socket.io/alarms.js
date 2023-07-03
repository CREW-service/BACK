const { Alarms } = require("../models");

module.exports = (io) => {
  // socket.io 연결
  io.on("connetion", (socket) => {
    socket.on("login", async (userId) => {
      console.log(`User ${userId} logged in.`);

      try {
        // 알람 가져오기
        const alarms = await Alarms.findAll({ where: { userId } });
        // 알람을 해당 user에게 전송
        socket.emit("alarms", alarms);
        console.log("알람 전송 완료");
      } catch (e) {
        console.error(`socket 알람 전송 요청이 올바르지 않습니다.`, e);
      }
    });

    socket.on("alarmRead", async (alarmId) => {
      try {
        await Alarms.updateOne({ alarmId }, { isRead: true });
        socket.emit("alarmReadSuccess");
      } catch (e) {
        console.error(`socket 읽음 처리 요청이 올바르지 않습니다.`, e);
      }
    });
  });
};
