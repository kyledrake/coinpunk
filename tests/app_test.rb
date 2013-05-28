require_relative './environment'

include Rack::Test::Methods

def app;     App end
def status;  last_response.status end
def headers; last_response.headers end
def body;    last_response.body end

SimpleCov.command_name 'minitest'

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
  uri = Addressable::URI.parse $config['bitcoind_rpchost'] ? $config['bitcoind_rpchost'] : 'http://localhost'
  uri.port = 8332 if uri.port.nil?
  uri.user = $config['bitcoind_rpcuser'] if uri.user.nil?
  uri.password = $config['bitcoind_rpcpassword'] if uri.password.nil?
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
