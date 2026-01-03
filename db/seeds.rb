# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

# Create Super Admins
puts "Creating super admins..."

super_admin1 = User.find_or_create_by!(email: 'admin1@example.com') do |user|
  user.password = 'password123'
  user.password_confirmation = 'password123'
  user.role = 'super_admin'
  user.tenant = nil
end

super_admin2 = User.find_or_create_by!(email: 'admin2@example.com') do |user|
  user.password = 'password123'
  user.password_confirmation = 'password123'
  user.role = 'super_admin'
  user.tenant = nil
end

puts "Super admins created:"
puts "  - #{super_admin1.email} (password: password123)"
puts "  - #{super_admin2.email} (password: password123)"

# Create sample tenants with subscriptions
puts "\nCreating sample tenants..."

tenant1 = Tenant.find_or_create_by!(subdomain: 'acme') do |tenant|
  tenant.name = 'Acme Corporation'
end

tenant2 = Tenant.find_or_create_by!(subdomain: 'widgets') do |tenant|
  tenant.name = 'Widgets Inc'
end

puts "Tenants created:"
puts "  - #{tenant1.name} (#{tenant1.subdomain})"
puts "  - #{tenant2.name} (#{tenant2.subdomain})"

# Create subscriptions for tenants
puts "\nCreating subscriptions..."

Subscription.find_or_create_by!(tenant: tenant1) do |subscription|
  subscription.tier = :premium
end

Subscription.find_or_create_by!(tenant: tenant2) do |subscription|
  subscription.tier = :standard
end

puts "Subscriptions created"

# Create tenant admin for tenant1
puts "\nCreating tenant admins..."

tenant_admin1 = User.find_or_create_by!(email: 'admin@acme.com') do |user|
  user.password = 'password123'
  user.password_confirmation = 'password123'
  user.role = 'tenant_admin'
  user.tenant = tenant1
end

puts "Tenant admin created: #{tenant_admin1.email} (password: password123)"

# Create regular users
puts "\nCreating regular users..."

User.find_or_create_by!(email: 'user1@acme.com') do |user|
  user.password = 'password123'
  user.password_confirmation = 'password123'
  user.role = 'user'
  user.tenant = tenant1
end

User.find_or_create_by!(email: 'user2@acme.com') do |user|
  user.password = 'password123'
  user.password_confirmation = 'password123'
  user.role = 'user'
  user.tenant = tenant1
end

User.find_or_create_by!(email: 'user1@widgets.com') do |user|
  user.password = 'password123'
  user.password_confirmation = 'password123'
  user.role = 'user'
  user.tenant = tenant2
end

puts "Regular users created"

# Create Functionalities and Sub-Functionalities
puts "\nCreating functionalities and sub-functionalities..."

# Material Management
material_mgmt = Functionality.find_or_create_by!(code: 'material_management') do |f|
  f.name = 'Material Management'
  f.display_order = 1
  f.active = true
end

# Keep existing sub-functionalities for backward compatibility
SubFunctionality.find_or_create_by!(functionality: material_mgmt, code: 'create_material') do |sf|
  sf.name = 'create material'
  sf.screen = 'create material screen'
  sf.display_order = 1
  sf.active = true
end

SubFunctionality.find_or_create_by!(functionality: material_mgmt, code: 'enable_disable_material') do |sf|
  sf.name = 'enable/disable material'
  sf.screen = 'manage material screen'
  sf.display_order = 2
  sf.active = true
end

# New sub-functionalities as per plan
SubFunctionality.find_or_create_by!(functionality: material_mgmt, code: 'material_approver') do |sf|
  sf.name = 'Material Approver'
  sf.screen = 'approve material screen'
  sf.display_order = 3
  sf.active = true
end

SubFunctionality.find_or_create_by!(functionality: material_mgmt, code: 'material_listing') do |sf|
  sf.name = 'Material Listing'
  sf.screen = 'material listing screen'
  sf.display_order = 4
  sf.active = true
end

# User Management
user_mgmt = Functionality.find_or_create_by!(code: 'user_management') do |f|
  f.name = 'User Management'
  f.display_order = 2
  f.active = true
end

SubFunctionality.find_or_create_by!(functionality: user_mgmt, code: 'create_user') do |sf|
  sf.name = 'create user'
  sf.screen = 'create user screen'
  sf.display_order = 1
  sf.active = true
end

SubFunctionality.find_or_create_by!(functionality: user_mgmt, code: 'enable_disable_user') do |sf|
  sf.name = 'enable/disable user, assign functions, assign approval hierarchy'
  sf.screen = 'manage user screen'
  sf.display_order = 2
  sf.active = true
end

# Store management
store_mgmt = Functionality.find_or_create_by!(code: 'store_management') do |f|
  f.name = 'Store management'
  f.display_order = 3
  f.active = true
end

SubFunctionality.find_or_create_by!(functionality: store_mgmt, code: 'raise_grn') do |sf|
  sf.name = 'Raise GRN'
  sf.screen = 'Create GRN screen'
  sf.display_order = 1
  sf.active = true
end

SubFunctionality.find_or_create_by!(functionality: store_mgmt, code: 'create_warehouse') do |sf|
  sf.name = 'Create warehouse'
  sf.screen = 'Create warehouse screen'
  sf.display_order = 2
  sf.active = true
end

SubFunctionality.find_or_create_by!(functionality: store_mgmt, code: 'enable_disable_warehouse') do |sf|
  sf.name = 'Enable/Disable warehouse'
  sf.screen = 'manage warehouse screen'
  sf.display_order = 3
  sf.active = true
end

SubFunctionality.find_or_create_by!(functionality: store_mgmt, code: 'manage_inventory') do |sf|
  sf.name = 'Manage inventory'
  sf.screen = 'Inventory management screen'
  sf.display_order = 4
  sf.active = true
end

# Master tables management
master_tables = Functionality.find_or_create_by!(code: 'master_tables_management') do |f|
  f.name = 'Master tables management'
  f.display_order = 4
  f.active = true
end

SubFunctionality.find_or_create_by!(functionality: master_tables, code: 'manage_uom') do |sf|
  sf.name = 'Manage UOM master'
  sf.screen = 'UOM master screen'
  sf.display_order = 1
  sf.active = true
end

SubFunctionality.find_or_create_by!(functionality: master_tables, code: 'manage_saqc') do |sf|
  sf.name = 'Manage SAQC master'
  sf.screen = 'Store acceptance quality checks master screen'
  sf.display_order = 2
  sf.active = true
end

SubFunctionality.find_or_create_by!(functionality: master_tables, code: 'manage_ps') do |sf|
  sf.name = 'Manage PS master'
  sf.screen = 'Process steps master screen'
  sf.display_order = 3
  sf.active = true
end

SubFunctionality.find_or_create_by!(functionality: master_tables, code: 'manage_psqc') do |sf|
  sf.name = 'Manage PSQC master'
  sf.screen = 'Process steps QC test master screen'
  sf.display_order = 4
  sf.active = true
end

# Sales Management
sales_management = Functionality.find_or_create_by!(code: 'sales_management') do |f|
  f.name = 'Sales Management'
  f.display_order = 5
  f.active = true
end

SubFunctionality.find_or_create_by!(functionality: sales_management, code: 'create_customer') do |sf|
  sf.name = 'Create customer'
  sf.screen = 'Create customer screen'
  sf.display_order = 1
  sf.active = true
end

SubFunctionality.find_or_create_by!(functionality: sales_management, code: 'manage_customer') do |sf|
  sf.name = 'Enable/disable customer'
  sf.screen = 'Manage customer screen'
  sf.display_order = 2
  sf.active = true
end

SubFunctionality.find_or_create_by!(functionality: sales_management, code: 'create_sale_order') do |sf|
  sf.name = 'Create sale order'
  sf.screen = 'Create sale order screen'
  sf.display_order = 3
  sf.active = true
end

SubFunctionality.find_or_create_by!(functionality: sales_management, code: 'manage_sale_order') do |sf|
  sf.name = 'Edit/Cancel/Manage sale order'
  sf.screen = 'Manage sale order screen'
  sf.display_order = 4
  sf.active = true
end

# Deactivate unused functionalities
puts "\nDeactivating unused functionalities..."

unused_functionalities = [
  'supply_chain_management',
  'production_management',
  'job_work_management',
  'quality_control',
  'special_functions',
  'accounts'
]

unused_functionalities.each do |code|
  functionality = Functionality.find_by(code: code)
  if functionality
    functionality.update(active: false)
    functionality.sub_functionalities.update_all(active: false)
    puts "  ✓ Deactivated #{functionality.name} and its sub-functionalities"
  end
end

puts "Functionalities and sub-functionalities created successfully!"

puts "\nSeed data created successfully!"

# Load additional seed files
Dir[File.join(__dir__, 'seeds', '*.rb')].sort.each do |seed_file|
  puts "\n" + "="*50
  load seed_file
end

puts "\n" + "="*50
puts "\nSeed data created successfully!"
puts "\nYou can now login with:"
puts "  Super Admin: admin1@example.com / password123"
puts "  Super Admin: admin2@example.com / password123"
puts "  Tenant Admin: admin@acme.com / password123"
puts "  Regular User: user1@acme.com / password123"
