class CustomerContact < ApplicationRecord
  belongs_to :customer

  validates :name, presence: true
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }, allow_blank: true
end

