const express = require("express");
const { Users } = require("./models");
const authRouter = require("./routes/auth");
const boatRouter = require("./routes/boats");
const kakao = require("./passport/kakaoStrategy");
const passport = require("passport");

const cookieParser = require("cookie-parser");
const session = require("express-session");

const app = express();
require("dotenv").config();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      domain: "localhost:3000", // .ysizuku.com으로 설정하면 모든 서브도메인에서 쿠키를 사용할 수 있습니다.
      path: "/", // /로 설정하면 모든 페이지에서 쿠키를 사용할 수 있습니다.
      secure: false, // https가 아닌 환경에서도 사용할 수 있습니다.
      httpOnly: false, // 자바스크립트에서 쿠키를 확인할 수 있습니다.
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  console.log("serializeUser", user);
  done(null, user.dataValues.userId);
});

passport.deserializeUser(async (userId, done) => {
  console.log("deserializeUser", userId);
  try {
    const user = await Users.findOne({ where: { userId: userId } });
    console.log("Found user", user);
    done(null, user);
  } catch (error) {
    console.error("Error in deserializeUser", error);
    done(error);
  }
});

kakao(); // kakaoStrategy.js의 module.exports를 실행합니다.

app.use("/", [boatRouter, authRouter]);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(PORT, "포트 번호로 서버가 실행되었습니다.");
});
