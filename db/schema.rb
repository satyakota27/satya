# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_12_31_080454) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"
  enable_extension "pg_trgm"

  create_table "functionalities", force: :cascade do |t|
    t.string "name", null: false
    t.string "code", null: false
    t.text "description"
    t.boolean "active", default: true, null: false
    t.integer "display_order", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["active"], name: "index_functionalities_on_active"
    t.index ["code"], name: "index_functionalities_on_code", unique: true
    t.index ["display_order"], name: "index_functionalities_on_display_order"
  end

  create_table "material_bom_components", force: :cascade do |t|
    t.bigint "material_id", null: false
    t.bigint "component_material_id", null: false
    t.decimal "quantity", precision: 10, scale: 2, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["component_material_id"], name: "index_material_bom_components_on_component_material_id"
    t.index ["material_id"], name: "index_material_bom_components_on_material_id"
  end

  create_table "materials", force: :cascade do |t|
    t.bigint "tenant_id", null: false
    t.string "material_code"
    t.text "description"
    t.string "state", default: "draft", null: false
    t.bigint "procurement_unit_id"
    t.bigint "sale_unit_id"
    t.boolean "has_bom", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["material_code"], name: "index_materials_on_material_code"
    t.index ["procurement_unit_id"], name: "index_materials_on_procurement_unit_id"
    t.index ["sale_unit_id"], name: "index_materials_on_sale_unit_id"
    t.index ["state"], name: "index_materials_on_state"
    t.index ["tenant_id", "material_code"], name: "index_materials_on_tenant_id_and_material_code", unique: true
    t.index ["tenant_id"], name: "index_materials_on_tenant_id"
  end

  create_table "sub_functionalities", force: :cascade do |t|
    t.bigint "functionality_id", null: false
    t.string "name", null: false
    t.string "code", null: false
    t.text "description"
    t.string "screen"
    t.boolean "active", default: true, null: false
    t.integer "display_order", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["active"], name: "index_sub_functionalities_on_active"
    t.index ["display_order"], name: "index_sub_functionalities_on_display_order"
    t.index ["functionality_id", "code"], name: "index_sub_functionalities_on_functionality_id_and_code", unique: true
    t.index ["functionality_id"], name: "index_sub_functionalities_on_functionality_id"
  end

  create_table "subscriptions", force: :cascade do |t|
    t.bigint "tenant_id", null: false
    t.string "tier"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["tenant_id"], name: "index_subscriptions_on_tenant_id"
  end

  create_table "tenants", force: :cascade do |t|
    t.string "name"
    t.string "subdomain"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["subdomain"], name: "index_tenants_on_subdomain", unique: true
  end

  create_table "unit_of_measurements", force: :cascade do |t|
    t.bigint "tenant_id", null: false
    t.string "name", null: false
    t.string "abbreviation", null: false
    t.boolean "active", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["tenant_id", "name"], name: "index_unit_of_measurements_on_tenant_id_and_name", unique: true
    t.index ["tenant_id"], name: "index_unit_of_measurements_on_tenant_id"
  end

  create_table "user_permissions", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "sub_functionality_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["sub_functionality_id"], name: "index_user_permissions_on_sub_functionality_id"
    t.index ["user_id", "sub_functionality_id"], name: "index_user_permissions_on_user_and_sub_functionality", unique: true
    t.index ["user_id"], name: "index_user_permissions_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.string "role"
    t.bigint "tenant_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["tenant_id"], name: "index_users_on_tenant_id"
  end

  add_foreign_key "material_bom_components", "materials"
  add_foreign_key "material_bom_components", "materials", column: "component_material_id"
  add_foreign_key "materials", "tenants"
  add_foreign_key "materials", "unit_of_measurements", column: "procurement_unit_id"
  add_foreign_key "materials", "unit_of_measurements", column: "sale_unit_id"
  add_foreign_key "sub_functionalities", "functionalities"
  add_foreign_key "subscriptions", "tenants"
  add_foreign_key "unit_of_measurements", "tenants"
  add_foreign_key "user_permissions", "sub_functionalities"
  add_foreign_key "user_permissions", "users"
  add_foreign_key "users", "tenants"
end
