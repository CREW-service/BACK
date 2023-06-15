const passport = require("passport");
const KakaoStrategy = require("passport-kakao").Strategy;
const jwt = require("jsonwebtoken");
const { Users } = require("../models");

module.exports = () => {
  passport.use(
    new KakaoStrategy(
      {
        clientID: process.env.KAKAO_ID,
        callbackURL: "/auth/kakao/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log(profile);
          const exUser = await Users.findOne({
            where: {
              email: profile._json.kakao_account.email,
            },
          });

          // 기존 사용자일 경우a
          if (exUser) {
            const token = jwt.sign(
              {
                userId: exUser.userId,
              },
              process.env.JWT_SECRET
            );
            return done(null, token);
          } else {
            // 새로운 사용자일 경우
            const newUser = await Users.create({
              email: profile._json.kakao_account.email,
              nickName: profile.displayName,
              snsId: profile.id,
            });
            console.log("newUser : ", newUser);

            const token = jwt.sign(
              {
                userId: newUser.userId,
              },
              process.env.JWT_SECRET
            );
            console.log(token);
            return done(null, token);
          }
        } catch (error) {
          console.error(error);
          done(error);
        }
      }
    )
  );
};
