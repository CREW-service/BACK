const { Alarms } = require("../models");
const socketLoginCheck = require("../middlewares/socketLoginCheck");

module.exports = (io) => {
  // socket.io 연결
  io.on("connection", (socket) => {
    socket.onAny((event) => {
      console.log(`Socket 연결: ${event}`);
    });

    socket.on("alarms", async (data) => {
      try {
        // 토큰 검사
        await socketLoginCheck(socket, (err) => {
          if (err) {
            return done(err.message);
          }
        });
        const userId = socket.locals.user ? socket.locals.user.userId : null;

        if (userId === null) {
          socket.emit("error", "게스트입니다.");
        }
        if (userId) {
          const alarms = await Alarms.findAll({
            attributes: ["alarmId", "isRead", "message"],
            where: { userId, isRead: false },
            raw: true,
          });

          // alarms 없을 경우
          if (!alarms || alarms.length === 0) {
            socket.emit("error", "조회된 알림이 없습니다.");
          }
          socket.emit("alarms", { data: alarms });
        }
      } catch (e) {
        console.log(e);
      }
    });
  });
};
