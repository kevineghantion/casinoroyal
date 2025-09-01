import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet as WalletIcon, Plus, Minus, History, TrendingUp } from 'lucide-react';
import { NeonButton } from '@/components/ui/NeonButton';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { useAuth } from '@/hooks/useAuth';
import { useBalance } from '@/hooks/useBalance';
import { useSFX } from '@/hooks/useSFX';
import { pageTransition, bounceIn, staggerChildren } from '@/lib/animations';
import { useToast } from '@/hooks/use-toast';

const Wallet = () => {
  const { user } = useAuth();
  const { balance, updateBalance, transactions, isLoading } = useBalance();
  const { playClick } = useSFX();
  const { toast } = useToast();
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid deposit amount",
        variant: "destructive",
      });
      return;
    }
    
    playClick();
    updateBalance(amount);
    toast({
      title: "Deposit Successful!",
      description: `$${amount.toFixed(2)} has been added to your wallet`,
    });
    setDepositAmount('');
    setShowDepositModal(false);
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive",
      });
      return;
    }
    
    if (amount > balance) {
      toast({
        title: "Insufficient Funds",
        description: "You don't have enough balance for this withdrawal",
        variant: "destructive",
      });
      return;
    }
    
    playClick();
    updateBalance(-amount);
    toast({
      title: "Withdrawal Successful!",
      description: `$${amount.toFixed(2)} has been withdrawn from your wallet`,
    });
    setWithdrawAmount('');
    setShowWithdrawModal(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-casino flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-neon-white mb-4">Please log in to access your wallet</h1>
          <NeonButton onClick={() => window.location.href = '/login'}>
            Login
          </NeonButton>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-casino p-4"
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          className="text-center"
          variants={bounceIn}
          initial="hidden"
          animate="visible"
        >
          <WalletIcon className="w-16 h-16 text-neon-pink mx-auto mb-4 filter drop-shadow-[0_0_20px_currentColor]" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-neon-pink via-electric-blue to-lime-green bg-clip-text text-transparent mb-2">
            Your Wallet
          </h1>
          <p className="text-neon-gray">Manage your casino funds securely</p>
        </motion.div>

        {/* Balance Card */}
        <motion.div
          className="bg-gradient-card border border-neon-pink/30 rounded-2xl p-8 text-center shadow-neon-pink"
          variants={bounceIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
        >
          <div className="space-y-4">
            <h2 className="text-xl text-neon-gray">Current Balance</h2>
            <div className="text-6xl font-bold">
              <AnimatedCounter
                value={balance}
                prefix="$"
                decimals={2}
                className="text-neon-white filter drop-shadow-[0_0_20px_currentColor]"
              />
            </div>
            <div className="flex items-center justify-center space-x-2 text-lime-green">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm">Account in good standing</span>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="grid md:grid-cols-2 gap-6"
          variants={staggerChildren}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={bounceIn}>
            <NeonButton
              size="lg"
              className="w-full py-6 bg-gradient-to-r from-lime-green/20 to-lime-green/10 border border-lime-green/30 hover:shadow-neon-green"
              onClick={() => setShowDepositModal(true)}
            >
              <Plus className="w-6 h-6 mr-2" />
              Deposit Funds
            </NeonButton>
          </motion.div>
          
          <motion.div variants={bounceIn}>
            <NeonButton
              size="lg"
              variant="secondary"
              className="w-full py-6 bg-gradient-to-r from-electric-blue/20 to-electric-blue/10 border border-electric-blue/30 hover:shadow-neon-blue"
              onClick={() => setShowWithdrawModal(true)}
            >
              <Minus className="w-6 h-6 mr-2" />
              Withdraw Funds
            </NeonButton>
          </motion.div>
        </motion.div>

        {/* Transaction History */}
        <motion.div
          className="bg-bg-card/50 backdrop-blur-sm border border-neon-gray-dark rounded-2xl p-6"
          variants={bounceIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center mb-6">
            <History className="w-6 h-6 text-neon-pink mr-3" />
            <h3 className="text-xl font-bold text-neon-white">Transaction History</h3>
          </div>
          
          <div className="space-y-3">
            {transactions.length === 0 ? (
              <p className="text-neon-gray text-center py-8">No transactions yet</p>
            ) : (
              transactions.map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-bg-darker/50 rounded-lg border border-neon-gray-dark/50"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      transaction.type === 'deposit' ? 'bg-lime-green' : 'bg-electric-blue'
                    }`} />
                    <div>
                      <p className="text-neon-white font-medium capitalize">
                        {transaction.type}
                      </p>
                      <p className="text-neon-gray text-sm">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${
                    transaction.type === 'deposit' ? 'text-lime-green' : 'text-electric-blue'
                  }`}>
                    {transaction.type === 'deposit' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-bg-card border border-neon-gray-dark rounded-2xl p-6 w-full max-w-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h3 className="text-xl font-bold text-neon-white mb-4">Deposit Funds</h3>
            <div className="space-y-4">
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full p-3 bg-bg-darker border border-neon-gray-dark rounded-lg text-neon-white placeholder-neon-gray focus:border-lime-green focus:ring-2 focus:ring-lime-green/20 outline-none"
              />
              <div className="flex space-x-3">
                <NeonButton onClick={handleDeposit} className="flex-1">
                  Deposit
                </NeonButton>
                <NeonButton 
                  variant="secondary" 
                  onClick={() => setShowDepositModal(false)}
                  className="flex-1"
                >
                  Cancel
                </NeonButton>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-bg-card border border-neon-gray-dark rounded-2xl p-6 w-full max-w-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h3 className="text-xl font-bold text-neon-white mb-4">Withdraw Funds</h3>
            <div className="space-y-4">
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Enter amount"
                max={balance}
                className="w-full p-3 bg-bg-darker border border-neon-gray-dark rounded-lg text-neon-white placeholder-neon-gray focus:border-electric-blue focus:ring-2 focus:ring-electric-blue/20 outline-none"
              />
              <p className="text-neon-gray text-sm">
                Available balance: ${balance.toFixed(2)}
              </p>
              <div className="flex space-x-3">
                <NeonButton onClick={handleWithdraw} className="flex-1">
                  Withdraw
                </NeonButton>
                <NeonButton 
                  variant="secondary" 
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1"
                >
                  Cancel
                </NeonButton>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Wallet;