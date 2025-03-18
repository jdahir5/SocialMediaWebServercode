const user = JSON.parse(sessionStorage.getItem('user'));  
const userId = user ? user.user_id : null;  
console.log('User ID:', userId); 

if (user) {
  user_photo_etc.innerHTML += `
        <div id="profile">
            <img src="${user.user_photo}" alt="User Profile Picture">
            <span><b>${user.f_name} ${user.l_name} ${user.user_id}</b></span>  
            <b style="margin-left: 110px">0 Post</b>
            <b style="margin-left: 11px">0 Followers</b>
            <b style="margin-left: 11px">0 Following</b>
            <button onclick="logout()" style="padding: 10px 15px; background-color: #f44336; color: #fff; border: none; border-radius: 4px; cursor: pointer; margin-left: 1000px;">Logout</button>
        </div>
    `;
} else {
    console.log("No user information found in sessionStorage");
}

fetch('/getPosts')
  .then(response => response.json())
  .then(posts => {
    console.log(posts); 
    const leftside = document.getElementById('leftside');
    leftside.innerHTML = '';

    let postFound = false;  

    posts.forEach(post => {
      console.log('User ID:', userId);
      console.log('Post ID:', post.post_id);

      if (post.user_id === userId) { 
        postFound = true; 
        leftside.innerHTML += `
        <div style="border:5px solid #d4cdcd">
                <img src="${post.user_photo}" alt="User Photo" style="width: 50px; height: 50px; border-radius: 50%; border: 1px solid black;margin-top: 10px;margin-left: 50px;">
            <b>${post.f_name} ${post.l_name}</b>
            <hr>
          <div id="post-${post.post_id}">
            <img src="${post.img}" alt="Post Image" style="width: 100%; max-width: 500px; height: auto;margin-left: 100px;">
          </div>
             <hr>
          <b>${post.f_name}: </b>${post.caption}
          <br>
        
          </div>
          <br>
          
        `;
      }
    });

    if (!postFound) {
      leftside.innerHTML = '<p>No posts available</p>';
    }

  })
  .catch(error => {
    console.error('Error fetching posts:', error);
  });

const rightside = document.getElementById('rightside');
fetch('/getsugesstion')
  .then(response => response.json())
  .then(posts => {
    rightside.innerHTML = '';  

    posts.forEach(post => {
      rightside.innerHTML += `  
        <div class="suggestion-item" style="display: flex; align-items: center; margin-bottom: 10px;">
            <div style="flex: 1; text-align: left;">
                <img src="${post.user_photo}" alt="Profile Picture" style="width: 50px; height: 50px; border-radius: 50%; margin-left: 102px;">
                <span><b>${post.f_name} ${post.l_name}</b></span>
            </div>

            <div style="flex: 1; text-align: right;">
                <button class="btn-follow" style="padding: 5px 10px; background-color:rgb(76, 145, 175); color: white; border: none; border-radius: 4px; margin-right:30px">Follow</button>
            </div>
        </div>
        <hr>
      `;
    });
  })
  .catch(error => {
    console.error('Error fetching suggestions:', error);
  });
