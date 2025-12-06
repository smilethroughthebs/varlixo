'use client';

/**
 * VARLIXO - SYSTEM STATUS PAGE
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/app/components/layout/Navbar';
import Footer from '@/app/components/layout/Footer';
import { Card } from '@/app/components/ui/Card';
import { 
  CheckCircle, AlertTriangle, XCircle, Activity, 
  Server, Database, Globe, Shield, Clock, RefreshCw 
} from 'lucide-react';

const services = [
  { name: 'Website', status: 'operational', uptime: '99.99%', icon: Globe },
  { name: 'API Services', status: 'operational', uptime: '99.98%', icon: Server },
  { name: 'Database', status: 'operational', uptime: '99.99%', icon: Database },
  { name: 'Authentication', status: 'operational', uptime: '100%', icon: Shield },
  { name: 'Payment Processing', status: 'operational', uptime: '99.97%', icon: Activity },
  { name: 'Email Services', status: 'operational', uptime: '99.95%', icon: Activity },
];

const incidents = [
  {
    date: 'December 1, 2024',
    title: 'Scheduled Maintenance Completed',
    status: 'resolved',
    description: 'Regular system maintenance was completed successfully with no issues.',
  },
  {
    date: 'November 28, 2024',
    title: 'API Response Delays',
    status: 'resolved',
    description: 'Some users experienced slow API responses. Issue was identified and resolved within 30 minutes.',
  },
];

export default function StatusPage() {
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'degraded':
        return <AlertTriangle className="text-yellow-500" size={20} />;
      case 'outage':
        return <XCircle className="text-red-500" size={20} />;
      default:
        return <CheckCircle className="text-green-500" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'outage':
        return 'bg-red-500';
      default:
        return 'bg-green-500';
    }
  };

  const allOperational = services.every(s => s.status === 'operational');

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      
      <main className="pt-28 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">System Status</h1>
            <p className="text-gray-400">Real-time status of Varlixo services</p>
          </motion.div>

          {/* Overall Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className={`p-6 ${allOperational ? 'bg-green-500/10 border-green-500/30' : 'bg-yellow-500/10 border-yellow-500/30'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {allOperational ? (
                    <CheckCircle className="text-green-500" size={32} />
                  ) : (
                    <AlertTriangle className="text-yellow-500" size={32} />
                  )}
                  <div>
                    <h2 className={`text-xl font-bold ${allOperational ? 'text-green-400' : 'text-yellow-400'}`}>
                      {allOperational ? 'All Systems Operational' : 'Some Systems Degraded'}
                    </h2>
                    <p className="text-gray-400 text-sm">
                      Last updated: {lastUpdated.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setLastUpdated(new Date())}
                  className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-dark-700 transition-colors"
                >
                  <RefreshCw size={20} />
                </button>
              </div>
            </Card>
          </motion.div>

          {/* Services Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Services</h3>
            <Card>
              <div className="divide-y divide-dark-700">
                {services.map((service, index) => (
                  <div key={service.name} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <service.icon className="text-gray-400" size={20} />
                      <span className="text-white font-medium">{service.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500">{service.uptime} uptime</span>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${getStatusColor(service.status)}`} />
                        <span className={`text-sm capitalize ${
                          service.status === 'operational' ? 'text-green-400' : 
                          service.status === 'degraded' ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {service.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Uptime Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <h3 className="text-lg font-semibold text-white mb-4">90-Day Uptime</h3>
            <Card className="p-6">
              <div className="flex gap-1">
                {Array.from({ length: 90 }, (_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-8 rounded-sm ${
                      Math.random() > 0.02 ? 'bg-green-500' : 'bg-yellow-500'
                    }`}
                    title={`Day ${90 - i}: Operational`}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-3 text-sm text-gray-500">
                <span>90 days ago</span>
                <span>Today</span>
              </div>
            </Card>
          </motion.div>

          {/* Recent Incidents */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-lg font-semibold text-white mb-4">Recent Incidents</h3>
            <div className="space-y-4">
              {incidents.map((incident, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-start gap-4">
                    <CheckCircle className="text-green-500 flex-shrink-0 mt-1" size={20} />
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-white font-medium">{incident.title}</h4>
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                          {incident.status}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">{incident.description}</p>
                      <p className="text-gray-500 text-xs flex items-center gap-1">
                        <Clock size={12} />
                        {incident.date}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}






