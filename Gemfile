source 'https://rubygems.org'

gem 'sinatra',        require: 'sinatra/base'
gem 'addressable',    require: 'addressable/uri'
gem 'rake',           require: nil
gem 'bcrypt-ruby',    require: 'bcrypt'
gem 'sidekiq'
gem 'sequel'
gem 'sprockets'
gem 'yui-compressor', require: 'yui/compressor'
gem 'slim'
gem 'tzinfo'
gem 'sinatra-flash',  require: 'sinatra/flash'
gem 'silkroad'
gem 'puma',           require: nil
gem 'mail'
gem 'pwqgen.rb',      require: 'pwqgen'

platform :mri do
  gem 'pg',      group: :postgres
  gem 'mysql2',  group: :mysql
  gem 'sqlite3', group: :sqlite
  gem 'hiredis', require: 'redis/connection/hiredis'

  group :development, :test do
    gem 'pry'
    gem 'pry-debugger'
  end
end

platform :jruby do
  #gem 'jruby-openssl'
  gem 'jdbc-sqlite3',  require: 'jdbc/sqlite3',  group: :sqlite
  gem 'jdbc-postgres', require: 'jdbc/postgres', group: :postgres
  gem 'jdbc-mysql',    require: 'jdbc/mysql',    group: :mysql
end

group :development do
  gem 'shotgun', require: nil
end

group :test do
  gem 'sinatra-sessionography', require: 'sinatra/sessionography'
  gem 'faker'
  gem 'fabrication',        require: 'fabrication'
  gem 'minitest'
  gem 'minitest-reporters', require: 'minitest/reporters'
  gem 'rack-test',          require: 'rack/test'
  gem 'webmock'
  gem 'webrat'
  gem 'mocha',              require: nil

  platform :mri do
    gem 'simplecov',        require: nil
  end
end
