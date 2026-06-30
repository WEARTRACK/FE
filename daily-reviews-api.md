# Daily Reviews API

## 문서 정보

| 항목           | 내용                                                 |
| -------------- | ---------------------------------------------------- |
| 기능명         | 오늘 입은 옷 저장 및 오늘 입은 옷 선택 화면 조회     |
| Base Endpoint  | `/api/daily-reviews/today`                           |
| 인증           | 필요                                                 |
| Timezone 기준  | `Asia/Seoul`                                         |
| Content-Type   | `application/json`                                   |
| 관련 화면/상황 | 매일 20시 푸시, 홈 화면 진입, 오늘 입은 옷 선택/저장 |

---

## 1. API 목록

| Method | Endpoint                   | API 이름                    | Description                                                                   |
| ------ | -------------------------- | --------------------------- | ----------------------------------------------------------------------------- |
| `GET`  | `/api/daily-reviews/today` | 오늘 입은 옷 선택 화면 조회 | 오늘 입은 옷을 선택하기 위한 등록 옷 목록과 선택 상태를 조회합니다.           |
| `POST` | `/api/daily-reviews/today` | 오늘 입은 옷 저장           | `Asia/Seoul` 기준 오늘 입은 옷을 저장하고 해당 주차의 회고 결과를 반환합니다. |

> 두 API는 endpoint가 동일하지만 HTTP Method로 구분됩니다.

---

# GET `/api/daily-reviews/today`

## 1. API 개요

> 매일 20시 푸시 또는 홈 화면 진입 시 오늘 입은 옷을 선택하기 위한 API입니다.
> 오늘 입은 옷을 선택하기 위한 등록 옷 목록과 선택 상태를 조회합니다.

---

## 2. Request

### 2-1. Header

| Key           | Value (Example)         | Required | Description |
| ------------- | ----------------------- | -------- | ----------- |
| Authorization | Bearer `{Access_Token}` | O        | 인증 토큰   |
| Content-Type  | application/json        | O        | 데이터 타입 |

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
| ---- | ----------- |
| 200  | OK          |

#### Response Body Example

```json
{
  "isSuccess": true,
  "code": "COMMON_200",
  "message": "요청에 성공했습니다.",
  "result": {
    "reviewDate": "2026-06-26",
    "weekStartDate": "2026-06-21",
    "weekEndDate": "2026-06-27",
    "completed": false,
    "previousDayIncomplete": false,
    "noRegisteredClothes": false,
    "categories": [
      {
        "category": "SHIRT",
        "selectedCount": 0,
        "clothes": [
          {
            "clothesId": 4,
            "imageUrl": "https://weartrack-images.s3.ap-northeast-2.amazonaws.com/clothes/690a0713-6c48-4f67-9ed7-28edbdbe3c76.png",
            "color": "WHITE",
            "category": "SHIRT",
            "selected": false
          }
        ]
      },
      {
        "category": "KNIT",
        "selectedCount": 0,
        "clothes": [
          {
            "clothesId": 30,
            "imageUrl": "https://weartrack-images.s3.ap-northeast-2.amazonaws.com/clothes/fd108361-4b6e-4f28-b86c-1598dfdb1010.png",
            "color": "PINK",
            "category": "KNIT",
            "selected": false
          },
          {
            "clothesId": 22,
            "imageUrl": "https://weartrack-images.s3.ap-northeast-2.amazonaws.com/clothes/5d513225-a0a9-42c4-8cbe-66aa63e70761.png",
            "color": "BROWN",
            "category": "KNIT",
            "selected": false
          }
        ]
      },
      {
        "category": "HOODIE",
        "selectedCount": 0,
        "clothes": [
          {
            "clothesId": 23,
            "imageUrl": "https://weartrack-images.s3.ap-northeast-2.amazonaws.com/clothes/b5bc1976-7072-4fbb-8197-b1a31f950768.png",
            "color": "GRAY",
            "category": "HOODIE",
            "selected": false
          }
        ]
      },
      {
        "category": "VEST",
        "selectedCount": 0,
        "clothes": [
          {
            "clothesId": 24,
            "imageUrl": "https://weartrack-images.s3.ap-northeast-2.amazonaws.com/clothes/4181effa-6869-43e1-9193-ee65b9333409.png",
            "color": "WHITE",
            "category": "VEST",
            "selected": false
          }
        ]
      },
      {
        "category": "CARDIGAN",
        "selectedCount": 0,
        "clothes": [
          {
            "clothesId": 31,
            "imageUrl": "https://weartrack-images.s3.ap-northeast-2.amazonaws.com/clothes/2aec4f96-e1e7-45e4-928a-4b912e0c7126.png",
            "color": "YELLOW",
            "category": "CARDIGAN",
            "selected": false
          },
          {
            "clothesId": 20,
            "imageUrl": "https://weartrack-images.s3.ap-northeast-2.amazonaws.com/clothes/81174131-6b27-4540-8d65-36569bc1a3d3.png",
            "color": "NAVY",
            "category": "CARDIGAN",
            "selected": false
          }
        ]
      },
      {
        "category": "PANTS",
        "selectedCount": 0,
        "clothes": [
          {
            "clothesId": 25,
            "imageUrl": "https://weartrack-images.s3.ap-northeast-2.amazonaws.com/clothes/b9d60963-2057-40b9-bd3e-aff0d757f079.png",
            "color": "GREEN",
            "category": "PANTS",
            "selected": false
          }
        ]
      },
      {
        "category": "SHORTS",
        "selectedCount": 0,
        "clothes": [
          {
            "clothesId": 33,
            "imageUrl": "https://weartrack-images.s3.ap-northeast-2.amazonaws.com/clothes/0d8da456-1b62-4c70-9ffe-bbbad6b29fd8.png",
            "color": "BLUE",
            "category": "SHORTS",
            "selected": false
          },
          {
            "clothesId": 26,
            "imageUrl": "https://weartrack-images.s3.ap-northeast-2.amazonaws.com/clothes/fdf0d97a-6add-4a9b-9942-a4b3e45ebb42.png",
            "color": "BLACK",
            "category": "SHORTS",
            "selected": false
          }
        ]
      },
      {
        "category": "SKIRT",
        "selectedCount": 0,
        "clothes": [
          {
            "clothesId": 21,
            "imageUrl": "https://weartrack-images.s3.ap-northeast-2.amazonaws.com/clothes/9f3703ff-879f-4f67-ad1a-c8396d96dd2e.png",
            "color": "WHITE",
            "category": "SKIRT",
            "selected": false
          }
        ]
      },
      {
        "category": "DRESS",
        "selectedCount": 0,
        "clothes": [
          {
            "clothesId": 27,
            "imageUrl": "https://weartrack-images.s3.ap-northeast-2.amazonaws.com/clothes/6569bf67-4a82-4e38-8444-24b22e7b2b04.png",
            "color": "WHITE",
            "category": "DRESS",
            "selected": false
          }
        ]
      },
      {
        "category": "JACKET",
        "selectedCount": 0,
        "clothes": [
          {
            "clothesId": 19,
            "imageUrl": "https://weartrack-images.s3.ap-northeast-2.amazonaws.com/clothes/91f3a2fd-4490-478c-8f1f-6c8a823708c6.png",
            "color": "NAVY",
            "category": "JACKET",
            "selected": false
          }
        ]
      },
      {
        "category": "COAT",
        "selectedCount": 0,
        "clothes": [
          {
            "clothesId": 28,
            "imageUrl": "https://weartrack-images.s3.ap-northeast-2.amazonaws.com/clothes/39f33571-65e8-44ae-ace1-fba645d582b2.png",
            "color": "GRAY",
            "category": "COAT",
            "selected": false
          }
        ]
      },
      {
        "category": "PADDING",
        "selectedCount": 0,
        "clothes": [
          {
            "clothesId": 29,
            "imageUrl": "https://weartrack-images.s3.ap-northeast-2.amazonaws.com/clothes/0b570c56-03e5-46df-86ca-b17260984bcb.png",
            "color": "NAVY",
            "category": "PADDING",
            "selected": false
          }
        ]
      },
      {
        "category": "T_SHIRT",
        "selectedCount": 0,
        "clothes": [
          {
            "clothesId": 32,
            "imageUrl": "https://weartrack-images.s3.ap-northeast-2.amazonaws.com/clothes/9bbe8ec6-f943-4342-8f28-d86dec948a9c.png",
            "color": "PURPLE",
            "category": "T_SHIRT",
            "selected": false
          },
          {
            "clothesId": 5,
            "imageUrl": "https://weartrack-images.s3.ap-northeast-2.amazonaws.com/clothes/8c32de41-a4d2-41c4-a0df-f7107f260ad5.png",
            "color": "GRAY",
            "category": "T_SHIRT",
            "selected": false
          }
        ]
      }
    ]
  }
}
```

### 3-2. Response Field

| Field                 | Type    | Description             | 값/비고                                         |
| --------------------- | ------- | ----------------------- | ----------------------------------------------- |
| isSuccess             | Boolean | 요청 성공 여부          | `true`: 성공, `false`: 실패                     |
| code                  | String  | 응답 코드               | 예: `COMMON_200`                                |
| message               | String  | 응답 메시지             | 예: `요청에 성공했습니다.`                      |
| result                | Object  | 응답 데이터             |                                                 |
| reviewDate            | String  | 조회하고 싶은 특정 날짜 | `yyyy-MM-dd`                                    |
| weekStartDate         | String  | 해당 주의 시작일        | 일요일 기준 / `yyyy-MM-dd`                      |
| weekEndDate           | String  | 해당 주의 종료일        | 토요일 기준 / `yyyy-MM-dd`                      |
| completed             | Boolean | 회고 기록 여부          | `true`: 회고 O, `false`: 회고 X                 |
| previousDayIncomplete | Boolean | 이전날 회고 기록 여부   | `true`: 전날 회고 O, `false`: 전날 회고 X       |
| noRegisteredClothes   | Boolean | 등록된 옷이 없는지 여부 | `true`: 등록된 옷 없음, `false`: 등록된 옷 있음 |
| categories            | Array   | 카테고리별 옷 목록      |                                                 |
| category              | String  | 카테고리                |                                                 |
| selectedCount         | Integer | 선택한 옷의 개수        |                                                 |
| wornCount             | Integer | 입은 옷 개수            |                                                 |
| clothes               | Array   | 옷 목록                 |                                                 |
| clothesId             | Long    | 옷 ID                   |                                                 |
| imageUrl              | String  | 옷 이미지 URL           |                                                 |
| color                 | String  | 옷 색상                 |                                                 |
| selected              | Boolean | 선택 여부               | `true`: 선택됨, `false`: 선택 안 됨             |

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

| HTTP Status | Error Code | Message            | Cause & Solution      |
| ----------- | ---------- | ------------------ | --------------------- |
| 400         | ERR_001    | 잘못된 요청입니다. | 필수 파라미터 누락    |
| 404         | ERR_002    | 찾을 수 없습니다.  | 존재하지 않는 ID 조회 |
| 500         | ERR_999    | 서버 에러          | 서버 로그 확인 필요   |

---

# POST `/api/daily-reviews/today`

## 1. API 개요

> 사용자가 오늘 입은 옷 목록을 저장합니다.
> `Asia/Seoul` 기준 오늘 입은 옷을 저장하고 해당 주차의 회고 결과를 반환합니다.

---

## 2. Request

### 2-1. Header

| Key           | Value (Example)         | Required | Description |
| ------------- | ----------------------- | -------- | ----------- |
| Authorization | Bearer `{Access_Token}` | O        | 인증 토큰   |
| Content-Type  | application/json        | O        | 데이터 타입 |

### 2-2. Path Variable

없음

### 2-3. Query String

없음

### 2-4. Request Body

#### Media Type

`application/json`

#### JSON Example

```json
{
  "clothesIds": [32, 5]
}
```

#### Request Body Field

| Field      | Type   | Required | Description            |
| ---------- | ------ | -------- | ---------------------- |
| clothesIds | Long[] | O        | 오늘 입은 옷의 ID 목록 |

---

## 3. Response

### 3-1. Success Response

#### HTTP Status

| Code | Description |
| ---- | ----------- |
| 200  | OK          |

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

### 3-2. Response Field

| Field                 | Type    | Description                  | 값/비고                     |
| --------------------- | ------- | ---------------------------- | --------------------------- |
| isSuccess             | Boolean | 요청 성공 여부               | `true`: 성공, `false`: 실패 |
| code                  | String  | 응답 코드                    | 예: `COMMON_200`            |
| message               | String  | 응답 메시지                  | 예: `요청에 성공했습니다.`  |
| result                | Object  | 응답 데이터                  |                             |
| weekStartDate         | String  | 이번주 시작하는 날           | 일요일 기준 / `yyyy-MM-dd`  |
| weekEndDate           | String  | 이번주 끝나는 날             | 토요일 기준 / `yyyy-MM-dd`  |
| wornClothesCount      | Integer | 이번주 입은 옷 개수          |                             |
| weeklyClosetUsageRate | Integer | 이번주 옷장 활용률           |                             |
| weeklyInsight         | String  | 활용률 인사이트              |                             |
| categories            | Array   | 카테고리별 주간 착용 결과    |                             |
| category              | String  | 카테고리                     |                             |
| wornCount             | Integer | 입은 옷 개수                 |                             |
| clothes               | Array   | 해당 카테고리의 착용 옷 목록 |                             |
| clothesId             | Long    | 옷 ID                        |                             |
| imageUrl              | String  | 옷 이미지 URL                |                             |
| color                 | String  | 옷 색상                      |                             |

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

| HTTP Status | Error Code | Message            | Cause & Solution      |
| ----------- | ---------- | ------------------ | --------------------- |
| 400         | ERR_001    | 잘못된 요청입니다. | 필수 파라미터 누락    |
| 404         | ERR_002    | 찾을 수 없습니다.  | 존재하지 않는 ID 조회 |
| 500         | ERR_999    | 서버 에러          | 서버 로그 확인 필요   |
