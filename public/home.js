const user = JSON.parse(localStorage.getItem('user'));
const user_id = user ? user.user_id : null;
const user_photo = user && user.user_photo ? user.user_photo : '/insta photo/D.jpg';

const userId = user ? user.user_id : null;
const offcanvasRightLabel = document.getElementById('offcanvasRightLabel');



const loggedInUserId = userId;

              if (user) {
              document.title = `${user.f_name}`;
              }

              const profile_pic = document.getElementById('profile_pic');
              profile_pic.innerHTML = `

              <img 
              src="${user_photo}" 
              alt="User Photo" 
              style="width: 50px; height: 50px; border-radius: 50%; border: 1px solid black;" 
              onclick="Show_user_info()"
              onerror="this.src='/insta photo/2.2.jpg'"
              >

              `;

              function Show_user_info() {
              const canvas = document.getElementById('userCanvas');
              const canvasContent = document.getElementById('userCanvasContent');
              canvas.style.right = '0';

              fetch('/getPosts')
              .then(response => response.json())
              .then(posts => {
              if (posts.length > 0) {
              let postCount = 0;

              posts.forEach(post => {
              if (post.user_id === userId) {
              postCount++;
              }
              });

              canvasContent.innerHTML = `
                                      <div id="left-section">
                                        <img class="user-photo" src="${user_photo}" alt="User Photo" >
                                      </div>

                                  <div id="center-section">
                              <b>${user.f_name} ${user.l_name}</b>
                              
                              <button id="edit-profile" onclick="editProfile(user_id)">Edit Profile</button>
                              <div id="popup-edit-profile"></div>
                              <div id="editProfilePopup" style="display:none;height: 900px;padding-top:50px">
                                <div id="editProfileContent">
                                  <span id="closeEditProfile" onclick="closePopup('editProfile')">&times;</span>
                                  <h2>Edit Profile</h2>
                                  <form onsubmit="event.preventDefault(); updateUserData(user_id)">
                                    
                                    <div>
                                    
                                      <img id="currentProfilePhoto" src="${user.user_photo || '/insta photo/D.jpg'}" alt="Profile Photo" style="width: 150px; height: 150px;border-radius: 50%; object-fit: cover; ">
                                    
                                      </div>
                                      
                                <label>
                              <input type="radio" name="privacy" value="1" ${user.id_type === '1' ? 'checked' : ''}> Set Account to Private
                              </label>
                              <label>
                              <input type="radio" name="privacy" value="0" ${user.id_type === '0' ? 'checked' : ''}> Public Account
                              </label>


                        <br>
                                    
                                    <!-- Update Profile Photo -->
                                                              
                                    <div>
                                      <label for="new_user_photo">Update Profile Photo:</label>
                                      <input type="file" id="new_user_photo" name="new_user_photo" accept="image/*">
                                    </div>
                                    <br><br>

                                    <label for="f_name">F_Name:</label>
                                    <input type="text" id="f_name" name="f_name" value="${user.f_name}" required>
                                    <br><br>
                                    
                                    <label for="l_name">L_Name:</label>
                                    <input type="text" id="l_name" name="l_name" value="${user.l_name}" required>
                                    <br><br>
                                    
                                    <label for="Bio">Bio:</label>
                                    <input type="text" id="Bio" name="Bio" value="${user.Bio}" required>
                                    <br><br>
                                    
                                    <button type="submit">Save</button>
                                  </form>
                                </div>
                              </div>
                            </div>


                                        <p><b>${postCount}</b> Posts</p>

                                        <div id="following-section"></div>
                                        <div id="followers-section"></div>
                                        <hr>
                                        <p>${user.Bio}</p>
                                      </div>

                                      <div id="right-section">
                                        <button id="logout" class="logout-btn" onclick="logout()">Logout</button>
                                      </div>
                                    `;

              const followingSection = document.getElementById('following-section');
              const followersSection = document.getElementById('followers-section');

              fetch(`/getFollowingWithDetails?userId=${userId}`)
              .then(response => response.json())
              .then(followingData => {
              console.log(followingData);
              followingSection.innerHTML = `
                                                <div class="d-flex justify-content-between align-items-center">
                                                  <p onclick="openPopup('following')"><b>${followingData.followingCount}</b> Following</p>
                                                </div>

                                              <div id="popupModal" class="popup-modal"style="display: none;">
                                    <div class="popup-content">
                                      
                                      <h2 id="popup-title">Popup Title</h2>
                                      <div id="follower_list" class="user-list">
                                        <!-- User items will be dynamically injected here -->
                                      </div>
                                    </div>
                                  </div>


                                              `;
              })
              .catch(error => {
              console.error('Error fetching following details:', error);
              });

              fetch(`/getFollowersWithDetails?userId=${userId}`)
              .then(response => response.json())
              .then(followersData => {
              console.log(followersData);

              followersSection.innerHTML = `
                                                <div class="d-flex justify-content-between align-items-center">
                                                  <p onclick="openPopup('followers')"><b>${followersData.followersCount}</b> Followers</p>
                                                </div>
                                              `;
              })
              .catch(error => {
              console.error('Error fetching followers details:', error);
              });

              } else {
              canvasContent.innerHTML = '<p>No user data available</p>';
              }
              })
              .catch(error => {
              console.error('Error fetching posts:', error);
              });
              }

              function openPopup(type) {
              console.log("44")
              const popupModal = document.getElementById('popupModal');
              const userList = document.getElementById('follower_list');
              const popupTitle = document.getElementById('popup-title');

              popupModal.style.display = 'flex';

              userList.innerHTML = '';

              if (type === 'following') {
              popupTitle.innerHTML = 'Following';

              fetch(`/getFollowingWithDetails?userId=${userId}`)
              .then(response => response.json())
              .then(followingData => {
              let userContent = '';

              followingData.followingDetails.forEach(user => {
              fetch(`/checkFollowStatus?follower_by_id=${loggedInUserId}&followed_to_id=${user.user_id}`)
              .then(response => response.json())
              .then(data => {
                const followStatus = data.isFollowing ? 'Unfollow' : 'Follow';

                userContent += `
                                        <div class="user-item">
                                          <img src="${user.user_photo || '/insta photo/D.jpg'}" 
                                              alt="User Photo" 
                                              onerror="this.src='/insta photo/D.jpg'" class="user-photo">
                                          <p>${user.f_name} ${user.l_name}</p>
                                  
                                        <button type="button" class="btn btn-primary" id="follow-btn-${user.user_id}" onclick="toggleFollow(${user.user_id})" 
                                          style="padding: 5px 10px; font-size: 12px; height: 30px; width: auto;">
                                          <span id="follow-text-${user.user_id}">${followStatus}</span>
                                          <span id="spinner-${user.user_id}" style="display: none;">Loading...</span>
                                        </button>

                                        </div>
                                        <hr>
                                      `;

                userList.innerHTML = userContent;
              })
              .catch(error => {
                console.error('Error fetching follow status for user:', error);
              });
              });
              })
              .catch(error => {
              console.error('Error fetching following details for popup:', error);
              });
              }

              else if (type === 'followers') {
              popupTitle.innerHTML = 'Followers';
              fetch(`/getFollowersWithDetails?userId=${userId}`)
              .then(response => response.json())
              .then(followersData => {
              followersData.followersDetails.forEach(user => {
              userList.innerHTML += `
                                  <div class="user-item">
                                    <img src="${user.user_photo || '/insta photo/D.jpg'}" 
                                        alt="User Photo" 
                                        onerror="this.src='/insta photo/D.jpg'"class="user-photo">
                                    <p>${user.f_name} ${user.l_name}</p>
                                  </div>
                                `;
              });
              })
              .catch(error => {
              console.error('Error fetching followers details for popup:', error);
              });
              }
              }

              function closePopup(type) {
              if (type === 'followers' || type === 'following') {
              document.getElementById('popupModal').style.display = 'none';
              } else if (type === 'editProfile') {
              document.getElementById('editProfilePopup').style.display = 'none';
              }
              }




              fetch('/getPosts')
              .then(response => response.json())
              .then(posts => {

              if (posts.length > 0) {
              let postHTML = '';

              posts.forEach(post => {
              if (user_id === post.user_id) {
              postHTML += `
              <div class="post-item">
              <div class="post-image">
              <img src="${post.img}" alt="${post.caption}" class="post-img" >


              </div>

              <!-- Post Overlay and Counts -->
              <div class="post-overlay">
              <div class="post-counts" onclick="loadLikesData(${post.post_id})">
                  <span class="like-count">Likes: <span id="like-count-${post.id}" style="color: whitesmoke;">${post.likes_count}</span></span>
                  <span class="comment-count">Comments: <span id="comment-count-${post.id}" style="color: whitesmoke;">${post.comment_count}</span></span>

              </div>
              </div>

              <!-- Modal for Likes - Move this outside the post layout -->
              <div class="modal fade" id="likeModal" tabindex="-1" aria-labelledby="likeModalLabel" aria-hidden="true">
              <div class="modal-dialog modal-dialog-centered modal-lg">
                  <div class="modal-content">
                      <div class="modal-header">
                          <h5 class="modal-title" id="likeModalLabel">Users Who Liked This Post</h5>
                          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                      </div>
                      <div class="modal-body" id="likesModalBody" style="max-height: 400px; overflow-y: auto;">
                          <!-- Dynamic like data will be inserted here -->
                      </div>
                      <div class="modal-footer">
                          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                      </div>
                  </div>
              </div>
              </div>

                  <span class="comment-count">Comments: <span id="comment-count-${post.id} "style="color: whitesmoke;">${post.comment_count}</span></span>
                </div>
              </div>
              </div>
              </div>  

                    `;
              }
              });

              if (postHTML) {
              document.getElementById('UserPosts').innerHTML = postHTML;
              } else {
              document.getElementById('UserPosts').innerHTML = '<p>No posts found for this user.</p>';
              }

              } else {
              document.getElementById('UserPosts').innerHTML = '<p>No posts available</p>';
              }
              })
              .catch(error => {
              console.error('Error fetching posts:', error);
              });

              const loggin_user_story = document.getElementById('loggin_user_story');
              loggin_user_story.innerHTML = `
                
                  <img 
                    src="${user_photo}" 
                    alt="User Photo" 
                    style="width:50px; height: 50px; border-radius: 50%; border: 1px solid black;" 
                    onerror="this.src='/insta photo/2.2.jpg'"
                  >
                  <br>
                  
              <p style="margin-left: 1vh;">Your Story</p>

              `;


              const center = document.getElementById('center');

              fetch('/getsugesstion')
              .then(response => response.json())
              .then(posts => {
                center.innerHTML = ''; 

                posts.forEach(post => {
                  if (loggedInUserId === post.user_id) return; 

                  fetch(`/checkFollowStatus?follower_by_id=${loggedInUserId}&followed_to_id=${post.user_id}`)
                    .then(response => response.json())
                    .then(data => {
                      if (data.isFollowing) {
                        fetch(`/getuserstory?user_id=${post.user_id}`)
                          .then(response => response.json())
                          .then(stories => {
                            if (stories.length > 0) { 
                              const storyDiv = document.createElement("div");
                              storyDiv.classList.add("story");

                              const imgDiv = document.createElement("div");
                              const img = document.createElement("img");
                              img.src = post.user_photo || "/insta photo/D.jpg";
                              img.alt = "User Photo";
                              img.classList.add("profile-pic");
                              img.onerror = function () { this.src = "/insta photo/D.jpg"; };
                              img.addEventListener("click", () => showuserstory(post.user_id,post.f_name,post.l_name)); 

                              imgDiv.appendChild(img);

                              const usernameDiv = document.createElement("div");
                              usernameDiv.classList.add("username");
                              const usernameLink = document.createElement("a");
                              usernameLink.href = "#";
                              usernameLink.style.textDecoration = "none";
                              usernameLink.style.color = "black";
                              usernameLink.textContent = post.f_name;

                              usernameLink.addEventListener("click", (e) => {
                                e.preventDefault();
                                showuserstory(post.user_id);
                              });

                              usernameDiv.appendChild(usernameLink);
                              storyDiv.appendChild(imgDiv);
                              storyDiv.appendChild(usernameDiv);
                              center.appendChild(storyDiv);
                            }
                          })
                          .catch(error => {
                            console.error('Error fetching user story:', error);
                          });
                      }
                    })
                    .catch(error => {
                      console.error('Error checking follow status:', error);
                    });
                });
              });
  
                           
                            function showuserstory(userId, f_name, l_name) {
                              fetch(`/getuserstory?user_id=${userId}`)
                                  .then(response => response.json())
                                  .then(data => {
                                    
                                      if (data.length > 0) {
                                          const modal = document.getElementById("storyModal");
                                          const storyImage = document.getElementById("storyImage");
                                          const storyUsername = document.getElementById("storyUsername");
                                          const progressContainer = document.getElementById("storyProgressContainer");
                          
                                          if (!modal || !storyImage || !storyUsername || !progressContainer) {
                                              console.error("Error: Modal or elements not found.");
                                              return;
                                          }
                          
                                          let currentStoryIndex = 0;
                                          const fullName = `${f_name} ${l_name}`;
                                          let storyTimeout;
                          
                                          progressContainer.innerHTML = '';
                          
                                          data.forEach(() => {
                                              const progressBarWrapper = document.createElement("div");
                                              progressBarWrapper.classList.add("story-progress-bar-wrapper");
                          
                                              const progressBar = document.createElement("div");
                                              progressBar.classList.add("story-progress-bar");
                                              progressBar.style.width = "0%";
                          
                                              progressBarWrapper.appendChild(progressBar);
                                              progressContainer.appendChild(progressBarWrapper);
                                          });
                          
                                          const progressBars = document.querySelectorAll(".story-progress-bar");
                          
                                          function updateStory() {
                                              storyImage.src = data[currentStoryIndex].story_img;
                                              storyUsername.textContent = fullName;
                          
                                              progressBars.forEach((bar, i) => {
                                                  bar.style.transition = "none";
                                                  bar.style.width = i < currentStoryIndex ? "100%" : "0%";
                                              });
                          
                                              const currentProgressBar = progressBars[currentStoryIndex];
                                              currentProgressBar.style.transition = "none";
                                              currentProgressBar.style.width = "0%";
                          
                                              setTimeout(() => {
                                                  currentProgressBar.style.transition = "width 5s linear";
                                                  currentProgressBar.style.width = "100%";
                                              }, 50);
                          
                                              storyTimeout = setTimeout(() => {
                                                  if (currentStoryIndex < data.length - 1) {
                                                      currentStoryIndex++;
                                                      updateStory();
                                                  } else {
                                                      closeStory();
                                                  }
                                              }, 5000);
                                          }
                          
                                          modal.style.display = "flex";
                                          updateStory();
                          
                                          // Click to go to next story
                                          storyImage.onclick = function () {
                                              clearTimeout(storyTimeout);
                                              if (currentStoryIndex < data.length - 1) {
                                                  currentStoryIndex++;
                                                  updateStory();
                                              } else {
                                                  closeStory();
                                              }
                                          };
                                      }
                                  })
                                  .catch(error => {
                                      console.error("Error fetching user story:", error);
                                  });
                          }
                          
                          function closeStory() {
                              document.getElementById("storyModal").style.display = "none";
                          }
                          
                          
                      
                          
                          
                   
              


              const postContainer = document.getElementById('posts');
              const UserId = user.user_id;
              fetch('/getPosts')
              .then(response => response.json())
              .then(posts => {
              posts.forEach(post => {
              fetch(`/checkFollowStatus?follower_by_id=${loggedInUserId}&followed_to_id=${post.user_id}`)
              .then(response => response.json())
              .then(data => {
              if (data.isFollowing) {

              fetch(`/check-like?post_id=${post.post_id}&user_id=${loggedInUserId}`)
              .then(response => response.json())
              .then(likeData => {
                const likedStatus = likeData.liked ? 'Liked' : 'Not Liked';
                
                const likeIconColor = likeData.liked ? '#e2264d' : '#262626'; 

                const likedUsers = post.likedUsers && post.likedUsers.length > 0
                  ? post.likedUsers.map(user => `${user.f_name} ${user.l_name}`).join(', ')
                  : 'No likes yet';

                const postHTML = `
                  <div class="post margin-t-3r">
                    <div class="header_post">
                      <div class="avatar">
                        <div>
                          <img 
                            src="${post.user_photo || '/insta photo/D.jpg'}" 
                            alt="User Photo" 
                            style="width: 50px; height: 50px; border-radius: 50%; border: 1px solid black;" 
                            onclick="showsugesstionuser(${post.user_id})" 
                            onerror="this.src='/insta photo/D.jpg'">
                          <a href="#" class="margin-l-5x" onclick="showsugesstionuser(${post.user_id})" style="text-decoration: none;color: black;">${post.f_name} ${post.l_name}</a>
                        </div>
                      </div>
                        <div id="popup-${post.user_id}" class="popup" style="display: none;">
                                    <div class="popup-content">
                                      <span class="close" onclick="closePopup(${post.user_id})">&times;</span>
                                      <div id="showsugesstionuser-${post.user_id}">
                                        <!-- User details will be dynamically loaded here -->
                                      </div>
                                    </div>
                                  </div>
                      <div class="menue">
                        <svg aria-label="More options" class="cursor-pointer" fill="#262626" height="16" role="img" viewBox="0 0 48 48" width="18">
                          <circle clip-rule="evenodd" cx="8" cy="24" fill-rule="evenodd" r="4.5"></circle>
                          <circle clip-rule="evenodd" cx="24" cy="24" fill-rule="evenodd" r="4.5"></circle>
                          <circle clip-rule="evenodd" cx="40" cy="24" fill-rule="evenodd" r="4.5"></circle>
                        </svg>
                      </div>
                    </div>
                    <br>
                    <div>
              <img src="${post.img}" alt="Post Image" style="width: 100%; max-width: 550px; height: 450px;" ondblclick="toggleLike(${post.post_id}, ${post.post_id})">
                    </div>
                    <br>
                    <div class="margin-5x" style="display: flex;justify-content: space-between;">
                      <div style="display: flex;">
              <a class="margin-5x" onclick="toggleLike(${post.post_id}, ${post.post_id})">
              <div id="like-icon-${post.post_id}" class="cursor-pointer" data-liked="${likeData.liked}">
              <svg aria-label="Like" height="24" role="img" viewBox="0 0 48 48" width="24">
              <path fill="${likeIconColor}" d="M34.6 6.1c5.7 0 10.4 5.2 10.4 11.5 0 6.8-5.9 11-11.5 16S25 41.3 24 41.9c-1.1-.7-4.7-4-9.5-8.3-5.7-5-11.5-9.2-11.5-16C3 11.3 7.7 6.1 13.4 6.1c4.2 0 6.5 2 8.1 4.3 1.9 2.6 2.2 3.9 2.5 3.9.3 0 .6-1.3 2.5-3.9 1.6-2.3 3.9-4.3 8.1-4.3m0-3c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5.6 0 1.1-.2 1.6-.5 1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z"></path>
              </svg>

              </div>
              </a>
              <b onclick="loadLikesData(${post.post_id})"> ${post.likes_count}</b>

              </div>
              <div>
              <a class="margin-5x" onclick="Show_cmt_filed(${post.post_id})">

              <svg aria-label="Comment" class="cursor-pointer" fill="#262626" height="24" role="img" viewBox="0 0 48 48" width="24">
              <path clip-rule="evenodd" d="M47.5 46.1l-2.8-11c1.8-3.3 2.8-7.1 2.8-11.1C47.5 11 37 .5 24 .5S.5 11 .5 24 11 47.5 24 47.5c4 0 7.8-1 11.1-2.8l11 2.8c.8.2 1.6-.6 1.4-1.4zm-3-22.1c0 4-1 7-2.6 10-.2.4-.3.9-.2 1.4l2.1 8.4-8.3-2.1c-.5-.1-1-.1-1.4.2-1.8 1-5.2 2.6-10 2.6-11.4 0-20.6-9.2-20.6-20.5S12.7 3.5 24 3.5 44.5 12.7 44.5 24z" fill-rule="evenodd"></path>
              <b> ${post.comment_count}</b>

              </svg>
              </div>


              </a>
              <!-- Modal -->
              <div class="modal fade" id="show-comment" tabindex="-1" aria-labelledby="showCommentLabel" aria-hidden="true">
              <div class="modal-dialog modal-dialog-centered modal-sm modal-md modal-lg w-75 w-sm-100 w-md-75 w-lg-50">
              <div class="modal-content">
              <div class="modal-header">
              <h5 class="modal-title" id="showCommentLabel">Comment Section</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body" id="modalBody" style="max-height: 400px; overflow-y: auto;">
              <!-- Dynamic comment data will be inserted here -->
              </div>
              <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              </div>
              </div>
              </div>
              </div>
              <a  class="margin-5x">
              <svg aria-label="Share Post" class="cursor-pointer" fill="#262626" height="24" role="img" viewBox="0 0 48 48" width="24">
              <path d="M47.8 3.8c-.3-.5-.8-.8-1.3-.8h-45C.9 3.1.3 3.5.1 4S0 5.2.4 5.7l15.9 15.6 5.5 22.6c.1.6.6 1 1.2 1.1h.2c.5 0 1-.3 1.3-.7l23.2-39c.4-.4.4-1 .1-1.5zM5.2 6.1h35.5L18 18.7 5.2 6.1zm18.7 33.6l-4.4-18.4L42.4 8.6 23.9 39.7z"></path>
              </svg>
              </a>



              </div>
              </div>
                      <!-- Comment and Like Count Section -->
                      <div style="display: flex; flex-wrap: wrap;" class="margin-5x">
                        
                        <!-- Modal for Likes -->
                        <div class="modal fade" id="likeModal" tabindex="-1" aria-labelledby="likeModalLabel" aria-hidden="true">
                          <div class="modal-dialog modal-dialog-centered modal-lg">
                            <div class="modal-content">
                              <div class="modal-header">
                                <h5 class="modal-title" id="likeModalLabel">Users Who Liked This Post</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                              </div>
                              <div class="modal-body" id="likesModalBody" style="max-height: 400px; overflow-y: auto;">
                                <!-- Dynamic like data will be inserted here -->
                              </div>
                              <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                              </div>
                            </div>
                          </div>
                        </div>
                        </div>
                        
                      </div>
                      <div class="margin-5x">
                        <p><b>${post.f_name} : ${post.caption}</b></p>
                      </div>
                      <div class="comment-box">
                        <input type="text" id="comment-${post.post_id}" placeholder="Add a comment" name="comment" class="form-control">
                        <button type="button" class="btn btn-primary" onclick="postComment(${post.post_id})">Post</button>
                      </div>
                    </div>
                  </div>
                `;

                postContainer.innerHTML += postHTML;
              });
              }
              });
              })
              .catch(error => console.error('Error:', error));



              function Show_cmt_filed(postId) {
              const modal = new bootstrap.Modal(document.getElementById('show-comment'));
              modal.show();

              const modalBody = document.getElementById('modalBody');
              modalBody.innerHTML = `<p>Loading comments for post ID: ${postId}...</p>`;

              fetch(`/getComments?post_id=${postId}`)
              .then(response => response.json())
              .then(data => {
              if (data.error) {
              console.error('Error:', data.error);
              return;
              }

              modalBody.innerHTML = '';

              if (data.length === 0) {
              modalBody.innerHTML = '<p>No comments yet.</p>';
              return;
              }

              data.forEach(comment => {
              const commentElement = document.createElement('div');
              commentElement.classList.add('comment');

              commentElement.innerHTML = `
                                  <div class="comment-user" style="display: flex; align-items: center; margin-bottom: 15px;">
                                      <img 
                                          src="${comment.user_photo || '/insta photo/D.jpg'}" 
                                          alt="User Photo" 
                                          style="width: 40px; height: 40px; border-radius: 50%; margin-right: 10px;" 
                                          onerror="this.src='/insta photo/D.jpg'"
                                                                            onclick="showsugesstionuser(${post.user_id})"

                                          
                                      />
                                      <b>${comment.f_name} ${comment.l_name}</b>: ${comment.comment_text}
                                  </div>
                                  <hr>
                              `;

              modalBody.appendChild(commentElement);
              });
              })
              .catch(error => {
              console.error('Error fetching comments:', error);
              modalBody.innerHTML = '<p>Error fetching comments. Please try again later.</p>';
              });
              }
              function postComment(post_id) {
              const commentInput = document.getElementById(`comment-${post_id}`);
              const commentText = commentInput.value.trim();

              if (commentText) {
              const user_id = user ? user.user_id : null;
              const f_name = user ? user.f_name : '';
              const l_name = user ? user.l_name : '';


              fetch('/postComment', {
              method: 'POST',
              headers: {
              'Content-Type': 'application/json',
              },
              body: JSON.stringify({ post_id, user_id, f_name, l_name, commentText })
              })
              .then(response => response.json())
              .then(data => {
              if (data.success) {
                commentInput.value = '';

              } else {
                alert('Error posting comment');
              }
              })
              .catch(error => {
              console.error('Error posting comment:', error);
              });
              } else {
              alert('Please enter a comment');
              }
              }
              function loadLikesData(postId) {
              console.log("Loading likes for post ID:", postId);

              fetch(`/getLikes?post_id=${postId}`)
                   .then(response => response.json())
                    .then(data => {
                    console.log('Data received:', data);

              if (data.error) {
              console.error('Error:', data.error);
              return;
              }

              const likesContainer = document.getElementById('likesModalBody');
              likesContainer.innerHTML = '';

              if (!Array.isArray(data) || data.length === 0) {
              likesContainer.innerHTML = '<p>No users have liked this post yet.</p>';
              return;
              }

              data.forEach(like => {
              const likeElement = document.createElement('div');
              likeElement.classList.add('like');
              likeElement.innerHTML = `
                                
                                    <div class="like-user">
                                        <img 
                                            src="${like.user_photo || '/insta photo/D.jpg'}" 
                                            alt="User Photo" 
                                            style="width: 40px; height: 40px; border-radius: 50%;" 
                                            onerror="this.src='/insta photo/D.jpg'" 
                                        />
                                        <b>${like.f_name} ${like.l_name}</b>
                                        <hr>
                                    </div>
                                    
                                `;
              likesContainer.appendChild(likeElement);
              });

              const likeModal = new bootstrap.Modal(document.getElementById('likeModal'));
              likeModal.show();
              })
              .catch(error => {
              console.error('Error fetching likes:', error);
              });
              }

              postContainer.innerHTML += postHTML;
              }
              )
              .catch(error => console.error('Error checking follow status:', error));




              function closePopup(userId) {
              console.log("Closing popup for user ID:", userId);
              const popup = document.getElementById(`popup-${userId}`);
              if (popup) {
              popup.style.display = 'none';
              } else {
              console.log(`Popup with ID popup-${userId} not found`);
              }
              }

              function Show_cmt_filed(postId) {
              const modal = new bootstrap.Modal(document.getElementById('show-comment'));
              modal.show();

              const modalBody = document.getElementById('modalBody');
              modalBody.innerHTML = `<p>Loading comments for post ID: ${postId}...</p>`;

              fetch(`/getComments?post_id=${postId}`)
              .then(response => response.json())
              .then(data => {
              if (data.error) {
              console.error('Error:', data.error);
              modalBody.innerHTML = '<p>Error fetching comments. Please try again later.</p>';
              return;
              }

              modalBody.innerHTML = '';

              if (data.length === 0) {
              modalBody.innerHTML = '<p>No comments yet.</p>';
              return;
              }

              data.forEach(comment => {
              const commentElement = document.createElement('div');
              commentElement.classList.add('comment');

              commentElement.innerHTML = `
                                    <div class="comment-user" style="display: flex; align-items: center; margin-bottom: 15px;">
                                        <img 
                                            src="${comment.user_photo || '/insta photo/D.jpg'}" 
                                            alt="User Photo" 
                                            style="width: 40px; height: 40px; border-radius: 50%; margin-right: 10px;" 
                                            onerror="this.src='/insta photo/D.jpg'"

                                        />
                                        <b>${comment.f_name} ${comment.l_name}</b>: ${comment.comment_text}
                                    </div>
                                    <hr>
                                `;

              modalBody.appendChild(commentElement);
              });
              })
              .catch(error => {
              console.error('Error fetching comments:', error);
              modalBody.innerHTML = '<p>Error fetching comments. Please try again later.</p>';
              });
              }
              function postComment(post_id) {
              const commentInput = document.getElementById(`comment-${post_id}`);
              const commentText = commentInput.value.trim();

              if (commentText) {
              const user_id = user ? user.user_id : null;
              const f_name = user ? user.f_name : '';
              const l_name = user ? user.l_name : '';


              fetch('/postComment', {
              method: 'POST',
              headers: {
              'Content-Type': 'application/json',
              },
              body: JSON.stringify({ post_id, user_id, f_name, l_name, commentText })
              })
              .then(response => response.json())
              .then(data => {
              if (data.success) {
              commentInput.value = '';

              } else {
              alert('Error posting comment');
              }
              })
              .catch(error => {
              console.error('Error posting comment:', error);
              });
              } else {
              alert('Please enter a comment');
              }
              }
              function loadLikesData(postId) {
              console.log("Loading likes for post ID:", postId);

              fetch(`/getLikes?post_id=${postId}`)
              .then(response => response.json())
              .then(data => {
              console.log('Data received:', data);

              if (data.error) {
              console.error('Error:', data.error);
              return;
              }

              const likesContainer = document.getElementById('likesModalBody');
              likesContainer.innerHTML = '';

              if (!Array.isArray(data) || data.length === 0) {
              likesContainer.innerHTML = '<p>No users have liked this post yet.</p>';
              return;
              }

              data.forEach(like => {
              const likeElement = document.createElement('div');
              likeElement.classList.add('like');
              likeElement.innerHTML = `
                                  
                                      <div class="like-user">
                                          <img 
                                              src="${like.user_photo || '/insta photo/D.jpg'}" 
                                              alt="User Photo" 
                                              style="width: 40px; height: 40px; border-radius: 50%;" 
                                              onerror="this.src='/insta photo/D.jpg'" 
                                          />
                                          <b>${like.f_name} ${like.l_name}</b>
                                          <hr>
                                      </div>
                                      
                                  `;
              likesContainer.appendChild(likeElement);
              });

              const likeModal = new bootstrap.Modal(document.getElementById('likeModal'));
              likeModal.show();
              })
              .catch(error => {
              console.error('Error fetching likes:', error);
              });
              }
              function editProfile(user_id) {
              console.log(user_id);
              document.getElementById('editProfilePopup').style.display = 'flex';
              document.getElementById('f_name').value = user.f_name;
              document.getElementById('l_name').value = user.l_name;
              document.getElementById('Bio').value = user.Bio;
              }

              function closePopup() {
              document.getElementById('editProfilePopup').style.display = 'none';
              }
              function updateUserData(user_id) {
              const f_name = document.getElementById('f_name').value;
              const l_name = document.getElementById('l_name').value;
              const Bio = document.getElementById('Bio').value;
              const id_type = document.querySelector('input[name="privacy"]:checked').value;  

              console.log("Selected id_type:", id_type); 
              console.log("Selected id_type:", id_type);    

              fetch('/updateUser', {
              method: 'POST',
              headers: {
              'Content-Type': 'application/json',
              },
              body: JSON.stringify({ user_id, f_name, l_name, Bio, id_type })
              })
              .then(response => response.json())
              .then(data => {
              console.log("Server Response:", data); 
              if (data.success) {
              alert(`Profile updated successfully! id_type: ${id_type}`);
              loadUserData(user_id); 
              } else {
              alert('Error updating profile');
              }
              })

              .catch(error => console.error('Error:', error));
              }

              function toggleLike(index, post_id) {
              console.log(post_id);
              const likeIcon = document.getElementById(`like-icon-${index}`);
              const isLiked = likeIcon.getAttribute("data-liked") === "true";

              fetch('/like', {
              method: 'POST',
              headers: {
              'Content-Type': 'application/json',
              },
              body: JSON.stringify({ post_id, user_id })
              })


              .then(response => response.json())
              .then(data => {
              if (isLiked) {
              console.log("unlike");
              likeIcon.innerHTML = `
              <svg aria-label="Like" fill="#262626" height="24" role="img" viewBox="0 0 48 48" width="24">
              <path d="M34.6 6.1c5.7 0 10.4 5.2 10.4 11.5 0 6.8-5.9 11-11.5 16S25 41.3 24 41.9c-1.1-.7-4.7-4-9.5-8.3-5.7-5-11.5-9.2-11.5-16C3 11.3 7.7 6.1 13.4 6.1c4.2 0 6.5 2 8.1 4.3 1.9 2.6 2.2 3.9 2.5 3.9.3 0 .6-1.3 2.5-3.9 1.6-2.3 3.9-4.3 8.1-4.3m0-3c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5.6 0 1.1-.2 1.6-.5 1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z"></path>
              </svg>
              `;
              likeIcon.setAttribute("data-liked", "false");
              } else {
              console.log("like");
              likeIcon.innerHTML = `
              <i class="fa-solid fa-heart" style="color: #fb0404; height: 24px; width: 24px;"></i>
              `;
              likeIcon.setAttribute("data-liked", "true");
              }
              }

              )}
              function openUploadPostPopup() {
              document.getElementById('uploadPostPopup').style.display = 'flex';
              }
              function closeUploadPostPopup() {
              document.getElementById('uploadPostPopup').style.display = 'none';
              }
              function previewImage(event) {
              const file = event.target.files[0];
              const reader = new FileReader();

              reader.onload = function () {
              const imagePreview = document.getElementById('imagePreview');
              imagePreview.src = reader.result;
              imagePreview.style.display = 'block';
              };

              if (file) {
              reader.readAsDataURL(file);
              }
              }
              document.getElementById('postForm').addEventListener('submit', function (e) {
              e.preventDefault();

              const formData = new FormData();
              const caption = document.getElementById('caption').value;
              const postImage = document.getElementById('imageInput').files[0];

              formData.append('caption', caption);
              formData.append('post-image', postImage);

              fetch('/uploadPost', {
              method: 'POST',
              body: formData
              })
              .then(response => response.json())
              .then(data => {
              if (data.success) {
              alert('Post uploaded successfully!');
              closeUploadPostPopup();
              } else {
              alert('Failed to upload post: ' + data.message);
              }
              })
              .catch(error => {
              console.error('Error:', error);
              });
              });


              const sugessionProfile = document.getElementById('sugessionProfile')

              sugessionProfile.innerHTML = `

                      <div style="margin-top:50px">
                                    <img 
                                          src="${user_photo}" 
                                          alt="User Photo" 
                                          style="width: 50px; height: 50px; border-radius: 50%; border: 1px solid black;" 
                                          onclick="Show_user_info()"
                                          onerror="this.src='/insta photo/2.2.jpg'"
                                        
                                        >
                                  <b style="padding-left:5px">${user.f_name}   ${user.l_name}</b>

                      <button id="logout" class="logout-btn" onclick="logout()" style="width:10vh; margin-left:10%">Logout</button>
                      </div>

                  <div id="SugessionInfo">
                  <b>Suggested for you</b>
                    <!-- Link to trigger the popup -->
                    <a style="text-decoration: none; color: black; padding-left: 15vh" onclick="ShowAllsugesstion()">
                      <b>See All</b>
                    </a>

                    <!-- Popup for showing all suggestions -->
                    <div id="allSuggestionsPopup" class="popup" style="display: none;z-index: 9999;">
                      <div class="popup-content">
                        <span class="close" onclick="closePopupforallSuggestionsContent()">×</span>
                        <div id="allSuggestionsContent">
                          <!-- All suggestions will be dynamically loaded here -->
                        </div>
                      </div>
                    </div>






                  
                  </div>
                  <div id="sugessionUserDetail">


                  
              </div>


                `;

                function ShowAllsugesstion() {
                  const popup = document.getElementById('allSuggestionsPopup');
                  popup.style.display = 'block';
                  fetch('/getsugesstion')  
                  .then(response => response.json())
                  .then(data => {
                
                    const suggestionsContent = document.getElementById('allSuggestionsContent');
                    suggestionsContent.innerHTML = '';  
                    
                    if (!loggedInUserId) {
                      console.log('Logged-in user ID is not available.');
                      return;
                    }
                
                    data.forEach(user => {
                      if (loggedInUserId === user.user_id) {
                        console.log("Skipping suggestion for logged-in user:", user.user_id);
                        return; 
                      }
                
                      fetch(`/checkFollowStatus?follower_by_id=${loggedInUserId}&followed_to_id=${user.user_id}`)
                      .then(response => response.json())
                      .then(data => {
                        if (data.isFollowing) {
                          return;
                        }
                      else{
                        suggestionsContent.innerHTML += `
                        <div class="suggestions-container">
                          <div class="suggestion-item">
                            <img src="${user.user_photo || '/insta photo/D.jpg'}" alt="User Photo" onerror="this.src='/insta photo/D.jpg'" class="user-photo">
                            <a  onclick="showsugesstionuser(${user.user_id})" style="text-decoration: none; color: black;">
                              ${user.f_name} ${user.l_name}
                            </a>
                            <button 
                              type="button" 
                              class="btn btn-primary follow-btn" 
                              id="follow-btn-${user.user_id}" 
                              onclick="toggleFollow(${user.user_id})"
                            >
                              <span id="follow-text-${user.user_id}">Follow</span>
                              <span id="spinner-${user.user_id}" style="display: none;">Loading...</span>
                            </button>
                          </div>
                        </div>
                      `;
                      }
                      
                    });
                  })
                  .catch(error => console.log('Error loading suggestions:', error));
                
                window.addEventListener('click', function(event) {
                  const popup = document.getElementById('allSuggestionsPopup');
                  if (event.target === popup) {
                    closePopupforallSuggestionsContent(); 
                  }
                });
                
              }
                
              )}
                document.querySelector('.close').addEventListener('click', closePopupforallSuggestionsContent);
                
                
                function closePopupforallSuggestionsContent() {
                  const popup = document.getElementById('allSuggestionsPopup');
                  popup.style.display = 'none';  
                }



              fetch('/getsugesstion')
              .then(response => response.json())
              .then(posts => {
                  let count = 0;  

                  posts.forEach(post => {
                      if (loggedInUserId === post.user_id) return; 

                      fetch(`/checkFollowStatus?follower_by_id=${loggedInUserId}&followed_to_id=${post.user_id}`)
                        .then(response => response.json())
                          .then(data => {
                              if (data.follow_status === 'accepted') return;

                              if (count < 5) { 
                                const btnText = data.follow_status === 'pending' ? 'Requested' : 'Follow';
                                const btnDisabled = data.follow_status === 'pending' ? 'disabled' : '';
                                
                                  const suggestionHTML = `
                                      <div class="suggestions-container">
                                          <div class="suggestion-item">
                                              <img src="${post.user_photo || '/insta photo/D.jpg'}"
                                                  alt="User Photo"
                                                  onerror="this.src='/insta photo/D.jpg'"
                                                  class="user-photo"
                                                  onclick="showsugesstionuser(${post.user_id})">
                                              <a onclick="showsugesstionuser(${post.user_id})" 
                                                  style="text-decoration: none;color: black;">
                                                  ${post.f_name} ${post.l_name}
                                              </a>
                                              <button type="button" class="btn btn-primary follow-btn"
                                                  id="follow-btn-${post.user_id}"
                                                  onclick="toggleFollow(${post.user_id})"
                                                  ${btnDisabled}>
                                                  <span id="follow-text-${post.user_id}">${btnText}</span>
                                                  <span id="spinner-${post.user_id}" style="display: none;">Loading...</span>
                                              </button>
                                          </div>
                                      </div>`;

                                  sugessionUserDetail.innerHTML += suggestionHTML;
                                  count++;
                              }
                          })
                          .catch(error => console.error('Error checking follow status:', error));
                  });
              })
              .catch(error => console.error('Error fetching suggestions:', error));




              function toggleFollow(followedToId) {
              const button = document.getElementById(`follow-btn-${followedToId}`);
              const text = document.getElementById(`follow-text-${followedToId}`);
              const spinner = document.getElementById(`spinner-${followedToId}`);
              const followerById = loggedInUserId;

              text.style.display = 'none';
              spinner.style.display = 'inline-block';

              fetch('/toggleFollow', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
              follower_by_id: followerById,
              followed_to_id: followedToId
              })
              })
              .then(response => response.json())
              .then(data => {
              if (data.message === 'Followed successfully') {
              text.innerText = 'Unfollow';
              } else if (data.message === 'Follow request sent') {
              text.innerText = 'Requested'; 
              } else if (data.message === 'Unfollowed successfully') {
              text.innerText = 'Follow';
              } else {
              console.error('Unexpected server response:', data.message);
              }
              })
              .catch(error => {
              console.error('Error:', error);
              alert('An error occurred. Please try again.');
              })
              .finally(() => {
              text.style.display = 'inline';
              spinner.style.display = 'none';
              });
              }

              const New_Notification = document.getElementById('New_Notification');

              async function getPendingRequests() {
              try {
              const userId = loggedInUserId; 
              const response = await fetch(`/getPendingRequests?userId=${userId}`);
              const data = await response.json();

              if (data.length === 0) {
                  New_Notification.innerHTML = `<p>No pending requests</p>`;
                  return;
              }

              let content = '';
              data.forEach(request => {
              content += `
              <div class="pending-request" id="request-${request.request_id}">
              <img src="${request.user_photo}" alt="Profile Picture" width="50">
              <span>${request.f_name} ${request.l_name}</span>
              <button onclick="acceptRequest('${request.request_id}')">Accept</button>
              <button onclick="rejectRequest('${request.request_id}')">Reject</button>
              </div>
              `;
              });
              New_Notification.innerHTML = content;


              New_Notification.innerHTML = content;
              } catch (error) {
              console.error('Error fetching pending requests:', error);
              }
              }

              async function acceptRequest(requestId) {
              try {
              const response = await fetch(`/acceptRequest`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ requestId })
              });

              const result = await response.json();
              if (result.success) {
                document.getElementById(`request-${requestId}`).remove();
                showNotification("Request Accepted Successfully! ");
              } else {
                showNotification("Error Accepting Request ", true);
              }
              } catch (error) {
              console.error("Error in Accept Request:", error);
              showNotification("Server Error! Try Again ", true);
              }
              }

              async function rejectRequest(requestId) {
              try {
              const response = await fetch(`/rejectRequest`, {
              method: "POST",
              headers: {
                  "Content-Type": "application/json"
              },
              body: JSON.stringify({ requestId })
              });

              const result = await response.json();
              if (result.success) {
              document.getElementById(`request-${requestId}`).remove();
              showNotification("Request Rejected Successfully! ");
              } else {
              showNotification("Error Rejecting Request ", true);
              }
              } catch (error) {
              console.error("Error in Reject Request:", error);
              showNotification("Server Error! Try Again ", true);
              }
              }

              getPendingRequests();

              function showsugesstionuser(user_id) {
              console.log(`Fetching details for user ID: ${user_id}`);
              const popup = document.getElementById(`popup-${user_id}`);
              const showsugesstionuser = document.getElementById(`showsugesstionuser-${user_id}`);

              fetch(`/getUserProfile?userId=${user_id}`)
              .then(response => response.json())
              .then(user => {
              showsugesstionuser.innerHTML = `
                          <div class="user-profile">
                        <div class="profile-header" style="z-index: 9999;">
                          <img src="${user.user_photo}" alt="Profile Picture" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover;">
                          <h3 class="user-name"style="padding-left: 10px;">${user.f_name} ${user.l_name}</h3>
                          <p class="bio" style="padding-left: 50px;">${user.bio || ' '}</p>
                          </div>

                          <div class="profile-stats">
                          <div>
                          <hr>

                            <strong>Posts:</strong> ${user.post_count},
                            <strong>Followers:</strong> ${user.follower_count} ,
                            <strong>Following:</strong> ${user.following_count}

                            </div>
                            <hr>
                          </div>

                          <div class="recent-posts">
                            <h4>Posts:</h4>
                          <ul class="posts-list">
                          <div class="posts-grid">
                            ${user.posts
                                .map(post => `
                                <div class="post-item">
                                  <img src="${post.img}" alt="Post Image" class="post-img">
                                  <p class="post-caption">${post.caption}</p>
                                </div>
                              `)
                  .join('')}
                          </div>
                        </ul>


                            `;
              popup.style.display = 'block'; 
              })
              .catch(err => console.error('Error fetching user details:', err));
              }

              function closePopup(user_id) {
              const popup = document.getElementById(`popup-${user_id}`);
              if (popup) {
              popup.style.display = 'none';
              }
              }

              function toggleSidebar() {
              document.getElementById('sidebar').classList.toggle('active');
              }
              document.getElementById('toggleSidebar').addEventListener('click', toggleSidebar);













              function logout() {
                const user = JSON.parse(localStorage.getItem("user")); // Only check localStorage
            
                if (!user) {
                    alert("You are not logged in.");
                    return;
                }
            
                console.log("Logging out...");
                fetch('/logout', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: { 'Content-Type': 'application/json' }
                })
                .then(response => {
                    if (response.ok) {
                        console.log('Logout successful');
                        localStorage.removeItem("user");   // Remove persistent user data
                        window.location.href = 'login.html'; // Redirect to login page
                    } else {
                        return response.json().then(data => {
                            alert(data.message);
                        });
                    }
                })
                .catch(error => {
                    console.error('Error logging out:', error);
                    alert('Logout failed. Please try again.');
                });
            }
            
            
            
            /*   function logout() {
                console.log("Logging out...");
            
                fetch('/logout', {
                    method: 'GET',
                    credentials: 'include' 
                })
                .then(response => {
                    if (response.ok) {
                        sessionStorage.clear(); 
                        document.cookie = "connect.sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; 
                        window.location.href = 'login.html';
                    } else {
                        alert('Logout failed. Please try again.');
                    }
                })
                .catch(error => {
                    console.error('Error logging out:', error);
                    alert('Logout failed. Please try again.');
                });
            } */
            
              /*   function logout() {
                  console.log("Logging out...");
              
                  fetch('/logout', { 
                      method: 'POST',  
                      credentials: 'include' 
                  })
                  .then(response => response.json()) // Ensure response is parsed
                  .then(data => {
                      if (data.message === "Logout successful") {
                          sessionStorage.clear(); // Clear session only after successful logout
                          window.location.href = 'login.html';
                      } else {
                          alert('Logout failed. Please try again.');
                      }
                  })
                  .catch(error => {
                      console.error('Error logging out:', error);
                      alert('Logout failed. Please try again.');
                  });
              } */
              
              
              /* function updateUserData(userId) {
              const formData = new FormData();
              formData.append('f_name', document.getElementById('f_name').value);
              formData.append('l_name', document.getElementById('l_name').value);
              formData.append('Bio', document.getElementById('Bio').value);

              const newUserPhoto = document.getElementById('new_user_photo').files[0];
              if (newUserPhoto) {
              formData.append('new_user_photo', newUserPhoto);
              }

              fetch(`/updateUserData/${userId}`, {
              method: 'POST',
              body: formData
              })
              .then(response => response.json())
              .then(data => {
              if (data.success) {
              console.log('Profile updated successfully:', data);

              if (data.user_photo) {
              document.getElementById('currentProfilePhoto').src = data.user_photo;

              }
              closePopup()
              alert("Profile Update successfully")
              } else {
              console.error('Error:', data.message);
              }
              })
              .catch(error => {
              console.error('Error updating user data:', error);
              });
              } */


              /* fetch('/getsugesstion')
              .then(response => response.json())
              .then(posts => {
              posts.forEach(post => {
              if (loggedInUserId === post.user_id) return;

              fetch(`/checkFollowStatus?follower_by_id=${loggedInUserId}&followed_to_id=${post.user_id}`)
              .then(response => response.json())
              .then(data => {
                if (data.isFollowing) {
                  return;
                } else if(count<5) {
                  sugessionUserDetail.innerHTML += `
                                  <div class="suggestions-container">
                                    <div class="suggestion-item">
                                      <img 
                                        src="${post.user_photo || '/insta photo/D.jpg'}" 
                                        alt="User Photo" 
                                        onerror="this.src='/insta photo/D.jpg'" 
                                        class="user-photo" 
                                        onclick="showsugesstionuser(${post.user_id})"
                                      >
                                              <a  onclick="showsugesstionuser(${post.user_id})"style="text-decoration: none;color: black;">${post.f_name} ${post.l_name}</a>

                                      <button 
                                        type="button" 
                                        class="btn btn-primary follow-btn" 
                                        id="follow-btn-${post.user_id}" 
                                        onclick="toggleFollow(${post.user_id})"
                                      >
                                        <span id="follow-text-${post.user_id}">Follow1</span>
                                        <span id="spinner-${post.user_id}" style="display: none;">Loading...</span>
                                      </button>
                                    </div>
                                  </div>
                    
                                  <!-- Popup for user details -->
                                  <div id="popup-${post.user_id}" class="popup" style="display: none;">
                                    <div class="popup-content">
                                      <span class="close" onclick="closePopup(${post.user_id})">&times;</span>
                                      <div id="showsugesstionuser-${post.user_id}">
                                        <!-- User details will be dynamically loaded here -->
                                      </div>
                                    </div>
                                  </div>
                                
                                `;
                }
                count ++;
              });
              });
              }); */



