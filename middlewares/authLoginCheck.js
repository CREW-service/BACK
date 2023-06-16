const jwt = require("jsonwebtoken");
const { Users } = require("../models");

module.exports = async (req, res, next) => {
  try {
    const authorizationCookies = req.cookies.authorization;
    const authorizationHeaders = req.headers.authorization;
    const authorization = authorizationCookies
      ? authorizationCookies
      : authorizationHeaders;

    // 쿠키 또는 헤더에 인증 정보가 없을 경우
    if (!authorization) {
      res.locals.isGuest = true;
      return next();
    }

    // 쿠키 또는 헤더에 인증 정보가 있을 경우 토큰 검사
    const [tokenType, tokenValue] = authorization.split(" ");
    if (tokenType !== "Bearer") {
      res.clearCookie("authorization");
      return res
        .status(403)
        .json({ errorMessage: "전달된 쿠키에서 오류가 발생하였습니다." });
    }

    const { userId } = jwt.verify(tokenValue, process.env.JWT_SECRET);
    const user = await Users.findByPk(userId);

    res.locals.user = user;
    res.locals.isGuest = false;
    next();
  } catch (e) {
    console.log(e);
    return res.status(403).json({
      errorMessage: "authLoginCheck : 요청이 올바르지 않습니다.",
    });
  }
};
