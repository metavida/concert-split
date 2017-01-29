# The Concert-Split Project Website

The goal of [this website](http://marcos.wrightkuhns.com/concert-split/) is to provide a nice, easy to maintain, public face to the Concert-Splitting data we create for this project. It currently uses the GitHub API to automatically grab information about concert files as they're added to the master branch.

## Working on the website

Ok, so jekyll is actually pretty drop-dead simple to use, but given enough time I inevitably forget how to do local development, so here's the trick

```
$ gem install bundler
$ bundle install
$ git submodule update --init
$ bundle exec jekyll serve
```

### Refreshing static resources

Unfortunately, there are a few cases where getting data from the GitHub API via AJAX doesn't work:

1. The `<meta name="description"` tag has to have a fixed body, and for SEO purposes I thought it might be good to list the names of the artists with the most recent concerts.
2. If the user doesn't have JavaScript enabled, we can't fetch the live data, so we should have a fallback list of mostly-up-to-date information to show them.

So, to meet the above needs, we keep a pair of files in the `_includes` directory. There's an easy command to refresh those files with the latest data from the master branch:

```
$ bundle exec update_artists.rb
```
