class ChangeBomComponentQuantityToInteger < ActiveRecord::Migration[8.0]
  def up
    # First, convert any existing decimal values to integers (round to nearest integer)
    execute <<-SQL
      UPDATE material_bom_components 
      SET quantity = ROUND(quantity::numeric)::integer
    SQL
    
    # Change the column type from decimal to integer
    change_column :material_bom_components, :quantity, :integer, null: false
  end

  def down
    # Revert back to decimal
    change_column :material_bom_components, :quantity, :decimal, precision: 10, scale: 2, null: false
  end
end
