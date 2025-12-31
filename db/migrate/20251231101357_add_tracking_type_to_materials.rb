class AddTrackingTypeToMaterials < ActiveRecord::Migration[8.0]
  def change
    add_column :materials, :tracking_type, :string
    add_column :materials, :sample_size, :integer
    add_index :materials, :tracking_type
  end
end
