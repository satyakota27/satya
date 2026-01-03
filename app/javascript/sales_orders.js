function initSalesOrders() {
  // Sales submenu toggle
  initSalesSubmenu();

  // Sales order form functionality
  if (document.getElementById('sales-order-form')) {
    initSalesOrderForm();
  }

  // Document upload
  initDocumentUpload();
}

function initSalesSubmenu() {
  const salesSubmenuToggle = document.querySelector('.sales-submenu-toggle');
  const salesSubmenu = document.getElementById('sales-submenu');

  if (salesSubmenuToggle && salesSubmenu) {
    salesSubmenuToggle.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      salesSubmenu.classList.toggle('hidden');
      
      const icon = salesSubmenuToggle.querySelector('svg');
      if (icon) {
        icon.classList.toggle('rotate-180');
      }
    });
  }
}

function initSalesOrderForm() {
  const salesOrderForm = document.getElementById('sales-order-form');
  if (!salesOrderForm || salesOrderForm.dataset.initialized === 'true') {
    return;
  }
  salesOrderForm.dataset.initialized = 'true';

  // Calculate initial line item index based on existing rows
  let lineItemIndex = 0;
  const existingRows = document.querySelectorAll('.line-item-row');
  existingRows.forEach(function(row) {
    const indexAttr = row.getAttribute('data-index');
    if (indexAttr) {
      const index = parseInt(indexAttr, 10);
      if (index >= lineItemIndex) {
        lineItemIndex = index + 1;
      }
    }
    // Also check input names for index
    const materialIdInput = row.querySelector('input[name*="[material_id]"]');
    if (materialIdInput && materialIdInput.name) {
      const match = materialIdInput.name.match(/line_items\]\[(\d+)\]/);
      if (match) {
        const index = parseInt(match[1], 10);
        if (index >= lineItemIndex) {
          lineItemIndex = index + 1;
        }
      }
    }
  });

  // Add line item
  const addLineItemButton = document.getElementById('add-line-item');
  const lineItemsTbody = document.getElementById('line-items-tbody');
  const noItemsMessage = document.getElementById('no-items-message');

  if (addLineItemButton && lineItemsTbody) {
    addLineItemButton.addEventListener('click', function() {
      if (noItemsMessage) {
        noItemsMessage.remove();
      }
      
      const newRow = createLineItemRow(lineItemIndex);
      lineItemsTbody.appendChild(newRow);
      lineItemIndex++;
      
      // Initialize material search for the new row
      initMaterialSearch(newRow);
    });
  }

  // Remove line item
  document.addEventListener('click', function(e) {
    if (e.target.closest('.remove-line-item')) {
      const row = e.target.closest('.line-item-row');
      if (row) {
        row.remove();
        updateOrderTotals();
        
        // Show no items message if no rows left
        if (lineItemsTbody.querySelectorAll('.line-item-row').length === 0) {
          const noItems = document.createElement('tr');
          noItems.id = 'no-items-message';
          noItems.innerHTML = '<td colspan="8" class="px-4 py-8 text-center text-sm text-gray-500">No line items. Click "Add Line Item" to add materials.</td>';
          lineItemsTbody.appendChild(noItems);
        }
      }
    }
  });

  // Initialize material search for existing rows
  document.querySelectorAll('.line-item-row').forEach(function(row) {
    initMaterialSearch(row);
  });

  // Calculate totals on input change
  document.addEventListener('input', function(e) {
    if (e.target.matches('.line-item-quantity, .line-item-unit-price, .line-item-discount, .line-item-tax')) {
      calculateLineItemTotal(e.target.closest('.line-item-row'));
      updateOrderTotals();
    }
  });
}

function createLineItemRow(index) {
  const row = document.createElement('tr');
  row.className = 'line-item-row';
  row.setAttribute('data-index', index);
  
  row.innerHTML = `
    <td class="px-4 py-3">
      <input type="text" 
             class="material-search shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md" 
             placeholder="Search material..."
             data-index="${index}"
             autocomplete="off">
      <input type="hidden" name="sales_order[line_items][${index}][material_id]" class="material-id">
      <div class="material-description text-xs text-gray-500 mt-1"></div>
    </td>
    <td class="px-4 py-3">
      <input type="number" 
             name="sales_order[line_items][${index}][quantity]" 
             class="line-item-quantity shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md" 
             min="1"
             step="1"
             required>
    </td>
    <td class="px-4 py-3">
      <input type="number" 
             name="sales_order[line_items][${index}][unit_price]" 
             class="line-item-unit-price shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md" 
             min="0"
             step="0.01"
             required>
    </td>
    <td class="px-4 py-3">
      <input type="number" 
             name="sales_order[line_items][${index}][discount_percentage]" 
             class="line-item-discount shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md" 
             min="0"
             max="100"
             step="0.01"
             value="0">
    </td>
    <td class="px-4 py-3">
      <input type="number" 
             name="sales_order[line_items][${index}][tax_percentage]" 
             class="line-item-tax shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md" 
             min="0"
             step="0.01"
             value="0">
    </td>
    <td class="px-4 py-3">
      <input type="date" 
             name="sales_order[line_items][${index}][dispatch_date]" 
             class="line-item-dispatch-date shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md" 
             required>
    </td>
    <td class="px-4 py-3">
      <span class="line-item-total text-sm font-medium text-gray-900">₹0.00</span>
    </td>
    <td class="px-4 py-3">
      <button type="button" class="remove-line-item text-red-600 hover:text-red-900">
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </td>
  `;
  
  return row;
}

function initMaterialSearch(row) {
  const searchInput = row.querySelector('.material-search');
  const materialIdInput = row.querySelector('.material-id');
  const materialDescription = row.querySelector('.material-description');
  
  if (!searchInput) return;

  // Store dropdown reference on the row element to avoid scope issues
  let searchTimeout;
  const parentContainer = searchInput.parentElement;
  
  // Ensure parent has relative positioning for dropdown
  if (parentContainer.style.position !== 'relative') {
    parentContainer.style.position = 'relative';
  }

  searchInput.addEventListener('input', function() {
    const query = this.value.trim();
    
    clearTimeout(searchTimeout);
    
    // Remove existing dropdown
    const existingDropdown = parentContainer.querySelector('.material-dropdown');
    if (existingDropdown) {
      existingDropdown.remove();
    }
    
    if (query.length < 2) {
      return;
    }

    searchTimeout = setTimeout(function() {
      fetch(`/sales-orders/search_materials?q=${encodeURIComponent(query)}`, {
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      })
      .then(response => response.json())
      .then(data => {
        // Remove any existing dropdown
        const existingDropdown = parentContainer.querySelector('.material-dropdown');
        if (existingDropdown) {
          existingDropdown.remove();
        }
        
        if (data.materials && data.materials.length > 0) {
          const dropdown = createMaterialDropdown(data.materials, searchInput, materialIdInput, materialDescription);
          parentContainer.appendChild(dropdown);
        }
      })
      .catch(error => {
        console.error('Error searching materials:', error);
      });
    }, 300);
  });

  // Close dropdown when clicking outside - use event delegation on the row
  row.addEventListener('click', function(e) {
    const dropdown = parentContainer.querySelector('.material-dropdown');
    if (dropdown && !dropdown.contains(e.target) && e.target !== searchInput) {
      dropdown.remove();
    }
  });
}

function createMaterialDropdown(materials, searchInput, materialIdInput, materialDescription) {
  const dropdown = document.createElement('div');
  dropdown.className = 'material-dropdown absolute z-50 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto';
  dropdown.style.position = 'absolute';
  dropdown.style.top = '100%';
  dropdown.style.left = '0';
  dropdown.style.width = '100%';
  dropdown.style.zIndex = '9999';
  dropdown.style.minWidth = searchInput.offsetWidth + 'px';

  materials.forEach(function(material) {
    const item = document.createElement('div');
    item.className = 'cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50';
    item.innerHTML = `
      <div class="font-medium text-gray-900">${material.material_code || ''}</div>
      <div class="text-sm text-gray-500">${material.description || ''}</div>
    `;
    
    item.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      searchInput.value = material.material_code || '';
      if (materialIdInput) {
        materialIdInput.value = material.id || '';
      }
      if (materialDescription) {
        materialDescription.textContent = material.description || '';
      }
      dropdown.remove();
    });
    
    dropdown.appendChild(item);
  });

  return dropdown;
}

function calculateLineItemTotal(row) {
  const quantity = parseFloat(row.querySelector('.line-item-quantity').value) || 0;
  const unitPrice = parseFloat(row.querySelector('.line-item-unit-price').value) || 0;
  const discountPercent = parseFloat(row.querySelector('.line-item-discount').value) || 0;
  const taxPercent = parseFloat(row.querySelector('.line-item-tax').value) || 0;
  
  const baseAmount = quantity * unitPrice;
  const discountAmount = (baseAmount * discountPercent / 100);
  const amountAfterDiscount = baseAmount - discountAmount;
  const taxAmount = (amountAfterDiscount * taxPercent / 100);
  const lineTotal = amountAfterDiscount + taxAmount;
  
  const totalSpan = row.querySelector('.line-item-total');
  if (totalSpan) {
    totalSpan.textContent = formatCurrency(lineTotal);
  }
}

function updateOrderTotals() {
  const rows = document.querySelectorAll('.line-item-row');
  let subtotal = 0;
  
  rows.forEach(function(row) {
    const totalText = row.querySelector('.line-item-total').textContent;
    const totalValue = parseFloat(totalText.replace(/[₹,]/g, '')) || 0;
    subtotal += totalValue;
  });
  
  const subtotalElement = document.getElementById('order-subtotal');
  const totalElement = document.getElementById('order-total');
  
  if (subtotalElement) {
    subtotalElement.textContent = formatCurrency(subtotal);
  }
  
  if (totalElement) {
    // For now, total = subtotal (discount and tax at order level can be added later)
    totalElement.textContent = formatCurrency(subtotal);
  }
}

function formatCurrency(amount) {
  return '₹' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function initDocumentUpload() {
  const documentUpload = document.getElementById('document-upload');
  
  if (documentUpload) {
    const salesOrderId = documentUpload.dataset.salesOrderId;
    const uploadedDocuments = document.getElementById('uploaded-documents');
    
    if (!salesOrderId) {
      console.warn('Document upload requires a sales order ID');
      return;
    }
    
    documentUpload.addEventListener('change', function(e) {
      const files = Array.from(e.target.files);
      
      files.forEach(function(file) {
        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name} is too large. Maximum file size is 5MB.`);
          return;
        }
        
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          alert(`${file.name} must be a PDF or image file.`);
          return;
        }
        
        // Show loading state
        const loadingItem = document.createElement('div');
        loadingItem.className = 'flex items-center justify-between text-sm p-2 bg-gray-50 rounded';
        loadingItem.innerHTML = `
          <span class="text-gray-700">${file.name}</span>
          <span class="text-gray-500">Uploading...</span>
        `;
        if (uploadedDocuments) {
          uploadedDocuments.appendChild(loadingItem);
        }
        
        const formData = new FormData();
        formData.append('document', file);
        
        const url = `/sales-orders/${salesOrderId}/upload_document`;
        
        fetch(url, {
          method: 'POST',
          body: formData,
          headers: {
            'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
          }
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            // Remove loading item
            loadingItem.remove();
            
            // Add the uploaded document
            if (uploadedDocuments) {
              const docItem = document.createElement('div');
              docItem.className = 'flex items-center justify-between text-sm p-2 bg-gray-50 rounded';
              docItem.innerHTML = `
                <span class="text-gray-700">
                  <a href="${data.document.url}" class="text-indigo-600 hover:text-indigo-900" target="_blank">${data.document.filename}</a>
                </span>
                <div class="flex items-center gap-2">
                  <span class="text-gray-500">${formatFileSize(data.document.size)}</span>
                  <a href="/sales-orders/${salesOrderId}/remove_document?document_id=${data.document.id}" 
                     data-method="delete" 
                     data-confirm="Are you sure you want to remove this document?"
                     class="text-red-600 hover:text-red-900 remove-document">
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </a>
                </div>
              `;
              uploadedDocuments.appendChild(docItem);
            }
          } else {
            loadingItem.remove();
            alert(data.error || 'Failed to upload document');
          }
        })
        .catch(error => {
          console.error('Error uploading document:', error);
          loadingItem.remove();
          alert('Failed to upload document');
        });
      });
      
      // Reset input
      e.target.value = '';
    });
    
    // Handle document removal
    if (uploadedDocuments) {
      uploadedDocuments.addEventListener('click', function(e) {
        if (e.target.closest('.remove-document')) {
          e.preventDefault();
          const link = e.target.closest('.remove-document');
          if (confirm('Are you sure you want to remove this document?')) {
            fetch(link.href, {
              method: 'DELETE',
              headers: {
                'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
              }
            })
            .then(response => {
              if (response.ok) {
                link.closest('div').remove();
              } else {
                alert('Failed to remove document');
              }
            })
            .catch(error => {
              console.error('Error removing document:', error);
              alert('Failed to remove document');
            });
          }
        }
      });
    }
  }
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default initSalesOrders;

