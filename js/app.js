/**
 * 매경비즈 직장인 성향 테스트 메인 애플리케이션 컨트롤러
 * - 엑셀(Excel) 스프레드시트 UI/UX (수식 입력줄, 셀 참조, 시트 탭, 조건부 서식 데이터 막대)
 * - 의상 수동 선택 제거 -> 16개 직장인 유형마다 고유한 동물 캐릭터 + 맞춤 오피스 착장/소품 자동 강조
 */

(function () {
  const PROGRESS_STORAGE_KEY = "mkbiz_workstyle_progress_v1";
  const COLLECTION_STORAGE_KEY = "mkbiz_workstyle_collection_v1";
  const LAST_RESULT_STORAGE_KEY = "mkbiz_workstyle_last_result_v1";

  const state = {
    screen: "cover",
    nickname: "",
    currentQuestionIndex: 0,
    answers: {},
    optionOrders: {},
    resultType: null,
    axisScores: null,
    inviterType: null,
    inviterName: null,
    pairPartnerType: null,
    pairPartnerName: "동료",
    shareTone: "casual",
    surveyRating: 5,
    surveyNextInterest: true,
    surveySubmitted: false,
    animTimer: null,
    animFrame: 0
  };

  function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function updateExcelFormulaBar(cellRef, formulaStr, activeSheetTab) {
    const refEl = document.getElementById("excelCellRef");
    const fxEl = document.getElementById("excelFormulaText");
    if (refEl) refEl.textContent = cellRef;
    if (fxEl) fxEl.textContent = formulaStr;

    document.querySelectorAll(".sheet-tab").forEach((tab) => {
      const tabKey = tab.getAttribute("data-sheet-tab");
      tab.classList.toggle("active", tabKey === activeSheetTab);
    });
  }

  function validateNickname(raw) {
    const trimmed = (raw || "").trim();
    if (!trimmed) {
      return { valid: false, message: "사원증에 적을 닉네임을 입력해 주세요 (1~10자)." };
    }
    if (trimmed.length > 10) {
      return { valid: false, message: "닉네임은 공백 포함 최대 10자까지 입력할 수 있습니다." };
    }
    const validPattern = /^[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\s]+$/;
    if (!validPattern.test(trimmed)) {
      return { valid: false, message: "특수문자는 사용할 수 없습니다. 한글·영문·숫자로 입력해 주세요." };
    }
    const lower = trimmed.toLowerCase().replace(/\s+/g, "");
    const profanities = window.MKBIZ_DATA.profanityList || [];
    for (const bad of profanities) {
      if (lower.includes(bad.toLowerCase())) {
        return { valid: false, message: "사내 소통을 위해 정중한 닉네임을 사용해 주세요." };
      }
    }
    return { valid: true, value: trimmed };
  }

  function getCollectedTypes() {
    try {
      const raw = localStorage.getItem(COLLECTION_STORAGE_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function addCollectedType(typeCode) {
    if (!typeCode || !window.MKBIZ_DATA.types[typeCode]) return;
    try {
      const current = getCollectedTypes();
      if (!current.includes(typeCode)) {
        current.push(typeCode);
        localStorage.setItem(COLLECTION_STORAGE_KEY, JSON.stringify(current));
      }
      updateDexBadgeCount();
    } catch (e) {
      // ignore
    }
  }

  function updateDexBadgeCount() {
    const badge = document.getElementById("dexCountBadge");
    if (badge) {
      const count = getCollectedTypes().length;
      badge.textContent = `${count}/16`;
    }
  }

  function saveQuizProgress() {
    try {
      const payload = {
        nickname: state.nickname,
        currentQuestionIndex: state.currentQuestionIndex,
        answers: state.answers,
        optionOrders: state.optionOrders,
        updatedAt: Date.now()
      };
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      // ignore
    }
  }

  function loadQuizProgress() {
    try {
      const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        typeof parsed.currentQuestionIndex === "number" &&
        parsed.answers &&
        Object.keys(parsed.answers).length > 0 &&
        Object.keys(parsed.answers).length < window.MKBIZ_DATA.questions.length
      ) {
        return parsed;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  function clearQuizProgress() {
    try {
      localStorage.removeItem(PROGRESS_STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  }

  function saveLastResult() {
    try {
      localStorage.setItem(
        LAST_RESULT_STORAGE_KEY,
        JSON.stringify({
          nickname: state.nickname,
          resultType: state.resultType,
          axisScores: state.axisScores
        })
      );
    } catch (e) {
      // ignore
    }
  }

  function loadLastResult() {
    try {
      const raw = localStorage.getItem(LAST_RESULT_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  let toastTimeout = null;
  function showToast(message) {
    const el = document.getElementById("toastBox");
    if (!el) return;
    el.textContent = message;
    el.classList.add("show");
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      el.classList.remove("show");
    }, 2600);
  }

  function calculateCompatibility(myTypeCode, partnerTypeCode, myName = "나", partnerName = "동료") {
    const c1 = (myTypeCode || "SDLC").toUpperCase();
    const c2 = (partnerTypeCode || "SDHR").toUpperCase();

    let score = 0;
    const sameTempo = c1[0] === c2[0];
    const sameDecision = c1[1] === c2[1];
    const diffCollab = c1[2] !== c2[2];
    const diffCrisis = c1[3] !== c2[3];

    if (sameTempo) score += 25;
    if (sameDecision) score += 25;
    if (diffCollab) score += 25;
    if (diffCrisis) score += 25;

    const isIdentical = c1 === c2;
    const gradeKey = isIdentical ? "50_same" : String(score);
    const gradeInfo =
      window.MKBIZ_DATA.compatibilityGrades[gradeKey] || window.MKBIZ_DATA.compatibilityGrades["50"];

    const codeLabelMap = {
      S: "단기 몰입",
      M: "꾸준 분산",
      D: "데이터 근거",
      I: "직관 맥락",
      L: "방향 주도",
      H: "조율 공감",
      C: "정면 돌파",
      R: "차분 재정비"
    };

    const axisComparisons = [
      {
        axisName: "일하는 템포",
        myCode: codeLabelMap[c1[0]] || c1[0],
        partnerCode: codeLabelMap[c2[0]] || c2[0],
        isGood: sameTempo,
        tagText: sameTempo ? "호흡 일치 +25점" : "속도 조율",
        desc: sameTempo
          ? "업무를 몰아치거나 나누어 하는 호흡이 같아 일정 맞추기가 편안합니다."
          : "단기 집중형과 꾸준한 배분형이 만나 중간 점검일만 맞추면 빈틈이 없습니다."
      },
      {
        axisName: "판단 기준",
        myCode: codeLabelMap[c1[1]] || c1[1],
        partnerCode: codeLabelMap[c2[1]] || c2[1],
        isGood: sameDecision,
        tagText: sameDecision ? "기준 일치 +25점" : "관점 확장",
        desc: sameDecision
          ? "설득할 때 중요하게 보는 근거(숫자 vs 맥락)가 같아 대화가 빠르게 통합니다."
          : "데이터파와 직관파가 만나 숫자와 스토리를 모두 챙길 수 있는 조합입니다."
      },
      {
        axisName: "협업 방식",
        myCode: codeLabelMap[c1[2]] || c1[2],
        partnerCode: codeLabelMap[c2[2]] || c2[2],
        isGood: diffCollab,
        tagText: diffCollab ? "역할 보완 +25점" : "동일 포지션",
        desc: diffCollab
          ? "방향을 잡는 리더형과 의견을 묶는 조율형이 만나 이상적인 분업을 이룹니다."
          : c1[2] === "L"
          ? "두 사람 모두 주도적이라 시작 전에 담당 영역을 나누면 시너지가 납니다."
          : "두 사람 모두 배려심이 깊어 최종 결정권자만 미리 정해두면 속도가 빨라집니다."
      },
      {
        axisName: "위기 대응",
        myCode: codeLabelMap[c1[3]] || c1[3],
        partnerCode: codeLabelMap[c2[3]] || c2[3],
        isGood: diffCrisis,
        tagText: diffCrisis ? "완급 조화 +25점" : "동일 대응",
        desc: diffCrisis
          ? "즉시 치고 나가는 돌파형과 침착한 재정비형이 만나 위기에서 흔들리지 않습니다."
          : c1[3] === "C"
          ? "위기 때 둘 다 빠르게 돌파하니, 실행 직전 1분만 체크리스트를 점검해 보세요."
          : "둘 다 차분하고 신중하니, 긴급 상황에서는 마감 시간을 먼저 정해두면 좋습니다."
      }
    ];

    return {
      score,
      isIdentical,
      gradeInfo,
      myType: window.MKBIZ_DATA.types[c1],
      partnerType: window.MKBIZ_DATA.types[c2],
      myName: myName || "나",
      partnerName: partnerName || "동료",
      axisComparisons
    };
  }

  function computeResultFromAnswers() {
    const counts = {
      S: 0, M: 0,
      D: 0, I: 0,
      L: 0, H: 0,
      C: 0, R: 0
    };

    window.MKBIZ_DATA.questions.forEach((q) => {
      const ans = state.answers[q.id];
      if (ans && counts[ans] !== undefined) {
        counts[ans] += 1;
      } else {
        counts[q.optionA.code] += 1;
      }
    });

    const t1 = counts.S >= counts.M ? "S" : "M";
    const t2 = counts.D >= counts.I ? "D" : "I";
    const t3 = counts.L >= counts.H ? "L" : "H";
    const t4 = counts.C >= counts.R ? "C" : "R";

    const code = `${t1}${t2}${t3}${t4}`;
    const toPct = (c) => Math.min(100, Math.max(60, Math.round((c / 5) * 100)));

    const axisScores = {
      tempo: { winner: t1, count: counts[t1], pct: toPct(counts[t1]) },
      decision: { winner: t2, count: counts[t2], pct: toPct(counts[t2]) },
      collab: { winner: t3, count: counts[t3], pct: toPct(counts[t3]) },
      crisis: { winner: t4, count: counts[t4], pct: toPct(counts[t4]) }
    };

    return { code, axisScores };
  }

  function stopPixelAnimation() {
    if (state.animTimer) {
      clearInterval(state.animTimer);
      state.animTimer = null;
    }
  }

  function startPixelAnimation(drawCallback) {
    stopPixelAnimation();
    state.animFrame = 0;
    drawCallback(0);

    const prefersReducedMotion =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    state.animTimer = setInterval(() => {
      state.animFrame = state.animFrame === 0 ? 1 : 0;
      drawCallback(state.animFrame);
    }, 850);
  }

  function renderScreen(screenName) {
    stopPixelAnimation();
    state.screen = screenName;
    const stage = document.getElementById("mainStage");
    if (!stage) return;

    window.scrollTo({ top: 0, behavior: "smooth" });

    switch (screenName) {
      case "cover":
      case "nickname":
        renderCoverScreen(stage);
        break;
      case "quiz":
        renderQuizScreen(stage);
        break;
      case "loading":
        renderLoadingScreen(stage);
        break;
      case "result":
        renderResultScreen(stage);
        break;
      case "pair":
        renderPairScreen(stage);
        break;
      default:
        renderCoverScreen(stage);
    }
  }

  /**
   * [화면 1] 홈 화면 (엑셀 표 스타일 + 유형별 동물 오피스 캐릭터 프리뷰 + 닉네임 즉시 입력)
   */
  function renderCoverScreen(stage) {
    updateExcelFormulaBar(
      "B4",
      '=IF(닉네임<>"", "내 직장인 성향 유형 진단 시작", "사원증에 적을 닉네임을 입력해 주세요")',
      "cover"
    );

    const savedProgress = loadQuizProgress();
    const lastResult = loadLastResult();
    const answeredCount = savedProgress ? Object.keys(savedProgress.answers).length : 0;

    let inviteHtml = "";
    if (state.inviterType && window.MKBIZ_DATA.types[state.inviterType]) {
      const invType = window.MKBIZ_DATA.types[state.inviterType];
      const invName = escapeHtml(state.inviterName || "동료");
      inviteHtml = `
        <section class="invite-ticket" aria-label="궁합 초대장">
          <div class="invite-ticket-header">
            <span class="invite-ticket-badge">VLOOKUP 궁합 요청</span>
            <span class="invite-ticket-title">${invName}님이 우리의 업무 궁합을 궁금해해요!</span>
          </div>
          <p style="font-size:13px; color:var(--ink-muted);">
            초대한 동료의 유형: <strong style="color:var(--ink-black);">${invType.name} (${invType.animal || ""})</strong>
          </p>
          ${
            lastResult && lastResult.resultType
              ? `<button type="button" class="btn btn-subtle btn-sm" id="btnInstantInviteCompare" style="width:100%; margin-top:4px;">
                   내 지난 결과(${escapeHtml(lastResult.nickname)} · ${window.MKBIZ_DATA.types[lastResult.resultType]?.name || ""})로 1초 만에 궁합 보기
                 </button>`
              : ""
          }
        </section>
      `;
    }

    let resumeHtml = "";
    if (savedProgress) {
      resumeHtml = `
        <section class="resume-banner" aria-label="이어하기 안내">
          <div>
            <span class="resume-banner-text">작성 중이던 시트가 남아 있어요 (${answeredCount} / 20문항)</span>
            <span class="resume-banner-sub">${escapeHtml(savedProgress.nickname || "익명")}님으로 이어서 진행할까요?</span>
          </div>
          <button type="button" class="btn btn-primary btn-sm" id="btnResumeQuiz">이어하기</button>
        </section>
      `;
    }

    stage.innerHTML = `
      ${inviteHtml}
      ${resumeHtml}

      <article class="editorial-card">
        <div class="lanyard-slot" aria-hidden="true"></div>

        <div class="cover-badge-row">
          <span class="stamp-pill accent">매경비즈 직장인 성향 테스트</span>
          <span class="stamp-pill">총 20문항 · 약 3분</span>
        </div>

        <h1 class="cover-headline">
          일할 때 드러나는<br />
          나의 <span class="highlight">직장인 유형</span>은?
        </h1>
        <p class="cover-subcopy">
          정장 입은 호랑이 대리부터 커리어 블레이저를 입은 토끼 프로까지!<br />
          20가지 오피스 상황으로 나의 업무 유형과 찰떡 동료를 확인해 보세요.
        </p>

        <!-- 엑셀 표 스타일 대표 유형 쇼케이스 (유형별 맞춤 동물 & 오피스 착장 미리보기) -->
        <div class="cover-stage-box">
          <div class="excel-table-header-row">
            <div>A열 : 돌파형 리더</div>
            <div>B열 : 아이디어 개척</div>
            <div>C열 : 정밀 검증</div>
          </div>
          <div class="cover-char-row">
            <div class="cover-char-card">
              <canvas id="coverChar1" class="pixel-canvas" width="200" height="200" aria-label="마감 불도저 호랑이 캐릭터"></canvas>
              <span class="cover-char-code">호랑이 대리 · 정장&타이</span>
              <span class="cover-char-label">마감 불도저</span>
            </div>
            <div class="cover-char-card">
              <canvas id="coverChar2" class="pixel-canvas" width="200" height="200" aria-label="기획 로켓 토끼 캐릭터"></canvas>
              <span class="cover-char-code">토끼 프로 · 커리어 안경</span>
              <span class="cover-char-label">기획 로켓</span>
            </div>
            <div class="cover-char-card">
              <canvas id="coverChar3" class="pixel-canvas" width="200" height="200" aria-label="번개 팩트체커 판다 캐릭터"></canvas>
              <span class="cover-char-code">판다 선임 · 데이터 검증</span>
              <span class="cover-char-label">번개 팩트체커</span>
            </div>
          </div>
        </div>

        <!-- 엑셀 활성 셀 스타일 닉네임 입력창 (의상 선택 제거 -> 유형별 맞춤 코디 자동 배정 안내) -->
        <div class="excel-input-sheet">
          <div class="excel-input-sheet-head">
            <span>[입력 셀 B4] 사원증에 적을 닉네임</span>
            <span id="charCountText" style="font-family:var(--font-mono); font-weight:700;">0 / 10자</span>
          </div>
          <div class="excel-input-sheet-body">
            <input
              type="text"
              id="nicknameInput"
              class="text-input"
              maxlength="10"
              placeholder="닉네임 입력 (예: 김매경, 열정대리 / 실명 불필요)"
              value=""
              autocomplete="off"
            />
            <div id="nicknameError" class="input-error" role="alert"></div>

            <div class="excel-type-notice">
              <span>결과 유형에 맞춰 <strong>16종 동물 캐릭터와 정장·안경·업무 소품</strong>이 자동 배정됩니다.</span>
            </div>
          </div>
        </div>

        <button type="button" class="btn btn-primary" id="btnStartTest">
          ${state.inviterType ? "테스트 시작하고 동료와 궁합 비교하기 →" : "내 직장인 유형 결과표 뽑기 →"}
        </button>

        ${
          lastResult && lastResult.resultType
            ? `<button type="button" class="btn btn-secondary" id="btnViewLastResult" style="margin-top:8px; min-height:44px; font-size:13.5px;">
                 방금 만든 내 사원증(${window.MKBIZ_DATA.types[lastResult.resultType]?.name || lastResult.resultType}) 다시 열기
               </button>`
            : ""
        }

        <div class="trust-checklist" role="note" aria-label="개인정보 및 활용 안내">
          <div class="trust-item">
            <span><strong>익명 보장</strong> — 실명·사번·부서를 받지 않으며 입력한 닉네임도 서버에 저장되지 않습니다.</span>
          </div>
          <div class="trust-item">
            <span><strong>소통 시트</strong> — 인사·평가와 무관하며 동료와 가볍게 이야기를 나누기 위한 콘텐츠입니다.</span>
          </div>
        </div>
      </article>

      <section class="editorial-card" style="padding:16px 18px;">
        <div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
          <div style="flex:1;">
            <div style="font-size:13.5px; font-weight:800; color:var(--ink-black); margin-bottom:2px;">옆자리 동료와 바로 궁합을 맞춰볼까요?</div>
            <div style="font-size:12px; color:var(--ink-muted); line-height:1.45;">서로의 직장인 유형만 골라도 두 사람의 업무 시너지를 바로 계산해 드립니다.</div>
          </div>
          <button type="button" class="btn btn-subtle btn-sm" id="btnOpenDirectMatcher">궁합 계산기</button>
        </div>
      </section>
    `;

    // 상단 쇼케이스 3종 동물 캐릭터 애니메이션 (호랑이 SDLC, 토끼 SILC, 판다 SDHR)
    startPixelAnimation((frame) => {
      const c1 = document.getElementById("coverChar1");
      const c2 = document.getElementById("coverChar2");
      const c3 = document.getElementById("coverChar3");
      if (c1) window.MKBIZ_PIXEL.renderPixelCharacter(c1, { typeCode: "SDLC", frame, size: 220 });
      if (c2) window.MKBIZ_PIXEL.renderPixelCharacter(c2, { typeCode: "SILC", frame: frame === 0 ? 1 : 0, size: 220 });
      if (c3) window.MKBIZ_PIXEL.renderPixelCharacter(c3, { typeCode: "SDHR", frame, size: 220 });
    });

    const inputEl = document.getElementById("nicknameInput");
    const countEl = document.getElementById("charCountText");
    const errEl = document.getElementById("nicknameError");

    const updateCount = () => {
      const len = (inputEl?.value || "").length;
      if (countEl) countEl.textContent = `${len} / 10자`;
    };
    updateCount();

    inputEl?.addEventListener("input", () => {
      updateCount();
      if (errEl) errEl.textContent = "";
    });

    const startQuizDirectly = () => {
      const check = validateNickname(inputEl?.value);
      if (!check.valid) {
        if (errEl) errEl.textContent = check.message;
        inputEl?.focus();
        return;
      }
      state.nickname = check.value;
      state.currentQuestionIndex = 0;
      state.answers = {};
      state.optionOrders = {};
      clearQuizProgress();
      window.MKBIZ_ANALYTICS.trackEvent("test_start");
      renderScreen("quiz");
    };

    document.getElementById("btnStartTest")?.addEventListener("click", startQuizDirectly);
    inputEl?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        startQuizDirectly();
      }
    });

    document.getElementById("btnResumeQuiz")?.addEventListener("click", () => {
      if (!savedProgress) return;
      state.nickname = savedProgress.nickname || "매경인";
      state.currentQuestionIndex = savedProgress.currentQuestionIndex || 0;
      state.answers = savedProgress.answers || {};
      state.optionOrders = savedProgress.optionOrders || {};
      renderScreen("quiz");
    });

    document.getElementById("btnViewLastResult")?.addEventListener("click", () => {
      if (!lastResult) return;
      state.nickname = lastResult.nickname;
      state.resultType = lastResult.resultType;
      state.axisScores = lastResult.axisScores;
      renderScreen("result");
    });

    document.getElementById("btnInstantInviteCompare")?.addEventListener("click", () => {
      if (!lastResult || !state.inviterType) return;
      state.nickname = lastResult.nickname;
      state.resultType = lastResult.resultType;
      state.axisScores = lastResult.axisScores;
      state.pairPartnerType = state.inviterType;
      state.pairPartnerName = state.inviterName || "초대한 동료";
      window.MKBIZ_ANALYTICS.trackEvent("pair_view", {
        my_type: state.resultType,
        partner_type: state.pairPartnerType,
        source: "invite_instant"
      });
      renderScreen("pair");
    });

    document.getElementById("btnOpenDirectMatcher")?.addEventListener("click", () => {
      openDexAndMatcherModal("matcher");
    });
  }

  /**
   * [화면 2] 20문항 응답 화면 (엑셀 행 선택 스타일)
   */
  function renderQuizScreen(stage) {
    const questions = window.MKBIZ_DATA.questions;
    const total = questions.length;
    const idx = Math.max(0, Math.min(total - 1, state.currentQuestionIndex));
    state.currentQuestionIndex = idx;

    const q = questions[idx];
    const progressPct = Math.round(((idx + 1) / total) * 100);

    updateExcelFormulaBar(
      `Q${idx + 1}`,
      `=COUNTA(완료문항:${idx + 1}/${total}) & " - [${q.context}] 상황 선택"`,
      "cover"
    );

    if (!state.optionOrders[q.id]) {
      state.optionOrders[q.id] = Math.random() < 0.5 ? ["optionA", "optionB"] : ["optionB", "optionA"];
    }
    const order = state.optionOrders[q.id];
    const firstOpt = q[order[0]];
    const secondOpt = q[order[1]];
    const prevSelectedCode = state.answers[q.id];

    stage.innerHTML = `
      <div class="quiz-topbar">
        <button type="button" class="back-step-btn" id="btnPrevQuestion">
          ← ${idx === 0 ? "사원등록 홈으로" : "이전 문항"}
        </button>
        <span class="quiz-counter" aria-live="polite">CELL Q${idx + 1} (${idx + 1}/${total})</span>
      </div>

      <div class="progress-track" role="progressbar" aria-valuenow="${idx + 1}" aria-valuemin="1" aria-valuemax="${total}">
        <div class="progress-fill" style="width: ${progressPct}%;"></div>
      </div>

      <article class="editorial-card">
        <span class="question-context-chip">상황 ${String(idx + 1).padStart(2, "0")} · ${escapeHtml(q.context)}</span>
        <h2 class="question-title">${escapeHtml(q.question)}</h2>

        <div class="choice-list" role="group" aria-label="문항 선택지">
          <button
            type="button"
            class="choice-card-btn ${prevSelectedCode === firstOpt.code ? "selected" : ""}"
            data-choice-code="${firstOpt.code}"
            id="choiceBtn1"
          >
            <span class="choice-key-badge">A</span>
            <span class="choice-text">${escapeHtml(firstOpt.text)}</span>
          </button>

          <button
            type="button"
            class="choice-card-btn ${prevSelectedCode === secondOpt.code ? "selected" : ""}"
            data-choice-code="${secondOpt.code}"
            id="choiceBtn2"
          >
            <span class="choice-key-badge">B</span>
            <span class="choice-text">${escapeHtml(secondOpt.text)}</span>
          </button>
        </div>

        <p class="keyboard-hint">PC에서는 키보드 숫자 [1], [2] 또는 좌우 방향키로도 셀을 선택할 수 있습니다.</p>
      </article>
    `;

    let isTransitioning = false;
    const handleSelectChoice = (code, btnEl) => {
      if (isTransitioning) return;
      isTransitioning = true;

      if (btnEl) btnEl.classList.add("selected");
      state.answers[q.id] = code;

      window.MKBIZ_ANALYTICS.trackEvent("question_answered", {
        question_number: idx + 1
      });

      if (idx + 1 < total) {
        state.currentQuestionIndex = idx + 1;
        saveQuizProgress();
        setTimeout(() => {
          renderQuizScreen(stage);
        }, 150);
      } else {
        clearQuizProgress();
        const computed = computeResultFromAnswers();
        state.resultType = computed.code;
        state.axisScores = computed.axisScores;
        addCollectedType(state.resultType);
        saveLastResult();

        window.MKBIZ_ANALYTICS.trackEvent("test_complete", {
          type_code: state.resultType,
          tempo_pct: state.axisScores.tempo.pct,
          decision_pct: state.axisScores.decision.pct,
          collab_pct: state.axisScores.collab.pct,
          crisis_pct: state.axisScores.crisis.pct
        });

        setTimeout(() => {
          renderScreen("loading");
        }, 150);
      }
    };

    document.getElementById("choiceBtn1")?.addEventListener("click", (e) => {
      handleSelectChoice(firstOpt.code, e.currentTarget);
    });
    document.getElementById("choiceBtn2")?.addEventListener("click", (e) => {
      handleSelectChoice(secondOpt.code, e.currentTarget);
    });

    document.getElementById("btnPrevQuestion")?.addEventListener("click", () => {
      if (idx === 0) {
        renderScreen("cover");
      } else {
        state.currentQuestionIndex = idx - 1;
        saveQuizProgress();
        renderQuizScreen(stage);
      }
    });

    const keyHandler = (e) => {
      if (state.screen !== "quiz") {
        window.removeEventListener("keydown", keyHandler);
        return;
      }
      if (e.key === "1" || e.key === "ArrowLeft") {
        window.removeEventListener("keydown", keyHandler);
        handleSelectChoice(firstOpt.code, document.getElementById("choiceBtn1"));
      } else if (e.key === "2" || e.key === "ArrowRight") {
        window.removeEventListener("keydown", keyHandler);
        handleSelectChoice(secondOpt.code, document.getElementById("choiceBtn2"));
      }
    };
    window.addEventListener("keydown", keyHandler, { once: false });
  }

  /**
   * [화면 3] 결과 산출 로딩 화면
   */
  function renderLoadingScreen(stage) {
    updateExcelFormulaBar(
      "CALC",
      `=INDEX(매경비즈_16유형_시트, MATCH("${state.nickname || "익명"}", 응답데이터, 0))`,
      "result"
    );

    const code = state.resultType || "SDLC";

    stage.innerHTML = `
      <article class="editorial-card" style="text-align:center; padding: 38px 20px;">
        <span class="stamp-pill accent" style="margin-bottom:14px;">엑셀 수식 계산 중...</span>
        <h2 style="font-size:21px; font-weight:800; margin-bottom:8px;">
          ${escapeHtml(state.nickname || "익명")}님의 직장 성향 사원증을 발급하고 있습니다
        </h2>
        <p style="font-size:13.5px; color:var(--ink-muted); margin-bottom:22px;">
          업무 템포 · 판단 기준 · 협업 방식 · 위기 대응 스타일 집계 완료
        </p>

        <div style="width:176px; height:176px; margin:0 auto 20px; border:1.5px solid var(--excel-cell-border); border-radius:6px; overflow:hidden;">
          <canvas id="loadingPixelCanvas" class="pixel-canvas" width="240" height="240"></canvas>
        </div>

        <div class="progress-track" style="max-width:240px; margin:0 auto;">
          <div class="progress-fill" id="loadingBarFill" style="width: 15%; transition: width 0.8s ease;"></div>
        </div>
      </article>
    `;

    const c = document.getElementById("loadingPixelCanvas");
    if (c) {
      window.MKBIZ_PIXEL.renderPixelCharacter(c, {
        typeCode: code,
        frame: 0,
        size: 240
      });
    }

    setTimeout(() => {
      const fill = document.getElementById("loadingBarFill");
      if (fill) fill.style.width = "100%";
    }, 60);

    setTimeout(() => {
      renderScreen("result");
    }, 950);
  }

  function getGroupChatCopyText(typeInfo, bestTypeInfo, inviteUrl, tone = "casual") {
    const nick = state.nickname || "저";
    if (tone === "leader") {
      return `[매경비즈 직장인 성향 테스트]\n저는 '${typeInfo.name} (${typeInfo.animal || ""})' 유형이 나왔네요.\n"${typeInfo.summary}"\n우리 팀원분들은 어떤 업무 유형인지 가볍게 테스트해 보시고 궁합도 맞춰보세요!\n${inviteUrl}`;
    }
    if (tone === "newbie") {
      return `[매경비즈 직장인 성향 테스트]\n안녕하세요! 테스트 결과 저는 '${typeInfo.name}' 유형이 나왔습니다.\n선배님·동료분들과의 업무 궁합이 궁금한데 시간 되실 때 한번 확인해 보세요!\n${inviteUrl}`;
    }
    return `[매경비즈 직장인 성향 테스트]\n${nick}의 직장인 성향은 '${typeInfo.name} (${typeInfo.animal || ""})'!\n나랑 100점 찰떡 파트너는 '${bestTypeInfo.name}'이라는데 우리 팀에 누구 계신가요?\n아래 링크에서 3분 만에 확인해 보세요!\n${inviteUrl}`;
  }

  function buildInviteUrl(typeCode, nickname) {
    const base = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();
    params.set("inviter", typeCode);
    if (nickname) params.set("name", nickname);
    return `${base}?${params.toString()}`;
  }

  function buildShareResultUrl(typeCode) {
    const base = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();
    params.set("r", typeCode);
    return `${base}?${params.toString()}`;
  }

  /**
   * [화면 4] 메인 결과 화면 (사원증 카드 + 유형별 고유 동물/의상/소품 소개 + 엑셀 조건부 서식 표)
   */
  function renderResultScreen(stage) {
    const typeCode = state.resultType || "SDLC";
    const typeInfo = window.MKBIZ_DATA.types[typeCode] || window.MKBIZ_DATA.types.SDLC;
    addCollectedType(typeCode);

    updateExcelFormulaBar(
      "ID_CARD",
      `=VLOOKUP("${state.nickname || "익명"}", 사원증_DB, "${typeInfo.name} (${typeInfo.animal || ""})", FALSE)`,
      "result"
    );

    const bestInfo = window.MKBIZ_DATA.types[typeInfo.bestMatch];
    const worstInfo = window.MKBIZ_DATA.types[typeInfo.worstMatch];
    const inviteUrl = buildInviteUrl(typeCode, state.nickname);

    const scores = state.axisScores || {
      tempo: { winner: typeCode[0], pct: 80 },
      decision: { winner: typeCode[1], pct: 80 },
      collab: { winner: typeCode[2], pct: 60 },
      crisis: { winner: typeCode[3], pct: 100 }
    };

    let inviterBannerHtml = "";
    if (state.inviterType && window.MKBIZ_DATA.types[state.inviterType]) {
      const pairPreview = calculateCompatibility(
        typeCode,
        state.inviterType,
        state.nickname,
        state.inviterName
      );
      inviterBannerHtml = `
        <section class="invite-ticket">
          <div class="invite-ticket-header">
            <span class="invite-ticket-badge">VLOOKUP 궁합 계산 완료</span>
            <span class="invite-ticket-title">${escapeHtml(state.inviterName)}님과의 업무 궁합: ${pairPreview.score}점!</span>
          </div>
          <p style="font-size:13.5px; color:var(--ink-body); margin-bottom:8px;">
            ${escapeHtml(pairPreview.gradeInfo.summary)}
          </p>
          <button type="button" class="btn btn-primary" id="btnGoToInvitedPair">
            두 사람 궁합 상세 시트 열기 →
          </button>
        </section>
      `;
    }

    const axesMeta = window.MKBIZ_DATA.axes;

    stage.innerHTML = `
      ${inviterBannerHtml}

      <!-- 1. 메인 결과 사원증 카드 (의상 선택 제거 -> 유형 고유 동물 캐릭터 & 오피스 착장 배지 강조) -->
      <article class="id-card-frame" aria-label="내 직장인 성향 사원증 카드">
        <div class="id-card-topbar">
          <div class="id-card-topbar-left">
            <span>매경비즈</span>
            <span style="opacity:0.4;">|</span>
            <span>직장인 성향 사원증 (.xlsx)</span>
          </div>
          <span class="id-card-code-pill">${escapeHtml(typeInfo.animal || "오피스 캐릭터")}</span>
        </div>

        <div class="id-card-body">
          <p class="id-card-owner">${escapeHtml(state.nickname || "익명")}님의 직장인 성향 유형은</p>
          <h1 class="id-card-typename">
            <span>${escapeHtml(typeInfo.name)}</span>
          </h1>

          <!-- 유형별 맞춤 동물 캐릭터 & 오피스 코디/소품 하이라이트 -->
          <div class="character-outfit-pill">
            <span>${escapeHtml(typeInfo.animal || "")}</span>
            <span style="opacity:0.4;">|</span>
            <span>${escapeHtml(typeInfo.outfitLabel || "")}</span>
          </div>

          <div class="id-card-hashtags">
            ${typeInfo.hashtags.map((tag) => `<span class="hashtag-chip">${escapeHtml(tag)}</span>`).join("")}
          </div>

          <div class="id-card-avatar-wrap">
            <canvas
              id="resultPixelCanvas"
              class="pixel-canvas"
              width="440"
              height="440"
              role="img"
              aria-label="${escapeHtml(typeInfo.name)} 사원증 캐릭터"
            ></canvas>
          </div>

          <div class="id-card-summary-banner">
            “${escapeHtml(typeInfo.summary)}”
          </div>

          <!-- 엑셀 조건부 서식(Data Bar) 스타일 4축 분석 표 -->
          <table class="excel-axis-table" aria-label="네 가지 업무 스타일 분석 표">
            <thead>
              <tr>
                <th style="width:28%;">진단 항목</th>
                <th style="width:72%;">내 성향 판정 (조건부 서식 데이터 막대)</th>
              </tr>
            </thead>
            <tbody>
              ${axesMeta
                .map((ax) => {
                  const sc = scores[ax.id] || { winner: ax.left.code, pct: 80 };
                  const winSide = sc.winner === ax.left.code ? ax.left : ax.right;
                  return `
                  <tr>
                    <td style="font-weight:800; color:var(--ink-black); white-space:nowrap;">${ax.name}</td>
                    <td>
                      <div class="excel-databar-wrap">
                        <div class="excel-databar-fill" style="width:${sc.pct}%; background-color:${typeInfo.accentColor};"></div>
                        <span class="excel-databar-text">${winSide.shortLabel} (${sc.pct}%)</span>
                      </div>
                    </td>
                  </tr>
                `;
                })
                .join("")}
            </tbody>
          </table>
        </div>
      </article>

      <!-- 2. 이미지 저장 & 공유 & 동료 궁합 초대 -->
      <section class="editorial-card">
        <div class="section-header-bar">
          <span class="section-num-tag">EXPORT</span>
          <h2 class="section-title">사원증 이미지 저장 & 동료 궁합 초대</h2>
        </div>

        <div class="action-grid-2col" style="margin-bottom:10px;">
          <button type="button" class="btn btn-secondary" id="btnDownload1x1" style="font-size:14px; padding:10px 12px; flex-direction:column; gap:2px;">
            <span>1:1 사원증 저장</span>
            <span style="font-size:11px; color:var(--ink-muted); font-weight:500;">메신저·피드 규격</span>
          </button>
          <button type="button" class="btn btn-secondary" id="btnDownload9x16" style="font-size:14px; padding:10px 12px; flex-direction:column; gap:2px;">
            <span>9:16 스토리 저장</span>
            <span style="font-size:11px; color:var(--ink-muted); font-weight:500;">스토리 규격 (궁합 포함)</span>
          </button>
        </div>

        <button type="button" class="btn btn-primary" id="btnCreateInviteLink" style="margin-bottom:10px;">
          동료와 업무 궁합 비교하기 (초대 링크 복사)
        </button>

        <div class="action-grid-2col">
          <button type="button" class="btn btn-subtle" id="btnWebShareSheet">
            모바일 공유 시트 열기
          </button>
          <button type="button" class="btn btn-subtle" id="btnCopyBasicLink">
            결과 링크만 복사
          </button>
        </div>

        <!-- 팀 단체방 복사용 멘트 박스 -->
        <div class="groupchat-copy-box">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
            <span style="font-size:12.5px; font-weight:800; color:var(--ink-black);">단체방 공유용 메시지 템플릿</span>
            <div style="display:flex; gap:4px;">
              <button type="button" class="masthead-btn" data-tone="casual" style="background:${state.shareTone === "casual" ? "var(--excel-green)" : "#fff"}; color:${state.shareTone === "casual" ? "#fff" : "var(--ink-body)"};">캐주얼</button>
              <button type="button" class="masthead-btn" data-tone="leader" style="background:${state.shareTone === "leader" ? "var(--excel-green)" : "#fff"}; color:${state.shareTone === "leader" ? "#fff" : "var(--ink-body)"};">리더·팀장</button>
              <button type="button" class="masthead-btn" data-tone="newbie" style="background:${state.shareTone === "newbie" ? "var(--excel-green)" : "#fff"}; color:${state.shareTone === "newbie" ? "#fff" : "var(--ink-body)"};">정중·신입</button>
            </div>
          </div>
          <div class="groupchat-copy-text" id="groupChatTextPreview">${escapeHtml(
            getGroupChatCopyText(typeInfo, bestInfo, inviteUrl, state.shareTone)
          )}</div>
          <button type="button" class="btn btn-navy btn-sm" id="btnCopyGroupChatMsg" style="width:100%;">
            위 메시지 + 초대 링크 한 번에 복사
          </button>
        </div>
      </section>

      <!-- 3. 상세 업무 성향 해설 시트 -->
      <section class="editorial-card">
        <div class="section-header-bar">
          <span class="section-num-tag">DETAIL</span>
          <h2 class="section-title">${escapeHtml(typeInfo.name)}의 오피스 사용설명서</h2>
        </div>

        <div class="quote-bubble">
          <div style="font-size:11.5px; color:var(--excel-green); font-weight:800; margin-bottom:4px;">일할 때 자주 하는 단골 멘트</div>
          ${escapeHtml(typeInfo.catchphrase)}
        </div>

        <div class="detail-list">
          <div class="detail-item">
            <span class="detail-item-badge" style="background:var(--excel-green-soft); color:var(--excel-green);">강점 셀 1</span>
            <p>${escapeHtml(typeInfo.strengths[0])}</p>
          </div>
          <div class="detail-item">
            <span class="detail-item-badge" style="background:var(--excel-green-soft); color:var(--excel-green);">강점 셀 2</span>
            <p>${escapeHtml(typeInfo.strengths[1])}</p>
          </div>
          <div class="detail-item">
            <span class="detail-item-badge" style="background:var(--mk-rose-soft); color:var(--mk-rose);">주의할 점</span>
            <p>${escapeHtml(typeInfo.caution)}</p>
          </div>
          <div class="detail-item" style="background-color:var(--bg-paper);">
            <span class="detail-item-badge" style="background:var(--ink-black); color:#FFFFFF;">동료에게 건네는 협업 가이드</span>
            <p>${escapeHtml(typeInfo.colleagueTip)}</p>
          </div>
        </div>
      </section>

      <!-- 4. 찰떡 궁합 & 배울 점 많은 상극 -->
      <section class="editorial-card">
        <div class="section-header-bar">
          <span class="section-num-tag">VLOOKUP</span>
          <h2 class="section-title">나와 가장 잘 맞는 동료 vs 반전 파트너</h2>
        </div>
        <p style="font-size:12.5px; color:var(--ink-muted); margin-bottom:14px;">
          카드를 누르면 두 유형의 업무 궁합 점수와 협업 가이드를 바로 볼 수 있습니다.
        </p>

        <div class="match-pair-grid">
          <div class="match-mini-card" id="cardBestMatch" role="button" tabindex="0">
            <span class="stamp-pill" style="background:var(--excel-green-soft); color:var(--excel-green); border-color:#A7D4B8; margin-bottom:8px;">100점 · 찰떡 궁합</span>
            <canvas id="bestMatchCanvas" class="pixel-canvas" width="180" height="180"></canvas>
            <span style="font-size:11px; color:var(--excel-green); font-weight:700; margin-top:8px;">${escapeHtml(bestInfo.animal || "")}</span>
            <strong style="font-size:15px; margin-top:2px; color:var(--ink-black); white-space:nowrap;">${escapeHtml(bestInfo.name)}</strong>
            <span style="font-size:11.5px; color:var(--ink-muted); margin-top:4px; white-space:nowrap;">궁합 시트 보기 →</span>
          </div>

          <div class="match-mini-card" id="cardWorstMatch" role="button" tabindex="0">
            <span class="stamp-pill" style="background:var(--mk-rose-soft); color:var(--mk-rose); border-color:#FECACA; margin-bottom:8px;">배울 점 많은 상극</span>
            <canvas id="worstMatchCanvas" class="pixel-canvas" width="180" height="180"></canvas>
            <span style="font-size:11px; color:var(--mk-rose); font-weight:700; margin-top:8px;">${escapeHtml(worstInfo.animal || "")}</span>
            <strong style="font-size:15px; margin-top:2px; color:var(--ink-black); white-space:nowrap;">${escapeHtml(worstInfo.name)}</strong>
            <span style="font-size:11.5px; color:var(--ink-muted); margin-top:4px; white-space:nowrap;">궁합 시트 보기 →</span>
          </div>
        </div>

        <div style="margin-top:16px; padding-top:14px; border-top:1px solid var(--excel-cell-border);">
          <label for="quickPartnerSelect" style="font-size:12.5px; font-weight:800; display:block; margin-bottom:8px;">
            옆자리 동료의 유형을 직접 골라서 궁합 계산하기
          </label>
          <div style="display:flex; gap:8px;">
            <select id="quickPartnerSelect" class="text-input" style="min-height:42px; padding:6px 12px; font-size:13.5px; flex:1;">
              ${Object.values(window.MKBIZ_DATA.types)
                .map(
                  (t) =>
                    `<option value="${t.code}" ${t.code === bestInfo.code ? "selected" : ""}>${t.name} (${t.animal || ""})</option>`
                )
                .join("")}
            </select>
            <button type="button" class="btn btn-primary btn-sm" id="btnQuickCompareGo" style="min-height:42px;">
              비교하기
            </button>
          </div>
        </div>
      </section>

      <!-- 5. 유형별 매경비즈 추천 콘텐츠 -->
      <section class="editorial-card">
        <div class="section-header-bar">
          <span class="section-num-tag">CURATION</span>
          <h2 class="section-title">${escapeHtml(typeInfo.name)}에게 추천하는 아티클</h2>
        </div>
        <div class="detail-list">
          ${(typeInfo.recommendedArticles || [])
            .map(
              (art) => `
            <div class="detail-item" style="display:flex; flex-direction:column; gap:4px;">
              <span style="font-size:11px; font-weight:800; color:var(--excel-green);">${escapeHtml(art.dept)}</span>
              <span style="font-size:14px; font-weight:700; color:var(--ink-black);">${escapeHtml(art.title)}</span>
            </div>
          `
            )
            .join("")}
        </div>
      </section>

      <!-- 6. AX TF 한 줄 만족도 설문 -->
      <section class="editorial-card" id="surveySection">
        <div class="section-header-bar">
          <span class="section-num-tag">FEEDBACK</span>
          <h2 class="section-title">이번 테스트는 어떠셨나요?</h2>
        </div>
        ${
          state.surveySubmitted
            ? `<p style="text-align:center; font-weight:700; color:var(--excel-green); padding:8px 0;">
                 의견을 보내주셔서 감사합니다. 다음 AX TF 콘텐츠 기획에 반영하겠습니다.
               </p>`
            : `
          <p style="font-size:12.5px; color:var(--ink-muted); text-align:center;">
            익명으로 집계되며 매경비즈 AX TF의 후속 프로젝트 기획에 활용됩니다.
          </p>
          <div class="star-rating-row" role="radiogroup" aria-label="만족도 5점 척도">
            ${[1, 2, 3, 4, 5]
              .map(
                (num) => `
              <button type="button" class="star-btn ${state.surveyRating === num ? "active" : ""}" data-rating="${num}">
                ${num}점
              </button>
            `
              )
              .join("")}
          </div>
          <label style="display:flex; align-items:center; justify-content:center; gap:8px; font-size:13px; font-weight:600; margin:12px 0; cursor:pointer;">
            <input type="checkbox" id="chkNextAxContent" ${state.surveyNextInterest ? "checked" : ""} style="width:16px; height:16px; accent-color:var(--excel-green);" />
            <span>다음 AX TF 사내 콘텐츠도 참여해보고 싶습니다</span>
          </label>
          <button type="button" class="btn btn-subtle btn-sm" id="btnSubmitSurvey" style="width:100%;">
            익명 의견 제출하기
          </button>
        `
        }
      </section>

      <!-- 7. 전체 16유형 둘러보기 & 다시 하기 -->
      <div class="action-grid-2col">
        <button type="button" class="btn btn-secondary" id="btnOpenAllTypes">
          전체 16유형 시트 보기 (${getCollectedTypes().length}/16)
        </button>
        <button type="button" class="btn btn-subtle" id="btnRestartTest">
          테스트 다시 하기
        </button>
      </div>
    `;

    const bestCanvas = document.getElementById("bestMatchCanvas");
    const worstCanvas = document.getElementById("worstMatchCanvas");
    if (bestCanvas) {
      window.MKBIZ_PIXEL.renderPixelCharacter(bestCanvas, { typeCode: bestInfo.code, frame: 0, size: 220 });
    }
    if (worstCanvas) {
      window.MKBIZ_PIXEL.renderPixelCharacter(worstCanvas, { typeCode: worstInfo.code, frame: 0, size: 220 });
    }

    startPixelAnimation((frame) => {
      const mainCanvas = document.getElementById("resultPixelCanvas");
      if (mainCanvas) {
        window.MKBIZ_PIXEL.renderPixelCharacter(mainCanvas, {
          typeCode,
          frame,
          size: 440
        });
      }
    });

    document.getElementById("btnGoToInvitedPair")?.addEventListener("click", () => {
      state.pairPartnerType = state.inviterType;
      state.pairPartnerName = state.inviterName || "초대한 동료";
      window.MKBIZ_ANALYTICS.trackEvent("pair_view", {
        my_type: typeCode,
        partner_type: state.pairPartnerType,
        score: calculateCompatibility(typeCode, state.pairPartnerType).score,
        source: "invite_complete"
      });
      renderScreen("pair");
    });

    document.getElementById("btnDownload1x1")?.addEventListener("click", () => {
      const cvs = window.MKBIZ_EXPORTER.renderResultCardCanvas(state, "1x1");
      const filename = `mkbiz_${typeCode}_1x1.png`;
      window.MKBIZ_ANALYTICS.trackEvent("card_download", { ratio: "1x1", card_type: "single", type_code: typeCode });
      window.MKBIZ_EXPORTER.downloadCanvasAsPng(cvs, filename, openImageSaveFallbackModal);
      showToast("1:1 사원증 이미지를 저장했습니다.");
    });

    document.getElementById("btnDownload9x16")?.addEventListener("click", () => {
      const cvs = window.MKBIZ_EXPORTER.renderResultCardCanvas(state, "9x16");
      const filename = `mkbiz_${typeCode}_9x16.png`;
      window.MKBIZ_ANALYTICS.trackEvent("card_download", { ratio: "9x16", card_type: "single", type_code: typeCode });
      window.MKBIZ_EXPORTER.downloadCanvasAsPng(cvs, filename, openImageSaveFallbackModal);
      showToast("9:16 스토리용 이미지를 저장했습니다.");
    });

    document.getElementById("btnCreateInviteLink")?.addEventListener("click", () => {
      window.MKBIZ_ANALYTICS.trackEvent("invite_create", { inviter_type: typeCode });
      window.MKBIZ_ANALYTICS.trackEvent("share_click", { channel: "invite_link" });
      copyTextToClipboard(
        inviteUrl,
        "동료 궁합 초대 링크가 복사되었습니다. 메신저에 붙여넣어 보세요."
      );
    });

    document.getElementById("btnWebShareSheet")?.addEventListener("click", async () => {
      window.MKBIZ_ANALYTICS.trackEvent("share_click", { channel: "sheet" });
      const cvs = window.MKBIZ_EXPORTER.renderResultCardCanvas(state, "1x1");
      const filename = `mkbiz_${typeCode}_1x1.png`;
      const res = await window.MKBIZ_EXPORTER.shareCardViaWebShare(
        cvs,
        filename,
        `[매경비즈] ${state.nickname}님의 직장 성향은 '${typeInfo.name}'`,
        "우리 업무 궁합 몇 점인지 맞춰봐요!",
        inviteUrl
      );
      if (!res.shared && res.reason !== "aborted") {
        copyTextToClipboard(inviteUrl, "초대 링크를 클립보드에 복사했습니다.");
      }
    });

    document.getElementById("btnCopyBasicLink")?.addEventListener("click", () => {
      window.MKBIZ_ANALYTICS.trackEvent("share_click", { channel: "link" });
      const cleanUrl = buildShareResultUrl(typeCode);
      copyTextToClipboard(cleanUrl, "결과 링크가 클립보드에 복사되었습니다.");
    });

    stage.querySelectorAll("[data-tone]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.shareTone = btn.getAttribute("data-tone") || "casual";
        renderResultScreen(stage);
      });
    });

    document.getElementById("btnCopyGroupChatMsg")?.addEventListener("click", () => {
      window.MKBIZ_ANALYTICS.trackEvent("invite_create", { inviter_type: typeCode });
      window.MKBIZ_ANALYTICS.trackEvent("share_click", { channel: "messenger" });
      const msg = getGroupChatCopyText(typeInfo, bestInfo, inviteUrl, state.shareTone);
      copyTextToClipboard(msg, "단체방 공유 메시지와 초대 링크가 복사되었습니다.");
    });

    document.getElementById("cardBestMatch")?.addEventListener("click", () => {
      addCollectedType(bestInfo.code);
      state.pairPartnerType = bestInfo.code;
      state.pairPartnerName = bestInfo.name;
      window.MKBIZ_ANALYTICS.trackEvent("pair_view", {
        my_type: typeCode,
        partner_type: bestInfo.code,
        score: 100,
        source: "best_card_click"
      });
      renderScreen("pair");
    });

    document.getElementById("cardWorstMatch")?.addEventListener("click", () => {
      addCollectedType(worstInfo.code);
      state.pairPartnerType = worstInfo.code;
      state.pairPartnerName = worstInfo.name;
      window.MKBIZ_ANALYTICS.trackEvent("pair_view", {
        my_type: typeCode,
        partner_type: worstInfo.code,
        score: 0,
        source: "worst_card_click"
      });
      renderScreen("pair");
    });

    document.getElementById("btnQuickCompareGo")?.addEventListener("click", () => {
      const sel = document.getElementById("quickPartnerSelect");
      const partnerCode = sel ? sel.value : bestInfo.code;
      addCollectedType(partnerCode);
      state.pairPartnerType = partnerCode;
      state.pairPartnerName = `${window.MKBIZ_DATA.types[partnerCode].name} 동료`;
      const calc = calculateCompatibility(typeCode, partnerCode);
      window.MKBIZ_ANALYTICS.trackEvent("pair_view", {
        my_type: typeCode,
        partner_type: partnerCode,
        score: calc.score,
        source: "quick_selector"
      });
      renderScreen("pair");
    });

    stage.querySelectorAll("[data-rating]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.surveyRating = Number(btn.getAttribute("data-rating") || 5);
        stage.querySelectorAll("[data-rating]").forEach((b) => {
          const r = Number(b.getAttribute("data-rating"));
          b.classList.toggle("active", r === state.surveyRating);
        });
      });
    });

    document.getElementById("btnSubmitSurvey")?.addEventListener("click", () => {
      const chk = document.getElementById("chkNextAxContent");
      state.surveyNextInterest = chk ? chk.checked : true;
      state.surveySubmitted = true;
      window.MKBIZ_ANALYTICS.trackEvent("survey_submit", {
        rating: state.surveyRating,
        next_ax_interest: state.surveyNextInterest
      });
      showToast("익명 만족도 의견이 제출되었습니다.");
      renderResultScreen(stage);
    });

    document.getElementById("btnOpenAllTypes")?.addEventListener("click", () => {
      openDexAndMatcherModal();
    });

    document.getElementById("btnRestartTest")?.addEventListener("click", () => {
      state.currentQuestionIndex = 0;
      state.answers = {};
      state.optionOrders = {};
      state.surveySubmitted = false;
      clearQuizProgress();
      renderScreen("cover");
    });
  }

  /**
   * [화면 5] 두 사람 궁합 비교 상세 화면
   */
  function renderPairScreen(stage) {
    const myCode = state.resultType || "SDLC";
    const partnerCode = state.pairPartnerType || state.inviterType || window.MKBIZ_DATA.types[myCode].bestMatch;
    addCollectedType(myCode);
    addCollectedType(partnerCode);

    const pairData = calculateCompatibility(
      myCode,
      partnerCode,
      state.nickname || "나",
      state.pairPartnerName || state.inviterName || "동료"
    );

    updateExcelFormulaBar(
      "VLOOKUP",
      `=MATCH("${pairData.myType.name}", "${pairData.partnerType.name}", "궁합점수: ${pairData.score}점")`,
      "result"
    );

    stage.innerHTML = `
      <div class="quiz-topbar">
        <button type="button" class="back-step-btn" id="btnBackToMyResult">
          ← 내 사원증 시트로 돌아가기
        </button>
        <span class="quiz-counter">동료 궁합 리포트</span>
      </div>

      <article class="id-card-frame" aria-label="두 사람 궁합 결과 카드">
        <div class="id-card-topbar">
          <div class="id-card-topbar-left">
            <span>매경비즈</span>
            <span style="opacity:0.4;">|</span>
            <span>동료 업무 궁합 시트</span>
          </div>
          <span class="id-card-code-pill">${pairData.score}점</span>
        </div>

        <div class="id-card-body">
          <span class="stamp-pill accent" style="font-size:12px; padding:4px 12px; margin-bottom:10px;">
            ${escapeHtml(pairData.gradeInfo.badge)}
          </span>
          <h1 style="font-size:20px; font-weight:800; text-align:center; line-height:1.42; margin-bottom:20px; word-break:keep-all;">
            ${escapeHtml(pairData.gradeInfo.title)}
          </h1>

          <!-- 두 사람 동물 캐릭터 나란히 배치 -->
          <div style="display:grid; grid-template-columns:1fr auto 1fr; align-items:center; gap:10px; width:100%; margin-bottom:18px;">
            <div style="display:flex; flex-direction:column; align-items:center; text-align:center;">
              <div style="border:1.5px solid var(--excel-cell-border); border-radius:6px; overflow:hidden; background:#F9FBF9;">
                <canvas id="pairMyCanvas" class="pixel-canvas" width="192" height="192" style="width:96px; height:96px;"></canvas>
              </div>
              <span style="font-size:11.5px; color:var(--excel-green); font-weight:700; margin-top:6px;">${escapeHtml(pairData.myType.animal || "")}</span>
              <strong style="font-size:14.5px; color:var(--ink-black); white-space:nowrap; margin-top:1px;">${escapeHtml(pairData.myType.name)}</strong>
              <span style="font-size:11.5px; color:var(--ink-muted); white-space:nowrap;">${escapeHtml(pairData.myName)}</span>
            </div>

            <div style="display:flex; flex-direction:column; align-items:center;">
              <div style="background:var(--excel-green-soft); border:1.5px solid var(--excel-green); border-radius:4px; padding:10px 12px; text-align:center; white-space:nowrap;">
                <div style="font-size:22px; font-weight:900; color:var(--excel-green);">${pairData.score}점</div>
                <div style="font-size:10.5px; font-weight:700; color:var(--ink-muted);">업무 시너지</div>
              </div>
            </div>

            <div style="display:flex; flex-direction:column; align-items:center; text-align:center;">
              <div style="border:1.5px solid var(--excel-cell-border); border-radius:6px; overflow:hidden; background:#F9FBF9;">
                <canvas id="pairPartnerCanvas" class="pixel-canvas" width="192" height="192" style="width:96px; height:96px;"></canvas>
              </div>
              <span style="font-size:11.5px; color:var(--excel-green); font-weight:700; margin-top:6px;">${escapeHtml(pairData.partnerType.animal || "")}</span>
              <strong style="font-size:14.5px; color:var(--ink-black); white-space:nowrap; margin-top:1px;">${escapeHtml(pairData.partnerType.name)}</strong>
              <span style="font-size:11.5px; color:var(--ink-muted); white-space:nowrap;">${escapeHtml(pairData.partnerName)}</span>
            </div>
          </div>

          <!-- 다른 동료 유형으로 즉시 바꿔보기 스위치 -->
          <div style="width:100%; background:var(--bg-paper); border:1px solid var(--excel-cell-border); border-radius:4px; padding:10px 12px; margin-bottom:16px; display:flex; align-items:center; justify-content:space-between; gap:10px;">
            <span style="font-size:12.5px; font-weight:800; white-space:nowrap;">비교 대상 변경</span>
            <select id="pairSwitchPartnerSelect" class="text-input" style="min-height:38px; padding:4px 8px; font-size:13px; width:auto; flex:1;">
              ${Object.values(window.MKBIZ_DATA.types)
                .map(
                  (t) =>
                    `<option value="${t.code}" ${t.code === partnerCode ? "selected" : ""}>${t.name} (${t.animal || ""})</option>`
                )
                .join("")}
            </select>
          </div>

          <div class="id-card-summary-banner" style="text-align:left; font-weight:500; font-size:13.5px; text-wrap:pretty;">
            <strong style="display:block; margin-bottom:4px; font-size:14px; font-weight:800; color:var(--excel-green-dark);">궁합 총평</strong>
            ${escapeHtml(pairData.gradeInfo.detail)}
          </div>

          <!-- 4축 일치·보완 분석 -->
          <div style="width:100%; display:flex; flex-direction:column; gap:8px; margin-bottom:18px;">
            <h2 style="font-size:14.5px; font-weight:800; margin-bottom:4px;">네 가지 업무 스타일 비교표</h2>
            ${pairData.axisComparisons
              .map(
                (ac) => `
              <div class="detail-item" style="background:${ac.isGood ? "var(--excel-green-soft)" : "#FFFFFF"};">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; gap:8px;">
                  <strong style="font-size:13.5px; white-space:nowrap;">${ac.axisName} · ${ac.myCode} × ${ac.partnerCode}</strong>
                  <span class="stamp-pill" style="font-size:11px; padding:2px 8px; background:${ac.isGood ? "var(--excel-green)" : "var(--ink-muted)"}; color:#fff; border:none;">${ac.tagText}</span>
                </div>
                <p style="font-size:13px; color:var(--ink-body);">${escapeHtml(ac.desc)}</p>
              </div>
            `
              )
              .join("")}
          </div>

          <!-- 서로에게 건네는 실전 협업 팁 -->
          <div style="width:100%; display:flex; flex-direction:column; gap:8px;">
            <h2 style="font-size:14.5px; font-weight:800; margin-bottom:4px;">서로에게 건네는 협업 가이드</h2>
            <div class="detail-item" style="background:var(--bg-paper);">
              <span class="detail-item-badge" style="background:var(--ink-black); color:#fff;">${escapeHtml(pairData.myType.name)}님과 일할 때</span>
              <p>${escapeHtml(pairData.myType.colleagueTip)}</p>
            </div>
            <div class="detail-item" style="background:var(--bg-paper);">
              <span class="detail-item-badge" style="background:var(--excel-green); color:#fff;">${escapeHtml(pairData.partnerType.name)}님과 일할 때</span>
              <p>${escapeHtml(pairData.partnerType.colleagueTip)}</p>
            </div>
          </div>
        </div>
      </article>

      <section class="editorial-card">
        <button type="button" class="btn btn-primary" id="btnDownloadPairCard" style="margin-bottom:10px;">
          두 사람 궁합 카드 이미지 저장 (1:1 PNG)
        </button>
        <button type="button" class="btn btn-secondary" id="btnReplyToInviter">
          동료에게 우리 궁합 결과 링크 복사하기
        </button>
      </section>
    `;

    startPixelAnimation((frame) => {
      const c1 = document.getElementById("pairMyCanvas");
      const c2 = document.getElementById("pairPartnerCanvas");
      if (c1) {
        window.MKBIZ_PIXEL.renderPixelCharacter(c1, {
          typeCode: pairData.myType.code,
          frame,
          size: 220
        });
      }
      if (c2) {
        window.MKBIZ_PIXEL.renderPixelCharacter(c2, {
          typeCode: pairData.partnerType.code,
          frame: frame === 0 ? 1 : 0,
          size: 220
        });
      }
    });

    document.getElementById("btnBackToMyResult")?.addEventListener("click", () => {
      renderScreen("result");
    });

    document.getElementById("pairSwitchPartnerSelect")?.addEventListener("change", (e) => {
      const newCode = e.target.value;
      if (newCode && window.MKBIZ_DATA.types[newCode]) {
        state.pairPartnerType = newCode;
        state.pairPartnerName = `${window.MKBIZ_DATA.types[newCode].name} 동료`;
        renderPairScreen(stage);
      }
    });

    document.getElementById("btnDownloadPairCard")?.addEventListener("click", () => {
      const cvs = window.MKBIZ_EXPORTER.renderPairCardCanvas(pairData);
      const filename = `mkbiz_pair_${pairData.myType.code}_${pairData.partnerType.code}_1x1.png`;
      window.MKBIZ_ANALYTICS.trackEvent("card_download", {
        ratio: "1x1",
        card_type: "pair",
        my_type: pairData.myType.code,
        partner_type: pairData.partnerType.code
      });
      window.MKBIZ_EXPORTER.downloadCanvasAsPng(cvs, filename, openImageSaveFallbackModal);
      showToast("두 사람 궁합 카드 이미지를 저장했습니다.");
    });

    document.getElementById("btnReplyToInviter")?.addEventListener("click", () => {
      const replyUrl = `${window.location.origin}${window.location.pathname}?inviter=${encodeURIComponent(
        pairData.myType.code
      )}&name=${encodeURIComponent(pairData.myName)}&partner=${encodeURIComponent(pairData.partnerType.code)}`;
      const msg = `[매경비즈 직장인 성향 궁합]\n${pairData.myName}(${pairData.myType.name}) × ${pairData.partnerName}(${pairData.partnerType.name}) 우리의 업무 궁합은 [${pairData.score}점 · ${
        pairData.gradeInfo.badge.split("·")[1].trim()
      }]입니다.\n${replyUrl}`;
      window.MKBIZ_ANALYTICS.trackEvent("share_click", { channel: "pair_reply" });
      copyTextToClipboard(msg, "동료에게 보낼 궁합 결과 메시지와 링크가 복사되었습니다.");
    });
  }

  async function copyTextToClipboard(text, successMsg) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        showToast(successMsg || "복사되었습니다.");
        return;
      }
    } catch (e) {
      // fallback below
    }

    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      showToast(successMsg || "복사되었습니다.");
    } catch (err) {
      openCopyFallbackModal(text);
    }
  }

  function openImageSaveFallbackModal(dataUrl, filename) {
    const modalContainer = document.getElementById("modalContainer");
    if (!modalContainer) return;

    modalContainer.innerHTML = `
      <div class="modal-backdrop" id="fallbackModalBackdrop">
        <div class="modal-sheet" role="dialog" aria-modal="true" aria-label="이미지 저장 안내">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <span class="stamp-pill accent">이미지 저장 안내</span>
            <button type="button" class="masthead-btn" id="btnCloseFallbackModal">닫기</button>
          </div>
          <p style="font-size:14px; font-weight:700; margin-bottom:12px;">
            인앱 브라우저에서는 아래 이미지를 길게 눌러 [사진에 저장]을 선택해 주세요.
          </p>
          <img src="${dataUrl}" alt="${escapeHtml(filename)}" style="width:100%; border:1px solid var(--excel-cell-border); border-radius:4px;" />
        </div>
      </div>
    `;

    document.getElementById("btnCloseFallbackModal")?.addEventListener("click", closeModal);
    document.getElementById("fallbackModalBackdrop")?.addEventListener("click", (e) => {
      if (e.target.id === "fallbackModalBackdrop") closeModal();
    });
  }

  function openCopyFallbackModal(text) {
    const modalContainer = document.getElementById("modalContainer");
    if (!modalContainer) return;
    modalContainer.innerHTML = `
      <div class="modal-backdrop" id="copyModalBackdrop">
        <div class="modal-sheet" role="dialog" aria-modal="true" aria-label="링크 복사">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <span class="stamp-pill accent">링크 복사</span>
            <button type="button" class="masthead-btn" id="btnCloseCopyModal">닫기</button>
          </div>
          <p style="font-size:13.5px; font-weight:600; margin-bottom:8px;">아래 텍스트를 선택하여 복사해 주세요.</p>
          <textarea class="text-input" style="height:110px; font-size:13px;" readonly>${escapeHtml(text)}</textarea>
        </div>
      </div>
    `;
    document.getElementById("btnCloseCopyModal")?.addEventListener("click", closeModal);
  }

  function openTypeDetailModal(typeCode) {
    const t = window.MKBIZ_DATA.types[typeCode];
    if (!t) return;
    addCollectedType(typeCode);

    const modalContainer = document.getElementById("modalContainer");
    if (!modalContainer) return;

    modalContainer.innerHTML = `
      <div class="modal-backdrop" id="typeModalBackdrop">
        <div class="modal-sheet" role="dialog" aria-modal="true" aria-label="${escapeHtml(t.name)} 유형 상세">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
            <span class="stamp-pill accent">직장인 16유형 시트 · ${escapeHtml(t.animal || "")}</span>
            <button type="button" class="masthead-btn" id="btnCloseTypeModal">닫기</button>
          </div>

          <div style="display:flex; align-items:center; gap:14px; margin-bottom:14px;">
            <div style="border:1.5px solid var(--excel-cell-border); border-radius:6px; overflow:hidden; background:#F9FBF9; flex-shrink:0;">
              <canvas id="modalTypeCanvas" class="pixel-canvas" width="192" height="192" style="width:92px; height:92px;"></canvas>
            </div>
            <div>
              <h3 style="font-size:20px; font-weight:900; letter-spacing:-0.03em;">${escapeHtml(t.name)}</h3>
              <p style="font-size:12px; font-weight:700; color:var(--excel-green); margin-top:2px;">${escapeHtml(t.animal || "")} · ${escapeHtml(t.outfitLabel || "")}</p>
              <p style="font-size:12.5px; color:var(--ink-muted); margin-top:4px;">${escapeHtml(t.subtitle)}</p>
            </div>
          </div>

          <div class="quote-bubble" style="font-size:13.5px; margin-bottom:12px;">
            ${escapeHtml(t.catchphrase)}
          </div>

          <div class="detail-list" style="margin-bottom:16px;">
            <div class="detail-item"><strong>강점 1</strong> — ${escapeHtml(t.strengths[0])}</div>
            <div class="detail-item"><strong>강점 2</strong> — ${escapeHtml(t.strengths[1])}</div>
            <div class="detail-item"><strong>주의할 점</strong> — ${escapeHtml(t.caution)}</div>
            <div class="detail-item"><strong>협업 팁</strong> — ${escapeHtml(t.colleagueTip)}</div>
          </div>

          <div class="action-grid-2col">
            <button type="button" class="btn btn-primary btn-sm" id="btnModalCompareWithMe">
              내 유형과 궁합 비교
            </button>
            <button type="button" class="btn btn-subtle btn-sm" id="btnBackToDexList">
              전체 16유형 목록
            </button>
          </div>
        </div>
      </div>
    `;

    const cvs = document.getElementById("modalTypeCanvas");
    if (cvs) {
      window.MKBIZ_PIXEL.renderPixelCharacter(cvs, { typeCode: t.code, frame: 0, size: 220 });
    }

    document.getElementById("btnCloseTypeModal")?.addEventListener("click", closeModal);
    document.getElementById("typeModalBackdrop")?.addEventListener("click", (e) => {
      if (e.target.id === "typeModalBackdrop") closeModal();
    });
    document.getElementById("btnBackToDexList")?.addEventListener("click", () => {
      openDexAndMatcherModal();
    });
    document.getElementById("btnModalCompareWithMe")?.addEventListener("click", () => {
      closeModal();
      if (!state.resultType) {
        const last = loadLastResult();
        state.resultType = (last && last.resultType) || "SDLC";
        state.nickname = (last && last.nickname) || "나";
      }
      state.pairPartnerType = t.code;
      state.pairPartnerName = `${t.name} 동료`;
      renderScreen("pair");
    });
  }

  function openDexAndMatcherModal() {
    const modalContainer = document.getElementById("modalContainer");
    if (!modalContainer) return;

    const collected = getCollectedTypes();
    const allTypes = Object.values(window.MKBIZ_DATA.types);
    const defaultMy = state.resultType || (loadLastResult() && loadLastResult().resultType) || "SDLC";
    const defaultPartner = window.MKBIZ_DATA.types[defaultMy].bestMatch;

    modalContainer.innerHTML = `
      <div class="modal-backdrop" id="dexModalBackdrop">
        <div class="modal-sheet" role="dialog" aria-modal="true" aria-label="직장인 16유형 시트 및 궁합 계산기">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <span class="stamp-pill accent">직장인 16유형 데이터베이스 (${collected.length}/16)</span>
            <button type="button" class="masthead-btn" id="btnCloseDexModal">닫기</button>
          </div>

          <div style="background:var(--bg-paper); border:1px solid var(--excel-cell-border); border-radius:4px; padding:12px; margin-bottom:16px;">
            <div style="font-size:13px; font-weight:800; margin-bottom:8px;">=VLOOKUP 두 유형 즉석 궁합 계산기</div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:10px;">
              <select id="dexSelectA" class="text-input" style="min-height:38px; padding:4px 8px; font-size:12.5px;">
                ${allTypes.map((t) => `<option value="${t.code}" ${t.code === defaultMy ? "selected" : ""}>나: ${t.name} (${t.animal || ""})</option>`).join("")}
              </select>
              <select id="dexSelectB" class="text-input" style="min-height:38px; padding:4px 8px; font-size:12.5px;">
                ${allTypes.map((t) => `<option value="${t.code}" ${t.code === defaultPartner ? "selected" : ""}>동료: ${t.name} (${t.animal || ""})</option>`).join("")}
              </select>
            </div>
            <button type="button" class="btn btn-primary btn-sm" id="btnDexRunCompare" style="width:100%;">
              선택한 두 유형 궁합 보기
            </button>
          </div>

          <p style="font-size:12px; color:var(--ink-muted); margin-bottom:10px;">
            각 셀을 누르면 유형별 동물 캐릭터, 오피스 착장, 강점과 협업 가이드를 볼 수 있습니다.
          </p>

          <div class="type-grid-16">
            ${allTypes
              .map((t) => {
                const isCollected = collected.includes(t.code);
                return `
                <button type="button" class="type-dex-cell ${isCollected ? "collected" : ""}" data-dex-code="${t.code}">
                  <canvas id="dexChar_${t.code}" class="pixel-canvas" width="120" height="120"></canvas>
                  <span style="font-size:10px; color:var(--excel-green); font-weight:700; margin-top:4px;">${escapeHtml(t.animal || "")}</span>
                  <span class="type-dex-name">${escapeHtml(t.name)}</span>
                </button>
              `;
              })
              .join("")}
          </div>
        </div>
      </div>
    `;

    allTypes.forEach((t) => {
      const c = document.getElementById(`dexChar_${t.code}`);
      if (c) {
        window.MKBIZ_PIXEL.renderPixelCharacter(c, { typeCode: t.code, frame: 0, size: 120 });
      }
    });

    document.getElementById("btnCloseDexModal")?.addEventListener("click", closeModal);
    document.getElementById("dexModalBackdrop")?.addEventListener("click", (e) => {
      if (e.target.id === "dexModalBackdrop") closeModal();
    });

    modalContainer.querySelectorAll("[data-dex-code]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const code = btn.getAttribute("data-dex-code");
        if (code) openTypeDetailModal(code);
      });
    });

    document.getElementById("btnDexRunCompare")?.addEventListener("click", () => {
      const codeA = document.getElementById("dexSelectA")?.value || "SDLC";
      const codeB = document.getElementById("dexSelectB")?.value || "SDHR";
      closeModal();
      state.resultType = codeA;
      if (!state.nickname) state.nickname = `${window.MKBIZ_DATA.types[codeA].name}`;
      state.pairPartnerType = codeB;
      state.pairPartnerName = `${window.MKBIZ_DATA.types[codeB].name} 동료`;
      window.MKBIZ_ANALYTICS.trackEvent("pair_view", {
        my_type: codeA,
        partner_type: codeB,
        score: calculateCompatibility(codeA, codeB).score,
        source: "dex_calculator"
      });
      renderScreen("pair");
    });
  }

  function openAxTfDashboardModal() {
    const modalContainer = document.getElementById("modalContainer");
    if (!modalContainer) return;

    const stats = window.MKBIZ_ANALYTICS.getAggregateStats();
    const logs = window.MKBIZ_ANALYTICS.getRecentLogs();

    const pct = (num, den) => (den > 0 ? Math.round((num / den) * 1000) / 10 : 0);
    const participationRate = pct(stats.testComplete, stats.totalOrgMembers);
    const completionRate = pct(stats.testComplete, stats.testStart);
    const saveShareRate = pct(stats.cardDownloadOrShareUsers, stats.testComplete);
    const inviteSendRate = pct(stats.inviteCreateUsers, stats.testComplete);
    const inviteConvRate = pct(stats.inviteConvertedCount, stats.inviteOpenCount);
    const avgSatisfaction =
      stats.surveyCount > 0 ? (stats.surveyScoreSum / stats.surveyCount).toFixed(2) : "0.00";
    const nextInterestRate = pct(stats.surveyNextAgreeCount, stats.surveyCount);

    modalContainer.innerHTML = `
      <div class="modal-backdrop" id="axDashboardBackdrop">
        <div class="modal-sheet" style="max-width:460px;" role="dialog" aria-modal="true" aria-label="AX TF 익명 KPI 대시보드">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <span class="stamp-pill accent">AX TF 익명 참여 지표 (.xlsx)</span>
            <button type="button" class="masthead-btn" id="btnCloseAxModal">닫기</button>
          </div>

          <p style="font-size:12px; color:var(--ink-muted); margin-bottom:14px;">
            실명·닉네임·소속 부서를 수집하지 않으며, 표본이 5명 미만인 유형 집계는 개인 식별 방지를 위해 마스킹(&lt;5) 처리됩니다.
          </p>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:14px;">
            <div class="detail-item">
              <div style="font-size:11px; color:var(--ink-muted);">1. 전사 참여율 (목표 40%)</div>
              <div style="font-size:18px; font-weight:800; color:var(--excel-green);">${participationRate}% <span style="font-size:11px; font-weight:500; color:var(--ink-muted);">(${stats.testComplete}/${stats.totalOrgMembers})</span></div>
            </div>
            <div class="detail-item">
              <div style="font-size:11px; color:var(--ink-muted);">2. 테스트 완주율 (목표 80%)</div>
              <div style="font-size:18px; font-weight:800; color:var(--excel-green);">${completionRate}% <span style="font-size:11px; font-weight:500; color:var(--ink-muted);">(${stats.testComplete}/${stats.testStart})</span></div>
            </div>
            <div class="detail-item">
              <div style="font-size:11px; color:var(--ink-muted);">3. 저장·공유율 (목표 35%)</div>
              <div style="font-size:18px; font-weight:800;">${saveShareRate}%</div>
            </div>
            <div class="detail-item">
              <div style="font-size:11px; color:var(--ink-muted);">4. 초대 발송률 (목표 20%)</div>
              <div style="font-size:18px; font-weight:800;">${inviteSendRate}%</div>
            </div>
            <div class="detail-item">
              <div style="font-size:11px; color:var(--ink-muted);">5. 초대 전환율 (목표 50%)</div>
              <div style="font-size:18px; font-weight:800;">${inviteConvRate}%</div>
            </div>
            <div class="detail-item">
              <div style="font-size:11px; color:var(--ink-muted);">6·7. 만족도 / 후속관심</div>
              <div style="font-size:16px; font-weight:800; color:var(--ink-black);">${avgSatisfaction}점 / ${nextInterestRate}%</div>
            </div>
          </div>

          <div style="background:var(--bg-paper); border:1px solid var(--excel-cell-border); border-radius:4px; padding:12px; margin-bottom:14px;">
            <div style="font-size:12px; font-weight:800; margin-bottom:8px;">16유형 익명 분포 (5명 미만 표본 보호)</div>
            <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:6px; font-size:11.5px;">
              ${Object.entries(stats.typeCounts)
                .map(([code, cnt]) => {
                  const masked = cnt < 5;
                  const tName = window.MKBIZ_DATA.types[code]?.name || code;
                  return `
                  <div style="border:1px solid var(--excel-cell-border); border-radius:3px; padding:5px 4px; text-align:center; background:#FFFFFF;">
                    <div style="font-weight:700; font-size:10.5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${tName}</div>
                    <div style="color:${masked ? "var(--ink-faint)" : "var(--ink-black)"}; font-weight:600; font-size:11px;">${masked ? "< 5명" : cnt + "명"}</div>
                  </div>
                `;
                })
                .join("")}
            </div>
          </div>

          <div style="background:#141E18; color:#E4E4E7; border-radius:4px; padding:12px; font-size:11px; max-height:140px; overflow-y:auto;">
            <div style="color:#A7D4B8; font-weight:700; margin-bottom:6px;">익명 이벤트 수집 로그 (최근 ${logs.length}건, 식별정보 미포함)</div>
            ${logs
              .slice(0, 12)
              .map(
                (l) =>
                  `<div style="margin-bottom:4px; border-bottom:1px solid #27382D; padding-bottom:3px;">
                    <span style="color:#4ADE80; font-weight:700;">[${l.event}]</span> ${escapeHtml(JSON.stringify(l.properties))}
                  </div>`
              )
              .join("")}
          </div>
        </div>
      </div>
    `;

    document.getElementById("btnCloseAxModal")?.addEventListener("click", closeModal);
    document.getElementById("axDashboardBackdrop")?.addEventListener("click", (e) => {
      if (e.target.id === "axDashboardBackdrop") closeModal();
    });
  }

  function closeModal() {
    const modalContainer = document.getElementById("modalContainer");
    if (modalContainer) modalContainer.innerHTML = "";
  }

  function initApp() {
    updateDexBadgeCount();

    const params = new URLSearchParams(window.location.search);
    const inviterParam = params.get("inviter");
    const nameParam = params.get("name");
    const partnerParam = params.get("partner");
    const resultShareParam = params.get("r");

    if (inviterParam) {
      const upper = inviterParam.toUpperCase();
      if (window.MKBIZ_DATA.types[upper]) {
        state.inviterType = upper;
        state.inviterName = (nameParam || "동료").slice(0, 10);
        addCollectedType(upper);

        window.MKBIZ_ANALYTICS.trackEvent("page_view_start", { source: "invite" });
        window.MKBIZ_ANALYTICS.trackEvent("invite_open", { inviter_type: upper });

        if (partnerParam && window.MKBIZ_DATA.types[partnerParam.toUpperCase()]) {
          const pUpper = partnerParam.toUpperCase();
          state.resultType = pUpper;
          state.nickname = "나";
          state.pairPartnerType = upper;
          state.pairPartnerName = state.inviterName;
          renderScreen("pair");
          return;
        }
      } else {
        window.history.replaceState({}, document.title, window.location.pathname);
        window.MKBIZ_ANALYTICS.trackEvent("page_view_start", { source: "direct_invalid_param" });
        setTimeout(() => {
          showToast("유효하지 않은 링크여서 처음 화면으로 이동했습니다.");
        }, 300);
      }
    } else if (resultShareParam) {
      const upperR = resultShareParam.toUpperCase();
      if (window.MKBIZ_DATA.types[upperR]) {
        state.inviterType = upperR;
        state.inviterName = `${window.MKBIZ_DATA.types[upperR].name} 동료`;
        addCollectedType(upperR);
        window.MKBIZ_ANALYTICS.trackEvent("page_view_start", { source: "shared_result" });
      } else {
        window.MKBIZ_ANALYTICS.trackEvent("page_view_start", { source: "direct" });
      }
    } else {
      window.MKBIZ_ANALYTICS.trackEvent("page_view_start", { source: "direct" });
    }

    document.getElementById("brandHomeBtn")?.addEventListener("click", () => {
      renderScreen("cover");
    });
    document.getElementById("openDexHeaderBtn")?.addEventListener("click", () => {
      openDexAndMatcherModal();
    });
    document.getElementById("openAxStatsBtn")?.addEventListener("click", () => {
      openAxTfDashboardModal();
    });

    // 하단 엑셀 시트 탭 바 이벤트 연결
    document.getElementById("tabSheetCover")?.addEventListener("click", () => {
      renderScreen("cover");
    });
    document.getElementById("tabSheetResult")?.addEventListener("click", () => {
      const last = loadLastResult();
      if (state.resultType) {
        renderScreen("result");
      } else if (last && last.resultType) {
        state.nickname = last.nickname;
        state.resultType = last.resultType;
        state.axisScores = last.axisScores;
        renderScreen("result");
      } else {
        showToast("먼저 닉네임을 입력하고 성향 진단을 완료해 주세요.");
      }
    });
    document.getElementById("tabSheetDex")?.addEventListener("click", () => {
      openDexAndMatcherModal();
    });
    document.getElementById("tabSheetStats")?.addEventListener("click", () => {
      openAxTfDashboardModal();
    });

    renderScreen("cover");
  }

  document.addEventListener("DOMContentLoaded", initApp);
})();
