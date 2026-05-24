document.addEventListener("DOMContentLoaded", () => {
  /* =========================
     Configuration
     ========================= */
  const API_PORT = 5000;
  const API_PATH = "/api";
  const API_HOSTS = ["localhost", "127.0.0.1"];
  let currentUser = null;
  let topicsData = [];

  function getApiUrl(host) {
    return `http://${host}:${API_PORT}${API_PATH}`;
  }

  async function apiFetch(path, options = {}) {
    let lastError = null;
    for (const host of API_HOSTS) {
      const url = `${getApiUrl(host)}${path}`;
      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          return { response, url };
        }
        return { response, url };
      } catch (error) {
        lastError = { error, url };
      }
    }
    throw lastError;
  }

  /* =========================
     DOM Elements
     ========================= */
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  const mainApp = document.getElementById("main-app");
  const loginBtn = document.getElementById("login-btn");
  const signupBtn = document.getElementById("signup-btn");
  const showSignup = document.getElementById("show-signup");
  const showLogin = document.getElementById("show-login");
  const errorMessage = document.getElementById("error-message");
  const debugMessage = document.getElementById("debug-message");
  const statusMessage = document.getElementById("status-message");
  const userProfile = document.getElementById("user-profile");
  const profileDropdown = document.getElementById("profile-dropdown");
  const viewDetailsBtn = document.getElementById("view-details-btn");
  const profileUsername = document.getElementById("profile-username");
  const profileUserId = document.getElementById("profile-userid");
  const logoutBtn = document.getElementById("logout-btn");
  const mainContent = document.getElementById("main-content");
  const userDetailsPage = document.getElementById("user-details-page");
  const userDetailsBackBtn = document.getElementById("user-details-back-btn");
  const detailUsername = document.getElementById("detail-username");
  const detailFullname = document.getElementById("detail-fullname");
  const detailEmail = document.getElementById("detail-email");
  const detailAge = document.getElementById("detail-age");
  const detailYear = document.getElementById("detail-year");
  const detailUserId = document.getElementById("detail-userid");
  const detailLogins = document.getElementById("detail-logins");
  const detailLastLogin = document.getElementById("detail-last-login");
  const loginActivityChart = document.getElementById("login-activity-chart");
  const detailAccountHealth = document.getElementById("detail-account-health");
  const detailsSessions = document.getElementById("details-sessions");
  const scrollTopBtn = document.getElementById("scroll-top-btn");

  const searchInput = document.getElementById("search-input");
  const searchBtn = document.getElementById("search-btn");
  const resultHeading = document.getElementById("result-heading");
  const errorContainer = document.getElementById("error-container");
  const searchContainer = document.querySelector(".search-container");
  const topicsContainer = document.getElementById("topics");
  const topicDetails = document.getElementById("topic-details");
  const topicDetailsContent = document.querySelector(".topic-details-content");
  const backBtn = document.getElementById("back-btn");
  const tipBox = document.getElementById("tip-box");

  /* =========================
     API Functions
     ========================= */
  async function fetchTopics() {
    try {
      console.log("🔄 Fetching topics from backend...");
      const { response, url } = await apiFetch("/topics");
      console.log("📡 Topics request url:", url);
      console.log("📡 Response status:", response.status);
      
      if (response.ok) {
        const backendTopics = await response.json();
        if (Array.isArray(backendTopics) && backendTopics.length > 0) {
          const existingIds = new Set(topicsData.map(topic => String(topic.id)));
          topicsData = [...topicsData];
          backendTopics.forEach(topic => {
            if (!existingIds.has(String(topic.id))) {
              topicsData.push(topic);
              existingIds.add(String(topic.id));
            }
          });
          console.log("✅ Topics loaded and merged:", topicsData.length, "topics");
        } else {
          console.warn("⚠️ Backend returned no topics, keeping fallback topics");
          loadDefaultTopics();
        }
      } else {
        console.error("❌ Failed to fetch topics, using fallback");
        loadDefaultTopics();
      }
    } catch (error) {
      console.error("❌ Error fetching topics:", error);
      console.log("📌 Using fallback default topics");
      loadDefaultTopics();
    }
  }

  function loadDefaultTopics() {
    topicsData = [
      { id:"1", title:"Two-Factor Authentication", category:"Account Security", description:"Learn why using two-step verification helps keep student accounts safe from unauthorized access.", link:"https://support.google.com/accounts/answer/185839" },
      { id:"2", title:"Account Recovery", category:"Account Security", description:"Discover how to set up recovery options so you can access school accounts if you forget your password.", link:"https://support.google.com/accounts/answer/7682439" },
      { id:"3", title:"Social Media Security", category:"Privacy", description:"Find out how to protect your privacy on social media, especially when sharing student life and school details.", link:"https://www.ncsc.gov.uk/guidance/social-media-how-to-use-it-safely" },
      { id:"4", title:"Phishing Awareness", category:"Email Security", description:"Understand how to spot fake school emails and phishing messages that try to trick students.", link:"https://www.ncsc.gov.uk/guidance/phishing#section_2", aliases:["phishing","pishing"] },
      { id:"5", title:"ELMS Account Recovery", category:"School Accounts", description:"If you lose access to your ELMS account, contact Sir Jasper in ComLab1 or visit the faculty office for account recovery help.", link:"https://www.identitytheft.gov/" },
      { id:"6", title:"Use Strong Passwords", category:"Account Security", description:"Find out how students can create strong, memorable passwords for school and personal accounts.", link:"https://www.cisa.gov/secure-our-world/use-strong-passwords" },
      { id:"7", title:"Cybersecurity Awareness", category:"Cyber Security Awareness", description:"Get student-friendly tips on staying safe online, keeping devices secure, and avoiding common cyber risks.", link:"https://www.nist.gov/cyberframework" },
      { id:"8", title:"Safe Browsing Practices", category:"Cyber Security Awareness", description:"Learn how to browse safely, avoid dangerous websites, and protect schoolwork from online threats.", link:"https://staysafeonline.org/resources/" },
      { id:"9", title:"Mobile Device Security", category:"Cyber Security Awareness", description:"See how students can secure phones and tablets used for learning and communication.", link:"https://consumer.ftc.gov/identity-theft-online-security" },
      { id:"10", title:"Recognizing Scams", category:"Cyber Security Awareness", description:"Learn how to identify scam messages, fake offers, and dangerous links aimed at students.", link:"https://consumer.ftc.gov/articles/how-recognize-avoid-phishing-scams" },
      { id:"11", title:"Digital Footprint", category:"Online Safety", description:"Understand how your online activity becomes part of your digital footprint and how to keep it positive.", link:"https://consumer.ftc.gov/articles/protecting-your-childs-privacy-online" },
      { id:"12", title:"Protecting Student Privacy", category:"Privacy", description:"Find out what personal information students should keep private and how to share responsibly online.", link:"https://consumer.ftc.gov/identity-theft-and-online-security/online-privacy-and-security" },
      { id:"13", title:"Cyberbullying Awareness", category:"Digital Citizenship", description:"Learn how to recognize cyberbullying and what students can do to stay safe and support others.", link:"https://www.stopbullying.gov/cyberbullying/what-is-it" },
      { id:"14", title:"Campus Wi-Fi Safety", category:"Network Security", description:"Discover best practices for using campus and public Wi-Fi safely while studying and browsing.", link:"https://consumer.ftc.gov/identity-theft-online-security" },
      { id:"15", title:"Cybersecurity Awareness Training", category:"Cyber Security Awareness", description:"Explore training resources and practical tips students can use to build safer online habits and recognize common threats.", link:"https://www.nist.gov/cyberframework" },
      { id:"16", title:"Password Manager Safety", category:"Account Security", description:"Learn how password managers help students store strong passwords safely and avoid reusing the same password across multiple sites.", link:"https://support.google.com/accounts/answer/32040" },
      { id:"17", title:"Privacy & Data Sharing", category:"Privacy", description:"Discover how to manage personal privacy settings and think before sharing sensitive information online or in school groups.", link:"https://www.nist.gov/cybersecurity-and-privacy" },
      { id:"18", title:"Online Study Tool Safety", category:"Digital Citizenship", description:"Find tips for staying safe when using online learning tools, classroom apps, and school collaboration platforms.", link:"https://consumer.ftc.gov/consumer-alerts" },
      { id:"19", title:"Protecting Personal Devices", category:"Device Security", description:"See how to keep laptops, tablets, and smartphones secure with updates, screen locks, and safe downloads.", link:"https://consumer.ftc.gov/identity-theft-online-security" },
      { id:"20", title:"Responsible Password Sharing", category:"Account Security", description:"Understand why sharing passwords is risky and how to keep your school accounts secure.", link:"https://support.google.com/accounts/answer/32040" }
    ];
  }

  async function loginUser(username, password) {
    try {
      console.log("Attempting login for:", username);
      const { response, url } = await apiFetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      console.log("Login request url:", url);
      console.log("Login response status:", response.status);
      const data = await response.json();
      console.log("Login response data:", data);

      if (response.ok && data.user) {
        currentUser = data.user;
        return { success: true, message: data.message, data };
      } else if (!response.ok) {
        return { success: false, error: data.error || 'Unknown login error', data };
      } else {
        return { success: false, error: 'Backend returned invalid login payload', data };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Backend connection failed: " + error.message + ". Make sure backend server is running on http://localhost:5000" };
    }
  }

  async function signupUser(user) {
    try {
      console.log("Attempting signup for:", user.username);
      const { response, url } = await apiFetch("/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user)
      });
      console.log("Signup request url:", url);
      console.log("Signup response status:", response.status);
      const data = await response.json();
      console.log("Signup response data:", data);

      if (response.ok) {
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error("Signup error:", error);
      return { success: false, error: "Backend connection failed: " + error.message + ". Make sure backend server is running on http://localhost:5000" };
    }
  }

  if (statusMessage) {
    statusMessage.textContent = '';
    if (window.location.protocol === 'https:') {
      statusMessage.textContent = 'Warning: page is HTTPS. HTTP backend calls may be blocked by Brave. Use HTTP Live Server or enable insecure content for localhost.';
    }
  }

  window.onerror = function(message, source, lineno, colno, error) {
    const errorText = `JS load error: ${message} at ${source}:${lineno}:${colno}`;
    if (statusMessage) statusMessage.textContent = errorText;
    if (debugMessage) debugMessage.textContent = errorText;
    console.error(errorText, error);
  };

  window.onunhandledrejection = function(event) {
    const errorText = `Unhandled rejection: ${event.reason}`;
    if (statusMessage) statusMessage.textContent = errorText;
    if (debugMessage) debugMessage.textContent = errorText;
    console.error(errorText);
  };

  function showUserDetails() {
    if (mainContent) mainContent.classList.add("hidden");
    if (topicDetails) topicDetails.classList.add("hidden");
    if (userDetailsPage) userDetailsPage.classList.remove("hidden");
    if (profileDropdown) profileDropdown.classList.add("hidden");
    loadUserDetails();
  }

  function hideUserDetails() {
    if (mainContent) mainContent.classList.remove("hidden");
    if (userDetailsPage) userDetailsPage.classList.add("hidden");
    if (profileDropdown) profileDropdown.classList.add("hidden");
  }

  async function loadUserDetails() {
    if (!currentUser) return;
    try {
      // Fetch fresh user info first (ensure email/age/year are present)
      const userResp = await apiFetch(`/users/${currentUser.id}`);
      if (userResp && userResp.response && userResp.response.ok) {
        const userData = await userResp.response.json();
        currentUser = { ...currentUser, ...userData };
        try { saveCurrentUser(); } catch (e) {}
      }

      const { response, url } = await apiFetch(`/users/${currentUser.id}/sessions`);
      console.log("User details request url:", url);
      if (!response.ok) {
        throw new Error(`Status ${response.status}`);
      }
      const sessions = await response.json();
      renderUserDetails(sessions);
    } catch (error) {
      console.error("User details error:", error);
      if (detailsSessions) detailsSessions.innerHTML = `<li class='session-empty'>Unable to load session history.</li>`;
    }
  }

  function renderUserDetails(sessions) {
    if (!currentUser) return;
    if (detailUsername) detailUsername.textContent = currentUser.username;
    if (detailFullname) detailFullname.textContent = currentUser.fullName || currentUser.username;
    if (detailEmail) detailEmail.textContent = currentUser.email || "-";
    if (detailAge) detailAge.textContent = currentUser.age ? String(currentUser.age) : "-";
    if (detailYear) detailYear.textContent = currentUser.year || "-";
    if (detailUserId) detailUserId.textContent = currentUser.id;
    const totalLogins = sessions.length;
    if (detailLogins) detailLogins.textContent = String(totalLogins);
    const lastLogin = totalLogins ? new Date(sessions[0].loginTime).toLocaleString() : "Never";
    if (detailLastLogin) detailLastLogin.textContent = lastLogin;
    if (detailAccountHealth) detailAccountHealth.textContent = `${Math.min(100, 65 + totalLogins * 6)}%`;

    const now = new Date();
    const counts = Array(7).fill(0);
    sessions.forEach(session => {
      const date = new Date(session.loginTime);
      const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays < 7) {
        counts[6 - diffDays] += 1;
      }
    });

    if (loginActivityChart) {
      const labels = ["6d","5d","4d","3d","2d","1d","Today"];
      loginActivityChart.innerHTML = counts.map((value, index) => {
        const height = Math.max(16, Math.min(100, value * 24 + 16));
        return `<div class="bar-segment"><div class="bar-fill" style="height:${height}%"></div><span>${labels[index]}</span></div>`;
      }).join("");
    }

    if (detailsSessions) {
      if (!sessions.length) {
        detailsSessions.innerHTML = `<li class='session-empty'>No recent sessions</li>`;
      } else {
        detailsSessions.innerHTML = sessions.slice(0, 5).map(session => {
          const time = new Date(session.loginTime).toLocaleString();
          return `<li><strong>${time}</strong><span>Session ${session.id}</span></li>`;
        }).join("");
      }
    }
  }

  function updateUserProfileDisplay() {
    if (!currentUser) return;
    const userNameEl = document.querySelector(".user-name");
    const displayName = currentUser.fullName || currentUser.username;
    if (userNameEl) userNameEl.textContent = displayName;
    if (profileUsername) profileUsername.textContent = currentUser.username;
    if (profileUserId) profileUserId.textContent = currentUser.id;
    if (profileDropdown) profileDropdown.classList.add("hidden");
  }

  function logoutUser() {
    currentUser = null;
    loginForm.classList.remove("hidden");
    signupForm.classList.add("hidden");
    mainApp.classList.add("hidden");
    userProfile.classList.add("hidden");
    if (profileDropdown) profileDropdown.classList.add("hidden");
    if (userDetailsPage) userDetailsPage.classList.add("hidden");
    if (topicDetails) topicDetails.classList.add("hidden");
    if (statusMessage) statusMessage.textContent = "Logged out successfully.";
    if (debugMessage) debugMessage.textContent = "";
    if (errorMessage) errorMessage.textContent = "";
    if (detailsSessions) detailsSessions.innerHTML = "";
    if (loginActivityChart) loginActivityChart.innerHTML = "";
  }

  if (userProfile) {
    userProfile.addEventListener("click", () => {
      if (!profileDropdown) return;
      profileDropdown.classList.toggle("hidden");
    });
  }

  if (profileDropdown) {
    profileDropdown.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }

  if (viewDetailsBtn) {
    viewDetailsBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      showUserDetails();
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      logoutUser();
    });
  }

  // Fallback: handle clicks on logout button even if it's covered or the event wasn't attached
  document.addEventListener('click', (e) => {
    try {
      const btn = e.target.closest && e.target.closest('#logout-btn');
      if (btn) {
        e.preventDefault();
        logoutUser();
      }
    } catch (err) {
      // ignore
    }
  });

  if (userDetailsBackBtn) {
    userDetailsBackBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      hideUserDetails();
    });
  }

  window.addEventListener("click", (e) => {
    if (!profileDropdown || !userProfile) return;
    if (userProfile.contains(e.target)) return;
    profileDropdown.classList.add("hidden");
  });

  /* =========================
     Functions
     ========================= */
  function searchTopics() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    if (!searchTerm) {
      errorContainer.textContent = "Please enter a topic to search.";
      errorContainer.classList.remove("hidden");
      return;
    }

    resultHeading.textContent = `Results for "${searchTerm}":`;
    topicsContainer.innerHTML = "";
    errorContainer.classList.add("hidden");

    const results = topicsData.filter(topic =>
      topic.title.toLowerCase().includes(searchTerm) ||
      topic.category.toLowerCase().includes(searchTerm) ||
      topic.description.toLowerCase().includes(searchTerm) ||
      (topic.aliases && topic.aliases.some(alias => alias.toLowerCase() === searchTerm))
    );

    if (results.length === 0) {
      resultHeading.textContent = "";
      errorContainer.textContent = `No topics found for "${searchTerm}". Try another keyword!`;
      errorContainer.classList.remove("hidden");
    } else {
      displayTopics(results);
      searchInput.value = "";
      topicsContainer.scrollIntoView({ behavior: "smooth" });
    }
  }

  function displayTopics(topics) {
    topicsContainer.innerHTML = "";
    topics.forEach((topic, index) => {
      const card = document.createElement("div");
      card.className = "topic-card";
      card.setAttribute("data-topic-id", topic.id);
      card.innerHTML = `
        <h3 class="topic-title">${topic.title}</h3>
        <div class="topic-category">${topic.category}</div>
        <p class="topic-description">${topic.description}</p>
        ${ topic.link ? `<a href="${topic.link}" target="_blank" class="learn-more-link"><i class="fas fa-shield-alt"></i> Learn More</a>` : "" }
      `;
      topicsContainer.appendChild(card);

      setTimeout(() => card.classList.add("show"), index * 100);
    });

    searchContainer.classList.add("glow");
    setTimeout(() => searchContainer.classList.remove("glow"), 1000);
  }

  function showTip() {
    if (!tipBox) return;
    const tips = [
      "Always enable Two-Factor Authentication for extra protection.",
      "Use long, unique passwords with letters, numbers, and symbols.",
      "Check for HTTPS before entering sensitive information.",
      "Never click suspicious links in emails or messages.",
      "Update your apps and operating system regularly."
    ];
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    tipBox.innerHTML = `<h2>Safe Surfing Secret</h2><p>${randomTip}</p>`;
    tipBox.classList.remove("animate");
    void tipBox.offsetWidth; // force reflow
    tipBox.classList.add("animate");
  }

  /* =========================
     Event Listeners
     ========================= */
  // Auth form toggles
  showSignup.addEventListener("click", () => {
    loginForm.classList.add("hidden");
    signupForm.classList.remove("hidden");
    signupForm.classList.add("show");
  });

  showLogin.addEventListener("click", () => {
    signupForm.classList.add("hidden");
    loginForm.classList.remove("hidden");
  });

  signupBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const fullName = document.getElementById("signup-fullname").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const age = document.getElementById("signup-age").value.trim();
    const year = document.getElementById("signup-year").value.trim();
    const username = document.getElementById("signup-username").value.trim();
    const password = document.getElementById("signup-password").value.trim();

    if (!fullName || !email || !age || !year || !username || !password) {
      alert("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    console.log("Signup attempt:", username);
    const result = await signupUser({ username, password, email, fullName, age, year });
    console.log("Signup result:", result);
    
    if (result.success) {
      alert("✅ Account created! Logging you in now...");
      const loginResult = await loginUser(username, password);
      if (loginResult.success) {
        loginForm.classList.add("hidden");
        signupForm.classList.add("hidden");
        mainApp.classList.remove("hidden");
        userProfile.classList.remove("hidden");
        scrollTopBtn.classList.remove("hidden");
        updateUserProfileDisplay();
        document.getElementById("signup-fullname").value = "";
        document.getElementById("signup-email").value = "";
        document.getElementById("signup-age").value = "";
        document.getElementById("signup-year").value = "";
        document.getElementById("signup-username").value = "";
        document.getElementById("signup-password").value = "";
      } else {
        alert("✅ Account created, but automatic login failed. Please use the login form.");
        signupForm.classList.add("hidden");
        loginForm.classList.remove("hidden");
      }
    } else {
      alert("❌ Sign up failed:\n" + result.error);
      console.error("Signup error details:", result.error);
    }
  });

  // Login
  loginBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (statusMessage) statusMessage.textContent = 'Attempting login...';

    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value.trim();

    if (!username || !password) {
      errorMessage.textContent = "Please enter username and password";
      return;
    }

    console.log("🔐 Login button clicked for user:", username);
    const result = await loginUser(username, password);
    console.log("🔐 Login result object:", result);
    console.log("🔐 result.success:", result.success);
    console.log("🔐 currentUser:", currentUser);
    debugMessage.textContent = `Login response status: ${result.success ? 'success' : 'failure'} - ${result.message || result.error}`;
    debugMessage.classList.remove('hidden');
    
    if (result.success) {
      console.log("✅ LOGIN SUCCESSFUL - Showing main app");
      loginForm.classList.add("hidden");
      signupForm.classList.add("hidden");
      mainApp.classList.remove("hidden");
      userProfile.classList.remove("hidden");
      scrollTopBtn.classList.remove("hidden");
      errorMessage.textContent = "";
      
      updateUserProfileDisplay();
      console.log("👤 Setting username to:", currentUser.username);
      document.getElementById("login-username").value = "";
      document.getElementById("login-password").value = "";

      const welcomeBox = document.querySelector(".welcome-box");
      if (welcomeBox) {
        setTimeout(() => {
          welcomeBox.classList.add("fade-out");
          setTimeout(() => { welcomeBox.style.display = "none"; }, 1000);
        }, 3000);
      }
    } else {
      console.error("❌ LOGIN FAILED:", result.error);
      errorMessage.textContent = "❌ " + result.error;
      debugMessage.textContent = `Server response: ${JSON.stringify(result.data || {})}`;
      document.getElementById("login-username").value = "";
      document.getElementById("login-password").value = "";
    }
  });

  // Search
  searchBtn.addEventListener("click", searchTopics);
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") searchTopics();
  });

  document.querySelectorAll(".suggestions li").forEach(item => {
    item.addEventListener("click", () => {
      searchInput.value = item.textContent;
      searchTopics();
      topicsContainer.scrollIntoView({ behavior: "smooth" });
    });
  });

  // Topic card click
  topicsContainer.addEventListener("click", (e) => {
    const topicEl = e.target.closest(".topic-card");
    if (!topicEl) return;

    const topicId = topicEl.getAttribute("data-topic-id");
    const topic = topicsData.find(t => String(t.id) === String(topicId));

    if (topic) {
      topicDetailsContent.innerHTML = `
        <h2 class="topic-details-title">${topic.title}</h2>
        <div class="topic-details-category"><span>${topic.category}</span></div>
        <div class="topic-details-description">
          <h3>Description</h3>
          <p>${topic.description}</p>
        </div>
        ${ topic.link ? `<a href="${topic.link}" target="_blank" class="learn-more-link"><i class="fas fa-shield-alt"></i> Learn More</a>` : "" }
      `;
      topicDetails.classList.remove("hidden");
      topicDetails.scrollIntoView({ behavior: "smooth" });
    }
  });

  backBtn.addEventListener("click", () => {
    topicDetails.classList.add("hidden");
  });

  // Tips
  showTip();
  setInterval(showTip, 30000);

  // Scroll-to-top visibility
  window.addEventListener("scroll", () => {
    const atBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 20;

    if (atBottom) {
      scrollTopBtn.classList.add("show");
    } else {
      scrollTopBtn.classList.remove("show");
    }
  });

  // Smooth scroll back to top
  scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Load default topics immediately, then refresh from the backend
  loadDefaultTopics();
  fetchTopics();
});
