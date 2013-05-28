require_relative '../../config.rb'

describe Integer do
  describe 'blank?' do
    it 'returns false' do
      0.blank?.must_equal false
    end
  end
end
