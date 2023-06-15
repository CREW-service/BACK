const passport = require("passport");
const KakaoStrategy = require("passport-kakao").Strategy;
const jwt = require("jsonwebtoken");
const { Users } = require("../models");
const bcrypt = require("bcrypt");

module.exports = () => {
  passport.use(
    new KakaoStrategy(
      {
        clientID: process.env.KAKAO_ID,
        callbackURL: "/auth/kakao/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const existingUser = await Users.findOne({
            where: {
              snsId: profile.id,
              email: profile._json.kakao_account.email,
            },
          });

          if (existingUser && existingUser.snsId === profile.id) {
            const token = jwt.sign(
              {
                userId: existingUser.userId,
              },
              process.env.JWT_SECRET
            );
            done(null, token);
          } else {
            try {
              const saltRounds = 10;
              const randomPassword = Math.random().toString(36).slice(-8);
              const hashedPassword = await bcrypt.hash(
                randomPassword,
                saltRounds
              );

              const newUser = await Users.create({
                email: profile._json.kakao_account.email,
                nickName: profile.displayName,
                snsId: profile.id,
                password: hashedPassword,
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
