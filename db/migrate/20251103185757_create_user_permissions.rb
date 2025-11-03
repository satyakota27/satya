class CreateUserPermissions < ActiveRecord::Migration[8.0]
  def change
    create_table :user_permissions do |t|
      t.references :user, null: false, foreign_key: true
      t.references :sub_functionality, null: false, foreign_key: true

      t.timestamps
    end

    add_index :user_permissions, [:user_id, :sub_functionality_id], unique: true, name: 'index_user_permissions_on_user_and_sub_functionality'
  end
end
