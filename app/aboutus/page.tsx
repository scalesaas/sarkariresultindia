import React from 'react';
import { Code, Server, Users, Target, Award, BookOpen, Lightbulb, Heart } from 'lucide-react';
import Link from 'next/link';

function AboutUsPage() {
  const skills = [
    { name: "DevOps Engineering", icon: Server, level: 95 },
    { name: "Full Stack Development", icon: Code, level: 90 },
    { name: "Cloud Architecture", icon: Target, level: 88 },
    { name: "System Administration", icon: Award, level: 92 }
  ];

  const values = [
    {
      icon: BookOpen,
      title: "Education First",
      description: "Making complex technical concepts accessible to everyone, regardless of experience level."
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Building a supportive community where developers and tech enthusiasts can learn together."
    },
    {
      icon: Lightbulb,
      title: "Innovation Focus",
      description: "Staying ahead of technology trends and sharing cutting-edge knowledge and practices."
    },
    {
      icon: Heart,
      title: "Passion for Tech",
      description: "Genuine enthusiasm for technology that drives us to create quality educational content."
    }
  ];

  const achievements = [
    { number: "50+", label: "Students Taught" },
    { number: "10+", label: "Projects Completed" },
    { number: "2+", label: "Years Experience" },
    { number: "100%", label: "Satisfaction Rate" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6">
            <Code className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Ashish Rohilla</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Passionate about empowering developers and tech enthusiasts through comprehensive learning resources
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto space-y-16">
          
          {/* Mission Statement */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 lg:p-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto"></div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                  Welcome to <span className="font-semibold text-blue-600 dark:text-blue-400">ashishrohilla.in</span>! 
                  We are passionate about providing free, high-quality resources for learning DevOps, software development, 
                  and cutting-edge technology knowledge.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Our mission is to democratize tech education, making learning accessible to everyone, regardless of their 
                  background, experience level, or financial situation. We believe that knowledge should be free and available to all.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Whether you're a complete beginner taking your first steps into programming or an experienced professional 
                  looking to master the latest DevOps practices, you'll find valuable content, practical tutorials, and 
                  real-world projects on our platform.
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">What Sets Us Apart</h3>
                <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Industry-relevant curriculum</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Hands-on practical projects</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Real-world case studies</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Community-driven learning</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Skills Section */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 lg:p-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Expertise Areas</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mx-auto"></div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {skills.map((skill, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <skill.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    <span className="font-semibold text-gray-900 dark:text-white">{skill.name}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto">{skill.level}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${skill.level}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Values Section */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 lg:p-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Values</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto"></div>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div key={index} className="text-center group">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4 group-hover:bg-blue-100 dark:group-hover:bg-blue-900 transition-colors duration-200">
                    <value.icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{value.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Achievements Section */}
          <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-8 lg:p-12 text-white">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Our Impact</h2>
              <p className="text-blue-100">Numbers that reflect our commitment to excellence</p>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {achievements.map((achievement, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold mb-2">{achievement.number}</div>
                  <div className="text-blue-100 text-sm font-medium">{achievement.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Journey Section */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 lg:p-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">My Journey</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-yellow-500 to-red-500 rounded-full mx-auto"></div>
            </div>
            
            <div className="space-y-6 text-gray-700 dark:text-gray-300">
              <p className="text-lg leading-relaxed">
                My journey in technology began with a simple curiosity about how things work behind the scenes. 
                What started as tinkering with code has evolved into a passion for teaching and sharing knowledge 
                with the global developer community.
              </p>
              <p className="leading-relaxed">
                Over the years, I've had the privilege of working with cutting-edge technologies, building scalable 
                systems, and most importantly, helping hundreds of individuals transition into successful tech careers. 
                Each student's success story fuels my dedication to creating better educational content.
              </p>
              <p className="leading-relaxed">
                Today, through ashishrohilla.in, I continue this mission by providing comprehensive tutorials, 
                practical projects, and mentorship opportunities. My goal is to bridge the gap between theoretical 
                knowledge and real-world application, ensuring that every learner is job-ready and confident in 
                their abilities.
              </p>
            </div>
          </section>

          {/* Call to Action */}
          <section className="text-center bg-gray-100 dark:bg-gray-700 rounded-2xl p-8 lg:p-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Join Our Community</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Thank you for being part of this journey of exploration and discovery. Together, we'll help you achieve 
              your goals and unleash your full potential in the exciting world of software development and DevOps!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200">
                Start Learning
              </button>
              <Link href ="/courses">
              <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 px-8 py-3 rounded-lg font-semibold transition-colors duration-200">
                View Courses
              </button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default AboutUsPage;