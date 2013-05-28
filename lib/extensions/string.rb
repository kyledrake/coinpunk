class String
  def blank?
    empty?
  end
  
  def to_anchor_link
    gsub(/[^a-zA-Z0-9 ]/, '').gsub('  ', ' ').gsub(' ', '_').downcase
  end
end
