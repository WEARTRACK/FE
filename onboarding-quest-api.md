# GET /api/onboarding/quests

## 1. API 개요

> Description: 회원가입 완료 후 사용자의 온보딩 퀘스트 목록과 진행 상태를 조회하는 API입니다.

- Method: `GET`
- URL: `/api/onboarding/quests`
- API Name: 온보딩 퀘스트 목록 조회
- Parameters: 없음
- 인증 필요 여부: 필요

---

## 2. Request

### Header

| Key           | Value                 | Required | Description |
| ------------- | --------------------- | -------- | ----------- |
| Authorization | Bearer {Access_Token} | O        | 인증 토큰   |

### Path Variable

없음 (X)

### Query String

없음 (X)

### Request Body

없음 (X)

---

## 3. Response

### Success Response

#### HTTP Status Code

| Code | Description |
| ---- | ----------- |
| 200  | OK          |

#### Response Body

```json
{
  "isSuccess": true,
  "code": "COMMON_200",
  "message": "요청에 성공했습니다.",
  "result": {
    "onboardingCompleted": false,
    "totalQuestCount": 3,
    "completedQuestCount": 1,
    "quests": [
      {
        "questType": "REGISTER_CLOSET",
        "title": "옷장 등록하기",
        "description": "나의 옷장을 등록해보세요.",
        "requiredCount": 1,
        "currentCount": 1,
        "completed": true
      },
      {
        "questType": "REGISTER_TOP",
        "title": "상의 5벌 등록하기",
        "description": "상의 카테고리 옷을 5벌 등록해보세요.",
        "requiredCount": 5,
        "currentCount": 2,
        "completed": false
      },
      {
        "questType": "REGISTER_BOTTOM",
        "title": "하의 2벌 등록하기",
        "description": "하의 카테고리 옷을 2벌 등록해보세요.",
        "requiredCount": 2,
        "currentCount": 0,
        "completed": false
      }
    ]
  }
}
```

---

## 4. Response Field

| Field                         | Type    | Description           |
| ----------------------------- | ------- | --------------------- |
| isSuccess                     | Boolean | 요청 성공 여부        |
| code                          | String  | 응답 코드             |
| message                       | String  | 응답 메시지           |
| result                        | Object  | 온보딩 퀘스트 정보    |
| result.onboardingCompleted    | Boolean | 전체 온보딩 완료 여부 |
| result.totalQuestCount        | Integer | 전체 퀘스트 개수      |
| result.completedQuestCount    | Integer | 완료한 퀘스트 개수    |
| result.quests                 | Array   | 퀘스트 목록           |
| result.quests[].questType     | Enum    | 퀘스트 타입           |
| result.quests[].title         | String  | 퀘스트 제목           |
| result.quests[].description   | String  | 퀘스트 설명           |
| result.quests[].requiredCount | Integer | 완료에 필요한 개수    |
| result.quests[].currentCount  | Integer | 현재 진행 개수        |
| result.quests[].completed     | Boolean | 해당 퀘스트 완료 여부 |
