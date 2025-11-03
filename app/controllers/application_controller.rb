class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  before_action :authenticate_user!
  before_action :set_current_tenant
  check_authorization unless: :devise_controller?

  rescue_from CanCan::AccessDenied do |exception|
    redirect_to root_path, alert: exception.message
  end

  private

  def set_current_tenant
    ActsAsTenant.current_tenant = current_user&.tenant
  end
end
