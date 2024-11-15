
document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();
    

    const userId = document.getElementById('userid').value;
    const password = document.getElementById('password').value;
    

    if (userId === 'krati' && password === 'password') {
      alert('Login successful!');

      document.getElementById('login-section').style.display = 'none';
      document.getElementById('dashboard-section').style.display = 'block';
    } else {
      alert('Invalid credentials. Please talk to the admin.');
    }
  });


  // =======================================================================FOR DESHBOARD====================================================================

  // Handle search form submit
  document.getElementById('search-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    // Get search value
    const searchValue = document.getElementById('search-box').value.toLowerCase();
    
    // Basic search logic to show the search result
    const searchResultElement = document.getElementById('search-results');
    if (searchValue === 'home') {
      searchResultElement.innerHTML = '<p>You searched for "Home" and this is the result.</p>';
    } else if (searchValue === 'link') {
      searchResultElement.innerHTML = '<p>You searched for "Link" and this is the result.</p>';
    } else {
      searchResultElement.innerHTML = '<p>No results found for "' + searchValue + '".</p>';
    }
  });