class Array
  def require_each_from(location)
    each {|f| send(:require, File.join(DIR_ROOT, 'lib', location, f)) }
  end
end
