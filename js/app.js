(function () {
  "use strict";

  const STORAGE_REGISTRATION = "hackathon_registration_demo";
  const STORAGE_VOTES = "hackathon_votes_v1";
  const STORAGE_UPLOADS = "hackathon_uploads_demo";

  const MOCK_INDIVIDUAL = [
    {
      id: "ind-1",
      title: "Individual Project 1",
      summary: "Prototype: rogue-lite shopkeeper loop — AI-assisted art pass.",
    },
    {
      id: "ind-2",
      title: "Individual Project 2",
      summary: "Experimental physics toy built with rapid Gen-AI iteration.",
    },
    {
      id: "ind-3",
      title: "Individual Project 3",
      summary: "Narrative snippet demo — optional slides + playable web build.",
    },
  ];

  const MOCK_TEAM = [
    {
      id: "team-1",
      title: "Team Project 1",
      summary: "Regional market pitch + core loop deck · CIS-inspired setting.",
    },
    {
      id: "team-2",
      title: "Team Project 2",
      summary: "LATAM audience gap analysis · live-ops ready prototype stub.",
    },
  ];

  const CRITERIA = [
    { key: "originality", label: "Originality" },
    { key: "technicality", label: "Technicality" },
    { key: "fun", label: "Fun" },
    { key: "marketFit", label: "Market fit" },
  ];

  /** ---------- Tabs ---------- */
  function initMainTabs() {
    const tabs = document.querySelectorAll(".tab");
    const panels = {
      register: document.getElementById("panel-register"),
      upload: document.getElementById("panel-upload"),
      projects: document.getElementById("panel-projects"),
    };

    tabs.forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-tab");
        tabs.forEach((t) => {
          t.classList.toggle("tab--active", t === btn);
          t.setAttribute("aria-selected", t === btn ? "true" : "false");
        });
        Object.entries(panels).forEach(([key, el]) => {
          if (!el) return;
          const active = key === id;
          el.toggleAttribute("hidden", !active);
          el.classList.toggle("panel--active", active);
        });
      });
    });
  }

  /** ---------- Registration ---------- */
  function getTrack() {
    const el = document.querySelector('input[name="track"]:checked');
    return el ? el.value : "team";
  }

  function renderMemberInputs(count) {
    const list = document.getElementById("member-list");
    if (!list) return;
    list.innerHTML = "";
    for (let i = 0; i < count; i += 1) {
      const row = document.createElement("div");
      row.className = "member-row";
      row.innerHTML = `
        <input type="text" name="memberName" required autocomplete="name" placeholder="Member ${i + 1} full name" aria-label="Member ${i + 1} full name" />
      `;
      list.appendChild(row);
    }
  }

  function memberCount() {
    return document.querySelectorAll("#member-list input[name='memberName']").length;
  }

  function updateMemberHint() {
    const hint = document.getElementById("member-hint");
    if (!hint) return;
    const n = memberCount();
    if (n < 2) hint.textContent = "Add at least 2 members.";
    else if (n > 4) hint.textContent = "Maximum 4 members.";
    else hint.textContent = "";
  }

  function initRegistration() {
    const teamBlock = document.getElementById("team-fields");
    const individualBlock = document.getElementById("individual-fields");
    const form = document.getElementById("form-register");
    const addBtn = document.getElementById("btn-add-member");
    const status = document.getElementById("register-status");

    function syncTrackUI() {
      const track = getTrack();
      const isTeam = track === "team";
      teamBlock.classList.toggle("is-hidden", !isTeam);
      individualBlock.classList.toggle("is-hidden", isTeam);
      if (isTeam && memberCount() < 2) renderMemberInputs(2);
      updateMemberHint();
    }

    document.querySelectorAll('input[name="track"]').forEach((r) => {
      r.addEventListener("change", syncTrackUI);
    });

    addBtn.addEventListener("click", () => {
      if (memberCount() >= 4) return;
      renderMemberInputs(memberCount() + 1);
      updateMemberHint();
    });

    renderMemberInputs(2);
    syncTrackUI();

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const projectName = form.projectName.value.trim();
      const email = form.email.value.trim();
      const track = getTrack();

      if (!projectName) {
        status.textContent = "Please enter a project name.";
        status.classList.remove("is-success");
        return;
      }

      if (track === "team") {
        const names = Array.from(form.querySelectorAll('input[name="memberName"]'))
          .map((i) => i.value.trim())
          .filter(Boolean);
        if (names.length < 2 || names.length > 4) {
          status.textContent = "Team track requires 2–4 member names.";
          status.classList.remove("is-success");
          updateMemberHint();
          return;
        }
        const payload = { track: "team", projectName, email, members: names };
        sessionStorage.setItem(STORAGE_REGISTRATION, JSON.stringify(payload));
        status.textContent = `Saved (demo): Team "${projectName}" with ${names.length} members.`;
      } else {
        const solo = form.soloName.value.trim();
        if (!solo) {
          status.textContent = "Please enter your name for the individual track.";
          status.classList.remove("is-success");
          return;
        }
        const payload = { track: "individual", projectName, email, contestant: solo };
        sessionStorage.setItem(STORAGE_REGISTRATION, JSON.stringify(payload));
        status.textContent = `Saved (demo): Individual "${projectName}" — ${solo}.`;
      }
      status.classList.add("is-success");
    });
  }

  /** ---------- Upload dropdown ---------- */
  function initUploadForm() {
    const indProjectSel = document.getElementById("upload-ind-project");
    const teamProjectSel = document.getElementById("upload-team-project");
    const indForm = document.getElementById("form-upload-individual");
    const teamForm = document.getElementById("form-upload-team");
    const indStatus = document.getElementById("upload-ind-status");
    const teamStatus = document.getElementById("upload-team-status");

    function fillIndividualProjects() {
      indProjectSel.innerHTML = "";
      MOCK_INDIVIDUAL.forEach((p) => {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = p.title;
        indProjectSel.appendChild(opt);
      });
    }

    function fillTeamProjects() {
      teamProjectSel.innerHTML = "";
      MOCK_TEAM.forEach((p) => {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = p.title;
        teamProjectSel.appendChild(opt);
      });
    }

    function initUploadSubtabs() {
      const tabs = document.querySelectorAll(".upload-subtab");
      const panels = {
        individual: document.getElementById("upload-subpanel-individual"),
        team: document.getElementById("upload-subpanel-team"),
      };
      tabs.forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-upload-subtab");
          tabs.forEach((t) => {
            t.classList.toggle("subtab--active", t === btn);
            t.setAttribute("aria-selected", t === btn ? "true" : "false");
          });
          Object.entries(panels).forEach(([key, panel]) => {
            const active = key === id;
            panel.toggleAttribute("hidden", !active);
            panel.classList.toggle("subpanel--active", active);
          });
        });
      });
    }

    fillIndividualProjects();
    fillTeamProjects();
    initUploadSubtabs();

    indForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const meta = {
        type: "individual",
        track: "individual",
        projectId: indProjectSel.value,
        playUrl: indForm.playUrl.value.trim(),
        notes: indForm.notes.value.trim(),
        savedAt: new Date().toISOString(),
      };
      const prev = JSON.parse(sessionStorage.getItem(STORAGE_UPLOADS) || "[]");
      prev.push(meta);
      sessionStorage.setItem(STORAGE_UPLOADS, JSON.stringify(prev));
      indStatus.textContent = `Individual upload queued (demo): ${indProjectSel.options[indProjectSel.selectedIndex].text}.`;
      indStatus.classList.add("is-success");
    });

    teamForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const fileInput = teamForm.gddFile;
      if (!fileInput.files || fileInput.files.length === 0) {
        teamStatus.textContent = "Please attach a game design document file.";
        teamStatus.classList.remove("is-success");
        return;
      }
      const meta = {
        type: "team",
        track: "team",
        projectId: teamProjectSel.value,
        playUrl: teamForm.playUrl.value.trim(),
        hasBuild: Boolean(teamForm.build.files && teamForm.build.files.length > 0),
        extraFileCount: teamForm.extras.files ? teamForm.extras.files.length : 0,
        fileName: fileInput.files[0].name,
        notes: teamForm.notes.value.trim(),
        savedAt: new Date().toISOString(),
      };
      const prev = JSON.parse(sessionStorage.getItem(STORAGE_UPLOADS) || "[]");
      prev.push(meta);
      sessionStorage.setItem(STORAGE_UPLOADS, JSON.stringify(prev));
      teamStatus.textContent = `Team upload queued (demo): ${teamProjectSel.options[teamProjectSel.selectedIndex].text} · GDD ${meta.fileName}`;
      teamStatus.classList.add("is-success");
      teamForm.reset();
    });
  }

  /** ---------- Voting ---------- */
  function loadVotes() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_VOTES) || "{}");
    } catch {
      return {};
    }
  }

  function saveVotes(obj) {
    localStorage.setItem(STORAGE_VOTES, JSON.stringify(obj));
  }

  function renderProjectCard(project, listEl) {
    const votes = loadVotes();
    const existing = votes[project.id];
    const li = document.createElement("li");
    li.className = "project-card";

    const criteriaHtml = CRITERIA.map(
      (c) => `
      <div class="vote-field">
        <label>
          ${c.label}
          <select name="${c.key}" ${existing ? "disabled" : ""} aria-label="${c.label} score">
            <option value="">—</option>
            ${[1, 2, 3, 4, 5]
              .map(
                (n) =>
                  `<option value="${n}" ${existing && String(existing[c.key]) === String(n) ? "selected" : ""}>${n}</option>`
              )
              .join("")}
          </select>
        </label>
      </div>
    `
    ).join("");

    li.innerHTML = `
      <div class="project-card-header">
        <div>
          <h2 class="project-card-title">${escapeHtml(project.title)}</h2>
          <p class="project-card-meta">${escapeHtml(project.id)} · mock entry</p>
        </div>
        <button type="button" class="btn btn-ghost btn-small btn-download" data-title="${escapeAttr(project.title)}">
          Download
        </button>
      </div>
      <p class="project-card-desc">${escapeHtml(project.summary)}</p>
      <div class="vote-grid" data-project="${escapeAttr(project.id)}">
        ${criteriaHtml}
      </div>
      <div class="vote-actions">
        <button type="button" class="btn btn-primary btn-submit-vote" data-id="${escapeAttr(project.id)}" ${existing ? "hidden" : ""}>
          Submit scores
        </button>
        <span class="vote-locked" ${existing ? "" : "hidden"}>You submitted scores for this project (demo).</span>
      </div>
    `;

    listEl.appendChild(li);

    li.querySelector(".btn-download").addEventListener("click", () => {
      window.alert(
        "Demo only — no file yet. With the backend, this will fetch the team/individual archive or link."
      );
    });

    const submitBtn = li.querySelector(".btn-submit-vote");
    if (submitBtn) {
      submitBtn.addEventListener("click", () => {
        const grid = li.querySelector(".vote-grid");
        const selects = grid.querySelectorAll("select");
        const row = {};
        let complete = true;
        selects.forEach((sel) => {
          if (!sel.value) complete = false;
          row[sel.name] = sel.value ? Number(sel.value, 10) : null;
        });
        if (!complete) {
          window.alert("Please choose 1–5 for all four criteria.");
          return;
        }
        const all = loadVotes();
        all[project.id] = row;
        saveVotes(all);
        submitBtn.hidden = true;
        li.querySelector(".vote-locked").hidden = false;
        selects.forEach((s) => {
          s.disabled = true;
        });
      });
    }
  }

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function escapeAttr(s) {
    return String(s).replace(/"/g, "&quot;");
  }

  function initProjectLists() {
    const listInd = document.getElementById("list-individual");
    const listTeam = document.getElementById("list-team");
    MOCK_INDIVIDUAL.forEach((p) => renderProjectCard(p, listInd));
    MOCK_TEAM.forEach((p) => renderProjectCard(p, listTeam));

    const subtabs = document.querySelectorAll(".subtab");
    const subpanels = {
      individual: document.getElementById("subpanel-individual"),
      team: document.getElementById("subpanel-team"),
    };

    subtabs.forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-subtab");
        subtabs.forEach((b) => {
          b.classList.toggle("subtab--active", b === btn);
          b.setAttribute("aria-selected", b === btn ? "true" : "false");
        });
        Object.entries(subpanels).forEach(([key, el]) => {
          if (!el) return;
          const on = key === id;
          el.toggleAttribute("hidden", !on);
          el.classList.toggle("subpanel--active", on);
        });
      });
    });

    document.getElementById("btn-clear-votes").addEventListener("click", () => {
      if (!window.confirm("Clear all demo votes from this browser?")) return;
      localStorage.removeItem(STORAGE_VOTES);
      listInd.innerHTML = "";
      listTeam.innerHTML = "";
      MOCK_INDIVIDUAL.forEach((p) => renderProjectCard(p, listInd));
      MOCK_TEAM.forEach((p) => renderProjectCard(p, listTeam));
    });
  }

  /** ---------- Boot ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    initMainTabs();
    initRegistration();
    initUploadForm();
    initProjectLists();
  });
})();
