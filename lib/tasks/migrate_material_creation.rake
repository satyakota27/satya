namespace :db do
  desc "Migrate user permissions from material_creation to create_material"
  task migrate_material_creation: :environment do
    puts "Migrating user permissions from material_creation to create_material..."
    
    material_creation = SubFunctionality.find_by(code: 'material_creation')
    create_material = SubFunctionality.find_by(code: 'create_material')
    
    if material_creation.nil?
      puts "No material_creation sub-functionality found. Nothing to migrate."
      next
    end
    
    if create_material.nil?
      puts "ERROR: create_material sub-functionality not found. Please run seeds first."
      next
    end
    
    # Find all user permissions with material_creation
    user_permissions = UserPermission.where(sub_functionality: material_creation)
    
    if user_permissions.empty?
      puts "No user permissions found with material_creation. Nothing to migrate."
    else
      migrated_count = 0
      skipped_count = 0
      
      user_permissions.find_each do |user_permission|
        user = user_permission.user
        
        # Check if user already has create_material permission
        if user.sub_functionalities.include?(create_material)
          puts "  User #{user.email} already has create_material permission. Skipping..."
          skipped_count += 1
        else
          # Create new permission with create_material
          UserPermission.find_or_create_by!(
            user: user,
            sub_functionality: create_material
          )
          puts "  Migrated permission for user #{user.email}"
          migrated_count += 1
        end
        
        # Delete old permission
        user_permission.destroy
      end
      
      puts "\nMigration complete:"
      puts "  - Migrated: #{migrated_count} permissions"
      puts "  - Skipped (already exists): #{skipped_count} permissions"
    end
    
    # Deactivate or delete the material_creation sub-functionality
    if material_creation.active?
      material_creation.update(active: false)
      puts "\nDeactivated material_creation sub-functionality."
    end
    
    puts "\nMigration task completed successfully!"
  end
end

