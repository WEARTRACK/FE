# PATCH /api/onboarding/skip

## 1. API 개요

> Description: 사용자가 온보딩을 건너뛰는 경우 온보딩 상태를 종료 처리하는 API입니다.

- Method: `PATCH`
- URL: `/api/onboarding/skip`
- API Name: 온보딩 스킵
- Parameters: 없음
- 인증 필요 여부: 필요

---

## 2. Request

### Header

| Key           | Value                 | Required | Description |
| ------------- | --------------------- | -------- | ----------- |
| Authorization | Bearer {Access_Token} | O        | 인증 토큰   |

### Request Body

```json
{
  "skipReason": "사용자가 직접 건너뛰기 선택"
}
```

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
    "onboardingCompleted": true,
    "skipped": true
  }
}
```

---

## 4. Response Field

| Field                      | Type    | Description           |
| -------------------------- | ------- | --------------------- |
| isSuccess                  | Boolean | 요청 성공 여부        |
| code                       | String  | 응답 코드             |
| message                    | String  | 응답 메시지           |
| result                     | Object  | 온보딩 스킵 처리 결과 |
| result.onboardingCompleted | Boolean | 온보딩 완료 여부      |
| result.skipped             | Boolean | 온보딩 스킵 여부      |
