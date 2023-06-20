const express = require("express");
const router = express.Router();
const authJwt = require("../middlewares/authMiddleware");
const { sequelize, Users, Boats, Crews, Alarms } = require("../models");

// 0. 회원에 해당하는 알림 목록 조회 API
//    @ 로그인한 회원을 확인
//    @ Alarms 테이블을 통해 확인하기
router.get("/alarm", authJwt, async (req, res) => {
  try {
    // user 정보
    const { userId } = res.locals.user;

    // user 정보에 맞춰 알람 호출 해주기
    const alarms = await Alarms.findAll({
      attributes: ["alarmId", "isRead", "message"],
      where: { userId },
      raw: true,
    });

    // alarms 없을 경우
    if (!alarms) {
      return res.status(404).json({ errorMessage: "조회된 알림이 없습니다." });
    }

    return res.status(200).json({ alarms });
  } catch (e) {
    console.log(e);
    return res
      .status(400)
      .json({ errorMessage: "알람 목록조회 실패. 요청이 올바르지 않습니다." });
  }
});

// 1. 참가하기 API
//    @ 로그인한 회원을 확인
//    @ 글의 maxCrewNum와 crewNum을 확인해서 참가 가능 여부 설정
router.post("/boat/:boatId/join", authJwt, async (req, res) => {
  try {
    // user 정보
    const { userId, email } = res.locals.user;
    const user = await Users.findOne({
      attributes: ["nickName"],
      where: { userId },
      raw: true,
    });
    // params로 boatId
    const { boatId } = req.params;

    // 글에서 maxCrewNum와 crewNum을 확인하기
    const boat = await Boats.findOne({
      attributes: [
        "userId",
        "boatId",
        "email",
        "maxCrewNum",
        [
          sequelize.literal(
            `(SELECT COUNT(*) FROM Crews WHERE Boats.boatId = Crews.boatId) + 1`
          ),
          "crewNum",
        ],
      ],
      raw: true,
    });

    // 글이 존재하지 않을 경우
    if (!boat) {
      return res.status(404).json({ errorMessage: "글이 존재하지 않습니다." });
    }

    if (boat.email === email) {
      return res
        .status(400)
        .json({ errorMessage: "본인이 작성한 글에는 참가할 수 없습니다." });
    } else {
      // 이미 참가한 사용자인지 확인
      const existingCrew = await Crews.findOne({
        where: { userId, boatId },
        raw: true,
      });
      if (existingCrew) {
        return res.status(400).json({ errorMessage: "이미 참가한 글입니다." });
      }
    }
    // maxCrewNum, crewNum 숫자 비교
    if (boat.maxCrewNum > boat.crewNum) {
      await Crews.create({
        userId,
        boatId,
        nickName: user.nickName,
        isReleased: false,
      });
      await Alarms.create({
        userId: boat.userId,
        isRead: false,
        message: `${user.nickName}님이 모임에 참가했습니다.`,
      });
      return res.status(200).json({ message: "참가 성공." });
    } else {
      return res.status(203).json({ message: "모집이 마감되었습니다." });
    }
  } catch (e) {
    console.log(e);
    return res
      .status(400)
      .json({ errorMessage: "참가 요청 실패. 요청이 올바르지 않습니다." });
  }
});

// 2. 내보내기 API
//    @ 토큰을 검사하여 권한을 확인
//    @ 내보내면 Crews에서 isReleased를 true로 전환, Alarms를 이용해 알림 생성
router.post("/boat/:boatId/release", authJwt, async (req, res) => {
  try {
    // user 정보
    const { userId, email } = res.locals.user;
    // params로 boatId
    const { boatId } = req.params;
    const boat = await Boats.findOne({
      attributes: ["userId", "keyword", "email"],
      where: { boatId },
      raw: true,
    });
    // body로 내보낼 crew의 nickName 보내기
    const { nickName } = req.body;

    // 글 확인
    if (!boat) {
      return res.status(404).json({ errorMessage: "글이 존재하지 않습니다." });
    }

    // 권한이 있는지 확인하기
    if (userId !== boat.userId || email !== boat.email) {
      return res
        .status(401)
        .json({ errorMessage: "모임 내보내기 권한이 없습니다." });
    }

    // boatId로 crew 조회
    const crew = await Crews.findOne({
      attributes: ["userId"],
      where: { boatId, nickName },
      raw: true,
    });

    // crew 확인
    if (crew) {
      const updateCount = await Crews.update(
        { isReleased: true },
        { where: { boatId, nickName } }
      );
      if (!updateCount) {
        return res.status(404).json({ errorMessage: "내보내기 실패." });
      } else {
        await Alarms.create({
          userId: crew.userId,
          isRead: false,
          message: `${boat.keyword} 모임에서 내보내졌습니다.`,
        });
        return res.status(200).json({ message: "내보내기 성공." });
      }
    } else {
      return res
        .status(412)
        .json({ errorMessage: `${nickName}님이 crew가 아닙니다.` });
    }
  } catch (e) {
    console.log(e);
    return res
      .status(400)
      .json({ errorMessage: "내보내기 요청 실패. 요청이 올바르지 않습니다." });
  }
});
module.exports = router;
