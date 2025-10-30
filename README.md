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

**Production URL**: [Genspark에서 Publish 후 자동 생성]

### 페이지 구조
```
/                          → index.html (메인 랜딩 페이지)
/admin-dashboard.html      → 관리자 대시보드
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

### 3️⃣ **직원 페이지** (`employee.html`)
- ✅ 이름 기반 간편 로그인
- ✅ 출근/퇴근 버튼 (개발 중)
- ✅ 근무내역 조회 탭
- ✅ 급여조회 탭
- ✅ 계약서 조회 탭
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
- ✅ localStorage에서 계약서 데이터 로드
- ✅ Canvas 기반 서명 기능
- ✅ 서명 완료 시 localStorage 업데이트

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
   
2. **Firestore Database**
   - `users` 컬렉션: 전체 사용자 정보
   - `employees` 컬렉션: 직원 전용 정보
   
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

## 💾 localStorage 사용 데이터

### 1. 매장 정보 (`stores`)
```javascript
[
  { id: "1", name: "부천시청점", address: "경기도 부천시 원미구", phone: "032-123-4567" },
  { id: "2", name: "상동점", address: "경기도 부천시 상동", phone: "032-123-4568" },
  { id: "3", name: "부천역사점", address: "경기도 부천시 부천역 인근", phone: "032-123-4569" }
]
```

### 2. 계약서 데이터 (`contract_C202501...`)
```javascript
{
  id: "C20250130...",
  employeeName: "김민수",
  employeeBirth: "900315-1234567",
  contractType: "정규직",
  startDate: "2025-01-01",
  endDate: "2025-12-31",
  baseSalary: 2500000,
  workDays: ["월", "화", "수", "목", "금"],
  workSchedule: [...],
  createdAt: "2025-01-30T...",
  // ... 기타 계약 조건
}
```

### 3. 서명된 계약서 (`signedContracts`)
```javascript
[
  {
    id: "C20250130...",
    signedAt: "2025-01-30T...",
    signature: "data:image/png;base64,..."
  }
]
```

---

## 🚧 개발 중인 기능

### 우선순위 높음
- ⏳ 계약서 모달 완전 통합 (admin-dashboard.html)
- ⏳ 직원 페이지 실제 기능 구현
  - 출근/퇴근 버튼 작동
  - 근무내역 Firestore 연동
  - 급여조회 API 연동
  - 계약서 조회 기능

### 우선순위 중간
- ⏳ 근태 관리 시스템
- ⏳ 급여 계산 및 관리
- ⏳ 승인 관리 워크플로우
- ⏳ 공지사항 기능

### 우선순위 낮음
- ⏳ Google Apps Script 백엔드 연동
- ⏳ 스프레드시트 동기화
- ⏳ 알림 시스템

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

## 🔐 보안 고려사항

### 현재 구현
- ✅ Firebase Authentication 사용
- ⚠️ Firestore Security Rules 적용 필요
- ⚠️ 주민등록번호 암호화 필요 (현재 평문 저장)

### 추천 개선 사항
1. Firestore Security Rules 설정
2. 주민등록번호 암호화 (AES-256)
3. HTTPS 강제 적용
4. 세션 타임아웃 설정
5. 비밀번호 정책 강화

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

## 🧹 리팩토링 이력

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

1. **Genspark 404 에러 해결** (서브페이지 접근 문제)
2. **계약서 모달 완전 통합** (admin-dashboard.html)
3. **직원 페이지 실제 기능 구현** (출퇴근, 급여조회)
4. **Firestore Security Rules 설정**
5. **주민등록번호 암호화**
6. **Google Apps Script 연동** (스프레드시트 동기화)

---

## 📞 문의 및 지원

**프로젝트 관리**: ABC Dessert Center  
**운영 매장**: 맛남살롱 (부천시청점, 상동점, 부천역사점)  
**용도**: HACCP 인증 디저트 공장 인사관리

---

**✨ 리팩토링 완료! 깔끔한 5개 파일 구조**
