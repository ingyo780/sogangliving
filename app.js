/* ====================================================
   S+ — 서강대 자취 플랫폼 앱 로직
   해시 기반 SPA 라우터 + 상태 관리 + 렌더링
==================================================== */

/* ===== 카카오맵 API 설정 =====
   https://developers.kakao.com 에서 앱 등록 후 키 입력
   입력 시 map-placeholder 대신 실제 지도가 표시됨       */
const KAKAO_MAP_KEY = '';

/* ====================================================
   앱 전역 상태
==================================================== */
const state = {
  user:       null,          // 로그인한 사용자 { email, nickname }
  mapMode:    'properties',  // 지도 모드: 'properties' | 'roomies'
  boardCat:   'all',         // 게시판 필터 카테고리
  verifyCode: null,          // 이메일 인증 코드 (서버 미연동 시 클라이언트 보관)
};

/* ====================================================
   샘플 데이터 — 인수인계 매물
==================================================== */
const TAKEON_DATA = [
  {
    id:1, area:'신촌', type:'원룸',
    deposit:500, rent:45,
    date:'2026-06-15',
    desc:'신촌역 도보 5분, 풀옵션, 남향, 조용한 골목. 가구 일부 인계 가능합니다.',
    emoji:'🏠',
    user:{ name:'익명의 고양이', icon:'🐱' },
    tags:['풀옵션','남향','역세권'],
    pos:{ left:'28%', top:'38%' },
  },
  {
    id:2, area:'이대', type:'투룸',
    deposit:1000, rent:75,
    date:'2026-07-01',
    desc:'이대역 3분, 투룸 구조, 욕실 2개. 에어컨 포함 가전 전체 인계합니다.',
    emoji:'🏡',
    user:{ name:'익명의 토끼', icon:'🐰' },
    tags:['투룸','욕실2개','가전포함'],
    pos:{ left:'54%', top:'32%' },
  },
  {
    id:3, area:'홍대', type:'오피스텔',
    deposit:300, rent:60,
    date:'2026-06-30',
    desc:'홍대입구역 바로 앞, 신축, 관리비 5만원, 헬스장 포함.',
    emoji:'🏢',
    user:{ name:'익명의 여우', icon:'🦊' },
    tags:['신축','헬스장','역세권'],
    pos:{ left:'22%', top:'58%' },
  },
  {
    id:4, area:'마포', type:'원룸',
    deposit:200, rent:40,
    date:'2026-07-15',
    desc:'서강대 정문 도보 3분, 조용한 주택가, 장기 거주자 우대.',
    emoji:'🏘️',
    user:{ name:'익명의 다람쥐', icon:'🐿️' },
    tags:['서강대근처','조용함','장기우대'],
    pos:{ left:'62%', top:'54%' },
  },
];

/* ====================================================
   샘플 데이터 — 룸메이트 구인
==================================================== */
const ROOMIES_DATA = [
  {
    id:1, area:'마포', location:'마포구 노고산동 투룸',
    name:'고래 박하', budget:80, gender:'female', style:'quiet',
    tags:['비흡연','조용함','집순이'],
    desc:'서강대 22학번입니다. 조용하고 깔끔하게 지내실 분 구해요.',
    icon:'🐋', sleep:'normal', clean:'very', noise:'sensitive',
    smoking:'no', 
    pos:{ left:'60%', top:'52%' },
  },
  {
    id:2, area:'신촌', location:'신촌 원룸 쉐어',
    name:'초록 사과', budget:50, gender:'male', style:'homebody',
    tags:['비흡연','홈바디','취준생'],
    desc:'취준 중이라 집에 자주 있어요. 서로 존중하며 지내요.',
    icon:'🍏', sleep:'late', clean:'normal', noise:'normal',
    smoking:'no', 
    pos:{ left:'26%', top:'36%' },
  },
  {
    id:3, area:'이대', location:'이대역 투룸',
    name:'라벤더', budget:70, gender:'female', style:'active',
    tags:['여성전용','비흡연','대학원생'],
    desc:'대학원생이라 평일엔 늦게 들어와요. 주말엔 활발히 지내요.',
    icon:'💜', sleep:'late', clean:'normal', noise:'normal',
    smoking:'no', 
    pos:{ left:'52%', top:'30%' },
  },
  {
    id:4, area:'마포', location:'마포구 아현동 원룸 쉐어',
    name:'파란 하늘', budget:45, gender:'male', style:'quiet',
    tags:['비흡연','밤형','조용함'],
    desc:'밤에 주로 게임하지만 이어폰 씁니다. 낮에는 조용해요.',
    icon:'🌤️', sleep:'late', clean:'normal', noise:'tolerant',
    smoking:'yes', 
    pos:{ left:'65%', top:'58%' },
  },
];

/* ====================================================
   샘플 데이터 — 익명 게시글
==================================================== */
const POSTS_DATA = [
  {
    id:1, cat:'review',
    title:'신촌 현대 오피스텔 6개월 살아본 후기',
    content:'관리비가 생각보다 많이 나왔어요. 여름엔 에어컨 때문에 20만원 가까이… 건물 자체는 깨끗하고 보안이 잘 되어있어요.',
    date:'2026-05-24', views:143, comments:5,
  },
  {
    id:2, cat:'question',
    title:'이대역 근처 원룸 추천해주세요 (여성)',
    content:'이대 근처에서 자취 시작하려는데 어떤 부분을 제일 신경써야 하나요? 보증금 500에 월세 50 정도 예산입니다.',
    date:'2026-05-23', views:87, comments:12,
  },
  {
    id:3, cat:'tip',
    title:'자취방 계약 전 반드시 확인할 체크리스트',
    content:'1) 수압 확인 2) 곰팡이 확인 (벽 모서리·화장실) 3) 인터넷 속도 4) 관리비 항목 5) 임대차 계약서 특약 사항',
    date:'2026-05-22', views:298, comments:8,
  },
  {
    id:4, cat:'review',
    title:'마포구 자취 1년 총평',
    content:'서강대 근처는 생각보다 조용하고 살기 좋아요. 홍대랑 가까워서 편의시설도 많고. 단점은 버스 노선이 좀 부족한 것?',
    date:'2026-05-21', views:211, comments:15,
  },
  {
    id:5, cat:'tip',
    title:'관리비 폭탄 주의! 계약 전 반드시 물어볼 것',
    content:'관리비에 포함되는 항목이 건물마다 다릅니다. 수도·전기·가스 별도인지, 인터넷 포함인지 꼭 확인하세요!',
    date:'2026-05-20', views:445, comments:23,
  },
];

/* ====================================================
   유틸 함수
==================================================== */

function fmtDate(str) {
  const d = new Date(str);
  return `${d.getMonth()+1}/${d.getDate()}`;
}

function isLoggedIn() { return state.user !== null; }

function requireLogin(fn) {
  if (!isLoggedIn()) { openModal('login'); return; }
  fn();
}

function renderTags(tags) {
  return tags.map(t => `<span class="tag">${t}</span>`).join('');
}

/* ====================================================
   해시 기반 페이지 라우터
==================================================== */
function navigateTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(`page-${page}`);
  if (target) target.classList.add('active');

  document.querySelectorAll('.nav-link[data-page]').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });

  if (page === 'map') { renderMapList(); renderMapMarkers(); }
}

function handleRoute() {
  const page = location.hash.replace('#', '') || 'home';
  navigateTo(page);
}

/* ====================================================
   모달 / 사이드바 열고 닫기
==================================================== */
function openModal(name)  { document.getElementById(`modal-${name}`).classList.remove('hidden'); }
function closeModal(name) { document.getElementById(`modal-${name}`).classList.add('hidden'); }
function switchModal(from, to) { closeModal(from); openModal(to); }

function openSidebar()  { document.getElementById('sidebar-mypage').classList.remove('hidden'); }
function closeSidebar() { document.getElementById('sidebar-mypage').classList.add('hidden'); }

/* ====================================================
   인증 처리
==================================================== */

function isSogangEmail(email) {
  return email.trim().endsWith('@sogang.ac.kr');
}

function handleLogin(e) {
  e.preventDefault();
  const email    = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const errEl    = document.getElementById('loginError');

  if (!isSogangEmail(email)) {
    showFormError(errEl, '서강대학교 이메일(@sogang.ac.kr)만 사용 가능합니다.');
    return;
  }
  if (password.length < 6) {
    showFormError(errEl, '비밀번호를 확인해주세요.');
    return;
  }

  errEl.classList.add('hidden');
  loginUser({ email, nickname: email.split('@')[0] });
  closeModal('login');
  document.getElementById('loginForm').reset();
}

function sendVerification() {
  const email = document.getElementById('regEmail').value;
  if (!isSogangEmail(email)) {
    alert('서강대학교 이메일(@sogang.ac.kr)만 사용 가능합니다.');
    return;
  }
  state.verifyCode = String(Math.floor(100000 + Math.random() * 900000));
  document.getElementById('verifyCodeGroup').style.display = 'block';

  console.info('[인증코드 개발용]', state.verifyCode);
  alert(`${email} 으로 인증 코드를 발송했습니다.\n(개발 환경: 브라우저 콘솔에서 확인)`);
}

function checkVerification() {
  const input = document.getElementById('verifyCode').value.trim();
  if (input === state.verifyCode) {
    alert('인증 완료!');
    document.getElementById('verifyCode').disabled = true;
  } else {
    alert('인증 코드가 올바르지 않습니다.');
  }
}

function handleRegister(e) {
  e.preventDefault();
  const email    = document.getElementById('regEmail').value;
  const nickname = document.getElementById('regNickname').value.trim();
  const errEl    = document.getElementById('registerError');

  if (!isSogangEmail(email)) {
    showFormError(errEl, '서강대학교 이메일(@sogang.ac.kr)만 사용 가능합니다.');
    return;
  }
  if (!nickname) {
    showFormError(errEl, '닉네임을 입력해주세요.');
    return;
  }

  errEl.classList.add('hidden');
  loginUser({ email, nickname });
  closeModal('register');
  document.getElementById('registerForm').reset();
  document.getElementById('verifyCodeGroup').style.display = 'none';
}

function showFormError(el, msg) {
  el.textContent = msg;
  el.classList.remove('hidden');
}

function loginUser(user) {
  state.user = user;

  document.getElementById('authButtons').classList.add('hidden');
  document.getElementById('userButtons').classList.remove('hidden');
  document.getElementById('navUsername').textContent = user.nickname;

  document.getElementById('heroTitle').textContent = `안녕하세요, ${user.nickname}님!`;
  document.getElementById('heroSubtitle').textContent = '오늘도 좋은 자취 생활 되세요 🏠';
  document.getElementById('heroBtns').innerHTML = `
    <button class="btn-primary-lg" onclick="location.hash='takeon'">인수인계 보기</button>
    <button class="btn-outline-lg" onclick="location.hash='roomies'">룸메 찾기</button>
  `;

  document.getElementById('mypageName').textContent  = user.nickname;
  document.getElementById('mypageEmail').textContent = user.email;
}

function logout() {
  state.user = null;

  document.getElementById('authButtons').classList.remove('hidden');
  document.getElementById('userButtons').classList.add('hidden');

  document.getElementById('heroTitle').textContent = '로그인 후 이용해주세요.';
  document.getElementById('heroSubtitle').textContent = '서강대학교 학생 전용 자취 플랫폼';
  document.getElementById('heroBtns').innerHTML = `
    <button class="btn-outline-lg" onclick="openModal('login')">Sign in</button>
    <button class="btn-primary-lg" onclick="openModal('register')">Register</button>
  `;

  closeSidebar();
}

/* ====================================================
   HOME — 미리보기 렌더링 구역
==================================================== */
function renderTakeonPreview() {
  document.getElementById('takeonPreview').innerHTML =
    TAKEON_DATA.slice(0, 4).map(item => `
      <div class="takeon-card" onclick="location.hash='takeon'">
        <div class="takeon-card-img">${item.emoji}</div>
        <div class="takeon-card-body">
          <div class="takeon-card-title">${item.area} ${item.type}</div>
          <div class="takeon-card-price">보증 ${item.deposit}만 / 월 ${item.rent}만</div>
          <div class="takeon-card-user">
            <div class="avatar">${item.user.icon}</div>
            <span style="font-size:11px;color:var(--muted)">${item.user.name}</span>
          </div>
        </div>
      </div>
    `).join('');
}

function renderReviewsPreview() {
  const reviews = POSTS_DATA.filter(p => p.cat === 'review').slice(0, 3);
  document.getElementById('reviewsPreview').innerHTML =
    reviews.map(p => `
      <div class="quote-card" onclick="location.hash='board'">
        <div class="quote-text">"${p.content.substring(0, 70)}…"</div>
        <div class="quote-user">
          <div class="avatar">😶</div>
          <div>
            <div class="quote-name">익명</div>
            <div class="quote-desc">${fmtDate(p.date)}</div>
          </div>
        </div>
      </div>
    `).join('');
}

function renderRoomiesPreview() {
  document.getElementById('roomiesPreview').innerHTML =
    ROOMIES_DATA.map(r => `
      <div class="roomie-card" onclick="location.hash='roomies'">
        <div class="roomie-card-header">
          <div class="avatar-lg">${r.icon}</div>
          <div>
            <div class="roomie-name">${r.location}</div>
            <div class="roomie-sub">${r.name}</div>
          </div>
        </div>
        <div class="roomie-price">월 ${r.budget}만원</div>
        <div class="roomie-tags">${renderTags(r.tags)}</div>
        <div class="roomie-desc">${r.desc}</div>
      </div>
    `).join('');
}

/* ====================================================
   MAP — 지도 모드 및 마커 제어
==================================================== */
function setMapMode(mode) {
  state.mapMode = mode;
  document.getElementById('toggleProperties').classList.toggle('active', mode === 'properties');
  document.getElementById('toggleRoomies').classList.toggle('active', mode === 'roomies');
  renderMapList();
  renderMapMarkers();
}

function renderMapList() {
  const data = state.mapMode === 'properties' ? TAKEON_DATA : ROOMIES_DATA;
  document.getElementById('mapList').innerHTML = data.map(item =>
    state.mapMode === 'properties'
      ? `<div class="sidebar-card" onclick="location.hash='takeon'">
           <div class="sidebar-card-title">${item.area} ${item.type}</div>
           <div class="sidebar-card-price">보증 ${item.deposit}만 / 월 ${item.rent}만</div>
           <div class="sidebar-card-tags">${renderTags(item.tags)}</div>
         </div>`
      : `<div class="sidebar-card" onclick="location.hash='roomies'">
           <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
             <div class="avatar">${item.icon}</div>
             <div>
               <div class="sidebar-card-title" style="margin:0">${item.name}</div>
               <div class="sidebar-card-price">${item.location}</div>
             </div>
           </div>
           <div class="sidebar-card-price">월 ${item.budget}만원</div>
           <div class="sidebar-card-tags">${renderTags(item.tags.slice(0,2))}</div>
         </div>`
  ).join('');
}

function renderMapMarkers() {
  const data = state.mapMode === 'properties' ? TAKEON_DATA : ROOMIES_DATA;
  document.getElementById('mapMarkers').innerHTML = data.map(item => {
    const label = state.mapMode === 'properties'
      ? `${item.area} ${item.rent}만`
      : item.name;
    return `<div class="map-marker" style="left:${item.pos.left};top:${item.pos.top}">${label}</div>`;
  }).join('');
}

/* ====================================================
   BOARD — 익명 커뮤니티 게시판
==================================================== */
function renderBoard(cat = 'all') {
  const catLabel = { review:'후기', question:'질문', tip:'꿀팁' };
  const list = cat === 'all' ? POSTS_DATA : POSTS_DATA.filter(p => p.cat === cat);

  document.getElementById('postList').innerHTML = list.map(p => `
    <div class="post-item" onclick="openPost(${p.id})">
      <span class="post-category-badge badge-${p.cat}">${catLabel[p.cat]}</span>
      <div class="post-title">${p.title}</div>
      <div class="post-preview">${p.content}</div>
      <div class="post-meta">
        <span>익명</span>
        <span>${fmtDate(p.date)}</span>
        <span>조회 ${p.views}</span>
        <span>댓글 ${p.comments}</span>
      </div>
    </div>
  `).join('');
}

function filterBoard(btn, cat) {
  state.boardCat = cat;
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderBoard(cat);
}

function openPost(id) {
  requireLogin(() => {
    const p = POSTS_DATA.find(x => x.id === id);
    if (!p) return;
    alert(`[${p.title}]\n\n${p.content}\n\n─\n작성일: ${p.date}  조회: ${p.views}`);
  });
}

function openWritePost() {
  requireLogin(() => openModal('writepost'));
}

// 게시글 제출
function submitPost(e) {
  e.preventDefault();
  const newPost = {
    id:      POSTS_DATA.length + 1,
    cat:     document.getElementById('postCategory').value,
    title:   document.getElementById('postTitle').value,
    content: document.getElementById('postContent').value,
    date:    new Date().toISOString().split('T')[0],
    views:   0, comments: 0,
  };
  POSTS_DATA.unshift(newPost);
  renderBoard(state.boardCat);
  closeModal('writepost');
  e.target.reset();
}

/* ====================================================
   ROOMIES — 룸메이트 매칭 핵심 로직 구역
==================================================== */

// 역산 다차원 벡터 상수 맵 상단 선언 (호이스팅 세이프티)
const SLEEP_SCORE_MAP = { 'early': 1, 'normal': 3, 'late': 5 };
const CLEAN_SCORE_MAP = { 'very': 1,  'normal': 3, 'free': 5 };
const NOISE_SCORE_MAP = { 'sensitive': 1, 'normal': 3, 'tolerant': 5 };
const GUEST_SCORE_MAP = { 'rare': 1, 'sometimes': 3, 'often': 5 };

function renderRoomiesGrid(data = ROOMIES_DATA) {
  document.getElementById('roomiesGrid').innerHTML = data.length
    ? data.map(r => {
        // 사용자가 성향 매칭을 한번 돌렸을 때만 초록색 궁합 뱃지 UI 빌드 (0점 노출 차단 방어막 우회)
        const scoreBadge = (r.matchScore !== undefined && r.matchScore !== null)
          ? `<div style="background: #22c55e; color: white; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 700;">
               궁합 ${r.matchScore}점
             </div>`
          : '';

        return `
        <div class="roomie-card-full" onclick="openRoomieDetail(${r.id})">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px">
            <div style="display:flex; align-items:center; gap:10px">
              <div class="avatar-lg">${r.icon}</div>
              <div>
                <div style="font-weight:600; font-size:14px">${r.name}</div>
                <div style="font-size:12px; color:var(--secondary)">${r.location}</div>
              </div>
            </div>
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div style="font-size:15px; font-weight:700;">월 ${r.budget}만원</div>
            ${scoreBadge} 
          </div>

          <div class="roomie-tags">${renderTags(r.tags)}</div>
          
          <p style="font-size:12px; color:var(--secondary); margin-top:10px;
                    overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical">
            ${r.desc}
          </p>
        </div>
      `}).join('')
    : `<p class="text-muted" style="grid-column:1/-1; padding:40px 0; text-align:center">조건에 맞는 룸메이트가 없습니다</p>`;
}

// 메인 화면 검색 필터 조건 매핑 및 실시간 내림차순 정렬 기능 담당
function applyRoomiesFilter() {
  const area   = document.getElementById('filterArea').value;
  const gender = document.getElementById('filterGender').value;
  const price  = document.getElementById('filterPrice').value;
  const style  = document.getElementById('filterStyle').value;

  let filtered = [...ROOMIES_DATA];
  if (area)   filtered = filtered.filter(r => r.area === area);
  if (gender) filtered = filtered.filter(r => r.gender === gender);
  if (price)  filtered = filtered.filter(r => r.budget <= parseInt(price));
  if (style)  filtered = filtered.filter(r => r.style === style);

  // 이미 마이페이지 연산기에서 원본 객체에 발라둔 matchScore 기준 실시간 정렬(Order By)만 가볍게 수행
  filtered.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  
  renderRoomiesGrid(filtered);
}

function openRoomieDetail(id) {
  requireLogin(() => {
    const r = ROOMIES_DATA.find(x => x.id === id);
    if (!r) return;
    alert(`[${r.name}]\n위치: ${r.location}\n예산: 월 ${r.budget}만원\n\n${r.desc}`);
  });
}

function showCompatibility() {
  requireLogin(() => openSidebar());
}

/* ====================================================
   TAKE ON — 인수인계 카드 그리드 렌더링
==================================================== */
function renderTakeonGrid(data = TAKEON_DATA) {
  document.getElementById('takeonGrid').innerHTML = data.map(item => `
    <div class="takeon-full-card" onclick="openTakeonDetail(${item.id})">
      <div class="takeon-full-card-img">${item.emoji}</div>
      <div class="takeon-full-card-body">
        <div class="takeon-full-card-title">${item.area} ${item.type}</div>
        <div class="takeon-full-card-price">보증 ${item.deposit}만 / 월 ${item.rent}만원</div>
        <div class="takeon-full-card-detail">${item.desc}</div>
        <div class="roomie-tags" style="margin-bottom:10px">${renderTags(item.tags)}</div>
        <div class="takeon-full-card-footer">
          <div class="takeon-full-card-user">
            <div class="avatar">${item.user.icon}</div>
            <span>${item.user.name}</span>
          </div>
          <div class="takeon-full-card-date">인계 ${fmtDate(item.date)}</div>
        </div>
      </div>
    </div>
  `).join('');
}

function applyTakeonFilter() {
  const area = document.getElementById('takeonArea').value;
  const type = document.getElementById('takeonType').value;
  let result = [...TAKEON_DATA];
  if (area) result = result.filter(i => i.area === area);
  if (type) result = result.filter(i => i.type === type);
  renderTakeonGrid(result);
}

function openTakeonDetail(id) {
  requireLogin(() => {
    const item = TAKEON_DATA.find(x => x.id === id);
    if (!item) return;
    alert(`[${item.area} ${item.type}]\n보증금: ${item.deposit}만원 / 월세: ${item.rent}만원\n인계일: ${item.date}\n\n${item.desc}`);
  });
}

function openWriteTakeon() {
  requireLogin(() => openModal('writetakeon'));
}

function submitTakeon(e) {
  e.preventDefault();
  const newItem = {
    id:      TAKEON_DATA.length + 1,
    area:    document.getElementById('newTakeonArea').value,
    type:    document.getElementById('newTakeonType').value,
    deposit: parseInt(document.getElementById('newTakeonDeposit').value),
    rent:    parseInt(document.getElementById('newTakeonRent').value),
    date:    document.getElementById('newTakeonDate').value,
    desc:    document.getElementById('newTakeonDesc').value || '상세 내용 없음',
    emoji:   '🏠',
    user:    { name: state.user.nickname, icon: '👤' },
    tags:    [document.getElementById('newTakeonArea').value, document.getElementById('newTakeonType').value],
    pos:     { left: '45%', top: '45%' },
  };
  TAKEON_DATA.unshift(newItem);
  renderTakeonGrid();
  renderTakeonPreview();
  closeModal('writetakeon');
  e.target.reset();
}

/* ====================================================
   MY PAGE SIDEBAR — 내부 탭 제어
==================================================== */
function switchTab(btn, tabId) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
}

/* ====================================================
   MY PAGE SIDEBAR — 룸메궁합 다차원 행렬 연산 처리기 (교정 완료)
==================================================== */
function saveCompatProfile() {
  const sleep = document.getElementById('compatSleep').value;
  const clean = document.getElementById('compatClean').value;
  const noise = document.getElementById('compatNoise').value;
  const guest = document.getElementById('compatGuest').value;
  const smoking = document.getElementById('compatSmoking').value;

  // 1. 메인 검색 필터값 유무와 독립적으로 전역 룸메이트 DB 데이터 풀에 L2-Norm 성향 점수 직접 계산 및 축적
  ROOMIES_DATA.forEach(roomie => {
    let distanceSquared = 0;

    const mySleep = SLEEP_SCORE_MAP[sleep] || 3;
    const targetSleep = SLEEP_SCORE_MAP[roomie.sleep] || 3;
    distanceSquared += Math.pow(mySleep - targetSleep, 2);

    const myClean = CLEAN_SCORE_MAP[clean] || 3;
    const targetClean = CLEAN_SCORE_MAP[roomie.clean] || 3;
    distanceSquared += Math.pow(myClean - targetClean, 2);

    const myNoise = NOISE_SCORE_MAP[noise] || 3;
    const targetNoise = NOISE_SCORE_MAP[roomie.noise] || 3;
    distanceSquared += Math.pow(myNoise - targetNoise, 2);

    const myGuest = GUEST_SCORE_MAP[guest] || 1;
    let targetGuest = 3;
    if (roomie.style === 'homebody' || roomie.style === 'quiet') {
      targetGuest = 1; 
    }
    distanceSquared += Math.pow(myGuest - targetGuest, 2);

    if (smoking !== (roomie.smoking || 'no')) {
      distanceSquared += 16; 
    }

    const maxDistanceSquared = 80;
    let matchScore = (1 - (distanceSquared / maxDistanceSquared)) * 100;
    roomie.matchScore = Math.max(0, Math.round(matchScore * 10) / 10); 
  });

  // 2. 점수가 제대로 바인딩된 온전한 데이터 풀에서 진짜 최고 매칭 점수 파싱
  const displayScore = Math.max(...ROOMIES_DATA.map(r => r.matchScore || 0));

  // 3. 정적 규칙 기반 유형 성향 분류 (원본 기획 유지)
  let emoji, type, desc;
  if (clean === 'very' && noise === 'sensitive') {
    emoji = '✨'; type = '청결 민감형';
    desc  = '깨끗하고 조용한 환경을 중시해요. 비슷한 성향의 룸메와 최고의 궁합!';
  } else if (sleep === 'late' && noise === 'tolerant') {
    emoji = '🌙'; type = '자유로운 밤형';
    desc  = '늦게 자고 소음에 여유로워요. 활발한 룸메와도 잘 어울려요.';
  } else if (sleep === 'early' && clean === 'very') {
    emoji = '☀️'; type = '규칙적 깔끔형';
    desc  = '일찍 자고 깔끔함을 선호해요. 규칙적인 생활의 룸메와 잘 맞아요.';
  } else {
    emoji = '⚖️'; type = '균형 조화형';
    desc  = '다양한 성향과 두루 잘 어울리는 유연한 타입이에요.';
  }

  // 4. 마이페이지 결과 노출창 내부 innerHTML 바인딩 고도화 (0점 버그 원천 진압 완료)
  document.getElementById('compatBadge').textContent = emoji;
  document.getElementById('compatType').textContent  = type;
  document.getElementById('compatDesc').innerHTML = `${desc}<br>(최고 궁합 점수: ${displayScore}점)`;
  
  document.getElementById('compatResults').classList.remove('hidden');

  // 5. 점수가 업데이트되었으므로 메인 룸메이트 그리드를 최고 점수 순서로 동기화 재정렬 처리
  ROOMIES_DATA.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  renderRoomiesGrid(ROOMIES_DATA);

  // 6. 사이더바 퇴장 딜레이 트리거
  setTimeout(() => {
    closeSidebar();
  }, 1500);
}

/* ====================================================
   초기화 — DOMContentLoaded (렌더링 순서 패치 완료)
==================================================== */
function init() {
  renderTakeonPreview();
  renderReviewsPreview();
  renderRoomiesPreview();

  renderBoard();
  
  // 📍 [주범 진압 완료] 기존 renderRoomiesGrid() 대신 필터 정렬 함수를 호출합니다.
  // 이렇게 해놓아야 첫 사이트 접속이나 재접속 시에도 점수 정렬 파이프라인을 타고 화면을 이쁘게 채워넣습니다.
  applyRoomiesFilter(); 
  
  renderTakeonGrid();
  renderMapList();
  renderMapMarkers();

  window.addEventListener('hashchange', handleRoute);
  handleRoute();

  document.getElementById('signinBtn').addEventListener('click',   () => openModal('login'));
  document.getElementById('registerBtn').addEventListener('click', () => openModal('register'));
  document.getElementById('heroSignin').addEventListener('click',  () => openModal('login'));
  document.getElementById('heroRegister').addEventListener('click',() => openModal('register'));
  document.getElementById('mypageBtn').addEventListener('click',   openSidebar);

  document.getElementById('searchInput').addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const q = e.target.value.trim();
    if (q) alert(`"${q}" 검색 기능은 서버 연동 후 사용 가능합니다.`);
  });

  if (KAKAO_MAP_KEY) {
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_KEY}&autoload=false`;
    script.onload = () => kakao.maps.load(() => {
      const container = document.getElementById('kakao-map');
      const options   = { center: new kakao.maps.LatLng(37.552, 126.938), level: 4 };
      new kakao.maps.Map(container, options);
      container.querySelector('.map-placeholder')?.remove();
    });
    document.head.appendChild(script);
  }
}

document.addEventListener('DOMContentLoaded', init);
