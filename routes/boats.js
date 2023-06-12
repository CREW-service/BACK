const express = require("express");
const router = express.Router();
const authJwt = require("../middlewares/authMiddleware"); // Crew 회원 확인을 위한 middleware
const crewCheck = require("../middlewares/crewCheck"); // 모집 글의 crew인지 확인
const { sequelize, Users, Boats } = require("../models");

// 1. Crew 모집 글 작성 API
//      @ 토큰을 검사하여, 유효한 토큰일 경우에만 채용공고 글 작성 가능
//      @ title, content, keyword, crewNumber, endDate, address
router.post("/boat/write", authJwt, async (req, res) => {
  try {
    const { userId } = res.locals.user;
    // req.body로 작성 내용 받아오기
    const { title, content, keyword, crewNumber, endDate, address } = req.body;
    // 첫 공개 여부는 공개로 올린다.
    const isPrivate = true;
    // 삭제할 때 필요한 softDelete 부분
    const softDelete = true;
    // Crew 명단 받을 공간
    const crew = [];

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
      title,
      content,
      keyword,
      endDate,
      address,
      crew,
      isPrivate,
      softDelete,
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
//      @ boatId, title, keyword, endDate, crewNumber, crewCount, address 조회
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
        "crewNumber",
        [sequelize.literal(`(SELECT COUNT(*) FROM Boats WHERE Boats. )`)],
        "address",
      ],
      group: ["Boats.boatId"],
      raw: true,
    });

    // 작성된 채용공고 글이 없을 경우
    if (jobs.length === 0) {
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
//      @ <게스트용> boatId, title, content, keyword, crewNumber, crewCount, endDate, address 조회
//      @ <Crew, 선장용> boatId, title, content, keyword, crewNumber, crewCount, endDate, address, Crew, isCaptain 조회
router.get("/boat/:boatId", crewCheck, async (req, res) => {
  try {
    const { boatId } = req.params;
    // userNickname 확인
    const { userNickename } = res.locals.user;
    // crew 원 확인
    const boatMember = await Boats.findOne({
      attributes: ["crew", "captain"],
      where: { boatId },
      group: ["Boats.boatId"],
      raw: true,
    });

    const captain = boatMember.captain;
    const crewNickname = boatMember.crew;

    for (let i = 0; i < crewNickname.length; i++) {
      if (crewNickname[i] !== userNickename) {
        const boatForQuests = await Boats.findOne({
          attributes: [
            "boatId",
            "title",
            "content",
            "keyword",
            "crewNumber",
            "crewCount",
            "endDate",
            "address",
          ],
          where: { boatId },
        });
      }
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
//      @ title, content, keyword, endDate, crewNumber, address 맞춰서 수정
router.put("/boat/:boatId", authJwt, async (req, res) => {
  try {
    // user
    const { userNickename } = res.locals.user;
    // params로 boatId
    const { boatId } = req.params;
    // boat 조회
    const boat = await Boats.findOne({ where: { boatId } });
    // body로 입력받기
    const { title, content, keyword, endDate, crewNumber, address } = req.body;

    // 모집 글이 없을 경우
    if (!boat) {
      return res.status(400).json({ errorMessage: "존재하지 않는 배입니다." });
    }
    // 권한이 없을 경우
    if (userNickename !== boat.captain) {
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
    if ((crewNumber = 0)) {
      return res
        .status(412)
        .json({ errorMessage: "유효하지 않은 crewNumber입니다." });
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
    if (crewNumber) {
      boat.crewNumber = crewNumber;
    }

    // 수정할 부분이 모두 없을 경우 / 수정할 내용이 있다면 해당 부분만 수정
    if (!(title || content || keyword || endDate || crewNumber || address)) {
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
    const { userNickename } = res.locals.user;
    // params로 boatId
    const { boatId } = req.params;
    // body로 isPrivate 입력받기
    const { isPrivate } = req.body;

    // 모집 글 조회
    const boat = await Boats.findOne({ where: { boatId } });
    // 모집 글이 없을 경우
    if (!boat) {
      return res
        .status(403)
        .json({ errorMessage: "존재하지 않는 모집 글입니다." });
    }
    // 권한이 없을 경우
    if (userNickename !== boat.captain) {
      return res
        .status(403)
        .json({ errorMessage: "모집 글 상태 전환 권한이 없습니다." });
    }

    // 유효성 검사
    if (isPrivate === undefined) {
      return res
        .status(412)
        .json({ errorMessage: "올바르지 않은 상태 전환 요청입니다." });
    } else {
      boat.isPrivate = isPrivate;
    }
    const updateIsPrivateCount = await boat.save();

    // 수정한 모집 글이 없을 경우
    if (!updateIsPrivateCount) {
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

// 6. crew 모집 글 softDelete
//    @ 모집 글에 softDelete 컬럼을 이용해 db에 남겨두지만 실제 서비스에서는 조회 X
router.patch("/boat/:boatId/delete", authJwt, async (req, res) => {
  try {
    // user
    const userNickename = res.locals.user;
    // params로 boatId
    const { boatId } = req.params;
    // body로 softDelete
    const { softDelete } = req.body;

    // 모집 글 조회
    const boat = await Boats.findByPk(boatId);

    // 모집 글이 없을 경우
    if (!boat) {
      return res
        .status(412)
        .json({ errorMessage: "존재하지 않는 글입니다. 삭제 실패." });
    }
    // 모집 글 삭제 권한 확인
    if (userNickename !== boat.captain) {
      return res
        .status(403)
        .json({ errorMessage: "모집 글 삭제 권한이 없습니다." });
    }

    // 모집 글 삭제
    const deleteCount = await Boats.destroy({ where: { boatId } });
    if (deleteCount < 1) {
      return res
        .status(400)
        .json({ errorMessage: "모집 글이 정상적으로 삭제되지 않았습니다." });
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
