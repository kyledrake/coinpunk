source 'https://rubygems.org'
# ruby '1.9.3'

gem 'json'
gem 'sinatra'
gem 'sequel'
gem 'sidekiq'
gem 'silkroad'
gem 'bcrypt-ruby', require: 'bcrypt'
gem 'slim'
gem 'sinatra-flash', require: 'sinatra/flash'
gem 'pony'
gem 'tzinfo'
gem 'rack-time-zone-header'
gem 'puma', require: nil
gem 'vegas', require: nil

platform :mri do
  gem 'pg',      group: :postgres
  gem 'mysql2',  group: :mysql
  gem 'sqlite3', group: :sqlite
  
  group :development, :test do
    gem 'pry'
    gem 'pry-debugger'
  end
end

group :development do
  gem 'shotgun', require: nil
end

group :test do
  gem 'faker'
  gem 'fabrication',        require: 'fabrication'
  gem 'minitest'
  gem 'minitest-reporters', require: 'minitest/reporters'
  gem 'rack-test',          require: 'rack/test'
  gem 'webmock'
  gem 'mocha',              require: nil
  gem 'rake',               require: nil

  platform :mri do
    gem 'simplecov',        require: nil
  end
end
