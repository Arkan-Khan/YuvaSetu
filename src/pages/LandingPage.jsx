import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Button from '../components/Button';
import Card from '../components/Card';

const LandingPage = () => {
  // Features section data
  const features = [
    {
      title: 'For Volunteers',
      description: 'Find opportunities that match your skills and interests.',
      icon: '🤝',
      color: 'bg-teal-50',
      iconColor: 'text-teal-600',
    },
    {
      title: 'For NGOs',
      description: 'Connect with skilled volunteers for your projects.',
      icon: '🏢',
      color: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      title: 'Smart Matching',
      description: 'Our algorithm finds the best fit based on skills and preferences.',
      icon: '🔄',
      color: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      title: 'Works Offline',
      description: 'YuvaSetu works even without an internet connection.',
      icon: '💾',
      color: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
  ];

  // Testimonials data (placeholder)
  const testimonials = [
    {
      quote: "YuvaSetu helped me find the perfect volunteering opportunity in my area.",
      author: "Priya S., Volunteer",
    },
    {
      quote: "We found amazing volunteers for our education initiative through this platform.",
      author: "Adarsh NGO, Delhi",
    },
    {
      quote: "The matching algorithm is spot on! I found positions that align with my skills.",
      author: "Rahul K., Volunteer",
    },
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="py-12 md:py-20 bg-gradient-to-br from-teal-600 to-teal-800 text-white rounded-lg shadow-md mb-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Connect, Contribute, Create Change
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            YuvaSetu brings together NGOs and volunteers, creating opportunities for meaningful contribution.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" variant="secondary">Get Started</Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-teal-700">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How YuvaSetu Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className={`${feature.color} border-none h-full`}>
                <Card.Body className="text-center">
                  <div className={`${feature.iconColor} text-4xl mb-4`}>{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-slate-700">{feature.description}</p>
                </Card.Body>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 bg-slate-100 rounded-lg">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl shadow-md">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Sign Up</h3>
              <p className="text-slate-700">
                Create your profile as a volunteer or an NGO.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl shadow-md">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect</h3>
              <p className="text-slate-700">
                Find opportunities or volunteers based on interests and skills.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl shadow-md">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Contribute</h3>
              <p className="text-slate-700">
                Make a meaningful impact through your collaboration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What Users Say</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} variant="hover" className="h-full">
                <Card.Body>
                  <div className="text-4xl text-slate-300 mb-4">"</div>
                  <p className="text-slate-700 mb-4">{testimonial.quote}</p>
                  <p className="text-right font-medium text-slate-900">— {testimonial.author}</p>
                </Card.Body>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-teal-600 text-white rounded-lg my-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Make a Difference?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join YuvaSetu today and be part of a community dedicated to creating positive change.
          </p>
          <Link to="/signup">
            <Button size="lg" variant="secondary">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>
    </MainLayout>
  );
};

export default LandingPage; 