import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = "" }) => {
  if (!content) return null;

  // Clean up various markup artifacts
  const cleanContent = (text: string): string => {
    return text
      // Remove citation markers
      .replace(/\[First tool output[^\]]*\]/g, '')
      .replace(/\[Second tool output[^\]]*\]/g, '')
      .replace(/\[Third tool output[^\]]*\]/g, '')
      .replace(/\[.*?in search.*?\]/g, '')
      .replace(/\[\d+(?:,\s*\d+)*\]/g, '')
      // Remove triple asterisks
      .replace(/\*\*\*/g, '')
      .trim();
  };

  // Split by newlines to handle paragraphs/lists
  const lines = cleanContent(content).split('\n');

  return (
    <div className={`space-y-2 ${className}`}>
      {lines.map((line, index) => {
        // Handle bold text (**text**)
        const parts = line.split(/(\*\*.*?\*\*)/g);
        
        const formattedLine = parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
          }
          return part;
        });

        // Handle bullet points
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            return (
                <div key={index} className="flex items-start gap-2 ml-2">
                    <span className="text-gray-400 mt-1.5">•</span>
                    <p className="text-gray-700 leading-relaxed">{formattedLine.slice(1)}</p>
                </div>
            );
        }

        // Handle empty lines
        if (!line.trim()) return <br key={index} />;

        // Default paragraph
        return <p key={index} className="text-gray-700 leading-relaxed">{formattedLine}</p>;
      })}
    </div>
  );
};

export default MarkdownRenderer;
