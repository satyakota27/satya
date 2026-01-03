function initMaterials() {
  // Material Wizard
  initMaterialWizard();
  
  // Tracking Type Toggle
  initTrackingTypeToggle();
  
  // Quality Tests Management
  initQualityTests();
  
  // Sidebar Toggle
  initSidebarToggle();
  
  // Material Submenu Toggle
  initMaterialSubmenu();
  
  // Stores Submenu Toggle
  initStoresSubmenu();
  
  // Dynamic Material Search
  initDynamicMaterialSearch();
  
  // BOM Toggle

  // BOM Toggle Switch
  const hasBomCheckbox = document.getElementById('material_has_bom');
  const bomSection = document.getElementById('bom-components-section');
  
  if (hasBomCheckbox && bomSection) {
    // Prevent duplicate event listeners
    if (hasBomCheckbox.dataset.bomToggleInitialized === 'true') {
      return;
    }
    hasBomCheckbox.dataset.bomToggleInitialized = 'true';
    
    hasBomCheckbox.addEventListener('change', function() {
      if (this.checked) {
        bomSection.classList.remove('hidden');
      } else {
        bomSection.classList.add('hidden');
        // Clear any unsaved components when BOM is disabled
        const bomList = document.getElementById('bom-components-list');
        if (bomList) {
          const unsavedComponents = bomList.querySelectorAll('.bom-component-row:not(.bom-component-added)');
          unsavedComponents.forEach(function(component) {
            component.remove();
          });
        }
      }
    });
  }

  // Shelf Life Toggle Switch
  const hasShelfLifeCheckbox = document.getElementById('material_has_shelf_life');
  const shelfLifeSection = document.getElementById('shelf-life-section');
  
  if (hasShelfLifeCheckbox && shelfLifeSection) {
    hasShelfLifeCheckbox.addEventListener('change', function() {
      if (this.checked) {
        shelfLifeSection.classList.remove('hidden');
      } else {
        shelfLifeSection.classList.add('hidden');
      }
    });
  }

  // Minimum Stock Value Toggle Switch
  const hasMinimumStockValueCheckbox = document.getElementById('material_has_minimum_stock_value');
  const minimumStockValueSection = document.getElementById('minimum-stock-value-section');
  
  if (hasMinimumStockValueCheckbox && minimumStockValueSection) {
    hasMinimumStockValueCheckbox.addEventListener('change', function() {
      if (this.checked) {
        minimumStockValueSection.classList.remove('hidden');
      } else {
        minimumStockValueSection.classList.add('hidden');
      }
    });
  }

  // Minimum Re-order Value Toggle Switch
  const hasMinimumReorderValueCheckbox = document.getElementById('material_has_minimum_reorder_value');
  const minimumReorderValueSection = document.getElementById('minimum-reorder-value-section');
  
  if (hasMinimumReorderValueCheckbox && minimumReorderValueSection) {
    hasMinimumReorderValueCheckbox.addEventListener('change', function() {
      if (this.checked) {
        minimumReorderValueSection.classList.remove('hidden');
      } else {
        minimumReorderValueSection.classList.add('hidden');
      }
    });
  }

  // Add BOM Component
  const addBomButton = document.getElementById('add-bom-component');
  const bomList = document.getElementById('bom-components-list');
  
  if (addBomButton && bomList) {
    addBomButton.addEventListener('click', function() {
      const row = document.createElement('div');
      row.className = 'bom-component-row flex flex-col sm:flex-row gap-4 items-stretch sm:items-end p-4 bg-gray-50 rounded-md';
      row.innerHTML = `
        <div class="flex-1 min-w-0">
          <label class="block text-sm font-medium text-gray-700 mb-1">Component material description/code</label>
          <input type="text" 
                 class="material-search bom-component-input shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md" 
                 placeholder="Search approved materials by code or description..."
                 autocomplete="off" />
          <input type="hidden" name="material[bom_component_material_ids][]" class="bom-material-id" />
        </div>
        <div class="w-full sm:w-32">
          <label class="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
          <input type="number" 
                 step="1" 
                 min="1"
                 name="material[bom_component_quantities][]" 
                 class="bom-quantity-input shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md" 
                 required />
        </div>
        <div class="flex-shrink-0">
          <button type="button" class="add-bom-component-btn w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
            Add
          </button>
        </div>
      `;
      bomList.appendChild(row);
      
      // Initialize autocomplete for the new row
      initMaterialAutocomplete(row.querySelector('.material-search'));
      
      // Add handler for Add button
      row.querySelector('.add-bom-component-btn').addEventListener('click', function() {
        addBomComponent(row);
      });
    });
  }

  // Function to add a BOM component (marks it as added)
  function addBomComponent(row) {
    const materialInput = row.querySelector('.material-search');
    const quantityInput = row.querySelector('.bom-quantity-input');
    const hiddenInput = row.querySelector('.bom-material-id');
    
    // Validate that both material and quantity are filled
    if (!hiddenInput.value || !quantityInput.value) {
      alert('Please select a material and enter a quantity before adding.');
      return;
    }
    
    // Check if this material is already added in another row
    const allRows = document.querySelectorAll('.bom-component-row.bom-component-added');
    for (let otherRow of allRows) {
      if (otherRow === row) continue;
      const otherHiddenInput = otherRow.querySelector('.bom-material-id');
      if (otherHiddenInput && otherHiddenInput.value === hiddenInput.value) {
        alert('This material has already been added as a BOM component.');
        return;
      }
    }
    
    // Mark as added
    row.classList.add('bom-component-added');
    
    // Grey out inputs
    materialInput.classList.add('bg-gray-100', 'text-gray-600');
    materialInput.setAttribute('readonly', 'readonly');
    quantityInput.classList.add('bg-gray-100', 'text-gray-600');
    quantityInput.setAttribute('readonly', 'readonly');
    
    // Replace Add button with Edit and Remove buttons
    const buttonContainer = row.querySelector('.flex-shrink-0');
    buttonContainer.innerHTML = `
      <div class="flex gap-2">
        <button type="button" class="edit-bom-component w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 border border-indigo-300 shadow-sm text-sm font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100">
          Edit
        </button>
        <button type="button" class="remove-bom-component w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100">
          Remove
        </button>
      </div>
    `;
    
    // Add event handlers
    buttonContainer.querySelector('.edit-bom-component').addEventListener('click', function() {
      editBomComponent(row);
    });
    buttonContainer.querySelector('.remove-bom-component').addEventListener('click', function() {
      removeBomComponent(row);
    });
  }

  // Function to edit a BOM component
  function editBomComponent(row) {
    const materialInput = row.querySelector('.material-search');
    const quantityInput = row.querySelector('.bom-quantity-input');
    const hiddenInput = row.querySelector('.bom-material-id');
    
    // Remove added state
    row.classList.remove('bom-component-added');
    
    // Enable inputs
    materialInput.classList.remove('bg-gray-100', 'text-gray-600');
    materialInput.removeAttribute('readonly');
    quantityInput.classList.remove('bg-gray-100', 'text-gray-600');
    quantityInput.removeAttribute('readonly');
    
    // Replace Edit and Remove buttons with Add button
    const buttonContainer = row.querySelector('.flex-shrink-0');
    buttonContainer.innerHTML = `
      <button type="button" class="add-bom-component-btn w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
        Add
      </button>
    `;
    
    // Add event handler
    buttonContainer.querySelector('.add-bom-component-btn').addEventListener('click', function() {
      addBomComponent(row);
    });
    
    // Re-initialize autocomplete - clone the input to remove old event listeners
    const currentValue = materialInput.value;
    const currentMaterialId = hiddenInput ? hiddenInput.value : '';
    const newInput = materialInput.cloneNode(true);
    newInput.value = currentValue;
    newInput.removeAttribute('data-autocomplete-initialized'); // Reset initialization flag
    materialInput.parentNode.replaceChild(newInput, materialInput);
    
    // Restore the material ID if it was set
    const newHiddenInput = row.querySelector('.bom-material-id');
    if (currentMaterialId && newHiddenInput) {
      newHiddenInput.value = currentMaterialId;
    }
    
    // Initialize autocomplete for the new input
    initMaterialAutocomplete(newInput);
    
    // Focus on the material input for better UX
    newInput.focus();
  }

  // Function to remove a BOM component
  function removeBomComponent(row) {
    if (confirm('Are you sure you want to remove this component?')) {
      row.remove();
    }
  }

  // Handle Edit and Remove buttons for existing components (delegated event listeners)
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('edit-bom-component')) {
      const row = e.target.closest('.bom-component-row');
      if (row) {
        editBomComponent(row);
      }
    } else if (e.target.classList.contains('remove-bom-component')) {
      const row = e.target.closest('.bom-component-row');
      if (row) {
        removeBomComponent(row);
      }
    }
  });

  // Initialize autocomplete for existing material search fields
  document.querySelectorAll('.material-search').forEach(function(input) {
    if (!input.readOnly) {
      initMaterialAutocomplete(input);
    }
  });

  // Unit Creation Modal
  const unitModal = document.getElementById('unit-modal');
  const createProcurementUnitBtn = document.getElementById('create-procurement-unit');
  const createSaleUnitBtn = document.getElementById('create-sale-unit');
  const cancelUnitModalBtn = document.getElementById('cancel-unit-modal');
  const unitForm = document.getElementById('unit-form');
  let targetSelect = null;

  function openUnitModal(selectElement) {
    targetSelect = selectElement;
    if (unitModal) {
      unitModal.classList.remove('hidden');
      unitForm.querySelector('input[name="unit_of_measurement[name]"]').focus();
    }
  }

  function closeUnitModal() {
    if (unitModal) {
      unitModal.classList.add('hidden');
      unitForm.reset();
      targetSelect = null;
    }
  }

  if (createProcurementUnitBtn) {
    createProcurementUnitBtn.addEventListener('click', function() {
      const procurementSelect = document.getElementById('material_procurement_unit_id');
      if (procurementSelect) {
        openUnitModal(procurementSelect);
      }
    });
  }

  if (createSaleUnitBtn) {
    createSaleUnitBtn.addEventListener('click', function() {
      const saleSelect = document.getElementById('material_sale_unit_id');
      if (saleSelect) {
        openUnitModal(saleSelect);
      }
    });
  }

  if (cancelUnitModalBtn) {
    cancelUnitModalBtn.addEventListener('click', closeUnitModal);
  }

  // Handle unit form submission
  if (unitForm) {
    unitForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const formData = new FormData(unitForm);
      // Use the form's action URL which is already set correctly
      const url = unitForm.action;
      
      fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content,
          'Accept': 'application/json'
        }
      })
      .then(response => {
        if (!response.ok) {
          return response.json().then(data => {
            throw new Error(data.errors ? data.errors.join(', ') : 'Failed to create unit');
          });
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          // Add new option to both selects
          const procurementSelect = document.getElementById('material_procurement_unit_id');
          const saleSelect = document.getElementById('material_sale_unit_id');
          
          [procurementSelect, saleSelect].forEach(function(select) {
            if (select) {
              const option = document.createElement('option');
              option.value = data.unit.id;
              option.textContent = data.unit.name || data.unit.display_name;
              select.appendChild(option);
            }
          });
          
          // Select the new unit in the target select
          if (targetSelect) {
            targetSelect.value = data.unit.id;
          }
          
          closeUnitModal();
        } else {
          alert('Error: ' + (data.errors || ['Failed to create unit']).join(', '));
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while creating the unit: ' + error.message);
      });
    });
  }
}

function initMaterialAutocomplete(input) {
  // Use a WeakMap or data attribute to store per-input state
  if (input.dataset.autocompleteInitialized === 'true') {
    return; // Already initialized
  }
  
  let timeout;
  let dropdown = null;
  
  // Store dropdown reference on the input element for cleanup
  const cleanup = function() {
    if (dropdown) {
      dropdown.remove();
      dropdown = null;
    }
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  input.addEventListener('input', function() {
    const query = this.value.trim();
    // Find the hidden input - check for bom-material-id class first, then fallback to any hidden input
    const hiddenInput = this.parentElement.querySelector('.bom-material-id') || 
                        this.parentElement.querySelector('input[type="hidden"]');
    
    // Check if this is a BOM component search by looking for the bom-component-row parent
    const isBomSearch = this.closest('.bom-component-row') !== null;
    
    clearTimeout(timeout);
    cleanup();
    
    // Clear hidden input if search field is cleared
    if (query.length === 0 && hiddenInput) {
      hiddenInput.value = '';
    }
    
    if (query.length < 2) {
      return;
    }

    timeout = setTimeout(function() {
      // Add bom_search parameter if this is a BOM component search
      const url = isBomSearch 
        ? `/materials/search.json?q=${encodeURIComponent(query)}&bom_search=true`
        : `/materials/search.json?q=${encodeURIComponent(query)}`;
      
      fetch(url, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json'
        }
      })
      .then(response => response.json())
      .then(data => {
        cleanup();
        
        if (data.materials && data.materials.length > 0) {
          dropdown = document.createElement('div');
          dropdown.className = 'absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto';
          dropdown.style.position = 'absolute';
          dropdown.style.top = '100%';
          dropdown.style.left = '0';
          dropdown.style.width = input.offsetWidth + 'px';
          dropdown.setAttribute('data-autocomplete-dropdown', 'true');
          
          // Get list of already added material IDs to filter them out (only for BOM searches)
          const addedMaterialIds = [];
          if (isBomSearch) {
            const allBomRows = document.querySelectorAll('.bom-component-row.bom-component-added');
            allBomRows.forEach(addedRow => {
              const addedHiddenInput = addedRow.querySelector('.bom-material-id');
              if (addedHiddenInput && addedHiddenInput.value) {
                addedMaterialIds.push(addedHiddenInput.value.toString());
              }
            });
          }
          
          data.materials.forEach(function(material) {
            // Skip if this material is already added (only for BOM searches)
            if (isBomSearch && addedMaterialIds.includes(material.id.toString())) {
              return;
            }
            
            const item = document.createElement('div');
            item.className = 'cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50';
            item.innerHTML = `
              <div class="font-medium text-gray-900">${material.material_code || 'Draft'}</div>
              <div class="text-sm text-gray-500">${material.description}</div>
            `;
            item.addEventListener('click', function(e) {
              e.stopPropagation();
              
              // Double-check if material is already added (for BOM searches)
              if (isBomSearch) {
                const currentRow = input.closest('.bom-component-row');
                const allBomRows = document.querySelectorAll('.bom-component-row.bom-component-added');
                for (let otherRow of allBomRows) {
                  if (otherRow === currentRow) continue;
                  const otherHiddenInput = otherRow.querySelector('.bom-material-id');
                  if (otherHiddenInput && otherHiddenInput.value === material.id.toString()) {
                    alert('This material has already been added as a BOM component.');
                    cleanup();
                    return;
                  }
                }
              }
              
              input.value = `${material.material_code || 'Draft'} - ${material.description}`;
              if (hiddenInput) {
                hiddenInput.value = material.id;
              }
              cleanup();
            });
            dropdown.appendChild(item);
          });
          
          const parentContainer = input.parentElement;
          parentContainer.style.position = 'relative';
          parentContainer.appendChild(dropdown);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        cleanup();
      });
    }, 300);
  });

  // Close dropdown when clicking outside - use event delegation with input reference
  const clickHandler = function(e) {
    if (dropdown && !input.contains(e.target) && !dropdown.contains(e.target)) {
      cleanup();
    }
  };
  
  document.addEventListener('click', clickHandler);
  
  // Mark as initialized
  input.dataset.autocompleteInitialized = 'true';
  input.dataset.autocompleteClickHandler = 'true';
  
  // Store cleanup function for potential removal
  input._autocompleteCleanup = cleanup;
}

function initSidebarToggle() {
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const materialSidebar = document.getElementById('material-sidebar');
  const sidebarToggleIcon = document.getElementById('sidebar-toggle-icon');
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileSidebarOverlay = document.getElementById('mobile-sidebar-overlay');
  const closeSidebarMobile = document.getElementById('close-sidebar-mobile');
  
  if (!materialSidebar) return;
  
  // Mobile sidebar functions
  function openMobileSidebar() {
    materialSidebar.classList.remove('-translate-x-full');
    if (mobileSidebarOverlay) {
      mobileSidebarOverlay.classList.remove('hidden');
    }
  }
  
  function closeMobileSidebar() {
    materialSidebar.classList.add('-translate-x-full');
    if (mobileSidebarOverlay) {
      mobileSidebarOverlay.classList.add('hidden');
    }
  }
  
  // Mobile menu toggle
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      openMobileSidebar();
    });
  }
  
  // Close mobile sidebar
  if (closeSidebarMobile) {
    closeSidebarMobile.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      closeMobileSidebar();
    });
  }
  
  // Close on overlay click
  if (mobileSidebarOverlay) {
    mobileSidebarOverlay.addEventListener('click', closeMobileSidebar);
  }
  
  // Close sidebar when clicking on a link (mobile)
  const sidebarLinks = materialSidebar.querySelectorAll('a');
  sidebarLinks.forEach(function(link) {
    link.addEventListener('click', function() {
      if (window.innerWidth < 1024) { // lg breakpoint
        closeMobileSidebar();
      }
    });
  });
  
  // Desktop sidebar collapse/expand (only on large screens)
  if (sidebarToggle && sidebarToggleIcon) {
    // Check localStorage for saved state
    const isCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
    
    function applyCollapsedState(collapsed) {
      if (window.innerWidth < 1024) return; // Only on desktop
      
      const submenu = document.getElementById('material-submenu');
      const submenuToggle = document.querySelector('.material-submenu-toggle');
      
      if (collapsed) {
        // Collapse
        materialSidebar.classList.remove('w-64');
        materialSidebar.classList.add('w-16');
        document.querySelectorAll('.sidebar-text').forEach(el => {
          el.classList.add('hidden');
        });
        document.querySelectorAll('.sidebar-link').forEach(link => {
          link.classList.add('justify-center');
          link.classList.remove('justify-start');
        });
        // Hide submenu when sidebar is collapsed
        if (submenu) {
          submenu.classList.add('hidden');
        }
        if (submenuToggle) {
          submenuToggle.classList.add('hidden');
        }
        if (sidebarToggleIcon) {
          sidebarToggleIcon.style.transform = 'rotate(180deg)';
        }
      } else {
        // Expand
        materialSidebar.classList.remove('w-16');
        materialSidebar.classList.add('w-64');
        document.querySelectorAll('.sidebar-text').forEach(el => {
          el.classList.remove('hidden');
        });
        document.querySelectorAll('.sidebar-link').forEach(link => {
          link.classList.remove('justify-center');
          link.classList.add('justify-start');
        });
        // Show submenu toggle when sidebar is expanded
        if (submenuToggle) {
          submenuToggle.classList.remove('hidden');
        }
        // Restore submenu state if it was expanded
        const savedState = localStorage.getItem('material-submenu-expanded');
        const isOnUnitsPage = window.location.pathname.includes('unit-of-measurements');
        if (submenu && (isOnUnitsPage || savedState === 'true')) {
          submenu.classList.remove('hidden');
          if (submenuToggle) {
            submenuToggle.querySelector('svg').style.transform = 'rotate(180deg)';
          }
        }
        if (sidebarToggleIcon) {
          sidebarToggleIcon.style.transform = 'rotate(0deg)';
        }
      }
    }
    
    // Apply saved state on load (only on desktop)
    if (window.innerWidth >= 1024) {
      applyCollapsedState(isCollapsed);
    }
    
    // Remove any existing listeners by using a data attribute
    if (sidebarToggle.dataset.listenerAttached === 'true') {
      return; // Already has listener
    }
    
    // Toggle on button click (desktop only)
    sidebarToggle.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      if (window.innerWidth < 1024) return; // Only work on desktop
      
      const currentSidebar = document.getElementById('material-sidebar');
      if (!currentSidebar) return;
      
      const isCurrentlyCollapsed = currentSidebar.classList.contains('w-16');
      const newState = !isCurrentlyCollapsed;
      applyCollapsedState(newState);
      localStorage.setItem('sidebar-collapsed', newState.toString());
    });
    
    sidebarToggle.dataset.listenerAttached = 'true';
    
    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(function() {
        if (window.innerWidth >= 1024) {
          // Desktop: apply saved state
          const isCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
          applyCollapsedState(isCollapsed);
        } else {
          // Mobile: ensure sidebar is closed
          closeMobileSidebar();
        }
      }, 100);
    });
  }
}

function initDynamicMaterialSearch() {
  const searchInput = document.getElementById('material-search-input');
  const stateFilter = document.getElementById('material-state-filter');
  const searchForm = document.getElementById('materials-search-form');
  const materialsContainer = document.getElementById('materials-container');
  const searchLoading = document.getElementById('search-loading');
  
  if (!searchInput || !searchForm || !materialsContainer) return;
  
  let searchTimeout;
  let currentRequest = null;
  
  function performSearch() {
    const searchValue = searchInput.value.trim();
    const stateValue = stateFilter ? stateFilter.value : '';
    
    // Show loading indicator
    if (searchLoading) {
      searchLoading.classList.remove('hidden');
    }
    
    // Cancel previous request if still pending
    if (currentRequest) {
      currentRequest.abort();
    }
    
    // Build URL with search and state params
    const params = new URLSearchParams();
    if (searchValue) params.append('search', searchValue);
    if (stateValue) params.append('state', stateValue);
    params.append('page', '1'); // Reset to first page on new search
    
    const url = `/materials.json?${params.toString()}`;
    
    // Create new request
    currentRequest = new AbortController();
    
    fetch(url, {
      method: 'GET',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json'
      },
      signal: currentRequest.signal
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Search failed');
      }
      return response.json();
    })
    .then(data => {
      // Update materials container with new content
      if (data.materials) {
        materialsContainer.innerHTML = data.materials;
      }
      if (data.pagination) {
        // Append pagination if it exists
        const existingPagination = materialsContainer.querySelector('.bg-white.px-4');
        if (existingPagination) {
          existingPagination.remove();
        }
        if (data.pagination.trim() !== '') {
          materialsContainer.insertAdjacentHTML('beforeend', data.pagination);
        }
      }
      
      // Update URL without page reload
      const newUrl = `/materials?${params.toString()}`;
      window.history.pushState({ search: searchValue, state: stateValue }, '', newUrl);
      
      // Hide loading indicator
      if (searchLoading) {
        searchLoading.classList.add('hidden');
      }
      
      currentRequest = null;
    })
    .catch(error => {
      if (error.name !== 'AbortError') {
        console.error('Search error:', error);
        if (searchLoading) {
          searchLoading.classList.add('hidden');
        }
      }
      currentRequest = null;
    });
  }
  
  // Debounced search on input
  searchInput.addEventListener('input', function() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(performSearch, 500); // 500ms delay
  });
  
  // Search on state filter change
  if (stateFilter) {
    stateFilter.addEventListener('change', function() {
      clearTimeout(searchTimeout);
      performSearch();
    });
  }
  
  // Handle form submission (for manual search button)
  searchForm.addEventListener('submit', function(e) {
    e.preventDefault();
    clearTimeout(searchTimeout);
    performSearch();
  });
  
  // Handle pagination clicks (delegated event listener)
  materialsContainer.addEventListener('click', function(e) {
    const link = e.target.closest('a[href*="/materials"]');
    if (link && link.href.includes('page=')) {
      e.preventDefault();
      const url = new URL(link.href);
      const page = url.searchParams.get('page');
      const searchValue = searchInput.value.trim();
      const stateValue = stateFilter ? stateFilter.value : '';
      
      // Build params
      const params = new URLSearchParams();
      if (searchValue) params.append('search', searchValue);
      if (stateValue) params.append('state', stateValue);
      if (page) params.append('page', page);
      
      // Show loading
      if (searchLoading) {
        searchLoading.classList.remove('hidden');
      }
      
      fetch(`/materials.json?${params.toString()}`, {
        method: 'GET',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json'
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.materials) {
          materialsContainer.innerHTML = data.materials;
        }
        if (data.pagination) {
          const existingPagination = materialsContainer.querySelector('.bg-white.px-4');
          if (existingPagination) {
            existingPagination.remove();
          }
          if (data.pagination.trim() !== '') {
            materialsContainer.insertAdjacentHTML('beforeend', data.pagination);
          }
        }
        
        // Update URL
        window.history.pushState({ search: searchValue, state: stateValue, page: page }, '', link.href);
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        if (searchLoading) {
          searchLoading.classList.add('hidden');
        }
      })
      .catch(error => {
        console.error('Pagination error:', error);
        if (searchLoading) {
          searchLoading.classList.add('hidden');
        }
      });
    }
  });
  
  // Handle browser back/forward buttons
  window.addEventListener('popstate', function(e) {
    if (e.state) {
      if (e.state.search !== undefined) {
        searchInput.value = e.state.search || '';
      }
      if (e.state.state !== undefined && stateFilter) {
        stateFilter.value = e.state.state || '';
      }
      performSearch();
    }
  });
}

function initMaterialSubmenu() {
  const submenu = document.getElementById('material-submenu');
  const toggleButton = document.querySelector('.material-submenu-toggle');
  
  if (!submenu || !toggleButton) return;
  
  // Check if submenu should be expanded based on current path or saved state
  const isOnUnitsPage = window.location.pathname.includes('unit-of-measurements');
  const isOnQualityTestsPage = window.location.pathname.includes('quality-tests');
  const isOnProcessStepsPage = window.location.pathname.includes('process-steps');
  const savedState = localStorage.getItem('material-submenu-expanded');
  const shouldExpand = isOnUnitsPage || isOnQualityTestsPage || isOnProcessStepsPage || savedState === 'true';
  
  if (shouldExpand) {
    submenu.classList.remove('hidden');
    toggleButton.querySelector('svg').style.transform = 'rotate(180deg)';
  }
  
  // Add click event listener to toggle button
  toggleButton.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const icon = this.querySelector('svg');
    const isHidden = submenu.classList.contains('hidden');
    
    if (isHidden) {
      submenu.classList.remove('hidden');
      icon.style.transform = 'rotate(180deg)';
      localStorage.setItem('material-submenu-expanded', 'true');
    } else {
      submenu.classList.add('hidden');
      icon.style.transform = 'rotate(0deg)';
      localStorage.setItem('material-submenu-expanded', 'false');
    }
  });
  
  // Prevent Materials link from toggling submenu when clicking the toggle button
  const materialsLink = toggleButton.closest('.sidebar-link');
  if (materialsLink) {
    materialsLink.addEventListener('click', function(e) {
      // Only prevent default if clicking on the toggle button area
      if (e.target.closest('.material-submenu-toggle')) {
        e.preventDefault();
      }
    });
  }
}

function initMaterialWizard() {
  const wizard = document.getElementById('material-wizard');
  if (!wizard) return; // Only initialize if wizard exists
  
  let currentStep = 1;
  const totalSteps = 5;
  const prevBtn = document.getElementById('wizard-prev-btn');
  const nextBtn = document.getElementById('wizard-next-btn');
  const submitBtn = document.getElementById('wizard-submit-btn');
  
  function showStep(step) {
    // Hide all steps
    document.querySelectorAll('.wizard-step').forEach(function(stepEl) {
      stepEl.classList.add('hidden');
    });
    
    // Show current step
    const currentStepEl = document.getElementById(`wizard-step-${step}`);
    if (currentStepEl) {
      currentStepEl.classList.remove('hidden');
    }
    
    // Update progress indicators
    for (let i = 1; i <= totalSteps; i++) {
      const indicator = document.getElementById(`step-${i}-indicator`);
      const label = indicator?.parentElement?.nextElementSibling;
      
      if (i < step) {
        // Completed step
        if (indicator) {
          indicator.classList.remove('bg-gray-200');
          indicator.classList.add('bg-indigo-600');
          const span = indicator.querySelector('span');
          if (span) {
            span.classList.remove('text-gray-600');
            span.classList.add('text-white');
          }
        }
        if (label) {
          label.classList.remove('text-gray-500');
          label.classList.add('text-gray-900');
        }
      } else if (i === step) {
        // Current step
        if (indicator) {
          indicator.classList.remove('bg-gray-200');
          indicator.classList.add('bg-indigo-600');
          const span = indicator.querySelector('span');
          if (span) {
            span.classList.remove('text-gray-600');
            span.classList.add('text-white');
          }
        }
        if (label) {
          label.classList.remove('text-gray-500');
          label.classList.add('text-gray-900');
        }
      } else {
        // Future step
        if (indicator) {
          indicator.classList.remove('bg-indigo-600');
          indicator.classList.add('bg-gray-200');
          const span = indicator.querySelector('span');
          if (span) {
            span.classList.remove('text-white');
            span.classList.add('text-gray-600');
          }
        }
        if (label) {
          label.classList.remove('text-gray-900');
          label.classList.add('text-gray-500');
        }
      }
    }
    
    // Update navigation buttons
    if (prevBtn) {
      if (step === 1) {
        prevBtn.classList.add('hidden');
      } else {
        prevBtn.classList.remove('hidden');
      }
    }
    
    // In step 5 (last step), hide Next button and show Submit button
    // In all other steps, show Next button and hide Submit button
    if (nextBtn) {
      if (step === totalSteps) {
        // Step 5: Hide Next button
        nextBtn.classList.add('hidden');
      } else {
        // Steps 1-4: Show Next button
        nextBtn.classList.remove('hidden');
      }
    }
    
    if (submitBtn) {
      if (step === totalSteps) {
        // Step 5: Show Submit button
        submitBtn.classList.remove('hidden');
      } else {
        // Steps 1-4: Hide Submit button
        submitBtn.classList.add('hidden');
      }
    }
  }
  
  function validateStep(step) {
    const stepEl = document.getElementById(`wizard-step-${step}`);
    if (!stepEl) return true;
    
    if (step === 1) {
      // Validate: description is required
      const description = stepEl.querySelector('#material_description');
      if (description && !description.value.trim()) {
        alert('Material description is required.');
        description.focus();
        return false;
      }
      
      // Validate: tracking_type is required
      const unitRadio = document.getElementById('material_tracking_type_unit');
      const batchRadio = document.getElementById('material_tracking_type_batch');
      if (unitRadio && batchRadio && !unitRadio.checked && !batchRadio.checked) {
        alert('Please select a tracking type (Unit or Batch).');
        if (unitRadio) unitRadio.focus();
        return false;
      }
      
      // Validate: sample_size is required if batch is selected
      if (batchRadio && batchRadio.checked) {
        const sampleSize = document.getElementById('material_sample_size');
        if (sampleSize && (!sampleSize.value || parseInt(sampleSize.value) <= 0)) {
          alert('Sample size is required and must be greater than 0 when Batch tracking is selected.');
          if (sampleSize) sampleSize.focus();
          return false;
        }
      }
      
      return true;
    }
    // Steps 2 and 3 are optional, so always return true
    return true;
  }
  
  if (prevBtn) {
    prevBtn.addEventListener('click', function() {
      if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
      }
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', function() {
      if (validateStep(currentStep)) {
        if (currentStep < totalSteps) {
          currentStep++;
          showStep(currentStep);
        }
      }
    });
  }
  
  // Initialize first step
  showStep(1);
  
  // Initialize quality tests when step 4 is shown, process steps when step 5 is shown
  const originalShowStep = showStep;
  showStep = function(step) {
    originalShowStep(step);
    
    // Ensure buttons are correctly shown/hidden for step 5
    if (step === totalSteps) {
      // Force hide Next button and show Submit button for step 5
      if (nextBtn) {
        nextBtn.classList.add('hidden');
      }
      if (submitBtn) {
        submitBtn.classList.remove('hidden');
      }
    }
    
    if (step === 4) {
      // Re-initialize quality tests when step 4 is shown
      setTimeout(function() {
        initQualityTests();
      }, 100);
    } else if (step === 5) {
      // Re-initialize process steps when step 5 is shown
      setTimeout(function() {
        initProcessSteps();
      }, 100);
    }
  };
}

function initTrackingTypeToggle() {
  const unitRadio = document.getElementById('material_tracking_type_unit');
  const batchRadio = document.getElementById('material_tracking_type_batch');
  const sampleSizeSection = document.getElementById('sample-size-section');
  const sampleSizeInput = document.getElementById('material_sample_size');
  
  if (!unitRadio || !batchRadio || !sampleSizeSection) return;
  
  function toggleSampleSize() {
    if (batchRadio.checked) {
      sampleSizeSection.classList.remove('hidden');
      if (sampleSizeInput) {
        sampleSizeInput.setAttribute('required', 'required');
      }
    } else {
      sampleSizeSection.classList.add('hidden');
      if (sampleSizeInput) {
        sampleSizeInput.removeAttribute('required');
        sampleSizeInput.value = '';
      }
    }
  }
  
  // Set initial state
  toggleSampleSize();
  
  // Add event listeners
  unitRadio.addEventListener('change', toggleSampleSize);
  batchRadio.addEventListener('change', toggleSampleSize);
}

function initQualityTests() {
  const addTestBtn = document.getElementById('add-quality-test');
  const testsList = document.getElementById('quality-tests-list');
  
  if (!addTestBtn || !testsList) return;
  
  // Prevent duplicate initialization
  if (addTestBtn.dataset.qualityTestsInitialized === 'true') {
    return;
  }
  addTestBtn.dataset.qualityTestsInitialized = 'true';
  
  // Use a shared counter that persists across calls
  if (!window.qualityTestCounter) {
    window.qualityTestCounter = 0;
  }
  
  // Count existing test rows to continue numbering
  const existingRows = testsList.querySelectorAll('.quality-test-row');
  if (existingRows.length > 0) {
    window.qualityTestCounter = existingRows.length;
  }
  
  // Load existing quality tests if editing
  if (testsList && testsList.dataset.materialId) {
    const materialId = testsList.dataset.materialId;
    fetch(`/materials/${materialId}/material_quality_tests.json`, {
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.material_quality_tests && data.material_quality_tests.length > 0) {
        data.material_quality_tests.forEach((mqt, index) => {
          window.qualityTestCounter++;
          const testRow = createQualityTestRow(window.qualityTestCounter);
          testsList.appendChild(testRow);
          
          // Populate with existing data
          const testSearch = testRow.querySelector('.quality-test-search');
          const hiddenInput = testRow.querySelector('.quality-test-id');
          const materialQualityTestIdInput = testRow.querySelector('.material-quality-test-id');
          
          if (testSearch && mqt.quality_test) {
            testSearch.value = `${mqt.quality_test.test_number} - ${mqt.quality_test.description}`;
            testSearch.setAttribute('readonly', 'readonly');
            testSearch.classList.add('bg-gray-100', 'text-gray-600');
          }
          if (hiddenInput && mqt.quality_test) {
            hiddenInput.value = mqt.quality_test.id;
            hiddenInput.name = 'material[quality_test_ids][]';
          }
          if (materialQualityTestIdInput && mqt.id) {
            materialQualityTestIdInput.value = mqt.id;
          }
          
          // Mark as added and replace button with Edit/Remove
          testRow.classList.add('quality-test-added');
          const buttonContainer = testRow.querySelector('.flex-shrink-0');
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
          
          initQualityTestRow(testRow);
        });
      }
    })
    .catch(error => {
      console.error('Error loading existing quality tests:', error);
    });
  }
  
  addTestBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent duplicate row creation
    const existingEmptyRows = testsList.querySelectorAll('.quality-test-row:not(.quality-test-added)');
    if (existingEmptyRows.length > 0) {
      // Focus on the first empty row instead of creating a new one
      const firstEmptyRow = existingEmptyRows[0];
      const searchInput = firstEmptyRow.querySelector('.quality-test-search');
      if (searchInput) {
        searchInput.focus();
      }
      return;
    }
    
    window.qualityTestCounter++;
    const testRow = createQualityTestRow(window.qualityTestCounter);
    testsList.appendChild(testRow);
    initQualityTestRow(testRow);
    
    // Focus on the search input for better UX
    const searchInput = testRow.querySelector('.quality-test-search');
    if (searchInput) {
      searchInput.focus();
    }
  });
  
  function createQualityTestRow(counter) {
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
        <input type="hidden" class="material-quality-test-id" />
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
  function addQualityTest(row) {
    const testSearch = row.querySelector('.quality-test-search');
    const hiddenInput = row.querySelector('.quality-test-id');
    
    // Validate that quality test is selected
    if (!hiddenInput.value) {
      alert('Please select a quality test before adding.');
      return;
    }
    
    // Check if this test is already added in another row
    const allRows = document.querySelectorAll('.quality-test-row.quality-test-added');
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
      editQualityTest(row);
    });
    buttonContainer.querySelector('.remove-quality-test').addEventListener('click', function() {
      removeQualityTest(row);
    });
    
    // Ensure hidden input is included in form submission
    if (hiddenInput) {
      hiddenInput.name = 'material[quality_test_ids][]';
    }
  }

  // Function to edit a quality test
  function editQualityTest(row) {
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
      addQualityTest(row);
    });
    
    // Re-initialize autocomplete - clone the input to remove old event listeners
    const currentValue = testSearch.value;
    const currentTestId = hiddenInput ? hiddenInput.value : '';
    const newInput = testSearch.cloneNode(true);
    newInput.value = currentValue;
    newInput.removeAttribute('data-autocomplete-initialized'); // Reset initialization flag
    testSearch.parentNode.replaceChild(newInput, testSearch);
    
    // Restore the test ID if it was set
    const newHiddenInput = row.querySelector('.quality-test-id');
    if (currentTestId && newHiddenInput) {
      newHiddenInput.value = currentTestId;
    }
    
    // Initialize autocomplete for the new input
    initQualityTestAutocomplete(newInput, row);
    
    // Focus on the search input for better UX
    newInput.focus();
  }

  // Function to remove a quality test
  function removeQualityTest(row) {
    if (confirm('Are you sure you want to remove this quality test?')) {
      row.remove();
    }
  }

  function initQualityTestRow(row) {
    const testSearch = row.querySelector('.quality-test-search');
    const hiddenInput = row.querySelector('.quality-test-id');
    const addBtn = row.querySelector('.add-quality-test-btn');
    
    // Initialize quality test search autocomplete
    if (testSearch && !testSearch.dataset.autocompleteInitialized) {
      initQualityTestAutocomplete(testSearch, row);
      testSearch.dataset.autocompleteInitialized = 'true';
    }
    
    // Handle add button
    if (addBtn) {
      addBtn.addEventListener('click', function() {
        addQualityTest(row);
      });
    }
  }
  
  // Handle Edit and Remove buttons for existing tests (delegated event listeners)
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('edit-quality-test')) {
      const row = e.target.closest('.quality-test-row');
      if (row) {
        editQualityTest(row);
      }
    } else if (e.target.classList.contains('remove-quality-test')) {
      const row = e.target.closest('.quality-test-row');
      if (row) {
        removeQualityTest(row);
      }
    }
  });
  
  function initQualityTestAutocomplete(searchInput, row) {
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
          const allRows = document.querySelectorAll('.quality-test-row.quality-test-added');
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
                if (hiddenInput) hiddenInput.value = test.id;
                dropdown.remove();
                dropdown = null;
                // Add button should already be visible, no need to show it
              });
              dropdown.appendChild(item);
            });
            
            // Add "Create new" option
            const createItem = document.createElement('div');
            createItem.className = 'cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50 border-t border-gray-200';
            createItem.innerHTML = `
              <div class="flex items-center">
                <span class="font-medium text-indigo-600">Create new: "${query}"</span>
              </div>
            `;
            createItem.addEventListener('click', function() {
              dropdown.remove();
              dropdown = null;
              openQualityTestModal(searchInput, null, hiddenInput, query, row);
            });
            dropdown.appendChild(createItem);
            
            searchInput.parentElement.style.position = 'relative';
            searchInput.parentElement.appendChild(dropdown);
          } else {
            // No results, show create option
            dropdown = document.createElement('div');
            dropdown.className = 'absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm';
            dropdown.style.position = 'absolute';
            dropdown.style.top = '100%';
            dropdown.style.left = '0';
            dropdown.style.width = '100%';
            
            const createItem = document.createElement('div');
            createItem.className = 'cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50';
            createItem.innerHTML = `
              <div class="flex items-center">
                <span class="font-medium text-indigo-600">Create new: "${query}"</span>
              </div>
            `;
            createItem.addEventListener('click', function() {
              dropdown.remove();
              dropdown = null;
              openQualityTestModal(searchInput, null, hiddenInput, query, row);
            });
            dropdown.appendChild(createItem);
            
            searchInput.parentElement.style.position = 'relative';
            searchInput.parentElement.appendChild(dropdown);
          }
        })
        .catch(error => {
          console.error('Error searching quality tests:', error);
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
  
  function openQualityTestModal(searchInput, descriptionInput, hiddenInput, initialQuery, row) {
    const modal = document.getElementById('quality-test-modal');
    const form = document.getElementById('quality-test-form');
    const cancelBtn = document.getElementById('cancel-quality-test-modal');
    const resultTypeRadios = modal.querySelectorAll('.modal-result-type-radio');
    const rangeFields = document.getElementById('modal-range-fields');
    const absoluteFields = document.getElementById('modal-absolute-fields');
    
    if (!modal || !form) return;
    
    // Set initial description if provided
    const descriptionField = form.querySelector('#quality_test_description');
    if (descriptionField && initialQuery) {
      descriptionField.value = initialQuery;
    }
    
    // Initialize result type toggle
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
    }
    
    // Show modal
    modal.classList.remove('hidden');
    
    // Handle cancel
    if (cancelBtn) {
      const closeModal = function() {
        modal.classList.add('hidden');
        form.reset();
        if (rangeFields) rangeFields.classList.add('hidden');
        if (absoluteFields) absoluteFields.classList.add('hidden');
        // Reset radio to boolean
        const booleanRadio = modal.querySelector('input[value="boolean"]');
        if (booleanRadio) booleanRadio.checked = true;
      };
      
      cancelBtn.onclick = closeModal;
      
      // Also close on background click
      modal.addEventListener('click', function(e) {
        if (e.target === modal) {
          closeModal();
        }
      });
    }
    
    // Remove any existing submit handlers
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    const newFormElement = document.getElementById('quality-test-form');
    
    // Handle form submission
    newFormElement.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const formData = new FormData(newFormElement);
      
      fetch(newFormElement.action, {
        method: 'POST',
        headers: {
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content,
          'Accept': 'application/json'
        },
        body: formData
      })
      .then(response => {
        if (!response.ok) {
          return response.json().then(data => {
            throw new Error(data.error || 'Failed to create quality test');
          });
        }
        return response.json();
      })
      .then(data => {
        if (data.success || data.id) {
          // Get the created quality test details
          const qualityTestId = data.id || data.quality_test?.id;
          const testNumber = data.test_number || data.quality_test?.test_number;
          const description = data.description || data.quality_test?.description;
          
          // Populate the material form fields
          if (searchInput && testNumber && description) {
            searchInput.value = `${testNumber} - ${description}`;
          }
          if (hiddenInput && qualityTestId) {
            hiddenInput.value = qualityTestId;
          }
          
          // Test is selected, Add button will be visible for user to click
          // Check if this test is already added elsewhere
          if (row) {
            const allRows = document.querySelectorAll('.quality-test-row.quality-test-added');
            let alreadyAdded = false;
            for (let otherRow of allRows) {
              if (otherRow === row) continue;
              const otherHiddenInput = otherRow.querySelector('.quality-test-id');
              if (otherHiddenInput && otherHiddenInput.value === qualityTestId.toString()) {
                alreadyAdded = true;
                break;
              }
            }
            if (alreadyAdded) {
              alert('This quality test has already been added in another row.');
              if (hiddenInput) hiddenInput.value = '';
              if (searchInput) searchInput.value = '';
            }
          }
          
          // Close modal
          modal.classList.add('hidden');
          newFormElement.reset();
          if (rangeFields) rangeFields.classList.add('hidden');
          if (absoluteFields) absoluteFields.classList.add('hidden');
          // Reset radio to boolean
          const booleanRadio = modal.querySelector('input[value="boolean"]');
          if (booleanRadio) booleanRadio.checked = true;
        } else {
          throw new Error('Unexpected response format');
        }
      })
      .catch(error => {
        console.error('Error creating quality test:', error);
        alert(`Failed to create quality test: ${error.message}`);
      });
    });
  }
}

function initProcessSteps() {
  const addStepBtn = document.getElementById('add-process-step');
  const stepsList = document.getElementById('process-steps-list');
  
  if (!addStepBtn || !stepsList) return;
  
  // Prevent duplicate initialization
  if (addStepBtn.dataset.processStepsInitialized === 'true') {
    return;
  }
  addStepBtn.dataset.processStepsInitialized = 'true';
  
  // Use a shared counter that persists across calls
  if (!window.processStepCounter) {
    window.processStepCounter = 0;
  }
  
  // Count existing step rows to continue numbering
  const existingRows = stepsList.querySelectorAll('.process-step-row');
  if (existingRows.length > 0) {
    window.processStepCounter = existingRows.length;
  }
  
  // Load existing process steps if editing
  if (stepsList && stepsList.dataset.materialId) {
    const materialId = stepsList.dataset.materialId;
    fetch(`/materials/${materialId}/material_process_steps.json`, {
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.material_process_steps && data.material_process_steps.length > 0) {
        data.material_process_steps.forEach((mps, index) => {
          window.processStepCounter++;
          const stepRow = createProcessStepRow(window.processStepCounter);
          stepsList.appendChild(stepRow);
          
          // Populate with existing data
          const stepSearch = stepRow.querySelector('.process-step-search');
          const hiddenInput = stepRow.querySelector('.process-step-id');
          const materialProcessStepIdInput = stepRow.querySelector('.material-process-step-id');
          
          if (stepSearch && mps.process_step) {
            stepSearch.value = `${mps.process_step.process_code} - ${mps.process_step.description}`;
            stepSearch.setAttribute('readonly', 'readonly');
            stepSearch.classList.add('bg-gray-100', 'text-gray-600');
          }
          if (hiddenInput && mps.process_step) {
            hiddenInput.value = mps.process_step.id;
            hiddenInput.name = 'material[process_step_ids][]';
          }
          if (materialProcessStepIdInput && mps.id) {
            materialProcessStepIdInput.value = mps.id;
          }
          
          // Mark as added and replace button with Edit/Remove
          stepRow.classList.add('process-step-added');
          const buttonContainer = stepRow.querySelector('.flex-shrink-0');
          if (buttonContainer) {
            buttonContainer.innerHTML = `
              <div class="flex gap-2">
                <button type="button" class="edit-process-step w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 border border-indigo-300 shadow-sm text-sm font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100">
                  Edit
                </button>
                <button type="button" class="remove-process-step w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100">
                  Remove
                </button>
              </div>
            `;
          }
          
          initProcessStepRow(stepRow);
        });
      }
    })
    .catch(error => {
      console.error('Error loading existing process steps:', error);
    });
  }
  
  addStepBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent duplicate row creation
    const existingEmptyRows = stepsList.querySelectorAll('.process-step-row:not(.process-step-added)');
    if (existingEmptyRows.length > 0) {
      // Focus on the first empty row instead of creating a new one
      const firstEmptyRow = existingEmptyRows[0];
      const searchInput = firstEmptyRow.querySelector('.process-step-search');
      if (searchInput) {
        searchInput.focus();
      }
      return;
    }
    
    window.processStepCounter++;
    const stepRow = createProcessStepRow(window.processStepCounter);
    stepsList.appendChild(stepRow);
    initProcessStepRow(stepRow);
    
    // Focus on the search input for better UX
    const searchInput = stepRow.querySelector('.process-step-search');
    if (searchInput) {
      searchInput.focus();
    }
  });
  
  function createProcessStepRow(counter) {
    const row = document.createElement('div');
    row.className = 'process-step-row flex flex-col sm:flex-row gap-4 items-stretch sm:items-end p-4 bg-gray-50 rounded-md';
    row.dataset.stepIndex = counter;
    row.innerHTML = `
      <div class="flex-1 min-w-0">
        <label class="block text-sm font-medium text-gray-700 mb-1">Process step description/code</label>
        <input type="text" 
               class="process-step-search shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md" 
               placeholder="Search approved process steps by code or description..."
               autocomplete="off" />
        <input type="hidden" class="process-step-id" />
        <input type="hidden" class="material-process-step-id" />
      </div>
      <div class="flex-shrink-0">
        <button type="button" class="add-process-step-btn w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
          Add
        </button>
      </div>
    `;
    return row;
  }
  
  // Function to add a process step (marks it as added)
  function addProcessStep(row) {
    const stepSearch = row.querySelector('.process-step-search');
    const hiddenInput = row.querySelector('.process-step-id');
    
    // Validate that process step is selected
    if (!hiddenInput.value) {
      alert('Please select a process step before adding.');
      return;
    }
    
    // Check if this step is already added in another row
    const allRows = document.querySelectorAll('.process-step-row.process-step-added');
    for (let otherRow of allRows) {
      if (otherRow === row) continue;
      const otherHiddenInput = otherRow.querySelector('.process-step-id');
      if (otherHiddenInput && otherHiddenInput.value === hiddenInput.value) {
        alert('This process step has already been added.');
        return;
      }
    }
    
    // Mark as added
    row.classList.add('process-step-added');
    
    // Grey out input
    stepSearch.classList.add('bg-gray-100', 'text-gray-600');
    stepSearch.setAttribute('readonly', 'readonly');
    
    // Replace Add button with Edit and Remove buttons
    const buttonContainer = row.querySelector('.flex-shrink-0');
    buttonContainer.innerHTML = `
      <div class="flex gap-2">
        <button type="button" class="edit-process-step w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 border border-indigo-300 shadow-sm text-sm font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100">
          Edit
        </button>
        <button type="button" class="remove-process-step w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100">
          Remove
        </button>
      </div>
    `;
    
    // Add event handlers
    buttonContainer.querySelector('.edit-process-step').addEventListener('click', function() {
      editProcessStep(row);
    });
    buttonContainer.querySelector('.remove-process-step').addEventListener('click', function() {
      removeProcessStep(row);
    });
    
    // Ensure hidden input is included in form submission
    if (hiddenInput) {
      hiddenInput.name = 'material[process_step_ids][]';
    }
  }

  // Function to edit a process step
  function editProcessStep(row) {
    const stepSearch = row.querySelector('.process-step-search');
    const hiddenInput = row.querySelector('.process-step-id');
    
    // Remove added state
    row.classList.remove('process-step-added');
    
    // Enable input
    stepSearch.classList.remove('bg-gray-100', 'text-gray-600');
    stepSearch.removeAttribute('readonly');
    
    // Replace Edit and Remove buttons with Add button
    const buttonContainer = row.querySelector('.flex-shrink-0');
    buttonContainer.innerHTML = `
      <button type="button" class="add-process-step-btn w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
        Add
      </button>
    `;
    
    // Add event handler
    buttonContainer.querySelector('.add-process-step-btn').addEventListener('click', function() {
      addProcessStep(row);
    });
    
    // Re-initialize autocomplete - clone the input to remove old event listeners
    const currentValue = stepSearch.value;
    const currentStepId = hiddenInput ? hiddenInput.value : '';
    const newInput = stepSearch.cloneNode(true);
    newInput.value = currentValue;
    newInput.removeAttribute('data-autocomplete-initialized'); // Reset initialization flag
    stepSearch.parentNode.replaceChild(newInput, stepSearch);
    
    // Restore the step ID if it was set
    const newHiddenInput = row.querySelector('.process-step-id');
    if (currentStepId && newHiddenInput) {
      newHiddenInput.value = currentStepId;
    }
    
    // Initialize autocomplete for the new input
    initProcessStepAutocomplete(newInput, row);
    
    // Focus on the search input for better UX
    newInput.focus();
  }

  // Function to remove a process step
  function removeProcessStep(row) {
    if (confirm('Are you sure you want to remove this process step?')) {
      row.remove();
    }
  }

  function initProcessStepRow(row) {
    const stepSearch = row.querySelector('.process-step-search');
    const hiddenInput = row.querySelector('.process-step-id');
    const addBtn = row.querySelector('.add-process-step-btn');
    
    // Initialize process step search autocomplete
    if (stepSearch && !stepSearch.dataset.autocompleteInitialized) {
      initProcessStepAutocomplete(stepSearch, row);
      stepSearch.dataset.autocompleteInitialized = 'true';
    }
    
    // Handle add button
    if (addBtn) {
      addBtn.addEventListener('click', function() {
        addProcessStep(row);
      });
    }
  }
  
  // Handle Edit and Remove buttons for existing steps (delegated event listeners)
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('edit-process-step')) {
      const row = e.target.closest('.process-step-row');
      if (row) {
        editProcessStep(row);
      }
    } else if (e.target.classList.contains('remove-process-step')) {
      const row = e.target.closest('.process-step-row');
      if (row) {
        removeProcessStep(row);
      }
    }
  });
  
  function initProcessStepAutocomplete(searchInput, row) {
    let dropdown = null;
    let timeout = null;
    const hiddenInput = row.querySelector('.process-step-id');
    
    searchInput.addEventListener('input', function() {
      // Don't search if the row is already added
      if (row.classList.contains('process-step-added')) return;
      
      const query = this.value.trim();
      
      clearTimeout(timeout);
      
      if (query.length < 2) {
        if (dropdown) dropdown.remove();
        dropdown = null;
        if (hiddenInput) hiddenInput.value = '';
        return;
      }
      
      timeout = setTimeout(function() {
        fetch(`/materials/process_steps/search.json?q=${encodeURIComponent(query)}`, {
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          }
        })
        .then(response => response.json())
        .then(data => {
          if (dropdown) dropdown.remove();
          
          // Get list of already added step IDs to filter them out
          const addedStepIds = [];
          const allRows = document.querySelectorAll('.process-step-row.process-step-added');
          allRows.forEach(addedRow => {
            const addedHiddenInput = addedRow.querySelector('.process-step-id');
            if (addedHiddenInput && addedHiddenInput.value) {
              addedStepIds.push(addedHiddenInput.value);
            }
          });
          
          if (data.process_steps && data.process_steps.length > 0) {
            dropdown = document.createElement('div');
            dropdown.className = 'absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm';
            dropdown.style.position = 'absolute';
            dropdown.style.top = '100%';
            dropdown.style.left = '0';
            dropdown.style.width = '100%';
            
            data.process_steps.forEach(step => {
              // Skip if this step is already added
              if (addedStepIds.includes(step.id.toString())) {
                return;
              }
              
              const item = document.createElement('div');
              item.className = 'cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50';
              item.innerHTML = `
                <div class="flex flex-col">
                  <span class="font-medium text-gray-900">${step.process_code}</span>
                  <span class="text-sm text-gray-500">${step.description}</span>
                </div>
              `;
              item.addEventListener('click', function() {
                searchInput.value = `${step.process_code} - ${step.description}`;
                if (hiddenInput) hiddenInput.value = step.id;
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
          console.error('Error searching process steps:', error);
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
  
  // Handle process step creation modal
  const modal = document.getElementById('process-step-modal');
  const modalForm = document.getElementById('process-step-form');
  const cancelModalBtn = document.getElementById('cancel-process-step-modal');
  const createNewBtn = document.getElementById('create-new-process-step');
  
  if (modal && cancelModalBtn) {
    cancelModalBtn.addEventListener('click', function() {
      modal.classList.add('hidden');
      if (modalForm) modalForm.reset();
    });
  }
  
  // Add "Create New" button functionality if needed
  // This would be similar to quality tests - allowing creation on the fly
}

function initStoresSubmenu() {
  const submenu = document.getElementById('stores-submenu');
  const toggleButton = document.querySelector('.stores-submenu-toggle');
  
  if (!submenu || !toggleButton) return;
  
  // Check if submenu should be expanded based on current path or saved state
  const isOnInventoryPage = window.location.pathname.includes('inventory-items');
  const isOnWarehousePage = window.location.pathname.includes('warehouse-locations') || window.location.pathname.includes('warehouse-location-types');
  const savedState = localStorage.getItem('stores-submenu-expanded');
  const shouldExpand = isOnInventoryPage || isOnWarehousePage || savedState === 'true';
  
  if (shouldExpand) {
    submenu.classList.remove('hidden');
    toggleButton.querySelector('svg').style.transform = 'rotate(180deg)';
  }
  
  // Add click event listener to toggle button
  toggleButton.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const icon = this.querySelector('svg');
    const isHidden = submenu.classList.contains('hidden');
    
    if (isHidden) {
      submenu.classList.remove('hidden');
      icon.style.transform = 'rotate(180deg)';
      localStorage.setItem('stores-submenu-expanded', 'true');
    } else {
      submenu.classList.add('hidden');
      icon.style.transform = 'rotate(0deg)';
      localStorage.setItem('stores-submenu-expanded', 'false');
    }
  });
  
  // Prevent Stores link from toggling submenu when clicking the toggle button
  const storesLink = toggleButton.closest('.sidebar-link');
  if (storesLink) {
    storesLink.addEventListener('click', function(e) {
      // Only prevent default if clicking on the toggle button area
      if (e.target.closest('.stores-submenu-toggle')) {
        e.preventDefault();
      }
    });
  }
}

export default initMaterials;

