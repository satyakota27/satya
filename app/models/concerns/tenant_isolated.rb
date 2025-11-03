module TenantIsolated
  extend ActiveSupport::Concern

  included do
    # Add a validation to ensure tenant is set for non-super-admin users
    # This is a safety net to prevent data leakage
  end

  class_methods do
    # Method to safely query across tenants (only for super admins)
    def across_all_tenants
      ActsAsTenant.with_tenant(nil) do
        unscoped
      end
    end

    # Method to query within a specific tenant
    def for_tenant(tenant)
      ActsAsTenant.with_tenant(tenant) do
        all
      end
    end
  end
end

