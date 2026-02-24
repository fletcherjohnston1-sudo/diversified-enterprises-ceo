'use client';

import { useState, useEffect } from 'react';

interface Doc {
  id: string;
  title: string;
  path: string;
}

const docs: Doc[] = [
  { id: 'investment-analysis', title: 'Investment Analysis System', path: '/home/clawd/.openclaw/workspace-cfo/investment-analysis-system.md' },
];

export default function DocsPage() {
  const [selectedDoc, setSelectedDoc] = useState<Doc>(docs[0]);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDoc(selectedDoc.path);
  }, [selectedDoc]);

  const loadDoc = async (path: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/docs?path=${encodeURIComponent(path)}`);
      const data = await response.json();
      if (data.success) {
        setContent(data.content);
      } else {
        setContent('# Error loading document\n' + data.error);
      }
    } catch {
      setContent('# Error\nFailed to load document');
    } finally {
      setLoading(false);
    }
  };

  // Simple markdown to HTML conversion
  const renderMarkdown = (md: string) => {
    // Headers
    md = md.replace(/^### (.*$)/gim, '<h3 style="color: #fff; margin: 24px 0 12px; font-size: 18px;">$1</h3>');
    md = md.replace(/^## (.*$)/gim, '<h2 style="color: #fff; margin: 28px 0 16px; font-size: 22px; border-bottom: 1px solid #374151; padding-bottom: 8px;">$1</h2>');
    md = md.replace(/^# (.*$)/gim, '<h1 style="color: #fff; margin: 0 0 24px; font-size: 28px;">$1</h1>');
    
    // Bold
    md = md.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>');
    
    // Tables - parse properly
    const tableRegex = /(\|.+\|)\n(\|[-:| ]+\|)\n((?:\|.+\|\n?)+)/g;
    md = md.replace(tableRegex, (match: string, headerRow: string, separator: string, bodyRows: string) => {
      const headers = headerRow.split('|').filter((c: string) => c.trim()).map((h: string) => h.trim());
      const rows = bodyRows.trim().split('\n').map((row: string) => 
        row.split('|').filter((c: string) => c.trim()).map((c: string) => c.trim())
      );
      
      let html = '<table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; border: 1px solid #374151;">';
      
      // Header
      html += '<thead><tr>';
      headers.forEach(h => {
        html += `<th style="padding: 12px 16px; border: 1px solid #374151; background: #1f2937; color: #fff; text-align: left; font-weight: 600;">${h}</th>`;
      });
      html += '</tr></thead>';
      
      // Body
      html += '<tbody>';
      rows.forEach((row, i) => {
        const bg = i % 2 === 0 ? '#111827' : '#1f2937';
        html += '<tr>';
        row.forEach(cell => {
          html += `<td style="padding: 10px 16px; border: 1px solid #374151; color: #d1d5db; background: ${bg};">${cell}</td>`;
        });
        html += '</tr>';
      });
      html += '</tbody></table>';
      
      return html;
    });
    
    // Code blocks
    md = md.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre style="background: #111827; padding: 16px; border-radius: 8px; overflow-x: auto; color: #e5e7eb;"><code>$2</code></pre>');
    
    // Inline code
    md = md.replace(/`(.*?)`/g, '<code style="background: #374151; padding: 2px 6px; border-radius: 4px; font-size: 13px; color: #f472b6;">$1</code>');
    
    // Links
    md = md.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" style="color: #60a5fa; text-decoration: underline;">$1</a>');
    
    // Lists
    md = md.replace(/^\- (.*$)/gim, '<li style="margin: 6px 0; color: #d1d5db;">$1</li>');
    md = md.replace(/(<li.*<\/li>)+/g, '<ul style="margin: 12px 0; padding-left: 24px;">$&</ul>');
    
    // Line breaks
    md = md.replace(/\n\n/g, '</p><p style="color: #d1d5db; line-height: 1.7; margin: 12px 0;">');
    md = md.replace(/\n/g, '<br/>');
    
    return `<div style="color: #d1d5db; line-height: 1.7;">
      <p style="color: #d1d5db; line-height: 1.7; margin: 12px 0;">${md}</p>
    </div>`;
  };

  return (
    <div style={{ display: 'flex', gap: '24px' }}>
      {/* Sidebar */}
      <div style={{ width: '250px', flexShrink: 0 }}>
        <h2 style={{ color: '#fff', fontSize: '18px', marginBottom: '16px' }}>Documents</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {docs.map(doc => (
            <button
              key={doc.id}
              onClick={() => setSelectedDoc(doc)}
              style={{
                textAlign: 'left',
                padding: '10px 14px',
                backgroundColor: selectedDoc.id === doc.id ? '#3b82f6' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                color: selectedDoc.id === doc.id ? '#fff' : '#9ca3af',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 150ms ease',
              }}
            >
              {doc.title}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, backgroundColor: '#111827', borderRadius: '12px', padding: '24px', minHeight: '600px' }}>
        {loading ? (
          <div style={{ color: '#9ca3af' }}>Loading...</div>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
        )}
      </div>
    </div>
  );
}
