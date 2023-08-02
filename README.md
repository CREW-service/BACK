![브로셔](https://github.com/CREW-service/BACK/assets/125416958/68fa17d4-06b6-40cb-b53f-7395909689a7)

# :boat: [CREW](https://www.spa-mall.shop/)

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

![Crew-발표-자료-004 (1) (1)](https://github.com/CREW-service/BACK/assets/125416958/c8b7f646-25bb-4949-804d-503542bb8844)

---

## :bank: ERD

![drawSQL-crew-export-2023-07-22](https://github.com/CREW-service/BACK/assets/125416958/a1747020-201a-4a8d-834d-820f8d5291c8)

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

### 2. 지도로 보내줘야 하는 데이터 양 조절

#### 발생한 문제

카카오 map에 보내줘야 하는 많은 양의 글 목록이 한번에 간다 생각했을 때 프론트 엔드에서 처리해야할 데이터 양도 많지만 조회하고 전송해주는 백엔드 서버는 많은 양의 데이터를 다뤄야 하기에 큰부하가 걸릴 것으로 생각했습니다.

#### 개선 방법

artillery 모듈을 통해 부한 테스트를 진행했습니다.
프론트 엔드에서 보내주는 중앙 좌표 기준 보여지는 지도의 북동쪽과 남서쪽 좌표를 받아 그에 해당하는 데이터만 전송하는 코드로 변경했습니다.

- 개선 전

### 3. 서버에 이미지 저장

#### 발생한 문제

multer 라이브러리를 이용하여 이미지를 서버에 저장할 계획을 세웠습니다. 데이터 관리, 확장성 면에서 서버 자체에 저장하는 것은 비효율적이라 생각했습니다.

#### 개선 방법

S3 이용하여 이미지를 저장하고 서버를 따로 관리하는 방법을 선택했습니다.
용량 및 확장성, 비용 그리고 전송 속도를 고려했을 때 S3를 통해 이미지를 저장하여 관리하는 방법은 효율적이라 판단했습니다.

### 4. https를 이용한 쿠키 보안

#### 발생한 문제

토큰에 보안이 매우 약해 쉽게 브라우저에서 토큰을 탈취할 수 있었습니다.

#### 개선 방법

토큰에 만료 기간을 설정하여 만료될 경우 토큰이 사라질 수 있게 코드를 수정했습니다. 또한 프론트 엔드와 도메인을 합쳐서 https 통신을 사용함으로써 토큰을 쿠키에 저장하고 백엔드에서 직접 접근하여 사용할 수 있게 하였습니다. 그러나 여러 설정 중 HttpOnly를 설정할 경우 프론트에서 토큰에 접근이 불가해지므로 백엔드에서 직접 쿠키에 접근하는 방법으로 코드 수정이 필요했습니다. 물론 프론트 엔드도 코드의 많은 부분을 수정할 필요가 있었습니다. 시간이 많이 부족했기에 아직은 수정하지 못했고 추후에 수정할 예정입니다.또한 refresh token으로 토큰 관리할 계획으로 보안을 더 강화할 생각입니다.
