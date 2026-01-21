require "watir"
browser = Watir::Browser.new :edge, url: "https://countryclub.golfmanager.com/consumer/ebookings?i=1&resourcetype=1&date=2025-04-15"
browser.close

