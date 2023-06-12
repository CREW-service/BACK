const passport = require("passport");
const KakaoStrategy = require("passport-kakao").Strategy;
const bcrypt = require("bcrypt");

const { Users } = require("../models/");

module.exports = () => {
  passport.use(
    new KakaoStrategy(
      {
        // clientID: 'c4d10a107beb976aa9c0f0d20e817899', // 카카오 로그인에서 발급받은 REST API 키
        clientID: process.env.KAKAO_ID, // 카카오 로그인에서 발급받은 REST API 키
        callbackURL: "/user/kakao/callback", // 카카오 로그인 Redirect URI 경로
      },
      /*
       * clientID에 카카오 앱 아이디 추가
       * callbackURL: 카카오 로그인 후 카카오가 결과를 전송해줄 URL
       * accessToken: 로그인 성공 후 카카오가 보내준 토큰
       * profile: 카카오가 보내준 유저 정보. profile의 정보를 바탕으로 회원가입
       */
      async (accessToken, profile, done) => {
        console.log("kakao profile : ", profile);
        try {
          const exUser = await Users.findOne({
            where: { userId: profile.id },
          });

          // 이미 가입된 카카오 프로필이면 성공
          if (exUser) {
            done(null, exUser); // 로그인 인증 완료
          }

          // 이메일 중복 확인
          const exEmailUser = await Users.findOne({
            where: { email: profile._json.kakao_account.email },
          });
          if (exEmailUser) {
            // 이메일이 이미 있다면 로그인 인증 완료
            return done(null, exEmailUser);
          }

          const saltRounds = 10; // salt가 몇 글자인지 설정
          const randomPsassword = Math.random().toString(36).slice(-8); // 랜덤 비밀번호 생성

          bcrypt.hash(randomPsassword, saltRounds, async (err, hash) => {
            if (err) {
              console.log(err);
              return;
            }
            // 가입되지 않는 유저면 회원가입 시키고 로그인을 시킨다
            const newUser = await Users.create({
              email: profile._json.kakao_account.email,
              nickName: profile.displayName,
              userId: profile.id,
              provider: "kakao",
              password: hash,
              user_type: "",
            });
            console.log("newUser : ", newUser);
            done(null, newUser); // 회원가입하고 로그인 인증 완료
          });
        } catch (error) {
          console.error(error);
          done(error);
        }
      }
    )
  );
};
