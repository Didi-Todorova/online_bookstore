document.addEventListener("DOMContentLoaded", function () {

    const loginButton = document.getElementById("loginButton");
    const registerButton = document.getElementById("registerButton");
    const seePurchasesButton = document.getElementById("seePurchasesButton");
    const adminButton = document.getElementById("adminButton");
    const logoutButton = document.getElementById("logoutButton");

    const booksContainer = document.getElementById("booksContainer");

    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const role = localStorage.getItem('userRole');

    loginButton.style.display = 'none';
    registerButton.style.display = 'none';
    seePurchasesButton.style.display = 'none';
    adminButton.style.display = 'none';
    logoutButton.style.display = 'none';

    if (isLoggedIn && role === 'user') {
        seePurchasesButton.style.display = 'inline-block';
        logoutButton.style.display = 'inline-block';
    } else if (isLoggedIn && role === 'admin') {
        adminButton.style.display = 'inline-block';
        logoutButton.style.display = 'inline-block';
    } else {
        loginButton.style.display = 'inline-block';
        registerButton.style.display = 'inline-block';
    }

    const logoSpan = document.querySelector('.logo');

    if (logoSpan) {
        const logoLink = document.createElement('a');
        logoLink.href = '/';
        logoLink.textContent = logoSpan.textContent;
        logoLink.className = 'logo'; 

        logoSpan.parentNode.replaceChild(logoLink, logoSpan);
    }

    if (loginButton) loginButton.addEventListener("click", () => {
        window.location.href = '/login';
    });
    
    if (registerButton) registerButton.addEventListener("click", () => {
        window.location.href = '/register';
    });

    if (seePurchasesButton) seePurchasesButton.addEventListener("click", () => window.location.href = '/userPurchases');

    if (adminButton) adminButton.addEventListener("click", () => window.location.href = '/admin');

    if (logoutButton) logoutButton.addEventListener("click", () => {
        localStorage.clear();
        window.location.href = '/';
    });

    loadBooks();
});

async function loadBooks() {
    try {
        const response = await fetch('/books');
        const books = await response.json();

        if (books && Array.isArray(books)) {
            booksContainer.innerHTML = '';

            books.forEach(book => {
                const bookDiv = document.createElement('div');
                bookDiv.className = 'item';
                bookDiv.innerHTML = `
                    <h2>${book.title}</h2>
                    <img src="/${book._id}/image" alt="${book.title}">
                    <p>Author: ${book.author}</p>
                    <p>Description: ${book.shortDescription || 'No description available'}</p>
                    <p>Price: $${book.price}</p>
                    <a href="/book/${book._id}">View Details</a>
                    
                `;
                booksContainer.appendChild(bookDiv);
            });
        }
    } catch (error) {
        console.error('Error loading books:', error);
        booksContainer.innerHTML = '<p>Error loading books. Please try again later.</p>';
    }
}

