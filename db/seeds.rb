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

puts "\nSeed data created successfully!"
puts "\nYou can now login with:"
puts "  Super Admin: admin1@example.com / password123"
puts "  Super Admin: admin2@example.com / password123"
puts "  Tenant Admin: admin@acme.com / password123"
puts "  Regular User: user1@acme.com / password123"
