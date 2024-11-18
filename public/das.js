const validAdminId = "admin";
const validPassword = "123456";

// Key-to-file mapping
const pageMap = {
    todayPayments: "expiry-user.html",
    pendingPayments: "pending.html",
    completedDues: "alldues.html",
    applicants: "app.html",
    installment: "insta.html",
    payments: "payment.html"
};

document.getElementById("loginButton").addEventListener("click", () => {
    const adminId = document.getElementById("adminId").value;
    const adminPassword = document.getElementById("adminPassword").value;
    if (adminId === validAdminId && adminPassword === validPassword) {
        document.getElementById("adminPanel").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
        document.getElementById("logoutButton").style.display = "block"; // Show Logout button
    } else {
        document.getElementById("errorMessage").style.display = "block";
    }
});

function logout() {
    document.getElementById("dashboard").style.display = "none";
    document.getElementById("adminPanel").style.display = "flex";
    document.getElementById("logoutButton").style.display = "none"; // Hide Logout button
}

document.querySelectorAll('.sidebar a').forEach(link => {
    link.addEventListener('click', (event) => {
        const key = event.target.getAttribute('data-key');
        const page = pageMap[key];
        if (page) {
            document.getElementById("contentFrame").src = page;
        }
    });
}); 
function toggleSidebar() {
    const dashboard = document.getElementById("dashboard");
    dashboard.classList.toggle("sidebar-hidden");
    dashboard.classList.toggle("sidebar-visible");
}

function hideSidebar() {
    const sidebar = document.querySelector(".sidebar");
    sidebar.classList.add("sidebar-hidden");
}

function filterContent() {
    const query = document.getElementById("searchBar").value.toLowerCase();
    const iframe = document.getElementById("contentFrame");
    const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
    const textNodes = iframeDocument.body.querySelectorAll('*');
    textNodes.forEach(node => {
        if (node.innerText.toLowerCase().includes(query)) {
            node.style.backgroundColor = 'yellow';
        } else {
            node.style.backgroundColor = '';
        }
    });
}