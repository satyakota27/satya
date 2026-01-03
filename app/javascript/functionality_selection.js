// Functionality selection UI interactions
export default function initFunctionalitySelection() {
  const functionalitySelection = document.getElementById('functionality-selection');
  if (!functionalitySelection) return;

  // Prevent duplicate event listeners
  if (functionalitySelection.dataset.initialized === 'true') return;
  functionalitySelection.dataset.initialized = 'true';

  // Toggle expand/collapse for functionality sections
  functionalitySelection.addEventListener('click', function(e) {
    const button = e.target.closest('.functionality-toggle');
    if (button) {
      e.preventDefault();
      e.stopPropagation();
      const functionalityId = button.dataset.functionalityId;
      const subItems = document.querySelector(`.functionality-sub-items[data-functionality-id="${functionalityId}"]`);
      const expandText = button.querySelector('.expand-text');
      const collapseText = button.querySelector('.collapse-text');
      
      if (subItems) {
        subItems.classList.toggle('hidden');
        if (expandText) expandText.classList.toggle('hidden');
        if (collapseText) collapseText.classList.toggle('hidden');
      }
    }
  });

  // Select All functionality
  functionalitySelection.addEventListener('change', function(e) {
    if (e.target.classList.contains('functionality-select-all')) {
      const functionalityId = e.target.dataset.functionalityId;
      const subCheckboxes = document.querySelectorAll(
        `.sub-functionality-checkbox[data-functionality-id="${functionalityId}"]`
      );
      
      subCheckboxes.forEach(checkbox => {
        checkbox.checked = e.target.checked;
      });
      
      updateSelectedCount();
    } else if (e.target.classList.contains('sub-functionality-checkbox')) {
      updateSelectedCount();
      updateSelectAllState(e.target.dataset.functionalityId);
    }
  });

  // Update selected count
  function updateSelectedCount() {
    const checkboxes = functionalitySelection.querySelectorAll('.sub-functionality-checkbox:checked');
    const countElement = document.getElementById('selected-count');
    if (countElement) {
      countElement.textContent = checkboxes.length;
    }
  }

  // Update select all checkbox state based on sub-checkboxes
  function updateSelectAllState(functionalityId) {
    const subCheckboxes = Array.from(
      document.querySelectorAll(`.sub-functionality-checkbox[data-functionality-id="${functionalityId}"]`)
    );
    const selectAllCheckbox = document.getElementById(`functionality_${functionalityId}_select_all`);
    
    if (selectAllCheckbox && subCheckboxes.length > 0) {
      const allChecked = subCheckboxes.every(cb => cb.checked);
      const someChecked = subCheckboxes.some(cb => cb.checked);
      
      selectAllCheckbox.checked = allChecked;
      selectAllCheckbox.indeterminate = someChecked && !allChecked;
    }
  }

  // Initialize select all states and count
  const allFunctionalityIds = Array.from(
    new Set(
      Array.from(document.querySelectorAll('.sub-functionality-checkbox')).map(
        cb => cb.dataset.functionalityId
      )
    )
  );
  
  allFunctionalityIds.forEach(id => {
    updateSelectAllState(id);
  });
  
  updateSelectedCount();
}

