class UpdateShelfLifeToMaterials < ActiveRecord::Migration[8.0]
  def change
    remove_column :materials, :shelf_life_days, :integer
    add_column :materials, :shelf_life_years, :integer
    add_column :materials, :shelf_life_months, :integer
    add_column :materials, :shelf_life_weeks, :integer
    add_column :materials, :shelf_life_days, :integer
    add_column :materials, :shelf_life_hours, :integer
    add_column :materials, :shelf_life_minutes, :integer
    add_column :materials, :shelf_life_seconds, :integer
  end
end
