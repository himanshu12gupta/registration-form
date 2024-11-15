document.addEventListener("DOMContentLoaded", function() {
    // Populate display elements with data from localStorage
    document.getElementById("display_appl_no").textContent = localStorage.getItem("appl_no");
    document.getElementById("display_form_name").textContent = localStorage.getItem("form_name");
    document.getElementById("display_form_email").textContent = localStorage.getItem("form_email");
    document.getElementById("display_phoneNumber").textContent = localStorage.getItem("phoneNumber");
    document.getElementById("display_payment_mode").textContent = localStorage.getItem("paymentMode");
    document.getElementById("display_plan").textContent = localStorage.getItem("chosenPlan");
    document.getElementById("display_subscription").textContent = localStorage.getItem("subscription");
    document.getElementById("display_amount").textContent = localStorage.getItem("amount");
    document.getElementById("qr_amount").textContent = localStorage.getItem("amount");
});

function togglePayButton() {
    const checkbox = document.getElementById("agreeCheckbox");
    const payButton = document.getElementById("payButton");
    payButton.disabled = !checkbox.checked;
}

// Show Step 2 and hide Step 1
function showStep2(event) {
    event.preventDefault();
    document.querySelector(".step1").style.display = "none";
    document.querySelector(".step2").style.display = "block";
    generateQR();
    startQRValidityTimer();
}

// Generate QR code for payment
function generateQR() {
    const amount = localStorage.getItem("amount");
    const qrCodeImg = document.getElementById("qrCode");
    const qrData = `upi://pay?pa=7505231505@ybl&pn=Krati&am=${amount}&cu=INR`;
    qrCodeImg.src = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrData)}&size=150x150`;
}

// Timer for QR code validity (10 minutes)
let qrTimeout;
function startQRValidityTimer() {
    clearTimeout(qrTimeout); // Clear any existing timer
    qrTimeout = setTimeout(() => {
        alert("The QR code has expired. Please generate a new QR code.");
        document.getElementById("qrCode").src = ""; // Clear QR code image
    }, 10 * 60 * 1000); // 10 minutes in milliseconds
}

// Generate a new QR code on button click
function generateNewQR(event) {
    event.preventDefault();
    generateQR();
    startQRValidityTimer();
}

// Show Step 3 (payment success message)
function showStep3() {
    document.querySelector(".step2").style.display = "none";
    document.querySelector(".step3").style.display = "block";
}

// Simulate payment success after QR scan
document.getElementById("qrCode").addEventListener("load", () => {
    // Simulate checking for successful payment
    setTimeout(showStep3, 5000); // Adjust timing as needed for real success check
});
