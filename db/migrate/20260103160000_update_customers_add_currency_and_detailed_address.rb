class UpdateCustomersAddCurrencyAndDetailedAddress < ActiveRecord::Migration[8.0]
  def change
    add_column :customers, :default_currency, :string, default: 'INR', null: false
    
    # Detailed billing address fields
    add_column :customers, :billing_street_address, :string
    add_column :customers, :billing_city, :string
    add_column :customers, :billing_state, :string
    add_column :customers, :billing_postal_code, :string
    add_column :customers, :billing_country, :string
    
    # Remove old fields (keep for now, will be removed in separate migration if needed)
    # remove_column :customers, :tax_category
    # remove_column :customers, :payment_terms
  end
end

