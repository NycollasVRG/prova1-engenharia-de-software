/**
 * Engenharia de Software Moderna — Guia Visual (Caps. 1 a 4)
 * Interatividade: Busca, Filtro por Capítulo, Tema Claro/Escuro, Modo Estudo e Navegação.
 */

document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const body = document.body;

  // Elementos principais
  const sidebar = document.getElementById("sidebar");
  const backdrop = document.getElementById("sidebarBackdrop");
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const studyModeBtn = document.getElementById("studyModeBtn");
  const searchInput = document.getElementById("searchInput");
  const searchClearBtn = document.getElementById("searchClearBtn");
  const filterPills = document.querySelectorAll(".filter-pill");
  const chapterSections = document.querySelectorAll(".chapter-section");
  const questionCards = document.querySelectorAll(".question-card");
  const resultsCounter = document.getElementById("resultsCounter");
  const emptyState = document.getElementById("emptyState");
  const resetFiltersBtn = document.getElementById("resetFiltersBtn");
  const backToTopBtn = document.getElementById("backToTopBtn");
  const tocLinks = document.querySelectorAll(".toc-link");
  const tocGroupHeaders = document.querySelectorAll(".toc-group-header");

  let activeChapter = "all";
  let searchQuery = "";
  let isStudyMode = false;

  // =========================================================================
  // 1. Tema Claro / Escuro
  // =========================================================================
  const savedTheme = localStorage.getItem("esm-theme");
  if (savedTheme === "dark") {
    root.setAttribute("data-theme", "dark");
    updateThemeButton("dark");
  }

  function updateThemeButton(theme) {
    if (!themeToggleBtn) return;
    themeToggleBtn.textContent = theme === "dark" ? "☀️ Tema Claro" : "🌙 Tema Escuro";
  }

  themeToggleBtn?.addEventListener("click", () => {
    const isDark = root.getAttribute("data-theme") === "dark";
    const nextTheme = isDark ? "light" : "dark";
    if (nextTheme === "dark") {
      root.setAttribute("data-theme", "dark");
    } else {
      root.removeAttribute("data-theme");
    }
    localStorage.setItem("esm-theme", nextTheme);
    updateThemeButton(nextTheme);
  });

  // =========================================================================
  // 2. Modo Estudo (Ocultar / Revelar Respostas)
  // =========================================================================
  studyModeBtn?.addEventListener("click", () => {
    isStudyMode = !isStudyMode;
    body.classList.toggle("study-mode", isStudyMode);
    studyModeBtn.classList.toggle("active", isStudyMode);
    studyModeBtn.textContent = isStudyMode ? "👁️ Sair do Estudo" : "🧠 Modo Estudo";

    questionCards.forEach((card) => {
      const btn = card.querySelector(".toggle-answer-btn");
      if (isStudyMode) {
        card.classList.add("is-hidden");
        if (btn) btn.textContent = "Revelar resposta";
      } else {
        card.classList.remove("is-hidden");
        if (btn) btn.textContent = "Ocultar resposta";
      }
    });
  });

  questionCards.forEach((card) => {
    const btn = card.querySelector(".toggle-answer-btn");
    btn?.addEventListener("click", () => {
      const hidden = card.classList.toggle("is-hidden");
      btn.textContent = hidden ? "Revelar resposta" : "Ocultar resposta";
    });
  });

  // =========================================================================
  // 3. Busca + Filtro por Capítulo
  // =========================================================================
  function normalizeText(str) {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function applyFilters() {
    const normQuery = normalizeText(searchQuery.trim());
    let visibleCount = 0;

    chapterSections.forEach((section) => {
      const chapId = section.getAttribute("data-chapter");
      const matchesChapter = activeChapter === "all" || activeChapter === chapId;

      if (!matchesChapter) {
        section.style.display = "none";
        return;
      }

      const cardsInSection = section.querySelectorAll(".question-card");
      let sectionVisibleCards = 0;

      cardsInSection.forEach((card) => {
        const cardText = normalizeText(card.textContent || "");
        const matchesSearch = !normQuery || cardText.includes(normQuery);

        if (matchesSearch) {
          card.style.display = "";
          sectionVisibleCards += 1;
          visibleCount += 1;
        } else {
          card.style.display = "none";
        }
      });

      section.style.display = sectionVisibleCards > 0 ? "" : "none";
    });

    if (resultsCounter) {
      resultsCounter.textContent =
        visibleCount === questionCards.length
          ? `Exibindo todas as ${visibleCount} questões`
          : `Exibindo ${visibleCount} de ${questionCards.length} questões`;
    }

    if (emptyState) {
      emptyState.classList.toggle("visible", visibleCount === 0);
    }

    if (searchClearBtn) {
      searchClearBtn.classList.toggle("visible", searchQuery.length > 0);
    }
  }

  searchInput?.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    applyFilters();
  });

  searchClearBtn?.addEventListener("click", () => {
    searchQuery = "";
    if (searchInput) {
      searchInput.value = "";
      searchInput.focus();
    }
    applyFilters();
  });

  filterPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      filterPills.forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      activeChapter = pill.getAttribute("data-filter") || "all";
      applyFilters();
    });
  });

  resetFiltersBtn?.addEventListener("click", () => {
    activeChapter = "all";
    searchQuery = "";
    if (searchInput) searchInput.value = "";
    filterPills.forEach((p) => {
      p.classList.toggle("active", p.getAttribute("data-filter") === "all");
    });
    applyFilters();
  });

  // =========================================================================
  // 4. Sidebar Mobile & Grupos do Sumário
  // =========================================================================
  function closeSidebar() {
    sidebar?.classList.remove("open");
    backdrop?.classList.remove("open");
  }

  mobileMenuBtn?.addEventListener("click", () => {
    sidebar?.classList.toggle("open");
    backdrop?.classList.toggle("open");
  });

  backdrop?.addEventListener("click", closeSidebar);

  tocLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 980) closeSidebar();
    });
  });

  tocGroupHeaders.forEach((header) => {
    header.addEventListener("click", () => {
      header.closest(".toc-group")?.classList.toggle("collapsed");
    });
  });

  // =========================================================================
  // 5. Scroll Spy & Botão Voltar ao Topo
  // =========================================================================
  const linkById = new Map();
  tocLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (href && href.startsWith("#")) {
      linkById.set(href.slice(1), link);
    }
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          const matchingLink = linkById.get(id);
          if (matchingLink) {
            tocLinks.forEach((l) => l.classList.remove("active"));
            matchingLink.classList.add("active");
          }
        }
      });
    },
    { rootMargin: "-15% 0px -72% 0px", threshold: 0 }
  );

  questionCards.forEach((card) => observer.observe(card));

  window.addEventListener(
    "scroll",
    () => {
      if (!backToTopBtn) return;
      backToTopBtn.classList.toggle("visible", window.scrollY > 360);
    },
    { passive: true }
  );

  backToTopBtn?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Inicializa contador
  applyFilters();
});
