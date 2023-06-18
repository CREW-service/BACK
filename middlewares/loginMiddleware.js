const jwt = require("jsonwebtoken");
const { Users } = require("../models");

module.exports = async (req, res, next) => {
  try {
    const authorizationCookies = req.cookies.authorization;
    const authorizationHeaders = req.headers.authorization;
    const authorization = authorizationCookies
      ? authorizationCookies
      : authorizationHeaders;

    // 게스트일 경우
    if (!authorization) {
      return res.status(201).json({ errorMessage: "게스트입니다." });
    }

    const [tokenType, tokenValue] = authorization.split(" "); // 중괄호{} 를 대괄호[]로 수정
    if (tokenType !== "Bearer") {
      res.clearCookie("authorization");
      return res
        .status(403)
        .json({ errorMessage: "전달된 쿠키에서 오류가 발생하였습니다." });
    }

    const { userId } = jwt.verify(tokenValue, process.env.JWT_SECRET);
    const user = await Users.findByPk(userId);

    res.locals.user = user;
    next();
  } catch (error) {
    return res.status(400).send({
      errorMessage: "loginMiddleware. 요청이 올바르지 않습니다.",
    });
  }
};
