// ===== Data =====
const NEWS = [
  { tag: "Product", title: "New expense tool goes live Monday", body: "Finance is rolling out a simplified expense submission flow across all departments starting next week." },
  { tag: "People", title: "Welcome our new VP of Engineering", body: "Please join us in welcoming Priya Raman, who starts this month leading the platform engineering org." },
  { tag: "Facilities", title: "Cafeteria renovation begins", body: "The 3rd floor cafeteria will be closed for upgrades from the 10th; a temporary setup opens on floor 2." },
];

const POLICIES = [
  { title: "Leave Policy", body: "Employees accrue 1.5 days of paid leave per month, credited on the 1st. Unused leave carries over up to 15 days into the next calendar year." },
  { title: "Work From Home Policy", body: "Hybrid roles may work remotely up to 2 days per week with manager approval logged in the HR portal." },
  { title: "Code of Conduct", body: "All employees are expected to treat colleagues, clients, and partners with respect, integrity, and professionalism at all times." },
  { title: "Reimbursement Policy", body: "Submit expense claims within 30 days of the expense date with itemized receipts attached for approval." },
];

const HOLIDAYS = [
  { date: "15 Aug 2026", name: "Independence Day", type: "public" },
  { date: "02 Oct 2026", name: "Gandhi Jayanti", type: "public" },
  { date: "12 Nov 2026", name: "Diwali", type: "public" },
  { date: "25 Dec 2026", name: "Christmas", type: "public" },
  { date: "31 Dec 2026", name: "Founders' Day", type: "company" },
];

const ANNOUNCEMENTS = [
  { title: "Quarterly town hall scheduled for the 20th", date: "2 days ago" },
  { title: "New health insurance partner effective next cycle", date: "5 days ago" },
  { title: "Parking garage B closed for maintenance this weekend", date: "1 week ago" },
];

// ===== Render helpers =====
function renderNews() {
  const grid = document.getElementById("newsGrid");
  grid.innerHTML = NEWS.map(n => `
    <article class="news-card">
      <span class="tag">${n.tag}</span>
      <h3>${n.title}</h3>
      <p>${n.body}</p>
    </article>
  `).join("");
}

function renderPolicies() {
  const wrap = document.getElementById("policyAccordion");
  wrap.innerHTML = POLICIES.map((p, i) => `
    <div class="accordion-item" data-index="${i}">
      <button class="accordion-trigger" aria-expanded="false">
        <span>${p.title}</span>
        <span class="plus">+</span>
      </button>
      <div class="accordion-panel"><p>${p.body}</p></div>
    </div>
  `).join("");

  wrap.querySelectorAll(".accordion-trigger").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".accordion-item");
      const isOpen = item.classList.contains("open");
      wrap.querySelectorAll(".accordion-item").forEach(el => {
        el.classList.remove("open");
        el.querySelector(".accordion-trigger").setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });
}

function renderHolidays() {
  const tbody = document.querySelector("#holidayTable tbody");
  tbody.innerHTML = HOLIDAYS.map(h => `
    <tr>
      <td>${h.date}</td>
      <td>${h.name}</td>
      <td><span class="badge ${h.type}">${h.type === "public" ? "Public Holiday" : "Company Holiday"}</span></td>
    </tr>
  `).join("");
}

function renderAnnouncements() {
  const list = document.getElementById("announcementList");
  list.innerHTML = ANNOUNCEMENTS.map(a => `
    <li class="announcement-item">
      <span class="a-title">${a.title}</span>
      <span class="a-date">${a.date}</span>
    </li>
  `).join("");
}

// ===== Nav toggle (mobile) =====
function setupNav() {
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("mainNav");
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  nav.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

// ===== Hero buttons =====
function setupHeroButtons() {
  document.getElementById("scrollNewsBtn").addEventListener("click", () => {
    document.getElementById("news").scrollIntoView({ behavior: "smooth" });
  });
  document.getElementById("scrollFeedbackBtn").addEventListener("click", () => {
    document.getElementById("feedback").scrollIntoView({ behavior: "smooth" });
  });
}

// ===== Feedback form =====
function loadFeedback() {
  try {
    return JSON.parse(localStorage.getItem("portal_feedback") || "[]");
  } catch {
    return [];
  }
}

function saveFeedback(entries) {
  localStorage.setItem("portal_feedback", JSON.stringify(entries));
}

function renderFeedbackLog() {
  const entries = loadFeedback();
  const list = document.getElementById("feedbackLog");
  const count = document.getElementById("logCount");
  count.textContent = `(${entries.length})`;

  if (entries.length === 0) {
    list.innerHTML = `<li class="empty">No feedback submitted yet. Be the first!</li>`;
    return;
  }

  list.innerHTML = entries.slice().reverse().slice(0, 5).map(e => `
    <li><strong>${e.name}</strong> (${e.dept}) &mdash; ${e.message}</li>
  `).join("");
}

function setupForm() {
  const form = document.getElementById("feedbackForm");
  const confirm = document.getElementById("formConfirm");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("fbName");
    const dept = document.getElementById("fbDept");
    const message = document.getElementById("fbMessage");

    let valid = true;

    if (!name.value.trim()) {
      document.getElementById("fbNameError").textContent = "Please enter your name.";
      valid = false;
    } else {
      document.getElementById("fbNameError").textContent = "";
    }

    if (!dept.value) {
      document.getElementById("fbDeptError").textContent = "Please select a department.";
      valid = false;
    } else {
      document.getElementById("fbDeptError").textContent = "";
    }

    if (!message.value.trim() || message.value.trim().length < 5) {
      document.getElementById("fbMessageError").textContent = "Message should be at least 5 characters.";
      valid = false;
    } else {
      document.getElementById("fbMessageError").textContent = "";
    }

    if (!valid) {
      confirm.textContent = "";
      return;
    }

    const entries = loadFeedback();
    entries.push({ name: name.value.trim(), dept: dept.value, message: message.value.trim() });
    saveFeedback(entries);
    renderFeedbackLog();

    confirm.textContent = "Thanks — your feedback has been recorded.";
    form.reset();

    setTimeout(() => { confirm.textContent = ""; }, 4000);
  });
}

// ===== Status strip + footer meta =====
function setupMeta() {
  document.getElementById("year").textContent = new Date().getFullYear();
  document.getElementById("todayDate").textContent = new Date().toLocaleDateString(undefined, {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });
  document.getElementById("statusTime").textContent =
    "Last synced " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ===== Init =====
document.addEventListener("DOMContentLoaded", () => {
  renderNews();
  renderPolicies();
  renderHolidays();
  renderAnnouncements();
  renderFeedbackLog();
  setupNav();
  setupHeroButtons();
  setupForm();
  setupMeta();
});
