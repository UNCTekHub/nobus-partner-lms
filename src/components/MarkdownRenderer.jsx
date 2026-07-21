export default function MarkdownRenderer({ content }) {
  const html = markdownToHtml(content || '');
  return (
    <div
      className="lesson-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// Escape all HTML-significant characters. Applied to the ENTIRE input up front so
// that no raw HTML from the source can ever reach the DOM; markdown transforms
// then build a known-safe set of tags on top of the escaped text.
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Only permit safe URL schemes in links/images/media. Blocks javascript:, data:,
// vbscript: and anything with characters that could break out of an attribute.
function safeUrl(url) {
  const u = (url || '').trim();
  const decoded = u.replace(/&amp;/g, '&');
  if (/[\s"'`<>]/.test(u)) return '#';
  if (/^(https?:\/\/|mailto:|\/|#|\.\/|\.\.\/)/i.test(decoded)) return u;
  return '#';
}

function markdownToHtml(md) {
  // 1) Neutralize all raw HTML first.
  let html = escapeHtml(md);

  // Code blocks (``` ... ```) - content is already escaped above
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre><code class="language-${lang}">${code.trim()}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Tables
  html = html.replace(/(?:^|\n)(\|.+\|)\n(\|[-| :]+\|)\n((?:\|.+\|\n?)+)/g, (_, header, sep, body) => {
    const headers = header.split('|').filter(c => c.trim()).map(c => `<th>${c.trim()}</th>`).join('');
    const rows = body.trim().split('\n').map(row => {
      const cells = row.split('|').filter(c => c.trim()).map(c => `<td>${c.trim()}</td>`).join('');
      return `<tr>${cells}</tr>`;
    }).join('');
    return `<table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
  });

  // Headings
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr />');

  // Blockquotes ('>' has been escaped to '&gt;')
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');
  // Merge consecutive blockquotes
  html = html.replace(/<\/blockquote>\n<blockquote>/g, '<br />');

  // Bold and italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Unordered lists
  html = html.replace(/(?:^|\n)((?:- .+\n?)+)/g, (_, items) => {
    const lis = items.trim().split('\n').map(item => {
      return `<li>${item.replace(/^- /, '')}</li>`;
    }).join('');
    return `<ul>${lis}</ul>`;
  });

  // Ordered lists
  html = html.replace(/(?:^|\n)((?:\d+\. .+\n?)+)/g, (_, items) => {
    const lis = items.trim().split('\n').map(item => {
      return `<li>${item.replace(/^\d+\. /, '')}</li>`;
    }).join('');
    return `<ol>${lis}</ol>`;
  });

  // Checkboxes
  html = html.replace(/☐/g, '<input type="checkbox" disabled /> ');
  html = html.replace(/☑/g, '<input type="checkbox" checked disabled /> ');

  // YouTube embeds - the id is constrained to a safe charset
  html = html.replace(/!\[video\]\((?:https?:\/\/(?:www\.)?youtube\.com\/watch\?v=|https?:\/\/youtu\.be\/)([\w-]{6,20})[^)]*\)/g,
    '<div class="aspect-video my-4 rounded-lg overflow-hidden"><iframe src="https://www.youtube.com/embed/$1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="w-full h-full"></iframe></div>');

  // Generic video embed: ![video](url.mp4)
  html = html.replace(/!\[video\]\(([^)]+\.(?:mp4|webm|ogg))\)/g,
    (_, url) => `<div class="my-4"><video controls class="w-full rounded-lg"><source src="${safeUrl(url)}" /></video></div>`);

  // Audio embed: ![audio](url.mp3)
  html = html.replace(/!\[audio\]\(([^)]+\.(?:mp3|wav|ogg))\)/g,
    (_, url) => `<div class="my-4"><audio controls class="w-full"><source src="${safeUrl(url)}" /></audio></div>`);

  // Images with alt text
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,
    (_, alt, url) => `<figure class="my-4"><img src="${safeUrl(url)}" alt="${alt}" class="w-full rounded-lg" loading="lazy" /><figcaption class="text-center text-sm text-gray-500 mt-2">${alt}</figcaption></figure>`);

  // Callout boxes: :::tip, :::warning, :::info
  html = html.replace(/:::tip\n([\s\S]*?):::/g, '<div class="p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg my-4"><strong class="text-green-700">Tip:</strong> <span class="text-green-800">$1</span></div>');
  html = html.replace(/:::warning\n([\s\S]*?):::/g, '<div class="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg my-4"><strong class="text-amber-700">Warning:</strong> <span class="text-amber-800">$1</span></div>');
  html = html.replace(/:::info\n([\s\S]*?):::/g, '<div class="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg my-4"><strong class="text-blue-700">Note:</strong> <span class="text-blue-800">$1</span></div>');

  // Paragraphs - wrap remaining loose text
  html = html.replace(/\n\n/g, '</p><p>');
  if (!html.startsWith('<')) html = '<p>' + html;
  if (!html.endsWith('>')) html = html + '</p>';

  // Links - URL is scheme-validated
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g,
    (_, text, url) => `<a href="${safeUrl(url)}" target="_blank" rel="noreferrer" class="text-nobus-600 underline hover:text-nobus-800">${text}</a>`);

  return html;
}
