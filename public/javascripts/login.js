const loginForm = document.getElementById("loginForm");

async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        
        if (response.ok) {
            

            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userEmail', data.email);
            localStorage.setItem('userRole', data.role);

             if (data.role === 'admin') {
                window.location.href = '/';
            } else {
                window.location.href = '/'; 
            }
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Error logging in.');
    }
}

document.addEventListener("DOMContentLoaded", function() {
    
    if (loginForm) loginForm.addEventListener("submit", handleLogin);
});