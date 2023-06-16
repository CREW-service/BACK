const express = require("express");
const kakao = require("./passport/kakaoStrategy");
const passport = require("passport");
const path = require("path");
require("dotenv").config();

const authRouter = require("./routes/auth");
const boatRouter = require("./routes/boats");
const commentRouter = require("./routes/comments");
const alarmRouter = require("./routes/alarms");
const userRouter = require("./routes/users");

const cookieParser = require("cookie-parser");
const session = require("express-session");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: [
      "*.ysizuku.com",
      "http://localhost:3000",
      "http://react.ysizuku.com",
    ],
    credentials: true,
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

passport.deserializeUser((id, done) => {
  Users.findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((err) => {
      done(err);
    });
});

kakao(); // kakaoStrategy.js의 module.exports를 실행합니다.

app.use("/", [boatRouter, authRouter, commentRouter, alarmRouter, userRouter]);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(PORT, "포트 번호로 서버가 실행되었습니다.");
});
