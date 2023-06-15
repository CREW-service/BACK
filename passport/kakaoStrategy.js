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
          const exUser = await Users.findOne({
            where: {
              snsId: profile.id,
              email: profile._json.kakao_account.email,
            },
          });

          // 기존 사용자일 경우
          if (exUser) {
            const token = jwt.sign(
              {
                userId: exUser.userId,
              },
              process.env.JWT_SECRET
            );
            done(null, token);
          } else {
            // 새로운 사용자일 경우
            try {
              const newUser = await Users.create({
                email: profile._json.kakao_account.email,
                nickName: profile.displayName,
                snsId: profile.id,
              });

              const token = jwt.sign(
                {
                  userId: newUser.userId,
                },
                process.env.JWT_SECRET
              );
              console.log(token);
              done(null, token);
            } catch (error) {
              console.error(error);
              done(error);
            }
          }
        } catch (error) {
          console.error(error);
          done(error);
        }
      }
    )
  );
};
