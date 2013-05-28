class Hash
  def symbolize_keys
    self.inject({}) { |h,(k,v)| h[k.to_sym] = v; h }
  end

  def select_with_keys(*keys)
    select { |k,v| keys.include?(k.to_sym) }
  end

  def select_without_keys(*keys)
    select { |k,v| !keys.include?(k.to_sym) }
  end

  def delete!(*keys)
    keys.each {|key| self.delete(key)}
    self
  end
end
