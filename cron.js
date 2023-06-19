// const cron = require("node-cron");
// const { Boats } = require("./models");

// async function updateBoats() {
//   const today = new Date().toISOString().split("T")[0];
//   const boats = await Boats.findAll({
//     where: { endDate: today, isDone: false },
//   });

//   for (const boat of boats) {
//     await boat.update({ isDone: true });
//     console.log(``);
//   }
// }
