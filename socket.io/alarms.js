const { Alarms } = require("../models");

module.exports = (io) => {
  // socket.io 연결
  io.on("connetion", (socket) => {
    socket.onAny((event) => {
      console.log(`Socket Event: ${event}`);
    });

    // userId 체크
    async;
  });
};
