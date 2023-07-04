const { Alarms } = require("../models");
const socketLoginCheck = require("../middlewares/socketLoginCheck");

module.exports = (io) => {
  // socket.io 연결
  io.on("connetion", (socket) => {
    console.log(socket);
    socket.onAny((event) => {
      console.log(`Socket 연결: ${event}`);
    });

    socket.on("alarms", async (data) => {
      try {
        await socketLoginCheck(socket, (err) => {
          if (err) {
            return done(err.message);
          }
        });
        const { userId } = socket.locals.user;
        data = await Alarms.findAll({ where: { userId } });
      } catch (e) {
        console.log(e);
      }
    });
  });
};
