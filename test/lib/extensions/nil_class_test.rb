require_relative '../../config.rb'

describe NilClass do
  describe 'blank?' do
    it 'returns true' do
      nil.blank?.must_equal true
    end
  end
end
