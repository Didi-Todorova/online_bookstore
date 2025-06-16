document.addEventListener("DOMContentLoaded", function () {

    const indexButton = document.getElementById("indexButton");
    
    if (indexButton) {
        indexButton.style.display = 'inline-block';
        indexButton.addEventListener("click", () => {            
            window.location.href = '/';
        });
    }

    const bookId = window.location.pathname.split('/').pop();;

    if (!bookId) {
        console.error('Book ID not found in form dataset!');
        return;
    }

    async function loadBookDetails() {
        try {
            const response = await fetch(`/book/${bookId}/data`);
            const book = await response.json();

            if (book) {
                const bookImage = document.getElementById('bookImage');
                if (bookImage) {
                    bookImage.src = `/book/${book._id}/image`;
                    bookImage.alt = book.title;
                }
                const bookDetails = document.querySelector('#book-info .book-details');
                if (bookDetails) {
                    bookDetails.innerHTML = `
                    <h2>${book.title}</h2>
                    <p><strong>Author: </strong> ${book.author}</p>
                    <p><strong>Short Description: </strong> ${book.shortDescription || 'No brief description available'}</p>
                    <p><strong>Full description: </strong> ${book.fullDescription || 'No full description available'}</p>
                    <h2>Price: $${book.price}</h2>
                    `;
                }

                const purchaseForm = document.getElementById('purchaseForm');
                if (purchaseForm) {
                    purchaseForm.dataset.bookId = bookId;
                    purchaseForm.dataset.bookPrice = book.price;

                    const quantityInput = document.getElementById('quantity');
                    const totalAmountSpan = document.getElementById('totalAmount');

                    function updateTotalAmount() {
                        const quantity = parseInt(quantityInput.value) || 1;
                        const price = parseFloat(purchaseForm.dataset.bookPrice);
                        const total = (price * quantity).toFixed(2);
                        totalAmountSpan.textContent = `$${total}`;
                    }

                    updateTotalAmount();

                    quantityInput.addEventListener('change', updateTotalAmount);
                    quantityInput.addEventListener('input', updateTotalAmount);

                    purchaseForm.addEventListener('submit', async function (event) {
                        event.preventDefault();

                        const formData = {
                            book: bookId,
                            customer: {
                                name: document.getElementById('name').value.trim(),
                                email: document.getElementById('email').value.trim()
                            },
                            quantity: parseInt(document.getElementById('quantity').value) || 1
                        };

                        try {
                            const response = await fetch('/book/purchases', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(formData)
                            });

                            const data = await response.json();

                            if (response.ok) {
                                window.location.href = `/confirmation/${data.purchase._id}`;
                            } else {
                                alert(data.message || 'Error processing purchase');
                                console.error('Server response:', data);
                            }
                        } catch (error) {
                            console.error('Error:', error);
                            alert('Error processing purchase. Please try again.');
                        }
                    });
                }

                const reviewsContainer = document.getElementById('reviewsContainer');
                if (reviewsContainer) {
                    reviewsContainer.innerHTML = `
                        <h2>User Reviews</h2>
                        <div id="reviewsList"></div>
                    `;
                }
            }
        } catch (error) {
            console.error('Error loading book details:', error);
            const bookDetails = document.getElementById('book-info');
            if (bookDetails) {
                bookDetails.innerHTML = '<p>Error loading book details. Please try again later.</p>';
            }
        }
    }

    async function loadReviews() {
        try {
            const response = await fetch(`/book/${bookId}/data`);
            const book = await response.json();

            if (book && Array.isArray(book.reviews)) {
                const reviewsList = document.getElementById('reviewsList');
                if (reviewsList) {
                    reviewsList.innerHTML = '';
                    book.reviews.forEach((review) => {
                        const reviewDiv = document.createElement('div');
                        reviewDiv.className = 'review';
                        reviewDiv.innerHTML = `
                            <p><strong>${review.name}</strong></p>
                            <p>${review.text}</p>
          `;
                        reviewsList.appendChild(reviewDiv);
                    });
                }

                const reviewForm = document.getElementById('reviewForm');
                
            }
        } catch (error) {
            console.error('Error loading reviews:', error);
        }
    }

    loadBookDetails();
    loadReviews();

    const reviewForm = document.getElementById('reviewForm');
    const reviewerNameInput = document.getElementById('reviewerName');
    const reviewText = document.getElementById('reviewText');

    if (reviewForm) {
        reviewForm.addEventListener('submit', async function () {
            const reviewerName = reviewerNameInput.value.trim();
            const reviewContent = reviewText.value.trim();
            if (!reviewContent || !reviewerName) {
                alert("Please enter your name and review before submitting.");
                return;
            }

            try {
                const response = await fetch(`/book/${bookId}/reviews`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name: reviewerName, review: reviewContent })
                });

                const data = await response.json();

                if (response.ok) {
                    alert("Review submitted successfully.");
                    reviewerNameInput.value = '';
                    reviewText.value = '';  
                    loadReviews(); 
                } else {
                    alert(data.message || "Failed to submit review.");
                    console.error("Review submission error:", data);
                }
            } catch (error) {
                console.error("Error submitting review:", error);
                alert("An error occurred while submitting the review.");
            }
        });
    }
});
