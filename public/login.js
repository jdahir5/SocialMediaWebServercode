document.getElementById("login-btn").addEventListener("click", function () {
    if (sessionStorage.getItem("user")) {
        alert("You are already logged in. Please log out first.");
        return;
    }

    const phoneNo = document.getElementById("phoneno").value;
    const password = document.getElementById("password").value;

    if (phoneNo.trim() === "" || password.trim() === "") {
        alert("Please enter both mobile number and password.");
        return;
    }

    fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Mobile_no: phoneNo, password: password })
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else if (response.status === 401) {
            throw new Error("Incorrect mobile number or password");
        } else if (response.status === 403) {
            throw new Error("This account is already logged in from another tab. Please log out first.");
        } else {
            throw new Error("An unexpected error occurred. Please try again.");
        }
    })
    .then(data => {
        alert(data.message); 
        
        if (data.message === "Login successful") {
            localStorage.setItem("user", JSON.stringify(data.user));
            sessionStorage.setItem("user", JSON.stringify(data.user));
            window.location.href = "home.html"; 
        }
    })
    .catch(error => {
        alert(error.message);
    });
});

window.onload = function () {
    const storedUser = JSON.parse(localStorage.getItem("user")); 

    if (storedUser && storedUser.user_id) {
        window.location.href = "home.html"; 
    }
};