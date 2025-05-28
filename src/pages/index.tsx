import React from "react";
import Head from "next/head";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  Shield, 
  Clock, 
  Workflow, 
  BarChart3, 
  Database, 
  Globe, 
  CheckCircle, 
  ArrowRight,
  Users,
  Zap,
  Target,
  TrendingUp
} from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5 }
};

export default function Home() {
  return (
    <>
      <Head>
        <title>Exception Management System - Regulatory Compliance Platform</title>
        <meta name="description" content="Comprehensive exception management system for regulatory compliance, automated processing, and workflow integration" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="bg-background min-h-screen">
        <Header />
        
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
            <motion.div 
              className="text-center"
              initial="initial"
              animate="animate"
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp}>
                <Badge variant="secondary" className="mb-4 px-4 py-2">
                  <Zap className="w-4 h-4 mr-2" />
                  Next-Generation Compliance Platform
                </Badge>
              </motion.div>
              
              <motion.h1 
                className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6"
                variants={fadeInUp}
              >
                Exception Management
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Reimagined
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
                variants={fadeInUp}
              >
                Automate regulatory compliance with intelligent exception processing, 
                real-time monitoring, and seamless workflow integration.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center"
                variants={fadeInUp}
              >
                <Button size="lg" className="px-8 py-4 text-lg">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
                  Watch Demo
                </Button>
              </motion.div>
            </motion.div>
          </div>
          
          {/* Hero Image */}
          <motion.div 
            className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="relative rounded-2xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                alt="Financial Dashboard"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.h2 
                className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
                variants={fadeInUp}
              >
                Powerful Features for Modern Compliance
              </motion.h2>
              <motion.p 
                className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
                variants={fadeInUp}
              >
                Built for financial institutions that demand precision, speed, and reliability
              </motion.p>
            </motion.div>

            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              {[
                {
                  icon: Shield,
                  title: "Automated Exception Processing",
                  description: "Load and process exception files with intelligent validation and error handling"
                },
                {
                  icon: Clock,
                  title: "Aging Management",
                  description: "Track exception lifecycles with automated SLA monitoring and escalation"
                },
                {
                  icon: Workflow,
                  title: "Workflow Integration",
                  description: "Seamless integration with existing on-premise workflow systems"
                },
                {
                  icon: BarChart3,
                  title: "Real-time Monitoring",
                  description: "Live tracking of exception status with comprehensive dashboards"
                },
                {
                  icon: Database,
                  title: "Enterprise Database",
                  description: "Robust data persistence with full audit trail and history tracking"
                },
                {
                  icon: Globe,
                  title: "Cloud-Native Platform",
                  description: "Built on BCP Cloud Platform with enterprise-grade security"
                }
              ].map((feature, index) => (
                <motion.div key={index} variants={scaleIn}>
                  <Card className="h-full border-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 transition-all duration-300">
                    <CardContent className="p-8">
                      <feature.icon className="w-12 h-12 text-blue-600 mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Architecture Section */}
        <section className="py-24 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="grid lg:grid-cols-2 gap-16 items-center"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp}>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                  Enterprise-Grade Architecture
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                  Designed for scalability, reliability, and seamless integration with your existing infrastructure.
                </p>
                
                <div className="space-y-4">
                  {[
                    "Microservices architecture with .NET Core & Java Spring Boot",
                    "Modern frontend with Angular/React and TypeScript",
                    "Enterprise database with SQL Server/PostgreSQL",
                    "Container orchestration with Docker & Kubernetes"
                  ].map((item, index) => (
                    <motion.div 
                      key={index}
                      className="flex items-center"
                      variants={fadeInUp}
                    >
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              
              <motion.div variants={scaleIn}>
                <img 
                  src="https://images.unsplash.com/photo-1518186285589-2f7649de83e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80"
                  alt="System Architecture"
                  className="rounded-2xl w-full h-auto"
                />
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-24 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="grid md:grid-cols-4 gap-8 text-center"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              {[
                { number: "99.9%", label: "System Uptime", icon: Target },
                { number: "50%", label: "Processing Time Reduction", icon: TrendingUp },
                { number: "90%", label: "SLA Compliance Improvement", icon: CheckCircle },
                { number: "100%", label: "Audit Trail Coverage", icon: Shield }
              ].map((stat, index) => (
                <motion.div key={index} variants={scaleIn}>
                  <Card className="border-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                    <CardContent className="p-8">
                      <stat.icon className="w-8 h-8 text-blue-600 mx-auto mb-4" />
                      <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        {stat.number}
                      </div>
                      <div className="text-gray-600 dark:text-gray-300">
                        {stat.label}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-24 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Implementation Roadmap
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Structured approach to deliver your exception management system
              </p>
            </motion.div>

            <motion.div 
              className="grid md:grid-cols-4 gap-8"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              {[
                {
                  phase: "Phase 1",
                  title: "Foundation Setup",
                  duration: "4 weeks",
                  description: "Infrastructure setup, database design, and core services"
                },
                {
                  phase: "Phase 2", 
                  title: "Core Development",
                  duration: "8 weeks",
                  description: "Backend services, frontend development, and integration"
                },
                {
                  phase: "Phase 3",
                  title: "Advanced Features",
                  duration: "6 weeks", 
                  description: "Aging management, notifications, and reporting modules"
                },
                {
                  phase: "Phase 4",
                  title: "Deployment",
                  duration: "2 weeks",
                  description: "Production deployment and go-live support"
                }
              ].map((phase, index) => (
                <motion.div key={index} variants={scaleIn}>
                  <Card className="h-full border-0 bg-white dark:bg-gray-800">
                    <CardContent className="p-6">
                      <Badge variant="outline" className="mb-4">
                        {phase.phase}
                      </Badge>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {phase.title}
                      </h3>
                      <p className="text-sm text-blue-600 dark:text-blue-400 mb-3 font-medium">
                        {phase.duration}
                      </p>
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                        {phase.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-white dark:bg-gray-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.h2 
                className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6"
                variants={fadeInUp}
              >
                Ready to Transform Your Compliance Operations?
              </motion.h2>
              <motion.p 
                className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed"
                variants={fadeInUp}
              >
                Join leading financial institutions who trust our platform for their regulatory compliance needs.
              </motion.p>
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center"
                variants={fadeInUp}
              >
                <Button size="lg" className="px-8 py-4 text-lg">
                  Schedule Demo
                  <Users className="ml-2 w-5 h-5" />
                </Button>
                <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
                  Contact Sales
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-gray-400">
                © 2025 Exception Management System. Built for regulatory excellence.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}