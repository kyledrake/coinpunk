Sequel.migration do
  up {
    DB.create_table! :accounts do
      primary_key :id
      String :email
      String :password
      DateTime :created_at
      DateTime :updated_at
    end
  }

  down {
    DB.drop_table :accounts
  }
end