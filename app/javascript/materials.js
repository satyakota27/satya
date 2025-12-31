function initMaterials() {
  // Sidebar Toggle
  initSidebarToggle();
  
  // Material Submenu Toggle
  initMaterialSubmenu();
  
  // Dynamic Material Search
  initDynamicMaterialSearch();
  
  // BOM Toggle

  // BOM Toggle
  const hasBomCheckbox = document.getElementById('material_has_bom');
  const bomSection = document.getElementById('bom-components-section');
  
  if (hasBomCheckbox && bomSection) {
    hasBomCheckbox.addEventListener('change', function() {
      if (this.checked) {
        bomSection.classList.remove('hidden');
      } else {
        bomSection.classList.add('hidden');
      }
    });
  }

  // Add BOM Component
  const addBomButton = document.getElementById('add-bom-component');
  const bomList = document.getElementById('bom-components-list');
  
  if (addBomButton && bomList) {
    addBomButton.addEventListener('click', function() {
      const row = document.createElement('div');
      row.className = 'bom-component-row flex gap-4 items-end p-4 bg-gray-50 rounded-md';
      row.innerHTML = `
        <div class="flex-1 min-w-0">
          <label class="block text-sm font-medium text-gray-700 mb-1">Component material description/code</label>
          <input type="text" 
                 class="material-search shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md" 
                 placeholder="Search by material code or description..."
                 autocomplete="off" />
          <input type="hidden" name="material[bom_component_material_ids][]" class="bom-material-id" />
        </div>
        <div class="w-full sm:w-32">
          <label class="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
          <input type="number" 
                 step="0.01" 
                 name="material[bom_component_quantities][]" 
                 class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md" 
                 required />
        </div>
        <div class="flex-shrink-0">
          <button type="button" class="remove-bom-component w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100">
            Remove
          </button>
        </div>
      `;
      row.className = 'bom-component-row flex flex-col sm:flex-row gap-4 items-stretch sm:items-end p-4 bg-gray-50 rounded-md';
      bomList.appendChild(row);
      
      // Initialize autocomplete for the new row
      initMaterialAutocomplete(row.querySelector('.material-search'));
      
      // Add remove handler
      row.querySelector('.remove-bom-component').addEventListener('click', function() {
        row.remove();
      });
    });
  }

  // Remove BOM Component
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('remove-bom-component')) {
      e.target.closest('.bom-component-row').remove();
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
  let timeout;
  let dropdown = null;

  input.addEventListener('input', function() {
    const query = this.value.trim();
    // Find the hidden input - check for bom-material-id class first, then fallback to any hidden input
    const hiddenInput = this.parentElement.querySelector('.bom-material-id') || 
                        this.parentElement.querySelector('input[type="hidden"]');
    
    clearTimeout(timeout);
    
    if (query.length < 2) {
      if (dropdown) {
        dropdown.remove();
        dropdown = null;
      }
      return;
    }

    timeout = setTimeout(function() {
      fetch(`/materials/search.json?q=${encodeURIComponent(query)}`, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json'
        }
      })
      .then(response => response.json())
      .then(data => {
        if (dropdown) {
          dropdown.remove();
        }
        
        if (data.materials && data.materials.length > 0) {
          dropdown = document.createElement('div');
          dropdown.className = 'absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto';
          dropdown.style.position = 'absolute';
          dropdown.style.top = '100%';
          dropdown.style.left = '0';
          dropdown.style.width = input.offsetWidth + 'px';
          
          data.materials.forEach(function(material) {
            const item = document.createElement('div');
            item.className = 'cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50';
            item.innerHTML = `
              <div class="font-medium text-gray-900">${material.material_code || 'Draft'}</div>
              <div class="text-sm text-gray-500">${material.description}</div>
            `;
            item.addEventListener('click', function() {
              input.value = `${material.material_code || 'Draft'} - ${material.description}`;
              if (hiddenInput) {
                hiddenInput.value = material.id;
              }
              dropdown.remove();
              dropdown = null;
            });
            dropdown.appendChild(item);
          });
          
          input.parentElement.style.position = 'relative';
          input.parentElement.appendChild(dropdown);
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
    }, 300);
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', function(e) {
    if (dropdown && !input.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.remove();
      dropdown = null;
    }
  });
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

export default initMaterials;

