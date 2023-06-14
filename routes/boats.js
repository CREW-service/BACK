const express = require("express");
const router = express.Router();
const authJwt = require("../middlewares/authMiddleware"); // Crew 회원 확인을 위한 middleware
const crewCheck = require("../middlewares/crewCheck"); // 모임의 crew인지 확인
const { sequelize, Users, Boats, Comments, Crew } = require("../models");

// 1. Crew 모집 글 작성 API
//      @ 토큰을 검사하여, 유효한 토큰일 경우에만 채용공고 글 작성 가능
//      @ title, content, keyword, maxCrewNum, endDate, address
router.post("/boat/write", authJwt, async (req, res) => {
  try {
    // userId
    const { userId } = res.locals.user;
    // req.body로 작성 내용 받아오기
    const { title, content, keyword, maxCrewNum, endDate, address } = req.body;
    // 첫 공개 여부는 공개로 올린다.
    const isDone = false;
    // user의 nickName 가져오기
    const captain = await Users.findOne({
      attributes: ["nickName"],
      where: { userId },
    });

    // 작성 내용 확인
    if (title < 1) {
      return res
        .status(412)
        .json({ errorMessage: "title에 작성된 내용이 없습니다." });
    }
    if (content < 1) {
      return res
        .status(412)
        .json({ errorMessage: "content에 작성된 내용이 없습니다." });
    }
    if (keyword < 1) {
      return res
        .status(412)
        .json({ errorMessage: "keyword에 작성된 내용이 없습니다." });
    }
    if (endDate === undefined) {
      return res
        .status(412)
        .json({ errorMessage: "마감 일자 형식이 맞지 않습니다." });
    }
    if (address < 1) {
      return res
        .status(412)
        .json({ errorMessage: "address가 작성된 내용이 없습니다." });
    }

    // Crew 모집 글 작성
    await Boats.create({
      userId,
      captain: captain.nickName,
      title,
      content,
      keyword,
      endDate,
      address,
      maxCrewNum,
      isDone,
    });
    return res.status(200).json({ message: "Crew 모집 글 작성에 성공" });
  } catch (e) {
    console.log(e);
    return res.status(400).json({
      errorMessage: "Crew 모집 글 작성 실패. 요청이 올바르지 않습니다.",
    });
  }
});

// 2. MAP API를 활용해 글 목록 조회 API
//      @ boatId, title, keyword, endDate, maxCrewNum, crewCount, address 조회
//      @ 위치를 통해 MAP 위에 보트 모양과 keyword만 보이게 한다.
//      @ 클릭할 경우 모집 글이 보이게 한다.
router.get("/boat/map", async (req, res) => {
  try {
    // Crew 모집 글 목록 조회
    const boats = await Boats.findAll({
      attributes: [
        "boatId",
        "title",
        "keyword",
        "endDate",
        "maxCrewNum",
        [
          sequelize.literal(
            `(SELECT COUNT(*) FROM Boats WHERE Boats.boatId = Crew.boatId )`
          ) + 1,
          "crewCount",
        ],
        "address",
      ],
      group: ["Boats.boatId"],
      raw: true,
    });

    // 작성된 채용공고 글이 없을 경우
    if (boats.length === 0) {
      return res
        .status(400)
        .json({ errorMessage: "작성된 모집 글이 없습니다." });
    }
    // 채용공고 글 전체 목록 조회
    return res.status(200).json({ boats });
  } catch (e) {
    console.log(e);
    return res
      .status(400)
      .json({ errorMessage: "전체 목록 조회 실패. 요청이 올바르지 않습니다." });
  }
});

// 3. Crew 모집 글 상세 조회 API
//      @ <게스트용> boatId, title, content, keyword, maxCrewNum, crewCount, endDate, address 조회
//      @ <Crew, 선장용> boatId, title, content, keyword, maxCrewNum, crewCount, endDate, address 조회
router.get("/boat/:boatId", authJwt, async (req, res) => {
  try {
    const { boatId } = req.params;
    // userId 확인
    const { userId } = res.locals.user;
    // userId를 통해 nickName 조회
    const user = await Users.findOne({
      attributes: ["nickName"],
      where: { userId },
      raw: true,
    });
    // crewMember 조회
    const crewMember = await Crew.findAll({
      attributes: ["nickName"],
      where: { boatId },
      group: ["Boats.boatId"],
      raw: true,
    });

    // 글 조회
    const boat = await Boats.findOne({
      attributes: [
        "boatId",
        "captain",
        "title",
        "content",
        "maxCrewNum",
        [
          sequelize.literal(
            `(SELECT COUNT(*) FROM Boats WHERE Boats.boatId = Crew.boatId )`
          ) + 1,
          "crewCount",
        ],
        "endDate",
      ],
      where: { boatId },
      include: [
        {
          model: Crew,
          attributes: [],
        },
      ],
      group: ["Boats.boatId"],
      raw: true,
    });

    // 글에 해당하는 댓글 조회
    const comments = await Comments.findAll({
      attributes: [
        "commentId",
        "userId",
        [sequelize.col("nickname"), "nickname"],
        "comment",
      ],
      where: { boatId },
      include: [
        {
          model: Users,
          attributes: [],
        },
      ],
      raw: true,
    });

    let exisNickName = 0;
    let isCaptain = 0;
    // user.nickName 정보와 crewMember와 비교
    for (let i = 0; i < crewMember.length; i++) {
      if (user.nickName === crewMember[i].nickName) {
        return (exisNickName = 1);
      } else {
        return user.nickName === boat.captain
          ? (isCaptain = 1)
          : (isCaptain = 0);
      }
    }

    // 유저 정보에 따라 다르게 보내기
    // 참가 O
    if ((exisNickName = 1)) {
      // crew라는 것을 알리기. captain은 아니다.
      return res.status(200).json({ boat, crewMember, comments });
    }
    // 참가 X ==> captain 확인
    if ((isCaptain = 1)) {
      // captain라는 것을 표시하기.
      return res.status(200).json({ boat, crewMember, comments, isCaptain });
    } else {
      // 참가인원이 아니므로 boat 정보만 넘긴다.
      return res.status(200).json({ boat });
    }
  } catch (e) {
    console.log(e);
    return res.status(400).json({
      errorMessage: "모집 글 상세 조회에 실패. 요청이 올바르지 않습니다.",
    });
  }
});

// 4. crew 모집 글 수정 API
//      @ 토큰을 검사형, 해당 사용자가 작성한 채용공고 글만 수정 가능
//      @ title, content, keyword, endDate, maxCrewNum, address 맞춰서 수정
router.put("/boat/:boatId", authJwt, async (req, res) => {
  try {
    // user
    const { userId } = res.locals.user;
    // params로 boatId
    const { boatId } = req.params;
    // boat 조회
    const boat = await Boats.findOne({ where: { boatId } });
    // body로 입력받기
    const { title, content, keyword, endDate, maxCrewNum, address } = req.body;

    // 모집 글이 없을 경우
    if (!boat) {
      return res.status(400).json({ errorMessage: "존재하지 않는 배입니다." });
    }
    // 권한이 없을 경우
    if (userId !== boat.captain) {
      return res.status(403).json({ errorMessage: "글 수정 권한이 없습니다." });
    }

    // 수정 검사
    if (title < 1) {
      return res
        .status(412)
        .json({ errorMessage: "유효하지 않은 title입니다." });
    }
    if (content < 1) {
      return res
        .status(412)
        .json({ errorMessage: "유효하지 않은 content입니다." });
    }
    if (keyword < 1) {
      return res
        .status(412)
        .json({ errorMessage: "유효하지 않은 keyword입니다." });
    }
    if (endDate < 1) {
      return res
        .status(412)
        .json({ errorMessage: "유효하지 않은 endDate입니다." });
    }
    if (address < 1) {
      return res
        .status(412)
        .json({ errorMessage: "유효하지 않은 address입니다." });
    }
    if ((maxCrewNum = 0)) {
      return res
        .status(412)
        .json({ errorMessage: "유효하지 않은 maxCrewNum입니다." });
    }

    // 수정할 내용에 따라 수정
    if (title) {
      boat.title = title;
    }
    if (content) {
      boat.content = content;
    }
    if (keyword) {
      boat.keyword = keyword;
    }
    if (endDate) {
      boat.endDate = endDate;
    }
    if (address) {
      boat.address = address;
    }
    if (maxCrewNum) {
      boat.maxCrewNum = maxCrewNum;
    }

    // 수정할 부분이 모두 없을 경우 / 수정할 내용이 있다면 해당 부분만 수정
    if (!(title || content || keyword || endDate || maxCrewNum || address)) {
      return res.status(400).json({ errorMessage: "수정할 내용이 없습니다." });
    }
    const updateCount = await boat.save();

    // 수정한 글이 없을 경우
    if (updateCount < 1) {
      return res.status(401).json({
        errorMessage: "모집 글이 정상적으로 수정되지 않았습니다.",
      });
    }

    // 수정 완료
    return res.status(200).json({ message: "모집 글을 수정 완료." });
  } catch (e) {
    console.log(e);
    return res
      .status(400)
      .json({ errorMessage: "모집 글 수정 실패. 요청이 올바르지 않습니다." });
  }
});

// 5. crew 모집 글 공개 여부 API
//    @ 토큰을 검사, 해당 사용자가 작성한 채용공고 글만 공개 / 비공개 가능
router.patch("/boat/:boatId", authJwt, async (req, res) => {
  try {
    // user
    const { userId } = res.locals.user;
    // params로 boatId
    const { boatId } = req.params;
    // body로 isDone 입력받기
    const { isDone } = req.body;

    // 모집 글 조회
    const boat = await Boats.findOne({ where: { boatId } });
    // 모집 글이 없을 경우
    if (!boat) {
      return res
        .status(403)
        .json({ errorMessage: "존재하지 않는 모집 글입니다." });
    }
    // 권한이 없을 경우
    if (userId !== boat.captain) {
      return res
        .status(403)
        .json({ errorMessage: "모집 글 상태 전환 권한이 없습니다." });
    }

    // 유효성 검사
    if (isDone === undefined) {
      return res
        .status(412)
        .json({ errorMessage: "올바르지 않은 상태 전환 요청입니다." });
    } else {
      boat.isDone = isDone;
    }
    const updateIsDoneCount = await boat.save();

    // 수정한 모집 글이 없을 경우
    if (!updateIsDoneCount) {
      return res
        .status(401)
        .json({ errorMessage: "모집 글을 전환하지 못했습니다." });
    }

    // 전환 완료
    return res.status(200).json({ message: "모집 글 상태를 전환 완료." });
  } catch (e) {
    console.log(e);
    return res
      .status(400)
      .json({ errorMessage: "상태 업데이트 실패. 요청이 올바르지 않습니다." });
  }
});

// 6. crew 모집 글 deletedAt
//    @ 모집 글에 deletedAt 컬럼을 이용해 db에 남겨두지만 실제 서비스에서는 조회 X
router.patch("/boat/:boatId/delete", authJwt, async (req, res) => {
  try {
    // user
    const userId = res.locals.user;
    // params로 boatId
    const { boatId } = req.params;
    // body로 deletedAt
    const { deletedAt } = req.body;

    // 모집 글 조회
    const boat = await Boats.findByPk(boatId);

    // 모집 글이 없을 경우
    if (!boat) {
      return res
        .status(412)
        .json({ errorMessage: "존재하지 않는 글입니다. 삭제 실패." });
    }
    // 모집 글 삭제 권한 확인
    if (userId !== boat.captain) {
      return res
        .status(403)
        .json({ errorMessage: "모집 글 삭제 권한이 없습니다." });
    }

    // 모집 글 삭제
    if (deletedAt === undefined) {
      return res
        .status(412)
        .json({ errorMessage: "삭제 요청이 올바르지 않습니다." });
    } else {
      boat.deletedAt = deletedAt;
    }
    const deletedAtCount = await boat.save();

    // softDelete 안됐을 경우
    if (!deletedAtCount) {
      return res.status(401).json({ errorMessage: "삭제된 글이 없습니다." });
    }

    // 삭제 완료
    return res.status(200).json({ message: "모집 글을 삭제 완료." });
  } catch (e) {
    console.log(e);
    return res.status.json({
      errorMessage: "모집 글 삭제 실패. 요청이 올바르지 않습니다.",
    });
  }
});

module.exports = router;
