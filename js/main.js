/* ============================================================
   adminHMD Dashboard — JavaScript
   Handles sidebar toggling, dark mode, entrance animations,
   and dynamic loading of Pakistani data with live functionality.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ===========================
     DOM REFERENCES
     =========================== */
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const darkModeToggle = document.getElementById('darkModeToggle');
  const html = document.documentElement;

  /* ===========================
     SIDEBAR TOGGLE
     =========================== */
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
      const isDesktop = window.innerWidth >= 992;
      if (isDesktop) {
        sidebar.classList.toggle('collapsed');
      } else {
        sidebar.classList.toggle('show');
        sidebarOverlay.classList.toggle('show');
      }
    });
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', () => {
      sidebar.classList.remove('show');
      sidebarOverlay.classList.remove('show');
    });
  }

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 992 && sidebar) {
      sidebar.classList.remove('show');
      sidebarOverlay.classList.remove('show');
    }
  });

  /* ===========================
     DARK MODE TOGGLE
     =========================== */
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    html.setAttribute('data-bs-theme', savedTheme);
    updateDarkModeIcon(savedTheme);
  }

  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
      const currentTheme = html.getAttribute('data-bs-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-bs-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateDarkModeIcon(newTheme);

      // Re-render chart with updated colors
      renderSalesChart();
    });
  }

  function updateDarkModeIcon(theme) {
    if (!darkModeToggle) return;
    const icon = darkModeToggle.querySelector('i');
    if (icon) {
      if (theme === 'dark') {
        icon.className = 'bi bi-sun';
      } else {
        icon.className = 'bi bi-moon';
      }
    }
  }

  /* ===========================
     ENTRANCE ANIMATIONS
     =========================== */
  const animateElements = document.querySelectorAll(
    '.stat-card, .dashboard-card, .dashboard-header-card'
  );
  animateElements.forEach(el => el.classList.add('fade-in'));

  /* ===========================
     DYNAMIC DATA RENDERING & LIVE FUNCTIONALITY
     =========================== */

  // 1. Render Notifications
  function renderNotifications() {
    const notifBadges = document.querySelectorAll('.notification-badge');
    const notifDropdowns = document.querySelectorAll('.notif-dropdown');
    
    if (window.AdminStore) {
      const notifs = window.AdminStore.getNotifications();
      
      // Update badge counts
      notifBadges.forEach(badge => {
        badge.textContent = notifs.length;
        badge.style.display = notifs.length ? 'flex' : 'none';
      });

      // Update dropdown lists
      notifDropdowns.forEach(dropdown => {
        let htmlContent = `<li><h6 class="dropdown-header d-flex justify-content-between align-items-center">
          Notifications 
          ${notifs.length ? '<button class="btn btn-sm btn-link text-primary p-0 text-decoration-none" id="clearNotifsBtn" style="font-size: 0.75rem;">Clear All</button>' : ''}
        </h6></li>`;
        
        if (notifs.length === 0) {
          htmlContent += `<li><span class="dropdown-item text-muted text-center py-3">No new notifications</span></li>`;
        } else {
          notifs.forEach(n => {
            let iconClass = "bi-bell-fill text-primary";
            if (n.type === "payment") iconClass = "bi-cash-coin text-success";
            if (n.type === "alert") iconClass = "bi-exclamation-triangle-fill text-danger";
            if (n.type === "user") iconClass = "bi-person-fill text-info";

            htmlContent += `
              <li>
                <a class="dropdown-item d-flex align-items-start gap-2 py-2" href="#">
                  <i class="bi ${iconClass} mt-1"></i>
                  <div style="white-space: normal;">
                    <p class="mb-0 font-size-sm" style="font-size:0.82rem; line-height:1.3;">${n.text}</p>
                    <small class="text-muted" style="font-size:0.72rem;">${n.time}</small>
                  </div>
                </a>
              </li>
            `;
          });
        }
        dropdown.innerHTML = htmlContent;

        // Bind clear event
        const clearBtn = dropdown.querySelector('#clearNotifsBtn');
        if (clearBtn) {
          clearBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            window.AdminStore.clearNotifications();
          });
        }
      });
    }
  }

  // 2. Render Team Activity Feed
  function renderActivities() {
    const activityContainer = document.querySelector('.activity-list');
    if (activityContainer && window.AdminStore) {
      const activities = window.AdminStore.getActivities();
      let htmlContent = '';
      
      activities.forEach((act, idx) => {
        htmlContent += `
          <div class="activity-item">
            <div class="activity-dot activity-dot-${act.type}"></div>
            <div class="activity-content">
              <h6 class="activity-title">${act.title}</h6>
              <p class="activity-desc">${act.desc}</p>
              <small class="text-muted" style="font-size: 0.72rem; display:block; margin-top:2px;">${act.time}</small>
            </div>
          </div>
        `;
        if (idx < activities.length - 1) {
          htmlContent += `<hr class="activity-divider" />`;
        }
      });
      activityContainer.innerHTML = htmlContent || '<p class="text-muted text-center py-3">No activity logged.</p>';
    }
  }

  // 3. Render Users Table (Recent Users in Dashboard OR All Users in Users Page)
  function renderUsersTable(filterText = '') {
    const tableBody = document.querySelector('#usersTable tbody');
    if (!tableBody || !window.AdminStore) return;

    const isUsersPage = window.location.pathname.includes('users.html');
    let users = window.AdminStore.getUsers();

    // Filter logic
    if (filterText) {
      const query = filterText.toLowerCase();
      users = users.filter(u => 
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.role.toLowerCase().includes(query) ||
        u.team.toLowerCase().includes(query) ||
        (u.city && u.city.toLowerCase().includes(query))
      );
    }

    // Limit to 5 if dashboard page
    if (!isUsersPage) {
      users = users.slice(0, 5);
    }

    let htmlContent = '';
    users.forEach(u => {
      let statusClass = 'badge-active';
      if (u.status === 'Pending') statusClass = 'badge-pending';
      if (u.status === 'Suspended') statusClass = 'badge-suspended';

      const checkboxCell = isUsersPage ? `<td><input type="checkbox" class="form-check-input user-select-checkbox" data-id="${u.id}" /></td>` : '';
      const actionCell = isUsersPage ? `
        <td>
          <div class="d-flex gap-1">
            <button class="btn btn-sm btn-outline-primary btn-action-view" data-id="${u.id}" style="border-radius:6px; padding:4px 8px;"><i class="bi bi-eye"></i></button>
            <button class="btn btn-sm btn-outline-secondary btn-action-status" data-id="${u.id}" style="border-radius:6px; padding:4px 8px;"><i class="bi bi-arrow-repeat"></i></button>
            <button class="btn btn-sm btn-outline-danger btn-action-delete" data-id="${u.id}" style="border-radius:6px; padding:4px 8px;"><i class="bi bi-trash"></i></button>
          </div>
        </td>
      ` : `
        <td><a href="#" class="btn-view-action btn-action-view" data-id="${u.id}">View</a></td>
      `;

      htmlContent += `
        <tr class="user-row" data-id="${u.id}">
          ${checkboxCell}
          <td>
            <div class="user-cell">
              <div class="user-avatar" style="background: ${u.avatarColor || 'linear-gradient(135deg, #2563eb, #3b82f6)'}">${u.avatar}</div>
              <div>
                <span class="user-name">${u.name}</span>
                <span class="user-email">${u.email}</span>
              </div>
            </div>
          </td>
          <td>${u.role}</td>
          <td>${u.team} <span class="text-muted d-none d-md-inline" style="font-size:0.75rem;">(${u.city || 'PK'})</span></td>
          <td><span class="badge-status ${statusClass}" style="cursor:pointer;" onclick="toggleStatus(${u.id})">${u.status}</span></td>
          <td>${u.joined}</td>
          ${actionCell}
        </tr>
      `;
    });

    tableBody.innerHTML = htmlContent || `<tr><td colspan="${isUsersPage ? 8 : 6}" class="text-center text-muted py-4">No matching records found.</td></tr>`;

    // Bind action listeners
    bindTableActions();
  }

  // Global toggle status helper
  window.toggleStatus = function(id) {
    if (window.AdminStore) {
      const users = window.AdminStore.getUsers();
      const user = users.find(u => u.id === id);
      if (user) {
        let newStatus = 'Active';
        if (user.status === 'Active') newStatus = 'Pending';
        else if (user.status === 'Pending') newStatus = 'Suspended';
        window.AdminStore.updateUserStatus(id, newStatus);
      }
    }
  };

  // Bind View/Delete actions
  function bindTableActions() {
    // View Action
    document.querySelectorAll('.btn-action-view').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = parseInt(btn.getAttribute('data-id'));
        const user = window.AdminStore.getUsers().find(u => u.id === id);
        if (user) {
          alert(`Pakistani User Account Details:\n\nName: ${user.name}\nEmail: ${user.email}\nRole: ${user.role}\nTeam: ${user.team}\nCity: ${user.city || 'Karachi'}\nStatus: ${user.status}\nJoined: ${user.joined}`);
        }
      });
    });

    // Delete Action
    document.querySelectorAll('.btn-action-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = parseInt(btn.getAttribute('data-id'));
        const user = window.AdminStore.getUsers().find(u => u.id === id);
        if (user && confirm(`Are you sure you want to permanently delete the Pakistani account for ${user.name}?`)) {
          window.AdminStore.deleteUser(id);
        }
      });
    });

    // Cycle Status Action
    document.querySelectorAll('.btn-action-status').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = parseInt(btn.getAttribute('data-id'));
        window.toggleStatus(id);
      });
    });
  }

  // Bind Search Inputs
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderUsersTable(e.target.value);
    });
  }

  // Search input in Users Page
  const pageSearchInput = document.querySelector('.users-section .search-input');
  if (pageSearchInput) {
    pageSearchInput.addEventListener('input', (e) => {
      renderUsersTable(e.target.value);
    });
  }

  // Handle Add User Form Submission
  const addUserForm = document.querySelector('form');
  if (addUserForm && window.location.pathname.includes('add-user.html')) {
    addUserForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const firstName = addUserForm.querySelector('input[placeholder="Enter first name"]').value;
      const lastName = addUserForm.querySelector('input[placeholder="Enter last name"]').value;
      const email = addUserForm.querySelector('input[placeholder="user@example.com"]').value;
      const role = addUserForm.querySelector('select[class*="form-select"]').value;
      const team = addUserForm.querySelectorAll('select[class*="form-select"]')[1].value;
      
      // Auto-extract Pakistani cities dynamically
      const cities = ["Karachi", "Lahore", "Islamabad", "Peshawar", "Quetta", "Multan", "Sialkot", "Faisalabad"];
      const randomCity = cities[Math.floor(Math.random() * cities.length)];

      if (!firstName || !lastName || !email || role === 'Select role...' || team === 'Select team...') {
        alert("Please fill all required (*) fields.");
        return;
      }

      const newUser = {
        name: `${firstName} ${lastName}`,
        email: email,
        role: role,
        team: team,
        status: "Active",
        avatar: `${firstName[0]}${lastName[0]}`.toUpperCase(),
        city: randomCity,
        joined: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        avatarColor: "linear-gradient(135deg, #0ea5e9, #06b6d4)"
      };

      window.AdminStore.addUser(newUser);
      alert(`Pakistani user account successfully created for ${newUser.name} (City: ${newUser.city})! Redirecting to users list...`);
      window.location.href = "users.html";
    });
  }

  // Events Listeners for Store Updates
  window.addEventListener('adminhmd_users_updated', () => {
    renderUsersTable();
  });
  window.addEventListener('adminhmd_activities_updated', () => {
    renderActivities();
  });
  window.addEventListener('adminhmd_notifications_updated', () => {
    renderNotifications();
  });

  // Initial renders
  renderNotifications();
  renderActivities();
  renderUsersTable();


  /* ===========================
     SALES PERFORMANCE CHART
     =========================== */
  function renderSalesChart() {
    const ctx = document.getElementById('salesChart');
    if (!ctx) return;

    const existingChart = Chart.getChart(ctx);
    if (existingChart) existingChart.destroy();

    const isDark = html.getAttribute('data-bs-theme') === 'dark';
    const chartCtx = ctx.getContext('2d');
    const gradient = chartCtx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(37, 99, 235, 0.85)');
    gradient.addColorStop(1, 'rgba(37, 99, 235, 0.45)');

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Revenue (PKR)',
          data: [1800000, 2500000, 2200000, 2800000, 3200000, 4824000],
          backgroundColor: gradient,
          borderRadius: 8,
          borderSkipped: false,
          barPercentage: 0.55,
          categoryPercentage: 0.7,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: isDark ? '#334155' : '#1e293b',
            titleFont: { family: "'Inter', sans-serif", weight: '600' },
            bodyFont: { family: "'Inter', sans-serif" },
            cornerRadius: 8,
            padding: 12,
            callbacks: {
              label: (context) => `Rs. ${context.parsed.y.toLocaleString()}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: '#94a3b8',
              font: { family: "'Inter', sans-serif", size: 13, weight: '500' }
            },
            border: { display: false }
          },
          y: {
            grid: {
              color: isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(148, 163, 184, 0.15)',
              drawTicks: false
            },
            ticks: {
              color: '#94a3b8',
              font: { family: "'Inter', sans-serif", size: 12 },
              padding: 10,
              callback: (value) => {
                if (value === 0) return '0';
                return `Rs. ${(value / 100000).toFixed(1)} Lakh`;
              }
            },
            border: { display: false },
            beginAtZero: true
          }
        },
        animation: {
          duration: 1200,
          easing: 'easeOutQuart'
        }
      }
    });
  }

  // Render chart initially
  renderSalesChart();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(renderSalesChart, 300);
  });

});
