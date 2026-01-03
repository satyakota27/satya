class CreateCustomers < ActiveRecord::Migration[8.0]
  def change
    create_table :customers do |t|
      t.references :tenant, null: false, foreign_key: true
      t.string :customer_code
      t.string :name, null: false
      t.string :contact_person
      t.string :email
      t.string :phone
      t.text :billing_address
      t.text :shipping_address
      t.string :tax_id
      t.string :tax_category
      t.text :payment_terms
      t.decimal :credit_limit, precision: 12, scale: 2
      t.boolean :active, default: true, null: false

      t.timestamps
    end

    add_index :customers, :customer_code
    add_index :customers, [:tenant_id, :customer_code], unique: true
    add_index :customers, :active
    add_index :customers, :email
  end
end

