/**
 * Firestore 유틸리티 함수
 * - 자동 데이터 정리 (1년 이상 경과, 용량 초과)
 * - localStorage ↔ Firestore 동기화
 */

// ===== 설정 =====
const DATA_RETENTION_DAYS = 365; // 1년
const MAX_STORAGE_MB = 950; // 1GB의 95% (여유 공간 확보)

// ===== 자동 삭제 함수 =====

/**
 * 1년 이상 지난 문서 찾기
 * @param {string} collectionName - 컬렉션 이름
 * @returns {Promise<Array>} 삭제 대상 문서 목록
 */
async function findExpiredDocuments(collectionName) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - DATA_RETENTION_DAYS);
  
  console.log(`🔍 ${collectionName} 컬렉션에서 ${cutoffDate.toLocaleDateString('ko-KR')} 이전 문서 검색...`);
  
  try {
    const snapshot = await db.collection(collectionName)
      .where('createdAt', '<', cutoffDate.toISOString())
      .get();
    
    const expiredDocs = [];
    snapshot.forEach(doc => {
      expiredDocs.push({
        id: doc.id,
        data: doc.data(),
        collection: collectionName
      });
    });
    
    console.log(`📋 ${expiredDocs.length}개의 만료된 문서 발견`);
    return expiredDocs;
  } catch (error) {
    console.error(`❌ ${collectionName} 만료 문서 검색 실패:`, error);
    return [];
  }
}

/**
 * 전체 Firestore 사용 용량 추정 (클라이언트)
 * @returns {Promise<number>} 예상 용량 (MB)
 */
async function estimateFirestoreSize() {
  let totalSize = 0;
  const collections = ['contracts', 'stores', 'notices', 'employee_docs', 'signedContracts'];
  
  console.log('📊 Firestore 용량 추정 시작...');
  
  for (const collectionName of collections) {
    try {
      const snapshot = await db.collection(collectionName).get();
      snapshot.forEach(doc => {
        // JSON 크기로 추정
        const dataStr = JSON.stringify(doc.data());
        totalSize += new Blob([dataStr]).size;
      });
    } catch (error) {
      console.warn(`⚠️ ${collectionName} 용량 추정 실패:`, error);
    }
  }
  
  const sizeMB = totalSize / (1024 * 1024);
  console.log(`📦 예상 사용 용량: ${sizeMB.toFixed(2)} MB`);
  return sizeMB;
}

/**
 * 용량 초과 시 오래된 문서부터 삭제
 * @param {number} currentSizeMB - 현재 용량
 * @returns {Promise<Array>} 삭제된 문서 목록
 */
async function cleanupOldestDocuments(currentSizeMB) {
  if (currentSizeMB < MAX_STORAGE_MB) {
    console.log('✅ 용량 초과 없음');
    return [];
  }
  
  const targetDeleteMB = currentSizeMB - MAX_STORAGE_MB + 50; // 50MB 여유 확보
  console.log(`⚠️ 용량 초과! ${targetDeleteMB.toFixed(2)} MB 삭제 필요`);
  
  // 모든 문서를 createdAt 기준 오래된 순 정렬
  const allDocs = [];
  const collections = ['contracts', 'notices', 'employee_docs'];
  
  for (const collectionName of collections) {
    try {
      const snapshot = await db.collection(collectionName)
        .orderBy('createdAt', 'asc') // 오래된 순
        .get();
      
      snapshot.forEach(doc => {
        const data = doc.data();
        const dataSize = new Blob([JSON.stringify(data)]).size;
        allDocs.push({
          id: doc.id,
          collection: collectionName,
          createdAt: data.createdAt,
          sizeMB: dataSize / (1024 * 1024),
          data: data
        });
      });
    } catch (error) {
      console.error(`❌ ${collectionName} 문서 로드 실패:`, error);
    }
  }
  
  // 오래된 순 정렬
  allDocs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  
  // 목표 용량까지 삭제
  let deletedSize = 0;
  const deletedDocs = [];
  
  for (const doc of allDocs) {
    if (deletedSize >= targetDeleteMB) break;
    
    deletedDocs.push(doc);
    deletedSize += doc.sizeMB;
  }
  
  console.log(`🗑️ ${deletedDocs.length}개 문서 삭제 예정 (${deletedSize.toFixed(2)} MB)`);
  return deletedDocs;
}

/**
 * 자동 데이터 정리 실행
 * @param {boolean} dryRun - true면 실제 삭제 안함 (미리보기)
 * @returns {Promise<Object>} 정리 결과
 */
async function autoCleanupData(dryRun = false) {
  console.log('🧹 자동 데이터 정리 시작...');
  
  const result = {
    expiredDocs: [],
    oversizeDocs: [],
    deletedCount: 0,
    savedMB: 0,
    errors: []
  };
  
  try {
    // 1. 1년 이상 지난 문서 찾기
    const collections = ['contracts', 'notices', 'employee_docs'];
    for (const collectionName of collections) {
      const expired = await findExpiredDocuments(collectionName);
      result.expiredDocs.push(...expired);
    }
    
    // 2. 용량 체크
    const currentSize = await estimateFirestoreSize();
    if (currentSize > MAX_STORAGE_MB) {
      const oversizeDocs = await cleanupOldestDocuments(currentSize);
      result.oversizeDocs.push(...oversizeDocs);
    }
    
    // 3. 중복 제거 (만료 + 용량 초과 모두 해당하는 경우)
    const allDocsToDelete = [...result.expiredDocs, ...result.oversizeDocs];
    const uniqueDocs = Array.from(
      new Map(allDocsToDelete.map(doc => [`${doc.collection}/${doc.id}`, doc])).values()
    );
    
    // 4. 실제 삭제 (dryRun=false일 때만)
    if (!dryRun && uniqueDocs.length > 0) {
      for (const doc of uniqueDocs) {
        try {
          await db.collection(doc.collection).doc(doc.id).delete();
          result.deletedCount++;
          result.savedMB += doc.sizeMB || 0;
          console.log(`✅ 삭제 완료: ${doc.collection}/${doc.id}`);
        } catch (error) {
          console.error(`❌ 삭제 실패: ${doc.collection}/${doc.id}`, error);
          result.errors.push({
            doc: `${doc.collection}/${doc.id}`,
            error: error.message
          });
        }
      }
    }
    
    // 5. 결과 요약
    console.log('\n📊 정리 결과 요약:');
    console.log(`  • 만료 문서: ${result.expiredDocs.length}개`);
    console.log(`  • 용량 초과: ${result.oversizeDocs.length}개`);
    console.log(`  • 삭제된 문서: ${result.deletedCount}개`);
    console.log(`  • 확보된 용량: ${result.savedMB.toFixed(2)} MB`);
    console.log(`  • 오류: ${result.errors.length}건`);
    
    if (dryRun) {
      console.log('\n⚠️ 미리보기 모드 (실제 삭제 안함)');
    }
    
  } catch (error) {
    console.error('❌ 자동 정리 실패:', error);
    result.errors.push({ error: error.message });
  }
  
  return result;
}

// ===== localStorage → Firestore 마이그레이션 =====

/**
 * localStorage 데이터를 Firestore로 마이그레이션
 * @returns {Promise<Object>} 마이그레이션 결과
 */
async function migrateLocalStorageToFirestore() {
  console.log('🔄 localStorage → Firestore 마이그레이션 시작...');
  
  const result = {
    contracts: 0,
    stores: 0,
    notices: 0,
    signedContracts: 0,
    errors: []
  };
  
  try {
    // 1. 계약서 마이그레이션
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('contract_C')) {
        try {
          const contractData = JSON.parse(localStorage.getItem(key));
          const contractId = key.replace('contract_', '');
          
          // createdAt 없으면 추가
          if (!contractData.createdAt) {
            contractData.createdAt = new Date().toISOString();
          }
          
          await db.collection('contracts').doc(contractId).set(contractData);
          result.contracts++;
          console.log(`✅ 계약서 마이그레이션: ${contractId}`);
        } catch (error) {
          console.error(`❌ 계약서 마이그레이션 실패: ${key}`, error);
          result.errors.push({ type: 'contract', key, error: error.message });
        }
      }
    }
    
    // 2. 매장 마이그레이션
    const stores = JSON.parse(localStorage.getItem('stores') || '[]');
    for (const store of stores) {
      try {
        if (!store.createdAt) {
          store.createdAt = new Date().toISOString();
        }
        await db.collection('stores').doc(store.id).set(store);
        result.stores++;
        console.log(`✅ 매장 마이그레이션: ${store.name}`);
      } catch (error) {
        console.error(`❌ 매장 마이그레이션 실패: ${store.name}`, error);
        result.errors.push({ type: 'store', name: store.name, error: error.message });
      }
    }
    
    // 3. 공지사항 마이그레이션
    const notices = JSON.parse(localStorage.getItem('notices') || '[]');
    for (const notice of notices) {
      try {
        if (!notice.createdAt) {
          notice.createdAt = new Date().toISOString();
        }
        await db.collection('notices').doc(notice.id).set(notice);
        result.notices++;
        console.log(`✅ 공지사항 마이그레이션: ${notice.title}`);
      } catch (error) {
        console.error(`❌ 공지사항 마이그레이션 실패: ${notice.title}`, error);
        result.errors.push({ type: 'notice', title: notice.title, error: error.message });
      }
    }
    
    // 4. 서명된 계약서 마이그레이션
    const signedContracts = JSON.parse(localStorage.getItem('signedContracts') || '[]');
    for (const signed of signedContracts) {
      try {
        if (!signed.signedAt) {
          signed.signedAt = new Date().toISOString();
        }
        await db.collection('signedContracts').doc(signed.id).set(signed);
        result.signedContracts++;
        console.log(`✅ 서명 계약서 마이그레이션: ${signed.id}`);
      } catch (error) {
        console.error(`❌ 서명 계약서 마이그레이션 실패: ${signed.id}`, error);
        result.errors.push({ type: 'signedContract', id: signed.id, error: error.message });
      }
    }
    
    console.log('\n✅ 마이그레이션 완료!');
    console.log(`  • 계약서: ${result.contracts}개`);
    console.log(`  • 매장: ${result.stores}개`);
    console.log(`  • 공지사항: ${result.notices}개`);
    console.log(`  • 서명 계약서: ${result.signedContracts}개`);
    console.log(`  • 오류: ${result.errors.length}건`);
    
  } catch (error) {
    console.error('❌ 마이그레이션 실패:', error);
    result.errors.push({ error: error.message });
  }
  
  return result;
}

/**
 * Firestore 데이터를 localStorage로 백업 (옵션)
 * @returns {Promise<Object>} 백업 결과
 */
async function backupFirestoreToLocalStorage() {
  console.log('💾 Firestore → localStorage 백업 시작...');
  
  const result = {
    contracts: 0,
    stores: 0,
    notices: 0,
    signedContracts: 0
  };
  
  try {
    // 계약서 백업
    const contractsSnapshot = await db.collection('contracts').get();
    contractsSnapshot.forEach(doc => {
      localStorage.setItem(`contract_${doc.id}`, JSON.stringify(doc.data()));
      result.contracts++;
    });
    
    // 매장 백업
    const storesSnapshot = await db.collection('stores').get();
    const stores = [];
    storesSnapshot.forEach(doc => {
      stores.push(doc.data());
      result.stores++;
    });
    localStorage.setItem('stores', JSON.stringify(stores));
    
    // 공지사항 백업
    const noticesSnapshot = await db.collection('notices').get();
    const notices = [];
    noticesSnapshot.forEach(doc => {
      notices.push(doc.data());
      result.notices++;
    });
    localStorage.setItem('notices', JSON.stringify(notices));
    
    // 서명 계약서 백업
    const signedSnapshot = await db.collection('signedContracts').get();
    const signedContracts = [];
    signedSnapshot.forEach(doc => {
      signedContracts.push(doc.data());
      result.signedContracts++;
    });
    localStorage.setItem('signedContracts', JSON.stringify(signedContracts));
    
    console.log('✅ 백업 완료!');
    console.log(`  • 계약서: ${result.contracts}개`);
    console.log(`  • 매장: ${result.stores}개`);
    console.log(`  • 공지사항: ${result.notices}개`);
    console.log(`  • 서명 계약서: ${result.signedContracts}개`);
    
  } catch (error) {
    console.error('❌ 백업 실패:', error);
  }
  
  return result;
}

// ===== 페이지 로드 시 자동 실행 =====

/**
 * 초기화 함수 (페이지 로드 시 자동 호출)
 */
async function initializeDataManagement() {
  console.log('🚀 데이터 관리 시스템 초기화...');
  
  // 마지막 정리 시간 확인
  const lastCleanup = localStorage.getItem('lastAutoCleanup');
  const now = new Date();
  
  if (!lastCleanup) {
    // 처음 실행 - 마이그레이션 체크
    const hasLocalData = localStorage.getItem('contract_C1') || localStorage.getItem('stores');
    if (hasLocalData) {
      console.log('💡 localStorage 데이터 발견! 마이그레이션을 권장합니다.');
      console.log('   관리자가 수동으로 마이그레이션 버튼을 클릭해주세요.');
    }
  } else {
    // 마지막 정리로부터 24시간 경과 시 자동 정리
    const lastCleanupDate = new Date(lastCleanup);
    const hoursSinceLastCleanup = (now - lastCleanupDate) / (1000 * 60 * 60);
    
    if (hoursSinceLastCleanup >= 24) {
      console.log('⏰ 24시간 경과 - 자동 정리 실행...');
      await autoCleanupData(false);
      localStorage.setItem('lastAutoCleanup', now.toISOString());
    } else {
      console.log(`✅ 자동 정리 예정: ${(24 - hoursSinceLastCleanup).toFixed(1)}시간 후`);
    }
  }
}

// 전역 함수로 노출
window.autoCleanupData = autoCleanupData;
window.migrateLocalStorageToFirestore = migrateLocalStorageToFirestore;
window.backupFirestoreToLocalStorage = backupFirestoreToLocalStorage;
window.estimateFirestoreSize = estimateFirestoreSize;
window.initializeDataManagement = initializeDataManagement;
