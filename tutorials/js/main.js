(function () {
  "use strict";

  /* Theme toggle (initial theme is set inline in <head> to avoid flash) */
  var toggle = document.querySelector("[data-theme-toggle]");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var root = document.documentElement;
      var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem("cvc-theme", next);
      } catch (err) {
        /* localStorage unavailable (private mode) — theme just won't persist */
      }
    });
  }

  /* Mobile nav toggle */
  var navbar = document.querySelector("[data-navbar]");
  var navToggle = document.querySelector("[data-nav-toggle]");
  if (navbar && navToggle) {
    navToggle.addEventListener("click", function () {
      navbar.classList.toggle("is-open");
    });
    navbar.querySelectorAll(".nav-links a").forEach(function (link) {
      link.addEventListener("click", function () {
        navbar.classList.remove("is-open");
      });
    });
  }

  /* Courses dropdown */
  var courseDropdown = document.querySelector("[data-nav-dropdown]");
  var courseDropdownTrigger = document.querySelector("[data-nav-dropdown-trigger]");
  if (courseDropdown && courseDropdownTrigger) {
    courseDropdownTrigger.addEventListener("click", function (e) {
      e.stopPropagation();
      var isOpen = courseDropdown.getAttribute("data-open") === "true";
      courseDropdown.setAttribute("data-open", isOpen ? "false" : "true");
      courseDropdownTrigger.setAttribute("aria-expanded", isOpen ? "false" : "true");
    });
    document.addEventListener("click", function () {
      courseDropdown.setAttribute("data-open", "false");
      courseDropdownTrigger.setAttribute("aria-expanded", "false");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        courseDropdown.setAttribute("data-open", "false");
        courseDropdownTrigger.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* Header course search */
  var searchWrap = document.querySelector("[data-nav-search]");
  var searchToggle = document.querySelector("[data-search-toggle]");
  var searchPanel = document.querySelector("[data-search-panel]");
  var searchInput = document.querySelector("[data-search-input]");
  var searchResults = document.querySelector("[data-search-results]");

  if (searchWrap && searchToggle && searchPanel && searchInput && searchResults) {
    /* Extra searchable terms per course, keyed by the "c-<slug>" class already
       present on each .nav-course-card — keeps this in sync with the nav
       dropdown without duplicating course titles/URLs anywhere. */
    var courseKeywords = {
      angular: "frontend spa typescript signals standalone components rxjs ssr",
      cybersecurity: "security threats networking cloud pentesting appsec infosec incident response",
      "devops-cloud": "infrastructure docker aws kubernetes terraform cicd gitops sre",
      "dsa-cpp": "data structures algorithms interview cpp stl leetcode placement",
      github: "git version control collaboration pull requests actions",
      "javascript-typescript": "js ts fundamentals es2023 typescript programming basics",
      "spring-boot": "java backend rest api microservices spring",
      "llm-ml": "ai machine learning deep learning genai nlp transformers data science complete path",
      "artificial-intelligence": "ai artificial intelligence agents search a* minimax game playing csp logic planning bayesian networks reinforcement learning q-learning llm genai transformers rag",
      "machine-learning": "ml machine learning scikit-learn regression classification clustering xgboost boosting svm neural networks pytorch cnn rnn deep learning",
      "data-science": "data science analysis pandas numpy statistics visualization seaborn plotly sql web scraping apis time series forecasting streamlit dashboards eda",
      "node-express": "backend nodejs express api javascript server",
      aptitude: "quant math reasoning placement exam",
      php: "backend cms laravel wordpress woocommerce",
      python: "backend fastapi django scripting automation",
      react: "frontend hooks nextjs javascript spa ui",
      "react-native": "mobile app expo ios android javascript",
      servicenow: "itsm platform now workflow admin",
      "system-design": "hld lld interview architecture scalability distributed systems",
      "data-analytics": "excel sql powerbi data analytics dashboards bi",
      golang: "go backend concurrency microservices",
      flutter: "mobile dart cross-platform ios android app",
      mongodb: "database nosql document db",
      "coding-practice": "leetcode problems practice interview dsa",
      "sql-postgresql": "database relational rdbms postgres mysql queries joins schema backend",
      "docker-kubernetes": "containers containerization orchestration devops helm kubectl docker compose infrastructure cicd gitops argocd",
      claude: "anthropic ai llm claude code cli agents prompt engineering mcp tool use api sdk assistant",
      "ugc-net-cse": "ugc net nta jrf assistant professor lectureship computer science applications teaching research aptitude exam prep previous year papers mock test",
      kannada: "kannada language karnataka script alphabet varnamale kagunita vowels consonants bengaluru mysuru vocabulary grammar conversation speaking spoken beginner",
      "distributed-systems": "distributed computing replication consensus raft paxos clocks lamport vector clocks crdt consistency cap partitioning sharding consistent hashing idempotency retries two phase commit sagas kafka fault tolerance backend sre infrastructure",
      "oracle-netsuite": "netsuite erp crm oracle suitecloud suitescript suiteflow suitetalk suiteanalytics saved searches workflows customization bundles sdf oneworld finance accounting inventory order to cash procure to pay business administrator consultant"
    };

    var courseIndex = Array.prototype.map
      .call(document.querySelectorAll(".nav-course-card"), function (card) {
        var slugMatch = card.className.match(/\bc-([\w-]+)\b/);
        var slug = slugMatch ? slugMatch[1] : "";
        var titleEl = card.querySelector(".nav-course-card__title");
        var metaEl = card.querySelector(".nav-course-card__meta");
        var iconEl = card.querySelector(".nav-course-card__icon");
        return {
          slug: slug,
          title: titleEl ? titleEl.textContent.trim() : "",
          meta: metaEl ? metaEl.textContent.trim() : "",
          href: card.href,
          iconHTML: iconEl ? iconEl.innerHTML : "",
          keywords: (courseKeywords[slug] || "").toLowerCase()
        };
      })
      .filter(function (course) {
        return course.title && course.href;
      });

    var activeIndex = -1;

    function escapeHTML(str) {
      return str.replace(/[&<>"']/g, function (ch) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
      });
    }

    function highlight(text, query) {
      var safe = escapeHTML(text);
      if (!query) return safe;
      var idx = safe.toLowerCase().indexOf(query.toLowerCase());
      if (idx === -1) return safe;
      return (
        safe.slice(0, idx) +
        "<mark>" +
        safe.slice(idx, idx + query.length) +
        "</mark>" +
        safe.slice(idx + query.length)
      );
    }

    function openSearch() {
      searchWrap.setAttribute("data-open", "true");
      searchToggle.setAttribute("aria-expanded", "true");
      searchInput.focus();
    }

    function closeSearch() {
      searchWrap.setAttribute("data-open", "false");
      searchToggle.setAttribute("aria-expanded", "false");
    }

    function isSearchOpen() {
      return searchWrap.getAttribute("data-open") === "true";
    }

    function setActive(index) {
      var items = searchResults.querySelectorAll(".search-result");
      items.forEach(function (item) {
        item.classList.remove("is-active");
      });
      if (index >= 0 && index < items.length) {
        activeIndex = index;
        items[index].classList.add("is-active");
        items[index].scrollIntoView({ block: "nearest" });
      } else {
        activeIndex = -1;
      }
    }

    function renderResults(query) {
      var trimmed = query.trim().toLowerCase();
      activeIndex = -1;

      if (!trimmed) {
        searchResults.innerHTML = "";
        return;
      }

      var matches = courseIndex
        .map(function (course) {
          var title = course.title.toLowerCase();
          var rank = -1;
          if (title.indexOf(trimmed) === 0) rank = 0;
          else if (title.indexOf(trimmed) !== -1) rank = 1;
          else if (course.keywords.indexOf(trimmed) !== -1) rank = 2;
          else if (course.meta.toLowerCase().indexOf(trimmed) !== -1) rank = 3;
          return { course: course, rank: rank };
        })
        .filter(function (entry) {
          return entry.rank !== -1;
        })
        .sort(function (a, b) {
          return a.rank - b.rank;
        })
        .slice(0, 8)
        .map(function (entry) {
          return entry.course;
        });

      if (!matches.length) {
        searchResults.innerHTML =
          '<p class="search-panel__empty">No courses match &ldquo;' + escapeHTML(query.trim()) + "&rdquo;.</p>";
        return;
      }

      searchResults.innerHTML = matches
        .map(function (course) {
          return (
            '<a class="search-result c-' +
            course.slug +
            '" href="' +
            course.href +
            '">' +
            '<span class="search-result__icon">' +
            course.iconHTML +
            "</span>" +
            '<span class="search-result__text">' +
            '<span class="search-result__title">' +
            highlight(course.title, trimmed) +
            "</span>" +
            '<span class="search-result__meta">' +
            escapeHTML(course.meta) +
            "</span>" +
            "</span>" +
            "</a>"
          );
        })
        .join("");
    }

    searchToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      if (isSearchOpen()) {
        closeSearch();
      } else {
        openSearch();
      }
    });

    searchPanel.addEventListener("click", function (e) {
      e.stopPropagation();
    });

    searchInput.addEventListener("input", function () {
      renderResults(searchInput.value);
    });

    searchInput.addEventListener("keydown", function (e) {
      var items = searchResults.querySelectorAll(".search-result");
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (items.length) setActive((activeIndex + 1) % items.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (items.length) setActive((activeIndex - 1 + items.length) % items.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        var target = activeIndex >= 0 ? items[activeIndex] : items[0];
        if (target) window.location.href = target.href;
      }
    });

    document.addEventListener("click", function () {
      closeSearch();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isSearchOpen()) {
        closeSearch();
        searchToggle.focus();
        return;
      }
      if (e.key === "/" && !isSearchOpen()) {
        var activeTag = document.activeElement && document.activeElement.tagName;
        var isTyping = activeTag === "INPUT" || activeTag === "TEXTAREA" || (document.activeElement && document.activeElement.isContentEditable);
        if (!isTyping) {
          e.preventDefault();
          openSearch();
        }
      }
    });
  }

  /* Expand-all / collapse-all for curriculum week accordions */
  var expandAllBtn = document.querySelector("[data-expand-all]");
  if (expandAllBtn) {
    expandAllBtn.addEventListener("click", function () {
      var weeks = document.querySelectorAll(".week-item");
      var shouldExpand = expandAllBtn.textContent.trim().indexOf("Expand") === 0;
      weeks.forEach(function (week) {
        week.open = shouldExpand;
      });
      expandAllBtn.textContent = shouldExpand ? "Collapse all weeks" : "Expand all weeks";
    });
  }

  /* Footer "Back to top" */
  document.querySelectorAll("[data-back-to-top]").forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  /* Reveal-on-scroll for generic sections and timeline items */
  var revealTargets = document.querySelectorAll(".reveal, .timeline-item");
  if ("IntersectionObserver" in window && revealTargets.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    revealTargets.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealTargets.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }
})();
