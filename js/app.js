const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function toast(message) {
  const node = $("#toast");
  node.textContent = message;
  node.classList.add("show");
  window.setTimeout(() => node.classList.remove("show"), 1800);
}

function unlockApp(target = "home") {
  document.body.classList.remove("auth-mode");
  $(".app-topbar").hidden = false;
  page(target);
}

function page(id) {
  $$(".page").forEach((node) => node.classList.toggle("on", node.id === id));
  $$(".tab").forEach((node) => node.classList.toggle("on", node.dataset.p === id));
  $(".tabs")?.classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });

  if (id === "project") {
    renderMatches();
    showStage("matches");
  }
  if (id === "explore") renderCulture();
  if (id === "calendar") renderCalendar();
}

function showStage(stage) {
  $$(".stage-panel").forEach((node) => node.classList.toggle("on", node.id === `stage${stage[0].toUpperCase()}${stage.slice(1)}`));
  $$(".step").forEach((node) => {
    node.classList.toggle("on", node.dataset.stage === stage);
    node.classList.toggle("done", ["brief", "matches", "direction", "activation", "verify"].indexOf(node.dataset.stage) < ["brief", "matches", "direction", "activation", "verify"].indexOf(stage));
  });
}

function renderMatches() {
  const list = $("#matchList");
  if (!list) return;
  DATA.profile.tones = ["luxury", "soft", "contemporary"];
  DATA.profile.sector = "beauty";
  list.innerHTML = rankElements().slice(0, 4).map((element, index) => `
    <article class="match ${element.id === "rose" ? "featured" : ""}">
      <div class="match-thumb culture-shot ${element.id}" aria-hidden="true"></div>
      <div>
        <span class="ey">0${index + 1} — ${element.region} — ${element.cat}</span>
        <h2>${element.name}</h2>
        <strong class="level">${element.computedLevel}</strong>
        <p>${element.why}</p>
        <div class="meta-row">
          <span>${element.sensitivity}</span>
          <span>${element.reference}</span>
        </div>
      </div>
      <div class="match-actions">
        <button class="primary" data-el="${element.id}">${element.id === "rose" ? "اختيار المسار" : "عرض"}</button>
        <button data-save="${element.id}">حفظ</button>
      </div>
    </article>
  `).join("");
}

function openElement(id) {
  const element = DATA.elements.find((item) => item.id === id);
  if (!element) return;

  if (id === "rose") {
    if (!$("#project").classList.contains("on")) page("project");
    showStage("direction");
    toast("تم اختيار ورد الطائف");
    return;
  }

  $("#elementBody").innerHTML = `
    <div class="element-hero">
      <div>
        <span class="ey">${element.region} — ${element.cat} — ${element.sensitivity}</span>
        <h1>${element.name}</h1>
        <p>${element.story}</p>
        <div class="meta-row">
          <span>${element.reference}</span>
          <span>${element.computedLevel || element.level}</span>
        </div>
        <button class="primary" data-save="${element.id}">حفظ المسار</button>
      </div>
      <div class="glyph-panel culture-shot ${element.id}" aria-label="صورة مرجعية لـ ${element.name}"></div>
    </div>
    <div class="info-grid">
      <article><small>لماذا ظهر؟</small><h2>${element.why}</h2></article>
      <article><small>إشارات بصرية</small><h2>${element.cues}</h2></article>
      <article><small>حساسية الاستخدام</small><h2>${element.sensitivity}</h2></article>
      <article><small>تنبيه</small><h2>${element.caution}</h2></article>
    </div>
  `;
  page("element");
}

function saveItem(id) {
  const saved = JSON.parse(localStorage.getItem("qaf_saved") || "[]");
  if (!saved.includes(id)) saved.push(id);
  localStorage.setItem("qaf_saved", JSON.stringify(saved));
  toast("تم الحفظ في مساحة العمل");
}

function renderCulture() {
  const query = $("#search")?.value.trim() || "";
  const region = $("#region")?.value || "";
  const sensitivity = $("#sensitivity")?.value || "";
  const items = DATA.elements.filter((element) => {
    const haystack = `${element.name} ${element.region} ${element.cat} ${element.sensitivity}`;
    return (!query || haystack.includes(query)) &&
      (!region || element.region === region) &&
      (!sensitivity || element.sensitivity === sensitivity);
  });

  $("#culture").innerHTML = items.map((element) => `
    <article class="culture" data-el="${element.id}">
      <div class="culture-symbol culture-shot ${element.id}" aria-hidden="true"></div>
      <div class="meta-row">
        <span>${element.cat}</span>
        <span>${element.region}</span>
      </div>
      <h2>${element.name}</h2>
      <p>حساسية الاستخدام: <b>${element.sensitivity}</b></p>
      <small>${element.reference}</small>
    </article>
  `).join("");
}

function renderCalendar() {
  $("#calendarList").innerHTML = DATA.calendar.map((item, index) => `
    <article class="timeline-item">
      <b>${String(index + 1).padStart(2, "0")}</b>
      <div>
        <span class="ey">${item.time}</span>
        <h2>${item.title}</h2>
        <p>${item.why}</p>
      </div>
    </article>
  `).join("");
}

function runBrandAnalysis() {
  $("#brandForm").hidden = true;
  $("#brandResult").hidden = true;
  $("#brandLoading").hidden = false;
  window.setTimeout(() => {
    $("#brandLoading").hidden = true;
    $("#brandResult").hidden = false;
  }, 900);
}

document.addEventListener("click", (event) => {
  const pageTarget = event.target.closest("[data-p]");
  if (pageTarget) {
    event.preventDefault();
    page(pageTarget.dataset.p);
  }

  const stageTarget = event.target.closest("[data-stage]");
  if (stageTarget) {
    event.preventDefault();
    showStage(stageTarget.dataset.stage);
  }

  const authTarget = event.target.closest("[data-auth]");
  if (authTarget) {
    $("#loginForm").hidden = authTarget.dataset.auth === "signup";
    $("#signupForm").hidden = authTarget.dataset.auth === "login";
  }

  const elementTarget = event.target.closest("[data-el]");
  if (elementTarget) openElement(elementTarget.dataset.el);

  const saveTarget = event.target.closest("[data-save]");
  if (saveTarget) saveItem(saveTarget.dataset.save);
});

$("#loginForm").addEventListener("submit", (event) => {
  event.preventDefault();
  unlockApp("home");
  toast("أهلًا نورة");
});

$("#signupForm").addEventListener("submit", (event) => {
  event.preventDefault();
  unlockApp("brands");
  toast("تم إنشاء الحساب التجريبي");
});

$("#menu").addEventListener("click", () => $(".tabs").classList.toggle("open"));

["search", "region", "sensitivity"].forEach((id) => {
  const node = $(`#${id}`);
  node?.addEventListener(id === "search" ? "input" : "change", renderCulture);
});

$("#showBrandForm").addEventListener("click", () => {
  $("#brandForm").hidden = false;
  $("#brandLoading").hidden = true;
  $("#brandResult").hidden = true;
  $("#brandForm").scrollIntoView({ behavior: "smooth", block: "start" });
});

$("#brandForm").addEventListener("submit", (event) => {
  event.preventDefault();
  runBrandAnalysis();
});

$("#guidelinesFile").addEventListener("change", () => {
  if ($("#guidelinesFile").files.length) runBrandAnalysis();
});

$("#manualBrand").addEventListener("click", () => toast("يمكن تعديل الحقول يدويًا ثم تحليلها"));
$("#editAnalysis").addEventListener("click", () => {
  $("#brandForm").hidden = false;
  $("#brandResult").hidden = true;
});
$("#confirmBrand").addEventListener("click", () => {
  toast("تم تأكيد ملف الهوية");
  page("new-project");
});

$("#projectForm").addEventListener("submit", (event) => {
  event.preventDefault();
  page("project");
  toast("تم إنشاء المشروع");
});

$("#chooseDesign").addEventListener("click", () => $("#designFile").click());
$("#designFile").addEventListener("change", () => {
  $("#dropZone").classList.add("done");
  $("#dropZone").querySelector("h2").textContent = "تم رفع التصميم التجريبي";
  $("#dropZone").querySelector("p").textContent = "قاف عرضت الملاحظات بجانب الرفع.";
  $("#report").classList.add("visible");
  toast("اكتمل تحليل التصميم");
});
$("#saveReport").addEventListener("click", () => toast("تم حفظ الملاحظات"));

renderCulture();
renderMatches();
renderCalendar();
