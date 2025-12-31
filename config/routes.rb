Rails.application.routes.draw do
  devise_for :users, skip: [:registrations]

  root 'dashboard#index'

  resources :tenants do
    resources :users, only: [:index], controller: 'tenants/users'
  end

  resources :users

  resources :functionalities do
    resources :sub_functionalities
  end

  resources :materials do
    collection do
      get :search
      post 'unit-of-measurements', to: 'unit_of_measurements#create_standalone', as: 'create_unit_standalone_materials'
    end
    member do
      post :approve
    end
    resources :material_bom_components, only: [:create, :destroy]
    resources :unit_of_measurements, path: 'unit-of-measurements'
  end
  
  # Standalone route for unit of measurements index (for sidebar access)
  get 'unit-of-measurements', to: 'unit_of_measurements#index_standalone', as: 'unit_of_measurements'

  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker
end
