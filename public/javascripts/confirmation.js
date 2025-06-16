       
       const urlParams = new URLSearchParams(window.location.search);
       
       const purchaseId = window.location.pathname.split('/')[2];

       async function loadPurchaseDetails() {
           try {
               const response = await fetch(`/confirmation/${purchaseId}/data`);
               const purchase = await response.json();

               if (purchase) {
                   // Format dates
                   const orderDate = new Date(purchase.purchaseDate).toLocaleDateString('en-US', {
                       year: 'numeric',
                       month: 'long',
                       day: 'numeric',
                       hour: '2-digit',
                       minute: '2-digit'
                   });

                   const rawDeliveryDate = new Date(purchase.createdAt);
                   rawDeliveryDate.setDate(rawDeliveryDate.getDate() + 5);

                   const deliveryDate = rawDeliveryDate.toLocaleDateString('en-US', {
                       year: 'numeric',
                       month: 'long',
                       day: 'numeric',
                       hour: '2-digit',
                       minute: '2-digit'
                   });

                   // Update DOM with purchase details
                   document.getElementById('orderId').textContent = purchase._id;
                   document.getElementById('orderDate').textContent = orderDate;                   
                   document.getElementById('deliveryDate').textContent = deliveryDate;
                   document.getElementById('customerName').textContent = purchase.customer.name;
                   document.getElementById('customerEmail').textContent = purchase.customer.email;
                   document.getElementById('bookName').textContent = purchase.book.title;
                   document.getElementById('bookQuantity').textContent = purchase.quantity;
                   document.getElementById('unitPrice').textContent = `$${(purchase.totalAmount / purchase.quantity).toFixed(2)}`;
                   document.getElementById('totalAmount').textContent = `$${purchase.totalAmount.toFixed(2)}`;
               }
           } catch (error) {
               console.error('Error loading purchase details:', error);
               alert('Error loading purchase details. Please contact support.');
           }
       }

       // Load purchase details when page loads
       loadPurchaseDetails();