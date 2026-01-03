function initInventoryItems() {
  // Handle material selection change to show/hide serial/batch fields and legacy fields
  const materialSelect = document.getElementById('inventory_item_material_id');
  const serialField = document.getElementById('serial-number-field');
  const batchField = document.getElementById('batch-number-field');
  const legacySerialField = document.getElementById('legacy-serial-field');
  const legacyBatchField = document.getElementById('legacy-batch-field');
  
  function updateFieldVisibility(trackingType) {
    if (trackingType === 'unit') {
      if (serialField) serialField.style.display = 'block';
      if (batchField) batchField.style.display = 'none';
      if (legacySerialField) legacySerialField.style.display = 'block';
      if (legacyBatchField) legacyBatchField.style.display = 'none';
    } else if (trackingType === 'batch') {
      if (serialField) serialField.style.display = 'none';
      if (batchField) batchField.style.display = 'block';
      if (legacySerialField) legacySerialField.style.display = 'none';
      if (legacyBatchField) legacyBatchField.style.display = 'block';
    }
  }
  
  // Set initial visibility based on existing material (if editing)
  const initialMaterial = document.querySelector('[data-material-tracking-type]');
  if (initialMaterial) {
    const trackingType = initialMaterial.getAttribute('data-material-tracking-type');
    updateFieldVisibility(trackingType);
  }
  
  // Handle material selection change
  if (materialSelect) {
    materialSelect.addEventListener('change', function() {
      const materialId = this.value;
      if (materialId) {
        fetch(`/materials/${materialId}.json`)
          .then(response => response.json())
          .then(data => {
            updateFieldVisibility(data.tracking_type);
          })
          .catch(error => {
            console.error('Error fetching material:', error);
          });
      } else {
        // Hide all fields if no material selected
        if (serialField) serialField.style.display = 'none';
        if (batchField) batchField.style.display = 'none';
        if (legacySerialField) legacySerialField.style.display = 'none';
        if (legacyBatchField) legacyBatchField.style.display = 'none';
      }
    });
  }
}

export default initInventoryItems;

