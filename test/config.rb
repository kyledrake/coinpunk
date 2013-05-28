ENV['RACK_ENV'] = 'test'
raise 'Forget it.' if ENV['RACK_ENV'] == 'production'

require 'simplecov'
SimpleCov.coverage_dir File.join('test', 'coverage')
SimpleCov.start do
  add_filter "/migrations/"
end

require 'webmock'

require './config/config'

Bundler.require :test

#require 'minitest/pride'
require 'minitest/autorun'
require 'sidekiq/testing/inline'
require 'mocha/setup'

# PasswordThing.bcrypt_cost = BCrypt::Engine::MIN_COST

Account.bcrypt_cost = BCrypt::Engine::MIN_COST

MiniTest::Reporters.use! MiniTest::Reporters::SpecReporter.new

# Bootstrap the database
Sequel.extension :migration

Sequel::Migrator.apply DB, './migrations', 0
Sequel::Migrator.apply DB, './migrations'
