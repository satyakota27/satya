function initCustomers() {
  // Sales submenu toggle (if not already initialized)
  const salesSubmenuToggle = document.querySelector('.sales-submenu-toggle');
  const salesSubmenu = document.getElementById('sales-submenu');

  if (salesSubmenuToggle && salesSubmenu && !salesSubmenuToggle.dataset.initialized) {
    salesSubmenuToggle.dataset.initialized = 'true';
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

  // Customer form functionality
  if (document.getElementById('customer-form')) {
    initCustomerForm();
  }
}

function initCustomerForm() {
  const customerForm = document.getElementById('customer-form');
  if (!customerForm || customerForm.dataset.initialized === 'true') {
    return;
  }
  customerForm.dataset.initialized = 'true';

  // Initialize "same as billing" checkboxes for existing addresses
  initializeSameAsBillingCheckboxes();

  // Add contact
  const addContactButton = document.getElementById('add-contact');
  const contactsContainer = document.getElementById('contacts-container');
  const noContactsMessage = document.getElementById('no-contacts-message');

  if (addContactButton && contactsContainer) {
    addContactButton.addEventListener('click', function(e) {
      e.preventDefault();
      if (noContactsMessage) {
        noContactsMessage.remove();
      }
      
      // Calculate next index - find the highest existing index and add 1
      const existingContacts = contactsContainer.querySelectorAll('.contact-fields:not([style*="display: none"])');
      let maxIndex = -1;
      existingContacts.forEach(function(contact) {
        // Check input names for index (most reliable)
        const nameInput = contact.querySelector('input[name*="[name]"]');
        if (nameInput && nameInput.name) {
          const match = nameInput.name.match(/customer_contacts_attributes\]\[(\d+)\]/);
          if (match) {
            const index = parseInt(match[1], 10);
            if (index > maxIndex) maxIndex = index;
          }
        }
      });
      const contactIndex = maxIndex + 1;
      
      const newContact = createContactFields(contactIndex);
      contactsContainer.appendChild(newContact);
    });
  }

  // Remove contact - use event delegation
  if (contactsContainer) {
    contactsContainer.addEventListener('click', function(e) {
      if (e.target.closest('.remove-contact')) {
        e.preventDefault();
        const contactFields = e.target.closest('.contact-fields');
        if (contactFields) {
          const destroyField = contactFields.querySelector('.destroy-field');
          if (destroyField) {
            destroyField.value = '1';
            contactFields.style.display = 'none';
          } else {
            contactFields.remove();
          }
          
          // Show no contacts message if no visible contacts left
          const visibleContacts = contactsContainer.querySelectorAll('.contact-fields:not([style*="display: none"])');
          const noContactsMsg = document.getElementById('no-contacts-message');
          if (visibleContacts.length === 0 && !noContactsMsg) {
            const noContacts = document.createElement('div');
            noContacts.id = 'no-contacts-message';
            noContacts.className = 'text-center py-4 text-sm text-gray-500';
            noContacts.textContent = 'No contacts added. Click "Add Contact" to add contact details.';
            contactsContainer.appendChild(noContacts);
          }
        }
      }
    });
  }

  // Add shipping address
  const addShippingButton = document.getElementById('add-shipping-address');
  const shippingContainer = document.getElementById('shipping-addresses-container');
  const noAddressesMessage = document.getElementById('no-addresses-message');

  if (addShippingButton && shippingContainer) {
    addShippingButton.addEventListener('click', function(e) {
      e.preventDefault();
      if (noAddressesMessage) {
        noAddressesMessage.remove();
      }
      
      // Calculate next index - find the highest existing index and add 1
      const existingAddresses = shippingContainer.querySelectorAll('.shipping-address-fields:not([style*="display: none"])');
      let maxIndex = -1;
      existingAddresses.forEach(function(address) {
        // Check input names for index (most reliable)
        const nameInput = address.querySelector('input[name*="[name]"]');
        if (nameInput && nameInput.name) {
          const match = nameInput.name.match(/customer_shipping_addresses_attributes\]\[(\d+)\]/);
          if (match) {
            const index = parseInt(match[1], 10);
            if (index > maxIndex) maxIndex = index;
          }
        }
      });
      const shippingAddressIndex = maxIndex + 1;
      
      const newAddress = createShippingAddressFields(shippingAddressIndex);
      shippingContainer.appendChild(newAddress);
    });
  }

  // Remove shipping address - use event delegation
  if (shippingContainer) {
    shippingContainer.addEventListener('click', function(e) {
      if (e.target.closest('.remove-shipping-address')) {
        e.preventDefault();
        const addressFields = e.target.closest('.shipping-address-fields');
        if (addressFields) {
          const destroyField = addressFields.querySelector('.destroy-field');
          if (destroyField) {
            destroyField.value = '1';
            addressFields.style.display = 'none';
          } else {
            addressFields.remove();
          }
          
          // Show no addresses message if no visible addresses left
          const visibleAddresses = shippingContainer.querySelectorAll('.shipping-address-fields:not([style*="display: none"])');
          const noAddressesMsg = document.getElementById('no-addresses-message');
          if (visibleAddresses.length === 0 && !noAddressesMsg) {
            const noAddresses = document.createElement('div');
            noAddresses.id = 'no-addresses-message';
            noAddresses.className = 'text-center py-4 text-sm text-gray-500';
            noAddresses.textContent = 'No shipping addresses added. Click "Add Shipping Address" to add addresses.';
            shippingContainer.appendChild(noAddresses);
          }
        }
      }
    });
  }

  // Same as billing address functionality
  document.addEventListener('change', function(e) {
    if (e.target.classList.contains('same-as-billing')) {
      const index = e.target.dataset.index;
      const addressFields = e.target.closest('.shipping-address-fields');
      
      if (e.target.checked) {
        // Copy billing address fields
        const billingStreet = document.getElementById('customer_billing_street_address');
        const billingCity = document.getElementById('customer_billing_city');
        const billingState = document.getElementById('customer_billing_state');
        const billingPostal = document.getElementById('customer_billing_postal_code');
        const billingCountry = document.getElementById('customer_billing_country');
        
        if (addressFields) {
          const shippingStreet = addressFields.querySelector('.shipping-street-address');
          const shippingCity = addressFields.querySelector('.shipping-city');
          const shippingState = addressFields.querySelector('.shipping-state');
          const shippingPostal = addressFields.querySelector('.shipping-postal-code');
          const shippingCountry = addressFields.querySelector('.shipping-country');
          
          if (billingStreet && shippingStreet) shippingStreet.value = billingStreet.value;
          if (billingCity && shippingCity) shippingCity.value = billingCity.value;
          if (billingState && shippingState) shippingState.value = billingState.value;
          if (billingPostal && shippingPostal) shippingPostal.value = billingPostal.value;
          if (billingCountry && shippingCountry) shippingCountry.value = billingCountry.value;
          
          // Make fields readonly (readonly fields ARE submitted, disabled fields are NOT)
          [shippingStreet, shippingCity, shippingState, shippingPostal, shippingCountry].forEach(field => {
            if (field) {
              field.readOnly = true;
              field.classList.add('bg-gray-50', 'cursor-not-allowed');
            }
          });
        }
      } else {
        // Make fields editable again
        if (addressFields) {
          const fields = addressFields.querySelectorAll('.shipping-street-address, .shipping-city, .shipping-state, .shipping-postal-code, .shipping-country');
          fields.forEach(field => {
            field.readOnly = false;
            field.classList.remove('bg-gray-50', 'cursor-not-allowed');
          });
        }
      }
    }
  });

  // Also sync when billing address fields change (if same-as-billing is checked)
  const billingFields = ['customer_billing_street_address', 'customer_billing_city', 
                         'customer_billing_state', 'customer_billing_postal_code', 'customer_billing_country'];
  
  billingFields.forEach(function(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
      field.addEventListener('input', function() {
        // Find all shipping address fields with same-as-billing checked
        const checkedBoxes = document.querySelectorAll('.same-as-billing:checked');
        checkedBoxes.forEach(function(checkbox) {
          const addressFields = checkbox.closest('.shipping-address-fields');
          if (addressFields) {
            const fieldName = fieldId.replace('customer_billing_', '').replace('_', '-');
            const shippingField = addressFields.querySelector('.shipping-' + fieldName);
            if (shippingField && shippingField.readOnly) {
              shippingField.value = field.value;
            }
          }
        });
      });
    }
  });

  // Default shipping address - ensure only one is default
  document.addEventListener('change', function(e) {
    if (e.target.name && e.target.name.includes('is_default') && e.target.checked) {
      const currentAddress = e.target.closest('.shipping-address-fields');
      const allAddresses = document.querySelectorAll('.shipping-address-fields');
      
      allAddresses.forEach(function(address) {
        if (address !== currentAddress) {
          const defaultCheckbox = address.querySelector('input[name*="is_default"]');
          if (defaultCheckbox) {
            defaultCheckbox.checked = false;
          }
        }
      });
    }
  });
}

function createContactFields(index) {
  const div = document.createElement('div');
  div.className = 'contact-fields border border-gray-200 rounded-lg p-4 mb-4';
  div.setAttribute('data-index', index);
  
  div.innerHTML = `
    <div class="flex items-center justify-between mb-4">
      <h4 class="text-sm font-medium text-gray-900">Contact ${index + 1}</h4>
      <button type="button" class="remove-contact text-red-600 hover:text-red-900">
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label class="block text-sm font-medium text-gray-700">
          Name <span class="text-red-500">*</span>
        </label>
        <div class="mt-1">
          <input type="text" name="customer[customer_contacts_attributes][${index}][name]" required class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md">
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Email</label>
        <div class="mt-1">
          <input type="email" name="customer[customer_contacts_attributes][${index}][email]" class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md">
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Phone/Contact Number</label>
        <div class="mt-1">
          <input type="text" name="customer[customer_contacts_attributes][${index}][phone]" class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md">
        </div>
      </div>

      <div class="sm:col-span-2">
        <label class="block text-sm font-medium text-gray-700">Remarks</label>
        <div class="mt-1">
          <textarea name="customer[customer_contacts_attributes][${index}][remarks]" rows="2" class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"></textarea>
        </div>
      </div>
    </div>
  `;
  
  return div;
}

function createShippingAddressFields(index) {
  const div = document.createElement('div');
  div.className = 'shipping-address-fields border border-gray-200 rounded-lg p-4 mb-4';
  div.setAttribute('data-index', index);
  
  div.innerHTML = `
    <div class="flex items-center justify-between mb-4">
      <h4 class="text-sm font-medium text-gray-900">Shipping Address ${index + 1}</h4>
      <div class="flex items-center gap-2">
        <label class="flex items-center">
          <input type="checkbox" name="customer[customer_shipping_addresses_attributes][${index}][is_default]" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
          <span class="ml-2 text-sm text-gray-700">Default</span>
        </label>
        <button type="button" class="remove-shipping-address text-red-600 hover:text-red-900">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <div class="mb-4">
      <label class="flex items-center">
        <input type="checkbox" class="same-as-billing h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" data-index="${index}">
        <span class="ml-2 text-sm text-gray-700">Same as billing address</span>
      </label>
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label class="block text-sm font-medium text-gray-700">
          Address Name <span class="text-red-500">*</span>
        </label>
        <div class="mt-1">
          <input type="text" name="customer[customer_shipping_addresses_attributes][${index}][name]" required placeholder="e.g., Main Warehouse, Branch Office" class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md">
        </div>
      </div>

      <div class="sm:col-span-2">
        <label class="block text-sm font-medium text-gray-700">Street Address</label>
        <div class="mt-1">
          <input type="text" name="customer[customer_shipping_addresses_attributes][${index}][street_address]" class="shipping-street-address shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md">
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">City</label>
        <div class="mt-1">
          <input type="text" name="customer[customer_shipping_addresses_attributes][${index}][city]" class="shipping-city shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md">
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">State/Province</label>
        <div class="mt-1">
          <input type="text" name="customer[customer_shipping_addresses_attributes][${index}][state]" class="shipping-state shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md">
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Postal Code</label>
        <div class="mt-1">
          <input type="text" name="customer[customer_shipping_addresses_attributes][${index}][postal_code]" class="shipping-postal-code shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md">
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Country</label>
        <div class="mt-1">
          <input type="text" name="customer[customer_shipping_addresses_attributes][${index}][country]" class="shipping-country shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md">
        </div>
      </div>

      <div class="sm:col-span-2">
        <label class="block text-sm font-medium text-gray-700">Remarks</label>
        <div class="mt-1">
          <textarea name="customer[customer_shipping_addresses_attributes][${index}][remarks]" rows="2" class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"></textarea>
        </div>
      </div>
    </div>
  `;
  
  return div;
}

function initializeSameAsBillingCheckboxes() {
  // Check if existing shipping addresses match billing address
  const billingStreet = document.getElementById('customer_billing_street_address');
  const billingCity = document.getElementById('customer_billing_city');
  const billingState = document.getElementById('customer_billing_state');
  const billingPostal = document.getElementById('customer_billing_postal_code');
  const billingCountry = document.getElementById('customer_billing_country');
  
  if (!billingStreet || !billingCity || !billingState || !billingPostal || !billingCountry) {
    return;
  }
  
  const billingValues = {
    street: billingStreet.value,
    city: billingCity.value,
    state: billingState.value,
    postal: billingPostal.value,
    country: billingCountry.value
  };
  
  // Check each shipping address
  const shippingAddresses = document.querySelectorAll('.shipping-address-fields');
  shippingAddresses.forEach(function(addressFields) {
    const shippingStreet = addressFields.querySelector('.shipping-street-address');
    const shippingCity = addressFields.querySelector('.shipping-city');
    const shippingState = addressFields.querySelector('.shipping-state');
    const shippingPostal = addressFields.querySelector('.shipping-postal-code');
    const shippingCountry = addressFields.querySelector('.shipping-country');
    const sameAsBillingCheckbox = addressFields.querySelector('.same-as-billing');
    
    if (shippingStreet && shippingCity && shippingState && shippingPostal && shippingCountry && sameAsBillingCheckbox) {
      // Check if values match
      const matches = shippingStreet.value === billingValues.street &&
                     shippingCity.value === billingValues.city &&
                     shippingState.value === billingValues.state &&
                     shippingPostal.value === billingValues.postal &&
                     shippingCountry.value === billingValues.country &&
                     billingValues.street && billingValues.city && billingValues.state && billingValues.postal && billingValues.country;
      
      if (matches) {
        sameAsBillingCheckbox.checked = true;
        // Trigger the change event to apply readonly styling
        sameAsBillingCheckbox.dispatchEvent(new Event('change'));
      }
    }
  });
}

export default initCustomers;
