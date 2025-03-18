const container = document.getElementById('container');
const user = JSON.parse(sessionStorage.getItem('user'));
const user_id = user ? user.user_id : null;
const user_photo = user ? user.user_photo : '/insta photo/2.1.jpg';




    const center = document.getElementById('center'); 
    
    center.innerHTML = `<div class="story">
                    <div>
                        <img src="./media/p3.jpg" alt="username">
                    </div>
                    <div class="username"><span><a href="#">username</a></span></div>
                </div>`; // Setting innerHTML


                