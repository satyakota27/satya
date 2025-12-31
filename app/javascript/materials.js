function initMaterials() {
  // Material Wizard
  initMaterialWizard();
  
  // Tracking Type Toggle
  initTrackingTypeToggle();
  
  // Sidebar Toggle
  initSidebarToggle();
  
  // Material Submenu Toggle
  initMaterialSubmenu();
  
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
          
          data.materials.forEach(function(material) {
            const item = document.createElement('div');
            item.className = 'cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50';
            item.innerHTML = `
              <div class="font-medium text-gray-900">${material.material_code || 'Draft'}</div>
              <div class="text-sm text-gray-500">${material.description}</div>
            `;
            item.addEventListener('click', function(e) {
              e.stopPropagation();
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
  const savedState = localStorage.getItem('material-submenu-expanded');
  const shouldExpand = isOnUnitsPage || savedState === 'true';
  
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
  const totalSteps = 3;
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
    
    if (nextBtn && submitBtn) {
      if (step === totalSteps) {
        nextBtn.classList.add('hidden');
        submitBtn.classList.remove('hidden');
      } else {
        nextBtn.classList.remove('hidden');
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

export default initMaterials;

