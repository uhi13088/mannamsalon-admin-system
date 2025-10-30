// ===================================================================
// 맛남살롱 직원용 시스템
// 작성자: Employee Portal
// 기능: 출퇴근, 급여조회, 계약서 확인, 공지사항
// ===================================================================

// ===================================================================
// 전역 변수
// ===================================================================

let currentUser = null; // 현재 로그인한 직원 정보

// ===================================================================
// 더미 직원 데이터
// ===================================================================

const DUMMY_EMPLOYEES = {
  '김민수': { id: 1, name: '김민수', store: '부천시청점', position: '매니저', hourlyWage: 15000 },
  '이지은': { id: 2, name: '이지은', store: '상동점', position: '바리스타', hourlyWage: 10500 },
  '박서준': { id: 3, name: '박서준', store: '부천역사점', position: '바리스타', hourlyWage: 10000 },
  '최영희': { id: 4, name: '최영희', store: '부천시청점', position: '바리스타', hourlyWage: 10000 },
  '정수민': { id: 5, name: '정수민', store: '상동점', position: '바리스타', hourlyWage: 10500 },
  '강호동': { id: 6, name: '강호동', store: '부천역사점', position: '바리스타', hourlyWage: 10000 }
};

// ===================================================================
// 초기화 및 페이지 로드
// ===================================================================

document.addEventListener('DOMContentLoaded', function() {
  debugLog('직원용 페이지 로드');
  
  // 현재 월 기본값 설정
  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  document.getElementById('filterMonth').value = currentMonth;
  document.getElementById('salaryFilterMonth').value = currentMonth;
  
  // 로그인 상태 확인
  checkLoginStatus();
});

// ===================================================================
// 로그인 / 로그아웃 관리
// ===================================================================

/**
 * 로그인 상태 확인
 * sessionStorage에서 사용자 정보를 읽어서 자동 로그인
 */
function checkLoginStatus() {
  const savedUser = sessionStorage.getItem(CONFIG.STORAGE_KEYS.USER_INFO);
  
  if (savedUser) {
    try {
      currentUser = JSON.parse(savedUser);
      showMainScreen();
    } catch (e) {
      console.error('사용자 정보 파싱 오류:', e);
      showLoginScreen();
    }
  } else {
    showLoginScreen();
  }
}

/**
 * 로그인 처리
 * 더미 데이터에서 직원 이름으로 검색
 */
function handleLogin() {
  const nameInput = document.getElementById('employeeName');
  const name = nameInput.value.trim();
  
  if (!name) {
    alert('⚠️ 이름을 입력해주세요.');
    nameInput.focus();
    return;
  }
  
  // 더미 데이터에서 직원 찾기
  const employee = DUMMY_EMPLOYEES[name];
  
  if (employee) {
    currentUser = employee;
    
    // 세션에 저장
    sessionStorage.setItem(CONFIG.STORAGE_KEYS.USER_INFO, JSON.stringify(currentUser));
    sessionStorage.setItem(CONFIG.STORAGE_KEYS.CURRENT_ROLE, 'employee');
    sessionStorage.setItem(CONFIG.STORAGE_KEYS.LAST_LOGIN, new Date().toISOString());
    
    showMainScreen();
  } else {
    const employeeNames = Object.keys(DUMMY_EMPLOYEES).join('\n• ');
    alert(`❌ 등록되지 않은 직원입니다.\n\n등록된 직원:\n• ${employeeNames}`);
  }
}

/**
 * 로그아웃 처리
 * sessionStorage 초기화 및 로그인 화면으로 이동
 */
function handleLogout() {
  if (confirm('로그아웃 하시겠습니까?')) {
    sessionStorage.clear();
    currentUser = null;
    showLoginScreen();
  }
}

/**
 * 로그인 화면 표시
 */
function showLoginScreen() {
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('mainScreen').classList.add('hidden');
}

/**
 * 메인 화면 표시
 * 사용자 정보를 화면에 표시하고 모든 데이터 로드
 */
function showMainScreen() {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('mainScreen').classList.remove('hidden');
  
  // 사용자 정보 표시
  document.getElementById('displayName').textContent = currentUser.name + '님';
  document.getElementById('displayStore').textContent = currentUser.store || '매장 정보 없음';
  
  // 데이터 로드
  loadAttendance();
  loadContracts();
  updateCurrentStatus();
  loadNotice();
}

// ===================================================================
// 탭 전환
// ===================================================================

/**
 * 탭 전환 (대시보드, 근무내역, 급여, 계약서)
 * @param {string} tabName - 탭 이름 ('dashboard', 'attendance', 'salary', 'contract')
 */
function showTab(tabName) {
  // 모든 탭 비활성화
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // 모든 탭 컨텐츠 숨기기
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  
  // 선택된 탭 활성화
  document.querySelector(`.tab[data-tab="${tabName}"]`).classList.add('active');
  document.getElementById(`tab${capitalize(tabName)}`).classList.add('active');
  
  // 탭별 데이터 로드
  if (tabName === 'attendance') {
    loadAttendance();
  } else if (tabName === 'salary') {
    loadSalary();
  } else if (tabName === 'contract') {
    loadContracts();
  }
}

// ===================================================================
// 출퇴근 관리
// ===================================================================

/**
 * 출근 처리
 */
function showClockIn() {
  if (confirm('지금 출근하시겠습니까?')) {
    recordAttendance('출근');
  }
}

/**
 * 퇴근 처리
 */
function showClockOut() {
  if (confirm('지금 퇴근하시겠습니까?')) {
    recordAttendance('퇴근');
  }
}

/**
 * 출퇴근 기록 저장
 * @param {string} type - '출근' 또는 '퇴근'
 */
function recordAttendance(type) {
  try {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = formatTime(now);
    
    // 로컬 스토리지에서 근무 기록 가져오기
    const attendanceKey = `attendance_${currentUser.name}`;
    const records = JSON.parse(localStorage.getItem(attendanceKey) || '[]');
    
    // 오늘 기록 찾기
    let todayRecord = records.find(r => r.date === dateStr);
    
    if (type === '출근') {
      // 출근 처리
      if (todayRecord && todayRecord.clockIn) {
        alert(`⚠️ 이미 출근 처리되었습니다.\n출근 시간: ${todayRecord.clockIn}`);
        return;
      }
      
      if (!todayRecord) {
        todayRecord = {
          date: dateStr,
          clockIn: timeStr,
          clockOut: null,
          workType: '정규근무',
          status: '정상'
        };
        records.push(todayRecord);
      } else {
        todayRecord.clockIn = timeStr;
      }
      
      alert(`✅ 출근 처리되었습니다!\n\n시간: ${timeStr}\n날짜: ${dateStr}`);
      
    } else if (type === '퇴근') {
      // 퇴근 처리
      if (!todayRecord || !todayRecord.clockIn) {
        alert('⚠️ 출근 기록이 없습니다.\n먼저 출근 처리를 해주세요.');
        return;
      }
      
      if (todayRecord.clockOut) {
        alert(`⚠️ 이미 퇴근 처리되었습니다.\n퇴근 시간: ${todayRecord.clockOut}`);
        return;
      }
      
      todayRecord.clockOut = timeStr;
      
      // 근무 시간 계산
      const workTime = calculateWorkTime(todayRecord.clockIn, timeStr);
      
      alert(`✅ 퇴근 처리되었습니다!\n\n시간: ${timeStr}\n근무 시간: ${workTime}\n\n수고하셨습니다! 😊`);
    }
    
    // 저장
    localStorage.setItem(attendanceKey, JSON.stringify(records));
    
    // 현재 상태 업데이트
    updateCurrentStatus();
    
    // 근무내역 새로고침
    if (document.getElementById('tabAttendance').classList.contains('active')) {
      loadAttendance();
    }
    
  } catch (error) {
    console.error('출퇴근 기록 오류:', error);
    alert('❌ 기록 중 오류가 발생했습니다.');
  }
}

/**
 * 현재 상태 업데이트 (대시보드)
 * 오늘 출퇴근 상태를 표시
 */
function updateCurrentStatus() {
  try {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    
    // 로컬 스토리지에서 오늘 기록 확인
    const attendanceKey = `attendance_${currentUser.name}`;
    const records = JSON.parse(localStorage.getItem(attendanceKey) || '[]');
    const todayRecord = records.find(r => r.date === dateStr);
    
    const statusValueEl = document.getElementById('statusValue');
    const statusTimeEl = document.getElementById('statusTime');
    
    if (todayRecord) {
      if (todayRecord.clockIn && !todayRecord.clockOut) {
        // 근무 중
        statusValueEl.textContent = '🟢 근무 중';
        statusTimeEl.textContent = `출근시간: ${todayRecord.clockIn}`;
      } else if (todayRecord.clockIn && todayRecord.clockOut) {
        // 퇴근 완료
        statusValueEl.textContent = '✅ 퇴근 완료';
        
        const workTime = calculateWorkTime(todayRecord.clockIn, todayRecord.clockOut);
        statusTimeEl.textContent = `퇴근시간: ${todayRecord.clockOut} | 근무: ${workTime}`;
      }
    } else {
      // 출근 전
      statusValueEl.textContent = '⏰ 출근 전';
      statusTimeEl.textContent = '좋은 하루 되세요!';
    }
  } catch (error) {
    console.error('상태 업데이트 오류:', error);
  }
}

// ===================================================================
// 근무내역 조회
// ===================================================================

/**
 * 근무내역 로드 및 표시
 * 선택한 월의 출퇴근 기록을 테이블로 표시
 */
function loadAttendance() {
  debugLog('근무내역 조회');
  
  const filterMonth = document.getElementById('filterMonth').value;
  const tbody = document.getElementById('attendanceTableBody');
  
  if (!filterMonth) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center" style="padding: 40px;">조회할 월을 선택하세요</td></tr>';
    return;
  }
  
  // 로컬 스토리지에서 근무 기록 가져오기
  const attendanceKey = `attendance_${currentUser.name}`;
  const records = JSON.parse(localStorage.getItem(attendanceKey) || '[]');
  
  // 선택한 월의 기록만 필터링
  const filteredRecords = records.filter(r => r.date.startsWith(filterMonth));
  
  if (filteredRecords.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center" style="padding: 40px;">📭 해당 월의 근무 기록이 없습니다.</td></tr>';
    return;
  }
  
  // 날짜 순으로 정렬 (최신순)
  filteredRecords.sort((a, b) => b.date.localeCompare(a.date));
  
  tbody.innerHTML = filteredRecords.map(record => {
    const statusClass = getStatusClass(record.status);
    const workTime = record.clockIn && record.clockOut ? 
      calculateWorkTime(record.clockIn, record.clockOut) : '-';
    
    return `
      <tr>
        <td>${record.date}</td>
        <td>${record.clockIn || '-'}</td>
        <td>${record.clockOut || '-'}</td>
        <td>${workTime}</td>
        <td>${record.workType || '정규근무'}</td>
        <td><span class="badge badge-${statusClass}">${record.status || '정상'}</span></td>
      </tr>
    `;
  }).join('');
}

// ===================================================================
// 급여 조회 및 계산
// ===================================================================

/**
 * 급여 조회 및 계산
 * 선택한 월의 근무 기록을 바탕으로 급여 자동 계산
 */
function loadSalary() {
  debugLog('급여 조회');
  
  const filterMonth = document.getElementById('salaryFilterMonth').value;
  
  if (!filterMonth) {
    document.getElementById('salaryContent').innerHTML = 
      '<div class="alert alert-info">📅 조회할 월을 선택하세요</div>';
    return;
  }
  
  try {
    // 로컬 스토리지에서 근무 기록 가져오기
    const attendanceKey = `attendance_${currentUser.name}`;
    const records = JSON.parse(localStorage.getItem(attendanceKey) || '[]');
    
    // 선택한 월의 완료된 기록만 필터링 (출근+퇴근 모두 있는 경우)
    const filteredRecords = records.filter(r => 
      r.date.startsWith(filterMonth) && r.clockIn && r.clockOut
    );
    
    if (filteredRecords.length === 0) {
      document.getElementById('salaryContent').innerHTML = 
        '<div class="alert alert-info">📭 해당 월의 근무 기록이 없습니다.<br><br>출퇴근 기록이 있어야 급여가 계산됩니다.</div>';
      return;
    }
    
    // 급여 계산
    const salaryData = calculateSalary(filteredRecords, currentUser.hourlyWage);
    
    renderSalaryInfo(salaryData);
    
  } catch (error) {
    console.error('급여 조회 오류:', error);
    document.getElementById('salaryContent').innerHTML = 
      '<div class="alert alert-danger">❌ 데이터를 불러오는 중 오류가 발생했습니다</div>';
  }
}

/**
 * 급여 계산 로직
 * @param {Array} records - 근무 기록 배열
 * @param {number} hourlyWage - 시급
 * @returns {Object} 급여 상세 정보
 */
function calculateSalary(records, hourlyWage = 10000) {
  // 총 근무 시간 계산 (분 단위)
  let totalMinutes = 0;
  records.forEach(record => {
    const minutes = getWorkMinutes(record.clockIn, record.clockOut);
    totalMinutes += minutes;
  });
  
  const totalHours = Math.floor(totalMinutes / 60);
  
  // 급여 항목 계산
  const baseSalary = totalHours * hourlyWage;
  const weeklyHolidayPay = Math.floor(baseSalary * 0.2); // 주휴수당 20%
  const overtime = 0; // 추가 근무수당 (현재 미구현)
  const insurance = Math.floor((baseSalary + weeklyHolidayPay) * 0.089); // 4대보험 8.9%
  const tax = Math.floor((baseSalary + weeklyHolidayPay) * 0.033); // 소득세 3.3%
  const deduction = insurance + tax;
  const netSalary = baseSalary + weeklyHolidayPay + overtime - deduction;
  
  return {
    baseSalary,
    overtime,
    weeklyHolidayPay,
    deduction,
    netSalary,
    totalHours,
    hourlyWage,
    insurance,
    tax,
    workDays: records.length
  };
}

/**
 * 급여 정보 렌더링
 * @param {Object} data - 급여 데이터
 */
function renderSalaryInfo(data) {
  const html = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--spacing-lg); margin-bottom: var(--spacing-lg);">
      <div class="card" style="text-align: center;">
        <div style="color: var(--text-secondary); font-size: 14px; margin-bottom: var(--spacing-xs);">기본급</div>
        <div style="font-size: 28px; font-weight: 700; color: var(--text-primary);">${formatCurrency(data.baseSalary)}</div>
      </div>
      
      <div class="card" style="text-align: center;">
        <div style="color: var(--text-secondary); font-size: 14px; margin-bottom: var(--spacing-xs);">추가수당</div>
        <div style="font-size: 28px; font-weight: 700; color: var(--success-color);">${formatCurrency(data.overtime || 0)}</div>
      </div>
      
      <div class="card" style="text-align: center;">
        <div style="color: var(--text-secondary); font-size: 14px; margin-bottom: var(--spacing-xs);">공제액</div>
        <div style="font-size: 28px; font-weight: 700; color: var(--danger-color);">-${formatCurrency(data.deduction || 0)}</div>
      </div>
      
      <div class="card" style="text-align: center; background: var(--primary-color);">
        <div style="color: rgba(255,255,255,0.9); font-size: 14px; margin-bottom: var(--spacing-xs);">실수령액</div>
        <div style="font-size: 28px; font-weight: 700; color: white;">${formatCurrency(data.netSalary)}</div>
      </div>
    </div>
    
    <div class="card">
      <h4 style="margin-bottom: var(--spacing-md);">📋 상세 내역</h4>
      <table style="margin-bottom: 0;">
        <tr>
          <td>근무 일수</td>
          <td style="text-align: right; font-weight: 600;">${data.workDays || 0}일</td>
        </tr>
        <tr>
          <td>총 근무시간</td>
          <td style="text-align: right; font-weight: 600;">${data.totalHours || 0}시간</td>
        </tr>
        <tr>
          <td>시급</td>
          <td style="text-align: right; font-weight: 600;">${formatCurrency(data.hourlyWage || 0)}</td>
        </tr>
        <tr style="background: #f0f9ff;">
          <td><strong>기본급</strong></td>
          <td style="text-align: right; font-weight: 700; color: var(--primary-color);">${formatCurrency(data.baseSalary)}</td>
        </tr>
        ${data.weeklyHolidayPay && data.weeklyHolidayPay > 0 ? `
        <tr>
          <td>주휴수당</td>
          <td style="text-align: right; font-weight: 600; color: var(--success-color);">+${formatCurrency(data.weeklyHolidayPay)}</td>
        </tr>
        ` : ''}
        ${data.overtime && data.overtime > 0 ? `
        <tr>
          <td>추가 근무수당</td>
          <td style="text-align: right; font-weight: 600; color: var(--success-color);">+${formatCurrency(data.overtime)}</td>
        </tr>
        ` : ''}
        ${data.insurance && data.insurance > 0 ? `
        <tr style="border-top: 2px solid var(--border-color);">
          <td>4대보험</td>
          <td style="text-align: right; font-weight: 600; color: var(--danger-color);">-${formatCurrency(data.insurance)}</td>
        </tr>
        ` : ''}
        ${data.tax && data.tax > 0 ? `
        <tr>
          <td>소득세 (3.3%)</td>
          <td style="text-align: right; font-weight: 600; color: var(--danger-color);">-${formatCurrency(data.tax)}</td>
        </tr>
        ` : ''}
        <tr style="background: var(--bg-light); border-top: 2px solid var(--primary-color);">
          <td><strong>실수령액</strong></td>
          <td style="text-align: right; font-weight: 700; font-size: 18px; color: var(--primary-color);">${formatCurrency(data.netSalary)}</td>
        </tr>
      </table>
    </div>
  `;
  
  document.getElementById('salaryContent').innerHTML = html;
}

// ===================================================================
// 계약서 조회
// ===================================================================

/**
 * 계약서 목록 로드
 * 현재 사용자의 계약서만 필터링하여 표시
 */
function loadContracts() {
  debugLog('계약서 조회');
  
  try {
    // localStorage에서 현재 사용자의 모든 계약서 찾기
    const contracts = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('contract_C')) {
        const contractData = JSON.parse(localStorage.getItem(key));
        if (contractData.employeeName === currentUser.name) {
          const contractId = key.replace('contract_', '');
          
          // 서명 상태 확인
          const signedContracts = JSON.parse(localStorage.getItem('signedContracts') || '[]');
          const signedContract = signedContracts.find(sc => sc.id === contractId);
          const isSigned = !!signedContract;
          
          contracts.push({
            contractId: contractId,
            ...contractData,
            status: isSigned ? '서명완료' : '서명대기',
            signedAt: signedContract ? signedContract.signedAt : null
          });
        }
      }
    }
    
    if (contracts.length === 0) {
      document.getElementById('contractContent').innerHTML = 
        '<div class="alert alert-info">📄 아직 작성된 계약서가 없습니다.<br><br>관리자가 계약서를 작성하면 여기에서 확인하고 서명할 수 있습니다.</div>';
      return;
    }
    
    // 최신순 정렬
    contracts.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return dateB - dateA;
    });
    
    renderContracts(contracts);
    
  } catch (error) {
    console.error('계약서 조회 오류:', error);
    document.getElementById('contractContent').innerHTML = 
      '<div class="alert alert-danger">❌ 데이터를 불러오는 중 오류가 발생했습니다</div>';
  }
}

/**
 * 계약서 목록 렌더링
 * @param {Array} contracts - 계약서 배열
 */
function renderContracts(contracts) {
  // 상단 안내 메시지
  const summaryHtml = `
    <div style="margin-bottom: var(--spacing-lg); padding: var(--spacing-md); background: var(--bg-light); border-radius: var(--border-radius); border-left: 4px solid var(--primary-color);">
      <p style="margin: 0; font-size: 14px;">
        💡 총 <strong>${contracts.length}개</strong>의 계약서가 있습니다. 최신 계약서부터 표시됩니다.
      </p>
    </div>
  `;
  
  const contractsHtml = contracts.map((contract, index) => {
    const status = contract.status || '서명대기';
    const statusBadge = status === '서명완료' ? 
      '<span class="badge badge-success">✅ 서명완료</span>' : 
      '<span class="badge badge-warning">⏰ 서명대기</span>';
    
    const isLatest = index === 0 ? '<span class="badge badge-primary" style="margin-left: 8px;">최신</span>' : '';
    
    // 날짜 포맷팅
    const createdDate = contract.createdAt ? 
      new Date(contract.createdAt).toLocaleDateString('ko-KR') : '-';
    const signedDate = contract.signedAt ? 
      new Date(contract.signedAt).toLocaleDateString('ko-KR') : null;
    
    return `
      <div class="card">
        <div class="card-header">
          <div>
            <h4 style="margin-bottom: 4px;">📋 ${contract.contractType || '근로계약서'}${isLatest}</h4>
            <p style="font-size: 13px; color: var(--text-secondary); margin: 0;">근무지: ${contract.workStore || '-'}</p>
          </div>
          ${statusBadge}
        </div>
        <div class="card-body">
          <table style="width: 100%; margin-bottom: var(--spacing-md);">
            <tr>
              <td style="padding: 8px 0; color: var(--text-secondary); width: 120px;">계약 기간</td>
              <td style="padding: 8px 0; font-weight: 600;">${contract.startDate} ~ ${contract.endDate || '기간의 정함 없음'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: var(--text-secondary);">직책/직무</td>
              <td style="padding: 8px 0; font-weight: 600;">${contract.position || '-'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: var(--text-secondary);">급여 조건</td>
              <td style="padding: 8px 0; font-weight: 600;">${contract.wageType || '-'} ${contract.wageAmount ? Number(contract.wageAmount).toLocaleString() + '원' : ''}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: var(--text-secondary);">작성일</td>
              <td style="padding: 8px 0;">${createdDate}</td>
            </tr>
            ${signedDate ? `
            <tr>
              <td style="padding: 8px 0; color: var(--text-secondary);">서명일</td>
              <td style="padding: 8px 0; color: var(--success-color); font-weight: 600;">${signedDate}</td>
            </tr>
            ` : ''}
          </table>
          
          <div style="display: flex; gap: var(--spacing-sm);">
            ${status === '서명완료' ? 
              `<button class="btn btn-secondary" onclick="viewEmployeeContract('${contract.contractId}')">📄 계약서 원본 보기</button>` :
              `<button class="btn btn-primary" onclick="signContract('${contract.contractId}')">✍️ 지금 서명하기</button>`
            }
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  document.getElementById('contractContent').innerHTML = summaryHtml + contractsHtml;
}

/**
 * 계약서 원본 보기 (서명 페이지로 이동 - 읽기 전용)
 * @param {string} contractId - 계약서 ID
 */
function viewEmployeeContract(contractId) {
  // 서명 완료된 계약서를 보기 위해 서명 페이지로 이동
  if (confirm('📄 계약서 원본을 확인하시겠습니까?\n\n서명 페이지에서 확인하실 수 있습니다.')) {
    window.location.href = `contract-sign.html?id=${contractId}`;
  }
}

/**
 * 계약서 서명
 * @param {string} contractId - 계약서 ID
 */
function signContract(contractId) {
  if (confirm('계약서 서명 페이지로 이동하시겠습니까?')) {
    window.location.href = `contract-sign.html?id=${contractId}`;
  }
}

// ===================================================================
// 공지사항 조회
// ===================================================================

/**
 * 공지사항 불러오기
 * localStorage에서 companyNotice 읽어서 표시
 */
function loadNotice() {
  try {
    const notice = JSON.parse(localStorage.getItem('companyNotice') || 'null');
    
    // 공지사항 섹션 항상 표시
    document.getElementById('noticeSection').style.display = 'block';
    
    if (notice && notice.content) {
      // 내용 표시
      document.getElementById('noticeContent').textContent = notice.content;
      document.getElementById('noticeContent').style.color = 'var(--text-primary)';
      document.getElementById('noticeContent').style.fontStyle = 'normal';
      
      // 날짜 표시
      if (notice.updatedAt) {
        const date = new Date(notice.updatedAt);
        document.getElementById('noticeDate').textContent = 
          `📅 ${date.toLocaleDateString('ko-KR')} ${date.toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit'})}`;
      }
    } else {
      // 공지사항이 없으면 안내 메시지
      document.getElementById('noticeContent').textContent = '현재 등록된 공지사항이 없습니다.';
      document.getElementById('noticeContent').style.color = 'var(--text-secondary)';
      document.getElementById('noticeContent').style.fontStyle = 'italic';
      document.getElementById('noticeDate').textContent = '';
    }
  } catch (error) {
    console.error('공지사항 불러오기 오류:', error);
    // 오류 발생 시에도 표시
    document.getElementById('noticeSection').style.display = 'block';
    document.getElementById('noticeContent').textContent = '공지사항을 불러오는 중 오류가 발생했습니다.';
    document.getElementById('noticeContent').style.color = 'var(--danger-color)';
    document.getElementById('noticeDate').textContent = '';
  }
}

// ===================================================================
// 유틸리티 함수
// ===================================================================

/**
 * 문자열 첫 글자 대문자 변환
 * @param {string} str - 변환할 문자열
 * @returns {string} 변환된 문자열
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * 시간 포맷팅 (HH:MM)
 * @param {Date} date - Date 객체
 * @returns {string} HH:MM 형식 문자열
 */
function formatTime(date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

/**
 * 근무 시간 계산 (HH:MM 형식으로 반환)
 * @param {string} clockIn - 출근 시간 (HH:MM)
 * @param {string} clockOut - 퇴근 시간 (HH:MM)
 * @returns {string} "X시간 Y분" 형식
 */
function calculateWorkTime(clockIn, clockOut) {
  const workMinutes = getWorkMinutes(clockIn, clockOut);
  const workHours = Math.floor(workMinutes / 60);
  const workMins = workMinutes % 60;
  return `${workHours}시간 ${workMins}분`;
}

/**
 * 근무 시간 계산 (분 단위 반환)
 * @param {string} clockIn - 출근 시간 (HH:MM)
 * @param {string} clockOut - 퇴근 시간 (HH:MM)
 * @returns {number} 근무 시간 (분)
 */
function getWorkMinutes(clockIn, clockOut) {
  const clockInTime = clockIn.split(':');
  const clockOutTime = clockOut.split(':');
  const startMinutes = parseInt(clockInTime[0]) * 60 + parseInt(clockInTime[1]);
  const endMinutes = parseInt(clockOutTime[0]) * 60 + parseInt(clockOutTime[1]);
  return endMinutes - startMinutes;
}

/**
 * 상태에 따른 CSS 클래스 반환
 * @param {string} status - 출근 상태
 * @returns {string} badge CSS 클래스
 */
function getStatusClass(status) {
  const statusMap = {
    '정상': 'success',
    '지각': 'warning',
    '조퇴': 'warning',
    '결근': 'danger'
  };
  return statusMap[status] || 'gray';
}

/**
 * 근무 형태 이름 반환 (CONFIG 사용)
 * @param {string} type - 근무 형태 ID
 * @returns {string} 근무 형태 이름
 */
function getWorkTypeName(type) {
  const workType = CONFIG.WORK_TYPES.find(t => t.id === type);
  return workType ? workType.name : type || '-';
}

/**
 * 상태 배지 HTML 반환 (CONFIG 사용)
 * @param {string} status - 출근 상태 ID
 * @returns {string} 배지 HTML
 */
function getStatusBadge(status) {
  const statusConfig = CONFIG.ATTENDANCE_STATUS.find(s => s.id === status);
  
  if (!statusConfig) {
    return '<span class="badge badge-gray">-</span>';
  }
  
  const badgeClassMap = {
    'normal': 'badge-success',
    'late': 'badge-warning',
    'early': 'badge-warning',
    'absent': 'badge-danger'
  };
  
  const badgeClass = badgeClassMap[status] || 'badge-gray';
  
  return `<span class="badge ${badgeClass}">${statusConfig.name}</span>`;
}

// ===================================================================
// 서류 관리 (통장사본, 보건증)
// ===================================================================

/**
 * 페이지 로드 시 서류 정보 불러오기
 */
document.addEventListener('DOMContentLoaded', function() {
  // 드롭다운 초기화
  initializeDateDropdowns();
  
  // 계약서 탭 활성화 시 서류 불러오기
  const contractTab = document.querySelector('.tab[data-tab="contract"]');
  if (contractTab) {
    contractTab.addEventListener('click', loadEmployeeDocuments);
  }
});

/**
 * 년/월/일 드롭다운 초기화
 */
function initializeDateDropdowns() {
  // 년도 드롭다운 (현재년도 ~ 현재+5년)
  const yearSelect = document.getElementById('healthCertYear');
  if (yearSelect) {
    const currentYear = new Date().getFullYear();
    for (let i = 0; i <= 5; i++) {
      const year = currentYear + i;
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year + '년';
      yearSelect.appendChild(option);
    }
  }
  
  // 일 드롭다운 (1일 ~ 31일)
  const daySelect = document.getElementById('healthCertDay');
  if (daySelect) {
    for (let i = 1; i <= 31; i++) {
      const option = document.createElement('option');
      option.value = String(i).padStart(2, '0');
      option.textContent = i + '일';
      daySelect.appendChild(option);
    }
  }
}

/**
 * 직원 서류 정보 불러오기
 */
function loadEmployeeDocuments() {
  if (!currentUser) return;
  
  const docKey = `employee_docs_${currentUser.name}_${currentUser.id}`;
  const savedDocs = localStorage.getItem(docKey);
  
  if (savedDocs) {
    try {
      const docs = JSON.parse(savedDocs);
      
      // 통장사본 정보 로드
      if (docs.bankAccount) {
        document.getElementById('bankName').value = docs.bankAccount.bankName || '';
        document.getElementById('accountNumber').value = docs.bankAccount.accountNumber || '';
        document.getElementById('accountHolder').value = docs.bankAccount.accountHolder || '';
      }
      
      // 보건증 정보 로드
      if (docs.healthCert) {
        // 이미지 미리보기
        if (docs.healthCert.imageData) {
          document.getElementById('healthCertImg').src = docs.healthCert.imageData;
          document.getElementById('healthCertPreview').style.display = 'block';
        }
        
        // 유효기간
        if (docs.healthCert.expiryDate) {
          const [year, month, day] = docs.healthCert.expiryDate.split('-');
          document.getElementById('healthCertYear').value = year;
          document.getElementById('healthCertMonth').value = month;
          document.getElementById('healthCertDay').value = day;
        }
      }
    } catch (e) {
      console.error('서류 정보 불러오기 오류:', e);
    }
  }
}

/**
 * 통장사본 정보 저장
 */
function saveBankAccount() {
  if (!currentUser) {
    alert('⚠️ 로그인 정보가 없습니다.');
    return;
  }
  
  const bankName = document.getElementById('bankName').value.trim();
  const accountNumber = document.getElementById('accountNumber').value.trim();
  const accountHolder = document.getElementById('accountHolder').value.trim();
  
  if (!bankName || !accountNumber || !accountHolder) {
    alert('⚠️ 모든 항목을 입력해주세요.');
    return;
  }
  
  // 기존 서류 정보 가져오기
  const docKey = `employee_docs_${currentUser.name}_${currentUser.id}`;
  const savedDocs = JSON.parse(localStorage.getItem(docKey) || '{}');
  
  // 통장사본 정보 업데이트
  savedDocs.bankAccount = {
    bankName: bankName,
    accountNumber: accountNumber,
    accountHolder: accountHolder,
    updatedAt: new Date().toISOString()
  };
  
  // 저장
  localStorage.setItem(docKey, JSON.stringify(savedDocs));
  
  // 저장 완료 메시지
  const statusEl = document.getElementById('bankSaveStatus');
  statusEl.textContent = '✅ 저장되었습니다!';
  statusEl.style.display = 'inline-flex';
  
  setTimeout(() => {
    statusEl.style.display = 'none';
  }, 3000);
}

/**
 * 보건증 이미지 미리보기 및 자동 압축
 */
function previewHealthCert(event) {
  const file = event.target.files[0];
  
  if (!file) return;
  
  // 이미지 파일 검증
  if (!file.type.startsWith('image/')) {
    alert('⚠️ 이미지 파일만 업로드 가능합니다.');
    event.target.value = '';
    return;
  }
  
  // 원본 파일 크기 표시
  const originalSize = (file.size / 1024).toFixed(0);
  console.log(`원본 파일 크기: ${originalSize}KB`);
  
  // 파일 읽기 및 압축
  const reader = new FileReader();
  
  reader.onload = function(e) {
    const img = new Image();
    
    img.onload = function() {
      // Canvas를 사용해 이미지 압축
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // 최대 크기 설정 (폭 기준 1200px)
      const maxWidth = 1200;
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // 이미지 그리기
      ctx.drawImage(img, 0, 0, width, height);
      
      // Base64로 변환 (품질 0.7 = 70%)
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
      
      // 압축된 크기 계산
      const compressedSize = Math.round((compressedDataUrl.length * 3) / 4 / 1024);
      
      console.log(`압축 후 크기: ${compressedSize}KB`);
      
      // 미리보기 표시
      const previewImg = document.getElementById('healthCertImg');
      previewImg.src = compressedDataUrl;
      document.getElementById('healthCertPreview').style.display = 'block';
      
      // 크기 정보 표시
      const sizeInfo = document.getElementById('imageSizeInfo');
      sizeInfo.textContent = `원본: ${originalSize}KB → 압축: ${compressedSize}KB`;
      
      // 압축된 데이터를 임시 저장 (저장 버튼 클릭 시 사용)
      window.compressedHealthCertData = compressedDataUrl;
    };
    
    img.onerror = function() {
      alert('❌ 이미지를 불러오는 중 오류가 발생했습니다.');
      event.target.value = '';
    };
    
    img.src = e.target.result;
  };
  
  reader.onerror = function() {
    alert('❌ 파일을 읽는 중 오류가 발생했습니다.');
  };
  
  reader.readAsDataURL(file);
}

/**
 * 보건증 정보 저장
 */
function saveHealthCert() {
  if (!currentUser) {
    alert('⚠️ 로그인 정보가 없습니다.');
    return;
  }
  
  const fileInput = document.getElementById('healthCertImage');
  const year = document.getElementById('healthCertYear').value;
  const month = document.getElementById('healthCertMonth').value;
  const day = document.getElementById('healthCertDay').value;
  
  // 유효기간 검증
  if (!year || !month || !day) {
    alert('⚠️ 유효기간을 모두 선택해주세요.');
    return;
  }
  
  // 이미지 필수 검증
  if (!fileInput.files[0] && !document.getElementById('healthCertImg').src) {
    alert('⚠️ 보건증 이미지를 업로드해주세요.');
    return;
  }
  
  const expiryDate = `${year}-${month}-${day}`;
  
  // 기존 서류 정보 가져오기
  const docKey = `employee_docs_${currentUser.name}_${currentUser.id}`;
  const savedDocs = JSON.parse(localStorage.getItem(docKey) || '{}');
  
  // 이미지가 새로 업로드된 경우 (압축된 데이터 사용)
  if (window.compressedHealthCertData) {
    // 보건증 정보 업데이트 (압축된 이미지 사용)
    savedDocs.healthCert = {
      imageData: window.compressedHealthCertData,
      expiryDate: expiryDate,
      updatedAt: new Date().toISOString()
    };
    
    // 저장
    localStorage.setItem(docKey, JSON.stringify(savedDocs));
    
    // 임시 데이터 삭제
    delete window.compressedHealthCertData;
    
    // 저장 완료 메시지
    showHealthSaveSuccess();
  } else {
    // 이미지는 그대로 유지하고 유효기간만 업데이트
    if (!savedDocs.healthCert) {
      savedDocs.healthCert = {};
    }
    savedDocs.healthCert.expiryDate = expiryDate;
    savedDocs.healthCert.updatedAt = new Date().toISOString();
    
    // 저장
    localStorage.setItem(docKey, JSON.stringify(savedDocs));
    
    // 저장 완료 메시지
    showHealthSaveSuccess();
  }
}

/**
 * 보건증 저장 완료 메시지 표시
 */
function showHealthSaveSuccess() {
  const statusEl = document.getElementById('healthSaveStatus');
  statusEl.textContent = '✅ 저장되었습니다!';
  statusEl.style.display = 'inline-flex';
  
  setTimeout(() => {
    statusEl.style.display = 'none';
  }, 3000);
}
