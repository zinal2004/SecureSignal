import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, MessageSquare, Search, Lock } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              SecureSignal
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-blue-600 mb-4">
              Report Crimes Anonymously
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              AI-powered crime reporting with complete privacy and encrypted communication. 
              Your safety matters, your identity stays protected.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center mb-16">
            <Link
              to="/submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg"
            >
              Submit a Report
            </Link>
            <Link
              to="/track"
              className="bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg"
            >
              Track Report
            </Link>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <img
              src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=400&fit=crop"
              alt="Digital security concept"
              className="w-full h-64 md:h-80 object-cover rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* How It Works Preview */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How SecureSignal Works
          </h3>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Step 01</h4>
              <h5 className="font-medium text-blue-600 mb-2">Submit Your Report</h5>
              <p className="text-gray-600 text-sm">
                Fill out our secure form with crime details, location, and optional evidence
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Step 02</h4>
              <h5 className="font-medium text-blue-600 mb-2">Encryption & Anonymization</h5>
              <p className="text-gray-600 text-sm">
                Your data is encrypted and anonymized using advanced security protocols
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Step 03</h4>
              <h5 className="font-medium text-blue-600 mb-2">AI Analysis & Verification</h5>
              <p className="text-gray-600 text-sm">
                Our AI analyzes and summarizes your report for law enforcement
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Step 04</h4>
              <h5 className="font-medium text-blue-600 mb-2">Secure Communication</h5>
              <p className="text-gray-600 text-sm">
                Track updates through your unique Report ID with encrypted messaging
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link
              to="/how-it-works"
              className="text-blue-600 hover:text-blue-700 font-semibold underline"
            >
              Learn More About Our Process →
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
