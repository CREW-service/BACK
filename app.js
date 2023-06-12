const express = require("express");
const boatRouter = require("./routes/boats");

const app = express();

app.use(express.json());

app.use("/", [boatRouter]);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(PORT, "포트 번호로 서버가 실행되었습니다.");
});
