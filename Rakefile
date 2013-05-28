require 'rake/testtask'

# To run tests in the order of a seed: bundle exec rake test TESTOPTS="--seed=987"
Rake::TestTask.new do |t|
  t.pattern = ENV['TEST_PATTERN'] || "test/**/*_test.rb"
end

task :default => :test

#desc 'load environment'
task :env do
  require File.join File.dirname(__FILE__), 'config', 'config'
end

#desc 'add sequel migration extension'
task :migrations do
  Sequel.extension :migration
end

namespace :db do
  desc 'bootstrap the database'
  task :bootstrap => [:env, :migrations] do

    unless %w{development test}.include? ENV['RACK_ENV']
      puts "You cannot run db:bootstrap on production for safety reasons."
      exit 1
    end

    Sequel::Migrator.apply DB, './migrations', 0
    Sequel::Migrator.apply DB, './migrations'
  end

  desc 'migrate the database to the latest revision or specified by VERSION=n'
  task :migrate => [:env, :migrations] do
    version = ENV['VERSION'] ? ENV['VERSION'].to_i : nil
    Sequel::Migrator.apply DB, './migrations', version
  end
end
