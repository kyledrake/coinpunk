require_relative '../../config.rb'

describe String do
  describe 'blank?' do
    it 'returns true for empty string' do
      ''.blank?.must_equal true
    end
    
    it 'returns false for non-empty string' do
      'hello'.blank?.must_equal false
    end
  end
end
