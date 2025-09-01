import { motion } from 'framer-motion';
import { 
  HelpCircle, 
  MessageCircle, 
  Mail, 
  Phone, 
  Shield, 
  CreditCard, 
  GamepadIcon,
  Users,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { NeonButton } from '@/components/ui/NeonButton';
import { useSFX } from '@/hooks/useSFX';
import { pageTransition, bounceIn } from '@/lib/animations';

const Help = () => {
  const { playClick } = useSFX();

  const faqItems = [
    {
      question: "How do I create an account?",
      answer: "Click 'Sign Up' in the navigation, fill out the registration form with your username, email, and password. You'll receive a starting balance to begin playing."
    },
    {
      question: "How do I deposit funds?",
      answer: "Go to your Wallet page and click 'Deposit'. Choose your preferred payment method and follow the secure payment process."
    },
    {
      question: "Are my funds secure?",
      answer: "Yes, we use industry-standard encryption and security measures to protect your account and funds. All transactions are processed securely."
    },
    {
      question: "How do I withdraw winnings?",
      answer: "Visit your Wallet page, click 'Withdraw', and choose your withdrawal method. Withdrawals are typically processed within 24-48 hours."
    },
    {
      question: "What games are available?",
      answer: "We offer a variety of casino games including slots, blackjack, poker, and roulette. New games are added regularly."
    },
    {
      question: "Is there a mobile app?",
      answer: "Our platform is fully responsive and works great on mobile browsers. A dedicated mobile app is coming soon."
    }
  ];

  const contactMethods = [
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Get instant help from our support team",
      action: "Start Chat",
      available: "24/7"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us a detailed message",
      action: "support@casinoroyal.com",
      available: "Response within 24h"
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak directly with our team",
      action: "+1 (555) 123-4567",
      available: "Mon-Fri 9AM-6PM"
    }
  ];

  const handleContactClick = (method: string) => {
    playClick();
    // In a real app, this would open the appropriate contact method
    console.log(`Opening ${method} support`);
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-casino px-4 py-8"
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          variants={bounceIn}
          initial="hidden"
          animate="visible"
        >
          <h1 className="text-4xl font-bold bg-gradient-neon bg-clip-text text-transparent mb-4">
            Help & Support
          </h1>
          <p className="text-neon-gray text-lg">
            We're here to help you have the best gaming experience
          </p>
        </motion.div>

        {/* Quick Help Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { icon: GamepadIcon, title: "Game Rules", desc: "Learn how to play" },
            { icon: CreditCard, title: "Payments", desc: "Deposits & withdrawals" },
            { icon: Shield, title: "Security", desc: "Account safety" },
            { icon: Users, title: "Account", desc: "Profile management" }
          ].map((item, index) => (
            <motion.div
              key={index}
              className="bg-bg-card/90 backdrop-blur-lg border border-neon-gray-dark rounded-lg p-6 text-center hover:border-neon-pink/50 transition-colors cursor-pointer"
              whileHover={{ scale: 1.05 }}
              onClick={() => playClick()}
            >
              <item.icon size={32} className="text-neon-pink mx-auto mb-3" />
              <h3 className="text-neon-white font-semibold mb-2">{item.title}</h3>
              <p className="text-neon-gray text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          className="bg-bg-card/90 backdrop-blur-lg border border-neon-gray-dark rounded-2xl p-8 mb-12"
          variants={bounceIn}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-2xl font-bold text-neon-white mb-6 flex items-center">
            <HelpCircle className="mr-3 text-neon-pink" />
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            {faqItems.map((item, index) => (
              <div key={index} className="border-b border-neon-gray-dark pb-4 last:border-b-0">
                <h3 className="text-neon-white font-semibold mb-2">{item.question}</h3>
                <p className="text-neon-gray">{item.answer}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Contact Support */}
        <motion.div
          className="bg-bg-card/90 backdrop-blur-lg border border-neon-gray-dark rounded-2xl p-8"
          variants={bounceIn}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-2xl font-bold text-neon-white mb-6 text-center">
            Need More Help?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactMethods.map((method, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-neon rounded-full flex items-center justify-center mx-auto mb-4">
                  <method.icon size={24} className="text-bg-dark" />
                </div>
                <h3 className="text-neon-white font-semibold mb-2">{method.title}</h3>
                <p className="text-neon-gray text-sm mb-3">{method.description}</p>
                <div className="flex items-center justify-center space-x-2 text-xs text-neon-gray mb-4">
                  <Clock size={12} />
                  <span>{method.available}</span>
                </div>
                <NeonButton
                  variant="outline"
                  size="sm"
                  onClick={() => handleContactClick(method.title)}
                  className="w-full"
                >
                  {method.action}
                </NeonButton>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Responsible Gaming Notice */}
        <motion.div
          className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6 mt-8"
          variants={bounceIn}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-start space-x-3">
            <AlertTriangle className="text-yellow-500 mt-1" size={20} />
            <div>
              <h3 className="text-yellow-300 font-semibold mb-2">Responsible Gaming</h3>
              <p className="text-yellow-100 text-sm">
                We are committed to promoting responsible gaming. If you feel you need help with gambling problems, 
                please contact our support team or visit responsible gaming resources for assistance.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Help;