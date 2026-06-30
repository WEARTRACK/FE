# Home Weekly Closet Usage API

## 문서 정보

| 항목 | 내용 |
| --- | --- |
| 기능명 | 홈 화면 주간 옷장 활용률 분석 및 이번 주 입은 옷/가격 조회 |
| Base Endpoint | `/api/home/weekly-closet-usage` |
| 인증 | 필요 |
| Content-Type | `application/json` |
| 관련 화면/상황 | 홈 화면 옷장 활용률 카드, 옷장 분석 페이지, 영수증 페이지 |

---

## 1. API 목록

| Method | Endpoint | API 이름 | Description |
| --- | --- | --- | --- |
| `GET` | `/api/home/weekly-closet-usage/analysis` | 이번 주 옷장 활용률 분석 조회 | 홈 화면의 이번 주 옷장 활용률 카드를 눌렀을 때 옷장 분석 내용을 조회합니다. |
| `GET` | `/api/home/weekly-closet-usage/worn-clothes` | 이번 주 입은 옷 및 가격 조회 | 옷장 활용률 분석 화면에서 분포 카드를 눌렀을 때 이번 주 입은 옷 목록과 가격 총합을 조회합니다. |

> 두 API 모두 Path Variable, Query String, Request Body가 없습니다.

---

# GET `/api/home/weekly-closet-usage/analysis`

## 1. API 개요

> 홈 화면의 이번 주 옷장 활용률 카드를 눌렀을 때 옷장 분석 내용을 보여줍니다.

---

## 2. Request

### 2-1. Header

| Key | Value (Example) | Required | Description |
| --- | --- | --- | --- |
| Authorization | Bearer `{Access_Token}` | O | 인증 토큰 |
| Content-Type | application/json | O | 데이터 타입 |

### 2-2. Path Variable

없음

### 2-3. Query String

없음

### 2-4. Request Body

없음

---

## 3. Response

### 3-1. Success Response

#### HTTP Status

| Code | Description |
| --- | --- |
| 200 | OK |

#### Response Body Example

```json
{
  "isSuccess": true,
  "code": "COMMON_200",
  "message": "요청에 성공했습니다.",
  "result": {
    "weekStartDate": "2026-06-30",
    "weekEndDate": "2026-06-30",
    "weeklyClosetUsageRate": 90,
    "closetUsageType": "마스터형 옷장",
    "unwornClothesCount": 3
  }
}
```

#### Swagger Example

```json
{
  "isSuccess": true,
  "code": "string",
  "message": "string",
  "result": {
    "weekStartDate": "2026-06-30",
    "weekEndDate": "2026-06-30",
    "weeklyClosetUsageRate": 1073741824,
    "closetUsageType": "string",
    "unwornClothesCount": 9007199254740991
  }
}
```

### 3-2. Response Field

| Field | Type | Description | 값/비고 |
| --- | --- | --- | --- |
| isSuccess | Boolean | 요청 성공 여부 | `true`: 성공, `false`: 실패 |
| code | String | 응답 코드 | 예: `COMMON_200` |
| message | String | 응답 메시지 | 예: `요청에 성공했습니다.` |
| result | Object | 응답 데이터 |  |
| weekStartDate | String | 이번 주 시작일 | `yyyy-MM-dd` |
| weekEndDate | String | 이번 주 종료일 | `yyyy-MM-dd` |
| weeklyClosetUsageRate | Integer | 이번 주 옷장 활용률 | 예: `90` |
| closetUsageType | String | 옷장 활용 타입 | 예: `마스터형 옷장` |
| unwornClothesCount | Long | 이번 주 입지 않은 옷 개수 |  |

### 3-3. Error Response

#### JSON Example

```json
{
  "isSuccess": false,
  "code": "ERROR_CODE",
  "message": "에러 메시지입니다.",
  "result": null
}
```

#### Error Scenario

| HTTP Status | Error Code | Message | Cause & Solution |
| --- | --- | --- | --- |
| 400 | ERR_001 | 잘못된 요청입니다. | 잘못된 요청 |
| 404 | ERR_002 | 찾을 수 없습니다. | 존재하지 않는 데이터 |
| 500 | ERR_999 | 서버 에러 | 서버 로그 확인 필요 |

---

# GET `/api/home/weekly-closet-usage/worn-clothes`

## 1. API 개요

> 옷장 활용률 분석 화면에서 분포 카드를 눌렀을 때 이번 주 입은 옷 목록과 가격 총합을 조회합니다.

---

## 2. Request

### 2-1. Header

| Key | Value (Example) | Required | Description |
| --- | --- | --- | --- |
| Authorization | Bearer `{Access_Token}` | O | 인증 토큰 |
| Content-Type | application/json | O | 데이터 타입 |

### 2-2. Path Variable

없음

### 2-3. Query String

없음

### 2-4. Request Body

없음

---

## 3. Response

### 3-1. Success Response

#### HTTP Status

| Code | Description |
| --- | --- |
| 200 | OK |

#### Response Body Example

```json
{
  "isSuccess": true,
  "code": "COMMON_200",
  "message": "요청에 성공했습니다.",
  "result": {
    "weeklyClosetUsageRate": 90,
    "closetUsageType": "마스터형 옷장",
    "wornClothesCount": 3,
    "totalWornClothesPrice": 134200,
    "wornClothes": [
      {
        "clothesId": 32,
        "imageUrl": "https://weartrack-images.s3.ap-northeast-2.amazonaws.com/clothes/example.png",
        "price": 59000
      }
    ]
  }
}
```

#### Swagger Example

```json
{
  "isSuccess": true,
  "code": "string",
  "message": "string",
  "result": {
    "weeklyClosetUsageRate": 1073741824,
    "closetUsageType": "string",
    "wornClothesCount": 1073741824,
    "totalWornClothesPrice": 9007199254740991,
    "wornClothes": [
      {
        "clothesId": 9007199254740991,
        "imageUrl": "string",
        "price": 1073741824
      }
    ]
  }
}
```

### 3-2. Response Field

| Field | Type | Description | 값/비고 |
| --- | --- | --- | --- |
| isSuccess | Boolean | 요청 성공 여부 | `true`: 성공, `false`: 실패 |
| code | String | 응답 코드 | 예: `COMMON_200` |
| message | String | 응답 메시지 | 예: `요청에 성공했습니다.` |
| result | Object | 응답 데이터 |  |
| weeklyClosetUsageRate | Integer | 이번 주 옷장 활용률 | 예: `90` |
| closetUsageType | String | 옷장 활용 타입 | 예: `마스터형 옷장` |
| wornClothesCount | Integer | 이번 주 입은 옷 개수 |  |
| totalWornClothesPrice | Long | 이번 주 입은 옷 가격 총합 | 영수증 화면의 TOTAL PRICE에 사용 |
| wornClothes | Object[] | 이번 주 입은 옷 목록 |  |
| clothesId | Long | 옷 ID |  |
| imageUrl | String | 옷 이미지 URL |  |
| price | Integer | 옷 가격 |  |

### 3-3. Error Response

#### JSON Example

```json
{
  "isSuccess": false,
  "code": "ERROR_CODE",
  "message": "에러 메시지입니다.",
  "result": null
}
```

#### Error Scenario

| HTTP Status | Error Code | Message | Cause & Solution |
| --- | --- | --- | --- |
| 400 | ERR_001 | 잘못된 요청입니다. | 잘못된 요청 |
| 404 | ERR_002 | 찾을 수 없습니다. | 존재하지 않는 데이터 |
| 500 | ERR_999 | 서버 에러 | 서버 로그 확인 필요 |
