# Weekly Review API

일간 착용 기록을 기반으로 주간 회고 결과를 조회하는 API 명세입니다.

---

## 1. 특정 주차 회고 결과 조회

### API 개요

특정 주차의 일간 착용 기록을 집계합니다.  
`weekStartDate`는 해당 주의 시작일을 `yyyy-MM-dd` 형식으로 전달합니다.

### Endpoint

```http
GET /api/weekly-reviews/{weekStartDate}
```

### Request

#### Header

| Key | Value Example | Required | Description |
| --- | --- | --- | --- |
| Authorization | Bearer {Access_Token} | O | 인증 토큰 |
| Content-Type | application/json | O | 데이터 타입 |

#### Path Variable

| Key | Type | Required | Description |
| --- | --- | --- | --- |
| weekStartDate | String(date) | O | 조회할 주차의 시작일. `yyyy-MM-dd` 형식 |

#### Query String

없음

#### Request Body

없음

### Response

#### Success Response

```json
{
  "isSuccess": true,
  "code": "COMMON_200",
  "message": "요청에 성공했습니다.",
  "result": {
    "weekStartDate": "2026-07-01",
    "weekEndDate": "2026-07-01",
    "wornClothesCount": 0,
    "weeklyClosetUsageRate": 0,
    "weeklyInsight": "string",
    "categories": [
      {
        "category": "string",
        "wornCount": 0,
        "clothes": [
          {
            "clothesId": 9007199254740991,
            "imageUrl": "string",
            "color": "string"
          }
        ]
      }
    ]
  }
}
```

#### Response Field

| Field | Type | Description |
| --- | --- | --- |
| weekStartDate | String | 조회 주차 시작일 |
| weekEndDate | String | 조회 주차 종료일 |
| wornClothesCount | Integer | 해당 주차에 입은 옷 수 |
| weeklyClosetUsageRate | Integer | 해당 주차 옷장 활용률 |
| weeklyInsight | String | 주간 옷장 활용 인사이트 |
| categories | Array | 카테고리별 착용 옷 목록 |
| category | String | 옷 카테고리 |
| wornCount | Integer | 해당 카테고리에서 입은 옷 개수 |
| clothes | Array | 옷 목록 |
| clothesId | Long | 옷 ID |
| imageUrl | String | 옷 이미지 URL |
| color | String | 옷 색상 |

---

## 2. 이번 주 회고 결과 조회

### API 개요

매일 저장한 일간 착용 기록을 현재 주차 기준으로 집계합니다.  
주간 회고 결과 화면에 필요한 착용 옷 수, 옷장 활용률, 주간 인사이트, 카테고리별 착용 옷 목록을 반환합니다.

### Endpoint

```http
GET /api/weekly-reviews/current
```

### Request

#### Header

| Key | Value Example | Required | Description |
| --- | --- | --- | --- |
| Authorization | Bearer {Access_Token} | O | 인증 토큰 |
| Content-Type | application/json | O | 데이터 타입 |

#### Path Variable

없음

#### Query String

없음

#### Request Body

없음

### Response

#### Success Response

```json
{
  "isSuccess": true,
  "code": "COMMON_200",
  "message": "요청에 성공했습니다.",
  "result": {
    "weekStartDate": "2026-07-01",
    "weekEndDate": "2026-07-01",
    "wornClothesCount": 0,
    "weeklyClosetUsageRate": 0,
    "weeklyInsight": "string",
    "categories": [
      {
        "category": "string",
        "wornCount": 0,
        "clothes": [
          {
            "clothesId": 9007199254740991,
            "imageUrl": "string",
            "color": "string"
          }
        ]
      }
    ]
  }
}
```

#### Response Field

| Field | Type | Description |
| --- | --- | --- |
| weekStartDate | String | 현재 주차 시작일 |
| weekEndDate | String | 현재 주차 종료일 |
| wornClothesCount | Integer | 현재 주차에 입은 옷 수 |
| weeklyClosetUsageRate | Integer | 현재 주차 옷장 활용률 |
| weeklyInsight | String | 주간 옷장 활용 인사이트 |
| categories | Array | 카테고리별 착용 옷 목록 |
| category | String | 옷 카테고리 |
| wornCount | Integer | 해당 카테고리에서 입은 옷 개수 |
| clothes | Array | 옷 목록 |
| clothesId | Long | 옷 ID |
| imageUrl | String | 옷 이미지 URL |
| color | String | 옷 색상 |

---

## Error Response

```json
{
  "isSuccess": false,
  "code": "ERROR_CODE",
  "message": "에러 메시지입니다.",
  "result": null
}
```

| HTTP Status | Error Code | Message | Cause & Solution |
| --- | --- | --- | --- |
| 400 | ERR_001 | 잘못된 요청입니다. | 필수 파라미터 또는 요청값 확인 |
| 404 | ERR_002 | 찾을 수 없습니다. | 존재하지 않는 ID 또는 리소스 조회 |
| 500 | ERR_999 | 서버 에러 | 서버 로그 확인 필요 |
