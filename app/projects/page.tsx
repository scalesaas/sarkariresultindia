"use client";
import { useState } from "react";
import { ExternalLink, Github, Building2, Code2, Heart } from "lucide-react";

interface Project {
  title: string;
  description: string;
  technologies: string[];
  imageUrl: string;
  liveUrl?: string;
  githubUrl?: string;
  category: 'company' | 'side' | 'hobby';
}

const projects: Project[] = [
  
  // Side Projects
  {
    title: "Task Management App",
    description: "Personal productivity app with team collaboration features and project tracking",
    technologies: ["Vue.js", "Firebase", "TailwindCSS", "PWA"],
    imageUrl: "/api/placeholder/400/240",
    liveUrl: "https://my-task-app.com",
    githubUrl: "https://github.com/username/task-manager",
    category: "side"
  },
  {
    title: "Weather Forecast API",
    description: "RESTful API service providing detailed weather forecasts with location-based predictions",
    technologies: ["Python", "FastAPI", "MongoDB", "Docker", "Heroku"],
    imageUrl: "/api/placeholder/400/240",
    githubUrl: "https://github.com/username/weather-api",
    category: "side"
  },
  {
    title: "Crypto Portfolio Tracker",
    description: "Track cryptocurrency investments with real-time prices and portfolio analytics",
    technologies: ["React Native", "Redux", "CoinGecko API", "Chart.js"],
    imageUrl: "/api/placeholder/400/240",
    liveUrl: "https://crypto-tracker.app",
    githubUrl: "https://github.com/username/crypto-tracker",
    category: "side"
  },
  
  // Hobby Projects
  {
    title: "Recipe Generator",
    description: "AI-powered recipe suggestions based on available ingredients and dietary preferences",
    technologies: ["Python", "OpenAI API", "Streamlit", "SQLite"],
    imageUrl: "/api/placeholder/400/240",
    liveUrl: "https://recipe-gen.streamlit.app",
    githubUrl: "https://github.com/username/recipe-generator",
    category: "hobby"
  },
  {
    title: "Pixel Art Creator",
    description: "Browser-based pixel art editor with animation support and export features",
    technologies: ["JavaScript", "Canvas API", "CSS Grid", "Local Storage"],
    imageUrl: "/api/placeholder/400/240",
    liveUrl: "https://pixel-art-creator.netlify.app",
    githubUrl: "https://github.com/username/pixel-art-creator",
    category: "hobby"
  },
  {
    title: "Meditation Timer",
    description: "Minimalist meditation timer with ambient sounds and progress tracking",
    technologies: ["HTML5", "CSS3", "Web Audio API", "Service Worker"],
    imageUrl: "/api/placeholder/400/240",
    liveUrl: "https://zen-timer.github.io",
    githubUrl: "https://github.com/username/meditation-timer",
    category: "hobby"
  }
];

const categories = [
  { id: 'side', label: 'Side Projects', icon: Code2, color: 'bg-purple-500' },
  { id: 'hobby', label: 'Hobby Projects', icon: Heart, color: 'bg-pink-500' }
];

const ProjectSection = () => {
  const [activeCategory, setActiveCategory] = useState<'side' | 'hobby'>('side');

  const filteredProjects = projects.filter(project => project.category === activeCategory);
  const activeTab = categories.find(cat => cat.id === activeCategory);

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">My Projects</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore my work across different categories - from professional company projects to personal experiments
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-200">
            <div className="flex space-x-2">
              {categories.map((category) => {
                const Icon = category.icon;
                const isActive = activeCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id as any)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      isActive
                        ? `${category.color} text-white shadow-lg transform scale-105`
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{category.label}</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-bold ${
                      isActive ? 'bg-white/20' : 'bg-gray-200'
                    }`}>
                      {projects.filter(p => p.category === category.id).length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Category Description */}
        <div className="text-center mb-12">
          <div className={`inline-flex items-center space-x-2 px-6 py-3 rounded-xl ${activeTab?.color} text-white font-semibold`}>
            {activeTab && <activeTab.icon size={20} />}
            <span>{activeTab?.label}</span>
          </div>
          <p className="mt-4 text-gray-600 max-w-xl mx-auto">
            {activeCategory === 'side' && "Personal projects built to solve real problems and explore new technologies."}
            {activeCategory === 'hobby' && "Fun experimental projects created for learning and creative expression."}
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <div 
              key={`${project.category}-${index}`} 
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100"
            >
              {/* Project Image */}
              <div className="relative overflow-hidden">
                <img 
                  src={project.imageUrl}
                  alt={project.title}
                  className="w-full h-48 object-cover transform hover:scale-105 transition-transform duration-300"
                />
                <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold text-white ${activeTab?.color}`}>
                  {activeTab?.label.replace(' Projects', '')}
                </div>
              </div>

              {/* Project Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{project.title}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{project.description}</p>
                
                {/* Technologies */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.technologies.map((tech, techIndex) => (
                    <span 
                      key={techIndex}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                
                {/* Project Links */}
                <div className="flex space-x-4">
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                    >
                      <ExternalLink size={16} />
                      <span>Live Demo</span>
                    </a>
                  )}
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium"
                    >
                      <Github size={16} />
                      <span>GitHub</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              {activeTab && <activeTab.icon size={64} className="mx-auto" />}
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No projects yet</h3>
            <p className="text-gray-500">Stay tuned for upcoming {activeTab?.label.toLowerCase()}!</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProjectSection;