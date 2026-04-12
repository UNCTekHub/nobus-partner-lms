export default function MarkdownRenderer({ content }) {
  const html = markdownToHtml(content);
  return (
    <div
      className="lesson-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function markdownToHtml(md) {
  let html = md;

  // Code blocks (``` ... ```)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre><code class="language-${lang}">${escapeHtml(code.trim())}</code></pre>`;
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

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');
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

  // Paragraphs - wrap remaining loose text
  html = html.replace(/\n\n/g, '</p><p>');
  if (!html.startsWith('<')) html = '<p>' + html;
  if (!html.endsWith('>')) html = html + '</p>';

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer" class="text-nobus-600 underline hover:text-nobus-800">$1</a>');

  return html;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
