'use client';

/**
 * VARLIXO - CAREERS PAGE
 */

import { motion } from 'framer-motion';
import Navbar from '@/app/components/layout/Navbar';
import Footer from '@/app/components/layout/Footer';
import { Card } from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import { 
  Briefcase, MapPin, Clock, Users, Heart, Zap, 
  Globe, Coffee, Gift, ArrowRight, Mail 
} from 'lucide-react';

const benefits = [
  { icon: Globe, title: 'Remote First', description: 'Work from anywhere in the world' },
  { icon: Heart, title: 'Health Benefits', description: 'Comprehensive health coverage' },
  { icon: Coffee, title: 'Flexible Hours', description: 'Work when you\'re most productive' },
  { icon: Zap, title: 'Growth Opportunities', description: 'Career development programs' },
  { icon: Gift, title: 'Competitive Salary', description: 'Top market compensation' },
  { icon: Users, title: 'Great Team', description: 'Work with talented people' },
];

const openPositions = [
  { 
    title: 'Senior Backend Developer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
  },
  { 
    title: 'Frontend React Developer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
  },
  { 
    title: 'Product Designer',
    department: 'Design',
    location: 'Remote',
    type: 'Full-time',
  },
  { 
    title: 'Customer Support Specialist',
    department: 'Support',
    location: 'Remote',
    type: 'Full-time',
  },
  { 
    title: 'Marketing Manager',
    department: 'Marketing',
    location: 'Remote',
    type: 'Full-time',
  },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      
      <main className="pt-28 pb-20">
        {/* Hero Section */}
        <section className="px-4 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <span className="inline-block px-4 py-2 bg-primary-500/10 text-primary-400 rounded-full text-sm font-medium mb-6">
              Join Our Team
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Build the Future of Finance
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              We're looking for passionate people to help us revolutionize investing. 
              Work with cutting-edge technology and make a real impact.
            </p>
          </motion.div>
        </section>

        {/* Benefits Section */}
        <section className="px-4 py-16 bg-dark-800/30 mb-20">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-white mb-4">Why Work at Varlixo?</h2>
              <p className="text-gray-400">We offer competitive benefits and a great work culture</p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 text-center hover:border-primary-500/30 transition-all">
                    <div className="w-14 h-14 rounded-2xl bg-primary-500/20 flex items-center justify-center mx-auto mb-4">
                      <benefit.icon className="text-primary-500" size={28} />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                    <p className="text-gray-400 text-sm">{benefit.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Open Positions */}
        <section className="px-4 mb-20">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-white mb-4">Open Positions</h2>
              <p className="text-gray-400">Find your next opportunity at Varlixo</p>
            </motion.div>

            <div className="space-y-4">
              {openPositions.map((position, index) => (
                <motion.div
                  key={position.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 hover:border-primary-500/50 transition-all group cursor-pointer">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Briefcase size={18} className="text-primary-500" />
                          <span className="text-sm text-primary-400">{position.department}</span>
                        </div>
                        <h3 className="text-xl font-semibold text-white group-hover:text-primary-400 transition-colors">
                          {position.title}
                        </h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <MapPin size={14} />
                            {position.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {position.type}
                          </span>
                        </div>
                      </div>
                      <Button variant="secondary" size="sm" rightIcon={<ArrowRight size={16} />}>
                        Apply Now
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <Card className="p-8 md:p-12 text-center bg-gradient-to-br from-primary-500/10 to-purple-500/5 border-primary-500/20">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Don't See Your Role?
              </h2>
              <p className="text-gray-400 mb-6 max-w-xl mx-auto">
                We're always looking for talented people. Send us your resume and we'll 
                keep you in mind for future opportunities.
              </p>
              <a href="mailto:careers@varlixo.com">
                <Button size="lg" leftIcon={<Mail size={20} />}>
                  Send Your Resume
                </Button>
              </a>
            </Card>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}








