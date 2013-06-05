Fabricator(:receive_address) do
  bitcoin_address { SecureRandom.hex }
  name            { Faker::Company.name }
end