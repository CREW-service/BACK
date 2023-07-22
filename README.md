![Alt text](https://file.notion.so/f/s/c8eb68c2-2877-4eeb-95cc-4c77c944c5e3/f24ff368b03ea0d9.jpg?id=6bb14bf5-9e6e-414e-b1a9-f77610826e2d&table=block&spaceId=aa8571ff-db5c-4c63-a227-0bac038f37bc&expirationTimestamp=1690084800000&signature=QULugRJiw0-W-4bIqBCQ7Ru_R6SKQ4ZF5-ZIK-7SJK0&downloadName=f24ff368b03ea0d9.jpg)

# :boat: CREW [CREW](https://crew.ysizuku.com/)

## :loudspeaker: 프로젝트 소개

### 내 주변에서 함께하고 싶은 모임을 만들거나 참여할 수 있는 플랫폼 서비스

- :anchor: 내 주변에서 모임을 만들고 크루를 모집하세요!
- :ticket: 이미 만들어진 모임에도 참여!

#### :calendar: 프로젝트 기간

2023년 6월 10일 ~ 2023년 7월 28일

---

## :office: 개발 인원

- 윤진영B (React) [팀장]
- 윤진영A (React)
- 박윤수 (Node.js) [부팀장]
- 이도림 (Designer)

---

## :wrench: 기술 스택

<code>Node.js</code> / <code>express</code> / <code>Sequelize</code> / <code>MySQL</code> / <code>Git</code> / <code>kakao login</code>

---

## :books: 라이브러리

| 라이브러리      | 설명                |
| :-------------- | :------------------ |
| cookie-parser   | 쿠키 저장           |
| cors            | 교차 리소스 공유    |
| dotenv          | 환경변수 관리       |
| express         | 서버                |
| express-session | 세션 관리           |
| jsonwebtoken    | 서명 암호화         |
| mysql2          | MySQL               |
| sequelize       | MySQL ORM           |
| sequelize-cli   | MySQL ORM Console   |
| socket.io       | Socket 통신         |
| node-cron       | 반복 작업 수행      |
| passport        | 간편 로그인         |
| multer          | 이미지 업로드       |
| multer-s3       | 이미지 업로드       |
| aws-sdk         | 아마존 s3와 연결    |
| uuid            | 이미지 암호화       |
| helmet          | http 헤더 설정 관리 |

---

## :pushpin: Architecture

![Alt text](<https://file.notion.so/f/s/9028ebe0-25ae-4c7f-8d33-d1849c076544/Crew-%EB%B0%9C%ED%91%9C-%EC%9E%90%EB%A3%8C-004_(1).jpg?id=78dad97d-4bd0-46c9-87ba-9be6cfa57d63&table=block&spaceId=aa8571ff-db5c-4c63-a227-0bac038f37bc&expirationTimestamp=1690092000000&signature=1W6Uk-TgpIueQPkgl57ONh2vC4xl0O9VqpLcZt_C0eo&downloadName=Crew-%EB%B0%9C%ED%91%9C-%EC%9E%90%EB%A3%8C-004+%281%29.jpg>)

---

## :bank: ERD

![Alt text](https://file.notion.so/f/s/a463de6e-593f-4a4a-b7bf-e33c4db048ec/drawSQL-crew-export-2023-07-22.png?id=443dd127-bff8-448c-82dd-4ab9129c06d7&table=block&spaceId=aa8571ff-db5c-4c63-a227-0bac038f37bc&expirationTimestamp=1690092000000&signature=Am9dFlhZ1fm0tlMeJ83xB2saNRblyE7GZjeL10GQPUg&downloadName=drawSQL-crew-export-2023-07-22.png)

---

## :pushpin: [API Document][API-LINK]

[API-LINK]: https://www.notion.so/ea092cff3cfb41578f27776d6817023b?v=e2453e26532f4189847fc33c6145b049&pvs=4 "Go API"

---

## :clipboard: [Project Board][Project Board]

[Project Board]: https://burly-fridge-a81.notion.site/1-Crew-S-A-d3269422b794420495da4d74548012cd?pvs=4 "Go Board"

---

## :cat: [Git hub][Git hub]

[Git hub]: https://github.com/CREW-service "GO Crew-service"

---

## :rocket: 개선 사항

### 1. 모집 글 마감처리

#### 발생한 문제

모집글에서 마감 일자에 맞춰 모집글을 마감 처리할 필요가 있었습니다. 처음에는 admin 서버를 활용하여 마감처리를 매일 자정에 할 생각을 했습니다. 코드 작성 중 매우 비효율적인 작업이라 생각을 했고 매니저님의 도움을 통해 CronJob을 알게되었습니다.
일정 기간, 시간에 맞춰 반복 작업이 가능한 로직이 필요했습니다.

#### 개선 방법

- node-cron 라이브러리를 이용해서 시간 단위로 반복 작업할 수 있는 코드를 작성했습니다.
- 마감일 기준으로 마감일 다음 날부터 마감 처리할 필요가 있었기에 자정에 맞춰 반복 작업할 수 있게 스케쥴링 로직을 구성했습니다.

```js
// node-cron
const cron = require("node-cron");
const { Op } = require("sequelize");
const { Boats } = require("./models");

// 보트 업데이트 함수
const updateBoats = async () => {
  const today = new Date();
  const boats = await Boats.findAll({
    where: {
      [Op.and]: [{ endDate: { [Op.not]: "" } }],
      isDone: false,
    },
    raw: true,
  });

  for (const boat of boats) {
    if (new Date(boat.endDate) <= today) {
      await Boats.update({ isDone: true }, { where: { boatId: boat.boatId } });
      console.log(`보트 ${boat.boatId} 수정 완료`);
    }
  }
};

// 보트 업데이트 일정 설정 함수
const scheduleBoatsUpdate = async () => {
  try {
    await updateBoats();
    console.log("업데이트 완료.");
  } catch (e) {
    console.error("마감기한 업데이트 에러", e);
  }
};

// 크론 작업 생성 및 시작
const scheduledTask = cron.schedule("0 0 * * *", scheduleBoatsUpdate, {
  scheduled: true,
  timezone: "Asia/Seoul",
});

scheduledTask.start();
```

### 2.
