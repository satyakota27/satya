class AddRejectionToMaterials < ActiveRecord::Migration[8.0]
  def change
    add_column :materials, :approver_comments, :text
    add_column :materials, :rejected_by_id, :bigint
    add_column :materials, :approved_by_id, :bigint
    add_column :materials, :rejected_at, :datetime
    add_column :materials, :approved_at, :datetime
    
    add_index :materials, :rejected_by_id
    add_index :materials, :approved_by_id
  end
end
