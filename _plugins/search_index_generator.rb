# frozen_string_literal: true

# Build /search-index.json for CJK substring search fallback (Pagefind tokenizes short compounds poorly).
# Runs on every `jekyll build` — no Node.js required on the server.
module Jekyll
  module SearchIndexGenerator
    module_function

    def strip_tags(html)
      html
        .gsub(%r{<script[\s\S]*?</script>}i, " ")
        .gsub(%r{<style[\s\S]*?</style>}i, " ")
        .gsub(/<[^>]+>/, " ")
        .gsub(/\s+/, " ")
        .strip
    end

    def extract_entry(html, url_path)
      return nil unless html.include?("data-pagefind-body")

      m = html.match(%r{<div[^>]*\bdata-pagefind-body\b[^>]*>([\s\S]*?)<hr\s+style="visibility:\s*hidden}i)
      return nil unless m

      title =
        html[/data-pagefind-meta="title"[^>]*>([^<]+)/i, 1] ||
        html[/<h1[^>]*>([^<]+)<\/h1>/i, 1] ||
        html[%r{<title>([^<|]+)}i, 1]

      text = strip_tags(m[1])
      return nil if text.empty?

      {
        "u" => url_path,
        "title" => (title || "").strip,
        "t" => text
      }
    end

    def url_for_file(dest, file)
      rel = file.delete_prefix(dest).tr("\\", "/")
      dir = File.dirname(rel)
      dir == "." ? "/" : "/#{dir}/"
    end
  end

  Jekyll::Hooks.register :site, :post_write do |site|
    dest = site.dest
    entries = []

    Dir.glob(File.join(dest, "**", "index.html")).each do |file|
      html = File.read(file, encoding: "UTF-8")
      url = SearchIndexGenerator.url_for_file(dest, file)
      row = SearchIndexGenerator.extract_entry(html, url)
      entries << row if row
    end

    out = File.join(dest, "search-index.json")
    File.write(out, JSON.generate(entries))
    Jekyll.logger.info "SearchIndex:", "wrote #{entries.length} entries -> #{out}"
  end
end
