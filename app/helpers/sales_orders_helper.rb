module SalesOrdersHelper
  def sales_order_state_badge(state)
    case state
    when 'draft'
      content_tag :span, 'Draft', class: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'
    when 'confirmed'
      content_tag :span, 'Confirmed', class: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'
    when 'dispatched'
      content_tag :span, 'Dispatched', class: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800'
    when 'completed'
      content_tag :span, 'Completed', class: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'
    when 'cancelled'
      content_tag :span, 'Cancelled', class: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800'
    else
      state.to_s.humanize
    end
  end

  def format_currency(amount, currency = 'INR')
    case currency
    when 'USD'
      number_to_currency(amount, unit: '$', precision: 2)
    when 'INR'
      number_to_currency(amount, unit: '₹', precision: 2)
    else
      number_to_currency(amount, unit: currency, precision: 2)
    end
  end

  def sales_order_workflow_actions(sales_order)
    actions = []
    
    if can?(:confirm, sales_order) && sales_order.can_confirm?
      actions << link_to('Confirm', confirm_sales_order_path(sales_order), 
                        method: :post, 
                        class: 'inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                        data: { confirm: 'Are you sure you want to confirm this order?' })
    end
    
    if can?(:dispatch, sales_order) && sales_order.can_dispatch?
      actions << link_to('Dispatch', dispatch_sales_order_path(sales_order), 
                        method: :post,
                        class: 'inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500',
                        data: { confirm: 'Are you sure you want to dispatch this order?' })
    end
    
    if can?(:complete, sales_order) && sales_order.can_complete?
      actions << link_to('Complete', complete_sales_order_path(sales_order), 
                        method: :post,
                        class: 'inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500',
                        data: { confirm: 'Are you sure you want to complete this order?' })
    end
    
    if can?(:cancel, sales_order) && sales_order.can_cancel?
      actions << link_to('Cancel', cancel_sales_order_path(sales_order), 
                        method: :post,
                        class: 'inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500',
                        data: { confirm: 'Are you sure you want to cancel this order?' })
    end
    
    safe_join(actions, ' ')
  end

  def line_item_dispatch_status(line_item)
    if line_item.fully_dispatched?
      content_tag :span, 'Fully Dispatched', class: 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800'
    elsif line_item.partially_dispatched?
      content_tag :span, "Partially Dispatched (#{line_item.dispatched_quantity}/#{line_item.quantity})", class: 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800'
    else
      content_tag :span, 'Not Dispatched', class: 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800'
    end
  end
end

