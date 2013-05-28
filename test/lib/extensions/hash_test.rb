require_relative '../../config.rb'

describe Hash do
  before do
    @hash = {:one => 'one', :two => 'two', :three => 'three', :four => 'four'}
  end

  describe 'symbolize_keys' do
    it 'works' do
      {'one' => 'two', 'three' => 'four'}.symbolize_keys.must_equal(:one => 'two', :three => 'four')
    end
  end
  
  describe 'select_with_keys' do
    it 'works' do
      @hash.select_with_keys(:one, :two).keys.must_equal %i[one two]
    end
  end
  
  describe 'select_without_keys' do
    it 'works' do
      @hash.select_without_keys(:one, :two).keys.must_equal %i[three four]
    end
  end
  
  describe 'delete!' do
    it 'removes keys' do
      expected = %i[two four]
      @hash.delete!(:one, :three).must_equal(:two => 'two', :four => 'four')
      @hash.keys.must_equal expected
    end
  end
end
