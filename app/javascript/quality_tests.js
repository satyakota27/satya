function initQualityTests() {
  // Result Type Toggle
  const resultTypeRadios = document.querySelectorAll('.result-type-radio');
  const rangeFields = document.getElementById('range-fields');
  const absoluteFields = document.getElementById('absolute-fields');
  
  if (resultTypeRadios.length > 0 && rangeFields && absoluteFields) {
    resultTypeRadios.forEach(radio => {
      radio.addEventListener('change', function() {
        if (this.value === 'range') {
          rangeFields.classList.remove('hidden');
          absoluteFields.classList.add('hidden');
        } else if (this.value === 'absolute') {
          absoluteFields.classList.remove('hidden');
          rangeFields.classList.add('hidden');
        } else {
          rangeFields.classList.add('hidden');
          absoluteFields.classList.add('hidden');
        }
      });
    });
    
    // Set initial state
    const checkedRadio = Array.from(resultTypeRadios).find(r => r.checked);
    if (checkedRadio) {
      checkedRadio.dispatchEvent(new Event('change'));
    }
  }

  // File upload functionality
  initFileUpload();
  
  // Initialize remove document handlers for server-rendered buttons
  initRemoveDocumentHandlers();
}

function initRemoveDocumentHandlers() {
  const uploadedDocuments = document.getElementById('uploaded-documents');
  if (!uploadedDocuments) return;
  
  // Attach handlers to existing server-rendered remove buttons
  const removeButtons = uploadedDocuments.querySelectorAll('.remove-document-server, .remove-document');
  removeButtons.forEach(button => {
    // Only attach if not already attached
    if (!button.dataset.handlerAttached) {
      button.dataset.handlerAttached = 'true';
      button.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const documentId = this.dataset.documentId;
        const qualityTestId = getQualityTestIdFromForm();
        const itemElement = this.closest('li[data-document-id]');
        removeDocument(documentId, itemElement, qualityTestId);
      });
    }
  });
}

function getQualityTestIdFromForm() {
  const form = document.querySelector('form[action*="quality-tests"]');
  if (form) {
    const idField = form.querySelector('input[name="quality_test[id]"]');
    if (idField && idField.value) {
      return idField.value;
    }
  }
  // Try to get from URL if editing
  const match = window.location.pathname.match(/quality-tests\/(\d+)/);
  return match ? match[1] : null;
}

function initFileUpload() {
  const fileInput = document.getElementById('quality-test-file-input');
  const selectedFilesList = document.getElementById('selected-files-list');
  const selectedFiles = document.getElementById('selected-files');
  const uploadedDocuments = document.getElementById('uploaded-documents');
  const tempIdField = document.getElementById('quality-test-temp-id');
  
  if (!fileInput) return;
  
  // Prevent duplicate initialization
  if (fileInput.dataset.initialized === 'true') return;
  fileInput.dataset.initialized = 'true';

  // Get quality test ID from form or URL
  const getQualityTestId = () => {
    const form = fileInput.closest('form');
    if (form) {
      const idField = form.querySelector('input[name="quality_test[id]"]');
      if (idField && idField.value) {
        return idField.value;
      }
    }
    // Try to get from URL if editing
    const match = window.location.pathname.match(/quality-tests\/(\d+)/);
    return match ? match[1] : null;
  };
  
  // Prevent form from submitting documents that were already uploaded via AJAX
  const form = fileInput.closest('form');
  if (form) {
    form.addEventListener('submit', function(e) {
      // For edit forms, always clear the documents field to prevent replacing existing documents
      const qualityTestId = getQualityTestId();
      if (qualityTestId) {
        fileInput.value = '';
      } else {
        // For new forms, if documents were uploaded via AJAX (temp_id exists), clear the file input
        // since documents are already attached to the temporary quality test
        if (tempIdField && tempIdField.value) {
          fileInput.value = '';
        }
      }
    });
  }

  fileInput.addEventListener('change', function(e) {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    // Show selected files list
    selectedFilesList.classList.remove('hidden');
    selectedFiles.innerHTML = '';

    files.forEach((file, index) => {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large. Maximum size is 5MB.`);
        return;
      }

      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert(`${file.name} is not a valid file type. Please upload PDF or image files.`);
        return;
      }

      const fileItem = document.createElement('li');
      fileItem.className = 'flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-200';
      fileItem.dataset.fileIndex = index;
      
      const fileInfo = document.createElement('div');
      fileInfo.className = 'flex items-center space-x-2 flex-1';
      fileInfo.innerHTML = `
        <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span class="text-sm text-gray-900">${file.name}</span>
        <span class="text-xs text-gray-500">(${formatFileSize(file.size)})</span>
      `;
      
      const uploadButton = document.createElement('button');
      uploadButton.type = 'button';
      uploadButton.className = 'ml-2 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500';
      uploadButton.textContent = 'Upload';
      uploadButton.dataset.fileIndex = index;
      
      uploadButton.addEventListener('click', function() {
        uploadFile(file, fileItem, uploadButton);
      });
      
      fileItem.appendChild(fileInfo);
      fileItem.appendChild(uploadButton);
      selectedFiles.appendChild(fileItem);
    });
  });

  function uploadFile(file, fileItem, uploadButton) {
    const formData = new FormData();
    formData.append('document', file);
    
    uploadButton.disabled = true;
    uploadButton.textContent = 'Uploading...';
    uploadButton.classList.add('opacity-50', 'cursor-not-allowed');
    
    const qualityTestId = getQualityTestId();
    // Always get the latest temp_id value (it may have been updated by a previous upload)
    const tempId = tempIdField ? tempIdField.value : '';
    let url = qualityTestId 
      ? `/quality-tests/${qualityTestId}/upload_document`
      : '/quality-tests/upload_document_new';
    
    // Add temp_id to form data for new quality tests (if we have one)
    if (!qualityTestId && tempId) {
      formData.append('temp_id', tempId);
    }
    
    fetch(url, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content,
        'Accept': 'application/json'
      },
      body: formData
    })
    .then(async response => {
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      
      if (!response.ok) {
        // Try to parse as JSON first
        if (isJson) {
          try {
            const data = await response.json();
            throw new Error(data.error || `Upload failed with status ${response.status}`);
          } catch (parseError) {
            throw new Error(`Upload failed with status ${response.status}`);
          }
        } else {
          // If not JSON, try to get text and show it
          const text = await response.text();
          let errorMessage = `Upload failed (${response.status})`;
          
          // Try to extract error message from HTML if possible
          const errorMatch = text.match(/<title[^>]*>([^<]+)<\/title>/i) || 
                           text.match(/<h1[^>]*>([^<]+)<\/h1>/i) ||
                           text.match(/<p[^>]*>([^<]+)<\/p>/i);
          if (errorMatch && errorMatch[1]) {
            errorMessage = errorMatch[1].trim();
          } else if (text.length < 200) {
            // If text is short, it might be a plain error message
            errorMessage = text.trim();
          }
          
          throw new Error(errorMessage);
        }
      }
      
      // If not JSON, try to handle it
      if (!isJson) {
        const text = await response.text();
        throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}`);
      }
      
      return response.json();
    })
    .then(data => {
      if (data.success) {
        // Store temp ID if this is a new quality test - do this FIRST before other operations
        // This ensures subsequent uploads will use the same temp_id
        if (data.quality_test_id && tempIdField && !qualityTestId) {
          tempIdField.value = data.quality_test_id.toString();
        }
        
        // Remove from selected files
        fileItem.remove();
        
        // Check if document already exists in uploaded list (prevent duplicates)
        const existingDoc = uploadedDocuments.querySelector(`[data-document-id="${data.document.id}"]`);
        if (existingDoc) {
          // Document already exists, just remove from selected files
          if (selectedFiles.children.length === 0) {
            selectedFilesList.classList.add('hidden');
          }
          // Clear file input to prevent re-submission
          fileInput.value = '';
          return;
        }
        
        // Add to uploaded documents
        const uploadedSection = document.getElementById('uploaded-documents-section');
        if (uploadedSection && uploadedSection.classList.contains('hidden')) {
          uploadedSection.classList.remove('hidden');
        }
        
        const uploadedItem = document.createElement('li');
        uploadedItem.className = 'flex items-center justify-between p-2 bg-green-50 rounded-md border border-green-200';
        uploadedItem.dataset.documentId = data.document.id;
        uploadedItem.innerHTML = `
          <div class="flex items-center space-x-2">
            <svg class="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <a href="${data.document.url}" class="text-indigo-600 hover:text-indigo-800 text-sm">${data.document.filename}</a>
            <span class="text-xs text-gray-500">(${formatFileSize(data.document.size)})</span>
          </div>
          <button type="button" class="remove-document text-red-600 hover:text-red-800 text-sm font-medium bg-transparent border-0 p-0 cursor-pointer" data-document-id="${data.document.id}">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        `;
        uploadedDocuments.appendChild(uploadedItem);
        
        // Add remove handler
        const removeBtn = uploadedItem.querySelector('.remove-document');
        if (removeBtn) {
          removeBtn.dataset.handlerAttached = 'true';
          removeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            removeDocument(data.document.id, uploadedItem, qualityTestId || data.quality_test_id);
          });
        }
        
        // Clear file input to prevent form re-submission of already uploaded files
        fileInput.value = '';
        
        // Check if no more selected files
        if (selectedFiles.children.length === 0) {
          selectedFilesList.classList.add('hidden');
        }
      } else {
        alert(`Failed to upload ${file.name}: ${data.error || 'Unknown error'}`);
        uploadButton.disabled = false;
        uploadButton.textContent = 'Upload';
        uploadButton.classList.remove('opacity-50', 'cursor-not-allowed');
      }
    })
    .catch(error => {
      console.error('Upload error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        file: file.name,
        size: file.size,
        type: file.type
      });
      alert(`Failed to upload ${file.name}: ${error.message || 'Please try again.'}\n\nPlease check the browser console for more details.`);
      uploadButton.disabled = false;
      uploadButton.textContent = 'Upload';
      uploadButton.classList.remove('opacity-50', 'cursor-not-allowed');
    });
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

// Move removeDocument and checkAndHideUploadedSection outside so they can be accessed by initRemoveDocumentHandlers
function removeDocument(documentId, itemElement, qualityTestId) {
  if (!confirm('Are you sure you want to remove this document?')) {
    return;
  }
  
  const uploadedDocuments = document.getElementById('uploaded-documents');
  
  if (qualityTestId) {
    // Remove from existing quality test
    fetch(`/quality-tests/${qualityTestId}/remove_document?document_id=${documentId}`, {
      method: 'DELETE',
      headers: {
        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content,
        'Accept': 'application/json'
      }
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Failed to remove document');
      }
    })
    .then(data => {
      if (data.success) {
        // Remove only this specific element
        if (itemElement && itemElement.parentNode) {
          itemElement.remove();
        }
        // Also remove any duplicate elements with the same document ID
        if (uploadedDocuments) {
          const duplicates = uploadedDocuments.querySelectorAll(`[data-document-id="${documentId}"]`);
          duplicates.forEach(dup => {
            if (dup !== itemElement && dup.parentNode) {
              dup.remove();
            }
          });
        }
        checkAndHideUploadedSection();
      } else {
        throw new Error('Failed to remove document');
      }
    })
    .catch(error => {
      console.error('Remove error:', error);
      alert('Failed to remove document. Please try again.');
    });
  } else {
    // For new quality tests, we need to remove from the temporary quality test
    const tempIdField = document.getElementById('quality-test-temp-id');
    const tempId = tempIdField ? tempIdField.value : '';
    if (tempId) {
      // Remove from temporary quality test
      fetch(`/quality-tests/${tempId}/remove_document?document_id=${documentId}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content,
          'Accept': 'application/json'
        }
      })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to remove document');
        }
      })
      .then(data => {
        if (data.success) {
          // Remove from UI
          if (itemElement && itemElement.parentNode) {
            itemElement.remove();
          }
          // Also remove any duplicate elements with the same document ID
          if (uploadedDocuments) {
            const duplicates = uploadedDocuments.querySelectorAll(`[data-document-id="${documentId}"]`);
            duplicates.forEach(dup => {
              if (dup !== itemElement && dup.parentNode) {
                dup.remove();
              }
            });
          }
          checkAndHideUploadedSection();
        } else {
          throw new Error('Failed to remove document');
        }
      })
      .catch(error => {
        console.error('Remove error:', error);
        alert('Failed to remove document. Please try again.');
      });
    } else {
      // No temp_id, just remove from UI (document not yet saved)
      if (itemElement && itemElement.parentNode) {
        itemElement.remove();
      }
      // Also remove any duplicate elements with the same document ID
      if (uploadedDocuments) {
        const duplicates = uploadedDocuments.querySelectorAll(`[data-document-id="${documentId}"]`);
        duplicates.forEach(dup => {
          if (dup !== itemElement && dup.parentNode) {
            dup.remove();
          }
        });
      }
      checkAndHideUploadedSection();
    }
  }
}

function checkAndHideUploadedSection() {
  const uploadedDocuments = document.getElementById('uploaded-documents');
  const uploadedSection = document.getElementById('uploaded-documents-section');
  if (uploadedDocuments && uploadedDocuments.children.length === 0) {
    if (uploadedSection) {
      uploadedSection.classList.add('hidden');
    } else if (uploadedDocuments) {
      uploadedDocuments.classList.add('hidden');
    }
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initQualityTests);
document.addEventListener('turbo:load', initQualityTests);
// Also initialize remove handlers on turbo:load for dynamically loaded content
document.addEventListener('turbo:load', initRemoveDocumentHandlers);

export default initQualityTests;

