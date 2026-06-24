# GET /api/onboarding/status

## 1. API 개요

> Description: 사용자의 온보딩 완료 여부만 간단히 조회하는 API입니다.

- Method: `GET`
- URL: `/api/onboarding/status`
- API Name: 온보딩 완료 상태 조회
- Parameters: 없음
- 인증 필요 여부: 필요

---

## 2. Request

### Header

| Key           | Value                 | Required | Description |
| ------------- | --------------------- | -------- | ----------- |
| Authorization | Bearer {Access_Token} | O        | 인증 토큰   |

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
    "hidden": false,
    "totalQuestCount": 3,
    "completedQuestCount": 1,
    "hasNewQuest": true,
    "availableQuestCount": 1,
    "nextQuestOpenAt": null
  }
}
```

---

## 4. Response Field

| Field                      | Type    | Description        |
| -------------------------- | ------- | ------------------ |
| isSuccess                  | Boolean | 요청 성공 여부     |
| code                       | String  | 응답 코드          |
| message                    | String  | 응답 메시지        |
| result                     | Object  | 온보딩 상태 정보   |
| result.onboardingCompleted | Boolean | 온보딩 완료 여부   |
| result.completedQuestCount | Integer | 완료한 퀘스트 개수 |
| result.totalQuestCount     | Integer | 전체 퀘스트 개수   |
