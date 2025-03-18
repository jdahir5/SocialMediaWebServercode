const script = document.createElement('script');
script.src = 'home.js';
document.body.appendChild(script);


const user = JSON.parse(sessionStorage.getItem('user'));
const user_id = user ? user.user_id : null;
const user_photo = user && user.user_photo ? user.user_photo : '/insta photo/D.jpg';



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

                  const ChatUserSugesstion = document.getElementById('ChatUserSugesstion');
                  const loggedInUserId = user_id;
                  
                  fetch('/getsugesstion')
                    .then(response => response.json())
                    .then(posts => {
                      ChatUserSugesstion.innerHTML = '';
                      
                      posts.reverse();
                  
                      posts.forEach(post => {
                        console.log("44")
                        fetch(`/checkFollowStatus?follower_by_id=${loggedInUserId}&followed_to_id=${post.user_id}`)
                          .then(response => response.json())
                          .then(data => {
                            if (data.isFollowing) {  
                              ChatUserSugesstion.innerHTML += `
                                <div class="suggestion-item">
                                  <div>
                                    <img 
                                      src="${post.user_photo || '/insta photo/D.jpg'}" 
                                      alt="User Photo" 
                                      onerror="this.src='/insta photo/D.jpg'" 
                                      onclick="GoUserMsg('${post.user_id}')"
                                    />
                                  </div>
                                  <div class="username">
                                    <span>
                                      <a  style="text-decoration: none; color: black;"onclick="GoUserMsg('${post.user_id}')">
                                        ${post.f_name} ${post.l_name}
                                      </a>
                                    </span>
                                  </div>
                                </div>
                                <br>
                              `;
                            }
                          })
                          .catch(error => console.error("Error checking follow status:", error));
                      });
                    })
                    .catch(error => console.error("Error fetching suggestions:", error));
                  
                  let receiver_id = null; 
                  let sender_id = user_id;
                
                  function GoUserMsg(user_id) {
                    fetch(`/getUserInfo?user_id=${user_id}`)
                      .then(response => response.json())
                      .then(data => {
                        const ChatUsername = document.getElementById('ChatUsername');
                        ChatUsername.innerHTML = `
                          <img src="${data.user_photo || '/insta photo/D.jpg'}" alt="User Photo" />
                          <span class="chat-name">${data.f_name} ${data.l_name}</span>
                        `;
                        receiver_id = data.user_id;
                
                        checkUnreadMessages(receiver_id);
                
                        fetchOldMessages(sender_id, receiver_id);
                      })
                      .catch(error => console.error("Error fetching user info:", error));
                }
                
                document.getElementById("Chat").innerHTML = `
                <div style="display: flex; flex-direction: column; height: 80vh;">
                  <div id="oldchat" style="height: 400px; overflow-y: auto;"></div>
                  <!-- Typing Indicator -->
                  <p id="typingIndicator" style="color: gray; padding-left: 10px; margin: 5px 0;"></p>
                </div>
                <div class="flex-row-container">
                  <div>
                    <form id="myForm" style="display: flex; align-items: center; gap: 10px; width: 100vh;">
                      <input type="text" id="Msgtext" name="textInput" placeholder="Type here..."
                        style="flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 5px; width: 100%;">
                  </div>
                    <div>
                      <button type="button" class="icon-btn" id="imageButton" onclick="triggerImageSelect()">
                        <i class="fa-solid fa-image"></i>
                        <input type="file" id="fileInput" style="display: none;" accept="image/*" onchange="handleImageSelect()" />
                      </button>
                    </div>
                  <div class="flex-item">
                    <button type="button" id="sendButton" onclick="sendMessage()"
                      style="padding: 8px 15px; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">
                      Send
                    </button>
                  </div>
                </div>
              `;
              
              function triggerImageSelect() {
                document.getElementById('fileInput').click();
              }
              
              function handleImageSelect() {
                const fileInput = document.getElementById('fileInput');
                const file = fileInput.files[0];
              
                if (file) {
                  sendImage(file);
                }
              }
              
              function sendImage(file) {
                if (!sender_id || !receiver_id) {
                  alert('Error: Sender or Receiver ID not found.');
                  return;
                }
              
                const formData = new FormData();
                formData.append('image', file); // Change 'photo' to 'image' (matches backend)
                formData.append('sender_id', sender_id);
                formData.append('receiver_id', receiver_id);
              
                fetch('/upload', {  // ✅ Change `/SendMsg` to `/upload`
                  method: 'POST',
                  body: formData
                })
                .then(response => response.json())
                .then(data => {
                  console.log('Image uploaded successfully:', data);
                  if (data.imageUrl) {  
                    displaySentImage(data.imageUrl);
                  }
                })
                .catch(error => {
                  console.error('Error uploading image:', error);
                });
              }
              
              
              function sendMessage() {
                if (!sender_id || !receiver_id) {
                  alert('Error: Sender or Receiver ID not found.');
                  return;
                }
              
                const message = document.getElementById('Msgtext').value.trim();
                const fileInput = document.getElementById('fileInput');
                const file = fileInput.files[0];
              
                if (!message && !file) {
                  alert('Please enter a message or select an image.');
                  return;
                }
              
                const formData = new FormData();
                formData.append('sender_id', sender_id);
                formData.append('receiver_id', receiver_id);
              
                if (message) {
                  formData.append('message_text', message);
                }
                if (file) {
                  formData.append('photo', file);
                }
              
                fetch('/SendMsg', {
                  method: 'POST',
                  body: formData
                })
                .then(response => response.json())
                .then(data => {
                  console.log('Message sent successfully:', data);
              
                  if (message) {
                    appendMessageToChat(message, sender_id, new Date());
                  }
                  if (data.data.photoURL) {
                    displaySentImage(data.data.photoURL);
                  }
              
                  document.getElementById('Msgtext').value = '';
                  fileInput.value = '';
                })
                .catch(error => {
                  console.error('Error sending message:', error);
                });
              }
              
              function displaySentImage(imageURL) {
                const chatContainer = document.getElementById("oldchat");
              
                const imgElement = document.createElement("img");
                imgElement.src = imageURL;
                imgElement.style.maxWidth = "200px";
                imgElement.style.borderRadius = "8px";
                imgElement.style.margin = "5px 0";
              
                chatContainer.appendChild(imgElement);
                chatContainer.scrollTop = chatContainer.scrollHeight;
              }


               /*  function sendMessage() {
                  if (!sender_id || !receiver_id) {
                      alert('Error: Sender or Receiver ID not found.');
                      return;
                  }
              
                  const message = document.getElementById('Msgtext').value;
              
                  if (message.trim() === '') {
                      alert('Please enter a message.');
                      return;
                  }
              
                  fetch('/SendMsg', {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({
                          sender_id: sender_id,
                          receiver_id: receiver_id,
                          message_text: message
                      })
                  })
                  .then(response => response.json())
                  .then(data => {
                      console.log('Message stored successfully:', data);
                      appendMessageToChat(message, sender_id, new Date());
              
                      document.getElementById('Msgtext').value = '';
              
                      updateUnreadMessages(receiver_id);
              
                      checkUnreadMessages(receiver_id);
                  })
                  .catch(error => {
                      console.error('Error storing message:', error);
                  });
              } */
              
                


              
              function updateUnreadMessages(receiver_id) {
                  const chatId = `${sender_id}_${receiver_id}`;
                  const unreadRef = db.ref(`chats/${chatId}/unreadMessages/${receiver_id}`);
                  unreadRef.transaction((currentUnreadCount) => {
                      return (currentUnreadCount || 0) + 1;
                  });
              }
              
                
            function appendMessageToChat(message, senderId, timestamp) {
                  const oldchat = document.getElementById('oldchat');
                  const messageElement = document.createElement('p');
                  const messageText = document.createElement('b');
                  const userNameElement = document.createElement('div');
              
                  const date = new Date(timestamp);
                  const hours = date.getHours().toString().padStart(2, '0');
                  const minutes = date.getMinutes().toString().padStart(2, '0');
                  const formattedTime = `${hours}:${minutes}`;
               
                  userNameElement.classList.add('user-name', 'small-text');
                  userNameElement.textContent = `${formattedTime}`;
              
                  messageText.textContent = message;
              
                  if (senderId === sender_id) {
                      messageElement.classList.add('sender');
                  } else {
                      messageElement.classList.add('receiver');
                  }
              
                  messageElement.classList.add('message');
                  messageElement.appendChild(messageText);
                  messageElement.appendChild(userNameElement);
              
                  oldchat.appendChild(messageElement);
                  oldchat.scrollTop = oldchat.scrollHeight; 
              }
              
                  
                async function fetchOldMessages(sender_id, receiver_id) {
                  const oldchat = document.getElementById('oldchat');
                  oldchat.innerHTML = ''; // Clear old messages before fetching new ones
              
                  try {
                      const response = await fetch(`/GetMsg?sender_id=${sender_id}&receiver_id=${receiver_id}`);
                      const messages = await response.json();
              
                      if (!response.ok) {
                          console.error("Error fetching messages:", messages);
                          return;
                      }
              
                      messages.forEach((message) => {
                          const messageText = document.createElement('b');
                          const messageElement = document.createElement('p');
                          const userNameElement = document.createElement('div');
              
                          const date = new Date(message.timestamp);
                          const hours = date.getHours().toString().padStart(2, '0');
                          const minutes = date.getMinutes().toString().padStart(2, '0');
                          const formattedTime = `${hours}:${minutes}`;
              
                          userNameElement.classList.add('user-name', 'small-text');
                          userNameElement.textContent = `${formattedTime}`;
              
                          messageText.textContent = message.message_text;
              
                          if (message.sender_id === sender_id) {
                              messageElement.classList.add('sender');
                          } else {
                              messageElement.classList.add('receiver');
                          }
              
                          messageElement.classList.add('message');
                          messageElement.appendChild(messageText);
                          messageElement.appendChild(userNameElement);
              
                          oldchat.appendChild(messageElement);
                      });
              
                      oldchat.scrollTop = oldchat.scrollHeight;
                  } catch (error) {
                      console.error("Error loading messages:", error);
                  }
              }


              async function checkUnreadMessages(receiver_id) {
                try {
                    const response = await fetch(`/CheckUnreadMessages?receiver_id=${receiver_id}`);
                    const unreadMessages = await response.json();
            
                    if (unreadMessages > 0) {
                        showNotification(unreadMessages);  // Trigger notification
                    }
                } catch (error) {
                    console.error("Error checking unread messages:", error);
                }
            }
            
function sendNotificationToReceiver(receiver_id, message_text) {
  const message = {
      notification: {
          title: 'New Message',
          body: message_text,
      },
      token: getReceiverToken(receiver_id), // Ensure this is correct
  };

  admin.messaging().send(message)
      .then((response) => {
          console.log("Notification sent successfully:", response);
      })
      .catch((error) => {
          console.error("Error sending notification:", error);
      });
}

function showNotification(unreadMessages) {
  // Create notification element
  const notification = document.createElement('div');
  notification.classList.add('notification');
  notification.textContent = `${unreadMessages} unread message(s)`;

  // Append to body or a specific container
  document.body.appendChild(notification);

  // Auto-remove the notification after 5 seconds
  setTimeout(() => {
      notification.remove();
  }, 5000);
}



function showNotification(unreadMessages) {
  const notification = document.createElement('div');
  notification.classList.add('notification');
  notification.textContent = `${unreadMessages} unread messages`;
  document.body.appendChild(notification);

  setTimeout(() => {
      notification.remove(); // Remove notification after 5 seconds
  }, 5000);
}
async function markMessagesAsRead(receiver_id, chatId) {
  const unreadRef = ref(db, `chats/${chatId}/unreadMessages/${receiver_id}`);
  await update(unreadRef, { ".value": 0 });  // Reset unread messages
}

              
    
                
                
  

