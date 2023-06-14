const express = require("express");
const router = express.Router();
const authJwt = require("../middlewares/authMiddleware");
const { Users, Boats, Crews, Alarms } = require("../models");

// 1. 모임에 참여했을 때 captain에게 알림 보내기
router.post("/boat/:boatId/join", authJwt, async (req, res) => {
  try {
    // user
    const { userId } = res.locals.user;
    // boatId를 params로
    const { boatId } = req.params;
    // user 정보 가져오기
    const user = await Users.findOne({
      attributes: ["nickName"],
      where: { userId },
      raw: true,
    });
    // isReleased 초기 값 설정
    const isReleased = false;

    // 모집 글 확인
    const boat = await Boats.findOne({
      where: { boatId },
      raw: true,
    });
    if (!boat) {
      return res.status(404).json({ errorMessage: "존재하지 않는 글입니다." });
    }

    // Crews 테이블에 넣어주기
    await Crews.create({
      nickName: user.nickName,
      isReleased,
    });

    // 알림 확인 초기 값
    const isRead = false;
    // 메시지 생성
    const message = `${user.nickName}님이 배에 승선했습니다.`;

    // alarm 생성하기
    await Alarms.create({
      isRead,
      message,
    });

    // 참여 성공
    return res.status(200).json({ message: "참여 성공." });
  } catch (e) {
    console.log(e);
    return res
      .status(400)
      .json({ errorMessage: "참여 실패. 요청이 올바르지 않습니다." });
  }
});

// 2. 내보내기
//      @ 토큰을 검사하고 captain인지 확인
//      @ 확인 후 내보내기
router.post("/boat/:boatId/release", authJwt, async (req, res) => {
  try {
    // user
    const { userId } = res.locals.user;
    // boatId를 params로
    const { boatId } = req.params;
    // body로 isReleased
    const { isReleased, nickName } = req.body;

    // user 정보 가져오기
    const user = await Users.findOne({
      attributes: ["nickName"],
      where: { userId },
      raw: true,
    });

    // 모집 글 정보 가져오기
    const boat = await Boats.findOne({
      attributes: ["captain"],
      where: { boatId },
      raw: true,
    });

    // crewMember 조회
    const crew = await Crews.findAll({
      attributes: ["nickName"],
      where: { boatId, isReleased: false },
      raw,
    });

    // 모집 글 확인
    if (!boat) {
      return res
        .status(404)
        .json({ errorMessage: "존재하지 않는 모집 글입니다." });
    }
    // 유요한 요청인지 확인
    if (isReleased === undefined) {
      return res.status(404).json({ errorMessage: "잘못된 요청입니다." });
    }
    // 내보내기
    if (isReleased) {
      crew.isReleased = isReleased;
    }
    const updateIsReleased = await Crews.save();
    if (!updateIsReleased) {
      return res
        .status(412)
        .json({ errorMessage: "내보내기가 정상적으로 처리되지 못했습니다." });
    }

    // 알림 확인 초기 값
    const isRead = false;

    // alarm 생성하기
    await Alarms.create({
      isRead,
      message,
    });
    return res.status(200).json({ message: "정상적으로 내보내기 완료." });
  } catch (e) {
    console.log(e);
    return res
      .status(400)
      .json({ errorMessage: "내보내기 실패. 요청이 올바르지 않습니다." });
  }
});
module.exports = router;
