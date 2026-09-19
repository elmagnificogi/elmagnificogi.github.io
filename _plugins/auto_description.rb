# frozen_string_literal: true

# Posts without a front-matter `description` reuse the Foreword (or 前言).
# An explicit `description` always wins.

module Jekyll
  module AutoDescription
    module_function

    MAX_LEN = 140
    MIN_USEFUL = 12

    def extract(markdown)
      return nil if markdown.to_s.strip.empty?

      section = foreword_section(markdown) || first_paragraph(markdown)
      text = strip_markup(section)
      return nil if text.length < MIN_USEFUL

      truncate(text, MAX_LEN)
    end

    def foreword_section(markdown)
      m = markdown.match(/^\#{2,3}\s+(Foreword|前言)\s*$/i)
      return nil unless m

      rest = markdown[m.end(0)..-1].to_s
      rest.split(/^##\s+\S/, 2).first
    end

    def first_paragraph(markdown)
      markdown.each_line.drop_while { |line|
        s = line.strip
        s.empty? || s.start_with?("#") || s.start_with?("!") || s.start_with?(">") || s.start_with?("```")
      }.join
    end

    def strip_markup(raw)
      s = raw.to_s
      s = s.gsub(/```[\s\S]*?```/, " ")
      s = s.gsub(/`([^`]+)`/, '\1')
      s = s.gsub(/!\[[^\]]*\]\([^)]*\)/, " ")
      s = s.gsub(/\[([^\]]+)\]\([^)]*\)/, '\1')
      s = s.gsub(/^\s{0,3}>\s?/, "") # each line; Ruby ^ matches line start
      s = s.gsub(/<\/?[^>]+>/, " ")
      s = s.gsub(/[*_~#]+/, "")
      s.gsub(/\s+/, " ").strip
    end

    def truncate(text, max)
      return text if text.length <= max

      cut = text[0, max]
      if (idx = cut.rindex(/[。！？]/)) && idx >= (max * 0.45)
        return cut[0, idx + 1]
      end
      if (idx = cut.rindex(/[，、；,]/)) && idx >= (max * 0.6)
        return cut[0, idx] + "…"
      end

      cut.sub(/\s+\S*\z/, "") + "…"
    end
  end
end

Jekyll::Hooks.register :posts, :pre_render do |post|
  next unless post.data["description"].to_s.strip.empty?

  desc = Jekyll::AutoDescription.extract(post.content)
  if desc.to_s.length < Jekyll::AutoDescription::MIN_USEFUL
    desc = post.data["subtitle"].to_s.strip
  end
  post.data["description"] = desc unless desc.to_s.empty?
end
