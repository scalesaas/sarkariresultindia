import React from 'react'
import { Mail, Phone, MapPin, Code, Megaphone, Target, Building, ExternalLink, Zap } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import Navbar from '../navbar/navbar'
import Footer from '@/components/Footer'

function ContactPage() {
  return (
    <div>
            <Navbar/> pt-8
        <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl pt-8 mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Contact
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Have a question, suggestion, or want to collaborate? I'd love to hear from you.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Contact Information */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="text-xl">Get In Touch</CardTitle>
              <CardDescription>
                Reach out through any of these channels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email */}
              <div className="flex items-start space-x-3">
                <div className="p-2 border rounded-md">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm text-foreground">Email</p>
                  <a 
                    href="mailto:ashishrohilla510@gmail.com" 
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ashishrohilla510@gmail.com
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start space-x-3">
                <div className="p-2 border rounded-md">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm text-foreground">Phone</p>
                  <a 
                    href="tel:+919588368052" 
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    +91 9588368052
                  </a>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start space-x-3">
                <div className="p-2 border rounded-md">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm text-foreground">Address</p>
                  <p className="text-sm text-muted-foreground">
                    Ram Gali, Uttam Nagar<br />
                    Gohana, Haryana, India
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Agency Services */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="text-xl flex items-center space-x-2">
                <Building className="w-5 h-5" />
                <span>Agency Services</span>
              </CardTitle>
              <CardDescription>
                SaaS scaling and business growth solutions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-md">
                <div className="flex items-center space-x-3 mb-2">
                  <Zap className="w-4 h-4 text-foreground" />
                  <h4 className="font-medium text-sm">Scale SaaS</h4>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Comprehensive SaaS scaling solutions to accelerate your business growth and optimize performance.
                </p>
                <Link href="https://scale-saas.vercel.app/" target="_blank">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-xs"
                  >
                  <ExternalLink className="w-3 h-3 mr-2" />
                  Visit Agency
                </Button>
                  </Link>
              </div>

              <div className="p-4 border rounded-md">
                <div className="flex items-center space-x-3 mb-2">
                  <Code className="w-4 h-4 text-foreground" />
                  <h4 className="font-medium text-sm">Custom Development</h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  Tailored software solutions for your unique business requirements
                </p>
              </div>

              <Separator />

              <Button 
                variant="default" 
                className="w-full text-sm"
                // onClick={() => window.open('mailto:ashishrohilla510@gmail.com?subject=Agency Services Inquiry', '_blank')}
              >
                <Building className="w-4 h-4 mr-2" />
                Get Quote
              </Button>
            </CardContent>
          </Card>

          {/* Individual Services */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="text-xl">Individual Services</CardTitle>
              <CardDescription>
                Personal projects and collaborations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="p-4 border rounded-md">
                  <div className="flex items-center space-x-3 mb-2">
                    <Code className="w-4 h-4 text-foreground" />
                    <h4 className="font-medium text-sm">Development</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Web development, mobile apps, and custom software solutions
                  </p>
                </div>

                <div className="p-4 border rounded-md">
                  <div className="flex items-center space-x-3 mb-2">
                    <Megaphone className="w-4 h-4 text-foreground" />
                    <h4 className="font-medium text-sm">Advertisement</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Website advertising opportunities with quality traffic
                  </p>
                </div>

                <div className="p-4 border rounded-md">
                  <div className="flex items-center space-x-3 mb-2">
                    <Target className="w-4 h-4 text-foreground" />
                    <h4 className="font-medium text-sm">Employment</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Open to full-time positions and career opportunities
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Button 
                  variant="default" 
                  className="w-full text-sm"
                  // onClick={() => window.open('mailto:ashishrohilla510@gmail.com?subject=Project Discussion', '_blank')}
                >
                  <Code className="w-4 h-4 mr-2" />
                  Hire for Project
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full text-sm"
                  // onClick={() => window.open('mailto:ashishrohilla510@gmail.com?subject=Advertisement Inquiry', '_blank')}
                >
                  <Megaphone className="w-4 h-4 mr-2" />
                  Advertise with Us
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full text-sm"
                  // onClick={() => window.open('mailto:ashishrohilla510@gmail.com?subject=Job Opportunity', '_blank')}
                >
                  <Target className="w-4 h-4 mr-2" />
                  Job Opportunity
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Overview */}
        <Card className="mt-8 border border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-lg">Let's Work Together</CardTitle>
            <CardDescription>
              Exploring opportunities in software development and digital collaboration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 border rounded-md flex items-center justify-center mx-auto">
                  <Building className="w-5 h-5 text-foreground" />
                </div>
                <h4 className="font-medium text-sm">SaaS Scaling</h4>
                <p className="text-xs text-muted-foreground">
                  Comprehensive business growth and optimization solutions
                </p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 border rounded-md flex items-center justify-center mx-auto">
                  <Code className="w-5 h-5 text-foreground" />
                </div>
                <h4 className="font-medium text-sm">Software Development</h4>
                <p className="text-xs text-muted-foreground">
                  Custom applications tailored to your requirements
                </p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 border rounded-md flex items-center justify-center mx-auto">
                  <Megaphone className="w-5 h-5 text-foreground" />
                </div>
                <h4 className="font-medium text-sm">Platform Advertising</h4>
                <p className="text-xs text-muted-foreground">
                  Promote your brand with targeted reach and engagement
                </p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 border rounded-md flex items-center justify-center mx-auto">
                  <Target className="w-5 h-5 text-foreground" />
                </div>
                <h4 className="font-medium text-sm">Career Growth</h4>
                <p className="text-xs text-muted-foreground">
                  Available for challenging roles and team collaboration
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
        <Footer />

    </div>
  
  )
}

export default ContactPage