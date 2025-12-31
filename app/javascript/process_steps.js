function initProcessSteps() {
  // Initialize quality tests management for process steps form
  initProcessStepQualityTests();
  
  // File upload functionality
  initProcessStepFileUpload();
  
  // Initialize remove document handlers for server-rendered buttons
  initProcessStepRemoveDocumentHandlers();
  
  // Add form submit handler to verify quality test IDs are being submitted
  const processStepForm = document.querySelector('form[action*="process_steps"]');
  if (processStepForm) {
    processStepForm.addEventListener('submit', function(e) {
      // Ensure all added quality tests have their hidden inputs properly named
      const addedRows = document.querySelectorAll('#quality-tests-list .quality-test-row.quality-test-added');
      
      addedRows.forEach((row, index) => {
        const hiddenInput = row.querySelector('.quality-test-id');
        if (hiddenInput && hiddenInput.value) {
          if (!hiddenInput.name || hiddenInput.name !== 'process_step[quality_test_ids][]') {
            hiddenInput.name = 'process_step[quality_test_ids][]';
          }
        }
      });
    });
  }
}

function initProcessStepQualityTests() {
  const addTestBtn = document.getElementById('add-quality-test');
  const testsList = document.getElementById('quality-tests-list');
  
  if (!addTestBtn || !testsList) return;
  
  // Prevent duplicate initialization
  if (addTestBtn.dataset.processStepQualityTestsInitialized === 'true') {
    return;
  }
  addTestBtn.dataset.processStepQualityTestsInitialized = 'true';
  
  // Use a shared counter that persists across calls
  if (!window.processStepQualityTestCounter) {
    window.processStepQualityTestCounter = 0;
  }
  
  // Count existing test rows to continue numbering
  const existingRows = testsList.querySelectorAll('.quality-test-row');
  if (existingRows.length > 0) {
    window.processStepQualityTestCounter = existingRows.length;
  }
  
  // Only attach event listener once
  if (!addTestBtn.dataset.clickListenerAttached) {
    addTestBtn.dataset.clickListenerAttached = 'true';
    addTestBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      // Prevent duplicate clicks
      if (addTestBtn.dataset.processing === 'true') {
        return;
      }
      addTestBtn.dataset.processing = 'true';
      
      window.processStepQualityTestCounter++;
      const testRow = createProcessStepQualityTestRow(window.processStepQualityTestCounter);
      testRow.dataset.initialized = 'true';
      testsList.appendChild(testRow);
      initProcessStepQualityTestRow(testRow);
      
      // Focus on the search input for better UX
      const searchInput = testRow.querySelector('.quality-test-search');
      if (searchInput) {
        searchInput.focus();
      }
      
      // Reset processing flag after a short delay
      setTimeout(() => {
        addTestBtn.dataset.processing = 'false';
      }, 100);
    });
  }
  
  // Initialize existing rows (only those that aren't already initialized)
  const existingTestRows = testsList.querySelectorAll('.quality-test-row');
  existingTestRows.forEach(row => {
    if (!row.dataset.initialized) {
      row.dataset.initialized = 'true';
      
      // If it's an existing row from the server, mark it as added and set up Edit/Remove buttons
      if (row.dataset.added === 'true' || row.querySelector('.quality-test-id')?.value) {
        const testSearch = row.querySelector('.quality-test-search');
        const hiddenInput = row.querySelector('.quality-test-id');
        
        if (testSearch && hiddenInput && hiddenInput.value) {
          row.classList.add('quality-test-added');
          testSearch.setAttribute('readonly', 'readonly');
          testSearch.classList.add('bg-gray-100', 'text-gray-600');
          
          // Replace any existing buttons with Edit/Remove
          const buttonContainer = row.querySelector('.flex-shrink-0');
          if (buttonContainer) {
            buttonContainer.innerHTML = `
              <div class="flex gap-2">
                <button type="button" class="edit-quality-test w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 border border-indigo-300 shadow-sm text-sm font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100">
                  Edit
                </button>
                <button type="button" class="remove-quality-test w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100">
                  Remove
                </button>
              </div>
            `;
          }
        }
      }
      
      initProcessStepQualityTestRow(row);
    }
  });
  
  function createProcessStepQualityTestRow(counter) {
    const row = document.createElement('div');
    row.className = 'quality-test-row flex flex-col sm:flex-row gap-4 items-stretch sm:items-end p-4 bg-gray-50 rounded-md';
    row.dataset.testIndex = counter;
    row.innerHTML = `
      <div class="flex-1 min-w-0">
        <label class="block text-sm font-medium text-gray-700 mb-1">Quality test description/code</label>
        <input type="text" 
               class="quality-test-search shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md" 
               placeholder="Search approved quality tests by code or description..."
               autocomplete="off" />
        <input type="hidden" class="quality-test-id" />
      </div>
      <div class="flex-shrink-0">
        <button type="button" class="add-quality-test-btn w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
          Add
        </button>
      </div>
    `;
    return row;
  }
  
  // Function to add a quality test (marks it as added)
  function addProcessStepQualityTest(row) {
    const testSearch = row.querySelector('.quality-test-search');
    const hiddenInput = row.querySelector('.quality-test-id');
    
    // Validate that quality test is selected
    if (!hiddenInput.value) {
      alert('Please select a quality test before adding.');
      return;
    }
    
    // Check if this test is already added in another row
    const allRows = document.querySelectorAll('#quality-tests-list .quality-test-row.quality-test-added');
    for (let otherRow of allRows) {
      if (otherRow === row) continue;
      const otherHiddenInput = otherRow.querySelector('.quality-test-id');
      if (otherHiddenInput && otherHiddenInput.value === hiddenInput.value) {
        alert('This quality test has already been added.');
        return;
      }
    }
    
    // Mark as added
    row.classList.add('quality-test-added');
    
    // Grey out input
    testSearch.classList.add('bg-gray-100', 'text-gray-600');
    testSearch.setAttribute('readonly', 'readonly');
    
    // Replace Add button with Edit and Remove buttons
    const buttonContainer = row.querySelector('.flex-shrink-0');
    buttonContainer.innerHTML = `
      <div class="flex gap-2">
        <button type="button" class="edit-quality-test w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 border border-indigo-300 shadow-sm text-sm font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100">
          Edit
        </button>
        <button type="button" class="remove-quality-test w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100">
          Remove
        </button>
      </div>
    `;
    
    // Add event handlers
    buttonContainer.querySelector('.edit-quality-test').addEventListener('click', function() {
      editProcessStepQualityTest(row);
    });
    buttonContainer.querySelector('.remove-quality-test').addEventListener('click', function() {
      removeProcessStepQualityTest(row);
    });
    
    // Ensure hidden input is included in form submission
    if (hiddenInput) {
      hiddenInput.name = 'process_step[quality_test_ids][]';
    }
  }

  // Function to edit a quality test
  function editProcessStepQualityTest(row) {
    const testSearch = row.querySelector('.quality-test-search');
    const hiddenInput = row.querySelector('.quality-test-id');
    
    // Remove added state
    row.classList.remove('quality-test-added');
    
    // Enable input
    testSearch.classList.remove('bg-gray-100', 'text-gray-600');
    testSearch.removeAttribute('readonly');
    
    // Replace Edit and Remove buttons with Add button
    const buttonContainer = row.querySelector('.flex-shrink-0');
    buttonContainer.innerHTML = `
      <button type="button" class="add-quality-test-btn w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
        Add
      </button>
    `;
    
    // Add event handler
    buttonContainer.querySelector('.add-quality-test-btn').addEventListener('click', function() {
      addProcessStepQualityTest(row);
    });
    
    // Re-initialize autocomplete - clone the input to remove old event listeners
    const currentValue = testSearch.value;
    const currentTestId = hiddenInput ? hiddenInput.value : '';
    const currentName = hiddenInput ? hiddenInput.name : '';
    const newInput = testSearch.cloneNode(true);
    newInput.value = currentValue;
    newInput.removeAttribute('data-autocomplete-initialized'); // Reset initialization flag
    testSearch.parentNode.replaceChild(newInput, testSearch);
    
    // Restore the test ID and name if it was set
    const newHiddenInput = row.querySelector('.quality-test-id');
    if (currentTestId && newHiddenInput) {
      newHiddenInput.value = currentTestId;
      // Keep the name attribute when editing so the value is still submitted if user doesn't change it
      newHiddenInput.name = 'process_step[quality_test_ids][]';
    }
    
    // Initialize autocomplete for the new input
    initProcessStepQualityTestAutocomplete(newInput, row);
    
    // Focus on the search input for better UX
    newInput.focus();
  }

  // Function to remove a quality test
  function removeProcessStepQualityTest(row) {
    if (confirm('Are you sure you want to remove this quality test?')) {
      row.remove();
    }
  }

  function initProcessStepQualityTestRow(row) {
    const testSearch = row.querySelector('.quality-test-search');
    const hiddenInput = row.querySelector('.quality-test-id');
    const addBtn = row.querySelector('.add-quality-test-btn');
    
    // Initialize quality test search autocomplete
    if (testSearch && !testSearch.dataset.autocompleteInitialized) {
      initProcessStepQualityTestAutocomplete(testSearch, row);
      testSearch.dataset.autocompleteInitialized = 'true';
    }
    
    // Handle add button
    if (addBtn) {
      addBtn.addEventListener('click', function() {
        addProcessStepQualityTest(row);
      });
    }
  }
  
  // Handle Edit and Remove buttons for existing tests (delegated event listeners)
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('edit-quality-test') && e.target.closest('#quality-tests-list')) {
      const row = e.target.closest('.quality-test-row');
      if (row) {
        editProcessStepQualityTest(row);
      }
    } else if (e.target.classList.contains('remove-quality-test') && e.target.closest('#quality-tests-list')) {
      const row = e.target.closest('.quality-test-row');
      if (row) {
        removeProcessStepQualityTest(row);
      }
    }
  });
  
  function initProcessStepQualityTestAutocomplete(searchInput, row) {
    let dropdown = null;
    let timeout = null;
    const hiddenInput = row.querySelector('.quality-test-id');
    
    searchInput.addEventListener('input', function() {
      // Don't search if the row is already added
      if (row.classList.contains('quality-test-added')) return;
      
      const query = this.value.trim();
      
      clearTimeout(timeout);
      
      if (query.length < 2) {
        if (dropdown) dropdown.remove();
        dropdown = null;
        if (hiddenInput) hiddenInput.value = '';
        return;
      }
      
      timeout = setTimeout(function() {
        fetch(`/materials/quality_tests/search.json?q=${encodeURIComponent(query)}`, {
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          }
        })
        .then(response => response.json())
        .then(data => {
          if (dropdown) dropdown.remove();
          
          // Get list of already added test IDs to filter them out
          const addedTestIds = [];
          const allRows = document.querySelectorAll('#quality-tests-list .quality-test-row.quality-test-added');
          allRows.forEach(addedRow => {
            const addedHiddenInput = addedRow.querySelector('.quality-test-id');
            if (addedHiddenInput && addedHiddenInput.value) {
              addedTestIds.push(addedHiddenInput.value);
            }
          });
          
          if (data.quality_tests && data.quality_tests.length > 0) {
            dropdown = document.createElement('div');
            dropdown.className = 'absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm';
            dropdown.style.position = 'absolute';
            dropdown.style.top = '100%';
            dropdown.style.left = '0';
            dropdown.style.width = '100%';
            
            data.quality_tests.forEach(test => {
              // Skip if this test is already added
              if (addedTestIds.includes(test.id.toString())) {
                return;
              }
              
              const item = document.createElement('div');
              item.className = 'cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50';
              item.innerHTML = `
                <div class="flex flex-col">
                  <span class="font-medium text-gray-900">${test.test_number}</span>
                  <span class="text-sm text-gray-500">${test.description}</span>
                </div>
              `;
              item.addEventListener('click', function() {
                searchInput.value = `${test.test_number} - ${test.description}`;
                if (hiddenInput) {
                  hiddenInput.value = test.id;
                  // Set the name attribute immediately when a test is selected
                  hiddenInput.name = 'process_step[quality_test_ids][]';
                }
                dropdown.remove();
                dropdown = null;
              });
              dropdown.appendChild(item);
            });
            
            if (dropdown.children.length > 0) {
              searchInput.parentElement.style.position = 'relative';
              searchInput.parentElement.appendChild(dropdown);
            } else {
              dropdown = null;
            }
          } else {
            dropdown = null;
          }
        })
        .catch(error => {
          console.error('Error searching quality tests:', error);
          if (dropdown) dropdown.remove();
          dropdown = null;
        });
      }, 300);
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
      if (dropdown && !searchInput.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.remove();
        dropdown = null;
      }
    });
  }
}

function initProcessStepFileUpload() {
  const fileInput = document.getElementById('process-step-file-input');
  const uploadedDocuments = document.getElementById('uploaded-documents');
  const tempIdField = document.getElementById('process-step-temp-id');
  
  if (!fileInput) return;
  
  // Prevent duplicate initialization
  if (fileInput.dataset.initialized === 'true') return;
  fileInput.dataset.initialized = 'true';

  // Get process step ID from form or URL
  const getProcessStepId = () => {
    const form = fileInput.closest('form');
    if (form) {
      const idField = form.querySelector('input[name="process_step[id]"]');
      if (idField && idField.value) {
        return idField.value;
      }
    }
    // Try to get from URL if editing
    const match = window.location.pathname.match(/process-steps\/(\d+)/);
    return match ? match[1] : null;
  };
  
  // Prevent form from submitting documents that were already uploaded via AJAX
  const form = fileInput.closest('form');
  if (form) {
    form.addEventListener('submit', function(e) {
      // For edit forms, always clear the documents field to prevent replacing existing documents
      const processStepId = getProcessStepId();
      if (processStepId) {
        fileInput.value = '';
      } else {
        // For new forms, if documents were uploaded via AJAX (temp_id exists), clear the file input
        // since documents are already attached to the temporary process step
        if (tempIdField && tempIdField.value) {
          fileInput.value = '';
        }
      }
    });
  }

  fileInput.addEventListener('change', function() {
    const files = Array.from(this.files);
    if (files.length === 0) return;
    
    const processStepId = getProcessStepId();
    
    files.forEach(file => {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large. Maximum file size is 5MB.`);
        return;
      }
      
      // Check file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert(`${file.name} must be a PDF or image file.`);
        return;
      }
      
      const formData = new FormData();
      formData.append('document', file);
      
      if (processStepId) {
        // Editing existing process step - upload to it
        formData.append('id', processStepId);
        
        fetch(`/process-steps/${processStepId}/upload_document`, {
          method: 'POST',
          headers: {
            'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content,
            'Accept': 'application/json'
          },
          body: formData
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            // Add to uploaded documents list
            if (uploadedDocuments) {
              const li = document.createElement('li');
              li.className = 'flex items-center justify-between p-2 bg-green-50 rounded-md border border-green-200';
              li.dataset.documentId = data.document.id;
              li.innerHTML = `
                <div class="flex items-center space-x-2">
                  <svg class="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <a href="${data.document.url}" class="text-indigo-600 hover:text-indigo-800 text-sm">${data.document.filename}</a>
                  <span class="text-xs text-gray-500">(${formatFileSize(data.document.size)})</span>
                </div>
                <button type="button" class="remove-document-server text-red-600 hover:text-red-800 text-sm font-medium bg-transparent border-0 p-0 cursor-pointer" data-document-id="${data.document.id}">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              `;
              uploadedDocuments.appendChild(li);
              
              // Show uploaded documents section
              const uploadedSection = document.getElementById('uploaded-documents-section');
              if (uploadedSection) {
                uploadedSection.classList.remove('hidden');
              }
              
              // Initialize remove handler for new document
              initProcessStepRemoveDocumentHandlers();
            }
          } else {
            alert(data.error || 'Failed to upload document');
          }
        })
        .catch(error => {
          console.error('Error uploading document:', error);
          alert('Failed to upload document. Please try again.');
        });
      } else {
        // New process step - upload to temporary process step
        if (tempIdField && tempIdField.value) {
          formData.append('temp_id', tempIdField.value);
        }
        
        fetch('/process-steps/upload_document_new', {
          method: 'POST',
          headers: {
            'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content,
            'Accept': 'application/json'
          },
          body: formData
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            // Store temp_id if we got one
            if (data.process_step_id && tempIdField) {
              tempIdField.value = data.process_step_id;
            }
          } else {
            alert(data.error || 'Failed to upload document');
          }
        })
        .catch(error => {
          console.error('Error uploading document:', error);
          alert('Failed to upload document. Please try again.');
        });
      }
    });
    
    // Clear file input
    this.value = '';
  });
}

function initProcessStepRemoveDocumentHandlers() {
  const uploadedDocuments = document.getElementById('uploaded-documents');
  if (!uploadedDocuments) return;
  
  // Remove existing listeners by cloning and replacing
  const newUploadedDocuments = uploadedDocuments.cloneNode(true);
  uploadedDocuments.parentNode.replaceChild(newUploadedDocuments, uploadedDocuments);
  
  // Get process step ID from form or URL
  const getProcessStepId = () => {
    const form = newUploadedDocuments.closest('form');
    if (form) {
      const idField = form.querySelector('input[name="process_step[id]"]');
      if (idField && idField.value) {
        return idField.value;
      }
    }
    const match = window.location.pathname.match(/process-steps\/(\d+)/);
    return match ? match[1] : null;
  };
  
  const removeButtons = newUploadedDocuments.querySelectorAll('.remove-document-server');
  removeButtons.forEach(button => {
    button.addEventListener('click', function() {
      const documentId = this.dataset.documentId;
      if (!documentId) return;
      
      const processStepId = getProcessStepId();
      if (!processStepId) return;
      
      if (!confirm('Are you sure you want to remove this document?')) {
        return;
      }
      
      fetch(`/process-steps/${processStepId}/remove_document?document_id=${documentId}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content,
          'Accept': 'application/json'
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Remove the document from the list
          const documentItem = this.closest('li');
          if (documentItem) {
            documentItem.remove();
          }
          
          // Hide uploaded documents section if no documents left
          const remainingDocuments = newUploadedDocuments.querySelectorAll('li');
          if (remainingDocuments.length === 0) {
            const uploadedSection = document.getElementById('uploaded-documents-section');
            if (uploadedSection) {
              uploadedSection.classList.add('hidden');
            }
          }
        } else {
          alert(data.error || 'Failed to remove document');
        }
      })
      .catch(error => {
        console.error('Error removing document:', error);
        alert('Failed to remove document. Please try again.');
      });
    });
  });
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export default initProcessSteps;

