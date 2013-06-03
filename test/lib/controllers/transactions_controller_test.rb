require_relative '../../controller_config.rb'

describe TransactionsController do
  before do
    @controller = TransactionsController
    Sinatra::Sessionography.session.clear
  end
  
  describe 'send' do

    describe 'with bad bitcoin address' do
      it 'fails' do
        account = Fabricate :account
        login_as account.email

        stub_request(:post, api_url).
          with(
            body: {jsonrpc: '2.0', 
                   method: 'sendfrom', 
                   params: [account.email, 'badaddress', 0.001, TransactionsController::MINIMUM_SEND_CONFIRMATIONS, nil, nil]},
            headers: {'Content-Type' => 'application/json'}
          ).
          to_return(status: 500, body: {error: {code: '-5', message: 'Invalid Bitcoin address'}}.to_json)

        post '/send', to_address: 'badaddress', amount: 0.001
        headers['Location'].must_match /\/dashboard$/
        Sinatra::Sessionography.session[:flash][:error].must_match /invalid bitcoin address/i
      end
    end

    describe 'with bitcoin address' do
      it 'sends to bitcoin address' do
      end
    end
  end
end