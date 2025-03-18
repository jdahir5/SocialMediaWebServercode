const container = document.getElementById('container');
const user = JSON.parse(sessionStorage.getItem('user'));

fetch('/follow')
  .then(response => response.json())
  .then(users => {
    container.innerHTML = ''; 

    
      container.innerHTML += `
        <div class="home-icon">
          <div id="Profile_pic"></div>
          <h4 id="home-icon"><b>User_id:</b> ${user.user_id}</h4>
          <h4 id="home-icon"><b>f_name:</b> ${user.f_name}</h4>
          <h4 id="home-icon"><b>l_name:</b> ${user.l_name}</h4>
        </div>
      `;
    });

