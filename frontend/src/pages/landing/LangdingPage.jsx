import React from 'react';
import { FaCloudRain, FaUmbrella, FaChartLine, FaMobileAlt, FaBell, FaShieldAlt } from 'react-icons/fa';

const LandingPage = () => {
  // Central Mindanao University color scheme
  const colors = {
    primary: '#006400', // Green
    secondary: '#008000', // Lighter green
    accent: '#FFD700', // Yellow
    background: '#F8F8F0', // Very light yellow-white background
    text: '#333333', // Dark text
    lightText: '#666666', // Lighter text color
    white: '#ffffff',
    lightAccent: '#FFECB3' // Light yellow for better contrast on dark backgrounds
  };

  return (
    <div className="min-h-screen bg-[#F8F8F0]">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FaCloudRain className="text-[#006400] text-2xl" />
            <span className="text-xl font-bold text-[#006400]">RainSafe</span>
          </div>
          <div className="hidden md:flex space-x-8">
            <a href="#features" className="text-gray-600 hover:text-[#008000] transition-colors">Features</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-[#008000] transition-colors">How It Works</a>
            <a href="#testimonials" className="text-gray-600 hover:text-[#008000] transition-colors">Testimonials</a>
            <a href="#contact" className="text-gray-600 hover:text-[#008000] transition-colors">Contact</a>
          </div>
          <div>
            <button className="bg-[#006400] hover:bg-[#008000] text-white px-4 py-2 rounded-md transition-colors">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-[#F8F8F0] to-[#FFECB3]">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold text-[#006400] mb-4">
              Stay Safe with Real-Time Weather Monitoring
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              RainSafe provides accurate, timely weather alerts and monitoring to keep you and your loved ones protected from unexpected weather conditions.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button className="bg-[#006400] hover:bg-[#008000] text-white px-6 py-3 rounded-md text-lg font-medium transition-colors">
                Download App
              </button>
              <button className="border border-[#FFD700] text-[#006400] hover:bg-[#FFFDE7] px-6 py-3 rounded-md text-lg font-medium transition-colors">
                Learn More
              </button>
            </div>
          </div>
          <div className="md:w-1/2">
            <img 
              src="https://placehold.co/600x400/F8F8F0/006400?text=RainSafe+Dashboard" 
              alt="RainSafe Dashboard" 
              className="rounded-lg shadow-lg w-full"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#006400] mb-4">Why Choose RainSafe?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our weather monitoring system provides comprehensive features to keep you informed and prepared for any weather condition.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-[#F8F8F0] p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-[#FFECB3] p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <FaCloudRain className="text-[#006400] text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-[#006400] mb-2">Real-Time Monitoring</h3>
              <p className="text-gray-600">
                Get up-to-the-minute weather updates with our advanced monitoring system that tracks precipitation, wind speed, and more.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-[#F8F8F0] p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-[#FFECB3] p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <FaBell className="text-[#006400] text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-[#006400] mb-2">Instant Alerts</h3>
              <p className="text-gray-600">
                Receive immediate notifications about severe weather conditions, allowing you to take necessary precautions before it's too late.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-[#F8F8F0] p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-[#FFECB3] p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <FaChartLine className="text-[#006400] text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-[#006400] mb-2">Detailed Analytics</h3>
              <p className="text-gray-600">
                Access comprehensive weather data analysis and historical patterns to better understand climate trends in your area.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-[#F8F8F0] p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-[#FFECB3] p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <FaMobileAlt className="text-[#006400] text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-[#006400] mb-2">Mobile Accessibility</h3>
              <p className="text-gray-600">
                Stay connected to critical weather information wherever you go with our mobile-friendly platform and dedicated app.
              </p>
            </div>
            
            {/* Feature 5 */}
            <div className="bg-[#F8F8F0] p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-[#FFECB3] p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <FaUmbrella className="text-[#006400] text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-[#006400] mb-2">Precipitation Forecasting</h3>
              <p className="text-gray-600">
                Our advanced algorithms predict rainfall patterns with remarkable accuracy, helping you plan your day effectively.
              </p>
            </div>
            
            {/* Feature 6 */}
            <div className="bg-[#F8F8F0] p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-[#FFECB3] p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <FaShieldAlt className="text-[#006400] text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-[#006400] mb-2">Safety Recommendations</h3>
              <p className="text-gray-600">
                Receive personalized safety tips and recommendations based on current and forecasted weather conditions in your area.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-[#F0F8E8]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#006400] mb-4">How RainSafe Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our simple yet powerful system keeps you informed and protected through every weather event.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0 md:space-x-8">
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md w-full md:w-1/3 text-center">
              <div className="bg-[#FFECB3] rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-[#006400] font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold text-[#006400] mb-2">Install & Setup</h3>
              <p className="text-gray-600">
                Download the RainSafe app and set up your location preferences and alert thresholds in minutes.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md w-full md:w-1/3 text-center">
              <div className="bg-[#FFECB3] rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-[#006400] font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold text-[#006400] mb-2">Monitor Weather</h3>
              <p className="text-gray-600">
                Our system continuously monitors weather conditions using advanced meteorological data and local sensors.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md w-full md:w-1/3 text-center">
              <div className="bg-[#FFECB3] rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-[#006400] font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold text-[#006400] mb-2">Receive Alerts</h3>
              <p className="text-gray-600">
                Get timely notifications about changing weather conditions and safety recommendations directly to your device.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#006400] mb-4">What Our Users Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Thousands of people rely on RainSafe for their weather monitoring needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-[#F8F8F0] p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-[#FFECB3] rounded-full mr-4"></div>
                <div>
                  <h4 className="font-semibold text-[#006400]">Sarah Johnson</h4>
                  <p className="text-sm text-gray-500">Outdoor Enthusiast</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "RainSafe has completely changed how I plan my hiking trips. The accurate forecasts and timely alerts have saved me from getting caught in sudden downpours multiple times!"
              </p>
            </div>
            
            {/* Testimonial 2 */}
            <div className="bg-[#F8F8F0] p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-[#FFECB3] rounded-full mr-4"></div>
                <div>
                  <h4 className="font-semibold text-[#006400]">Michael Chen</h4>
                  <p className="text-sm text-gray-500">City Planner</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "We've integrated RainSafe into our city's emergency response system. The detailed analytics and early warning system have significantly improved our preparedness for severe weather events."
              </p>
            </div>
            
            {/* Testimonial 3 */}
            <div className="bg-[#F8F8F0] p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-[#FFECB3] rounded-full mr-4"></div>
                <div>
                  <h4 className="font-semibold text-[#006400]">Emily Rodriguez</h4>
                  <p className="text-sm text-gray-500">Parent & Teacher</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "As both a parent and a teacher, I rely on RainSafe to know when outdoor activities should be rescheduled. The app is intuitive and the notifications are always spot-on!"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="py-20 bg-gradient-to-r from-[#006400] to-[#FFD700] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 text-white drop-shadow-md">Ready to Stay One Step Ahead of the Weather?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto text-white drop-shadow-md">
            Join thousands of users who trust RainSafe for accurate weather forecasts and timely alerts.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-white text-[#006400] hover:bg-[#F8F8F0] font-semibold py-3 px-8 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1">
              <FaCloudDownloadAlt className="inline mr-2" /> Download App
            </button>
            <button className="bg-transparent border-2 border-white hover:bg-white hover:text-[#006400] font-semibold py-3 px-8 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1">
              <FaEnvelope className="inline mr-2" /> Sign Up for Alerts
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-[#006400] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <FaCloudRain className="text-[#FFD700] text-2xl" />
                <span className="text-xl font-bold text-white">RainSafe</span>
              </div>
              <p className="text-[#FFECB3] mb-4">
                Providing reliable weather monitoring and alerts to keep you safe and prepared.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-[#FFECB3] hover:text-[#FFD700] transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-[#FFECB3] hover:text-[#FFD700] transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-[#FFECB3] hover:text-[#FFD700] transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            
            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-[#FFECB3] hover:text-[#FFD700] transition-colors">Home</a></li>
                <li><a href="#features" className="text-[#FFECB3] hover:text-[#FFD700] transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="text-[#FFECB3] hover:text-[#FFD700] transition-colors">How It Works</a></li>
                <li><a href="#testimonials" className="text-[#FFECB3] hover:text-[#FFD700] transition-colors">Testimonials</a></li>
                <li><a href="#contact" className="text-[#FFECB3] hover:text-[#FFD700] transition-colors">Contact</a></li>
              </ul>
            </div>
            
            {/* Legal */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-[#FFECB3] hover:text-[#FFD700] transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-[#FFECB3] hover:text-[#FFD700] transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-[#FFECB3] hover:text-[#FFD700] transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="text-[#FFECB3] hover:text-[#FFD700] transition-colors">GDPR</a></li>
              </ul>
            </div>
            
            {/* Contact */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-[#FFD700]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  <span className="text-[#FFECB3]">support@rainsafe.com</span>
                </li>
                <li className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-[#FFD700]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                  <span className="text-[#FFECB3]">+1 (555) 123-4567</span>
                </li>
                <li className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-[#FFD700]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  <span className="text-[#FFECB3]">123 Weather Lane, Cloud City, CA 94123</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-[#008000] mt-12 pt-8 text-center text-[#FFECB3]">
            <p>&copy; {new Date().getFullYear()} RainSafe. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;