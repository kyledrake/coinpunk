Fabricator(:account) do
  email { Faker::Internet.email }
  password { 'abcde' }
  after_create do |account|
    account.add_receive_address Fabricate(:receive_address)
  end
end