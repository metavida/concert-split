#!/usr/bin/env ruby

# Grab information about concerts that are available to split
# in hopes that it'll help with SEO.

require 'open-uri'
require 'json'

def get_project_data(url_part)
  open(File.join('https://api.github.com/repos/metavida/concert-split', url_part)) do |f|
    JSON.parse(f.read)
  end
end

latest_sha = get_project_data('/git/refs/heads/master')["object"]["sha"] rescue nil

raise "Couldn't find the SHA of the master branch" unless latest_sha

all_files = get_project_data("/git/trees/#{latest_sha}?recursive=1")

concerts_with_labels = all_files["tree"].map{ |branch| branch["path"] }.select{ |path| path =~ /Audacity Labels/}

concerts_with_labels = concerts_with_labels.sort_by{ |path| path[/\d{4}-\d\d-\d\d/] }.reverse

concerts_with_labels = concerts_with_labels.map{ |path| path[/\d{4}-\d\d-\d\d [^\/]*/].strip }

# First we'll save a long list of concerts.
File.open('_includes/available_concerts.html', 'w') do |f|
  f.puts '<ul>'
  concerts_with_labels.each do |concert|
    f.puts "  <li>#{concert}</li>"
  end
  f.puts '</ul>'
end

artists = concerts_with_labels.map{ |path| path.match(/\d{4}-\d\d-\d\d -([^-\/]*)/)[1].strip rescue nil }.compact

# Now we'll write a file for use in the meta description header tag.
# All recomendations I've seen say we should keep limit the length
# of the the meta description tag's contents to 155 characters.
template = "Split concerts, by %{musicians} & more, into individual tracks."
meta = ""
num_artists = 0

artists.size.times do
  tmp = template % { :musicians=>artists[0..num_artists].join(', ') }
  break if tmp.size > 155
  num_artists += 1
  meta = tmp
end

File.open('_includes/meta_description.txt', 'w') do |f|
  f << meta
end
