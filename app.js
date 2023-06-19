// import
const express = require("express");
const kakao = require("./passport/kakaoStrategy");
const passport = require("passport");
const path = require("path");
// const cron = require("node-cron");
require("dotenv").config();

// router
const authRouter = require("./routes/auth");
const boatRouter = require("./routes/boats");
const commentRouter = require("./routes/comments");
const alarmRouter = require("./routes/alarms");
const mypageRouter = require("./routes/mypage");
const loginRouter = require("./routes/login");

// 설정
const cookieParser = require("cookie-parser");
const session = require("express-session");
const cors = require("cors");

// schedule
// cron.schedule('* * * * *', function () {

// })
// 1. second, 2.minute, 3.hour, 4.dat of month, 5.month, 6. day of week
// app.use
const app = express();

app.use(
  cors({
    origin: [
      "*.ysizuku.com",
      "http://localhost:3000",
      "http://react.ysizuku.com",
    ],
    credentials: true,
    withCredentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      domain: ".ysizuku.com", // .ysizuku.com으로 설정하면 모든 서브도메인에서 쿠키를 사용할 수 있습니다.
      path: "/", // /로 설정하면 모든 페이지에서 쿠키를 사용할 수 있습니다.
      secure: false, // https가 아닌 환경에서도 사용할 수 있습니다.
      httpOnly: false, // 자바스크립트에서 쿠키를 확인할 수 있습니다.
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((token, done) => {
  done(null, token);
});

passport.deserializeUser((token, done) => {
  // 토큰을 이용하여 사용자를 인증 또는 사용자 정보를 가져오는 로직 구현
  // 예시: 토큰에서 userId를 추출하여 사용자 정보를 가져옴
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const userId = decoded.userId;

  Users.findByPk(userId)
    .then((user) => {
      done(null, user); // 사용자 객체를 세션에서 가져옴
    })
    .catch((err) => {
      done(err);
    });
});

kakao(); // kakaoStrategy.js의 module.exports를 실행합니다.

app.use("/", [
  boatRouter,
  authRouter,
  alarmRouter,
  mypageRouter,
  loginRouter,
  commentRouter,
]);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(PORT, "포트 번호로 서버가 실행되었습니다.");
});
