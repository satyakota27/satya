class CreateSubscriptions < ActiveRecord::Migration[8.0]
  def change
    create_table :subscriptions do |t|
      t.references :tenant, null: false, foreign_key: true
      t.string :tier

      t.timestamps
    end
  end
end
