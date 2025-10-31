# 🔥 Firebase Firestore 설정 가이드

## 📋 필수 설정 단계

### 1. Firestore 보안 규칙 배포

**Firebase Console 접속:**
1. https://console.firebase.google.com/ 접속
2. `abcdc-staff-system` 프로젝트 선택
3. 왼쪽 메뉴에서 **Firestore Database** 클릭
4. 상단 탭에서 **규칙 (Rules)** 클릭
5. `firestore.rules` 파일의 내용을 복사하여 붙여넣기
6. **게시 (Publish)** 버튼 클릭

**또는 Firebase CLI 사용 (추천):**
```bash
# Firebase CLI 설치 (한 번만)
npm install -g firebase-tools

# Firebase 로그인
firebase login

# 프로젝트 초기화 (한 번만)
firebase init firestore

# 규칙 배포
firebase deploy --only firestore:rules
```

---

## 🚀 사용 방법

### 관리자 페이지에서 마이그레이션

1. **admin-dashboard.html** 접속
2. **대시보드** 탭 클릭
3. **데이터 관리** 섹션에서:
   - **노란색 경고창**이 보이면 → **"🔄 지금 마이그레이션"** 버튼 클릭
   - localStorage 데이터가 Firebase로 이동됩니다

### 자동 데이터 정리

**설정된 정책:**
- ✅ **1년 이상 지난 데이터** → 자동 삭제
- ✅ **용량 950MB 초과** → 오래된 데이터부터 삭제
- ✅ **24시간마다 자동 실행**

**수동 실행:**
1. 대시보드 → 데이터 관리 섹션
2. **"📊 용량 확인"** 버튼 → 현재 사용량 확인
3. **"🔍 정리 미리보기"** 버튼 → 삭제될 데이터 확인
4. **"🗑️ 자동 정리 실행"** 버튼 → 실제 삭제

---

## 📊 데이터 구조

```
Firestore Collections:
├── contracts/          # 계약서
├── signedContracts/    # 서명된 계약서
├── stores/             # 매장 정보
├── notices/            # 공지사항
├── employee_docs/      # 직원 서류 (통장사본, 보건증)
└── users/              # 사용자 정보 (Firebase Auth와 연동)
```

**각 문서의 필수 필드:**
- `id`: 문서 ID
- `createdAt`: 생성 일시 (ISO 8601 형식)
- `updatedAt`: 수정 일시 (선택)

---

## 💰 비용 안내

**무료 플랜 (Spark):**
- 저장 용량: **1GB** (현재 사용량: 약 0.5MB = 0.05%)
- 읽기: **50,000회/일** (현재 사용량: 약 120회/일 = 0.24%)
- 쓰기: **20,000회/일** (현재 사용량: 약 7회/일 = 0.035%)

→ **완전 무료로 사용 가능!**

**자동 정리로 용량 관리:**
- 1년 이상 지난 데이터는 자동 삭제되어 용량 절약
- 용량 초과 시에도 자동으로 오래된 데이터 삭제
- **수동 관리 불필요**

---

## 🔒 보안 규칙

**역할 기반 접근 제어:**
- **관리자 (`admin@mannamsalon.com`)**: 모든 데이터 읽기/쓰기
- **직원**: 본인 계약서/서류만 읽기/쓰기
- **미인증 사용자**: 접근 불가

**데이터 보호:**
- 모든 요청은 Firebase Authentication 필요
- 직원은 다른 직원의 데이터 접근 불가
- 관리자만 공지사항/매장 관리 가능

---

## ⚠️ 주의사항

### 1. Firestore 보안 규칙 배포 필수

**규칙을 배포하지 않으면:**
- ❌ 모든 데이터 접근이 거부됩니다
- ❌ 계약서, 공지사항 등이 저장/로드되지 않습니다

**해결 방법:**
1. Firebase Console → Firestore Database → 규칙
2. `firestore.rules` 파일 내용 붙여넣기
3. **게시** 버튼 클릭

### 2. localStorage 백업 유지

현재 시스템은 **이중 저장** 방식입니다:
- **Firestore**: 영구 저장 (메인)
- **localStorage**: 캐시 (백업)

**장점:**
- Firestore 장애 시에도 localStorage 사용 가능
- 오프라인에서도 최근 데이터 조회 가능
- 빠른 로딩 속도 (캐시 활용)

### 3. 브라우저 캐시 삭제 시

**브라우저 캐시를 삭제해도:**
- ✅ Firestore에 데이터가 남아있어 자동 복구됨
- ✅ 페이지 새로고침 시 Firestore에서 다시 로드
- ✅ 데이터 손실 없음

---

## 🔧 문제 해결

### 계약서가 보이지 않을 때

1. **Firestore 보안 규칙 확인**
   - Firebase Console → Firestore Database → 규칙
   - `firestore.rules` 내용이 적용되었는지 확인

2. **브라우저 콘솔 확인**
   - F12 → Console 탭
   - `❌ Firestore 로드 실패` 메시지 확인
   - 에러 메시지 확인

3. **마이그레이션 실행**
   - 대시보드 → 데이터 관리
   - "🔄 지금 마이그레이션" 버튼 클릭

### 용량 초과 경고

**자동 해결:**
- 24시간마다 자동 정리 실행됨
- 수동 실행: 대시보드 → "🗑️ 자동 정리 실행"

**수동 정리:**
1. "📊 용량 확인" → 현재 사용량 확인
2. "🔍 정리 미리보기" → 삭제 대상 확인
3. "🗑️ 자동 정리 실행" → 삭제 실행

---

## 📞 문의

문제 발생 시:
1. 브라우저 콘솔 (F12) 확인
2. Firebase Console → Firestore Database 확인
3. `firestore.rules` 배포 상태 확인

**정상 작동 시 콘솔 메시지:**
```
✅ Firestore 저장 완료
✅ Firestore에서 N개 계약서 로드 완료
✅ Firestore에서 N개 매장 로드 완료
```

**에러 발생 시 콘솔 메시지:**
```
❌ Firestore 저장 실패: [에러 메시지]
⚠️ localStorage에 백업 저장
```
