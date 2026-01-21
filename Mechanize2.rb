require "mechanize"

agent = Mechanize.new

page = agent.get "http://google.com"

puts page.title

puts page.uri
