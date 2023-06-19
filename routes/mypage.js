const express = require("express");
const router = express.Router();
const authJwt = require("../middlewares/authMiddleware");
const { Boats, Crews } = require("../models");

// mypage API
// 토큰을 검사하여 userId에 맞게 모집 글, 참여 글 불러오기
router.get("/mypage", authJwt, async (req, res) => {
  try {
    // user 정보
    const { userId } = res.locals.user;

    // userId에 맞춰 작성한 글 가져오기
    const writedBoats = await Boats.findAll({
      attributes: ["boatId", "title", "createdAt"],
      where: { userId },
      order: [["createdAt", "DESC"]],
      raw: true,
    });

    // crews 테이블에서 참여한 boatId 찾기
    const attendedBoatsData = await Crews.findAll({
      attributes: ["boatId"],
      where: { userId },
      raw: true,
    });

    const attendedBoats = [];

    for (let i = 0; i < attendedBoatsData.length; i++) {
      const boatId = attendedBoatsData[i].boatId;

      const boat = await Boats.findOne({
        attributes: ["boatId", "title", "createdAt"],
        where: { boatId },
        raw: true,
      });

      if (boat) {
        attendedBoats.push(boat);
      }
    }

    return res.status(200).json({
      writedBoats,
      attendedBoats: attendedBoats,
    });
  } catch (e) {
    console.log(e);
    return res.status(400).json({
      errorMessage: "Mypage를 불러오지 못했습니다. 요청이 올바르지 않습니다.",
    });
  }
});

module.exports = router;
