const express = require("express");
const router = express.Router();
const { Comments } = require("../models");
const crewCheck = require("../middlewares/crewCheck");

// 1. 댓글 작성
//      @ 토큰을 검사하여 crew인지 확인
//      @ comment 작성
router.post("/boat/:boatId/comment", crewCheck, async (req, res) => {
  try {
    // crew 확인
    const { userNickName } = res.locals.user;
    // params로 boatId
    const { boatId } = req.params;
    // body로 comment 내용
    const { comment } = req.body;

    // 작성 내용 확인
    if (comment < 1) {
      return res.status(412).json({ errorMessage: "작성한 내용이 없습니다." });
    }

    // boatId에 맞춰서 댓글 작성
    await Comments.create({ boatId, userNickName, comment });

    // 댓글 작성 완료
    return res.status(200).json({ message: "댓글 작성 완료." });
  } catch (e) {
    console.log(e);
    return res
      .status(400)
      .json({ errorMessage: "댓글 작성 실패. 요청이 올바르지 않습니다." });
  }
});
