# 🔥 Firebase 설정 가이드

맛남살롱 근무관리 시스템을 Firebase와 연동하기 위한 설정 가이드입니다.

---

## 📋 목차

1. [Firebase 프로젝트 생성](#1-firebase-프로젝트-생성)
2. [Authentication 설정](#2-authentication-설정)
3. [Firestore Database 설정](#3-firestore-database-설정)
4. [Storage 설정](#4-storage-설정)
5. [웹 앱 등록 및 SDK 설정](#5-웹-앱-등록-및-sdk-설정)
6. [보안 규칙 설정](#6-보안-규칙-설정)

---

## 1. Firebase 프로젝트 생성

### 1-1. Firebase Console 접속
1. https://console.firebase.google.com/ 접속
2. Google 계정으로 로그인
3. **"프로젝트 추가"** 버튼 클릭

### 1-2. 프로젝트 생성
1. **프로젝트 이름**: `matnam-salon-work-system` (또는 원하는 이름)
2. **Google 애널리틱스**: 선택사항 (나중에 활성화 가능)
3. **프로젝트 만들기** 클릭

---

## 2. Authentication 설정

### 2-1. Authentication 활성화
1. 좌측 메뉴에서 **"Authentication"** 클릭
2. **"시작하기"** 버튼 클릭

### 2-2. 로그인 방법 설정
1. **"Sign-in method"** 탭 클릭
2. **"이메일/비밀번호"** 선택
3. **"사용 설정"** 토글 ON
4. **"저장"** 클릭

### 2-3. 승인된 도메인 추가 (배포 후)
1. **"Settings"** 탭 클릭
2. **"승인된 도메인"** 섹션
3. 배포 URL 추가 (예: `your-domain.com`)

---

## 3. Firestore Database 설정

### 3-1. Firestore 생성
1. 좌측 메뉴에서 **"Firestore Database"** 클릭
2. **"데이터베이스 만들기"** 버튼 클릭

### 3-2. 보안 규칙 선택
- **테스트 모드로 시작** (개발 중)
  - 30일 동안 읽기/쓰기 허용
  - ⚠️ 프로덕션 환경에서는 반드시 보안 규칙 수정 필요!

### 3-3. 위치 선택
- **asia-northeast3 (서울)** 권장
- 또는 **asia-northeast1 (도쿄)**

---

## 4. Storage 설정

### 4-1. Storage 활성화
1. 좌측 메뉴에서 **"Storage"** 클릭
2. **"시작하기"** 버튼 클릭

### 4-2. 보안 규칙 선택
- **테스트 모드로 시작** (개발 중)

### 4-3. 위치 선택
- Firestore와 동일한 위치 선택 (서울 권장)

---

## 5. 웹 앱 등록 및 SDK 설정

### 5-1. 웹 앱 추가
1. 프로젝트 개요 페이지에서 **웹 아이콘 (</>)** 클릭
2. **앱 닉네임**: `맛남살롱 근무관리` (또는 원하는 이름)
3. **Firebase Hosting 설정**: 선택사항 (나중에 설정 가능)
4. **앱 등록** 클릭

### 5-2. Firebase SDK 구성 복사
아래와 같은 설정 코드가 표시됩니다:

```javascript
// Firebase SDK 구성 (예시)
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "matnam-salon-xxx.firebaseapp.com",
  projectId: "matnam-salon-xxx",
  storageBucket: "matnam-salon-xxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

### 5-3. 프로젝트에 적용
1. **`js/firebase-config.js`** 파일을 생성 또는 수정
2. 위 설정 코드를 복사하여 붙여넣기
3. Firebase SDK 초기화 코드 추가

---

## 6. 보안 규칙 설정

### 6-1. Firestore 보안 규칙

**개발 중 (테스트 모드):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2025, 3, 1);
    }
  }
}
```

**프로덕션 (권장 규칙):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // 사용자 문서
    match /users/{userId} {
      // 본인 데이터는 읽기 가능
      allow read: if request.auth != null && request.auth.uid == userId;
      // 본인 데이터 수정 가능 (단, role 변경 불가)
      allow update: if request.auth != null 
                    && request.auth.uid == userId 
                    && request.resource.data.role == resource.data.role;
      // 관리자는 모든 사용자 데이터 읽기/쓰기 가능
      allow read, write: if request.auth != null 
                         && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // 계약서
    match /contracts/{contractId} {
      // 본인 계약서 읽기
      allow read: if request.auth != null 
                  && resource.data.employeeId == request.auth.uid;
      // 관리자만 작성/수정/삭제
      allow create, update, delete: if request.auth != null 
                                    && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'manager', 'store_manager'];
    }
    
    // 근태 기록
    match /attendance/{attendanceId} {
      // 본인 근태 읽기/작성
      allow read, create: if request.auth != null 
                          && request.resource.data.employeeId == request.auth.uid;
      // 관리자는 모든 근태 읽기/수정
      allow read, update: if request.auth != null 
                          && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'manager', 'store_manager'];
    }
    
    // 가입 승인 대기
    match /pending_users/{userId} {
      // 관리자만 읽기/쓰기
      allow read, write: if request.auth != null 
                         && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'manager', 'store_manager'];
    }
  }
}
```

### 6-2. Storage 보안 규칙

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // 직원 서류 (통장사본, 보건증)
    match /employee_docs/{userId}/{fileName} {
      // 본인만 업로드 가능
      allow write: if request.auth != null && request.auth.uid == userId;
      // 본인과 관리자만 읽기 가능
      allow read: if request.auth != null && 
                  (request.auth.uid == userId || 
                   firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role in ['admin', 'manager', 'store_manager']);
    }
    
    // 계약서 서명
    match /signatures/{contractId}/{fileName} {
      // 인증된 사용자만 업로드
      allow write: if request.auth != null;
      // 관련된 사람만 읽기 가능
      allow read: if request.auth != null;
    }
  }
}
```

---

## 7. 완료 체크리스트

- [ ] Firebase 프로젝트 생성 완료
- [ ] Authentication (이메일/비밀번호) 활성화
- [ ] Firestore Database 생성 (위치: 서울)
- [ ] Storage 활성화
- [ ] 웹 앱 등록 완료
- [ ] Firebase SDK 구성 정보 복사
- [ ] `js/firebase-config.js` 파일에 설정 정보 입력
- [ ] Firestore 보안 규칙 설정
- [ ] Storage 보안 규칙 설정

---

## 8. 다음 단계

Firebase 설정이 완료되면:

1. **회원가입/로그인 페이지 개발**
   - signup-employee.html (직원용)
   - signup-admin.html (관리자용)
   - login.html (통합 로그인)

2. **데이터 마이그레이션**
   - localStorage → Firestore
   - 기존 더미 데이터 업로드

3. **기능 통합**
   - 모든 CRUD 작업을 Firestore API로 변경
   - 실시간 동기화 기능 추가

---

## 📞 문제 발생 시

- Firebase 공식 문서: https://firebase.google.com/docs
- Firebase Console: https://console.firebase.google.com/
- 설정 관련 문의: 프로젝트 담당자에게 연락

---

**작성일**: 2025-01-29  
**작성자**: 맛남살롱 근무관리 시스템 개발팀
