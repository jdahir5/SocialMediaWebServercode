function Filed1(event) {
    var phoneno = document.getElementById("phoneno").value.trim();
    var firstname = document.getElementById("firstname").value.trim();
    var lastname = document.getElementById("lastname").value.trim();
    var password = document.getElementById("password").value.trim();
    var cpassword = document.getElementById("cpassword").value.trim();
    var email = document.getElementById("email").value.trim();

    
    var phonenumber = phoneno.replace(/\D/g, "");  

    if (!phoneno  || !email||!firstname || !lastname || !password || !cpassword) {
        alert("All fields are required");
        event.preventDefault(); 
        return false;
    } else if (phonenumber.length !== 10) {
        alert("Enter a valid 10-digit phone number");
        event.preventDefault();
        return false;
    } else if (password.length < 8) {
        alert("Password must be at least 8 characters long");
        event.preventDefault();
        return false;
    } else if (password !== cpassword) {
        alert("Passwords do not match");
        event.preventDefault();
        return false;
    }

    alert("Sign In Successful");
    return true;
}

window.onload = function () {
    const storedUser = JSON.parse(localStorage.getItem("user")); 

    if (storedUser && storedUser.user_id) {
        window.location.href = "home.html"; 
    }
};