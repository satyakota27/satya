class CreateSalesOrders < ActiveRecord::Migration[8.0]
  def change
    create_table :sales_orders do |t|
      t.references :tenant, null: false, foreign_key: true
      t.references :customer, null: false, foreign_key: true
      t.string :sale_order_number
      t.string :purchase_order_number
      t.date :purchase_order_date, null: false
      t.string :state, default: 'draft', null: false
      t.string :currency, default: 'INR', null: false
      t.decimal :subtotal, precision: 12, scale: 2, default: 0.0
      t.decimal :discount_amount, precision: 12, scale: 2, default: 0.0
      t.decimal :tax_amount, precision: 12, scale: 2, default: 0.0
      t.decimal :total_amount, precision: 12, scale: 2, default: 0.0
      t.boolean :partial_dispatch_allowed, default: false, null: false
      t.text :remarks
      t.datetime :confirmed_at
      t.datetime :dispatched_at
      t.datetime :completed_at
      t.datetime :cancelled_at
      t.references :confirmed_by, foreign_key: { to_table: :users }, null: true
      t.references :cancelled_by, foreign_key: { to_table: :users }, null: true

      t.timestamps
    end

    add_index :sales_orders, :sale_order_number
    add_index :sales_orders, [:tenant_id, :sale_order_number], unique: true
    add_index :sales_orders, :state
    add_index :sales_orders, :purchase_order_number
    add_index :sales_orders, :purchase_order_date
    # customer_id index is automatically created by foreign_key: true
  end
end

