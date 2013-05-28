Rainbows! do
  name = 'app'

  use :ThreadPool

  client_max_body_size nil

  worker_processes 2
  worker_connections 32

  # How long to hold the request open until timing out.
  timeout 30

  listen "unix:/tmp/#{name}.sock", :backlog => 2048

  pid "./tmp/#{name}.pid"
  stderr_path "./tmp/#{name}.log"
  stdout_path "./tmp/#{name}.log"

  preload_app true

  before_fork do |server, worker|
    old_pid = "./tmp/#{name}.pid.oldbin"
    if File.exists?(old_pid) && server.pid != old_pid
      begin
        Process.kill("QUIT", File.read(old_pid).to_i)
      rescue Errno::ENOENT, Errno::ESRCH
        # someone else did our job for us
      end
    end

    DB.disconnect
  end

  after_fork do |server, worker|
    # Whatever you're using for config.rb needs to go in this block too:
    Sidekiq.configure_client do |config|
    end
  end
end