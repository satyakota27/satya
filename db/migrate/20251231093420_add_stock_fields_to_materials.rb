class AddStockFieldsToMaterials < ActiveRecord::Migration[8.0]
  def change
    add_column :materials, :has_minimum_stock_value, :boolean, default: false, null: false
    add_column :materials, :minimum_stock_value, :integer
    add_column :materials, :has_minimum_reorder_value, :boolean, default: false, null: false
    add_column :materials, :minimum_reorder_value, :integer
  end
end
