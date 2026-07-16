// adminHMD LocalStorage State Store for Pakistani Dashboard Functionality
(function () {
  const DEFAULT_USERS = [
    { id: 1, name: "Sarah Ahmed", email: "sarah.ahmed@domain.pk", role: "Admin", team: "Operations", status: "Active", joined: "Jan 12, 2026", avatar: "SA", city: "Karachi", avatarColor: "linear-gradient(135deg, #6366f1, #8b5cf6)" },
    { id: 2, name: "Rafi Khan", email: "rafi.khan@domain.pk", role: "Manager", team: "Sales", status: "Active", joined: "Feb 03, 2026", avatar: "RK", city: "Lahore", avatarColor: "linear-gradient(135deg, #2563eb, #3b82f6)" },
    { id: 3, name: "Nadia Islam", email: "nadia.islam@domain.pk", role: "Editor", team: "Content", status: "Pending", joined: "Mar 18, 2026", avatar: "NI", city: "Islamabad", avatarColor: "linear-gradient(135deg, #059669, #10b981)" },
    { id: 4, name: "Zain Ali", email: "zain.ali@domain.pk", role: "Viewer", team: "Finance", status: "Suspended", joined: "Apr 07, 2026", avatar: "ZA", city: "Peshawar", avatarColor: "linear-gradient(135deg, #d97706, #f59e0b)" },
    { id: 5, name: "Bilal Siddiqui", email: "bilal.siddiqui@domain.pk", role: "Analyst", team: "Data", status: "Active", joined: "Apr 22, 2026", avatar: "BS", city: "Faisalabad", avatarColor: "linear-gradient(135deg, #64748b, #94a3b8)" }
  ];

  const DEFAULT_ACTIVITIES = [
    { id: 1, type: "blue", title: "New campaign launched in Lahore", desc: "Marketing team published the Lahore Summer Gala offer.", time: "2 hours ago" },
    { id: 2, type: "green", title: "EasyPaisa settlement batch cleared", desc: "Rs. 246,000 invoices were processed successfully via HBL.", time: "5 hours ago" },
    { id: 3, type: "yellow", title: "Support queue rising (Karachi Office)", desc: "Average response time is 18 minutes due to electricity loadshedding.", time: "Just now" }
  ];

  const DEFAULT_NOTIFICATIONS = [
    { id: 1, text: "New signup from Sarah Ahmed (Karachi)", type: "user", time: "2 mins ago" },
    { id: 2, text: "EasyPaisa payment of Rs. 48,240 received", type: "payment", time: "1 hour ago" },
    { id: 3, text: "Server warning: Islamabad Node high memory", type: "alert", time: "5 hours ago" }
  ];

  // Initialize store if not already present
  if (!localStorage.getItem("adminhmd_users")) {
    localStorage.setItem("adminhmd_users", JSON.stringify(DEFAULT_USERS));
  }
  if (!localStorage.getItem("adminhmd_activities")) {
    localStorage.setItem("adminhmd_activities", JSON.stringify(DEFAULT_ACTIVITIES));
  }
  if (!localStorage.getItem("adminhmd_notifications")) {
    localStorage.setItem("adminhmd_notifications", JSON.stringify(DEFAULT_NOTIFICATIONS));
  }
  if (!localStorage.getItem("adminhmd_stats")) {
    localStorage.setItem("adminhmd_stats", JSON.stringify({
      revenue: "PKR 4,824,000",
      orders: "1,284",
      customers: "8,742",
      tickets: "36"
    }));
  }

  // Global helper functions
  window.AdminStore = {
    getUsers: function () {
      return JSON.parse(localStorage.getItem("adminhmd_users") || "[]");
    },
    saveUsers: function (users) {
      localStorage.setItem("adminhmd_users", JSON.stringify(users));
      // Dispatch an event so other scripts can listen to updates
      window.dispatchEvent(new Event("adminhmd_users_updated"));
    },
    addUser: function (user) {
      const users = this.getUsers();
      user.id = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;
      user.joined = user.joined || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
      user.avatarColor = user.avatarColor || "linear-gradient(135deg, #6366f1, #8b5cf6)";
      users.push(user);
      this.saveUsers(users);
      this.addActivity("blue", "New user added: " + user.name, "Added to team " + user.team + " in " + (user.city || "Pakistan"));
    },
    deleteUser: function (id) {
      let users = this.getUsers();
      const userToDelete = users.find(u => u.id === id);
      users = users.filter(u => u.id !== id);
      this.saveUsers(users);
      if (userToDelete) {
        this.addActivity("red", "User deleted: " + userToDelete.name, "Account removed from the database.");
      }
    },
    updateUserStatus: function (id, status) {
      const users = this.getUsers();
      const user = users.find(u => u.id === id);
      if (user) {
        user.status = status;
        this.saveUsers(users);
        this.addActivity("yellow", `User status updated: ${user.name}`, `Status set to ${status}.`);
      }
    },
    getActivities: function () {
      return JSON.parse(localStorage.getItem("adminhmd_activities") || "[]");
    },
    addActivity: function (type, title, desc) {
      const activities = this.getActivities();
      activities.unshift({
        id: Date.now(),
        type: type,
        title: title,
        desc: desc,
        time: "Just now"
      });
      // Limit to 10 activities
      if (activities.length > 10) activities.pop();
      localStorage.setItem("adminhmd_activities", JSON.stringify(activities));
      window.dispatchEvent(new Event("adminhmd_activities_updated"));
    },
    getNotifications: function () {
      return JSON.parse(localStorage.getItem("adminhmd_notifications") || "[]");
    },
    addNotification: function (text, type) {
      const notifs = this.getNotifications();
      notifs.unshift({
        id: Date.now(),
        text: text,
        type: type,
        time: "Just now"
      });
      localStorage.setItem("adminhmd_notifications", JSON.stringify(notifs));
      window.dispatchEvent(new Event("adminhmd_notifications_updated"));
    },
    clearNotifications: function () {
      localStorage.setItem("adminhmd_notifications", JSON.stringify([]));
      window.dispatchEvent(new Event("adminhmd_notifications_updated"));
    }
  };
})();
