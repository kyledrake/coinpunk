Sequel.migration do
  up {
    DB.add_column :accounts, :temporary_password, :boolean, default: false
  }

  down {
    DB.drop_column :accounts, :temporary_password
  }
end