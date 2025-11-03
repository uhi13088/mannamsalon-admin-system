# 맛남살롱 근무관리 시스템

**ABC Dessert Center 통합 인사관리 시스템**

---

## 📌 프로젝트 개요

맛남살롱 3개 매장(부천시청점, 상동점, 부천역사점)의 직원 관리, 근태 관리, 급여 관리, 계약서 작성/서명을 통합 관리하는 웹 기반 시스템입니다.

### 🎯 주요 목표
- ✅ 직원 등록 및 관리 자동화
- ✅ 근로계약서 작성/서명 디지털화
- ✅ 근태 및 급여 관리 효율화
- ✅ HACCP 인증 공장 인건비 신고 지원

---

## 🌐 배포 URL

**Production URL**: https://mannamsalon-admin.pages.dev

### 페이지 구조
```
/                          → index.html (메인 랜딩 페이지)
/admin-login.html          → 관리자 로그인
/admin-dashboard.html      → 관리자 대시보드
/employee-login.html       → 직원 로그인
/employee.html             → 직원 페이지
/employee-register.html    → 직원 가입 페이지
/contract-sign.html        → 계약서 서명 페이지
```

---

## 🗂️ 파일 구조

```
📁 프로젝트 루트
├── index.html                  # 메인 랜딩 페이지 (관리자/직원 선택)
├── admin-dashboard.html        # 관리자 대시보드 (Firebase Auth + 계약서 모달)
├── employee.html               # 직원 페이지 (출퇴근, 급여조회)
├── employee-register.html      # 직원 가입 페이지 (Firebase Auth + Firestore)
├── contract-sign.html          # 계약서 서명 페이지
├── index.html.backup           # 백업 파일 (안전용)
└── README.md                   # 프로젝트 문서
```

**총 5개 HTML 파일 (핵심 페이지만 유지)**

---

## ✅ 완료된 기능

### 1️⃣ **메인 랜딩 페이지** (`index.html`)
- ✅ 관리자/직원 선택 카드 UI
- ✅ 직원 가입하기 링크
- ✅ 반응형 디자인 (브라운/베이지 테마)
- ✅ 모든 페이지로 연결

### 2️⃣ **관리자 대시보드** (`admin-dashboard.html`)
- ✅ Firebase Authentication 로그인
- ✅ 8개 탭 관리 시스템
  - 📊 대시보드 (총 직원 수, 오늘 출근, 승인 대기, 미서명 계약서)
  - 👥 직원 관리 (Firestore 연동)
  - 📋 근태 관리
  - 💰 급여 관리
  - ✔️ 승인 관리
  - 📝 계약서 관리
  - 📢 공지사항
  - 🏪 매장 관리 (localStorage)
- ✅ 계약서 작성 모달 (3단계: 기본정보 → 근무조건 → 미리보기)
- ✅ 실시간 Firestore 직원 목록 조회
- ✅ 더미 데이터 (김민수 직원)
- ✅ 메인으로 돌아가기 링크

### 3️⃣ **직원 페이지** (`employee.html`) ⭐ **NEW! 완전 리팩토링**
- ✅ Firebase Authentication 로그인 연동
- ✅ **출근/퇴근 기능 실제 작동** (Firestore `attendance` 컬렉션)
- ✅ **근무내역 실시간 조회** (Firestore 연동)
- ✅ **급여 자동 계산** (근무 기록 기반, 주휴수당/4대보험/소득세 자동 계산)
- ✅ **계약서 조회 및 서명** (Firestore `contracts` 컬렉션)
- ✅ **공지사항 실시간 조회** (Firestore `notices` 컬렉션)
- ✅ **서류 관리** (통장사본, 보건증 - Firestore `employee_docs` 컬렉션)
- ✅ localStorage 완전 제거, Firestore 영구 저장
- ✅ 메인으로 돌아가기 링크

### 4️⃣ **직원 가입 페이지** (`employee-register.html`)
- ✅ Firebase Authentication 계정 생성
- ✅ Firestore 직원 정보 저장
- ✅ 주민등록번호 입력 (13자리 자동 하이픈)
- ✅ 매장 선택 (localStorage 연동)
- ✅ 이메일/비밀번호 기반 로그인
- ✅ 입력 검증 및 에러 처리
- ✅ 메인으로 돌아가기 링크

### 5️⃣ **계약서 서명 페이지** (`contract-sign.html`)
- ✅ URL 파라미터로 계약서 ID 전달
- ✅ Firestore에서 계약서 데이터 로드
- ✅ Canvas 기반 서명 기능
- ✅ 서명 완료 시 Firestore 업데이트

---

## 🔥 Firebase 연동 상태

### 프로젝트 정보
- **Project ID**: `abcdc-staff-system`
- **Auth Domain**: `abcdc-staff-system.firebaseapp.com`
- **SDK Version**: 9.22.0 (compat 모드)

### 사용 중인 Firebase 서비스
1. **Authentication** (이메일/비밀번호)
   - 관리자 로그인 (admin-dashboard.html)
   - 직원 가입/로그인 (employee-register.html)
   
2. **Firestore Database** ✅ **영구 저장 (2025-01-31 업그레이드)**
   - `contracts` 컬렉션: 계약서 (영구 저장)
   - `signedContracts` 컬렉션: 서명된 계약서
   - `stores` 컬렉션: 매장 정보
   - `notices` 컬렉션: 공지사항
   - `employee_docs` 컬렉션: 직원 서류 (통장사본, 보건증)
   - `users` 컬렉션: 직원 정보
   
3. **자동 데이터 정리 시스템** ✅ **NEW!**
   - 1년 이상 지난 데이터 자동 삭제
   - 용량 950MB 초과 시 오래된 데이터부터 삭제
   - 24시간마다 자동 실행
   
### 데이터 구조

#### `users` / `employees` 컬렉션
```javascript
{
  uid: "Firebase Auth UID",
  email: "minsu@example.com",
  name: "김민수",
  birth: "900315-1234567",  // 주민등록번호
  phone: "010-1234-5678",
  address: "경기도 부천시 원미구",
  store: "부천시청점",
  position: "바리스타",
  userType: "employee" | "admin" | "manager",
  status: "active" | "inactive",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## 💾 데이터 저장 전략 (2025-01-31 업그레이드)

### ✅ 이중 저장 방식 (Firestore + localStorage)

**Firestore (메인 저장소 - 영구)**
- 모든 데이터를 Firestore에 먼저 저장
- 브라우저 변경/캐시 삭제에도 데이터 유지
- 모든 기기에서 동일한 데이터 조회 가능
- **완전 무료** (무료 플랜으로 충분)

**localStorage (캐시 - 백업)**
- Firestore 데이터를 캐시로 저장
- 오프라인에서도 최근 데이터 조회 가능
- 빠른 로딩 속도
- Firestore 장애 시 백업으로 사용

### 데이터 우선순위
1. **저장 시**: Firestore 먼저 저장 → localStorage 캐시
2. **로드 시**: Firestore 먼저 읽기 → 실패 시 localStorage
3. **삭제 시**: Firestore와 localStorage 모두 삭제

### 자동 정리 정책
- **1년 경과 데이터**: 자동 삭제
- **용량 초과 (950MB)**: 오래된 데이터부터 자동 삭제
- **실행 주기**: 24시간마다 자동
- **수동 실행**: 관리자 대시보드에서 가능

### Firestore 컬렉션 구조

#### 1. `contracts` (계약서)
```javascript
{
  id: "C20250130...",
  employeeName: "김민수",
  employeeBirth: "900315-1234567",
  contractType: "정규직",
  startDate: "2025-01-01",
  endDate: "2025-12-31",
  createdAt: "2025-01-30T...",
  // ... 기타 계약 조건
}
```

#### 2. `signedContracts` (서명)
```javascript
{
  id: "C20250130...",
  signedAt: "2025-01-30T...",
  signature: "data:image/png;base64,..."
}
```

#### 3. `stores` (매장)
```javascript
{
  id: "1",
  name: "부천시청점",
  address: "경기도 부천시 원미구",
  phone: "032-123-4567",
  ceo: "홍길동",
  businessNumber: "123-45-67890",
  ceoSignature: "data:image/png;base64,...",
  createdAt: "2025-01-30T..."
}
```

#### 4. `notices` (공지사항)
```javascript
{
  id: "N1706678400000",
  title: "공지사항 제목",
  content: "공지사항 내용",
  important: true,
  createdAt: "2025-01-30T...",
  updatedAt: "2025-01-31T..."
}
```

---

## 🚧 개발 중인 기능

### 우선순위 높음
- ⏳ 관리자 대시보드 근태 관리 기능 강화
- ⏳ 관리자 대시보드 급여 관리 기능 강화
- ⏳ 승인 관리 워크플로우

### 우선순위 중간
- ⏳ 관리자 계약서 작성 Firestore 연동
- ⏳ 매장 관리 Firestore 연동

### 우선순위 낮음
- ⏳ Google Apps Script 백엔드 연동
- ⏳ 스프레드시트 동기화
- ⏳ 알림 시스템 (이메일/SMS)

---

## 🎨 디자인 시스템

### 컬러 테마 (브라운/베이지)
```css
--primary-color: #8b7355;      /* 메인 브라운 */
--primary-dark: #6b5d4f;       /* 다크 브라운 */
--bg-light: #f5f1e8;           /* 배경 베이지 */
--bg-white: #fdfcfa;           /* 카드 백그라운드 */
--text-primary: #6b5d4f;       /* 주요 텍스트 */
--text-secondary: #9b8a76;     /* 보조 텍스트 */
--border-color: #e8dfd0;       /* 테두리 */
--success-color: #7a9b7a;      /* 성공 */
--warning-color: #d4a574;      /* 경고 */
--danger-color: #c67b7b;       /* 위험 */
```

**✅ 모든 페이지에서 동일한 CSS 변수 사용**

### 반응형 브레이크포인트
- 모바일: `< 640px`
- 태블릿: `640px ~ 768px`
- 데스크톱: `> 768px`

---

## 🔐 보안 및 권한 관리 (2025-01-31 업그레이드)

### ✅ 구현 완료
- ✅ Firebase Authentication 사용
- ✅ **Firestore Security Rules 적용** (역할 기반 접근 제어)
- ✅ 관리자 전용 기능 분리
- ✅ 직원 데이터 본인만 접근 가능

### Firestore 보안 규칙

**파일**: `firestore.rules`

**규칙**:
```javascript
// 관리자 (admin@mannamsalon.com): 모든 권한
// 직원: 본인 데이터만 읽기/쓰기
// 미인증: 접근 불가

contracts/          → 관리자: 모든 권한, 직원: 본인 계약서만 읽기
signedContracts/    → 관리자: 모든 권한, 직원: 서명 생성 가능
stores/             → 관리자: 쓰기, 모든 인증 사용자: 읽기
notices/            → 관리자: 쓰기, 모든 인증 사용자: 읽기
employee_docs/      → 관리자: 모든 권한, 직원: 본인 서류만
users/              → 관리자: 모든 권한, 직원: 본인 정보만
```

### ⚠️ 개선 필요 사항
1. 주민등록번호 암호화 (AES-256) - 현재 평문 저장
2. HTTPS 강제 적용
3. 세션 타임아웃 설정
4. 비밀번호 정책 강화 (최소 8자리, 특수문자 포함)
5. 계약서 PDF 암호화

---

## 📱 테스트 계정

### 관리자 계정
- Email: (Firebase Console에서 생성 필요)
- Password: (Firebase Console에서 생성 필요)

### 테스트 직원
- 이름: 김민수, 이지은, 박서준, 최영희, 정수민, 강호동
- (직원 페이지에서 이름만으로 로그인 가능)

### 더미 데이터
- 직원: 김민수 (부천시청점, 바리스타)
  - 주민등록번호: 900315-1234567
  - 연락처: 010-1234-5678
  - 이메일: minsu@example.com

---

## 🚀 배포 방법

### Genspark 배포
1. **Publish 탭** 클릭
2. 자동 배포 완료
3. 생성된 URL 확인

### 주의사항
- ✅ 모든 HTML 파일이 루트에 위치해야 함
- ✅ 상대 경로 사용 (`admin-dashboard.html`, `employee.html`)
- ✅ Firebase Config는 클라이언트 사이드에 노출됨 (보안 규칙으로 제어)

---

## 🛠️ 기술 스택

- **Frontend**: HTML5, CSS3 (CSS Variables), Vanilla JavaScript
- **Backend**: Firebase (Authentication, Firestore)
- **Storage**: localStorage (계약서, 매장 정보)
- **Design**: 커스텀 CSS (브라운/베이지 테마)
- **Icons**: Emoji (☕, 👨‍💼, 👤, 📝 등)

---

## 🧹 업데이트 이력

### 2025-02-01 ⭐ **직원 페이지 완전 리팩토링**
- ✅ **employee.html 리팩토링**
  - Firebase SDK 중복 제거 (HTML 내부 스크립트 → 외부 JS 파일)
  - 코드 일관성 개선
  
- ✅ **employee.js 완전 재작성 (Firestore 완전 연동)**
  - localStorage 완전 제거, Firestore 영구 저장으로 전환
  - 출퇴근 기능: Firestore `attendance` 컬렉션 실시간 연동
  - 근무내역 조회: Firestore에서 실시간 조회
  - 급여 자동 계산: 근무 기록 기반 (기본급, 주휴수당, 4대보험, 소득세)
  - 계약서 조회: Firestore `contracts`/`signedContracts` 컬렉션
  - 공지사항: Firestore `notices` 컬렉션 (중요/일반 분리)
  - 서류 관리: Firestore `employee_docs` 컬렉션 (통장사본, 보건증)
  
- ✅ **데이터 영구 저장 및 실시간 동기화**
  - 모든 데이터가 Firestore에 영구 저장됨
  - 브라우저 캐시 삭제해도 데이터 유지
  - 모든 기기에서 동일한 데이터 조회 가능

### 2025-01-31 (Firebase 영구 저장 + 자동 정리)
- ✅ **Firestore 기반 영구 저장 구현**
  - 계약서, 매장, 공지사항 → Firestore 우선 저장
  - localStorage는 캐시로만 사용
  - Firestore 장애 시 localStorage 백업 사용
  
- ✅ **자동 데이터 정리 시스템**
  - `firestore-utils.js` 추가
  - 1년 경과 데이터 자동 삭제
  - 용량 950MB 초과 시 오래된 데이터부터 삭제
  - 24시간마다 자동 실행
  
- ✅ **보안 규칙 설정**
  - `firestore.rules` 추가
  - 역할 기반 접근 제어 (RBAC)
  - 관리자/직원 권한 분리
  
- ✅ **관리자 대시보드 업그레이드**
  - 데이터 관리 섹션 추가
  - 용량 확인, 정리 미리보기, 자동 정리 실행
  - localStorage → Firestore 마이그레이션 UI
  - 로컬 백업 기능
  
- ✅ **공지사항 기능 완료**
  - 관리자: 작성/수정/삭제
  - 직원: 조회 (중요 공지사항 상단 고정)
  - Firestore 영구 저장

### 2025-01-30 (대규모 리팩토링)
- ✅ 불필요한 파일 8개 삭제
  - contract.html, contract-modal.html, contract-modal-content.html
  - admin.html, login.html
  - firebase-test.html, index-firebase-test.html, index-original.html
- ✅ admin-dashboard.html "직원 추가" 버튼 제거
- ✅ Firebase Config 통일 검증 (2개 파일)
- ✅ Firebase SDK 버전 통일 확인 (9.22.0)
- ✅ CSS 변수 통일 검증 (5개 파일)
- ✅ JavaScript 함수 중복 검사 (중복 없음 확인)
- ✅ 페이지 간 내비게이션 로직 검증
- ✅ 모든 페이지에 "메인으로 돌아가기" 링크 확인

### 2025-01-30 (초기)
- ✅ 멀티페이지 구조로 복원 (SPA 구조 제거)
- ✅ 모든 페이지에 "메인으로 돌아가기" 링크 추가
- ✅ index.html 간소화 (4.3KB)
- ✅ 페이지 간 링크 정상화

### 2025-01-29
- ✅ Firebase 연동 완료
- ✅ 직원 가입 기능 구현
- ✅ 계약서 서명 기능 추가
- ✅ 더미 데이터 (김민수) 추가

---

## 🎯 다음 단계

### 즉시 필요 (배포 전)
1. **Firestore 보안 규칙 배포** ⚠️ **필수!**
   - Firebase Console → Firestore Database → 규칙
   - `firestore.rules` 파일 내용 붙여넣기
   - 게시 버튼 클릭
   - **상세 가이드**: `FIREBASE_SETUP.md` 참고

2. **localStorage → Firestore 마이그레이션**
   - 관리자 대시보드 → 데이터 관리
   - "🔄 지금 마이그레이션" 버튼 클릭
   - 기존 계약서/공지사항 이동

### 기능 개발
3. **직원 페이지 실제 기능 구현**
   - 출근/퇴근 버튼 작동
   - 근무내역 Firestore 연동
   - 급여조회 API 연동

4. **주민등록번호 암호화** (AES-256)
5. **Google Apps Script 연동** (스프레드시트 동기화)
6. **알림 시스템** (계약서 서명 요청, 공지사항 업데이트)

---

## 📞 문의 및 지원

**프로젝트 관리**: ABC Dessert Center  
**운영 매장**: 맛남살롱 (부천시청점, 상동점, 부천역사점)  
**용도**: HACCP 인증 디저트 공장 인사관리

---

**✨ 리팩토링 완료! 깔끔한 5개 파일 구조**
