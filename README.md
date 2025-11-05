# 맛남살롱 통합 관리 시스템

Firebase 기반 직원 및 문서 승인 관리 시스템

## 🚀 주요 기능

### 관리자 페이지
- 👑 관리자/매니저 목록 관리
- 👥 직원 관리 (등록, 조회, 삭제)
- 📋 근무기록 관리
- 💰 급여 관리
- ✔️ 문서 승인 관리 (구매/폐기/퇴직서)
- 📝 계약서 관리
- 📢 공지사항 관리
- 🏪 매장 관리

### 직원 포털
- 🟢 출근/퇴근 기록
- 📋 내 근무내역 조회
- 💰 급여 조회
- ✔️ 문서 승인 신청 (구매/폐기/퇴직서)
- 📝 계약서 확인
- 📢 공지사항 확인

## 🔧 Firebase Authentication 자동 정리

### 자동 삭제 (Cloud Functions)

직원/관리자 삭제 시 Firebase Authentication 계정도 자동으로 삭제됩니다.

#### 설정 방법:

1. **Cloud Functions 배포**
```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

2. **작동 확인**
- 관리자 페이지에서 직원 삭제
- Firebase Console에서 Authentication 계정 자동 삭제 확인

### 수동 정리 도구

현재 Firestore에 없는 Authentication 계정을 확인하고 정리:

1. **확인 도구 사용**
   - `cleanup-auth.html` 파일을 브라우저로 열기
   - "정리 필요 계정 확인" 버튼 클릭
   - 현재 등록된 사용자 목록 확인

2. **Firebase Console에서 수동 삭제**
   - [Firebase Authentication Console](https://console.firebase.google.com/project/abcdc-staff-system/authentication/users)
   - 도구에서 확인한 불필요한 계정 삭제

3. **대량 정리 (HTTP 트리거)**
```bash
# Cloud Functions 배포 후 사용 가능
curl -X POST https://us-central1-abcdc-staff-system.cloudfunctions.net/cleanupOrphanedAuth
```

## 📦 배포

### Cloudflare Pages (자동 배포)
- GitHub에 push하면 자동으로 배포됩니다
- URL: https://mannamsalon-admin-system.pages.dev

### 수동 배포 (Firebase Hosting)
```bash
firebase deploy --only hosting
```

## 🔐 권한 시스템

| 역할 | 권한 |
|------|------|
| **관리자** | 모든 기능 읽기/쓰기/편집/삭제 |
| **매니저** | 모든 기능 읽기 전용 |
| **직원** | 자신의 출퇴근/급여/문서신청만 가능 |

## 📊 데이터 구조

### Firestore 컬렉션
- `users`: 모든 사용자 (직원, 관리자, 매니저)
- `employees`: 직원 정보 (users의 복사본)
- `attendance`: 출퇴근 기록
- `approvals`: 문서 승인 (구매/폐기/퇴직서)
- `contracts`: 계약서 (100% Firestore)
  - `allowances`: 수당 설정 (주휴수당, 연장근로, 야간근로, 휴일근로)
  - `insurance`: 4대보험 적용 방식 (all/employment_only/freelancer/none)
- `savedContracts`: 임시 저장 계약서 (100% Firestore)
- `signedContracts`: 서명된 계약서
- `companies`: 회사 정보 (100% Firestore)
- `notices`: 공지사항
- `stores`: 매장 정보
  - `allowances`: 매장별 수당 활성화 설정 (overtime/night/holiday)
- `salaries`: 급여 계산 결과 (예정)

### Firebase Authentication
- 이메일/비밀번호 인증
- users 컬렉션 삭제 시 자동 삭제 (Cloud Functions)

## 💰 급여 계산 로직 (근로기준법 준수)

### 기본 급여
- **시급제**: 시급 × 실제 근무시간 (현재 지원)
- **월급제**: 월 급여액 고정 (추후 지원)
- **연봉제**: 연봉 ÷ 12개월 (추후 지원)

### 수당 계산 (계약서 설정에 따라 적용)
- **연장근로수당**: 시급 × 1.5배 × 연장근무시간 (주 40시간 초과분)
- **야간근로수당**: 시급 × 0.5배 × 야간근무시간 (22:00~06:00, 자동 판별)
- **휴일근로수당**: 시급 × 1.5배 × 휴일근무시간 (추후 지원)

### 주휴수당 (주 15시간 이상 근무자만)
```
주휴수당 = (주 소정근로시간 / 40시간) × 8시간 × 시급

예시:
- 주 15시간 근무: 15/40 × 8 = 3시간분
- 주 20시간 근무: 20/40 × 8 = 4시간분  
- 주 40시간 근무: 40/40 × 8 = 8시간분 (만근)
```

### 4대보험 공제
- **전체 적용**: 국민연금 4.5% + 건강보험 3.545% + 장기요양 0.459% + 고용보험 0.9% + 소득세 3.3%
- **고용·산재만**: 고용보험 0.9% + 산재보험(사업주 부담) + 소득세 3.3%
- **프리랜서**: 소득세 3.3%만
- **완전 면제**: 공제 없음

### 퇴직금 (1년 이상 근속, 주 15시간 이상 근무자)
```
퇴직금 = (최근 3개월 평균 급여) × (근속일수 / 365) × 30일
※ 추후 구현 예정
```

## 📊 급여 관리 워크플로우

### 1단계: 계약서 작성
- 매장 선택 시 해당 매장의 수당 설정 자동 적용
- 지급 항목 선택 (주휴수당, 연장근로, 야간근로, 휴일근로)
- 4대보험 적용 방식 선택
- 계약서 생성 및 Firestore 저장

### 2단계: 출퇴근 기록
- 직원이 출퇴근 체크
- attendance 컬렉션에 자동 저장
- 근무시간, 야간시간 자동 계산

### 3단계: 급여 조회 (관리자)
- 💰 급여 관리 탭 접속
- 월 선택 후 "조회" 버튼 클릭
- 시스템이 자동으로:
  - 모든 직원의 출퇴근 기록 수집
  - 계약서 기반 급여 자동 계산
  - 수당 및 공제 자동 계산
  - 실지급액 계산 및 표시

### 4단계: 급여 확정
- "상세" 버튼 클릭하여 급여 상세 내역 확인
- 지급 항목별, 공제 항목별 상세 금액 확인
- "✅ 급여 확정" 버튼 클릭
- salaries 컬렉션에 저장
- 상태: "확정됨" 표시

### 5단계: 지급 완료 처리
- 실제 급여 지급 후 "지급완료" 버튼 클릭
- paidAt, paidBy 자동 기록
- 상태: "지급완료" 표시

### 상태 관리
- 🟡 **미확정**: 계산만 완료, 아직 확정되지 않음
- 🔵 **확정됨**: 급여 확정, Firestore 저장 완료
- 🟢 **지급완료**: 실제 지급 완료

## 🛠️ 기술 스택

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Firebase (Firestore, Authentication, Cloud Functions)
- **Deployment**: Cloudflare Pages, Firebase Hosting
- **Version Control**: Git, GitHub

## 📝 주요 업데이트

### 최신 업데이트 (2025-11-05)

**버그 수정 및 개선 (최신)**
- ✅ Firestore 복합 인덱스 오류 해결 (급여 조회 실패 수정)
- ✅ 계약서 링크 전송 버튼 오류 수정 (Firestore 통합)
- ✅ 근무시간 분 단위 표시 (정확한 급여 계산)
- ✅ 연장/야간 근무시간 "X시간 Y분" 형식 표시

**급여 자동 계산 시스템 완전 구현**
- ✅ **급여 자동 계산 시스템 완전 구현 완료** 🎉
  - 매장별 수당 설정 (연장근로/야간근로/휴일근로 개별 선택)
  - 계약서 작성 시 급여 지급 항목 선택 (주휴수당/연장근로/야간근로/휴일근로)
  - 4대보험 적용 방식 선택 (전체/고용산재만/프리랜서/완전면제)
  - 퇴직금 적용 대상 설정
  - 매장 설정에 따른 수당 자동 적용
  - **출퇴근 기록 기반 자동 급여 계산**
  - 기본급, 연장수당, 야간수당, 주휴수당 자동 계산
  - 4대보험 및 소득세 자동 공제
  - 급여 상세 내역 조회
  - 급여 확정 및 Firestore 저장
  - 지급 완료 처리 기능
- ✅ **완전한 Firestore 마이그레이션 완료** - localStorage 의존성 제거
- ✅ 회사 정보(companies) Firestore 전환
- ✅ 임시 저장 계약서(savedContracts) Firestore 전환
- ✅ 계약서(contracts) Firestore 전용 저장
- ✅ 문서 승인 시스템 구현 (구매/폐기/퇴직서)
- ✅ 관리자 목록 탭 추가
- ✅ 관리자/매니저 가입 시스템 (역할별 권한 분리)
- ✅ 직원 가입 승인 시스템 (승인 대기/승인됨/거부됨)
- ✅ 매장 관리 Firestore 연동 (직원가입-관리자 동기화)
- ✅ Firebase Authentication 자동 정리 시스템
- ✅ Cloud Functions 통합 (Node.js 20)
- ✅ 퇴직 승인 시 계정 자동 삭제

## 🔗 링크

- **GitHub**: https://github.com/uhi13088/mannamsalon-admin-system
- **Cloudflare Pages**: https://mannamsalon-admin-system.pages.dev
- **Firebase Console**: https://console.firebase.google.com/project/abcdc-staff-system

## 📧 문의

프로젝트 관련 문의사항이 있으시면 GitHub Issues를 이용해주세요.
