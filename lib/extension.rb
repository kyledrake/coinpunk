require_relative './extensions/array.rb'

%w[
  hash
  integer
  nil_class
  string
].require_each_from 'extensions'
