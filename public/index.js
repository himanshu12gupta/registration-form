function handleReferralSelection() {
  const referralSelect = document.getElementById("referral_partner");
  const referralInput = document.getElementById("referral_code");

  if (referralSelect.value === "yes") {
      referralInput.placeholder = "Enter referral code";
      referralInput.value = "";
      referralInput.removeAttribute("readonly");
  } else if (referralSelect.value === "no") {
      referralInput.value = "199001";
      referralInput.setAttribute("readonly", true);
  }
}

// ================================================================for pending payment=======================================================================


  // Show the resume options when the button is clicked
  function showResumeOptions() {
    document.getElementById("resume-options").style.display = "block";
  }

  // Toggle between showing input fields based on radio selection
  function toggleInputField() {
    var selectedOption = document.querySelector('input[name="resumeOption"]:checked');
    
    if (selectedOption) {
      if (selectedOption.value === "application") {
        document.getElementById("applicationNoField").style.display = "block";
        document.getElementById("panNoField").style.display = "none";
      } else if (selectedOption.value === "pan") {
        document.getElementById("panNoField").style.display = "block";
        document.getElementById("applicationNoField").style.display = "none";
      }
      document.getElementById("searchBtn").style.display = "block";
    } else {
      document.getElementById("applicationNoField").style.display = "none";
      document.getElementById("panNoField").style.display = "none";
      document.getElementById("searchBtn").style.display = "none";
    }
  }













  

  





let currentPage = 1;

function showPage(page) {
    document.getElementById(`page${currentPage}`).style.display = 'none';
    document.getElementById(`page${page}`).style.display = 'block';
    currentPage = page;
}

document.getElementById('multiPageForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = new FormData(this);
    const selectedPlan = document.querySelector('input[name="planSelection"]:checked');
    if (selectedPlan) {
      formData.append('planSelection', selectedPlan.value); // Append the selected plan to the form data
    }
    const data = Object.fromEntries(formData.entries());

    fetch('/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(result => {
        if (result.message === 'Form submitted successfully!') {
            document.querySelectorAll('.form-page').forEach(page => {
                page.style.display = 'none';
            });
            window.location.href = '/thank-you';
        } else {
            alert('Something went wrong. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("current-number").value = "20";
    const today = new Date().toLocaleDateString('en-GB');
    document.getElementById("current-date").value = today;

});
document.addEventListener("DOMContentLoaded", function() {
    fetch('/get-application-info')
        .then(response => response.json())
        .then(data => {
            document.getElementById("appl_no").value = data.appl_no;
            document.getElementById("appl_date").value = data.appl_date;
        })
        .catch(error => console.error('Error fetching application info:', error));
}); 

document.getElementById('multiPageForm').addEventListener('submit', function (event) {
  event.preventDefault(); // Prevent form from submitting

  // Save form data to localStorage
  saveData();

  // Redirect to thank-you page
  window.location.href = 'thank-you.html';
});

function saveData() {
  // Gather data from form fields
  const formData = {
      appl_no: document.getElementById('appl_no').value,
      
      form_name: document.getElementById('form_name').value,
  };

  // Save to localStorage
  for (let key in formData) {
      localStorage.setItem(key, formData[key]);
  }
}

// function toggleWhatsAppInput() {
//     var whatsappInputContainer = document.getElementById('whatsappInputContainer');
//     var whatsappSameNo = document.getElementById('whatsappSameNo');
//     whatsappInputContainer.style.display = whatsappSameNo.checked ? 'block' : 'none';
//   }
//   function togglePermanentAddress(show) {
//     var permanentAddressContainer = document.getElementById('permanentAddressContainer');
//     permanentAddressContainer.style.display = show ? 'block' : 'none';
//   }
//   function toggleFatcaForm() {
//     var fatcaFormSection = document.getElementById('fatcaFormSection');
//     fatcaFormSection.style.display = document.getElementById('foreignNationalYes').checked ? 'block' : 'none';
//   }
//   function hideFatcaForm() {
//     document.getElementById('fatcaFormSection').style.display = 'none';
//   }
//   function toggleAddendum() {
//     var addendumSection = document.getElementById('addendumSection');
//     addendumSection.style.display = document.getElementById('pepYes').checked ? 'block' : 'none';
//   }
//   function hideAddendum() {
//     document.getElementById('addendumSection').style.display = 'none';
//   }

//   function updateTable() {
//     // tables 
//     document.querySelectorAll('div[id^="plan"]').forEach(function (div) {
//       div.classList.add('hidden');
//     });

//     // selected plan
//     const selectedPlan = document.querySelector('input[name="planSelection"]:checked');
//     // selected subscription option
//     const selectedOption = document.querySelector('input[name="subscriptionOption"]:checked');

//     if (selectedPlan && selectedOption) {
//       const plan = selectedPlan.value;
//       const option = selectedOption.value;

//       //  table to show
//       const tableId = `${plan}-${option}`;
//       const tableToShow = document.getElementById(tableId);

//       if (tableToShow) {
//         tableToShow.classList.remove('hidden');
//       }
//     }
//   }

function toggleWhatsAppInput() {
  var whatsappYes = document.getElementById('whatsappSameYes');
  var whatsappNo = document.getElementById('whatsappSameNo');
  var whatsappInputContainer = document.getElementById('whatsappInputContainer');

  if (whatsappNo.checked) {
    // Show WhatsApp input field when 'No' is clicked
    whatsappInputContainer.style.display = 'block';
  } else {
    // Hide WhatsApp input field when 'Yes' is clicked
    whatsappInputContainer.style.display = 'none';
  }
}

function togglePermanentAddress(show) {
  var permanentAddressContainer = document.getElementById('permanentAddressContainer');

  if (show) {
    // Show permanent address input field when 'No' is clicked
    permanentAddressContainer.style.display = 'block';
  } else {
    // Hide permanent address input field when 'Yes' is clicked
    permanentAddressContainer.style.display = 'none';
  }
}


// Function to handle table visibility based on plan and subscription
function updateTable() {
  // Get selected plan and subscription
  const selectedPlan = document.querySelector("input[name='planSelection']:checked")?.value;
  const selectedSubscription = document.querySelector("input[name='subscriptionOption']:checked")?.value;

  // Hide all tables
  const allTables = document.querySelectorAll("[id^='plan']");
  allTables.forEach((table) => table.classList.add("hidden"));

  // Show the corresponding table
  if (selectedPlan && selectedSubscription) {
    const tableId = `plan${selectedPlan}-${selectedSubscription}`;
    const table = document.getElementById(tableId);
    if (table) {
      table.classList.remove("hidden");
    }
  }
}









function showPreview() {
  const form = document.getElementById('multiPageForm');
  const previewContent = document.getElementById('previewContent');

  // Clear existing preview content
  previewContent.innerHTML = '';

  // Get all inputs, selects, and textareas
  const inputs = form.querySelectorAll('input, select, textarea');
  
  // Loop through all form elements
  inputs.forEach(element => {
    if (element.name) {
      const label = element.previousElementSibling?.innerText || element.name; // Try to find label
      const value = element.value || 'N/A'; // Get value or default to 'N/A'
      previewContent.innerHTML += `<p><strong>${label}:</strong> ${value}</p>`;
    }
  });

  // Show the preview modal
  document.getElementById('previewModal').style.display = 'block';
}

function closePreview() {
  // Hide the preview modal
  document.getElementById('previewModal').style.display = 'none';
}

function submitForm() {
  // Submit the form programmatically
  document.getElementById('multiPageForm').submit();
}
