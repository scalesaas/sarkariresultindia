import React from 'react';

interface YouTubeEmbedProps {
  videoId: string;
}

const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({ videoId }) => (
  <div className="my-10 w-full aspect-video max-w-4xl mx-auto rounded-xl overflow-hidden shadow-lg border border-gray-200">
    <iframe
      className="w-full h-full"
      src={`https://www.youtube.com/embed/${videoId}`}
      title="YouTube video player"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  </div>
);

export default YouTubeEmbed;
