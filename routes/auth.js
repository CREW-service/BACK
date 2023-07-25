const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");

//* 카카오로 로그인하기 라우터 ***********************
//? /kakao로 요청오면, 카카오 로그인 페이지로 가게 되고, 카카오 서버를 통해 카카오 로그인을 하게 되면, 다음 라우터로 요청한다.
router.get("/auth/kakao", passport.authenticate("kakao"));

//? 위에서 카카오 서버 로그인이 되면, 카카오 redirect url 설정에 따라 이쪽 라우터로 오게 된다.
router.get(
  "/auth/kakao/callback",
  //? 그리고 passport 로그인 전략에 의해 kakaoStrategy로 가서 카카오계정 정보와 DB를 비교해서 회원가입시키거나 로그인 처리하게 한다.
  passport.authenticate("kakao", {
    failureRedirect: "/", // kakaoStrategy에서 실패한다면 실행
  }),
  // kakaoStrategy에서 성공한다면 콜백 실행
  (req, res) => {
    const token = req.user; // 사용자 토큰 정보 (예: JWT 토큰)
    const age = 120000; // 2시간 (밀리초 단위)
    res.append(
      "Set-Cookie",
      `authorization=Bearer ${token}; Max-Age=${age}; Secure; SameSite=None; Domain=.spa-mall.shop; Path=/`
    );
    res.redirect("https://www.spa-mall.shop");
  }
);

router.get("/auth/logout", async (req, res) => {
  try {
    req.session.destroy();
    res.cookie("authorization", {
      domain: ".spa-mall.shop", // 쿠키를 설정할 때 사용한 도메인과 동일한 값을 사용합니다.
      path: "/", // 쿠키를 설정할 때 사용한 경로와 동일한 값을 사용합니다.
      expires: new Date(0), // 쿠키 만료 시간을 1970년 1월 1일로 설정하여 쿠키를 삭제합니다.
      secure: true, // 쿠키를 "Secure" 속성으로 설정했다면 true로 설정합니다.
      sameSite: "None",
    });
    res.status(200).json({ message: "로그아웃 성공" });
  } catch (e) {
    console.error(e.message);
    throw new Error("로그아웃 실패");
  }
});
module.exports = router;
