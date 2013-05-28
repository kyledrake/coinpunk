Fabricator(:account) do
  email { Faker::Internet.email }
  password { 'abcde' }
end