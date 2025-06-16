document.addEventListener("DOMContentLoaded", function() {
    const indexButton = document.getElementById("indexButton");
    const logoutButton = document.getElementById("logoutButton");

    if (indexButton) {
        indexButton.style.display = 'inline-block';
        indexButton.addEventListener("click", () => {            
            window.location.href = '/';
        });
    }
    if (logoutButton) {
        logoutButton.style.display = 'inline-block';
        logoutButton.addEventListener("click", () => {
            localStorage.clear();
            window.location.href = '/';
        });
    }

    loadUserPurchases();
});

async function loadUserPurchases() {
        try {
        const email = localStorage.getItem('userEmail');
        const params = new URLSearchParams();        
        if (email) params.append('email', email);        

        const response = await fetch(`/userPurchases/purchases?${params.toString()}`);        
        const purchases = await response.json();

        const purchasesList = document.getElementById('purchasesList');
        if (!purchasesList) {
            console.error('Purchases list container not found');
            return;
        }

        purchasesList.innerHTML = '';

        if (purchases && Array.isArray(purchases)) {
            purchases.forEach(purchase => {
                const purchaseDiv = document.createElement('div');
                purchaseDiv.className = 'userPurchase-item';
                purchaseDiv.innerHTML = `                                     
                    <div class="book-info">
                        <p><strong>Book:</strong> ${purchase.book.title}</p>
                        <p><strong>Author:</strong> ${purchase.book.author}</p>
                        <p><strong>Short Description:</strong> ${purchase.book.shortDescription}</p>
                        <p><strong>Quantity:</strong> ${purchase.quantity}</p>
                        <p><strong>Total Amount:</strong> $${purchase.totalAmount.toFixed(2)}</p>
                    </div> 
                    <div class="action-buttons">
                    <a href="/book/${purchase.book._id}" class="btn-view">View Book</a>
                    <button class="btn-delete" data-id="${purchase._id}">Cancel Order</button>
                </div>                                          
                `;
                purchasesList.appendChild(purchaseDiv);
            });

            document.querySelectorAll('.btn-delete').forEach(button => {
                button.addEventListener('click', async function () {
                    if (confirm('Are you sure you want to cancel this order?')) {
                        const purchaseId = this.dataset.id;

                        try {
                            const response = await fetch(`/userPurchases/${purchaseId}`, {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            });

                            const data = await response.json();

                            if (response.ok) {
                                alert('Order cancelled successfully');
                            loadUserPurchases(); // reload the list
                            } else {
                                alert(data.message || 'Error cancelling order');
                            }
                        } catch (error) {
                            console.error('Error cancelling order:', error);
                            alert('Error cancelling order. Please try again.');
                        }
                    }
                });
            });
        }
    } catch (error) {
        console.error('Error loading purchases:', error);
        alert('Error loading purchases. Please try again.');
    }
}