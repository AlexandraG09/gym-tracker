"use strict";

(() => {
    const DB = window.GymDB;
    const S = DB.STORES;

    const state = {
        tab: "inicio",
        route: { name: "inicio" },
        stack: [],
        data: null,
        focusedMode: false,
        focusedIndex: 0,
        restDuration: 90,
        calendarMonth: startOfMonthKey(new Date()),
        calendarSelected: dateKey(new Date()),
        selectedProgressExercise: "",
        expandedExercises: new Set(),
        historyExercises: new Set()
    };

    const conteudo = document.getElementById("conteudo");
    const modalRoot = document.getElementById("modal-root");
    const toastEl = document.getElementById("toast");

    const ICONS = {
        house: '<path d="M3 11.5 12 4l9 7.5v8a1.5 1.5 0 0 1-1.5 1.5H15v-6H9v6H4.5A1.5 1.5 0 0 1 3 19.5z"/>',
        dumbbell: '<path d="M4 9v6M7 7v10M17 7v10M20 9v6M7 12h10"/>',
        chart: '<path d="M4 19V5M4 19h16M7 15l4-4 3 2 5-6"/>',
        body: '<circle cx="12" cy="5" r="2.2"/><path d="M8 11c1-2 2.3-3 4-3s3 1 4 3l1.5 4M8 11l-1.5 4M10 12v8M14 12v8"/>',
        plus: '<path d="M12 5v14M5 12h14"/>',
        x: '<path d="m6 6 12 12M18 6 6 18"/>',
        chevronRight: '<path d="m9 5 7 7-7 7"/>',
        chevronLeft: '<path d="m15 5-7 7 7 7"/>',
        chevronUp: '<path d="m5 15 7-7 7 7"/>',
        chevronDown: '<path d="m5 9 7 7 7-7"/>',
        calendar: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M7 3v4M17 3v4M3.5 9h17"/>',
        sparkles: '<path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2zM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8zM18 13l.6 1.7 1.7.6-1.7.6L18 18l-.6-2.1-1.7-.6 1.7-.6z"/>',
        play: '<path d="m8 5 11 7-11 7z" fill="currentColor" stroke="none"/>',
        check: '<path d="m5 12 4 4 10-10"/>',
        checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m7.5 12 3 3 6-6"/>',
        scale: '<path d="M5 6h14l-1 14H6z"/><path d="M9 10a3 3 0 0 1 6 0M12 10l2-2"/>',
        trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0zM9 18h6M12 13v5M8 6H4v2a4 4 0 0 0 4 4M16 6h4v2a4 4 0 0 1-4 4"/>',
        timer: '<circle cx="12" cy="13" r="8"/><path d="M12 13V9M9 3h6M16 5l1.5-1.5"/>',
        refresh: '<path d="M19 7v5h-5M5 17v-5h5M18 12a6 6 0 0 0-10-4L5 12M6 12a6 6 0 0 0 10 4l3-4"/>',
        stop: '<rect x="7" y="7" width="10" height="10" rx="1" fill="currentColor" stroke="none"/>',
        target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>',
        clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
        list: '<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>',
        repeat: '<path d="M17 2l3 3-3 3M4 9V7a2 2 0 0 1 2-2h14M7 22l-3-3 3-3M20 15v2a2 2 0 0 1-2 2H4"/>',
        trash: '<path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"/>',
        pencil: '<path d="m4 20 4.5-1 10-10-3.5-3.5-10 10zM14.5 6 18 9.5"/>',
        camera: '<path d="M4 8h4l1.5-2h5L16 8h4v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
        star: '<path d="m12 3 2.6 5.3 5.9.8-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.2 5.9-.8z"/>',
        photo: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m5 18 5-5 3 3 2-2 4 4"/>',
        arrowLeft: '<path d="M20 12H5M11 6l-6 6 6 6"/>',
        arrowRight: '<path d="M4 12h15M13 6l6 6-6 6"/>',
        arrowUpRight: '<path d="M7 17 17 7M9 7h8v8"/>',
        download: '<path d="M12 3v12M7 10l5 5 5-5M4 20h16"/>',
        upload: '<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>',
        info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>'
    };

    function icon(name, className = "") {
        const body = ICONS[name] || ICONS.info;
        return `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
    }

    function esc(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function n(value, fallback = 0) {
        const num = Number(value);
        return Number.isFinite(num) ? num : fallback;
    }

    function fmt(value, digits = 1) {
        if (value === null || value === undefined || !Number.isFinite(Number(value))) return "—";
        return Number(value).toLocaleString("pt-PT", { maximumFractionDigits: digits, minimumFractionDigits: 0 });
    }

    function fmtUnit(value, unit) {
        return value === null || value === undefined || !Number.isFinite(Number(value)) ? "—" : `${fmt(value)} ${unit}`;
    }

    function dateKey(date) {
        const d = new Date(date);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
    }

    function startOfMonthKey(date) {
        const d = new Date(date);
        d.setDate(1);
        return dateKey(d);
    }

    function dateFromKey(key) {
        const [y, m, d] = String(key).split("-").map(Number);
        return new Date(y, (m || 1) - 1, d || 1, 12, 0, 0, 0);
    }

    function formatDateLong(value) {
        const d = value instanceof Date ? value : (String(value).length === 10 ? dateFromKey(value) : new Date(value));
        if (Number.isNaN(d.getTime())) return "—";
        return new Intl.DateTimeFormat("pt-PT", { weekday: "long", day: "numeric", month: "long" }).format(d);
    }

    function formatDate(value) {
        const d = value instanceof Date ? value : (String(value).length === 10 ? dateFromKey(value) : new Date(value));
        if (Number.isNaN(d.getTime())) return "—";
        return new Intl.DateTimeFormat("pt-PT", { day: "numeric", month: "short", year: "numeric" }).format(d);
    }

    function formatDateShort(value) {
        const d = value instanceof Date ? value : (String(value).length === 10 ? dateFromKey(value) : new Date(value));
        if (Number.isNaN(d.getTime())) return "—";
        return new Intl.DateTimeFormat("pt-PT", { day: "numeric", month: "short" }).format(d);
    }

    function duration(start, finish) {
        if (!start || !finish) return "Em curso";
        const minutes = Math.max(0, Math.floor((new Date(finish) - new Date(start)) / 60000));
        if (minutes === 0) return "menos de 1 min";
        if (minutes >= 60) return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
        return `${minutes} min`;
    }

    function sameDay(a, b) {
        return dateKey(a) === dateKey(b);
    }

    function toast(message) {
        toastEl.textContent = message;
        toastEl.classList.add("mostrar");
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => toastEl.classList.remove("mostrar"), 2200);
    }

    function confirmAction(message) {
        return window.confirm(message);
    }

    async function loadData() {
        const [workouts, exercises, sessions, exerciseSets, measurements, scheduledWorkouts, weeklyRoutines] = await Promise.all([
            DB.all(S.workouts), DB.all(S.exercises), DB.all(S.sessions), DB.all(S.exerciseSets),
            DB.all(S.measurements), DB.all(S.scheduledWorkouts), DB.all(S.weeklyRoutines)
        ]);
        state.data = { workouts, exercises, sessions, exerciseSets, measurements, scheduledWorkouts, weeklyRoutines };
        return state.data;
    }

    function workoutsSorted() {
        return [...state.data.workouts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    function exercisesFor(workoutId) {
        return state.data.exercises.filter((x) => x.workoutId === workoutId).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    function sessionsFor(workoutId) {
        return state.data.sessions.filter((x) => x.workoutId === workoutId).sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
    }

    function setsForExercise(exerciseId) {
        return state.data.exerciseSets.filter((x) => x.exerciseId === exerciseId).sort((a, b) => new Date(b.performedAt) - new Date(a.performedAt));
    }

    function sessionSets(sessionId) {
        return state.data.exerciseSets.filter((x) => x.sessionId === sessionId);
    }

    function activeSession() {
        return [...state.data.sessions].sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt)).find((x) => !x.finishedAt) || null;
    }

    function completedSessions() {
        return state.data.sessions.filter((x) => x.finishedAt);
    }

    function weekInterval(date = new Date()) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        const start = new Date(d);
        start.setDate(d.getDate() + diff);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(start.getDate() + 7);
        return [start, end];
    }

    function pageHeader(title, subtitle, button = "") {
        return `<header class="cabecalho-pagina"><div class="texto"><h1 class="titulo-grande">${esc(title)}</h1>${subtitle ? `<p class="subtitulo">${esc(subtitle)}</p>` : ""}</div>${button}</header>`;
    }

    function backButton() {
        return `<button class="botao-voltar" type="button" data-action="back">${icon("chevronLeft")} Voltar</button>`;
    }

    function metricCard(title, value, iconName, tone = "rosa") {
        return `<div class="cartao cartao-metrica"><div class="icone-metrica ${tone}">${icon(iconName)}</div><div class="valor-metrica">${esc(value)}</div><div class="nome-metrica">${esc(title)}</div></div>`;
    }

    function emptyCard(iconName, title, text) {
        return `<div class="cartao estado-vazio"><div class="vazio-icone">${icon(iconName)}</div><h3>${esc(title)}</h3><p>${esc(text)}</p></div>`;
    }

    function lineChart(points, unit = "") {
        if (!points.length) return '<div class="grafico-vazio">Ainda não há dados suficientes.</div>';
        const w = 620, h = 180, padL = 36, padR = 12, padT = 14, padB = 28;
        const values = points.map((p) => n(p.value));
        const min = Math.min(0, ...values);
        const max = Math.max(...values, 1);
        const range = max - min || 1;
        const usableW = w - padL - padR;
        const usableH = h - padT - padB;
        const coords = points.map((p, i) => ({
            x: padL + (points.length === 1 ? usableW / 2 : i * usableW / (points.length - 1)),
            y: padT + (max - n(p.value)) / range * usableH,
            label: p.label,
            value: p.value
        }));
        const path = coords.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
        const labels = coords.map((p) => `<text x="${p.x}" y="${h - 7}" text-anchor="middle">${esc(p.label)}</text>`).join("");
        const dots = coords.map((p) => `<circle class="ponto" cx="${p.x}" cy="${p.y}" r="4"><title>${fmt(p.value)} ${esc(unit)}</title></circle>`).join("");
        const grids = [0, .5, 1].map((r) => `<line class="grid" x1="${padL}" y1="${padT + r * usableH}" x2="${w - padR}" y2="${padT + r * usableH}"/>`).join("");
        return `<svg class="grafico" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">${grids}<path class="linha" d="${path}"/>${dots}${labels}</svg>`;
    }

    function barChart(points, tone = "lavanda") {
        if (!points.length) return '<div class="grafico-vazio">Ainda não há dados suficientes.</div>';
        const w = 620, h = 180, padL = 28, padR = 10, padT = 12, padB = 28;
        const max = Math.max(...points.map((p) => n(p.value)), 1);
        const usableW = w - padL - padR;
        const usableH = h - padT - padB;
        const step = usableW / points.length;
        const barW = Math.min(42, step * .58);
        const bars = points.map((p, i) => {
            const bh = n(p.value) / max * usableH;
            const x = padL + i * step + (step - barW) / 2;
            const y = padT + usableH - bh;
            const cls = tone === "rosa" ? "barra-rosa" : "barra";
            return `<rect class="${cls}" x="${x}" y="${y}" width="${barW}" height="${Math.max(1, bh)}" rx="5"><title>${fmt(p.value)}</title></rect><text x="${x + barW / 2}" y="${h - 7}" text-anchor="middle">${esc(p.label)}</text>`;
        }).join("");
        return `<svg class="grafico" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">${bars}</svg>`;
    }

    async function render() {
        await loadData();
        let html = "";
        switch (state.route.name) {
            case "inicio": html = renderHome(); break;
            case "treinos": html = renderWorkouts(); break;
            case "workout": html = renderWorkoutDetail(state.route.id); break;
            case "exercise": html = renderExerciseDetail(state.route.id); break;
            case "session": html = renderSession(state.route.id, !!state.route.summary); break;
            case "calendar": html = renderCalendar(); break;
            case "evolucao": html = renderProgress(); break;
            case "corpo": html = renderBody(); break;
            default: html = renderHome();
        }
        conteudo.innerHTML = html;
        updateTabbar();
        injectTabIcons();
        updateTimer();
    }

    function updateTabbar() {
        document.querySelectorAll("[data-tab]").forEach((button) => {
            button.classList.toggle("ativo", button.dataset.tab === state.tab);
        });
    }

    function injectTabIcons() {
        document.querySelectorAll("[data-icon]").forEach((el) => {
            el.innerHTML = icon(el.dataset.icon);
        });
    }

    function renderHome() {
        const workouts = workoutsSorted();
        const active = activeSession();
        const completed = completedSessions();
        const [weekStart, weekEnd] = weekInterval();
        const completedWeek = completed.filter((s) => new Date(s.finishedAt) >= weekStart && new Date(s.finishedAt) < weekEnd).length;
        const highest = state.data.exerciseSets.length ? Math.max(...state.data.exerciseSets.map((s) => n(s.weight))) : null;
        const measurements = [...state.data.measurements].sort((a, b) => dateFromKey(b.date) - dateFromKey(a.date));
        const latestWeight = measurements.find((m) => m.weight !== null && m.weight !== undefined)?.weight;
        const latestFat = measurements.find((m) => m.bodyFat !== null && m.bodyFat !== undefined)?.bodyFat;
        const latestMuscle = measurements.find((m) => m.muscleMass !== null && m.muscleMass !== undefined)?.muscleMass;
        const lastCompleted = [...completed].sort((a, b) => new Date(b.finishedAt) - new Date(a.finishedAt))[0];

        const seven = [];
        const today = new Date();
        today.setHours(0,0,0,0);
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today); d.setDate(today.getDate() - i);
            const count = completed.filter((s) => sameDay(s.finishedAt, d)).length;
            seven.push({ label: new Intl.DateTimeFormat("pt-PT", { weekday: "short" }).format(d).replace(".", ""), value: count });
        }

        let next = "";
        if (active) {
            next = `<div class="cartao"><span class="rotulo-caps">${icon("sparkles")} O TEU PRÓXIMO PASSO</span><h2 style="margin:15px 0 5px;font-size:22px">Tens um treino em curso</h2><p class="subtitulo" style="margin:0 0 15px">${esc(active.workoutName)}</p><button class="botao-principal" data-action="open-session" data-id="${esc(active.id)}">${icon("play")} Continuar treino</button><p class="pequeno muted" style="margin-bottom:0">Retoma a sessão que já começaste.</p></div>`;
        } else if (!workouts.length) {
            next = `<div class="cartao"><span class="rotulo-caps">${icon("sparkles")} O TEU PRÓXIMO PASSO</span><h2 style="margin:15px 0 5px;font-size:22px">Vamos começar?</h2><p class="subtitulo" style="margin:0 0 14px">Cria o teu primeiro plano de treino.</p><div class="linha acento forte texto-sm">${icon("dumbbell")} Abre o separador Treinos</div></div>`;
        } else {
            next = `<div class="cartao"><span class="rotulo-caps">${icon("sparkles")} O TEU PRÓXIMO PASSO</span><h2 style="margin:15px 0 5px;font-size:22px">Pronta para treinar?</h2><p class="subtitulo" style="margin:0">Escolhe um dos teus planos para começar.</p><div class="lista-plano">${workouts.slice(0,3).map((w) => `<button class="item-plano" data-action="open-workout" data-id="${esc(w.id)}">${icon("dumbbell")}<span>${esc(w.name)}</span>${icon("chevronRight")}</button>`).join("")}</div></div>`;
        }

        return `<div class="pagina">
            <header style="padding-top:16px;margin-bottom:22px"><h1 class="titulo-grande" style="font-size:32px">Olá! ✨</h1><p class="subtitulo">O teu progresso, num só lugar</p><div class="data-cabecalho">${esc(formatDateLong(new Date()))}</div></header>
            <div class="pilha-lg">${next}
                <section><h2 class="secao-titulo">O teu resumo</h2><div class="grelha-2">${metricCard("Esta semana", `${completedWeek} treinos`, "calendar", "rosa")}${metricCard("Séries registadas", `${state.data.exerciseSets.length}`, "checkCircle", "lavanda")}${metricCard("Último peso", fmtUnit(latestWeight, "kg"), "scale", "rosa")}${metricCard("Maior carga", fmtUnit(highest, "kg"), "trophy", "lavanda")}</div></section>
                <div class="cartao"><h3 style="margin:0">Atividade dos últimos 7 dias</h3><p class="pequeno muted">Sessões concluídas por dia</p>${barChart(seven, "rosa")}</div>
                <div class="cartao"><div class="linha"><div class="linha forte">${icon("body")} Composição corporal</div><span class="espaco"></span>${measurements[0] ? `<span class="pequeno muted">${esc(formatDateShort(measurements[0].date))}</span>` : ""}</div>${measurements.length ? `<div class="grelha-2" style="margin-top:16px"><div><div class="valor-metrica acento">${fmtUnit(latestFat, "%")}</div><div class="nome-metrica">Massa gorda</div></div><div><div class="valor-metrica acento">${fmtUnit(latestMuscle, "%")}</div><div class="nome-metrica">Massa muscular</div></div></div>` : `<p class="texto-sm muted">Ainda não tens medições corporais.</p>`}<p class="pequeno muted" style="margin-bottom:0">Consulta o separador Corpo para veres as medições e fotografias.</p></div>
                <div class="cartao"><div class="linha forte">${icon("clock")} Último treino concluído</div>${lastCompleted ? `<h3 style="margin:14px 0 5px">${esc(lastCompleted.workoutName)}</h3><div class="texto-sm muted">${esc(formatDate(lastCompleted.finishedAt))}</div><button class="botao-link" style="margin-top:12px" data-action="open-session" data-id="${esc(lastCompleted.id)}">Consultar sessão ${icon("arrowUpRight")}</button>` : `<p class="texto-sm muted">Ainda não terminaste nenhuma sessão.</p>`}</div>
            </div>
        </div>`;
    }

    function renderWorkouts() {
        const workouts = workoutsSorted();
        const addButton = `<button class="botao-circular" type="button" data-action="new-workout" aria-label="Adicionar treino">${icon("plus")}</button>`;
        const cards = workouts.length ? workouts.map((w) => `<button class="item-navegavel" type="button" data-action="open-workout" data-id="${esc(w.id)}"><span class="icone-bloco">${icon("dumbbell")}</span><span class="espaco"><span class="forte" style="display:block">${esc(w.name)}</span><span class="pequeno muted" style="display:block;margin-top:5px">${esc(w.muscleGroup || "Sem grupo muscular")}</span></span><span class="chevron">${icon("chevronRight")}</span></button>`).join("") : emptyCard("dumbbell", "Ainda não tens treinos", "Adiciona o teu primeiro plano.");
        return `<div class="pagina">${pageHeader("Os meus treinos", "Organiza os teus planos de treino", addButton)}<div class="pilha-lg"><button class="item-navegavel" data-action="open-calendar"><span class="icone-bloco lavanda">${icon("calendar")}</span><span class="espaco"><span class="forte" style="display:block">Calendário</span><span class="pequeno muted" style="display:block;margin-top:5px">Planear e consultar treinos</span></span><span class="chevron">${icon("chevronRight")}</span></button><div class="pilha">${cards}</div></div></div>`;
    }

    function renderWorkoutDetail(id) {
        const workout = state.data.workouts.find((w) => w.id === id);
        if (!workout) return `<div class="pagina">${backButton()}${emptyCard("info", "Treino não encontrado", "Este treino pode ter sido eliminado.")}</div>`;
        const exercises = exercisesFor(id);
        const sessions = sessionsFor(id);
        const active = sessions.find((s) => !s.finishedAt);
        return `<div class="pagina">${backButton()}
            <div class="cabecalho-pagina"><div class="texto"><h1 class="titulo-grande">${esc(workout.name)}</h1><p class="subtitulo">${esc(workout.muscleGroup || "Plano de treino")}</p></div><button class="botao-circular" data-action="add-exercise" data-workout-id="${esc(id)}">${icon("plus")}</button></div>
            <div class="pilha-lg">
                <div class="cartao"><div class="linha"><span class="icone-bloco">${icon("dumbbell")}</span><div class="espaco"><div class="forte">Informações do treino</div><div class="pequeno muted" style="margin-top:5px">${exercises.length} exercício${exercises.length === 1 ? "" : "s"}</div></div></div><div class="linha" style="margin-top:14px"><button class="botao-secundario espaco" data-action="edit-workout" data-id="${esc(id)}">${icon("pencil")} Editar</button><button class="botao-secundario botao-perigo" data-action="delete-workout" data-id="${esc(id)}">${icon("trash")} Eliminar</button></div></div>
                ${active ? `<button class="botao-principal" data-action="open-session" data-id="${esc(active.id)}">${icon("play")} Continuar treino em curso</button>` : `<button class="botao-principal" data-action="start-session" data-id="${esc(id)}">${icon("play")} Começar treino</button>`}
                <section><div class="secao-cabecalho"><h2 class="secao-titulo">Exercícios</h2><button class="botao-link" data-action="add-exercise" data-workout-id="${esc(id)}">+ Adicionar</button></div>${exercises.length ? `<div class="pilha">${exercises.map((e) => workoutExerciseItem(e)).join("")}</div>` : emptyCard("dumbbell", "Sem exercícios", "Adiciona exercícios a este plano.")}</section>
                <section><h2 class="secao-titulo">Sessões</h2>${sessions.length ? `<div class="pilha">${sessions.map((s) => `<button class="item-navegavel" data-action="open-session" data-id="${esc(s.id)}"><span class="icone-bloco ${s.finishedAt ? "lavanda" : ""}">${s.finishedAt ? icon("checkCircle") : icon("clock")}</span><span class="espaco"><span class="forte" style="display:block">${s.finishedAt ? "Treino concluído" : "Treino em curso"}</span><span class="pequeno muted" style="display:block;margin-top:4px">${esc(formatDate(s.startedAt))}${s.finishedAt ? ` · ${esc(duration(s.startedAt, s.finishedAt))}` : ""}</span></span><span class="chevron">${icon("chevronRight")}</span></button>`).join("")}</div>` : `<div class="cartao texto-sm muted">Ainda não há sessões deste treino.</div>`}</section>
            </div>
        </div>`;
    }

    function workoutExerciseItem(e) {
        return `<div class="cartao"><button class="linha" style="width:100%;border:0;background:transparent;text-align:left;color:inherit;padding:0" data-action="open-exercise" data-id="${esc(e.id)}"><span class="exercicio-foto">${e.photoData ? `<img src="${esc(e.photoData)}" alt="">` : icon("dumbbell")}</span><span class="espaco"><span class="forte" style="display:block">${esc(e.name)}</span><span class="pequeno muted" style="display:block;margin-top:5px">${esc(e.muscleGroup || "")} ${e.muscleGroup ? "· " : ""}${n(e.sets,3)} séries · ${esc(e.repetitions || "10-12")} reps</span><span class="pequeno acento forte" style="display:block;margin-top:5px">${fmtUnit(e.targetWeight, "kg")}</span></span><span class="chevron acento">${icon("chevronRight")}</span></button><div class="linha" style="margin-top:12px"><button class="botao-secundario espaco" data-action="edit-exercise" data-id="${esc(e.id)}">${icon("pencil")} Editar</button><button class="botao-secundario botao-perigo" data-action="delete-exercise" data-id="${esc(e.id)}">${icon("trash")}</button></div></div>`;
    }

    function exerciseNameForSet(set) {
        return state.data.exercises.find((e) => e.id === set.exerciseId)?.name || set.exerciseName || "Exercício";
    }

    function renderExerciseDetail(id) {
        const e = state.data.exercises.find((x) => x.id === id);
        if (!e) return `<div class="pagina">${backButton()}${emptyCard("info", "Exercício não encontrado", "Este exercício pode ter sido eliminado.")}</div>`;
        const sets = setsForExercise(id);
        const byDay = new Map();
        sets.forEach((s) => {
            const key = dateKey(s.performedAt);
            const current = byDay.get(key);
            if (!current || n(s.weight) > n(current.weight)) byDay.set(key, s);
        });
        const points = [...byDay.entries()].sort((a,b) => dateFromKey(a[0]) - dateFromKey(b[0])).map(([key,s]) => ({ label: new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "2-digit" }).format(dateFromKey(key)), value: n(s.weight) }));
        return `<div class="pagina">${backButton()}<div class="cabecalho-pagina"><div class="texto"><h1 class="titulo-grande" style="font-size:26px">${esc(e.name)}</h1><p class="subtitulo">${esc(e.muscleGroup || "Exercício")}</p></div></div><div class="pilha-lg">
            <div class="cartao"><div style="min-height:130px;display:grid;place-items:center;border-radius:18px;overflow:hidden;background:rgba(241,196,215,.2)">${e.photoData ? `<img src="${esc(e.photoData)}" alt="Fotografia de ${esc(e.name)}" style="max-height:220px;object-fit:contain;width:100%">` : `<div class="acento">${icon("dumbbell")}</div>`}</div><button class="botao-secundario" style="width:100%;margin-top:12px" data-action="change-exercise-photo" data-id="${esc(e.id)}">${icon("camera")} Alterar fotografia</button></div>
            <div class="cartao"><div class="linha forte">${icon("info")} Detalhes do exercício</div><div class="chips" style="margin-top:14px"><span class="chip">${n(e.sets,3)} séries</span><span class="chip">${esc(e.repetitions)} reps</span><span class="chip">${fmtUnit(e.targetWeight,"kg")}</span></div>${e.notes ? `<p class="texto-sm muted" style="white-space:pre-wrap">${esc(e.notes)}</p>` : ""}<button class="botao-secundario" style="width:100%;margin-top:10px" data-action="edit-exercise" data-id="${esc(e.id)}">${icon("pencil")} Editar detalhes</button></div>
            <div class="cartao"><h3 style="margin-top:0">Registar série</h3><form id="manual-set-form" data-exercise-id="${esc(e.id)}" class="formulario"><div class="campo"><label>Data do treino</label><input name="date" type="date" max="${dateKey(new Date())}" value="${dateKey(new Date())}"></div><div class="campos-2"><div class="campo"><label>Carga (kg)</label><input name="weight" type="number" min="0" step="0.1" value="${esc(e.targetWeight || 0)}" required></div><div class="campo"><label>Repetições</label><input name="reps" type="number" min="1" max="100" step="1" value="10" required></div></div><button class="botao-principal" type="submit">${icon("plus")} Guardar série</button></form></div>
            <div class="cartao"><h3 style="margin:0">Progressão de carga</h3><p class="pequeno muted">Melhor carga registada por dia</p>${lineChart(points,"kg")}</div>
            <div class="cartao"><h3 style="margin-top:0">Histórico de séries</h3>${sets.length ? sets.map((s) => `<div class="set-row"><div class="espaco"><div class="pequeno muted">${esc(formatDate(s.performedAt))}</div><div class="texto-sm forte" style="margin-top:3px">Série ${n(s.setNumber,1)}</div></div><div class="texto-sm forte">${fmt(s.weight)} kg · ${n(s.repetitions)} reps</div></div>`).join("") : `<p class="texto-sm muted">Ainda não há séries registadas.</p>`}</div>
        </div></div>`;
    }

    function sessionExerciseSets(sessionId, exerciseId) {
        return state.data.exerciseSets
            .filter((s) => s.sessionId === sessionId && s.exerciseId === exerciseId)
            .sort((a, b) => n(a.setNumber) - n(b.setNumber) || new Date(a.performedAt) - new Date(b.performedAt));
    }

    function previousSetsForExercise(exerciseId, session) {
        const history = state.data.exerciseSets
            .filter((s) => s.exerciseId === exerciseId && s.sessionId !== session.id && new Date(s.performedAt) < new Date(session.startedAt))
            .sort((a,b) => new Date(b.performedAt) - new Date(a.performedAt));
        if (!history.length) return [];
        const latest = history[0];
        if (latest.sessionId) {
            return history.filter((s) => s.sessionId === latest.sessionId).sort((a,b) => n(a.setNumber) - n(b.setNumber));
        }
        const key = dateKey(latest.performedAt);
        return history.filter((s) => !s.sessionId && dateKey(s.performedAt) === key).sort((a,b) => n(a.setNumber) - n(b.setNumber));
    }

    function defaultReps(text) {
        const match = String(text || "").match(/\d+/);
        return match ? Math.min(100, Math.max(1, Number(match[0]))) : 10;
    }

    function renderSession(id, summary) {
        const session = state.data.sessions.find((s) => s.id === id);
        if (!session) return `<div class="pagina">${backButton()}${emptyCard("info", "Sessão não encontrada", "Esta sessão pode ter sido eliminada.")}</div>`;
        if (summary) return renderSessionSummary(session);

        const exercises = exercisesFor(session.workoutId);
        const sSets = sessionSets(id);
        const targetSets = exercises.reduce((sum, e) => sum + Math.max(0, n(e.sets)), 0);
        const performed = sSets.length;
        const progress = targetSets ? Math.min(100, performed / targetSets * 100) : 0;
        const completedExercises = exercises.filter((e) => n(e.sets) > 0 && sessionExerciseSets(id, e.id).length >= n(e.sets)).length;
        if (state.focusedIndex >= exercises.length) state.focusedIndex = Math.max(0, exercises.length - 1);

        const timerCard = session.finishedAt ? `<button class="botao-principal" data-action="session-summary" data-id="${esc(id)}">${icon("chart")} Ver resumo da sessão</button>` : `<div class="cartao"><div class="linha"><div class="linha forte">${icon("timer")} Descanso</div><span class="espaco"></span><span class="timer-numero" id="rest-timer">${formatTimer(state.restDuration)}</span></div><div class="segmentado segmentado-3" style="margin-top:14px">${[60,90,120].map((v) => `<button class="${state.restDuration === v ? "ativo" : ""}" data-action="rest-duration" data-value="${v}">${v} s</button>`).join("")}</div><div class="grelha-2" style="margin-top:12px"><button class="botao-secundario" data-action="rest-restart">${icon("refresh")} Reiniciar</button><button class="botao-secundario botao-lavanda" data-action="rest-stop">${icon("stop")} Parar</button></div></div>`;

        let exerciseContent = "";
        if (!exercises.length) {
            exerciseContent = emptyCard("dumbbell", "Sem exercícios neste plano", "Adiciona exercícios ao treino antes de iniciares uma sessão.");
        } else if (state.focusedMode) {
            const e = exercises[state.focusedIndex];
            exerciseContent = `<div class="pilha"><div class="cartao"><div class="linha"><span class="rotulo-caps">${icon("target")} Modo focado</span><span class="espaco"></span><span class="texto-sm forte">${state.focusedIndex + 1} de ${exercises.length}</span></div><div class="progresso" style="margin-top:12px"><span style="width:${((state.focusedIndex + 1) / exercises.length * 100).toFixed(1)}%"></span></div></div>${renderSessionExerciseCard(e, session, true)}<div class="grelha-2"><button class="botao-secundario botao-lavanda" data-action="focus-prev" ${state.focusedIndex === 0 ? "disabled" : ""}>${icon("chevronLeft")} Anterior</button><button class="botao-secundario" data-action="focus-next" ${state.focusedIndex >= exercises.length - 1 ? "disabled" : ""}>Seguinte ${icon("chevronRight")}</button></div></div>`;
        } else {
            exerciseContent = `<section><div class="secao-cabecalho"><h2 class="secao-titulo">Exercícios</h2><span class="pequeno acento forte">${completedExercises}/${exercises.length} concluídos</span></div><div class="pilha">${exercises.map((e) => renderSessionExerciseCard(e, session, false)).join("")}</div></section>`;
        }

        return `<div class="pagina">${backButton()}<div class="pilha-lg"><div class="cartao"><div class="linha linha-topo"><div class="espaco"><h1 style="font-size:22px;margin:0 0 6px">${esc(session.workoutName)}</h1><div class="pequeno muted">${esc(formatDate(session.startedAt))}</div></div><span class="acento">${session.finishedAt ? icon("checkCircle") : icon("dumbbell")}</span></div><div class="linha texto-sm forte acento" style="margin-top:14px">${session.finishedAt ? icon("checkCircle") + " Treino concluído" : icon("clock") + " Treino em curso"}</div><div class="linha texto-sm" style="margin-top:14px"><span>Progresso do treino</span><span class="espaco"></span><span class="forte acento">${performed}/${targetSets} séries</span></div><div class="progresso" style="margin-top:8px"><span style="width:${progress.toFixed(1)}%"></span></div>${session.finishedAt ? `<div class="pequeno muted" style="margin-top:10px">Duração: ${esc(duration(session.startedAt, session.finishedAt))}</div>` : ""}</div>
            ${timerCard}
            <div><div class="linha" style="margin-bottom:9px"><span class="texto-sm forte">Visualização</span><span class="espaco"></span><span class="pequeno muted">${state.focusedMode ? "Um exercício" : "Todos os exercícios"}</span></div><div class="segmentado"><button class="${!state.focusedMode ? "ativo" : ""}" data-action="session-mode" data-value="normal">Normal</button><button class="${state.focusedMode ? "ativo" : ""}" data-action="session-mode" data-value="focused">Focado</button></div></div>
            ${exerciseContent}
            ${!session.finishedAt ? `<button class="botao-principal" style="padding:16px" data-action="finish-session" data-id="${esc(id)}">${icon("checkCircle")} Terminar treino</button>` : ""}
        </div></div>`;
    }

    function renderSessionExerciseCard(e, session, focused) {
        const recorded = sessionExerciseSets(session.id, e.id);
        const previous = previousSetsForExercise(e.id, session);
        const expanded = focused || state.expandedExercises.has(e.id) || !state.expandedExercises.has(`collapsed:${e.id}`);
        const historyOpen = state.historyExercises.has(e.id);
        const lastRecorded = recorded[recorded.length - 1];
        const lastPrevious = previous[previous.length - 1];
        const suggestedWeight = lastRecorded?.weight ?? lastPrevious?.weight ?? e.targetWeight ?? 0;
        const suggestedReps = lastRecorded?.repetitions ?? lastPrevious?.repetitions ?? defaultReps(e.repetitions);
        const nextNumber = recorded.reduce((m, s) => Math.max(m, n(s.setNumber)), 0) + 1;
        const reached = n(e.sets) > 0 && recorded.length >= n(e.sets);

        return `<div class="cartao exercicio-card" data-exercise-card="${esc(e.id)}" data-session-id="${esc(session.id)}"><button type="button" class="exercicio-head" style="width:100%;border:0;background:transparent;text-align:left;color:inherit;padding:0" ${focused ? "disabled" : `data-action="toggle-exercise" data-id="${esc(e.id)}"`}><span class="exercicio-foto ${focused ? "grande" : ""}">${e.photoData ? `<img src="${esc(e.photoData)}" alt="">` : icon("dumbbell")}</span><span class="espaco"><span class="${focused ? "forte" : "forte"}" style="display:block;font-size:${focused ? "18px" : "16px"}">${esc(e.name)}</span><span class="pequeno muted" style="display:block;margin-top:5px">${n(e.sets,3)} séries · ${esc(e.repetitions || "10-12")} reps</span><span class="pequeno acento forte" style="display:block;margin-top:5px">${recorded.length}/${n(e.sets,3)} séries ${reached ? "✓" : ""}</span></span>${focused ? "" : `<span class="acento">${icon(expanded ? "chevronUp" : "chevronDown")}</span>`}</button>${expanded ? `<div class="exercicio-conteudo"><div class="progresso"><span style="width:${Math.min(100, recorded.length / Math.max(1,n(e.sets,3)) * 100).toFixed(1)}%"></span></div>${recorded.length ? `<div><div class="texto-sm forte" style="margin-bottom:5px">Séries realizadas</div>${recorded.map((s) => `<div class="set-row"><span class="set-check">${icon("checkCircle")}</span><div class="espaco"><div class="pequeno forte">Série ${n(s.setNumber)}</div><div class="pequeno muted">${fmt(s.weight)} kg × ${n(s.repetitions)} reps</div></div>${!session.finishedAt ? `<button class="botao-icone" data-action="edit-set" data-id="${esc(s.id)}">${icon("pencil")}</button><button class="botao-icone perigo" data-action="delete-set" data-id="${esc(s.id)}">${icon("trash")}</button>` : ""}</div>`).join("")}</div>` : ""}${!session.finishedAt ? `<hr class="separador"><div><div class="linha"><span class="texto-sm forte">${icon("plus")} Nova série</span><span class="espaco"></span><span class="pequeno acento forte">Série ${nextNumber}</span></div><div class="grelha-2" style="margin-top:12px"><div class="controlo-numero"><span class="pequeno muted">Carga (kg)</span><input class="weight-input" type="number" min="0" step="0.1" value="${esc(suggestedWeight)}"><div class="controlo-botoes"><button type="button" data-action="adjust-weight" data-delta="-2.5">−</button><button type="button" data-action="adjust-weight" data-delta="2.5">+</button></div></div><div class="controlo-numero lavanda"><span class="pequeno muted">Repetições</span><input class="reps-input" type="number" min="1" max="100" step="1" value="${esc(suggestedReps)}"><div class="controlo-botoes"><button type="button" data-action="adjust-reps" data-delta="-1">−</button><button type="button" data-action="adjust-reps" data-delta="1">+</button></div></div></div><button class="botao-principal" style="margin-top:12px" data-action="save-session-set" data-exercise-id="${esc(e.id)}" data-session-id="${esc(session.id)}">${icon("checkCircle")} Registar série ${nextNumber}</button>${reached ? `<p class="pequeno muted" style="margin-bottom:0">Objetivo atingido. Podes continuar a registar séries extra.</p>` : ""}</div>` : ""}<div class="historico-cargas"><button class="botao-link" style="width:100%;display:flex;align-items:center;gap:7px;text-align:left" data-action="toggle-history" data-id="${esc(e.id)}">${icon("clock")} Cargas anteriores <span class="espaco"></span>${icon(historyOpen ? "chevronUp" : "chevronDown")}</button>${historyOpen ? (previous.length ? `<div style="margin-top:8px">${previous.map((s) => `<div class="linha pequeno muted" style="padding:4px 0"><span>Série ${n(s.setNumber)}</span><span class="espaco"></span><span>${fmt(s.weight)} kg × ${n(s.repetitions)} reps</span></div>`).join("")}</div>` : `<p class="pequeno muted" style="margin-bottom:0">Ainda não há registos anteriores.</p>`) : ""}</div></div>` : ""}</div>`;
    }

    function renderSessionSummary(session) {
        const sets = sessionSets(session.id);
        const grouped = new Map();
        sets.forEach((s) => {
            const key = s.exerciseId || s.exerciseName || "unknown";
            if (!grouped.has(key)) grouped.set(key, []);
            grouped.get(key).push(s);
        });
        const results = [...grouped.entries()].map(([key, items]) => {
            const name = exerciseNameForSet(items[0]);
            const best = Math.max(...items.map((s) => n(s.weight)));
            const previousWeights = state.data.exerciseSets.filter((s) => (s.exerciseId === key || (!s.exerciseId && s.exerciseName === name)) && s.sessionId !== session.id && new Date(s.performedAt) < new Date(session.startedAt)).map((s) => n(s.weight));
            const prevMax = previousWeights.length ? Math.max(...previousWeights) : null;
            return {
                name,
                setCount: items.length,
                repetitions: items.reduce((a,s) => a + n(s.repetitions),0),
                volume: items.reduce((a,s) => a + n(s.weight) * n(s.repetitions),0),
                bestWeight: best,
                isRecord: prevMax === null ? true : best > prevMax
            };
        }).sort((a,b) => a.name.localeCompare(b.name, "pt-PT"));
        const records = results.filter((r) => r.isRecord);
        const totalVolume = sets.reduce((a,s) => a + n(s.weight) * n(s.repetitions),0);
        const totalReps = sets.reduce((a,s) => a + n(s.repetitions),0);

        return `<div class="pagina">${backButton()}<div class="pilha-lg"><div style="text-align:center;padding:12px 0"><div class="vazio-icone" style="margin:0 auto 12px;width:82px;height:82px;border-radius:50%">${icon("trophy")}</div><h1 class="titulo-grande" style="font-size:27px">${session.finishedAt ? "Treino concluído!" : "Resumo da sessão"}</h1><p class="subtitulo">${esc(session.workoutName)}</p><div class="pequeno muted">${esc(formatDate(session.startedAt))}</div></div>
            <div class="grelha-2">${metricCard("Duração", duration(session.startedAt,session.finishedAt), "clock", "rosa")}${metricCard("Séries", String(sets.length), "checkCircle", "lavanda")}${metricCard("Volume total", `${fmt(totalVolume)} kg`, "dumbbell", "lavanda")}${metricCard("Exercícios", String(results.length), "list", "rosa")}</div>
            <div class="cartao"><div class="linha forte">${icon("trophy")} Recordes pessoais</div>${records.length ? `<p class="texto-sm forte acento">${records.length} ${records.length === 1 ? "recorde de carga" : "recordes de carga"}</p>${records.map((r) => `<div class="linha texto-sm" style="padding:6px 0"><span class="acento">${icon("star")}</span><span class="forte">${esc(r.name)}</span><span class="espaco"></span><span class="forte acento">${fmt(r.bestWeight)} kg</span></div>`).join("")}` : `<p class="texto-sm muted">Nesta sessão não superaste nenhuma carga máxima anterior.</p>`}</div>
            <div class="cartao"><div class="linha forte">${icon("list")} Resumo por exercício</div>${results.length ? results.map((r) => `<div style="padding:14px 0;border-bottom:1px solid rgba(125,111,135,.1)"><div class="texto-sm forte" style="margin-bottom:8px">${esc(r.name)}</div><div class="linha pequeno muted"><span>Séries</span><span class="espaco"></span><span>${r.setCount}</span></div><div class="linha pequeno muted"><span>Repetições</span><span class="espaco"></span><span>${r.repetitions}</span></div><div class="linha pequeno muted"><span>Volume</span><span class="espaco"></span><span>${fmt(r.volume)} kg</span></div><div class="linha pequeno muted"><span>Melhor carga</span><span class="espaco"></span><span>${fmt(r.bestWeight)} kg</span></div></div>`).join("") + `<div class="linha texto-sm forte" style="padding-top:12px"><span>Repetições totais</span><span class="espaco"></span><span class="acento">${totalReps}</span></div>` : `<p class="texto-sm muted">Esta sessão não tem séries registadas.</p>`}</div>
            <button class="botao-principal" style="padding:16px" data-action="back-to-workouts">${icon("arrowLeft")} Voltar aos treinos</button>
        </div></div>`;
    }

    function routinesOn(date) {
        const key = dateKey(date);
        const day = date instanceof Date ? date : dateFromKey(key);
        const weekday = day.getDay();
        return state.data.weeklyRoutines.filter((r) => {
            if (n(r.weekday) !== weekday) return false;
            if (key < r.startDate) return false;
            if (r.endDate && key > r.endDate) return false;
            return true;
        });
    }

    function plannedOn(date) {
        const key = dateKey(date);
        return state.data.scheduledWorkouts.filter((p) => p.date === key);
    }

    function completedOn(date) {
        const key = dateKey(date);
        return completedSessions().filter((s) => dateKey(s.finishedAt) === key);
    }

    function renderCalendar() {
        const monthDate = dateFromKey(state.calendarMonth);
        monthDate.setDate(1);
        const selected = dateFromKey(state.calendarSelected);
        const y = monthDate.getFullYear(), m = monthDate.getMonth();
        const daysInMonth = new Date(y, m + 1, 0).getDate();
        const firstDay = new Date(y, m, 1).getDay();
        const leading = (firstDay + 6) % 7;
        const weekdayLabels = ["S","T","Q","Q","S","S","D"];
        const monthTitle = new Intl.DateTimeFormat("pt-PT", { month: "long", year: "numeric" }).format(monthDate);
        let cells = weekdayLabels.map((x) => `<div class="calendario-semana">${x}</div>`).join("");
        for (let i = 0; i < leading; i++) cells += "<div></div>";
        let monthPlanned = 0, monthCompleted = 0;
        for (let d = 1; d <= daysInMonth; d++) {
            const dt = new Date(y,m,d,12);
            const key = dateKey(dt);
            const p = plannedOn(dt).length + routinesOn(dt).length;
            const c = completedOn(dt).length;
            monthPlanned += p;
            monthCompleted += c;
            cells += `<button class="dia-calendario ${key === state.calendarSelected ? "selecionado" : ""} ${key === dateKey(new Date()) ? "hoje" : ""}" data-action="select-calendar-day" data-date="${key}"><span>${d}</span>${p || c ? `<span class="marcadores">${p ? '<i class="marcador"></i>' : ""}${c ? '<i class="marcador verde"></i>' : ""}</span>` : ""}</button>`;
        }
        const selectedPlanned = plannedOn(selected);
        const selectedRoutines = routinesOn(selected);
        const selectedCompleted = completedOn(selected);
        const routines = [...state.data.weeklyRoutines].sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
        const weekdayName = ["Domingo","Segunda-feira","Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira","Sábado"];

        const dayItems = [
            ...selectedRoutines.map((r) => `<div class="cartao"><div class="linha"><span class="icone-bloco">${icon("repeat")}</span><div class="espaco"><div class="forte">${esc(r.workoutName)}</div><div class="pequeno muted" style="margin-top:4px">Rotina semanal</div></div></div></div>`),
            ...selectedPlanned.map((p) => `<div class="cartao"><div class="linha"><span class="icone-bloco">${icon("calendar")}</span><div class="espaco"><div class="forte">${esc(p.workoutName)}</div><div class="pequeno muted" style="margin-top:4px">Treino planeado</div></div><button class="botao-icone perigo" data-action="delete-scheduled" data-id="${esc(p.id)}">${icon("trash")}</button></div></div>`),
            ...selectedCompleted.map((s) => `<button class="item-navegavel" data-action="open-session" data-id="${esc(s.id)}"><span class="icone-bloco lavanda">${icon("checkCircle")}</span><span class="espaco"><span class="forte" style="display:block">${esc(s.workoutName)}</span><span class="pequeno muted" style="display:block;margin-top:4px">Sessão concluída</span></span><span class="chevron">${icon("chevronRight")}</span></button>`)
        ].join("");

        return `<div class="pagina">${backButton()}${pageHeader("O meu calendário", "Planeia e organiza os teus treinos", "")}
            <button class="botao-principal" style="margin-bottom:20px" data-action="new-routine">${icon("repeat")} Nova rotina semanal</button>
            <div class="cartao"><div class="calendario-topo"><button data-action="calendar-prev">${icon("chevronLeft")}</button><strong style="text-transform:capitalize">${esc(monthTitle)}</strong><button data-action="calendar-next">${icon("chevronRight")}</button></div><div class="calendario-grelha">${cells}</div><div class="legenda"><span><i></i> Planeado</span><span><i class="verde"></i> Concluído</span></div></div>
            <div class="grelha-2" style="margin-top:14px">${metricCard("Planeados", String(monthPlanned), "calendar", "rosa")}${metricCard("Concluídos", String(monthCompleted), "checkCircle", "lavanda")}</div>
            <section class="secao"><div class="secao-cabecalho"><div><h2 class="secao-titulo" style="margin:0">${esc(formatDate(selected))}</h2><div class="pequeno muted" style="margin-top:5px">${esc(weekdayName[selected.getDay()])}</div></div><button class="botao-link" data-action="new-scheduled">+ Planear treino</button></div>${dayItems ? `<div class="pilha">${dayItems}</div>` : `<div class="cartao texto-sm muted">Não há treinos neste dia.</div>`}</section>
            <section class="secao"><div class="secao-cabecalho"><h2 class="secao-titulo">As minhas rotinas</h2><button class="botao-link" data-action="new-routine">+ Adicionar</button></div>${routines.length ? `<div class="pilha">${routines.map((r) => `<div class="cartao"><div class="linha"><span class="icone-bloco">${icon("repeat")}</span><div class="espaco"><div class="forte">${esc(r.workoutName)}</div><div class="texto-sm acento" style="margin-top:4px">${esc(weekdayName[n(r.weekday)])}</div><div class="pequeno muted" style="margin-top:4px">Desde ${esc(formatDate(r.startDate))}${r.endDate ? ` · até ${esc(formatDate(r.endDate))}` : ""}</div></div></div><hr class="separador" style="margin:14px 0"><div class="grelha-2"><button class="botao-secundario" data-action="edit-routine" data-id="${esc(r.id)}">${icon("pencil")} Editar</button><button class="botao-secundario botao-perigo" data-action="delete-routine" data-id="${esc(r.id)}">${icon("trash")} Eliminar</button></div></div>`).join("")}</div>` : `<div class="cartao texto-sm muted">Ainda não tens rotinas recorrentes.</div>`}</section>
        </div>`;
    }

    function renderProgress() {
        const allSets = [...state.data.exerciseSets].sort((a,b) => new Date(a.performedAt) - new Date(b.performedAt));
        const completed = completedSessions();
        const totalVolume = allSets.reduce((a,s) => a + n(s.weight) * n(s.repetitions),0);
        const highest = allSets.length ? Math.max(...allSets.map((s) => n(s.weight))) : null;
        const names = [...new Set(allSets.map(exerciseNameForSet).filter(Boolean))].sort((a,b) => a.localeCompare(b,"pt-PT"));
        if (!state.selectedProgressExercise || !names.includes(state.selectedProgressExercise)) state.selectedProgressExercise = names[0] || "";
        const selectedSets = allSets.filter((s) => exerciseNameForSet(s) === state.selectedProgressExercise);
        const groups = new Map();
        selectedSets.forEach((s) => {
            const key = dateKey(s.performedAt);
            const max = groups.get(key);
            if (max === undefined || n(s.weight) > max) groups.set(key,n(s.weight));
        });
        const loadPoints = [...groups.entries()].sort((a,b) => dateFromKey(a[0]) - dateFromKey(b[0])).map(([k,v]) => ({ label: new Intl.DateTimeFormat("pt-PT",{day:"2-digit",month:"2-digit"}).format(dateFromKey(k)), value:v }));
        const record = selectedSets.length ? Math.max(...selectedSets.map((s) => n(s.weight))) : null;

        const volumePoints = [];
        const [thisWeek] = weekInterval();
        for (let i = 7; i >= 0; i--) {
            const start = new Date(thisWeek); start.setDate(thisWeek.getDate() - i * 7);
            const end = new Date(start); end.setDate(start.getDate()+7);
            const volume = allSets.filter((s) => new Date(s.performedAt) >= start && new Date(s.performedAt) < end).reduce((a,s) => a+n(s.weight)*n(s.repetitions),0);
            volumePoints.push({ label: new Intl.DateTimeFormat("pt-PT",{day:"2-digit",month:"2-digit"}).format(start), value: volume });
        }
        const [weekStart,weekEnd] = weekInterval();
        const completedWeek = completed.filter((s) => new Date(s.finishedAt) >= weekStart && new Date(s.finishedAt) < weekEnd).length;
        const recordMap = new Map();
        allSets.forEach((s) => { const name = exerciseNameForSet(s); const old=recordMap.get(name); if(old===undefined || n(s.weight)>old) recordMap.set(name,n(s.weight)); });
        const records = [...recordMap.entries()].sort((a,b) => b[1]-a[1]);

        return `<div class="pagina">${pageHeader("A minha evolução", "Cada treino conta. Acompanha o teu progresso.", "")}<div class="pilha-lg">
            <div class="grelha-2">${metricCard("Treinos concluídos",String(completed.length),"checkCircle","rosa")}${metricCard("Volume acumulado",`${fmt(totalVolume)} kg`,"dumbbell","lavanda")}${metricCard("Séries registadas",String(allSets.length),"list","rosa")}${metricCard("Maior carga",fmtUnit(highest,"kg"),"trophy","lavanda")}</div>
            <div class="cartao"><h3 style="margin:0">Progressão de carga</h3><p class="pequeno muted">Melhor carga por dia</p>${names.length ? `<div class="campo" style="margin:12px 0"><select id="progress-exercise-select">${names.map((name) => `<option ${name===state.selectedProgressExercise?"selected":""}>${esc(name)}</option>`).join("")}</select></div>${record!==null ? `<div class="texto-sm forte acento" style="margin-bottom:8px">Recorde: ${fmt(record)} kg</div>`:""}${lineChart(loadPoints,"kg")}` : `<div class="grafico-vazio">Ainda não há séries registadas.</div>`}</div>
            <div class="cartao"><h3 style="margin:0">Volume semanal</h3><p class="pequeno muted">Carga × repetições nas últimas 8 semanas</p>${allSets.length ? barChart(volumePoints,"lavanda") : `<div class="grafico-vazio">Ainda não há dados de volume.</div>`}</div>
            <div class="cartao"><div class="linha forte">${icon("trophy")} Recordes de carga</div>${records.length ? records.slice(0,8).map(([name,value]) => `<div class="linha texto-sm" style="padding:8px 0;border-bottom:1px solid rgba(125,111,135,.08)"><span>${esc(name)}</span><span class="espaco"></span><span class="forte acento">${fmt(value)} kg</span></div>`).join("") : `<p class="texto-sm muted">Ainda não há recordes registados.</p>`}</div>
            <div class="cartao"><div class="linha forte">${icon("calendar")} Consistência</div><div style="margin-top:12px"><span class="valor-metrica">${completedWeek}</span><span class="texto-sm muted"> treino${completedWeek===1?"":"s"} concluído${completedWeek===1?"":"s"} esta semana</span></div></div>
        </div></div>`;
    }

    function renderBody() {
        const measurements = [...state.data.measurements].sort((a,b) => dateFromKey(b.date) - dateFromKey(a.date));
        const latest = measurements[0];
        const addButton = `<button class="botao-circular" data-action="new-measurement">${icon("plus")}</button>`;
        if (!measurements.length) return `<div class="pagina">${pageHeader("O meu corpo", "Medições, composição corporal e fotografias", addButton)}${emptyCard("body","Ainda não tens medições","Adiciona o teu primeiro registo corporal.")}</div>`;
        const weightPoints = measurements.filter((m)=>m.weight!==null&&m.weight!==undefined).sort((a,b)=>dateFromKey(a.date)-dateFromKey(b.date)).map((m)=>({label:new Intl.DateTimeFormat("pt-PT",{day:"2-digit",month:"2-digit"}).format(dateFromKey(m.date)),value:n(m.weight)}));
        const fatPoints = measurements.filter((m)=>m.bodyFat!==null&&m.bodyFat!==undefined).sort((a,b)=>dateFromKey(a.date)-dateFromKey(b.date)).map((m)=>({label:new Intl.DateTimeFormat("pt-PT",{day:"2-digit",month:"2-digit"}).format(dateFromKey(m.date)),value:n(m.bodyFat)}));
        const musclePoints = measurements.filter((m)=>m.muscleMass!==null&&m.muscleMass!==undefined).sort((a,b)=>dateFromKey(a.date)-dateFromKey(b.date)).map((m)=>({label:new Intl.DateTimeFormat("pt-PT",{day:"2-digit",month:"2-digit"}).format(dateFromKey(m.date)),value:n(m.muscleMass)}));
        const oldestWeight = [...measurements].reverse().find((m)=>m.weight!==null&&m.weight!==undefined)?.weight;
        const latestWeight = measurements.find((m)=>m.weight!==null&&m.weight!==undefined)?.weight;
        const diff = oldestWeight!==undefined && latestWeight!==undefined && measurements.length>1 ? n(latestWeight)-n(oldestWeight) : null;

        return `<div class="pagina">${pageHeader("O meu corpo", "Medições, composição corporal e fotografias", addButton)}<div class="pilha-lg">
            <div class="grelha-2">${metricCard("Peso atual",fmtUnit(latestWeight,"kg"),"scale","rosa")}${metricCard("Variação",diff===null?"—":`${diff>0?"+":""}${fmt(diff)} kg`,"chart","lavanda")}${metricCard("Massa gorda",fmtUnit(latest?.bodyFat,"%"),"body","rosa")}${metricCard("Massa muscular",fmtUnit(latest?.muscleMass,"%"),"dumbbell","lavanda")}</div>
            <div class="cartao"><h3 style="margin:0">Evolução do peso</h3><p class="pequeno muted">Peso registado ao longo do tempo</p>${lineChart(weightPoints,"kg")}</div>
            <div class="grelha-2"><div class="cartao"><h3 style="margin-top:0;font-size:16px">Massa gorda</h3>${lineChart(fatPoints,"%")}</div><div class="cartao"><h3 style="margin-top:0;font-size:16px">Massa muscular</h3>${lineChart(musclePoints,"%")}</div></div>
            <section><div class="secao-cabecalho"><h2 class="secao-titulo">Histórico de medições</h2><button class="botao-link" data-action="new-measurement">+ Adicionar</button></div><div class="pilha">${measurements.map(renderMeasurementCard).join("")}</div></section>
        </div></div>`;
    }

    function renderMeasurementCard(m) {
        const chips = [["Peso",m.weight,"kg"],["Massa gorda",m.bodyFat,"%"],["Massa muscular",m.muscleMass,"%"],["Cintura",m.waist,"cm"],["Anca",m.hips,"cm"],["Coxa",m.thigh,"cm"],["Braço",m.arm,"cm"],["Peito",m.chest,"cm"]].filter((x)=>x[1]!==null&&x[1]!==undefined).map(([label,v,u])=>`<span class="chip">${esc(label)}: ${fmt(v)} ${u}</span>`).join("");
        const photos = [m.frontPhoto,m.sidePhoto,m.backPhoto];
        return `<div class="cartao registo-medicao"><div class="linha"><div><div class="forte">${esc(formatDate(m.date))}</div><div class="pequeno muted" style="margin-top:4px">Registo corporal</div></div><span class="espaco"></span><button class="botao-icone" data-action="edit-measurement" data-id="${esc(m.id)}">${icon("pencil")}</button><button class="botao-icone perigo" data-action="delete-measurement" data-id="${esc(m.id)}">${icon("trash")}</button></div>${chips?`<div class="chips">${chips}</div>`:""}${photos.some(Boolean)?`<div class="fotos-grelha">${photos.map((p)=>`<div class="foto-progresso">${p?`<img src="${esc(p)}" alt="">`:icon("camera")}</div>`).join("")}</div>`:""}${m.notes?`<p class="texto-sm muted" style="margin:0;white-space:pre-wrap">${esc(m.notes)}</p>`:""}</div>`;
    }

    function openModal(title, body) {
        modalRoot.innerHTML = `<div class="modal-overlay" data-action="close-modal-overlay"><div class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="modal-cabecalho"><button class="modal-fechar" type="button" data-action="close-modal">${icon("x")}</button><h2>${esc(title)}</h2><span style="width:38px"></span></div><div class="modal-corpo">${body}</div></div></div>`;
    }

    function closeModal() {
        modalRoot.innerHTML = "";
    }

    function workoutModal(workout = null) {
        openModal(workout ? "Editar treino" : "Novo treino", `<form id="workout-form" data-id="${esc(workout?.id || "")}" class="formulario"><div class="campo"><label>Nome do treino</label><input name="name" required value="${esc(workout?.name || "")}" placeholder="Ex.: Treino A"></div><div class="campo"><label>Grupo muscular</label><input name="muscleGroup" value="${esc(workout?.muscleGroup || "")}" placeholder="Ex.: Pernas e glúteos"></div><div class="modal-acoes"><button type="button" class="botao-secundario botao-lavanda" data-action="close-modal">Cancelar</button><button type="submit" class="botao-principal">Guardar</button></div></form>`);
    }

    function exerciseModal(workoutId, exercise = null) {
        openModal(exercise ? "Editar exercício" : "Novo exercício", `<form id="exercise-form" data-id="${esc(exercise?.id || "")}" data-workout-id="${esc(workoutId)}" class="formulario"><div class="campo"><label>Fotografia da máquina</label>${exercise?.photoData ? `<img src="${esc(exercise.photoData)}" alt="" style="max-height:180px;object-fit:contain;border-radius:16px;background:white">` : ""}<input name="photo" type="file" accept="image/*"></div><div class="campo"><label>Nome do exercício</label><input name="name" required value="${esc(exercise?.name || "")}" placeholder="Nome do exercício"></div><div class="campo"><label>Grupo muscular</label><input name="muscleGroup" value="${esc(exercise?.muscleGroup || "")}" placeholder="Grupo muscular"></div><div class="campos-2"><div class="campo"><label>Séries</label><input name="sets" type="number" min="1" max="15" step="1" value="${n(exercise?.sets,3)}"></div><div class="campo"><label>Repetições</label><input name="repetitions" value="${esc(exercise?.repetitions || "10-12")}" placeholder="8-12"></div></div><div class="campo"><label>Carga planeada (kg)</label><input name="targetWeight" type="number" min="0" step="0.1" value="${esc(exercise?.targetWeight ?? 0)}"></div><div class="campo"><label>Notas</label><textarea name="notes" placeholder="Ex.: ajustar o banco para a posição 3">${esc(exercise?.notes || "")}</textarea></div><div class="modal-acoes"><button type="button" class="botao-secundario botao-lavanda" data-action="close-modal">Cancelar</button><button type="submit" class="botao-principal">Guardar</button></div></form>`);
    }

    function scheduledModal() {
        const workouts = [...state.data.workouts].sort((a,b) => a.name.localeCompare(b.name,"pt-PT"));
        openModal("Planear treino", workouts.length ? `<form id="scheduled-form" class="formulario"><div class="campo"><label>Dia do treino</label><input name="date" type="date" value="${esc(state.calendarSelected)}" required></div><div class="campo"><label>Treino</label><select name="workoutId">${workouts.map((w)=>`<option value="${esc(w.id)}">${esc(w.name)}</option>`).join("")}</select></div><div class="modal-acoes"><button type="button" class="botao-secundario botao-lavanda" data-action="close-modal">Cancelar</button><button type="submit" class="botao-principal">Guardar</button></div></form>` : `<div class="estado-vazio"><div class="vazio-icone">${icon("dumbbell")}</div><h3>Cria primeiro um plano de treino</h3><p>Depois poderás adicioná-lo ao calendário.</p></div>`);
    }

    function routineModal(routine = null) {
        const workouts = [...state.data.workouts].sort((a,b) => a.name.localeCompare(b.name,"pt-PT"));
        const defaultDay = dateFromKey(state.calendarSelected).getDay();
        const selected = new Set(routine ? [n(routine.weekday)] : [defaultDay]);
        const days = [[1,"Seg"],[2,"Ter"],[3,"Qua"],[4,"Qui"],[5,"Sex"],[6,"Sáb"],[0,"Dom"]];
        const start = routine?.startDate || state.calendarSelected;
        openModal(routine ? "Editar rotina" : "Nova rotina", workouts.length ? `<form id="routine-form" data-id="${esc(routine?.id || "")}" class="formulario"><div class="campo"><label>Plano de treino</label><select name="workoutId">${workouts.map((w)=>`<option value="${esc(w.id)}" ${w.id===routine?.workoutId?"selected":""}>${esc(w.name)}</option>`).join("")}</select></div><div class="campo"><label>Dias da semana</label><div class="chips">${days.map(([value,label])=>`<label class="chip" style="display:flex;align-items:center;gap:5px"><input type="checkbox" name="weekday" value="${value}" ${selected.has(value)?"checked":""}> ${label}</label>`).join("")}</div></div><div class="campo"><label>Começar a partir de</label><input type="date" name="startDate" value="${esc(start)}" required></div><div class="campo"><label style="display:flex;align-items:center;gap:8px"><input type="checkbox" name="hasEnd" ${routine?.endDate?"checked":""}> Definir data de fim</label><input type="date" name="endDate" value="${esc(routine?.endDate || "")}"></div><p class="pequeno muted" style="margin:0">${routine ? "Podes alterar esta rotina e acrescentar outros dias. As outras rotinas existentes não serão modificadas." : "Será criada uma rotina semanal para cada dia selecionado."}</p><div class="modal-acoes"><button type="button" class="botao-secundario botao-lavanda" data-action="close-modal">Cancelar</button><button type="submit" class="botao-principal">Guardar</button></div></form>` : `<div class="estado-vazio"><div class="vazio-icone">${icon("dumbbell")}</div><h3>Cria primeiro um plano de treino</h3><p>Depois poderás criar rotinas semanais.</p></div>`);
    }

    function measurementModal(m = null) {
        openModal(m ? "Editar medição" : "Nova medição", `<form id="measurement-form" data-id="${esc(m?.id || "")}" class="formulario"><div class="campo"><label>Data</label><input type="date" name="date" max="${dateKey(new Date())}" value="${esc(m?.date || dateKey(new Date()))}" required></div><div class="campos-2"><div class="campo"><label>Peso (kg)</label><input name="weight" type="number" min="0" step="0.01" value="${esc(m?.weight ?? "")}"></div><div class="campo"><label>Massa gorda (%)</label><input name="bodyFat" type="number" min="0" max="100" step="0.01" value="${esc(m?.bodyFat ?? "")}"></div><div class="campo"><label>Massa muscular (%)</label><input name="muscleMass" type="number" min="0" max="100" step="0.01" value="${esc(m?.muscleMass ?? "")}"></div><div class="campo"><label>Cintura (cm)</label><input name="waist" type="number" min="0" step="0.01" value="${esc(m?.waist ?? "")}"></div><div class="campo"><label>Anca (cm)</label><input name="hips" type="number" min="0" step="0.01" value="${esc(m?.hips ?? "")}"></div><div class="campo"><label>Coxa (cm)</label><input name="thigh" type="number" min="0" step="0.01" value="${esc(m?.thigh ?? "")}"></div><div class="campo"><label>Braço (cm)</label><input name="arm" type="number" min="0" step="0.01" value="${esc(m?.arm ?? "")}"></div><div class="campo"><label>Peito (cm)</label><input name="chest" type="number" min="0" step="0.01" value="${esc(m?.chest ?? "")}"></div></div><div class="campo"><label>Notas</label><textarea name="notes">${esc(m?.notes || "")}</textarea></div><div class="campo"><label>Fotografia de frente</label><input name="frontPhoto" type="file" accept="image/*"></div><div class="campo"><label>Fotografia de lado</label><input name="sidePhoto" type="file" accept="image/*"></div><div class="campo"><label>Fotografia de costas</label><input name="backPhoto" type="file" accept="image/*"></div><div class="modal-acoes"><button type="button" class="botao-secundario botao-lavanda" data-action="close-modal">Cancelar</button><button type="submit" class="botao-principal">Guardar</button></div></form>`);
    }

    function editSetModal(item) {
        openModal("Editar série", `<form id="set-edit-form" data-id="${esc(item.id)}" class="formulario"><div class="campo"><label>Carga (kg)</label><input name="weight" type="number" min="0" step="0.1" value="${esc(item.weight)}" required></div><div class="campo"><label>Repetições</label><input name="repetitions" type="number" min="1" max="100" step="1" value="${esc(item.repetitions)}" required></div><div class="modal-acoes"><button type="button" class="botao-secundario botao-lavanda" data-action="close-modal">Cancelar</button><button type="submit" class="botao-principal">Guardar</button></div></form>`);
    }

    async function fileToDataURL(file) {
        if (!file) return null;
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
        });
    }

    function nullableNumber(value) {
        const text = String(value ?? "").trim().replace(",", ".");
        if (!text) return null;
        const valueNumber = Number(text);
        return Number.isFinite(valueNumber) ? valueNumber : null;
    }

    function pushRoute(route, tab = state.tab) {
        state.stack.push({ route: state.route, tab: state.tab });
        state.route = route;
        state.tab = tab;
        render();
    }

    function goBack() {
        const previous = state.stack.pop();
        if (previous) {
            state.route = previous.route;
            state.tab = previous.tab;
        } else {
            state.route = { name: state.tab };
        }
        render();
    }

    function goTab(tab) {
        state.tab = tab;
        state.route = { name: tab };
        state.stack = [];
        state.focusedMode = false;
        state.focusedIndex = 0;
        render();
    }

    function changeCalendarMonth(offset) {
        const d = dateFromKey(state.calendarMonth);
        d.setMonth(d.getMonth() + offset, 1);
        state.calendarMonth = dateKey(d);
        render();
    }

    function formatTimer(seconds) {
        const s = Math.max(0, Math.ceil(seconds));
        return `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
    }

    function restEndKey(sessionId) { return `gymtracker-rest-${sessionId}`; }

    function currentSessionId() {
        return state.route.name === "session" ? state.route.id : null;
    }

    function setRestTimer(sessionId) {
        const end = Date.now() + state.restDuration * 1000;
        localStorage.setItem(restEndKey(sessionId), String(end));
        updateTimer();
    }

    function stopRestTimer(sessionId) {
        localStorage.removeItem(restEndKey(sessionId));
        updateTimer();
    }

    function updateTimer() {
        const el = document.getElementById("rest-timer");
        if (!el) return;
        const sessionId = currentSessionId();
        if (!sessionId) return;
        const end = Number(localStorage.getItem(restEndKey(sessionId)) || 0);
        const remaining = end ? Math.max(0, Math.ceil((end - Date.now())/1000)) : state.restDuration;
        el.textContent = formatTimer(remaining);
        if (end && remaining <= 0) localStorage.removeItem(restEndKey(sessionId));
    }

    setInterval(updateTimer, 1000);

    document.addEventListener("click", async (event) => {
        const tabButton = event.target.closest("[data-tab]");
        if (tabButton) {
            event.preventDefault();
            goTab(tabButton.dataset.tab);
            return;
        }

        const el = event.target.closest("[data-action]");
        if (!el) return;
        const action = el.dataset.action;

        if (action === "close-modal-overlay") {
            if (event.target === el) closeModal();
            return;
        }

        switch (action) {
            case "close-modal": closeModal(); break;
            case "back": goBack(); break;
            case "new-workout": workoutModal(); break;
            case "edit-workout": workoutModal(state.data.workouts.find((w)=>w.id===el.dataset.id)); break;
            case "open-workout": pushRoute({name:"workout",id:el.dataset.id},"treinos"); break;
            case "delete-workout": {
                const id = el.dataset.id;
                if (!confirmAction("Eliminar este treino? As sessões já realizadas serão mantidas.")) break;
                const exercises = state.data.exercises.filter((x)=>x.workoutId===id);
                for (const e of exercises) await DB.remove(S.exercises,e.id);
                for (const p of state.data.scheduledWorkouts.filter((x)=>x.workoutId===id)) await DB.remove(S.scheduledWorkouts,p.id);
                for (const r of state.data.weeklyRoutines.filter((x)=>x.workoutId===id)) await DB.remove(S.weeklyRoutines,r.id);
                await DB.remove(S.workouts,id);
                toast("Treino eliminado");
                goTab("treinos");
                break;
            }
            case "add-exercise": exerciseModal(el.dataset.workoutId); break;
            case "edit-exercise": {
                const ex = state.data.exercises.find((x)=>x.id===el.dataset.id);
                if (ex) exerciseModal(ex.workoutId,ex);
                break;
            }
            case "delete-exercise": {
                const ex = state.data.exercises.find((x)=>x.id===el.dataset.id);
                if (!ex || !confirmAction("Eliminar este exercício? O histórico de séries continuará guardado nos resumos.")) break;
                await DB.remove(S.exercises,ex.id);
                toast("Exercício eliminado");
                await render();
                break;
            }
            case "open-exercise": pushRoute({name:"exercise",id:el.dataset.id},"treinos"); break;
            case "change-exercise-photo": {
                const ex = state.data.exercises.find((x)=>x.id===el.dataset.id);
                if (!ex) break;
                const input = document.createElement("input");
                input.type="file"; input.accept="image/*";
                input.onchange = async () => {
                    if (!input.files?.[0]) return;
                    ex.photoData = await fileToDataURL(input.files[0]);
                    await DB.put(S.exercises,ex);
                    toast("Fotografia atualizada");
                    await render();
                };
                input.click();
                break;
            }
            case "start-session": {
                const workout = state.data.workouts.find((w)=>w.id===el.dataset.id);
                if (!workout) break;
                const exercises = exercisesFor(workout.id);
                if (!exercises.length) { toast("Adiciona primeiro pelo menos um exercício."); break; }
                const existing = sessionsFor(workout.id).find((s)=>!s.finishedAt);
                if (existing) { pushRoute({name:"session",id:existing.id},"treinos"); break; }
                const session = {id:DB.id(),workoutId:workout.id,workoutName:workout.name,startedAt:new Date().toISOString(),finishedAt:null};
                await DB.put(S.sessions,session);
                state.focusedIndex=0; state.focusedMode=false;
                pushRoute({name:"session",id:session.id},"treinos");
                break;
            }
            case "open-session": state.focusedIndex=0; state.focusedMode=false; pushRoute({name:"session",id:el.dataset.id},"treinos"); break;
            case "finish-session": {
                const session = state.data.sessions.find((s)=>s.id===el.dataset.id);
                if (!session) break;
                if (!confirmAction("Terminar treino? As séries registadas ficarão guardadas.")) break;
                if (!session.finishedAt) { session.finishedAt=new Date().toISOString(); await DB.put(S.sessions,session); }
                stopRestTimer(session.id);
                state.route={name:"session",id:session.id,summary:true};
                await render();
                break;
            }
            case "session-summary": state.route={name:"session",id:el.dataset.id,summary:true}; await render(); break;
            case "back-to-workouts": goTab("treinos"); break;
            case "session-mode": state.focusedMode=el.dataset.value==="focused"; state.focusedIndex=0; await render(); break;
            case "focus-prev": state.focusedIndex=Math.max(0,state.focusedIndex-1); await render(); break;
            case "focus-next": state.focusedIndex+=1; await render(); break;
            case "rest-duration": state.restDuration=n(el.dataset.value,90); stopRestTimer(currentSessionId()); await render(); break;
            case "rest-restart": setRestTimer(currentSessionId()); break;
            case "rest-stop": stopRestTimer(currentSessionId()); break;
            case "toggle-exercise": {
                const id=el.dataset.id;
                if (state.expandedExercises.has(`collapsed:${id}`)) state.expandedExercises.delete(`collapsed:${id}`);
                else state.expandedExercises.add(`collapsed:${id}`);
                await render();
                break;
            }
            case "toggle-history": {
                const id=el.dataset.id;
                state.historyExercises.has(id)?state.historyExercises.delete(id):state.historyExercises.add(id);
                await render(); break;
            }
            case "adjust-weight": {
                const card=el.closest("[data-exercise-card]"); const input=card?.querySelector(".weight-input"); if(!input) break;
                input.value=Math.max(0,n(input.value)+n(el.dataset.delta)).toFixed(1).replace(/\.0$/,""); break;
            }
            case "adjust-reps": {
                const card=el.closest("[data-exercise-card]"); const input=card?.querySelector(".reps-input"); if(!input) break;
                input.value=Math.min(100,Math.max(1,n(input.value,10)+n(el.dataset.delta))); break;
            }
            case "save-session-set": {
                const card=el.closest("[data-exercise-card]");
                const exercise=state.data.exercises.find((x)=>x.id===el.dataset.exerciseId);
                const session=state.data.sessions.find((x)=>x.id===el.dataset.sessionId);
                if(!card||!exercise||!session||session.finishedAt) break;
                const weight=nullableNumber(card.querySelector(".weight-input")?.value);
                const reps=Math.min(100,Math.max(1,n(card.querySelector(".reps-input")?.value,10)));
                if(weight===null||weight<0){toast("Introduz uma carga válida.");break;}
                const existing=sessionExerciseSets(session.id,exercise.id);
                const setNumber=existing.reduce((m,s)=>Math.max(m,n(s.setNumber)),0)+1;
                await DB.put(S.exerciseSets,{id:DB.id(),exerciseId:exercise.id,exerciseName:exercise.name,sessionId:session.id,setNumber,weight,repetitions:reps,performedAt:new Date().toISOString()});
                setRestTimer(session.id);
                toast(`Série ${setNumber} registada`);
                await render();
                break;
            }
            case "edit-set": {
                const item=state.data.exerciseSets.find((s)=>s.id===el.dataset.id); if(item) editSetModal(item); break;
            }
            case "delete-set": {
                if(!confirmAction("Eliminar esta série? Será removida dos gráficos.")) break;
                await DB.remove(S.exerciseSets,el.dataset.id); toast("Série eliminada"); await render(); break;
            }
            case "open-calendar": pushRoute({name:"calendar"},"treinos"); break;
            case "calendar-prev": changeCalendarMonth(-1); break;
            case "calendar-next": changeCalendarMonth(1); break;
            case "select-calendar-day": state.calendarSelected=el.dataset.date; await render(); break;
            case "new-scheduled": scheduledModal(); break;
            case "delete-scheduled": if(confirmAction("Eliminar este treino planeado?")){await DB.remove(S.scheduledWorkouts,el.dataset.id);toast("Planeamento eliminado");await render();} break;
            case "new-routine": routineModal(); break;
            case "edit-routine": routineModal(state.data.weeklyRoutines.find((r)=>r.id===el.dataset.id)); break;
            case "delete-routine": if(confirmAction("Eliminar esta rotina?")){await DB.remove(S.weeklyRoutines,el.dataset.id);toast("Rotina eliminada");await render();} break;
            case "new-measurement": measurementModal(); break;
            case "edit-measurement": measurementModal(state.data.measurements.find((m)=>m.id===el.dataset.id)); break;
            case "delete-measurement": if(confirmAction("Eliminar esta medição? As fotografias associadas também serão apagadas.")){await DB.remove(S.measurements,el.dataset.id);toast("Medição eliminada");await render();} break;
        }
    });

    document.addEventListener("change", async (event) => {
        if (event.target.id === "progress-exercise-select") {
            state.selectedProgressExercise = event.target.value;
            await render();
        }
    });

    document.addEventListener("submit", async (event) => {
        event.preventDefault();
        const form = event.target;
        const fd = new FormData(form);

        if (form.id === "workout-form") {
            const id=form.dataset.id||DB.id();
            const old=state.data.workouts.find((w)=>w.id===id);
            const name=String(fd.get("name")||"").trim();
            if(!name){toast("Escreve o nome do treino.");return;}
            const record={id,name,muscleGroup:String(fd.get("muscleGroup")||"").trim(),createdAt:old?.createdAt||new Date().toISOString()};
            await DB.put(S.workouts,record);
            if(old && old.name!==name){
                for(const s of state.data.sessions.filter((x)=>x.workoutId===id)){s.workoutName=name;await DB.put(S.sessions,s);}
                for(const p of state.data.scheduledWorkouts.filter((x)=>x.workoutId===id)){p.workoutName=name;await DB.put(S.scheduledWorkouts,p);}
                for(const r of state.data.weeklyRoutines.filter((x)=>x.workoutId===id)){r.workoutName=name;await DB.put(S.weeklyRoutines,r);}
            }
            closeModal();toast("Treino guardado");await render();return;
        }

        if (form.id === "exercise-form") {
            const id=form.dataset.id||DB.id(); const old=state.data.exercises.find((x)=>x.id===id);
            const name=String(fd.get("name")||"").trim(); if(!name){toast("Escreve o nome do exercício.");return;}
            let photoData=old?.photoData||null; const photo=fd.get("photo"); if(photo instanceof File && photo.size) photoData=await fileToDataURL(photo);
            const record={id,workoutId:form.dataset.workoutId,name,muscleGroup:String(fd.get("muscleGroup")||"").trim(),sets:Math.min(15,Math.max(1,n(fd.get("sets"),3))),repetitions:String(fd.get("repetitions")||"10-12").trim()||"10-12",targetWeight:Math.max(0,n(fd.get("targetWeight"),0)),notes:String(fd.get("notes")||"").trim(),photoData,createdAt:old?.createdAt||new Date().toISOString()};
            await DB.put(S.exercises,record);
            if(old && old.name!==name){for(const set of state.data.exerciseSets.filter((s)=>s.exerciseId===id)){set.exerciseName=name;await DB.put(S.exerciseSets,set);}}
            closeModal();toast("Exercício guardado");await render();return;
        }

        if (form.id === "manual-set-form") {
            const exercise=state.data.exercises.find((x)=>x.id===form.dataset.exerciseId); if(!exercise)return;
            const key=String(fd.get("date")); const weight=nullableNumber(fd.get("weight")); const reps=Math.min(100,Math.max(1,n(fd.get("reps"),10)));
            if(weight===null||weight<0){toast("Introduz uma carga válida.");return;}
            const daySets=state.data.exerciseSets.filter((s)=>s.exerciseId===exercise.id && dateKey(s.performedAt)===key);
            const setNumber=daySets.reduce((m,s)=>Math.max(m,n(s.setNumber)),0)+1;
            const performed=dateFromKey(key); performed.setHours(12,0,0,0);
            await DB.put(S.exerciseSets,{id:DB.id(),exerciseId:exercise.id,exerciseName:exercise.name,sessionId:null,setNumber,weight,repetitions:reps,performedAt:performed.toISOString()});
            toast("Série guardada");await render();return;
        }

        if (form.id === "scheduled-form") {
            const workout=state.data.workouts.find((w)=>w.id===fd.get("workoutId")); if(!workout)return;
            await DB.put(S.scheduledWorkouts,{id:DB.id(),date:String(fd.get("date")),workoutId:workout.id,workoutName:workout.name,createdAt:new Date().toISOString()});
            state.calendarSelected=String(fd.get("date"));state.calendarMonth=startOfMonthKey(dateFromKey(state.calendarSelected));closeModal();toast("Treino planeado");await render();return;
        }

        if (form.id === "routine-form") {
            const workout=state.data.workouts.find((w)=>w.id===fd.get("workoutId")); if(!workout)return;
            const days=fd.getAll("weekday").map(Number); if(!days.length){toast("Seleciona pelo menos um dia.");return;}
            const startDate=String(fd.get("startDate")); const hasEnd=fd.get("hasEnd")!==null; const endDate=hasEnd?String(fd.get("endDate")||""):null;
            if(hasEnd && (!endDate || endDate<startDate)){toast("A data de fim não pode ser anterior à data de início.");return;}
            const existingId=form.dataset.id; const existing=state.data.weeklyRoutines.find((r)=>r.id===existingId);
            let primary=existing && days.includes(n(existing.weekday)) ? n(existing.weekday) : days[0];
            if(existing){Object.assign(existing,{weekday:primary,startDate,endDate,workoutId:workout.id,workoutName:workout.name});await DB.put(S.weeklyRoutines,existing);} else {
                const duplicate=state.data.weeklyRoutines.some((r)=>r.workoutId===workout.id&&n(r.weekday)===primary&&r.startDate===startDate&&(r.endDate||null)===(endDate||null));
                if(!duplicate)await DB.put(S.weeklyRoutines,{id:DB.id(),weekday:primary,startDate,endDate,workoutId:workout.id,workoutName:workout.name,createdAt:new Date().toISOString()});
            }
            for(const day of days.filter((d)=>d!==primary)){
                const duplicate=state.data.weeklyRoutines.some((r)=>r.id!==existingId&&r.workoutId===workout.id&&n(r.weekday)===day&&r.startDate===startDate&&(r.endDate||null)===(endDate||null));
                if(!duplicate)await DB.put(S.weeklyRoutines,{id:DB.id(),weekday:day,startDate,endDate,workoutId:workout.id,workoutName:workout.name,createdAt:new Date().toISOString()});
            }
            closeModal();toast("Rotina guardada");await render();return;
        }

        if (form.id === "measurement-form") {
            const id=form.dataset.id||DB.id(); const old=state.data.measurements.find((m)=>m.id===id);
            const fields=["weight","bodyFat","muscleMass","waist","hips","thigh","arm","chest"]; const values={};
            for(const key of fields){values[key]=nullableNumber(fd.get(key));if(values[key]!==null&&values[key]<0){toast("Introduz valores positivos.");return;}}
            if((values.bodyFat!==null&&values.bodyFat>100)||(values.muscleMass!==null&&values.muscleMass>100)){toast("As percentagens não podem ultrapassar 100.");return;}
            let frontPhoto=old?.frontPhoto||null,sidePhoto=old?.sidePhoto||null,backPhoto=old?.backPhoto||null;
            const f=fd.get("frontPhoto"),s=fd.get("sidePhoto"),b=fd.get("backPhoto"); if(f instanceof File&&f.size)frontPhoto=await fileToDataURL(f); if(s instanceof File&&s.size)sidePhoto=await fileToDataURL(s); if(b instanceof File&&b.size)backPhoto=await fileToDataURL(b);
            await DB.put(S.measurements,{id,date:String(fd.get("date")),...values,notes:String(fd.get("notes")||"").trim(),frontPhoto,sidePhoto,backPhoto,createdAt:old?.createdAt||new Date().toISOString()});
            closeModal();toast("Medição guardada");await render();return;
        }

        if (form.id === "set-edit-form") {
            const item=state.data.exerciseSets.find((s)=>s.id===form.dataset.id); if(!item)return;
            const weight=nullableNumber(fd.get("weight"));const reps=Math.min(100,Math.max(1,n(fd.get("repetitions"),10)));if(weight===null||weight<0){toast("Introduz uma carga válida.");return;}
            item.weight=weight;item.repetitions=reps;await DB.put(S.exerciseSets,item);closeModal();toast("Série atualizada");await render();return;
        }
    });

    async function init() {
        try {
            await DB.openDB();
            if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
                navigator.serviceWorker.register("./service-worker.js").catch(() => {});
            }
            await render();
        } catch (error) {
            console.error(error);
            conteudo.innerHTML = `<div class="pagina">${emptyCard("info","Não foi possível abrir a aplicação","Atualiza a página. Se o problema continuar, confirma que estás a abrir os ficheiros através do GitHub Pages.")}</div>`;
        }
    }

    init();
})();
