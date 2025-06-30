import { Shield, MessageSquare, Search, Lock, Eye, Upload, FileText, Bell } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card, CardContent } from '@/components/ui/card';

const HowItWorks = () => {
  const steps = [
    {
      number: '01',
      title: 'Submit Your Report',
      description: 'Fill out our secure form with crime details, location, and optional evidence. Your submission is immediately encrypted.',
      icon: MessageSquare,
      features: ['Anonymous reporting option', 'File upload support', 'Real-time validation', 'Instant encryption']
    },
    {
      number: '02',
      title: 'Encryption & Anonymization',
      description: 'Your data is encrypted using military-grade security protocols and your identity is completely anonymized.',
      icon: Shield,
      features: ['End-to-end encryption', 'Identity protection', 'Secure data storage', 'GDPR compliance']
    },
    {
      number: '03',
      title: 'AI Analysis & Verification',
      description: 'Our AI analyzes your report, generates summaries, and routes it to the appropriate jurisdiction.',
      icon: Search,
      features: ['Intelligent categorization', 'Content summarization', 'Jurisdiction routing', 'Priority assessment']
    },
    {
      number: '04',
      title: 'Secure Communication',
      description: 'Track updates through your unique Report ID with encrypted messaging and status notifications.',
      icon: Lock,
      features: ['Unique Report ID', 'Status tracking', 'Encrypted updates', 'Anonymous communication']
    }
  ];

  const securityFeatures = [
    {
      icon: Eye,
      title: 'Complete Anonymity',
      description: 'Your identity is never stored or tracked. All personal information is stripped from reports.'
    },
    {
      icon: Shield,
      title: 'Military-Grade Encryption',
      description: 'All data is encrypted using AES-256 encryption, the same standard used by governments worldwide.'
    },
    {
      icon: FileText,
      title: 'AI-Powered Analysis',
      description: 'Our Gemini AI analyzes reports to extract key information and generate actionable summaries.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-20 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">How SecureSignal Works</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our four-step process ensures your safety while enabling effective crime reporting 
              through advanced AI and security technologies.
            </p>
          </div>

          {/* Main Steps */}
          <div className="space-y-12 mb-20">
            {steps.map((step, index) => (
              <Card key={step.number} className="overflow-hidden shadow-lg">
                <CardContent className="p-0">
                  <div className={`flex flex-col lg:flex-row ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                    {/* Content */}
                    <div className="flex-1 p-8 lg:p-12">
                      <div className="flex items-center mb-6">
                        <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mr-4">
                          {step.number}
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">{step.title}</h2>
                      </div>
                      
                      <p className="text-gray-600 text-lg mb-6">{step.description}</p>
                      
                      <div className="grid sm:grid-cols-2 gap-3">
                        {step.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center text-sm text-gray-700">
                            <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Icon */}
                    <div className="flex-shrink-0 bg-gradient-to-br from-blue-500 to-indigo-600 p-8 lg:p-12 flex items-center justify-center lg:w-80">
                      <step.icon className="w-24 h-24 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Security Features */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Built with Security & Privacy First
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {securityFeatures.map((feature, index) => (
                <Card key={index} className="text-center p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-0">
                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Is my report truly anonymous?</h3>
                <p className="text-gray-600">Yes, absolutely. We never collect or store any personally identifiable information. Your IP address is masked, and all data is anonymized before processing.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How does the AI analysis work?</h3>
                <p className="text-gray-600">Our AI uses Google's Gemini API to analyze report content, extract key information, categorize crimes, and generate summaries for law enforcement while maintaining your privacy.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">What happens after I submit a report?</h3>
                <p className="text-gray-600">Your report is encrypted, analyzed by AI, and forwarded to the appropriate authorities. You'll receive a unique Report ID to track status updates anonymously.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Can authorities contact me directly?</h3>
                <p className="text-gray-600">No direct contact is possible due to anonymization. All communication happens through the encrypted Report ID system, maintaining your privacy while enabling necessary follow-up.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HowItWorks;
