require_relative '../../controller_config.rb'

SimpleCov.command_name 'minitest'

describe IndexController do
  before do
    @controller = IndexController
  end

  describe 'index' do
    it 'loads' do
      get '/'
      body.must_match /Coinpunk.+form.+signin/
    end
  end

  describe 'signin' do
    it 'fails for missing login' do
      post '/accounts/signin', email: 'fail@example.com', password: 'lol'
      fail_signin
    end

    it 'fails for bad password' do
      @account = Fabricate :account
      post '/accounts/signin', email: @account.email, password: 'derp'
      fail_signin
    end

    it 'fails for no input' do
      post '/accounts/signin'
      fail_signin
    end

    it 'succeeds for valid input' do
      password = '1tw0rkz'
      @account = Fabricate :account, password: password
      post '/accounts/signin', email: @account.email, password: password
      headers['Location'].must_equal 'http://example.org/dashboard'
      mock_dashboard_calls @account.email
      get '/dashboard'
      body.must_match /Dashboard/
    end
  end

  describe 'account creation' do
    it 'fails for no input' do
      post '/accounts/create'
      status.must_equal 200
      body.must_match /There were some errors.+Valid email address is required.+Password must be/
    end

    it 'fails with invalid email' do
      post '/accounts/create', email: 'derplol'
      status.must_equal 200
      body.must_match /errors.+valid email/i
    end

    it 'fails with invalid password' do
      post '/accounts/create', 'email@example.com', password: 'sdd'
      status.must_equal 200
      body.must_match /errors.+Password must be at least #{Account::MINIMUM_PASSWORD_LENGTH} characters/i
    end

    it 'succeeds with valid info' do
      account_attributes = Fabricate.attributes_for :account

      mock_dashboard_calls account_attributes[:email]

      post '/accounts/create', account_attributes
      status.must_equal 302
      headers['Location'].must_equal 'http://example.org/dashboard'

      get '/dashboard'
      body.must_match /Dashboard/
    end
  end

  describe 'temporary account login' do
  end

  def fail_signin
    headers['Location'].must_equal 'http://example.org/'
    get '/'
    body.must_match /invalid login/i
  end

  def api_url
    uri = Addressable::URI.parse CONFIG['bitcoind_rpchost'] ? CONFIG['bitcoind_rpchost'] : 'http://localhost'
    uri.port = 8332 if uri.port.nil?
    uri.user = CONFIG['bitcoind_rpcuser'] if uri.user.nil?
    uri.password = CONFIG['bitcoind_rpcpassword'] if uri.password.nil?
    "#{uri.to_s}/"
  end

  def mock_dashboard_calls(email)
    address = SecureRandom.hex

    stub_request(:post, api_url).
      with(
        body: {jsonrpc: '2.0', method: 'getaccountaddress', params: [email]},
        headers: {'Content-Type' => 'application/json'}
      ).
      to_return(status: 200, body: {result: address}.to_json)

    stub_request(:post, api_url).
      with(
        body: [
          {method: 'getaddressesbyaccount', params: [email], jsonrpc: '2.0'},
          {method: 'listtransactions', params: [email], jsonrpc: '2.0'},
          {method: 'getbalance', params: [email], jsonrpc: '2.0'}
        ].to_json,
        headers: {'Content-Type' => 'application/json'}
      ).to_return(body: [
        {result: [address]},
        {result: [{
          account: email,
          address: address,
          category: 'send',
          confirmations: 0,
          amount: -0.01000000,
          fee: -0.00050000
         }]},
        {result: 31337.00}
      ].to_json
    )

    stub_request(:post, api_url).
      with(
        body: [{method: 'getreceivedbyaddress', params: [address], jsonrpc: '2.0'}].to_json,
        headers: {'Content-Type' => 'application/json'}
      ).to_return(body: [{result: 0.03}].to_json)
  end








  it 'loads the front page' do
    get '/'
    last_response.body.must_match /Coinpunk/
  end

  it 'works with sprockets for the most part' do
    get '/js/all.js'
    last_response.body.must_match /jquery/i

    get '/css/screen.css'
    last_response.length.wont_equal 0
    last_response.body.wont_match /jquery/i
  end

  it 'precompiles js assets in production and sets etag' do
    skip
    @controller.precompile_assets!
    get '/js/all.js'
    regular_files = ''
    Dir['assets/**/*.js'].each {|f| regular_files << File.read(f)}
    (last_response.body.length < regular_files.length).must_equal true

    last_response.headers['ETag'].must_be_nil

    @controller.set :production_override, true
    current_session.header 'lol', 'cats'
    get '/js/all.js'
    last_response.headers['ETag'].must_equal %{"#{@controller.settings.asset_digests['all.js']}"}

    # This works in production, but doesn't work here for some reason..
    get '/js/all.js', {}, {'HTTP_IF_NONE_MATCH' => @controller.settings.asset_digests['all.js']}
    last_response.status.must_equal 304
  end
end
