class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  include TenantScoped

  before_action :authenticate_user!
  check_authorization unless: :devise_controller?

  rescue_from CanCan::AccessDenied do |exception|
    redirect_to root_path, alert: exception.message
  end
end
