# Member API

## 문서 개요

회원 정보와 관련된 API를 정리한 문서입니다.

### Base URL

```text
/api/members
```

### 공통 인증 방식

인증이 필요한 API는 다음 헤더를 포함해야 합니다.

```http
Authorization: Bearer {Access_Token}
```

### API 목록

| 기능                | Method | Endpoint                          |
| ------------------- | ------ | --------------------------------- |
| 필수 약관 동의 저장 | POST   | `/api/members/me/terms-agreement` |
| 닉네임 설정 및 수정 | PATCH  | `/api/members/me/nickname`        |
| 마이페이지 정보 조회 | GET    | `/api/members/me`                 |
| 회원탈퇴            | DELETE | `/api/members/me`                 |

---

# 1. 필수 약관 동의 저장

## 1-1. API 개요

### Endpoint

```http
POST /api/members/me/terms-agreement
```

### Description

로그인한 사용자의 필수 약관 동의 정보를 저장하는 API입니다.

- 프론트엔드는 필수 약관 전체 동의 여부를 `requiredTermsAgreed`로 전달합니다.
- `requiredTermsAgreed`가 `true`이면 서비스 이용약관과 개인정보 처리방침에 모두 동의한 것으로 저장합니다.
- 회원 정보에는 필수 약관 동의 여부와 동의 일시가 함께 저장됩니다.
- `requiredTermsAgreed`가 `false`이면 필수 약관 미동의 오류가 반환됩니다.
- 인증이 필요한 API이므로 유효한 Access Token이 필요합니다.

---

## 1-2. Request

### Header

| Key           | Value Example           | Required | Description                    |
| ------------- | ----------------------- | -------- | ------------------------------ |
| Authorization | `Bearer {Access_Token}` | O        | 로그인한 사용자의 Access Token |
| Content-Type  | `application/json`      | O        | 요청 바디의 데이터 형식        |

### Path Variable

없음

### Query Parameter

없음

### Request Body

```json
{
  "requiredTermsAgreed": true
}
```

### Request Field

| Field               | Type    | Required | Description              | Constraints          |
| ------------------- | ------- | -------- | ------------------------ | -------------------- |
| requiredTermsAgreed | Boolean | O        | 필수 약관 전체 동의 여부 | 반드시 `true`로 전달 |

---

## 1-3. Response

### Success Response

#### HTTP Status

```text
200 OK
```

#### Response Body

```json
{
  "isSuccess": true,
  "code": "COMMON_200",
  "message": "요청에 성공했습니다.",
  "result": null
}
```

#### Response Field

| Field     | Type    | Description           |
| --------- | ------- | --------------------- |
| isSuccess | Boolean | 요청 성공 여부        |
| code      | String  | 서버 응답 코드        |
| message   | String  | 응답 메시지           |
| result    | null    | 별도 응답 데이터 없음 |

### Error Response

```json
{
  "isSuccess": false,
  "code": "ERROR_CODE",
  "message": "에러 메시지입니다.",
  "result": null
}
```

### Error Cases

| HTTP Status  | Error Code     | Message                          | Cause & Solution                                                     |
| ------------ | -------------- | -------------------------------- | -------------------------------------------------------------------- |
| 400          | MEMBER_400_2   | 필수 약관에 동의해야 합니다.     | `requiredTermsAgreed`를 `true`로 전달해야 합니다.                    |
| 400          | COMMON_400     | 잘못된 요청입니다.               | Request Body 또는 `requiredTermsAgreed` 필드 누락 여부를 확인합니다. |
| 401 또는 403 | 인증/인가 오류 | 인증이 필요합니다.               | Authorization 헤더와 Access Token의 유효성을 확인합니다.             |
| 404          | MEMBER_404_1   | 사용자를 찾을 수 없습니다.       | Access Token에 해당하는 회원이 존재하는지 확인합니다.                |
| 405          | COMMON_405     | 지원하지 않는 HTTP 메서드입니다. | POST 메서드로 호출해야 합니다.                                       |
| 500          | COMMON_500     | 서버 에러가 발생했습니다.        | 서버 로그를 확인합니다.                                              |

---

## 1-4. 클라이언트 처리 사항

약관 동의 성공 응답을 받은 후 클라이언트는 다음 작업을 수행합니다.

1. 필수 약관 동의 완료 상태를 사용자 상태에 반영합니다.
2. 닉네임 설정 단계로 이동합니다.
3. 약관 동의 화면에 다시 진입하지 않도록 처리합니다.
4. 서버 성공 응답 전에 동의 완료 상태를 확정하지 않습니다.

---

## 1-5. 비고

- 회원가입 성공 화면(src/features/entry/screens/SignInScreen.tsx)의 다음 단계에서 약관 동의 여부를 최초로 받고 동의 완료 후 닉네임 설정 화면(src/features/entry/screens/SetNicknameScreen.tsx)으로 이동합니다.
- 마이페이지에서 약관 상세 내용 상시 확인 가능합니다.
- 약관 개정 시 기존 캐시를 무효화하고 최신 내용으로 갱신

---

# 2. 닉네임 설정 및 수정

## 2-1. API 개요

### Endpoint

```http
PATCH /api/members/me/nickname
```

### Description

로그인한 사용자의 닉네임을 최초 설정하거나 기존 닉네임을 수정하는 API입니다.

- 닉네임 최초 설정과 수정에 동일한 API를 사용합니다.
- 닉네임은 다른 회원과 중복될 수 없습니다.
- 닉네임 설정 또는 수정이 완료되면 변경된 회원 정보가 반환됩니다.
- 닉네임이 정상적으로 설정된 경우 `profileCompleted`는 `true`로 반환됩니다.
- 인증이 필요한 API이므로 유효한 Access Token이 필요합니다.

---

## 2-2. Request

### Header

| Key           | Value Example           | Required | Description                    |
| ------------- | ----------------------- | -------- | ------------------------------ |
| Authorization | `Bearer {Access_Token}` | O        | 로그인한 사용자의 Access Token |
| Content-Type  | `application/json`      | O        | 요청 바디의 데이터 형식        |

### Path Variable

없음

### Query Parameter

없음

### Request Body

```json
{
  "nickname": "웨어"
}
```

### Request Field

| Field    | Type   | Required | Description                   | Constraints                    |
| -------- | ------ | -------- | ----------------------------- | ------------------------------ |
| nickname | String | O        | 최초 설정하거나 변경할 닉네임 | 공백 불가, 최대 5자, 중복 불가 |

---

## 2-3. Response

### Success Response

#### HTTP Status

```text
200 OK
```

#### Response Body

```json
{
  "isSuccess": true,
  "code": "COMMON_200",
  "message": "요청에 성공했습니다.",
  "result": {
    "memberId": 1,
    "nickname": "웨어",
    "profileCompleted": true
  }
}
```

### Response Field

| Field                   | Type    | Description             |
| ----------------------- | ------- | ----------------------- |
| isSuccess               | Boolean | 요청 성공 여부          |
| code                    | String  | 서버 응답 코드          |
| message                 | String  | 응답 메시지             |
| result.memberId         | Long    | 회원 ID                 |
| result.nickname         | String  | 설정 또는 수정된 닉네임 |
| result.profileCompleted | Boolean | 프로필 설정 완료 여부   |

### Error Response

```json
{
  "isSuccess": false,
  "code": "ERROR_CODE",
  "message": "에러 메시지입니다.",
  "result": null
}
```

### Error Cases

| HTTP Status  | Error Code     | Message                          | Cause & Solution                                                  |
| ------------ | -------------- | -------------------------------- | ----------------------------------------------------------------- |
| 400          | COMMON_400     | 잘못된 요청입니다.               | `nickname` 누락, 빈 문자열 또는 최대 길이 초과 여부를 확인합니다. |
| 401 또는 403 | 인증/인가 오류 | 인증이 필요합니다.               | Authorization 헤더와 Access Token의 유효성을 확인합니다.          |
| 404          | MEMBER_404_1   | 사용자를 찾을 수 없습니다.       | Access Token에 해당하는 회원이 존재하는지 확인합니다.             |
| 409          | MEMBER_409_1   | 이미 사용 중인 닉네임입니다.     | 다른 닉네임으로 다시 요청합니다.                                  |
| 405          | COMMON_405     | 지원하지 않는 HTTP 메서드입니다. | PATCH 메서드로 호출해야 합니다.                                   |
| 500          | COMMON_500     | 서버 에러가 발생했습니다.        | 서버 로그를 확인합니다.                                           |

---

## 2-4. 클라이언트 처리 사항

닉네임 설정 또는 수정 성공 후 클라이언트는 다음 작업을 수행합니다.

1. 응답의 `nickname`을 로컬 사용자 상태에 반영합니다.
2. 최초 설정 흐름이라면 `profileCompleted`를 기준으로 온보딩 완료 상태를 갱신합니다.
3. 수정 흐름이라면 마이페이지에서 변경 가능하며 변경된 닉네임을 즉시 반영합니다.
4. `MEMBER_409_1` 오류가 발생하면 닉네임 중복 안내를 표시합니다.
5. 요청 성공 전에는 화면에 표시된 닉네임을 최종 변경값으로 확정하지 않습니다.

---

## 2-5. 비고

- 이 API는 최초 닉네임 설정과 기존 닉네임 수정에 공통으로 사용합니다.
- 사용자가 기존 닉네임과 동일한 값을 다시 전달했을 때는 `MEMBER_409_1 | 이미 사용 중인 닉네임입니다.` 응답이 내려옵니다.
- 닉네임 변경이 완료되면 "닉네임이 변경되었습니다." 토스트 메시지 및 UI 즉시 반영 (`showToast("...")`를 호출하여 커스텀된 `src/components/common/Toast.tsx`를 사용하도록 합니다.)

---

# 3. 마이페이지 정보 조회

## 3-1. API 개요

### Endpoint

```http
GET /api/members/me
```

### Description

로그인한 사용자의 마이페이지 내 정보를 조회하는 API입니다.

- 마이페이지 화면에 표시할 닉네임과 이메일을 반환합니다.
- 닉네임은 회원 정보의 `nickname` 값을 사용합니다.
- 이메일은 연결된 소셜 계정의 `providerEmail` 값을 사용합니다.
- 인증이 필요한 API이므로 유효한 Access Token이 필요합니다.

---

## 3-2. Request

### Header

| Key           | Value Example           | Required | Description                    |
| ------------- | ----------------------- | -------- | ------------------------------ |
| Authorization | `Bearer {Access_Token}` | O        | 로그인한 사용자의 Access Token |

### Path Variable

없음

### Query Parameter

없음

### Request Body

없음

---

## 3-3. Response

### Success Response

#### HTTP Status

```text
200 OK
```

#### Response Body

```json
{
  "isSuccess": true,
  "code": "COMMON_200",
  "message": "요청에 성공했습니다.",
  "result": {
    "memberId": 1,
    "nickname": "김윤지",
    "email": "whgusdud@gmail.com"
  }
}
```

### Response Field

| Field           | Type    | Description               |
| --------------- | ------- | ------------------------- |
| isSuccess       | Boolean | 요청 성공 여부            |
| code            | String  | 서버 응답 코드            |
| message         | String  | 응답 메시지               |
| result.memberId | Long    | 회원 ID                   |
| result.nickname | String  | 회원 닉네임               |
| result.email    | String  | 연결된 소셜 계정 이메일   |

### Error Response

```json
{
  "isSuccess": false,
  "code": "ERROR_CODE",
  "message": "에러 메시지입니다.",
  "result": null
}
```

### Error Cases

| HTTP Status  | Error Code     | Message                          | Cause & Solution                                         |
| ------------ | -------------- | -------------------------------- | -------------------------------------------------------- |
| 401 또는 403 | 인증/인가 오류 | 인증이 필요합니다.               | Authorization 헤더에 Access Token이 포함되었는지 확인합니다. |
| 403          | AUTH_403_1     | 탈퇴한 회원입니다.               | 탈퇴 처리된 계정의 토큰인지 확인합니다.                  |
| 404          | MEMBER_404_1   | 사용자를 찾을 수 없습니다.       | 유효한 사용자 토큰인지 확인합니다.                       |
| 405          | COMMON_405     | 지원하지 않는 HTTP 메서드입니다. | GET 메서드로 호출해야 합니다.                            |
| 500          | COMMON_500     | 서버 에러가 발생했습니다.        | 서버 로그를 확인합니다.                                  |

---

## 3-4. 클라이언트 처리 사항

마이페이지 정보 조회 성공 후 클라이언트는 다음 작업을 수행합니다.

1. 응답의 `nickname`과 `email`을 마이페이지 화면에 표시합니다.
2. 응답의 `memberId`가 필요한 경우 사용자 식별 정보로 활용합니다.
3. 화면 재진입 또는 사용자 정보 변경 후에는 최신 정보를 다시 조회합니다.
4. 인증 오류가 발생하면 저장된 토큰 상태를 확인하고 로그인 흐름으로 전환합니다.
5. 조회 성공 전에는 로컬에 저장된 오래된 회원 정보를 최종값으로 확정하지 않습니다.

---

## 3-5. 비고

- 닉네임은 회원 정보의 `nickname` 필드에서 조회합니다.
- 이메일은 연결된 소셜 계정의 `providerEmail` 필드에서 조회합니다.
- 회원탈퇴 API와 동일한 `/api/members/me` 엔드포인트를 사용하지만 HTTP Method로 기능을 구분합니다.

---

# 4. 회원탈퇴

## 4-1. API 개요

### Endpoint

```http
DELETE /api/members/me
```

### Description

로그인한 사용자의 회원탈퇴를 처리하는 API입니다.

- 회원탈퇴 시 회원 데이터를 즉시 물리 삭제하지 않습니다.
- 회원 데이터의 `deletedAt` 필드에 탈퇴 시각을 저장하여 소프트 삭제 처리합니다.
- 탈퇴한 회원의 기존 Access Token으로는 이후 인증이 필요한 API를 호출할 수 없습니다.
- 탈퇴 후 7일 이내에는 동일한 소셜 계정으로 재가입할 수 없습니다.
- 탈퇴 후 7일이 지난 뒤 동일한 소셜 계정으로 로그인하면 기존 계정을 재활성화합니다.
- 인증이 필요한 API이므로 유효한 Access Token이 필요합니다.

---

## 4-2. Request

### Header

| Key           | Value Example           | Required | Description                    |
| ------------- | ----------------------- | -------- | ------------------------------ |
| Authorization | `Bearer {Access_Token}` | O        | 로그인한 사용자의 Access Token |

### Path Variable

없음

### Query Parameter

없음

### Request Body

없음

---

## 4-3. Response

### Success Response

#### HTTP Status

```text
200 OK
```

#### Response Body

```json
{
  "isSuccess": true,
  "code": "COMMON_200",
  "message": "요청에 성공했습니다.",
  "result": null
}
```

### Response Field

| Field     | Type    | Description           |
| --------- | ------- | --------------------- |
| isSuccess | Boolean | 요청 성공 여부        |
| code      | String  | 서버 응답 코드        |
| message   | String  | 응답 메시지           |
| result    | null    | 별도 응답 데이터 없음 |

### Error Response

```json
{
  "isSuccess": false,
  "code": "ERROR_CODE",
  "message": "에러 메시지입니다.",
  "result": null
}
```

### Error Cases

| HTTP Status  | Error Code     | Message                          | Cause & Solution                                         |
| ------------ | -------------- | -------------------------------- | -------------------------------------------------------- |
| 401 또는 403 | 인증/인가 오류 | 인증이 필요합니다.               | Authorization 헤더와 Access Token의 유효성을 확인합니다. |
| 400          | MEMBER_400_1   | 이미 탈퇴한 회원입니다.          | 이미 탈퇴 처리된 회원인지 확인합니다.                    |
| 404          | MEMBER_404_1   | 사용자를 찾을 수 없습니다.       | Access Token에 해당하는 회원이 존재하는지 확인합니다.    |
| 405          | COMMON_405     | 지원하지 않는 HTTP 메서드입니다. | DELETE 메서드로 호출해야 합니다.                         |
| 500          | COMMON_500     | 서버 에러가 발생했습니다.        | 서버 로그를 확인합니다.                                  |

---

## 4-4. 클라이언트 처리 사항

회원탈퇴 성공 응답을 받은 후 클라이언트는 다음 작업을 수행합니다.

1. 로컬에 저장된 Access Token을 삭제합니다.
2. 로컬에 저장된 Refresh Token을 삭제합니다.
3. 사용자 정보와 로그인 상태를 초기화합니다.
4. 사용자 관련 캐시와 전역 상태를 초기화합니다.
5. 로그인 화면 또는 온보딩 화면으로 이동합니다.
6. 뒤로가기로 인증 화면에 다시 접근하지 못하도록 네비게이션 스택을 초기화합니다.

---

## 4-5. 탈퇴 및 재가입 정책

| 구분              | 처리 방식                                       |
| ----------------- | ----------------------------------------------- |
| 탈퇴 직후         | 회원 정보의 `deletedAt`에 탈퇴 시각 저장        |
| 기존 Access Token | 이후 인증 API 호출 불가                         |
| 탈퇴 후 7일 이내  | 동일 소셜 계정 재가입 불가                      |
| 탈퇴 후 7일 경과  | 동일 소셜 계정 로그인 시 기존 계정 재활성화     |
| 회원 데이터       | 즉시 물리 삭제하지 않고 소프트 삭제 상태로 유지 |

---

## 4-6. 비고

- 회원탈퇴 성공 후에도 클라이언트에 저장된 토큰은 자동으로 삭제되지 않습니다.
- 클라이언트는 반드시 로컬 인증 정보를 직접 삭제해야 합니다.
