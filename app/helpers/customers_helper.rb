module CustomersHelper
  def customer_status_badge(customer)
    if customer.active?
      content_tag :span, 'Active', class: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'
    else
      content_tag :span, 'Inactive', class: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'
    end
  end

  def customer_contact_info(customer)
    primary_contact = customer.customer_contacts.first
    return 'No contacts' unless primary_contact
    
    info = []
    info << primary_contact.email if primary_contact.email.present?
    info << primary_contact.phone if primary_contact.phone.present?
    info.any? ? info.join(' | ') : 'No contact details'
  end
end

