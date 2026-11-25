
const STORE = "vetcheck_local_v1";

const DEFAULT_PEOPLE = [
  {
    id: "joao",
    name: "João",
    role: "Estagiário da manhã",
    pin: "1234",
    tasks: [
      "Realizar eletrocardiogramas",
      "Realizar coleta de sangue para exames pré-operatórios",
      "Auxiliar nos exames necessários, conforme orientação veterinária",
      "Identificar os tubos com nome do paciente, tutor e tipo de exame",
      "Auxiliar os veterinários nos consultórios",
      "Auxiliar o veterinário cirurgião nos procedimentos",
      "Acompanhar os pacientes na internação",
      "Verificar frequentemente as condições dos animais nas baias",
      "Observar vômitos, desconfortos ou alterações e comunicar ao veterinário",
      "Realizar limpeza das baias quando necessário",
      "Limpar os instrumentais cirúrgicos após utilização",
      "Preparar materiais para esterilização",
      "Organizar instrumentais esterilizados",
      "Realizar ciclos da autoclave conforme protocolo da clínica",
      "Conferir materiais para as próximas cirurgias e comunicar faltas ou danos"
    ]
  },
  {
    id: "debora",
    name: "Débora",
    role: "Estagiária da tarde",
    pin: "1234",
    tasks: [
      "Conferir se todos os exames pré-operatórios foram realizados",
      "Verificar se os resultados dos exames estão disponíveis",
      "Conferir resultados e encaminhar alterações ao veterinário",
      "Imprimir exames para os dias de cirurgia",
      "Organizar exames na recepção para entrega aos tutores",
      "Controlar o estoque e atualizar as movimentações",
      "Registrar produtos e materiais retirados",
      "Conferir quantidades e identificar produtos próximos do fim",
      "Elaborar lista de materiais necessários e encaminhar à Dra.",
      "Repor materiais em todos os consultórios",
      "Auxiliar o veterinário cirurgião nos procedimentos da tarde",
      "Auxiliar os veterinários nos atendimentos e consultas",
      "Acompanhar pacientes internados e comunicar alterações",
      "Auxiliar na organização e limpeza das baias",
      "Preparar receituários conforme prescrição e conferência veterinária",
      "Organizar a liberação dos pacientes e auxiliar na entrega aos tutores",
      "Explicar orientações de pós-operatório, medicações e retornos conforme orientação veterinária"
    ]
  },
  {
    id: "mari",
    name: "Mari",
    role: "Recepcionista da manhã",
    pin: "1234",
    tasks: [
      "Realizar atendimento presencial e por mensagens",
      "Responder as mensagens recebidas e acompanhar conversas pendentes",
      "Não deixar tutores sem retorno ou conversas esquecidas",
      "Consultar valores e orçamentos no sistema",
      "Consultar valores e informações da Petlove",
      "Anexar resultados dos exames ao prontuário do paciente",
      "Conferir se os documentos foram anexados corretamente",
      "Acompanhar os exames que chegam à clínica",
      "Organizar documentos da recepção",
      "Conferir os recebimentos do período da manhã",
      "Organizar os valores e realizar o fechamento do caixa da manhã"
    ]
  },
  {
    id: "emilly",
    name: "Emilly",
    role: "Recepcionista da tarde",
    pin: "1234",
    tasks: [
      "Dar continuidade aos atendimentos presenciais e por mensagens",
      "Responder mensagens e acompanhar conversas pendentes",
      "Não deixar tutores sem retorno ou conversas esquecidas",
      "Consultar valores e orçamentos no sistema",
      "Consultar valores e informações da Petlove",
      "Organizar documentos da recepção",
      "Conferir os recebimentos do período da tarde",
      "Identificar possíveis divergências no caixa",
      "Organizar os valores e finalizar o caixa ao término do expediente"
    ]
  }
];

let data = loadData();
let activePerson = null;
let isAdmin = false;
let currentTab = "people";
let editingProtocolId = null;

/* =========================
   ARMAZENAMENTO
========================= */

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE));

    if (saved && Array.isArray(saved.people)) {
      saved.submissions ||= [];
      saved.protocols ||= [];
      saved.adminPin ||= "uvet2026";
      return saved;
    }
  } catch (e) {
    console.error("Erro ao carregar dados:", e);
  }

  const initial = {
    people: DEFAULT_PEOPLE,
    adminPin: "uvet2026",
    submissions: [],
    protocols: []
  };

  localStorage.setItem(STORE, JSON.stringify(initial));
  return initial;
}

function persist() {
  localStorage.setItem(STORE, JSON.stringify(data));
}

function todayKey() {
  const d = new Date();

  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0")
  ].join("-");
}

function tomorrowKey() {
  const d = new Date();
  d.setDate(d.getDate() + 1);

  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0")
  ].join("-");
}

function formatDate(date) {
  if (!date) return "";

  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[c]);
}

/* =========================
   NAVEGAÇÃO
========================= */

function refreshPeopleSelect() {
  const select = document.querySelector("#person");

  select.innerHTML =
    '<option value="admin">Administrativo</option>' +
    data.people.map(p =>
      `<option value="${esc(p.id)}">${esc(p.name)} — ${esc(p.role)}</option>`
    ).join("");

  const taskSelect = document.querySelector("#taskPerson");

  if (taskSelect) {
    taskSelect.innerHTML = data.people.map(p =>
      `<option value="${esc(p.id)}">${esc(p.name)} — ${esc(p.role)}</option>`
    ).join("");
  }
}

function showApp() {
  document.querySelector("#loginScreen").classList.add("hidden");
  document.querySelector("#appScreen").classList.remove("hidden");
  document.querySelector("#logout").classList.remove("hidden");

  document.querySelector("#navAdmin").classList.toggle("hidden", !isAdmin);

  document.querySelector("#welcome").textContent =
    isAdmin ? "Olá, Administração!" : `Olá, ${activePerson.name}!`;

  document.querySelector("#subWelcome").textContent =
    isAdmin
      ? "Gerencie a equipe, tarefas e registros deste computador."
      : "Confira suas atividades e registre o encerramento do expediente.";

  document.querySelector("#roleBadge").textContent =
    isAdmin ? "Acesso administrativo" : activePerson.role;

  document.querySelector("#employeeView").classList.toggle("hidden", isAdmin);
  document.querySelector("#adminView").classList.toggle("hidden", !isAdmin);

  document.querySelector("#protocolView").classList.add("hidden");
  document.querySelector("#navHome").classList.add("active");
  document.querySelector("#navProtocols").classList.remove("active");
  document.querySelector("#navAdmin").classList.remove("active");

  if (isAdmin) {
    refreshPeopleSelect();
    renderPeople();
    switchTab("people");
  } else {
    renderChecklist();
  }

  renderProtocols();
}

function showHome() {
  document.querySelector("#protocolView").classList.add("hidden");
  document.querySelector("#navProtocols").classList.remove("active");
  document.querySelector("#navHome").classList.add("active");
  document.querySelector("#navAdmin").classList.toggle("active", isAdmin);

  if (isAdmin) {
    document.querySelector("#employeeView").classList.add("hidden");
    document.querySelector("#adminView").classList.remove("hidden");
  } else {
    document.querySelector("#employeeView").classList.remove("hidden");
    document.querySelector("#adminView").classList.add("hidden");
  }
}

function showProtocols() {
  document.querySelector("#employeeView").classList.add("hidden");
  document.querySelector("#adminView").classList.add("hidden");
  document.querySelector("#protocolView").classList.remove("hidden");

  document.querySelector("#navHome").classList.remove("active");
  document.querySelector("#navAdmin").classList.remove("active");
  document.querySelector("#navProtocols").classList.add("active");

  document.querySelector("#heading").textContent =
    "Protocolos veterinários";

  renderProtocols();
}

/* =========================
   LOGIN E SAÍDA
========================= */

document.querySelector("#loginForm").addEventListener("submit", e => {
  e.preventDefault();

  const id = document.querySelector("#person").value;
  const pin = document.querySelector("#pin").value;
  const error = document.querySelector("#loginError");

  if (id === "admin") {
    if (pin !== data.adminPin) {
      error.textContent = "Senha administrativa incorreta.";
      return;
    }

    isAdmin = true;
    activePerson = null;

  } else {
    const person = data.people.find(p => p.id === id);

    if (!person || pin !== person.pin) {
      error.textContent = "Senha incorreta.";
      return;
    }

    activePerson = person;
    isAdmin = false;
  }

  error.textContent = "";
  document.querySelector("#pin").value = "";

  document.querySelector("#heading").textContent =
    isAdmin ? "Painel administrativo" : "Meu checklist";

  showApp();
});

document.querySelector("#logout").addEventListener("click", () => {
  activePerson = null;
  isAdmin = false;
  editingProtocolId = null;

  document.querySelector("#appScreen").classList.add("hidden");
  document.querySelector("#loginScreen").classList.remove("hidden");
  document.querySelector("#logout").classList.add("hidden");
  document.querySelector("#navAdmin").classList.add("hidden");

  document.querySelector("#heading").textContent = "Bem-vinda ao VetCheck";
  document.querySelector("#loginError").textContent = "";
});

document.querySelector("#navHome").addEventListener("click", () => {
  showHome();

  document.querySelector("#heading").textContent =
    isAdmin ? "Painel administrativo" : "Meu checklist";
});

document.querySelector("#navProtocols").addEventListener("click", showProtocols);

document.querySelector("#navAdmin").addEventListener("click", () => {
  if (!isAdmin) return;

  document.querySelector("#employeeView").classList.add("hidden");
  document.querySelector("#protocolView").classList.add("hidden");
  document.querySelector("#adminView").classList.remove("hidden");

  document.querySelector("#navHome").classList.remove("active");
  document.querySelector("#navProtocols").classList.remove("active");
  document.querySelector("#navAdmin").classList.add("active");

  document.querySelector("#heading").textContent = "Painel administrativo";
});

/* =========================
   CHECKLIST DO FUNCIONÁRIO
========================= */

function getSubmission(personId, date = todayKey()) {
  return data.submissions.find(s =>
    s.personId === personId && s.date === date
  );
}

function renderChecklist() {
  const saved = getSubmission(activePerson.id);
  const checks = saved?.checks || {};

  document.querySelector("#workDate").textContent =
    new Date().toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric"
    });

  document.querySelector("#notes").value = saved?.notes || "";

  const list = document.querySelector("#checklist");

  list.innerHTML = activePerson.tasks.map((task, i) => `
    <div class="task ${checks[i] ? "done" : ""}">
      <input
        type="checkbox"
        id="c${i}"
        data-index="${i}"
        ${checks[i] ? "checked" : ""}
      >
      <label for="c${i}">${esc(task)}</label>
    </div>
  `).join("");

  list.querySelectorAll("input").forEach(el => {
    el.addEventListener("change", () => {
      el.parentElement.classList.toggle("done", el.checked);
      updateProgress();
    });
  });

  document.querySelector("#saveStatus").textContent = "";

  updateProgress();
}

function updateProgress() {
  const all = [...document.querySelectorAll("#checklist input")];
  const done = all.filter(x => x.checked).length;

  document.querySelector("#progressText").textContent =
    `${done} de ${all.length} concluídas`;
}

document.querySelector("#saveChecklist").addEventListener("click", () => {
  if (!activePerson || isAdmin) return;

  const checks = {};

  document.querySelectorAll("#checklist input").forEach(el => {
    checks[el.dataset.index] = el.checked;
  });

  const record = {
    personId: activePerson.id,
    personName: activePerson.name,
    role: activePerson.role,
    date: todayKey(),
    savedAt: new Date().toISOString(),
    checks,
    tasks: [...activePerson.tasks],
    notes: document.querySelector("#notes").value
  };

  const idx = data.submissions.findIndex(s =>
    s.personId === record.personId && s.date === record.date
  );

  if (idx >= 0) {
    data.submissions[idx] = record;
  } else {
    data.submissions.push(record);
  }

  persist();

  const done = Object.values(checks).filter(Boolean).length;
  const total = activePerson.tasks.length;

  document.querySelector("#saveStatus").textContent =
    done === total
      ? "Checklist salvo! Todas as tarefas foram concluídas."
      : `Checklist salvo! ${total - done} tarefa(s) ficaram pendentes.`;
});

/* =========================
   ABAS ADMINISTRATIVAS
========================= */

document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    if (!isAdmin) return;
    switchTab(btn.dataset.tab);
  });
});

function switchTab(tab) {
  if (!isAdmin) return;

  currentTab = tab;

  document.querySelectorAll(".tab").forEach(b => {
    b.classList.toggle("active", b.dataset.tab === tab);
  });

  document.querySelectorAll("#adminView .tab-content").forEach(c => {
    c.classList.add("hidden");
  });

  const target = document.querySelector(`#tab-${tab}`);

  if (target) target.classList.remove("hidden");

  if (tab === "people") renderPeople();

  if (tab === "tasks") {
    refreshPeopleSelect();
    renderTaskEditor();
  }

  if (tab === "tracking") {
    const dateInput = document.querySelector("#trackingDate");

    if (!dateInput.value) {
      dateInput.value = tomorrowKey();
    }

    dateInput.min = tomorrowKey();
    renderTracking();
  }

  if (tab === "history") renderHistory();
}

document.querySelector("#trackingDate").addEventListener("change", () => {
  renderTracking();
});

/* =========================
   FUNCIONÁRIOS
========================= */

function renderPeople() {
  if (!isAdmin) return;

  const box = document.querySelector("#peopleList");

  box.innerHTML = data.people.map(p => `
    <div class="person-row">
      <div>
        <strong>${esc(p.name)}</strong>
        <small>${esc(p.role)}</small>
      </div>

      <div>
        <small>E-mail: ${esc(p.email || "Não informado")}</small>
        <br>
        <small>Senha local: ${esc(p.pin)}</small>
      </div>

      <div>
        <button class="secondary small" data-edit="${esc(p.id)}">
          Editar
        </button>

        <button class="danger-button" data-delete="${esc(p.id)}">
          Excluir
        </button>
      </div>
    </div>
  `).join("");

  box.querySelectorAll("[data-edit]").forEach(btn => {
    btn.addEventListener("click", () => editPerson(btn.dataset.edit));
  });

  box.querySelectorAll("[data-delete]").forEach(btn => {
    btn.addEventListener("click", () => {
      const p = data.people.find(x => x.id === btn.dataset.delete);

      if (!p) return;

      if (confirm(`Excluir o perfil de ${p.name}? O histórico antigo será mantido.`)) {
        data.people = data.people.filter(x => x.id !== p.id);

        persist();
        refreshPeopleSelect();
        renderPeople();
      }
    });
  });
}

function editPerson(id) {
  if (!isAdmin) return;

  const p = data.people.find(x => x.id === id);
  if (!p) return;

  const name = prompt("Nome do funcionário:", p.name);
  if (name === null) return;

  const role = prompt("Função:", p.role);
  if (role === null) return;

  const email = prompt("E-mail:", p.email || "");
  if (email === null) return;

  const pin = prompt("Senha local (mínimo 4 caracteres):", p.pin);
  if (pin === null) return;

  if (!name.trim() || !role.trim() || pin.length < 4) {
    alert("Informe nome, função e senha com pelo menos 4 caracteres.");
    return;
  }

  Object.assign(p, {
    name: name.trim(),
    role: role.trim(),
    email: email.trim(),
    pin
  });

  persist();
  refreshPeopleSelect();
  renderPeople();
}

document.querySelector("#addPerson").addEventListener("click", () => {
  if (!isAdmin) return;

  const name = prompt("Nome do novo funcionário:");
  if (!name?.trim()) return;

  const role = prompt("Função:", "Funcionário");
  if (role === null || !role.trim()) return;

  const email = prompt("E-mail do funcionário:", "");
  if (email === null) return;

  const pin = prompt("Crie uma senha de acesso (mínimo 4 caracteres):");
  if (pin === null) return;

  if (pin.length < 4) {
    alert("A senha precisa ter pelo menos 4 caracteres.");
    return;
  }

  data.people.push({
    id: "p_" + Date.now(),
    name: name.trim(),
    role: role.trim(),
    email: email.trim(),
    pin,
    tasks: []
  });

  persist();
  refreshPeopleSelect();
  renderPeople();

  alert("Funcionário cadastrado com sucesso!");
});

/* =========================
   EDIÇÃO DAS TAREFAS
========================= */

document.querySelector("#taskPerson").addEventListener("change", () => {
  renderTaskEditor();
});

function renderTaskEditor() {
  if (!isAdmin) return;

  const p = data.people.find(x =>
    x.id === document.querySelector("#taskPerson").value
  );

  if (!p) return;

  document.querySelector("#taskEditor").innerHTML = p.tasks.map((t, i) => `
    <div class="edit-task">
      <input
        data-task-index="${i}"
        value="${esc(t)}"
      >

      <button type="button" data-remove-task="${i}">
        Remover
      </button>
    </div>
  `).join("");

  document.querySelectorAll("[data-task-index]").forEach(inp => {
    inp.addEventListener("change", () => {
      if (!isAdmin) return;

      const index = Number(inp.dataset.taskIndex);
      p.tasks[index] = inp.value.trim();

      persist();
    });
  });

  document.querySelectorAll("[data-remove-task]").forEach(btn => {
    btn.addEventListener("click", () => {
      if (!isAdmin) return;

      const index = Number(btn.dataset.removeTask);

      if (confirm("Deseja remover esta tarefa?")) {
        p.tasks.splice(index, 1);
        persist();
        renderTaskEditor();
      }
    });
  });
}

document.querySelector("#newTaskForm").addEventListener("submit", e => {
  e.preventDefault();

  if (!isAdmin) return;

  const p = data.people.find(x =>
    x.id === document.querySelector("#taskPerson").value
  );

  const value = document.querySelector("#newTask").value.trim();

  if (!p || !value) return;

  p.tasks.push(value);

  persist();

  document.querySelector("#newTask").value = "";
  renderTaskEditor();
});

/* =========================
   ACOMPANHAMENTO DIÁRIO
========================= */

function renderTracking() {
  if (!isAdmin) return;

  const date = document.querySelector("#trackingDate").value;

  if (!date) return;

  if (date < tomorrowKey()) {
    document.querySelector("#trackingSummary").innerHTML =
      '<p class="muted">O acompanhamento começa a partir de amanhã.</p>';

    document.querySelector("#trackingList").innerHTML = "";
    return;
  }

  let complete = 0;
  let pending = 0;
  let missing = 0;

  const results = data.people.map(person => {
    const submission = getSubmission(person.id, date);

    if (!submission) {
      missing++;
      return { person, submission: null, status: "missing" };
    }

    const total = submission.tasks?.length ?? person.tasks.length;
    const done = Object.values(submission.checks || {}).filter(Boolean).length;
    const isComplete = total > 0 && done === total;

    if (isComplete) {
      complete++;
    } else {
      pending++;
    }

    return {
      person,
      submission,
      status: isComplete ? "complete" : "pending",
      done,
      total
    };
  });

  document.querySelector("#trackingSummary").innerHTML = `
    <div class="tracking-summary">
      <div>
        <strong>${complete}</strong>
        <span class="muted">Concluídos</span>
      </div>

      <div>
        <strong>${pending}</strong>
        <span class="muted">Com pendências</span>
      </div>

      <div>
        <strong>${missing}</strong>
        <span class="muted">Não registrados</span>
      </div>
    </div>
  `;

  document.querySelector("#trackingList").innerHTML = results.map(r => {
    let label = "";
    let className = "";

    if (r.status === "complete") {
      label = "Concluído tudo";
      className = "status-complete";
    }

    if (r.status === "pending") {
      label = "Checklist com pendências";
      className = "status-pending";
    }

    if (r.status === "missing") {
      label = "Não realizou / não salvou";
      className = "status-missing";
    }

    const details = r.submission
      ? `
        <p>
          <b>Atividades:</b>
          ${r.done} de ${r.total} concluídas
        </p>

        <p>
          <b>Observações:</b>
          ${esc(r.submission.notes || "Nenhuma observação.")}
        </p>
      `
      : `<p>Não existe registro salvo para esta data.</p>`;

    return `
      <div class="tracking-card">
        <h4>${esc(r.person.name)} — ${esc(r.person.role)}</h4>

        <span class="tracking-status ${className}">
          ${label}
        </span>

        ${details}
      </div>
    `;
  }).join("");
}

/* =========================
   BIBLIOTECA DE PROTOCOLOS
========================= */

function renderProtocols() {
  const search = document.querySelector("#protocolSearch");
  const query = (search?.value || "").trim().toLowerCase();

  const box = document.querySelector("#protocolList");

  document.querySelector("#addProtocol").classList.toggle("hidden", !isAdmin);

  const filtered = data.protocols.filter(p => {
    const text = [
      p.name,
      p.species,
      p.symptoms,
      p.procedures,
      p.medication,
      p.home,
      p.returnInfo,
      p.notes
    ].join(" ").toLowerCase();

    return text.includes(query);
  });

  if (!filtered.length) {
    box.innerHTML = `
      <div class="panel">
        <p class="muted">
          Nenhum protocolo encontrado.
          ${isAdmin ? "Você pode cadastrar um novo protocolo." : ""}
        </p>
      </div>
    `;
    return;
  }

  box.innerHTML = filtered.map(p => `
    <article class="protocol-card">

      <h3>${esc(p.name)}</h3>

      <div class="protocol-meta">
        Espécie: ${esc(p.species || "Não informada")}
      </div>

      ${protocolSection("Sintomas e sinais clínicos", p.symptoms)}
      ${protocolSection("Avaliação e procedimentos na clínica", p.procedures)}
      ${protocolSection("Medicamentos e condutas", p.medication)}
      ${protocolSection("Tratamento e orientações em casa", p.home)}
      ${protocolSection("Quando solicitar retorno?", p.returnInfo)}
      ${protocolSection("Observações e sinais de alerta", p.notes)}

      <p class="protocol-meta" style="margin-top:15px">
        Revisão veterinária: ${esc(p.reviewer || "Não informada")}
      </p>

      ${isAdmin ? `
        <div class="protocol-actions">
          <button class="secondary small" data-edit-protocol="${esc(p.id)}">
            Editar
          </button>

          <button class="danger-button" data-delete-protocol="${esc(p.id)}">
            Excluir
          </button>
        </div>
      ` : ""}

    </article>
  `).join("");

  if (isAdmin) {
    box.querySelectorAll("[data-edit-protocol]").forEach(btn => {
      btn.addEventListener("click", () => {
        editProtocol(btn.dataset.editProtocol);
      });
    });

    box.querySelectorAll("[data-delete-protocol]").forEach(btn => {
      btn.addEventListener("click", () => {
        deleteProtocol(btn.dataset.deleteProtocol);
      });
    });
  }
}

function protocolSection(title, value) {
  if (!value || !value.trim()) return "";

  return `
    <h4>${esc(title)}</h4>
    <p>${esc(value)}</p>
  `;
}

document.querySelector("#protocolSearch").addEventListener("input", () => {
  renderProtocols();
});

document.querySelector("#addProtocol").addEventListener("click", () => {
  if (!isAdmin) return;
  openProtocolEditor();
});

function openProtocolEditor(protocol = null) {
  if (!isAdmin) return;

  editingProtocolId = protocol?.id || null;

  document.querySelector("#protocolEditorTitle").textContent =
    protocol ? "Editar protocolo" : "Cadastrar protocolo";

  document.querySelector("#protocolName").value = protocol?.name || "";
  document.querySelector("#protocolSpecies").value =
    protocol?.species || "Cães";

  document.querySelector("#protocolSymptoms").value =
    protocol?.symptoms || "";

  document.querySelector("#protocolProcedures").value =
    protocol?.procedures || "";

  document.querySelector("#protocolMedication").value =
    protocol?.medication || "";

  document.querySelector("#protocolHome").value =
    protocol?.home || "";

  document.querySelector("#protocolReturn").value =
    protocol?.returnInfo || "";

  document.querySelector("#protocolNotes").value =
    protocol?.notes || "";

  document.querySelector("#protocolReviewer").value =
    protocol?.reviewer || "";

  document.querySelector("#protocolEditor").classList.remove("hidden");

  document.querySelector("#protocolEditor").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function closeProtocolEditor() {
  editingProtocolId = null;

  document.querySelector("#protocolForm").reset();
  document.querySelector("#protocolEditor").classList.add("hidden");
}

document.querySelector("#cancelProtocol").addEventListener("click", () => {
  closeProtocolEditor();
});

document.querySelector("#protocolForm").addEventListener("submit", e => {
  e.preventDefault();

  if (!isAdmin) return;

  const protocol = {
    id: editingProtocolId || "protocol_" + Date.now(),
    name: document.querySelector("#protocolName").value.trim(),
    species: document.querySelector("#protocolSpecies").value,
    symptoms: document.querySelector("#protocolSymptoms").value.trim(),
    procedures: document.querySelector("#protocolProcedures").value.trim(),
    medication: document.querySelector("#protocolMedication").value.trim(),
    home: document.querySelector("#protocolHome").value.trim(),
    returnInfo: document.querySelector("#protocolReturn").value.trim(),
    notes: document.querySelector("#protocolNotes").value.trim(),
    reviewer: document.querySelector("#protocolReviewer").value.trim(),
    updatedAt: new Date().toISOString()
  };

  if (!protocol.name) {
    alert("Informe o nome da condição.");
    return;
  }

  if (editingProtocolId) {
    const index = data.protocols.findIndex(p => p.id === editingProtocolId);

    if (index >= 0) {
      data.protocols[index] = protocol;
    }
  } else {
    data.protocols.push(protocol);
  }

  persist();
  closeProtocolEditor();
  renderProtocols();

  alert("Protocolo salvo com sucesso!");
});

function editProtocol(id) {
  if (!isAdmin) return;

  const protocol = data.protocols.find(p => p.id === id);

  if (!protocol) return;

  openProtocolEditor(protocol);
}

function deleteProtocol(id) {
  if (!isAdmin) return;

  const protocol = data.protocols.find(p => p.id === id);

  if (!protocol) return;

  if (confirm(`Deseja excluir o protocolo "${protocol.name}"?`)) {
    data.protocols = data.protocols.filter(p => p.id !== id);

    persist();
    renderProtocols();
  }
}

/* =========================
   HISTÓRICO
========================= */

function renderHistory() {
  if (!isAdmin) return;

  const box = document.querySelector("#historyList");

  if (!data.submissions.length) {
    box.innerHTML = '<p class="muted">Nenhum checklist foi salvo ainda.</p>';
    return;
  }

  const ordered = [...data.submissions].sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  box.innerHTML = ordered.map(s => {
    const tasks = s.tasks || [];
    const total = tasks.length || Object.keys(s.checks || {}).length;
    const done = Object.values(s.checks || {}).filter(Boolean).length;

    const taskDetails = tasks.map((task, i) => `
      <p>
        ${s.checks?.[i] ? "✓" : "○"}
        ${esc(task)}
      </p>
    `).join("");

    return `
      <details class="history-card">
        <summary>
          ${formatDate(s.date)} • ${esc(s.personName)}
          — ${done}/${total} tarefas
        </summary>

        <p>
          <b>Função:</b> ${esc(s.role)}
        </p>

        <p>
          <b>Observações:</b>
          ${esc(s.notes || "Sem observações.")}
        </p>

        <div>${taskDetails}</div>
      </details>
    `;
  }).join("");
}

/* =========================
   EXPORTAÇÕES E BACKUP
========================= */

function download(filename, content, type = "application/json") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;

  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

document.querySelector("#exportHistory").addEventListener("click", () => {
  if (!isAdmin) return;

  download(
    `VetCheck-historico-${todayKey()}.json`,
    JSON.stringify(data.submissions, null, 2)
  );
});

document.querySelector("#backupAll").addEventListener("click", () => {
  if (!isAdmin) return;

  download(
    `VetCheck-backup-${todayKey()}.json`,
    JSON.stringify(data, null, 2)
  );
});

/* =========================
   SENHA ADMINISTRATIVA
========================= */

document.querySelector("#changeAdminPassword").addEventListener("submit", e => {
  e.preventDefault();

  if (!isAdmin) return;

  const pin = document.querySelector("#newAdminPassword").value;

  if (pin.length < 6) {
    alert("Use pelo menos 6 caracteres.");
    return;
  }

  data.adminPin = pin;

  persist();

  e.target.reset();

  alert("Senha administrativa alterada neste computador.");
});

/* =========================
   INICIALIZAÇÃO
========================= */

document.querySelector("#dateNow").textContent =
  new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

refreshPeopleSelect();
