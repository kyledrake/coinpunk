require_relative './config'

Webrat.configure do |config|
  config.mode = :rack
end

include Rack::Test::Methods
include WebMock::API
include Webrat::Methods
include Webrat::Matchers

def app
  @controller
end

def status
  last_response.status
end

def headers
  last_response.headers
end

def body
  last_response.body
end

def override_controller(klass)
  $override_controller_class = klass
end

# This is to force Rack::Test to switch to a different "controller" within tests for Webrat acceptance testing.
# There is probably a better solution to this..
module Rack
  class MockSession
    alias_method :request_orig, :request
    def request(uri, env)
      if $override_controller_class
        
        original_class = @app
        
        @app = $override_controller_class
        
        match = $override_controller_class.to_s.match(/^(.+)Controller$/)[1].downcase

        env['PATH_INFO'].gsub! /#{match}\/?/, ''
        @last_request.env['PATH_INFO'].gsub! /#{match}\/?/, ''

        $override_controller_class = nil
      end
      request_orig uri, env
    end
  end
end

# Not really a good way to control the webrat logs by default, so I did this:
module Webrat
  module Logging #:nodoc:

    def debug_log(message) # :nodoc:
      return unless logger
      logger.debug message
    end

    def logger
      if @logger.nil?
        @logger = ::Logger.new(STDOUT)
        @logger.level = Logger::ERROR
      end
      @logger
    end
  end
end

SimpleCov.command_name 'minitest'

def api_url
  uri = Addressable::URI.parse CONFIG['bitcoind_rpchost'] ? CONFIG['bitcoind_rpchost'] : 'http://localhost'
  uri.port = 8332 if uri.port.nil?
  uri.user = CONFIG['bitcoind_rpcuser'] if uri.user.nil?
  uri.password = CONFIG['bitcoind_rpcpassword'] if uri.password.nil?
  "#{uri.to_s}/"
end

def login_as(account_email)
  Sinatra::Sessionography.session[:account_email] = account_email
end

def stub_rpc(meth, params, response)
  response[:body] = response[:body].to_json

  stub_request(:post, api_url).
    with(
      body: {jsonrpc: '2.0',
             method: meth,
             params: params},
      headers: {'Content-Type' => 'application/json'},
    ).
    to_return(response)
end