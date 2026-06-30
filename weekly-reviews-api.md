# Weekly Review API

## 1. 이번 주 회고 조회

### Endpoint

```http
GET /api/weekly-reviews/current
```

---

## 1-1. API 개요

> 매일 저장한 일간 착용 기록을 현재 주차 기준으로 집계합니다. 주간 회고 결과 화면에 필요한 착용 옷 수, 옷장 활용률, 카테고리별 착용 옷 목록을 반환합니다.

---

## 2. Request

### 2-1. Header

| Key           | Value                 | Required | Description |
| ------------- | --------------------- | -------- | ----------- |
| Authorization | Bearer {Access_Token} | O        | 인증 토큰   |
| Content-Type  | application/json      | O        | 데이터 타입 |

---

### 2-2. Path Variable

없음

---

### 2-3. Query String

없음

---

### 2-4. Request Body

없음

---

## 3. Response

### 3-1. Success Response

#### Response Body Example

```json
{
  "isSuccess": true,
  "code": "COMMON_200",
  "message": "요청에 성공했습니다.",
  "result": {
    "weekStartDate": "2026-06-21",
    "weekEndDate": "2026-06-27",
    "wornClothesCount": 2,
    "weeklyClosetUsageRate": 12,
    "weeklyInsight": "지난 주보다 옷장을 12%를 더 활용했어요!",
    "categories": [
      {
        "category": "T_SHIRT",
        "wornCount": 2,
        "clothes": [
          {
            "clothesId": 32,
            "imageUrl": "https://weartrack-images.s3.ap-northeast-2.amazonaws.com/clothes/9bbe8ec6-f943-4342-8f28-d86dec948a9c.png",
            "color": "PURPLE"
          },
          {
            "clothesId": 5,
            "imageUrl": "https://weartrack-images.s3.ap-northeast-2.amazonaws.com/clothes/8c32de41-a4d2-41c4-a0df-f7107f260ad5.png",
            "color": "GRAY"
          }
        ]
      }
    ]
  }
}
```

#### Response Body Field

| Field                 | Type    | Description             |
| --------------------- | ------- | ----------------------- |
| isSuccess             | Boolean | 요청 성공 여부          |
| code                  | String  | 응답 코드               |
| message               | String  | 응답 메시지             |
| weekStartDate         | String  | 이번 주 시작일(일요일)  |
| weekEndDate           | String  | 이번 주 종료일(토요일)  |
| wornClothesCount      | Integer | 이번 주 입은 옷 개수    |
| weeklyClosetUsageRate | Integer | 이번 주 옷장 활용률     |
| weeklyInsight         | String  | 이번 주 활용률 인사이트 |
| category              | String  | 카테고리                |
| wornCount             | Integer | 카테고리별 착용 횟수    |
| clothesId             | Long    | 옷 ID                   |
| imageUrl              | String  | 옷 이미지 URL           |
| color                 | String  | 옷 색상                 |

---

### 3-2. Error Response

```json
{
  "isSuccess": false,
  "code": "ERROR_CODE",
  "message": "에러 메시지입니다.",
  "result": null
}
```

| HTTP Status | Error Code | Message            | Cause                |
| ----------- | ---------- | ------------------ | -------------------- |
| 400         | ERR_001    | 잘못된 요청입니다. | 잘못된 요청          |
| 404         | ERR_002    | 찾을 수 없습니다.  | 존재하지 않는 데이터 |
| 500         | ERR_999    | 서버 에러          | 서버 내부 오류       |

---

# 2. 특정 주 회고 조회

- 알림 기능을 토큰방식으로 수정했을때 필요
- 현재는 토픽방식의 알림으로 필요하지 않은 api

### Endpoint

```http
GET /api/weekly-reviews/{weekStartDate}
```

---

## 2-1. API 개요

> 특정 주차의 일간 착용 기록을 집계합니다.

---

## 3. Request

### 3-1. Header

| Key           | Value                 | Required | Description |
| ------------- | --------------------- | -------- | ----------- |
| Authorization | Bearer {Access_Token} | O        | 인증 토큰   |
| Content-Type  | application/json      | O        | 데이터 타입 |

---

### 3-2. Path Variable

| Key           | Type                | Required | Description                |
| ------------- | ------------------- | -------- | -------------------------- |
| weekStartDate | String (yyyy-MM-dd) | O        | 조회할 주의 시작일(일요일) |

> yyyy-MM-dd 형식으로 전달합니다.
> 예시: `2026-06-21`

---

### 3-3. Query String

없음

---

### 3-4. Request Body

없음

---

## 4. Response

### 4-1. Success Response

Response Body는 **이번 주 회고 조회 API와 동일한 구조**입니다.

예시

```json
{
  "isSuccess": true,
  "code": "COMMON_200",
  "message": "요청에 성공했습니다.",
  "result": {
    "weekStartDate": "2026-06-14",
    "weekEndDate": "2026-06-20",
    "wornClothesCount": 0,
    "weeklyClosetUsageRate": 0,
    "weeklyInsight": "지난 주와 옷장 활용률이 같아요.",
    "categories": []
  }
}
```

#### Response Body Field

| Field                 | Type    | Description             |
| --------------------- | ------- | ----------------------- |
| isSuccess             | Boolean | 요청 성공 여부          |
| code                  | String  | 응답 코드               |
| message               | String  | 응답 메시지             |
| weekStartDate         | String  | 조회한 주의 시작일      |
| weekEndDate           | String  | 조회한 주의 종료일      |
| wornClothesCount      | Integer | 해당 주 착용한 옷 개수  |
| weeklyClosetUsageRate | Integer | 해당 주 옷장 활용률     |
| weeklyInsight         | String  | 해당 주 활용률 인사이트 |
| category              | String  | 카테고리                |
| wornCount             | Integer | 카테고리별 착용 횟수    |
| clothesId             | Long    | 옷 ID                   |
| imageUrl              | String  | 옷 이미지 URL           |
| color                 | String  | 옷 색상                 |

---

### 4-2. Error Response

```json
{
  "isSuccess": false,
  "code": "ERROR_CODE",
  "message": "에러 메시지입니다.",
  "result": null
}
```

| HTTP Status | Error Code | Message            | Cause                           |
| ----------- | ---------- | ------------------ | ------------------------------- |
| 400         | ERR_001    | 잘못된 요청입니다. | 잘못된 요청 또는 날짜 형식 오류 |
| 404         | ERR_002    | 찾을 수 없습니다.  | 존재하지 않는 데이터            |
| 500         | ERR_999    | 서버 에러          | 서버 내부 오류                  |
