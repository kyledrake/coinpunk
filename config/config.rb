ENV['RACK_ENV'] ||= 'development'
ENV['TZ'] = 'UTC'
DIR_ROOT = File.expand_path '..', File.dirname(__FILE__)
Encoding.default_internal = 'UTF-8'

require 'yaml'
require 'logger'
require 'json'
require 'bundler/setup'

Bundler.require
Bundler.require :development if ENV['RACK_ENV'] == 'development'

if ENV['TRAVIS']
  CONFIG = YAML.load_file(File.join(DIR_ROOT, 'test', 'config.travis.yml'))[ENV['RACK_ENV']]
  CONFIG['database'] = (RUBY_PLATFORM == "java" ? ENV['JDBC_DATABASE'] : ENV['DATABASE'])
else
  CONFIG = YAML.load_file(File.join(DIR_ROOT, 'config', 'config.yml'))[ENV['RACK_ENV']]
end

DB = Sequel.connect CONFIG['database']

%w[
  extension
  sinatra
  controller
  sequel
  model
  rack
  workers
].each {|f| require File.join(DIR_ROOT, 'lib', f) }

DB.loggers << Logger.new(STDOUT) if ENV['RACK_ENV'] == 'development'

if defined?(Pry)
  Pry.commands.alias_command 'c', 'continue'
  Pry.commands.alias_command 's', 'step'
  Pry.commands.alias_command 'n', 'next'
  Pry.commands.alias_command 'f', 'finish'
end

Mail.defaults do
  #options = { :address              => "smtp.gmail.com",
  #            :port                 => 587,
  #            :domain               => 'your.host.name',
  #            :user_name            => '<username>',
  #            :password             => '<password>',
  #            :authentication       => 'plain',
  #            :enable_starttls_auto => true  }

  options = {}
  delivery_method :sendmail, options
end
