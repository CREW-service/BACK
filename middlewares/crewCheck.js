const jwt = require("jsonwebtoken");
const { Users } = require("../models");

module.exports = async (req, res, next) => {
  try {
    const authorizationCookies = req.cookies.authorization;
    const authorizationHeaders = req.headers.authorization;
    const authorization = authorizationCookies
      ? authorizationCookies
      : authorizationHeaders;

    const [tokenType, tokenValue] = authorization.split(" "); // 중괄호{} 를 대괄호[]로 수정
    if (tokenType !== "Bearer") {
      res.clearCookie("authorization");
      return res
        .status(403)
        .json({ errorMessage: "전달된 쿠키에서 오류가 발생하였습니다." });
    }

    const { userNickname } = jwt.verify(tokenValue, "crewProjectJwt_");
    const user = await Users.findByPk(userNickname);

    res.locals.user = user;
    next();
  } catch (error) {
    console.log("error : ", error);
    res.clearCookie("authorization");
    return res.status(403).json({
      errorMessage: "로그인이 필요한 기능입니다.<catch>",
    });
  }
};
