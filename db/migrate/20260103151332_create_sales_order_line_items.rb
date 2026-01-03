class CreateSalesOrderLineItems < ActiveRecord::Migration[8.0]
  def change
    create_table :sales_order_line_items do |t|
      t.references :sales_order, null: false, foreign_key: true
      t.references :material, null: false, foreign_key: true
      t.integer :quantity, null: false
      t.decimal :unit_price, precision: 12, scale: 2, null: false
      t.decimal :basic_value, precision: 12, scale: 2
      t.decimal :discount_percentage, precision: 5, scale: 2, default: 0.0
      t.decimal :discount_amount, precision: 12, scale: 2, default: 0.0
      t.decimal :tax_percentage, precision: 5, scale: 2, default: 0.0
      t.decimal :tax_amount, precision: 12, scale: 2, default: 0.0
      t.decimal :line_total, precision: 12, scale: 2, default: 0.0
      t.date :dispatch_date, null: false
      t.integer :dispatched_quantity, default: 0, null: false
      t.text :notes

      t.timestamps
    end

    # sales_order_id and material_id indexes are automatically created by foreign_key: true
    add_index :sales_order_line_items, :dispatch_date
  end
end

