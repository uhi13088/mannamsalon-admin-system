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

## ✅ 현재 구현 완료 기능

### 1️⃣ **관리자 대시보드**
- ✅ 대시보드 (통계 카드)
- ✅ 직원 관리 (Firestore 연동)
- ✅ **근무기록 조회** (월별/매장별 필터링)
- ✅ 급여 관리 (Firestore 연동)
- ✅ 계약서 관리 (localStorage)
- ✅ 계약서 작성 모달 (직원 정보 자동 로드)
- ✅ 공지사항 (Firestore 연동)
- ✅ 매장 관리 (localStorage)

### 2️⃣ **직원 페이지**
- ✅ 출근/퇴근 기능 (Firestore `attendance` 컬렉션)
- ✅ 근무내역 조회 (월별 필터링)
- ✅ 급여 자동 계산 (기본급, 주휴수당, 4대보험, 소득세)
- ✅ 계약서 조회 및 서명
- ✅ 공지사항 조회
- ✅ 서류 관리 (통장사본, 보건증)

### 3️⃣ **직원 가입**
- ✅ Firebase Authentication 계정 생성
- ✅ Firestore 직원 정보 저장
- ✅ 주민등록번호 입력 및 검증
- ✅ 매장 선택 및 직급 설정

---

## 🔥 Firebase 구조

### Firestore 컬렉션
- `users` - 직원 정보
- `employees` - 직원 목록 (관리자용)
- `attendance` - 출퇴근 기록
- `contracts` - 계약서 (미서명)
- `signedContracts` - 서명된 계약서
- `salaries` - 급여 지급 내역
- `notices` - 공지사항
- `employee_docs` - 직원 서류
- `stores` - 매장 정보

### Firestore 인덱스 (필수)
**다음 인덱스가 생성되어 있어야 합니다:**

| 컬렉션 | 필드 1 | 필드 2 | 정렬 | 용도 |
|--------|--------|--------|------|------|
| `attendance` | `uid` | `date` | desc | 직원: 근무내역 조회 |
| `attendance` | `uid` | `date` | asc | 직원: 급여 계산 |
| `attendance` | `date` | - | desc | 관리자: 전체 근무기록 |
| `contracts` | `employeeUid` | `createdAt` | desc | 직원: 계약서 조회 |
| `salaries` | `month` | - | desc | 관리자: 급여 목록 |

**인덱스 생성 방법:**
1. Firebase Console → Firestore Database → 인덱스
2. "복합 인덱스 만들기" 클릭
3. 위 표의 정보대로 입력하여 생성

---

## 🐛 최근 수정 내역 (2025-02-01)

### ✅ 수정 완료된 문제들

#### 1. **관리자 페이지 - 근무기록 월별 필터링**
- ❌ 문제: 11월 조회 시 10월 데이터도 함께 표시됨
- ✅ 해결: `loadAttendanceList()` 함수에 월 필터 및 매장 필터 추가
- 파일: `admin-dashboard.html` (line 1557-1621)

#### 2. **관리자 페이지 - 급여 목록 표시**
- ❌ 문제: 급여 탭에서 데이터가 표시되지 않음
- ✅ 해결: `loadSalaryList()` 함수를 Firestore 연동으로 재작성
- 파일: `admin-dashboard.html` (line 1623-1652)
- 참고: 급여 데이터는 Firestore `salaries` 컬렉션에서 조회 (관리자가 직접 등록 필요)

#### 3. **계약서 작성 - 직원 선택 오류 메시지**
- ❌ 문제: 직원 선택 시 "Cannot read properties of null" 오류
- ✅ 해결: `loadEmployeeInfo()` 함수에 null 체크 추가, alert 제거
- 파일: `admin-dashboard.html` (line 2787-2862)
- 동작: 오류 시 콘솔 로그만 남기고 조용히 처리

#### 4. **계약서 작성 - 회사 정보 검증 개선**
- ❌ 문제: 회사 정보가 입력되어 있어도 계속 요구함
- ✅ 해결: `validateForm()` 함수 수정 - 회사 선택 또는 직접 입력 중 하나만 있으면 통과
- 파일: `admin-dashboard.html` (line 3250-3290)

#### 5. **직원 페이지 - 급여 조회**
- ❌ 문제: 급여 상세내역이 표시되지 않음
- ✅ 원인: Firestore 인덱스 부족 (이미 생성됨)
- ✅ 해결: 인덱스 생성 완료 (`attendance` 컬렉션: `uid` + `date` asc)
- 파일: `js/employee.js` (line 458-652) - 코드는 정상, 인덱스만 필요했음

---

## 📋 현재 작동 상태

### ✅ 정상 작동하는 기능
- 직원 가입 및 로그인
- 출퇴근 기록 (Firestore 저장)
- 근무내역 조회 (월별 필터링)
- 급여 자동 계산 (근무 기록 기반)
- 계약서 조회 및 서명
- 공지사항 조회
- 관리자 대시보드 - 직원 관리
- 관리자 대시보드 - 근무기록 (월별/매장별 필터)
- 관리자 대시보드 - 계약서 작성 (직원 정보 자동 로드)

### ⏳ 제한적 작동 (데이터 입력 필요)
- **급여 목록** (관리자 페이지)
  - Firestore `salaries` 컬렉션에 데이터가 있어야 표시됨
  - 현재는 관리자가 직접 등록해야 함
  - 향후 자동 계산 및 저장 기능 추가 예정

---

## 🚀 배포 방법

### Cloudflare Pages 배포
```bash
# Git push 시 자동 배포
git add .
git commit -m "Update"
git push origin main
```

Cloudflare Pages가 자동으로 감지하여 1-2분 내에 배포 완료

---

## 🔐 보안

### Firestore Security Rules
**파일**: `firestore.rules`

**주요 규칙**:
- `users`: 본인만 읽기/쓰기, 회원가입 시 생성 가능
- `employees`: 모든 인증 사용자 읽기, 회원가입 시 본인 정보 생성 가능
- `attendance`: 모든 인증 사용자 읽기, 본인만 생성/수정
- `contracts`: 본인 계약서만 읽기, 관리자만 쓰기
- `salaries`: 관리자만 읽기/쓰기
- `notices`: 모든 인증 사용자 읽기, 관리자만 쓰기

**규칙 배포 방법**:
Firebase Console → Firestore Database → 규칙 탭 → `firestore.rules` 내용 붙여넣기 → 게시

---

## 🛠️ 기술 스택

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Firebase (Authentication, Firestore)
- **Hosting**: Cloudflare Pages
- **Design**: CSS Variables (브라운/베이지 테마)

---

## 📞 문의 및 지원

**프로젝트 관리**: ABC Dessert Center  
**운영 매장**: 맛남살롱 (부천시청점, 상동점, 부천역사점)  
**용도**: HACCP 인증 디저트 공장 인사관리

---

**✨ 최종 업데이트: 2025-02-01**
**✅ 주요 버그 수정 완료, 안정적 운영 가능**
