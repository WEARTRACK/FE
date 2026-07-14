# POST /api/auth/logout

## 1. API 개요

### Description

로그인한 사용자의 로그아웃을 처리하는 API입니다.

### 동작 방식

- 로그인된 사용자가 로그아웃을 요청합니다.
- 현재 서버는 Refresh Token을 별도로 저장하지 않는(Stateless) 구조입니다.
- 따라서 서버에서는 토큰 무효화 작업 없이 성공 응답만 반환합니다.
- 클라이언트는 응답 성공 후 로컬에 저장된 Access Token과 Refresh Token을 삭제해야 합니다.
- 인증이 필요한 API이므로 Access Token이 반드시 필요합니다.

---

# 2. Request

## 2-1. HTTP Method

| Method | URL              |
| ------ | ---------------- |
| POST   | /api/auth/logout |

---

## 2-2. Header

| Key           | Value                 | Required | Description                    |
| ------------- | --------------------- | -------- | ------------------------------ |
| Authorization | Bearer {Access_Token} | O        | 로그인한 사용자의 Access Token |

---

## 2-3. Path Variable

없음

---

## 2-4. Query Parameter

없음

---

## 2-5. Request Body

없음

---

# 3. Response

## 3-1. Success Response

### HTTP Status

```
200 OK
```

### Response Body

```json
{
  "isSuccess": true,
  "code": "COMMON_200",
  "message": "요청에 성공했습니다.",
  "result": null
}
```

### Response Field

| Field     | Type    | Description      |
| --------- | ------- | ---------------- |
| isSuccess | Boolean | 요청 성공 여부   |
| code      | String  | 응답 코드        |
| message   | String  | 응답 메시지      |
| result    | null    | 반환 데이터 없음 |

---

## 3-2. Error Response

### Response Example

```json
{
  "isSuccess": false,
  "code": "ERROR_CODE",
  "message": "에러 메시지입니다.",
  "result": null
}
```

### Error Cases

| HTTP Status | Error Code | Message                          | Cause                                                         |
| ----------- | ---------- | -------------------------------- | ------------------------------------------------------------- |
| 401         | AUTH_401   | 인증이 필요합니다.               | Authorization 헤더가 없거나 Access Token이 유효하지 않습니다. |
| 403         | AUTH_403_1 | 탈퇴한 회원입니다.               | 탈퇴 처리된 회원의 토큰입니다.                                |
| 405         | COMMON_405 | 지원하지 않는 HTTP 메서드입니다. | POST 이외의 메서드로 요청했습니다.                            |
| 500         | COMMON_500 | 서버 에러가 발생했습니다.        | 서버 내부 오류입니다.                                         |

---

# 4. 클라이언트 처리 사항

로그아웃 성공(200 OK) 응답을 받은 후 클라이언트는 다음 작업을 수행해야 합니다.

- Access Token 삭제
- Refresh Token 삭제
- 로그인 상태 초기화
- 로그인 화면으로 이동

---

# 5. 비고

- 현재 서버는 Refresh Token을 저장하지 않는 Stateless 인증 방식을 사용합니다.
- 따라서 로그아웃 요청 시 서버에서는 별도 토큰 무효화 없이 성공 응답을 반환합니다.
- 실제 로그아웃 처리는 클라이언트의 토큰 삭제를 통해 이루어집니다.
