const express = require("express");
const router = express.Router();
const authJwt = require("../middlewares/authMiddleware");
const { Users, Boats } = require("../models");

// 1. mypage API
//      @ 토큰을 검사하여 userId에 맞게 모집 글, 참여 글 불러오기
router.get("/mypage", authJwt, async (req, res) => {
  try {
    // user 정보
    const { userId } = res.locals.user;

    // userId에 맞춰 작성한 글 가져오기
    const writeBoats = await Boats.findAll({
      attributes: ["boatId", "title", "createdAt"],
      where: { userId },
      order: [["createdAt", "DESC"]],
      raw: true,
    });

    // userId에 맞춰 참여한 글 가져오기
    const attendedBoats = await Boats.findAll({
      attributes: ["boatId", "title", "createdAt"],
      where: {},
    });
  } catch (e) {
    console.log(e);
    return res.status(400).json({
      errorMessage: "Mypage를 불러오지 못했습니다. 요청이 올바르지 않습니다.",
    });
  }
});

module.exports = router;
