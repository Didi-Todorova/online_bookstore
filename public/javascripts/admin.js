document.addEventListener("DOMContentLoaded", function () {

    const indexButton = document.getElementById("indexButton");
    const logoutButton = document.getElementById("logoutButton");

    const statusColors = {
    pending: 'orange',
    completed: 'green',
    cancelled: 'red'
    };

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

    const imageFile = document.getElementById('imageFile');
    const previewImage = document.getElementById('previewImage');

    if (imageFile && previewImage) {
        imageFile.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    previewImage.src = e.target.result;
                    previewImage.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                alert('Please select an image file');
                previewImage.src = `/admin/books/${item._id}/image`; // Your route to serve image binary
                previewImage.style.display = 'block';

            }
        });
    }

   const addItemForm = document.getElementById('addItemForm');

    if (addItemForm) {
  addItemForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    const formData = new FormData();
    formData.append('title', document.getElementById('title').value.trim());
    formData.append('author', document.getElementById('author').value.trim());
    formData.append('price', document.getElementById('price').value.trim());
    formData.append('shortDescription', document.getElementById('shortDescription').value.trim());
    formData.append('fullDescription', document.getElementById('fullDescription').value.trim());

    const imageFile = document.getElementById('imageFile').files[0];
    if (imageFile) {
      formData.append('imageFile', imageFile);
    }

    try {
      let response;
      const bookId = this.dataset.bookId;

      if (bookId) {
        response = await fetch(`/admin/books/${bookId}`, {
          method: 'PUT',
          body: formData
        });
      } else {
        response = await fetch('/admin/books', {
          method: 'POST',
          body: formData
        });
      }

      const data = await response.json();

      if (response.ok) {
        alert(bookId ? 'Book updated successfully' : 'Book added successfully');

        this.reset();

        if (previewImage) {
          previewImage.style.display = 'none';
          previewImage.src = '#';
        }

        this.dataset.bookId = '';
        this.querySelector('input[type="submit"]').value = 'Add Book';

        if (typeof loadItems === 'function') {
          loadItems();
        }
      } else {
        alert(data.message || 'Error saving book');
        console.error('Server response:', data);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error saving book. Please check the console for details.');
    }
  });
    }

    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', async function () {
            const bookId = this.dataset.id;
            const item = items.find(i => i._id === bookId);

            if (item) {
                // Set form values
                document.getElementById('title').value = item.title;
                document.getElementById('author').value = item.author;
                document.getElementById('price').value = item.price;
                document.getElementById('shortDescription').value = item.shortDescription;
                document.getElementById('fullDescription').value = item.fullDescription;

                const previewImage = document.getElementById('previewImage');
                if (previewImage) {
                    previewImage.src = item.image;
                    previewImage.style.display = 'block';
                }

                addItemForm.dataset.bookId = bookId;
                addItemForm.querySelector('input[type="submit"]').value = 'Update Book';
            }
        });
    });

    loadItems();

    const statusFilter = document.getElementById('statusFilter');
    const searchEmail = document.getElementById('searchEmail');
    const refreshPurchases = document.getElementById('refreshPurchases');

    if (statusFilter) statusFilter.addEventListener('change', () => loadPurchases(statusFilter.value, searchEmail.value));
    if (searchEmail) searchEmail.addEventListener('input', () => loadPurchases(statusFilter.value, searchEmail.value));
    if (refreshPurchases) refreshPurchases.addEventListener('click', () => loadPurchases(statusFilter.value, searchEmail.value));

    document.addEventListener('change', async function (e) {
        if (e.target.classList.contains('status-select')) {
            const purchaseId = e.target.dataset.purchaseId;
            const newStatus = e.target.value;

            try {
                const response = await fetch(`/admin/purchases/${purchaseId}/status`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ status: newStatus })
                });

                if (!response.ok) {
                    throw new Error('Failed to update status');
                }

                e.target.parentElement.parentElement.parentElement.querySelector('.status-badge').style.backgroundColor =
                    statusColors[newStatus];
                e.target.parentElement.parentElement.parentElement.querySelector('.status-badge').textContent =
                    newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
            } catch (error) {
                console.error('Error updating status:', error);
                alert('Error updating status. Please try again.');
            }
        }
    });

    loadPurchases();
    });

    async function loadItems() {
    try {
        const response = await fetch('/admin/books');
        const items = await response.json();

        const itemsList = document.getElementById('itemsList');
        if (!itemsList) {
            console.error('Items list container not found');
            return;
        }

        itemsList.innerHTML = '';

        if (items && Array.isArray(items)) {
            items.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'admin-item';
                itemDiv.innerHTML = `
                    <h3>${item.title}</h3>
                    <p>Author: ${item.author}</p>
                    <p>Price: $${item.price}</p>
                    <div class="stats">
                        <p><strong>Total Sales:</strong> ${item.totalSales || 0}</p>
                    </div>
                    <button class="edit-btn" data-id="${item._id}">Edit</button>
                    <button class="delete-btn" data-id="${item._id}">Delete</button>
                `;
                itemsList.appendChild(itemDiv);
            });

            document.querySelectorAll('.edit-btn').forEach(button => {
                button.addEventListener('click', async function () {
                    const bookId = this.dataset.id;
                    const item = items.find(i => i._id === bookId);

                    if (item) {
                        document.getElementById('title').value = item.title;
                        document.getElementById('author').value = item.author;
                        document.getElementById('price').value = item.price;
                        document.getElementById('shortDescription').value = item.shortDescription;
                        document.getElementById('fullDescription').value = item.fullDescription;

                        const previewImage = document.getElementById('previewImage');
                        if (previewImage) {
                            previewImage.src = item.image;
                            previewImage.style.display = 'block';
                        }

                        addItemForm.dataset.existingImage = item.image;

                        addItemForm.dataset.bookId = bookId;
                        addItemForm.querySelector('input[type="submit"]').value = 'Update Book';
                    }
                });
            });

            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', async function () {
                    if (confirm('Are you sure you want to delete this book?')) {
                        const bookId = this.dataset.id;

                        try {
                            const response = await fetch(`/admin/books/${bookId}`, {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            });

                            const data = await response.json();

                            if (response.ok) {
                                alert('Book and related purchases are deleted successfully');
                                loadItems(); 
                            } else {
                                alert(data.message || 'Error deleting book');
                            }
                        } catch (error) {
                            console.error('Error deleting book:', error);
                            alert('Error deleting book. Please try again.');
                        }
                    }
                });
            });
        }
    } catch (error) {
        console.error('Error loading items:', error);
        alert('Error loading items. Please try again.');
    }
    }

    async function loadPurchases(status = 'all', email = '') {
        try {
        const params = new URLSearchParams();
        if (status !== 'all') params.append('status', status);
        if (email) params.append('email', email);        

        const response = await fetch(`/admin/purchases?${params.toString()}`);        
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
                purchaseDiv.className = 'purchase-item';
                purchaseDiv.innerHTML = `
                    <div class="purchase-header">
                        <h3>Order #${purchase._id}</h3>
                        <span class="status-badge" style="background-color: ${statusColors[purchase.status]}">
                            ${purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                        </span>
                    </div>
                    <div class="purchase-details">
                        <div class="customer-info">
                            <p><strong>Customer:</strong> ${purchase.customer.name}</p>
                            <p><strong>Email:</strong> ${purchase.customer.email}</p>
                        </div>
                        <div class="book-info">
                            <p><strong>Book:</strong> ${purchase.book.title}</p>
                            <p><strong>Quantity:</strong> ${purchase.quantity}</p>
                            <p><strong>Total Amount:</strong> $${purchase.totalAmount.toFixed(2)}</p>
                        </div>
                        <div class="purchase-actions">
                            <select class="status-select" data-purchase-id="${purchase._id}">
                                <option value="pending" ${purchase.status === 'pending' ? 'selected' : ''}>Pending</option>
                                <option value="completed" ${purchase.status === 'completed' ? 'selected' : ''}>Completed</option>
                                <option value="cancelled" ${purchase.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                            </select>
                        </div>
                    </div>
                `;
                purchasesList.appendChild(purchaseDiv);
            });
        }
    } catch (error) {
        console.error('Error loading purchases:', error);
        alert('Error loading purchases. Please try again.');
    }
}


