# frozen_string_literal: true

require "fileutils"
require "json"

# Sharded CJK substring index: /search-index/manifest.json + /search-index/YYYY.json
# Compact row: [url, title, searchableText] — no duplicate body fields.
module Jekyll
  module SearchIndexGenerator
    module_function

    MAX_BODY_CHARS = 800
    INDEX_VERSION = 2

    def strip_tags(html)
      html
        .gsub(%r{<script[\s\S]*?</script>}i, " ")
        .gsub(%r{<style[\s\S]*?</style>}i, " ")
        .gsub(/<[^>]+>/, " ")
        .gsub(/\s+/, " ")
        .strip
    end

    def extract_row(html)
      return nil unless html.include?("data-pagefind-body")

      m = html.match(%r{<div[^>]*\bdata-pagefind-body\b[^>]*>([\s\S]*?)<hr\s+style="visibility:\s*hidden}i)
      return nil unless m

      title =
        html[/data-pagefind-meta="title"[^>]*>([^<]+)/i, 1] ||
        html[/<h1[^>]*>([^<]+)<\/h1>/i, 1] ||
        html[%r{<title>([^<|]+)}i, 1]
      subtitle = html[/data-pagefind-meta="subtitle"[^>]*>([^<]+)/i, 1]

      body_html = m[1]
      headings = body_html.scan(/<h[1-6][^>]*>([^<]+)</i).map { |h| strip_tags(h) }.reject(&:empty?)
      text = strip_tags(body_html)
      return nil if text.empty? && headings.empty?

      text = text[0, MAX_BODY_CHARS] if text.length > MAX_BODY_CHARS
      title = (title || "").strip
      subtitle = (subtitle || "").strip
      search = [title, subtitle, headings.join("\n"), text].reject(&:empty?).join("\n")

      [nil, title, search] # url filled by caller
    end

    def url_for_file(dest, file)
      rel = file.delete_prefix(dest).delete_prefix("/").tr("\\", "/")
      dir = File.dirname(rel)
      dir == "." ? "/" : "/#{dir}/"
    end

    def year_bucket(url_path)
      m = url_path.match(%r{/(\d{4})/})
      m ? m[1] : "misc"
    end

    def write_sharded_index(dest, rows)
      index_dir = File.join(dest, "search-index")
      FileUtils.mkdir_p(index_dir)

      shards = Hash.new { |h, k| h[k] = [] }
      rows.each do |url, title, search|
        shards[year_bucket(url)] << [url, title, search]
      end

      manifest_shards = []
      total_bytes = 0

      shards.keys.sort.reverse.each do |year|
        data = shards[year]
        rel = "/search-index/#{year}.json"
        path = File.join(index_dir, "#{year}.json")
        json = JSON.generate(data)
        File.write(path, json)
        bytes = json.bytesize
        total_bytes += bytes
        manifest_shards << { "y" => year, "n" => data.length, "u" => rel, "b" => bytes }
      end

      manifest = { "v" => INDEX_VERSION, "shards" => manifest_shards }
      File.write(File.join(index_dir, "manifest.json"), JSON.generate(manifest))

      stub = { "v" => INDEX_VERSION, "manifest" => "/search-index/manifest.json" }
      File.write(File.join(dest, "search-index.json"), JSON.generate(stub))

      [manifest_shards.length, total_bytes, rows.length]
    end
  end

  Jekyll::Hooks.register :site, :post_write do |site|
    dest = site.dest
    rows = []

    Dir.glob(File.join(dest, "**", "index.html")).each do |file|
      html = File.read(file, encoding: "UTF-8")
      url = SearchIndexGenerator.url_for_file(dest, file)
      row = SearchIndexGenerator.extract_row(html)
      next unless row

      row[0] = url
      rows << row
    end

    shard_count, bytes, count = SearchIndexGenerator.write_sharded_index(dest, rows)
    Jekyll.logger.info "SearchIndex:",
                       "#{count} posts -> #{shard_count} shards (#{bytes} bytes under search-index/)"
  end
end
