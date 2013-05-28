class Controller < Sinatra::Base
  register Sinatra::Sprockets
  register Sinatra::ControllerHelpers
  register Sinatra::ViewHelpers
  register Sinatra::Flash
  
  MINIMUM_SEND_CONFIRMATIONS = 1
  
  configure do
    $bitcoin = Silkroad::Client.new(
      CONFIG['bitcoind_rpcuser'],
      CONFIG['bitcoind_rpcpassword'],
      url: CONFIG['bitcoind_rpchost']
    )

    use Rack::Session::Cookie, key:          'coinpunk',
                               path:         '/',
                               expire_after: 31556926, # one year in seconds
                               secret:       CONFIG['session_secret']

    set :root, DIR_ROOT

    error     { slim :error }      if production?
    not_found { slim :not_found }  if production?
  end

  before do
    @timezone_name = session[:timezone]

    if @timezone_name
      @timezone = TZInfo::Timezone.get(@timezone_name)
      @timezone_identifier = @timezone.current_period.zone_identifier
      @timezone_offset = @timezone.current_period.utc_total_offset
    end

    redirect '/accounts/change_temporary_password' if session[:temporary_password] == true && !(request.path =~ /change_temporary_password/)
  end

  def render(engine, data, options = {}, locals = {}, &block)
    options.merge!(pretty: self.class.development?) if engine == :slim && options[:pretty].nil?
    super engine, data, options, locals, &block
  end
end

%w[
  index_controller
].require_each_from 'controllers'