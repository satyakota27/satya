class AddForeignKeyToUsersTenant < ActiveRecord::Migration[8.0]
  def change
    add_foreign_key :users, :tenants
  end
end
