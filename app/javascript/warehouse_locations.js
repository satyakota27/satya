// Handle form submission via AJAX - use event delegation (set up once, outside init function)
let formSubmitHandlerAttached = false;

function attachFormSubmitHandler() {
  if (formSubmitHandlerAttached) return;
  formSubmitHandlerAttached = true;
  
  document.addEventListener('submit', function(e) {
    const form = e.target;
    if (form.closest('.child-form-container')) {
      e.preventDefault();
      
      const formData = new FormData(form);
      const submitBtn = form.querySelector('input[type="submit"]');
      const originalText = submitBtn ? submitBtn.value : 'Add Location';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.value = 'Adding...';
      }
      
      fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content,
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          return response.json().then(data => {
            throw new Error(data.errors ? data.errors.join(', ') : 'Failed to create location');
          });
        }
      })
      .then(data => {
        if (data.success) {
          // Reload the page to show the new location
          window.location.reload();
        } else {
          throw new Error(data.errors ? data.errors.join(', ') : 'Failed to create location');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Failed to create location: ' + error.message);
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.value = originalText;
        }
      });
    }
  });
}

function initWarehouseLocations() {
  // Attach form submit handler (only once)
  attachFormSubmitHandler();
  
  // Tree view expand/collapse functionality
  const treeNodes = document.querySelectorAll('#warehouse-locations-tree li');
  
  treeNodes.forEach(node => {
    const expandIcon = node.querySelector('span.text-gray-400');
    if (expandIcon && expandIcon.textContent === '▼') {
      expandIcon.style.cursor = 'pointer';
      expandIcon.addEventListener('click', function(e) {
        e.stopPropagation();
        const children = node.querySelector('ul');
        if (children) {
          if (children.style.display === 'none') {
            children.style.display = 'block';
            this.textContent = '▼';
          } else {
            children.style.display = 'none';
            this.textContent = '▶';
          }
        }
      });
    }
  });
  
  // Handle "Add Child" button clicks - use event delegation
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('add-child-btn') || e.target.closest('.add-child-btn')) {
      e.preventDefault();
      e.stopPropagation();
      
      const btn = e.target.classList.contains('add-child-btn') ? e.target : e.target.closest('.add-child-btn');
      const parentId = btn.getAttribute('data-parent-id');
      const formContainer = document.getElementById(`child-form-${parentId}`);
      
      if (formContainer) {
        // Hide all other forms first
        document.querySelectorAll('.child-form-container').forEach(form => {
          form.classList.add('hidden');
        });
        
        // Show this form
        formContainer.classList.remove('hidden');
        formContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Focus on first input
        const firstInput = formContainer.querySelector('input, select');
        if (firstInput) {
          setTimeout(() => firstInput.focus(), 100);
        }
      }
    }
  });
  
  // Handle "Cancel" button clicks - use event delegation
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('cancel-child-form') || e.target.closest('.cancel-child-form')) {
      e.preventDefault();
      const btn = e.target.classList.contains('cancel-child-form') ? e.target : e.target.closest('.cancel-child-form');
      const formId = btn.getAttribute('data-form-id');
      const formContainer = document.getElementById(formId);
      if (formContainer) {
        formContainer.classList.add('hidden');
        // Reset form
        const form = formContainer.querySelector('form');
        if (form) {
          form.reset();
        }
      }
    }
  });
}

export default initWarehouseLocations;

