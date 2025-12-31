class AddShelfLifeToMaterials < ActiveRecord::Migration[8.0]
  def change
    add_column :materials, :has_shelf_life, :boolean, default: false, null: false
    add_column :materials, :shelf_life_days, :integer
  end
end
