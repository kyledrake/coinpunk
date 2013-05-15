Sequel.migration do
  up {
    DB.create_table! :receive_addresses do
      String   :bitcoin_address, primary_key: true
      Integer  :account_id
      String   :name
      DateTime :created_at
      DateTime :updated_at
    end
  }

  down {
    DB.drop_table :receive_addresses
  }
end