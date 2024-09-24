let currentPage = 1;

function showPage(page) {
    document.getElementById(`page${currentPage}`).style.display = 'none';
    document.getElementById(`page${page}`).style.display = 'block';
    currentPage = page;
}

document.getElementById('multiPageForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = new FormData(this);
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
function toggleWhatsAppInput() {
    var whatsappInputContainer = document.getElementById('whatsappInputContainer');
    var whatsappSameNo = document.getElementById('whatsappSameNo');
    whatsappInputContainer.style.display = whatsappSameNo.checked ? 'block' : 'none';
  }
  function togglePermanentAddress(show) {
    var permanentAddressContainer = document.getElementById('permanentAddressContainer');
    permanentAddressContainer.style.display = show ? 'block' : 'none';
  }
  function toggleFatcaForm() {
    var fatcaFormSection = document.getElementById('fatcaFormSection');
    fatcaFormSection.style.display = document.getElementById('foreignNationalYes').checked ? 'block' : 'none';
  }
  function hideFatcaForm() {
    document.getElementById('fatcaFormSection').style.display = 'none';
  }
  function toggleAddendum() {
    var addendumSection = document.getElementById('addendumSection');
    addendumSection.style.display = document.getElementById('pepYes').checked ? 'block' : 'none';
  }
  function hideAddendum() {
    document.getElementById('addendumSection').style.display = 'none';
  }

  function updateTable() {
    // tables 
    document.querySelectorAll('div[id^="plan"]').forEach(function (div) {
      div.classList.add('hidden');
    });

    // selected plan
    const selectedPlan = document.querySelector('input[name="planSelection"]:checked');
    // selected subscription option
    const selectedOption = document.querySelector('input[name="subscriptionOption"]:checked');

    if (selectedPlan && selectedOption) {
      const plan = selectedPlan.value;
      const option = selectedOption.value;

      //  table to show
      const tableId = `${plan}-${option}`;
      const tableToShow = document.getElementById(tableId);

      if (tableToShow) {
        tableToShow.classList.remove('hidden');
      }
    }
  }
