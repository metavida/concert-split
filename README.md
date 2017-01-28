# The Concert-Split Project Website

The goal of this website is to provide a nice, easy to maintain, public face to the Concert-Splitting data we create for this project. It currently uses the GitHub API to automatically grab information about concert files as they're added to the master branch.

## Working on the website

Ok, so jekyll is actually pretty drop-dead simple to use, but given enough time I inevitably forget how to do local development, so here's the trick

    $ gem install bundler
    $ bundle install
    $ git submodule update --init
    $ bundle exec jekyll serve
