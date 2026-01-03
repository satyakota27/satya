class CreateCustomerShippingAddresses < ActiveRecord::Migration[8.0]
  def change
    create_table :customer_shipping_addresses do |t|
      t.references :customer, null: false, foreign_key: true
      t.string :name, null: false
      t.string :street_address
      t.string :city
      t.string :state
      t.string :postal_code
      t.string :country
      t.boolean :is_default, default: false, null: false
      t.text :remarks

      t.timestamps
    end

    # customer_id index is automatically created by foreign_key: true
    add_index :customer_shipping_addresses, :is_default
  end
end

