class CreateCustomerContacts < ActiveRecord::Migration[8.0]
  def change
    create_table :customer_contacts do |t|
      t.references :customer, null: false, foreign_key: true
      t.string :name, null: false
      t.string :email
      t.string :phone
      t.text :remarks

      t.timestamps
    end

    # customer_id index is automatically created by foreign_key: true
  end
end

