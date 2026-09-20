(function(){
  "use strict";

  const LS = {
    purpose: "res_purpose",
    apiKey: "res_api_key",
    onboarded: "res_onboarded",
    portfolio: "res_portfolio",
    theme: "res_theme"
  };

  const PURPOSE_LABEL = {
    pm: "PM/서비스기획 취업",
    startup: "창업 준비",
    curious: "그냥 관심 있음"
  };

  // ---------- 오늘의 케이스 선택 (날짜 기반 결정론적 선택 — 모두에게 같은 날엔 같은 케이스) ----------
  function dayIndex(){
    return Math.floor(Date.now() / 86400000);
  }
  function getTodayCompany(){
    const idx = dayIndex() % COMPANIES.length;
    return COMPANIES[idx];
  }
  function getTodayCut(company){
    const cutIdx = Math.floor(dayIndex() / COMPANIES.length) % company.cuts.length;
    return company.cuts[cutIdx];
  }

  // ---------- localStorage 헬퍼 ----------
  function getPortfolio(){
    try { return JSON.parse(localStorage.getItem(LS.portfolio) || "[]"); }
    catch(e){ return []; }
  }
  function savePortfolio(list){
    localStorage.setItem(LS.portfolio, JSON.stringify(list));
  }

  // ---------- 테마 (라이트/다크/시스템) ----------
  function applyTheme(){
    const saved = localStorage.getItem(LS.theme) || "system";
    if(saved === "system") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", saved);
  }
  applyTheme();

  // ---------- 웰컴 화면 티저 (온보딩 전에도 오늘의 실제 질문을 미리 보여준다) ----------
  (function renderHeroTeaser(){
    const company = getTodayCompany();
    const cut = getTodayCut(company);
    document.getElementById("hero-cut").textContent = "“" + T(cut) + "”";
    document.getElementById("hero-company").textContent = "— " + T(company.name) + " (" + T(company.category) + ")";
  })();

  // ---------- 온보딩 ----------
  const welcomeScreen = document.getElementById("screen-welcome");
  const apikeyScreen = document.getElementById("screen-apikey");
  const appRoot = document.getElementById("app");

  let selectedPurpose = null;

  document.getElementById("purpose-choices").addEventListener("click", (e)=>{
    const btn = e.target.closest(".choice");
    if(!btn) return;
    document.querySelectorAll("#purpose-choices .choice").forEach(b=>b.classList.remove("selected"));
    btn.classList.add("selected");
    selectedPurpose = btn.dataset.value;
    document.getElementById("btn-welcome-next").disabled = false;
  });

  document.getElementById("btn-welcome-next").addEventListener("click", ()=>{
    if(!selectedPurpose) return;
    localStorage.setItem(LS.purpose, selectedPurpose);
    welcomeScreen.hidden = true;
    apikeyScreen.hidden = false;
  });

  function finishOnboarding(){
    localStorage.setItem(LS.onboarded, "true");
    apikeyScreen.hidden = true;
    initApp();
  }

  document.getElementById("btn-apikey-skip").addEventListener("click", finishOnboarding);
  document.getElementById("btn-apikey-save").addEventListener("click", async ()=>{
    const key = document.getElementById("apikey-input").value.trim();
    const statusEl = document.getElementById("apikey-check-status");
    const btn = document.getElementById("btn-apikey-save");

    if(!key){
      finishOnboarding();
      return;
    }

    btn.disabled = true;
    const original = btn.textContent;
    btn.textContent = T("확인 중...");
    showStatus(statusEl, T("키가 유효한지 확인하고 있어요..."), false);

    try{
      await callGemini(key, T("당신은 연결 테스트 중입니다."), T("'연결 확인'이라고만 답하세요."));
      localStorage.setItem(LS.apiKey, key);
      showStatus(statusEl, T("키가 정상 확인됐어요."), false);
      finishOnboarding();
    }catch(err){
      showStatus(statusEl, T("키를 확인하지 못했어요: {0} — 키를 다시 확인하시거나 '나중에 하기'를 눌러주세요.", err.message), true);
    }finally{
      btn.disabled = false;
      btn.textContent = original;
    }
  });

  // ---------- 탭 전환 ----------
  function switchTab(name){
    document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active", t.dataset.tab === name));
    document.querySelectorAll(".tab-panel").forEach(p=>p.hidden = true);
    document.getElementById("tab-" + name).hidden = false;
    if(name === "portfolio") renderPortfolio();
    if(name === "settings") renderSettings();
    if(name === "today") renderNokeyBanner();
  }
  function setupTabs(){
    document.querySelectorAll(".tab").forEach(tab=>{
      tab.addEventListener("click", ()=> switchTab(tab.dataset.tab));
    });
    document.getElementById("btn-goto-settings").addEventListener("click", ()=> switchTab("settings"));
  }

  function renderNokeyBanner(){
    const hasKey = !!localStorage.getItem(LS.apiKey);
    document.getElementById("nokey-banner").hidden = hasKey;
  }

  // ---------- 오늘의 케이스 렌더 ----------
  let currentCompany = null;
  let currentCut = "";

  function renderTodayCase(){
    currentCompany = getTodayCompany();
    currentCut = getTodayCut(currentCompany);
    document.getElementById("case-name").textContent = T(currentCompany.name);
    document.getElementById("case-category").textContent = T(currentCompany.category);
    document.getElementById("case-pricing").textContent = T(currentCompany.pricing);
    document.getElementById("case-revenue").textContent = T(currentCompany.revenue);
    document.getElementById("case-features").textContent = T(currentCompany.features);
    document.getElementById("case-issue").textContent = T(currentCompany.recentIssue);
    document.getElementById("case-cut").textContent = T(currentCut);
    const srcEl = document.getElementById("case-sources");
    srcEl.innerHTML = T("출처: ") + currentCompany.sources.map(s=>`<a href="${s.url}" target="_blank" rel="noopener">${s.title}</a>`).join(", ");
  }

  document.getElementById("btn-share-case").addEventListener("click", async (e)=>{
    const text = `${T("오늘의 역기획 — {0}", T(currentCompany.name))}\n"${T(currentCut)}"\n\nhttps://reverseengineeringstudyapp.vercel.app`;
    const btn = e.currentTarget;
    const original = btn.textContent;
    if(navigator.share){
      try{ await navigator.share({ text, url: "https://reverseengineeringstudyapp.vercel.app" }); return; }
      catch(e){ /* 취소했거나 실패하면 클립보드로 폴백 */ }
    }
    try{
      await navigator.clipboard.writeText(text);
      btn.textContent = T("복사됐어요!");
      setTimeout(()=>{ btn.textContent = original; }, 1500);
    }catch(e){
      btn.textContent = T("복사에 실패했어요");
      setTimeout(()=>{ btn.textContent = original; }, 1500);
    }
  });

  // ---------- AI 피드백 (Gemini, BYOK) ----------
  async function callGemini(apiKey, systemPrompt, userPrompt){
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=" + encodeURIComponent(apiKey);
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }]
      })
    });
    if(!res.ok){
      const errBody = await res.text().catch(()=> "");
      let readable = errBody.slice(0,200);
      try{ readable = JSON.parse(errBody).error.message; }catch(e){}
      if(res.status === 400) readable = T("API 키가 올바르지 않아요. 다시 확인해주세요.");
      throw new Error(readable);
    }
    const data = await res.json();
    const parts = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts;
    if(!parts) throw new Error(T("응답을 이해하지 못했어요."));
    return parts.map(p=>p.text||"").join("");
  }

  function buildFeedbackPrompt(company, cut, hypothesis, proposal){
    const system = T("당신은 PM/서비스기획 면접관입니다. 지원자가 실제 기업 사례를 분석한 내용을 읽습니다. 절대로 정답이나 평가를 먼저 제시하지 마세요. 대신 지원자의 논리에서 가장 약한 지점이나 더 파고들 만한 지점을 짚어, 되묻는 질문을 1~2개만 하세요. 존댓말을 쓰고, 친절하지만 날카롭게. 3~5문장 이내로 짧게 답하세요.");
    const blank = T("(작성 안 함)");
    const user = [
      T("기업: {0} ({1})", T(company.name), T(company.category)),
      T("가격 정책: {0}", T(company.pricing)),
      T("수익 구조: {0}", T(company.revenue)),
      T("주요 기능: {0}", T(company.features)),
      T("최근 이슈: {0}", T(company.recentIssue)),
      "",
      T("오늘의 질문: {0}", T(cut)),
      "",
      T("지원자의 가설(왜 이렇게 설계했을까): {0}", hypothesis || blank),
      T("지원자의 제안(어떻게 바꾸겠는가): {0}", proposal || blank)
    ].join("\n");
    return { system, user };
  }

  function showStatus(el, msg, isError){
    el.textContent = msg;
    el.hidden = false;
    el.classList.toggle("error", !!isError);
  }

  document.getElementById("btn-feedback").addEventListener("click", async ()=>{
    const hypothesis = document.getElementById("note-hypothesis").value.trim();
    const proposal = document.getElementById("note-proposal").value.trim();
    const statusEl = document.getElementById("note-status");
    const feedbackBox = document.getElementById("feedback-box");
    const feedbackText = document.getElementById("feedback-text");

    if(!hypothesis && !proposal){
      showStatus(statusEl, T("가설이나 제안 중 하나는 적어주세요."), true);
      return;
    }
    const apiKey = localStorage.getItem(LS.apiKey);
    if(!apiKey){
      switchTab("settings");
      showStatus(document.getElementById("settings-status"), T("AI 피드백을 받으려면 Gemini API 키를 먼저 등록해주세요."), true);
      return;
    }

    const btn = document.getElementById("btn-feedback");
    btn.disabled = true;
    const originalLabel = btn.textContent;
    btn.textContent = T("생각하는 중...");
    statusEl.hidden = true;

    try{
      const { system, user } = buildFeedbackPrompt(currentCompany, currentCut, hypothesis, proposal);
      const reply = await callGemini(apiKey, system, user);
      feedbackText.textContent = reply;
      feedbackBox.hidden = false;
    }catch(err){
      showStatus(statusEl, T("피드백을 받지 못했어요: {0}", err.message), true);
    }finally{
      btn.disabled = false;
      btn.textContent = originalLabel;
    }
  });

  document.getElementById("btn-save-note").addEventListener("click", ()=>{
    const hypothesis = document.getElementById("note-hypothesis").value.trim();
    const proposal = document.getElementById("note-proposal").value.trim();
    const feedbackBox = document.getElementById("feedback-box");
    const feedback = feedbackBox.hidden ? "" : document.getElementById("feedback-text").textContent;
    const statusEl = document.getElementById("note-status");

    if(!hypothesis && !proposal){
      showStatus(statusEl, T("저장할 내용이 없어요."), true);
      return;
    }

    const list = getPortfolio();
    list.unshift({
      id: Date.now().toString(36),
      date: new Date().toISOString().slice(0,10),
      companyName: currentCompany.name,
      companyCategory: currentCompany.category,
      cut: currentCut,
      hypothesis, proposal, feedback
    });
    savePortfolio(list);

    document.getElementById("note-hypothesis").value = "";
    document.getElementById("note-proposal").value = "";
    feedbackBox.hidden = true;
    showStatus(statusEl, T("포트폴리오에 저장했어요."), false);
  });

  // ---------- 포트폴리오 ----------
  function exportMarkdown(item){
    return `# ${T(item.companyName)} — ${item.date}\n\n${T("**오늘의 질문**")}: ${T(item.cut)}\n\n${T("**가설**")}: ${item.hypothesis || "-"}\n\n${T("**제안**")}: ${item.proposal || "-"}\n\n${T("**AI 피드백**")}: ${item.feedback || "-"}\n`;
  }

  function downloadTextFile(filename, text){
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  document.getElementById("btn-export-all").addEventListener("click", ()=>{
    const list = getPortfolio();
    const combined = list.map(exportMarkdown).join("\n---\n\n");
    downloadTextFile(T("오늘의역기획_포트폴리오.md"), combined);
  });

  function renderPortfolio(){
    const list = getPortfolio();
    const listEl = document.getElementById("portfolio-list");
    const emptyEl = document.getElementById("portfolio-empty");
    const toolbarEl = document.getElementById("portfolio-toolbar");
    listEl.innerHTML = "";

    if(list.length === 0){
      emptyEl.hidden = false;
      toolbarEl.hidden = true;
      return;
    }
    emptyEl.hidden = true;
    toolbarEl.hidden = false;
    document.getElementById("portfolio-count").textContent = T("{0}개 저장됨", list.length);

    list.forEach(item=>{
      const div = document.createElement("div");
      div.className = "portfolio-item";
      const snippet = [item.hypothesis, item.proposal].filter(Boolean).join(" / ").slice(0,140);
      div.innerHTML = `
        <div class="meta"><span>${item.date}</span><span>${T(item.companyCategory)}</span></div>
        <h3>${T(item.companyName)}</h3>
        <p class="snippet">${snippet || T("(내용 없음)")}</p>
        <div class="actions">
          <button type="button" data-action="export">${T("내보내기(복사)")}</button>
          <button type="button" data-action="delete">${T("삭제")}</button>
        </div>
      `;
      div.querySelector('[data-action="export"]').addEventListener("click", (e)=>{
        navigator.clipboard.writeText(exportMarkdown(item)).then(()=>{
          e.target.textContent = T("복사됨!");
          setTimeout(()=>{ e.target.textContent = T("내보내기(복사)"); }, 1500);
        });
      });
      div.querySelector('[data-action="delete"]').addEventListener("click", ()=>{
        const filtered = getPortfolio().filter(x=>x.id !== item.id);
        savePortfolio(filtered);
        renderPortfolio();
      });
      listEl.appendChild(div);
    });
  }

  // ---------- 가격 (페이크도어 테스트) ----------
  let selectedPriceReaction = null;

  document.getElementById("interest-price-choices").addEventListener("click", (e)=>{
    const btn = e.target.closest(".choice");
    if(!btn) return;
    document.querySelectorAll("#interest-price-choices .choice").forEach(b=>b.classList.remove("selected"));
    btn.classList.add("selected");
    selectedPriceReaction = btn.dataset.value;
  });

  document.getElementById("btn-interest-submit").addEventListener("click", async ()=>{
    const email = document.getElementById("interest-email").value.trim();
    const message = document.getElementById("interest-message").value.trim();
    const statusEl = document.getElementById("interest-status");

    if(!email && !message && !selectedPriceReaction){
      showStatus(statusEl, T("이메일, 한마디, 가격 반응 중 하나는 남겨주세요."), true);
      return;
    }

    const btn = document.getElementById("btn-interest-submit");
    btn.disabled = true;
    const original = btn.textContent;
    btn.textContent = T("보내는 중...");

    try{
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "pricing_interest", email, message, price: selectedPriceReaction })
      });
      if(!res.ok) throw new Error(T("전송 실패 ({0})", res.status));
      showStatus(statusEl, T("감사해요! 의견 잘 받았어요."), false);
      document.getElementById("interest-email").value = "";
      document.getElementById("interest-message").value = "";
      document.querySelectorAll("#interest-price-choices .choice").forEach(b=>b.classList.remove("selected"));
      selectedPriceReaction = null;
    }catch(err){
      showStatus(statusEl, T("전송하지 못했어요: {0}", err.message), true);
    }finally{
      btn.disabled = false;
      btn.textContent = original;
    }
  });

  // ---------- 설정 ----------
  let settingsPurpose = null;

  function renderSettings(){
    settingsPurpose = localStorage.getItem(LS.purpose);
    document.querySelectorAll("#settings-purpose-choices .choice").forEach(b=>{
      b.classList.toggle("selected", b.dataset.value === settingsPurpose);
    });
    document.getElementById("settings-apikey-input").value = localStorage.getItem(LS.apiKey) || "";
    document.getElementById("settings-status").hidden = true;

    const currentTheme = localStorage.getItem(LS.theme) || "system";
    document.querySelectorAll("#theme-choices .choice").forEach(b=>{
      b.classList.toggle("selected", b.dataset.value === currentTheme);
    });
  }

  document.getElementById("theme-choices").addEventListener("click", (e)=>{
    const btn = e.target.closest(".choice");
    if(!btn) return;
    document.querySelectorAll("#theme-choices .choice").forEach(b=>b.classList.remove("selected"));
    btn.classList.add("selected");
    localStorage.setItem(LS.theme, btn.dataset.value);
    applyTheme();
  });

  document.getElementById("btn-open-feedback-settings").addEventListener("click", openFeedbackPanel);

  document.getElementById("settings-purpose-choices").addEventListener("click", (e)=>{
    const btn = e.target.closest(".choice");
    if(!btn) return;
    document.querySelectorAll("#settings-purpose-choices .choice").forEach(b=>b.classList.remove("selected"));
    btn.classList.add("selected");
    settingsPurpose = btn.dataset.value;
  });

  document.getElementById("btn-settings-save").addEventListener("click", ()=>{
    if(settingsPurpose) localStorage.setItem(LS.purpose, settingsPurpose);
    const key = document.getElementById("settings-apikey-input").value.trim();
    if(key) localStorage.setItem(LS.apiKey, key);
    else localStorage.removeItem(LS.apiKey);
    showStatus(document.getElementById("settings-status"), T("저장했어요."), false);
    renderNokeyBanner();
  });

  // ---------- 플로팅 피드백 위젯 (사이트 전체에 대한 의견) ----------
  function openFeedbackPanel(){
    document.getElementById("feedback-panel").hidden = false;
  }
  function closeFeedbackPanel(){
    document.getElementById("feedback-panel").hidden = true;
  }
  document.getElementById("btn-feedback-fab").addEventListener("click", ()=>{
    const panel = document.getElementById("feedback-panel");
    panel.hidden ? openFeedbackPanel() : closeFeedbackPanel();
  });
  document.getElementById("btn-feedback-panel-close").addEventListener("click", closeFeedbackPanel);

  document.getElementById("btn-general-feedback-submit").addEventListener("click", async ()=>{
    const message = document.getElementById("general-feedback-text").value.trim();
    const email = document.getElementById("general-feedback-email").value.trim();
    const statusEl = document.getElementById("general-feedback-status");

    if(!message){
      showStatus(statusEl, T("내용을 적어주세요."), true);
      return;
    }

    const btn = document.getElementById("btn-general-feedback-submit");
    btn.disabled = true;
    const original = btn.textContent;
    btn.textContent = T("보내는 중...");

    try{
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "general_feedback", email, message })
      });
      if(!res.ok) throw new Error(T("전송 실패 ({0})", res.status));
      showStatus(statusEl, T("감사해요! 꼼꼼히 읽어볼게요."), false);
      document.getElementById("general-feedback-text").value = "";
      document.getElementById("general-feedback-email").value = "";
      setTimeout(closeFeedbackPanel, 1200);
    }catch(err){
      showStatus(statusEl, T("전송하지 못했어요: {0}", err.message), true);
    }finally{
      btn.disabled = false;
      btn.textContent = original;
    }
  });

  // ---------- 앱 초기화 ----------
  function initApp(){
    appRoot.hidden = false;
    setupTabs();
    renderTodayCase();
    renderNokeyBanner();
  }

  // ---------- 시작점 ----------
  if(localStorage.getItem(LS.onboarded) === "true"){
    welcomeScreen.hidden = true;
    initApp();
  }
})();
