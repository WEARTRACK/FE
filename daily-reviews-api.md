# Daily Review API

일간 착용 옷 회고 API 명세입니다.  
Asia/Seoul 기준 오늘 입은 옷 선택 화면 조회 및 저장 기능을 제공합니다.

---

## 1. 오늘 입은 옷 선택 화면 조회

### API 개요

오늘 입은 옷을 선택하기 위한 등록 옷 목록과 선택 상태를 조회합니다.  
매일 20시 푸시 알림 클릭 또는 홈 화면 진입 시 사용할 수 있습니다.

### Endpoint

```http
GET /api/daily-reviews/today
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
    "reviewDate": "2026-07-01",
    "weekStartDate": "2026-07-01",
    "weekEndDate": "2026-07-01",
    "completed": true,
    "previousDayIncomplete": true,
    "noRegisteredClothes": true,
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
| reviewDate | String | 조회 날짜 |
| weekStartDate | String | 해당 주 시작일 |
| weekEndDate | String | 해당 주 종료일 |
| completed | Boolean | 오늘 회고 완료 여부 |
| previousDayIncomplete | Boolean | 이전날 회고 미완료 여부 |
| noRegisteredClothes | Boolean | 등록된 옷이 없는지 여부 |
| categories | Array | 카테고리별 옷 목록 |
| category | String | 옷 카테고리 |
| wornCount | Integer | 해당 카테고리에서 입은 옷 개수 |
| clothes | Array | 옷 목록 |
| clothesId | Long | 옷 ID |
| imageUrl | String | 옷 이미지 URL |
| color | String | 옷 색상 |

---

## 2. 오늘 입은 옷 저장

### API 개요

사용자가 특정 날짜에 입은 옷 목록을 저장하고, 해당 주차의 회고 결과를 반환합니다.

### Endpoint

```http
POST /api/daily-reviews/{reviewDate}
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
| reviewDate | String(date) | O | 저장할 날짜. `yyyy-MM-dd` 형식 |

#### Query String

없음

#### Request Body

```json
{
  "clothesIds": [
    9007199254740991
  ]
}
```

#### Request Body Field

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| clothesIds | Long[] | O | 오늘 입은 옷 ID 목록 |

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
| weekStartDate | String | 해당 주 시작일 |
| weekEndDate | String | 해당 주 종료일 |
| wornClothesCount | Integer | 해당 주 입은 옷 수 |
| weeklyClosetUsageRate | Integer | 해당 주 옷장 활용률 |
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
