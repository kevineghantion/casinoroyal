import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { ChevronDown, DollarSign, Plus, Minus, ArrowRightLeft, History, X } from 'lucide-react';
import { useBalance } from '@/hooks/useBalance';
import { useAuthContext } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useSFX } from '@/hooks/useSFX';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface NavBalanceButtonProps {
    className?: string;
}

export const NavBalanceButton = ({ className }: NavBalanceButtonProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [previousBalance, setPreviousBalance] = useState(0);
    const { user } = useAuthContext();
    const { balance, transactions, isLoading } = useBalance();
    const { playClick } = useSFX();
    const navigate = useNavigate();
    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const controls = useAnimation();

    // Detect mobile screen size
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Animate balance changes
    useEffect(() => {
        if (balance !== previousBalance && previousBalance !== 0) {
            controls.start({
                scale: [1, 1.1, 1],
                transition: { duration: 0.3, ease: "easeOut" }
            });
        }
        setPreviousBalance(balance);
    }, [balance, previousBalance, controls]);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node) &&
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                setIsOpen(false);
                buttonRef.current?.focus();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    const handleToggle = () => {
        playClick();
        setIsOpen(!isOpen);
    };

    const handleAction = (action: string) => {
        playClick();
        setIsOpen(false);

        switch (action) {
            case 'deposit':
                navigate('/wallet');
                break;
            case 'withdraw':
                navigate('/wallet');
                break;
            case 'transfer':
                navigate('/wallet');
                break;
            case 'history':
                navigate('/wallet');
                break;
        }
    };

    const formatBalance = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const formatTimeAgo = (dateString: string) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    };

    interface BalanceDropdownContentProps {
        balance: number;
        transactions: any[];
        formatBalance: (amount: number) => string;
        formatTimeAgo: (dateString: string) => string;
        onAction: (action: string) => void;
        controls: any;
        isMobile?: boolean;
    }

    const BalanceDropdownContent = ({
        balance,
        transactions,
        formatBalance,
        formatTimeAgo,
        onAction,
        controls,
        isMobile = false
    }: BalanceDropdownContentProps) => {
        return (
            <>
                {/* Header */}
                <div className={cn(
                    "flex items-center justify-between mb-4",
                    isMobile && "flex-col items-start space-y-2"
                )}>
                    <div>
                        <h3 className="text-lg font-bold text-neon-white">Wallet</h3>
                        <Badge variant="outline" className="text-xs border-neon-green/50 text-neon-green">
                            VIP Player
                        </Badge>
                    </div>
                    <motion.div
                        className={cn(
                            "text-right",
                            isMobile && "w-full text-center"
                        )}
                        animate={controls}
                    >
                        <div className="text-2xl font-bold text-neon-green">
                            {formatBalance(balance)}
                        </div>
                        <div className="text-xs text-neon-gray">Available Balance</div>
                    </motion.div>
                </div>

                {/* Quick Actions */}
                <div className={cn(
                    "grid grid-cols-2 gap-2 mb-4",
                    isMobile && "grid-cols-2 gap-3"
                )}>
                    <Button
                        variant="outline"
                        size={isMobile ? "default" : "sm"}
                        onClick={() => onAction('deposit')}
                        className="flex items-center space-x-2 hover:bg-neon-green/10 hover:border-neon-green/50"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Deposit</span>
                    </Button>
                    <Button
                        variant="outline"
                        size={isMobile ? "default" : "sm"}
                        onClick={() => onAction('withdraw')}
                        className="flex items-center space-x-2 hover:bg-neon-pink/10 hover:border-neon-pink/50"
                    >
                        <Minus className="h-4 w-4" />
                        <span>Withdraw</span>
                    </Button>
                    <Button
                        variant="outline"
                        size={isMobile ? "default" : "sm"}
                        onClick={() => onAction('transfer')}
                        className="flex items-center space-x-2 hover:bg-neon-blue/10 hover:border-neon-blue/50"
                    >
                        <ArrowRightLeft className="h-4 w-4" />
                        <span>Transfer</span>
                    </Button>
                    <Button
                        variant="outline"
                        size={isMobile ? "default" : "sm"}
                        onClick={() => onAction('history')}
                        className="flex items-center space-x-2 hover:bg-neon-purple/10 hover:border-neon-purple/50"
                    >
                        <History className="h-4 w-4" />
                        <span>History</span>
                    </Button>
                </div>

                {/* Recent Transactions */}
                {transactions.length > 0 && (
                    <div className="border-t border-neon-gray-dark/50 pt-3">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-neon-gray">Recent Activity</h4>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onAction('history')}
                                className="text-xs text-neon-pink hover:text-neon-pink/80"
                            >
                                View All
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {transactions.map((transaction, index) => (
                                <motion.div
                                    key={transaction.id}
                                    className="flex items-center justify-between p-2 rounded-lg bg-bg-darker/50"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="flex items-center space-x-2">
                                        <div className={cn(
                                            "w-2 h-2 rounded-full",
                                            transaction.type === 'deposit' || transaction.type === 'win'
                                                ? "bg-neon-green"
                                                : "bg-neon-pink"
                                        )} />
                                        <div>
                                            <div className="text-sm font-medium text-neon-white capitalize">
                                                {transaction.type}
                                            </div>
                                            <div className="text-xs text-neon-gray">
                                                {formatTimeAgo(transaction.date)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "text-sm font-medium",
                                        transaction.type === 'deposit' || transaction.type === 'win'
                                            ? "text-neon-green"
                                            : "text-neon-pink"
                                    )}>
                                        {transaction.type === 'deposit' || transaction.type === 'win' ? '+' : '-'}
                                        ${Math.abs(transaction.amount).toFixed(2)}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </>
        );
    };

    return (
        <div className={cn("relative", className)}>
            {/* Balance Button */}
            <motion.button
                ref={buttonRef}
                onClick={handleToggle}
                className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-lg",
                    "bg-bg-card/50 backdrop-blur-sm border border-neon-gray-dark/50",
                    "hover:bg-bg-card hover:border-neon-pink/50 transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-neon-pink/50 focus:border-neon-pink",
                    isOpen && "bg-bg-card border-neon-pink shadow-neon-pink"
                )}
                variants={{
                    rest: { scale: 1 },
                    hover: { scale: 1.02 },
                    tap: { scale: 0.98 }
                }}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
                aria-expanded={isOpen}
                aria-haspopup="true"
                aria-label={`Balance: ${formatBalance(balance)}`}
            >
                <DollarSign className="h-4 w-4 text-neon-green" />
                <motion.span
                    className="text-sm font-medium text-neon-white"
                    animate={controls}
                >
                    {isLoading ? '...' : formatBalance(balance)}
                </motion.span>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown className="h-4 w-4 text-neon-gray" />
                </motion.div>
            </motion.button>

            {/* Dropdown - Desktop */}
            <AnimatePresence>
                {isOpen && !isMobile && (
                    <motion.div
                        ref={dropdownRef}
                        className="absolute top-full right-0 mt-2 w-80 z-50"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{
                            duration: 0.25,
                            ease: [0.2, 0.9, 0.2, 1]
                        }}
                    >
                        <Card className="card-neon border-neon-gray-dark/50 shadow-2xl">
                            <CardContent className="p-4">
                                <BalanceDropdownContent
                                    balance={balance}
                                    transactions={transactions.slice(0, 3)}
                                    formatBalance={formatBalance}
                                    formatTimeAgo={formatTimeAgo}
                                    onAction={handleAction}
                                    controls={controls}
                                />
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Sheet */}
            <AnimatePresence>
                {isOpen && isMobile && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Sheet */}
                        <motion.div
                            className="fixed bottom-0 left-0 right-0 z-50"
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{
                                type: "spring",
                                damping: 30,
                                stiffness: 300
                            }}
                        >
                            <Card className="card-neon rounded-t-2xl border-t border-l-0 border-r-0 border-b-0">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-lg font-bold text-neon-white">Wallet</CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsOpen(false)}
                                        className="p-2"
                                    >
                                        <X className="h-5 w-5" />
                                    </Button>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <BalanceDropdownContent
                                        balance={balance}
                                        transactions={transactions.slice(0, 3)}
                                        formatBalance={formatBalance}
                                        formatTimeAgo={formatTimeAgo}
                                        onAction={handleAction}
                                        controls={controls}
                                        isMobile={true}
                                    />
                                </CardContent>
                            </Card>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
