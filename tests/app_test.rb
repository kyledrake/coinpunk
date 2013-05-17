require_relative './environment'

include Rack::Test::Methods
include WebMock::API

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