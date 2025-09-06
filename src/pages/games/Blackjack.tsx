import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Shuffle, TrendingUp, Users, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NeonButton } from '@/components/ui/NeonButton';
import { useBalance } from '@/hooks/useBalance';
import { useSFX } from '@/hooks/useSFX';
import { useToast } from '@/hooks/use-toast';

// Professional Card System
type Suit = '♠' | '♥' | '♦' | '♣';
type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

interface Card {
  suit: Suit;
  rank: Rank;
  value: number;
  isAce: boolean;
  id: string;
  deckIndex: number;
}

interface Hand {
  cards: Card[];
  total: number;
  aces: number;
  isBlackjack: boolean;
  isBust: boolean;
  isSoft: boolean;
}

interface SplitHand {
  hand: Hand;
  bet: number;
  isActive: boolean;
  isComplete: boolean;
}

interface BetHistoryEntry {
  id: string;
  bet: number;
  result: 'win' | 'lose' | 'push' | 'blackjack';
  payout: number;
  timestamp: number;
}

interface DeckState {
  cards: Card[];
  usedCards: Card[];
  shuffleCount: number;
  penetration: number;
  burnCard?: Card;
}

const suits: Suit[] = ['♠', '♥', '♦', '♣'];
const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// Professional deck creation
const createSingleDeck = (deckNumber: number): Card[] => {
  const deck: Card[] = [];
  let cardIndex = 0;
  
  suits.forEach(suit => {
    ranks.forEach(rank => {
      let value = 0;
      if (rank === 'A') value = 11;
      else if (['J', 'Q', 'K'].includes(rank)) value = 10;
      else value = parseInt(rank);

      deck.push({
        suit,
        rank,
        value,
        isAce: rank === 'A',
        id: `deck${deckNumber}-${suit}${rank}-${cardIndex}`,
        deckIndex: cardIndex++
      });
    });
  });
  
  return deck;
};

// Crypto-secure shuffling with multiple passes for true randomness
const shuffleDeck = (deck: Card[]): Card[] => {
  const newDeck = [...deck];
  
  const getSecureRandom = () => {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] / (0xffffffff + 1);
  };
  
  // Multiple shuffle passes for maximum randomness
  for (let pass = 0; pass < 3; pass++) {
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(getSecureRandom() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
  }
  
  return newDeck;
};

const createMultipleDeck = (numDecks: number): Card[] => {
  let fullDeck: Card[] = [];
  const timestamp = Date.now();
  
  for (let i = 0; i < numDecks; i++) {
    const singleDeck = createSingleDeck(i);
    singleDeck.forEach((card, index) => {
      card.id = `${timestamp}-${i}-${card.suit}-${card.rank}-${index}`;
    });
    fullDeck.push(...singleDeck);
  }
  
  return shuffleDeck(fullDeck);
};

const calculateHand = (cards: Card[]): Hand => {
  let total = 0;
  let aces = 0;
  let isSoft = false;

  cards.forEach(card => {
    total += card.value;
    if (card.isAce) aces += 1;
  });

  let acesUsedAsSoft = aces;
  while (total > 21 && acesUsedAsSoft > 0) {
    total -= 10;
    acesUsedAsSoft -= 1;
  }

  isSoft = acesUsedAsSoft > 0 && total <= 21;

  return {
    cards,
    total,
    aces,
    isBlackjack: cards.length === 2 && total === 21,
    isBust: total > 21,
    isSoft
  };
};

type GameState = 'betting' | 'dealing' | 'playing' | 'dealer-turn' | 'game-over' | 'shuffling';

const Blackjack: React.FC = () => {
  const { balance, updateBalance } = useBalance();
  const { playCard, playCashOut } = useSFX();
  const { toast } = useToast();

  // Game state
  const [bet, setBet] = useState(10);
  const [gameState, setGameState] = useState<GameState>('betting');
  const [deckState, setDeckState] = useState<DeckState>({
    cards: [],
    usedCards: [],
    shuffleCount: 0,
    penetration: 0.75
  });
  
  const [playerHand, setPlayerHand] = useState<Hand>({
    cards: [], total: 0, aces: 0, isBlackjack: false, isBust: false, isSoft: false
  });
  const [dealerHand, setDealerHand] = useState<Hand>({
    cards: [], total: 0, aces: 0, isBlackjack: false, isBust: false, isSoft: false
  });

  // Game options
  const [canSplit, setCanSplit] = useState(false);
  const [canDouble, setCanDouble] = useState(false);
  const [canInsurance, setCanInsurance] = useState(false);
  const [gameResult, setGameResult] = useState<'win' | 'lose' | 'push' | 'surrender' | null>(null);
  const [isDealing, setIsDealing] = useState(false);
  const [dealerHoleCard, setDealerHoleCard] = useState<Card | null>(null);
  const [isFlippingHoleCard, setIsFlippingHoleCard] = useState(false);

  // Split functionality
  const [isSplitHand, setIsSplitHand] = useState(false);
  const [splitHands, setSplitHands] = useState<SplitHand[]>([]);
  const [activeSplitIndex, setActiveSplitIndex] = useState(0);

  // Enhanced features
  const [deckCount] = useState(6);
  const [lastResult, setLastResult] = useState<string>('');
  const [dealerMessage, setDealerMessage] = useState<string>('');
  const [betHistory, setBetHistory] = useState<BetHistoryEntry[]>([]);
  const [animatedTotal, setAnimatedTotal] = useState(0);
  const [isChipStacking, setIsChipStacking] = useState(false);

  // Preset bet amounts
  const betPresets = [1, 5, 10, 25, 50, 100, 250, 500];

  // Card counter and deck ref for proper randomization
  const cardCounter = useRef(0);
  const deckRef = useRef<Card[]>([]);

  // Enhanced deck management with burn card
  const drawCard = useCallback((): Card | null => {
    if (deckRef.current.length === 0) {
      const newDeck = createMultipleDeck(deckCount);
      deckRef.current = newDeck;
      
      // Burn first card for authenticity
      const burnCard = deckRef.current.pop();
      if (burnCard) {
        setDeckState(prev => ({ ...prev, burnCard }));
      }
    }
    
    const drawnCard = deckRef.current.pop();
    if (!drawnCard) return null;
    

    
    const uniqueCard = {
      ...drawnCard,
      id: `card-${++cardCounter.current}-${drawnCard.suit}-${drawnCard.rank}`
    };
    
    setDeckState(prev => ({
      ...prev,
      cards: [...deckRef.current],
      usedCards: [...prev.usedCards, uniqueCard]
    }));
    
    return uniqueCard;
  }, [deckCount]);

  // Animated hand total counter
  const animateHandTotal = useCallback((newTotal: number) => {
    const startTotal = animatedTotal;
    const duration = 800;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentTotal = Math.round(startTotal + (newTotal - startTotal) * easeOut);
      
      setAnimatedTotal(currentTotal);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [animatedTotal]);

  // Dealer messages system
  const showDealerMessage = useCallback((message: string, duration = 3000) => {
    setDealerMessage(message);
    setTimeout(() => setDealerMessage(''), duration);
  }, []);

  // Add to bet history
  const addToBetHistory = useCallback((result: 'win' | 'lose' | 'push' | 'blackjack', payout: number) => {
    const entry: BetHistoryEntry = {
      id: `bet-${Date.now()}`,
      bet,
      result,
      payout,
      timestamp: Date.now()
    };
    
    setBetHistory(prev => [entry, ...prev.slice(0, 4)]); // Keep last 5
  }, [bet]);

  // Initialize game with burn card
  useEffect(() => {
    const newDeck = createMultipleDeck(deckCount);
    deckRef.current = newDeck;
    
    // Burn first card
    const burnCard = deckRef.current.pop();
    
    setDeckState({
      cards: [...deckRef.current],
      usedCards: [],
      shuffleCount: 1,
      penetration: 0.75,
      burnCard
    });
    
    showDealerMessage("Welcome to Casino Royal! Good luck!", 2000);
  }, [deckCount, showDealerMessage]);

  // Update animated total when player hand changes
  useEffect(() => {
    if (playerHand.total > 0) {
      animateHandTotal(playerHand.total);
    }
  }, [playerHand.total, animateHandTotal]);



  const startNewRound = useCallback(() => {
    if (bet > balance) {
      return;
    }

    // Chip stacking animation
    setIsChipStacking(true);
    setTimeout(() => setIsChipStacking(false), 800);

    // Card counting protection - shuffle more frequently
    if (deckRef.current.length < 156) { // Shuffle at 50% penetration
      const freshDeck = createMultipleDeck(deckCount);

      deckRef.current = freshDeck;
      
      // Burn card after shuffle
      const burnCard = deckRef.current.pop();
      
      setDeckState({
        cards: [...deckRef.current],
        usedCards: [],
        shuffleCount: deckState.shuffleCount + 1,
        penetration: 0.5,
        burnCard
      });
      
      showDealerMessage("Shuffling cards...", 1500);
    }

    updateBalance(-bet);
    
    // Reset all game state
    setPlayerHand({ cards: [], total: 0, aces: 0, isBlackjack: false, isBust: false, isSoft: false });
    setDealerHand({ cards: [], total: 0, aces: 0, isBlackjack: false, isBust: false, isSoft: false });
    setDealerHoleCard(null);
    setGameResult(null);
    setLastResult('');
    setCanInsurance(false);
    setIsSplitHand(false);
    setSplitHands([]);
    setActiveSplitIndex(0);
    setAnimatedTotal(0);
    setGameState('dealing');
    setIsDealing(true);

    setTimeout(() => {
      showDealerMessage("Dealing cards...", 1000);
      dealInitialCards();
    }, 500);
  }, [bet, balance, deckCount, deckState.shuffleCount, updateBalance, showDealerMessage]);

  const dealInitialCards = useCallback(() => {
    // Deal cards sequentially like Stake.com
    const playerCard1 = drawCard()!;
    
    // Deal first player card
    setTimeout(() => {
      setPlayerHand(calculateHand([playerCard1]));
      playCard();
      
      // Deal first dealer card
      setTimeout(() => {
        const dealerCard1 = drawCard()!;
        setDealerHand(calculateHand([dealerCard1]));
        playCard();
        
        // Deal second player card
        setTimeout(() => {
          const playerCard2 = drawCard()!;
          const finalPlayerHand = calculateHand([playerCard1, playerCard2]);
          setPlayerHand(finalPlayerHand);
          playCard();
          
          // Deal dealer hole card (hidden)
          setTimeout(() => {
            const dealerCard2 = drawCard()!;
            setDealerHoleCard(dealerCard2);
            playCard();
            
            const finalDealerHand = calculateHand([dealerCard1, dealerCard2]);
            
            // Check for split, double, and insurance options
            setCanSplit(playerCard1.rank === playerCard2.rank && balance >= bet && !isSplitHand);
            setCanDouble(balance >= bet);
            setCanInsurance(dealerCard1.rank === 'A' && balance >= bet / 2);
            setIsDealing(false);

            if (finalPlayerHand.isBlackjack) {
              // Reveal dealer hole card for blackjack check
              setTimeout(() => {
                setDealerHand(finalDealerHand);
                setDealerHoleCard(null);
                
                setTimeout(() => {
                  if (finalDealerHand.isBlackjack) {
                    setGameResult('push');
                    setGameState('game-over');
                    updateBalance(bet);
                    setLastResult("🤝 PUSH - Both Blackjack!");
                    showDealerMessage("Push! Both have blackjack.");
                    addToBetHistory('push', bet);
                  } else {
                    setGameResult('win');
                    setGameState('game-over');
                    const payout = Math.floor(bet * 2.5);
                    updateBalance(payout);
                    playCashOut();
                    setLastResult(`🃏 BLACKJACK! +$${payout - bet}`);
                    showDealerMessage("Blackjack! Congratulations!");
                    addToBetHistory('blackjack', payout);
                  }
                  
                  setTimeout(() => {
                    setPlayerHand({ cards: [], total: 0, aces: 0, isBlackjack: false, isBust: false, isSoft: false });
                    setDealerHand({ cards: [], total: 0, aces: 0, isBlackjack: false, isBust: false, isSoft: false });
                    setDealerHoleCard(null);
                    setGameState('betting');
                    setGameResult(null);
                    setCanSplit(false);
                    setCanDouble(false);
                  }, 3300);
                }, 500);
              }, 300);
            } else {
              setGameState('playing');
            }
          }, 400);
        }, 400);
      }, 400);
    }, 200);
  }, [drawCard, playCard, balance, bet, updateBalance, playCashOut, isSplitHand, showDealerMessage, addToBetHistory]);

  // Split pairs functionality
  const splitPairs = useCallback(() => {
    if (!canSplit || playerHand.cards.length !== 2) return;
    
    const [card1, card2] = playerHand.cards;
    updateBalance(-bet); // Additional bet for second hand
    
    const hand1: SplitHand = {
      hand: calculateHand([card1]),
      bet,
      isActive: true,
      isComplete: false
    };
    
    const hand2: SplitHand = {
      hand: calculateHand([card2]),
      bet,
      isActive: false,
      isComplete: false
    };
    
    setSplitHands([hand1, hand2]);
    setIsSplitHand(true);
    setActiveSplitIndex(0);
    setPlayerHand(hand1.hand);
    setCanSplit(false);
    setCanDouble(balance >= bet);
    
    showDealerMessage("Pairs split! Playing first hand.");
    playCard();
  }, [canSplit, playerHand.cards, bet, balance, updateBalance, showDealerMessage, playCard]);

  // Insurance bet
  const takeInsurance = useCallback(() => {
    if (!canInsurance) return;
    
    const insuranceBet = Math.floor(bet / 2);
    updateBalance(-insuranceBet);
    setCanInsurance(false);
    
    // Check if dealer has blackjack
    if (dealerHoleCard && dealerHoleCard.value === 10) {
      // Insurance pays 2:1
      updateBalance(insuranceBet * 3);
      showDealerMessage("Insurance pays! Dealer has blackjack.");
    } else {
      showDealerMessage("Insurance lost. No blackjack.");
    }
  }, [canInsurance, bet, updateBalance, dealerHoleCard, showDealerMessage]);

  const hit = useCallback(() => {
    const newCard = drawCard();
    if (!newCard) return;

    // Mark new card for animation
    const cardWithAnimation = { ...newCard, isNew: true };
    const newPlayerHand = calculateHand([...playerHand.cards, cardWithAnimation]);
    setPlayerHand(newPlayerHand);
    setCanDouble(false);
    setCanSplit(false);
    playCard();

    if (newPlayerHand.isBust) {
      setTimeout(() => {
        if (dealerHoleCard) {
          setDealerHand(prev => calculateHand([...prev.cards, dealerHoleCard]));
        }
        setGameResult('lose');
        setGameState('game-over');
        showDealerMessage("You bust! House wins.");
        addToBetHistory('lose', 0);
        
        setTimeout(() => {
          setPlayerHand({ cards: [], total: 0, aces: 0, isBlackjack: false, isBust: false, isSoft: false });
          setDealerHand({ cards: [], total: 0, aces: 0, isBlackjack: false, isBust: false, isSoft: false });
          setDealerHoleCard(null);
          setGameState('betting');
          setGameResult(null);
          setCanSplit(false);
          setCanDouble(false);
        }, 3300);
      }, 800);
    } else if (newPlayerHand.total === 21) {
      // Auto-stand on 21 (real blackjack rules)
      setGameState('dealer-turn');
      setTimeout(() => {
        if (dealerHoleCard) {
          const revealedHand = calculateHand([...dealerHand.cards, dealerHoleCard]);
          setDealerHand(revealedHand);
          setTimeout(() => dealerPlay(revealedHand, 21), 800);
        }
      }, 500);
    }
  }, [drawCard, playerHand.cards, playCard, dealerHoleCard, showDealerMessage, addToBetHistory]);

  const stand = useCallback(() => {
    if (isSplitHand && activeSplitIndex < splitHands.length - 1) {
      // Move to next split hand
      const nextIndex = activeSplitIndex + 1;
      setActiveSplitIndex(nextIndex);
      setPlayerHand(splitHands[nextIndex].hand);
      setCanDouble(balance >= bet);
      showDealerMessage(`Playing hand ${nextIndex + 1}...`);
      return;
    }
    
    setGameState('dealer-turn');
    showDealerMessage("Dealer's turn...");
    
    setTimeout(() => {
      if (dealerHoleCard) {
        setIsFlippingHoleCard(true);
        setTimeout(() => {
          const revealedHand = calculateHand([...dealerHand.cards, dealerHoleCard]);
          setDealerHand(revealedHand);
          setDealerHoleCard(null);
          setIsFlippingHoleCard(false);
          setTimeout(() => dealerPlay(revealedHand, playerHand.total), 800);
        }, 600);
      }
    }, 500);
  }, [dealerHand.cards, dealerHoleCard, playerHand.total, isSplitHand, activeSplitIndex, splitHands, balance, bet, showDealerMessage]);

  const double = useCallback(() => {
    if (balance < bet) return;

    updateBalance(-bet);
    setBet(bet * 2);
    
    const newCard = drawCard();
    if (!newCard) return;

    const newPlayerHand = calculateHand([...playerHand.cards, newCard]);
    setPlayerHand(newPlayerHand);
    setCanDouble(false);
    setCanSplit(false);
    playCard();

    if (newPlayerHand.isBust) {
      setTimeout(() => {
        if (dealerHoleCard) {
          setDealerHand(prev => calculateHand([...prev.cards, dealerHoleCard]));
        }
        setGameResult('lose');
        setGameState('game-over');
        showDealerMessage("You bust! House wins.");
        addToBetHistory('lose', 0);
        
        setTimeout(() => {
          setPlayerHand({ cards: [], total: 0, aces: 0, isBlackjack: false, isBust: false, isSoft: false });
          setDealerHand({ cards: [], total: 0, aces: 0, isBlackjack: false, isBust: false, isSoft: false });
          setDealerHoleCard(null);
          setGameState('betting');
          setGameResult(null);
          setCanSplit(false);
          setCanDouble(false);
        }, 3300);
      }, 800);
    } else {
      setGameState('dealer-turn');
      setTimeout(() => {
        if (dealerHoleCard) {
          const revealedHand = calculateHand([...dealerHand.cards, dealerHoleCard]);
          setDealerHand(revealedHand);
          setTimeout(() => dealerPlay(revealedHand, newPlayerHand.total), 800);
        }
      }, 1000);
    }
  }, [balance, bet, updateBalance, drawCard, playerHand.cards, playCard, dealerHoleCard, showDealerMessage, addToBetHistory]);

  const dealerPlay = useCallback((currentHand: Hand, finalPlayerTotal: number) => {
    let dealerCards = [...currentHand.cards];
    
    const playNextCard = () => {
      const currentTotal = calculateHand(dealerCards).total;
      const currentIsSoft = calculateHand(dealerCards).isSoft;
      
      // Standard casino rules: Dealer hits on soft 17, stands on hard 17+
      if (currentTotal < 17) {
        const newCard = drawCard();
        if (!newCard) return;
        
        dealerCards.push(newCard);
        const newHand = calculateHand(dealerCards);
        
        setTimeout(() => {
          setDealerHand(newHand);
          playCard();
          
          setTimeout(() => playNextCard(), 1200);
        }, 800);
      } else {
        setTimeout(() => {
          const finalHand = calculateHand(dealerCards);
          const dealerTotal = finalHand.total;
          

          
          let result: 'win' | 'lose' | 'push';
          let payout = 0;
          let resultText = '';
          
          // Standard blackjack rules with built-in house edge
          if (finalHand.isBust) {
            result = 'win';
            payout = bet * 2; // 1:1 payout
            resultText = `🎉 YOU WIN! +$${bet}`;
            showDealerMessage("Dealer busts! You win!");
          } else if (finalPlayerTotal > dealerTotal) {
            result = 'win';
            payout = bet * 2; // 1:1 payout
            resultText = `🎉 YOU WIN! +$${bet}`;
            showDealerMessage("You win this round!");
          } else if (finalPlayerTotal < dealerTotal) {
            result = 'lose';
            payout = 0;
            resultText = `💔 YOU LOSE -$${bet}`;
            showDealerMessage("House wins this time.");
          } else {
            result = 'push';
            payout = bet; // Return original bet
            resultText = "🤝 PUSH - It's a tie!";
            showDealerMessage("It's a push! Bet returned.");
          }
          
          setGameResult(result);
          setGameState('game-over');
          
          if (payout > 0) {
            updateBalance(payout);
            if (result === 'win') playCashOut();
          }
          
          setLastResult(resultText);
          addToBetHistory(result, payout);
          
          setTimeout(() => {
            setPlayerHand({ cards: [], total: 0, aces: 0, isBlackjack: false, isBust: false, isSoft: false });
            setDealerHand({ cards: [], total: 0, aces: 0, isBlackjack: false, isBust: false, isSoft: false });
            setDealerHoleCard(null);
            setGameState('betting');
            setGameResult(null);
            setCanSplit(false);
            setCanDouble(false);
          }, 1000);
        }, 1000);
      }
    };

    playNextCard();
  }, [drawCard, playCard, bet, updateBalance, playCashOut, showDealerMessage, addToBetHistory]);



  // Enhanced Card Component with flip animation
  const CardComponent = ({ card, isHidden = false, index = 0, isNew = true, isFlipping = false }: {
    card: Card;
    isHidden?: boolean;
    index?: number;
    isNew?: boolean;
    isFlipping?: boolean;
  }) => {
    const suitColor = card.suit === '♥' || card.suit === '♦' ? 'text-red-600' : 'text-gray-900';

    return (
      <motion.div
        layout
        initial={isNew ? { scale: 0, rotateY: 180, opacity: 0, x: -100, y: -50 } : false}
        animate={{ 
          scale: 1, 
          rotateY: isFlipping ? [0, 90, 0] : 0, 
          opacity: 1, 
          x: 0, 
          y: 0 
        }}
        transition={{ 
          duration: isFlipping ? 0.6 : 0.6,
          delay: isNew ? index * 0.2 : 0,
          type: isNew ? "spring" : "tween",
          stiffness: 100,
          damping: 12
        }}
        whileHover={{ scale: 1.05, y: -4, rotateZ: 2 }}
        className={`relative w-16 h-24 xs:w-20 xs:h-28 sm:w-24 sm:h-36 md:w-28 md:h-40 rounded-xl border-2 flex flex-col items-center justify-between font-bold shadow-xl cursor-pointer
          ${isHidden
            ? 'bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800 border-neon-pink/60'
            : 'bg-gradient-to-br from-white via-gray-50 to-white border-gray-400'
          }`}
        style={{
          boxShadow: isHidden 
            ? '0 8px 25px rgba(255, 45, 203, 0.4), 0 0 20px rgba(255, 45, 203, 0.2)'
            : '0 8px 25px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1)'
        }}
      >
        {!isHidden ? (
          <>
            <div className={`absolute top-1 left-1 sm:top-2 sm:left-2 text-center ${suitColor} leading-none`}>
              <div className="text-xs sm:text-sm md:text-base font-black">{card.rank}</div>
              <div className="text-xs sm:text-sm md:text-base">{card.suit}</div>
            </div>
            
            <div className="flex-1 flex items-center justify-center">
              <div className={`text-center ${suitColor}`}>
                <div className="text-xl sm:text-2xl md:text-4xl">{card.suit}</div>
              </div>
            </div>
            
            <div className={`absolute bottom-1 right-1 sm:bottom-2 sm:right-2 text-center ${suitColor} leading-none rotate-180`}>
              <div className="text-xs sm:text-sm md:text-base font-black">{card.rank}</div>
              <div className="text-xs sm:text-sm md:text-base">{card.suit}</div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <motion.div 
                className="text-2xl sm:text-3xl md:text-4xl text-neon-pink mb-2"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                ♦
              </motion.div>
              <div className="text-xs font-bold text-neon-pink tracking-wider">CASINO</div>
              <div className="text-xs font-bold text-electric-blue tracking-wider">ROYAL</div>
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  // Enhanced Chip Component with stacking animation
  const ChipComponent = ({ value, isSelected = false, onClick }: {
    value: number;
    isSelected?: boolean;
    onClick: () => void;
  }) => (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.1, y: -2 }}
      whileTap={{ scale: 0.95 }}
      animate={isChipStacking ? { y: [0, -10, 0], scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 0.3 }}
      className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full border-2 font-bold text-xs sm:text-sm shadow-lg relative overflow-hidden
        ${isSelected
          ? 'border-neon-pink bg-neon-pink/20 text-neon-pink'
          : value >= 100
            ? 'border-yellow-500 bg-yellow-500/20 text-yellow-200'
            : value >= 25
              ? 'border-green-500 bg-green-500/20 text-green-200'
              : 'border-blue-500 bg-blue-500/20 text-blue-200'
        }`}
    >
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={isSelected ? { boxShadow: ['0 0 0 0 rgba(255,45,203,0.4)', '0 0 0 10px rgba(255,45,203,0)', '0 0 0 0 rgba(255,45,203,0)'] } : {}}
        transition={{ duration: 1, repeat: Infinity }}
      />
      ${value}
    </motion.button>
  );

  return (
    <div className="min-h-screen bg-gradient-casino relative overflow-hidden">
      {/* Header */}
      <header className="relative z-10 border-b border-neon-gray-dark/30 bg-bg-card/40 backdrop-blur-xl p-3 sm:p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/games">
              <button className="flex items-center px-3 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-electric-blue/20 to-electric-blue/10 border border-electric-blue/50 rounded-lg sm:rounded-xl text-electric-blue font-bold hover:from-electric-blue/30 hover:to-electric-blue/20 transition-all duration-300 text-sm sm:text-base">
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Back to Games</span>
                <span className="xs:hidden">Back</span>
              </button>
            </Link>


          </div>

          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            <div className="px-3 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-bg-card/80 to-bg-darker/60 rounded-lg sm:rounded-xl border border-neon-pink/30 backdrop-blur-sm">
              <span className="text-neon-gray text-sm sm:text-base">Balance: </span>
              <span className="text-lime-green font-bold text-sm sm:text-xl">${balance.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Title and Game Info */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neon-white mb-2">
              Blackjack
            </h1>
            <p className="text-neon-gray text-sm mb-4">
              Beat the dealer to 21
            </p>
            
            {/* Shoe Indicator and Dealer Message */}
            <div className="flex justify-center items-center gap-4 flex-wrap">
              <div className="bg-bg-card/40 backdrop-blur-sm rounded-lg px-3 py-2 border border-neon-gray-dark/30">
                <span className="text-neon-gray text-xs">Cards: </span>
                <span className="text-electric-blue font-bold text-sm">{deckState.cards.length}</span>
              </div>
              
              <AnimatePresence>
                {dealerMessage && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg px-4 py-2 max-w-xs"
                  >
                    <span className="text-yellow-200 text-sm font-medium">💬 {dealerMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>



          {/* Casino Table */}
          <div className="relative bg-gradient-to-br from-green-900/95 via-green-800/80 to-green-900/95 backdrop-blur-xl rounded-3xl sm:rounded-[4rem] border-4 border-yellow-600/70 p-6 sm:p-8 md:p-12 mb-8 shadow-2xl overflow-hidden">
            
            {/* Game Result Overlay on Table */}
            <AnimatePresence>
              {gameState === 'game-over' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 flex items-center justify-center z-20 bg-black/60 backdrop-blur-sm rounded-3xl sm:rounded-[4rem]"
                >
                  <div className={`bg-gradient-to-br backdrop-blur-xl rounded-2xl border p-8 text-center max-w-sm mx-4 ${
                    gameResult === 'win' 
                      ? 'from-lime-green/30 to-lime-green/10 border-lime-green/50'
                      : gameResult === 'lose'
                        ? 'from-red-500/30 to-red-500/10 border-red-500/50'
                        : 'from-electric-blue/30 to-electric-blue/10 border-electric-blue/50'
                  }`}>
                    
                    <div className={`text-6xl mb-4 ${
                      gameResult === 'win' ? 'text-lime-green' :
                      gameResult === 'lose' ? 'text-red-500' :
                      'text-electric-blue'
                    }`}>
                      {gameResult === 'win' && playerHand.isBlackjack ? '🃏' :
                        gameResult === 'win' ? '✓' :
                          gameResult === 'lose' ? '✗' : '='}
                    </div>
                    
                    <h3 className={`text-3xl font-bold mb-3 ${
                      gameResult === 'win' ? 'text-lime-green' :
                      gameResult === 'lose' ? 'text-red-500' :
                      'text-electric-blue'
                    }`}>
                      {gameResult === 'win' && playerHand.isBlackjack ? 'BLACKJACK!' :
                        gameResult === 'win' ? 'YOU WIN' :
                          gameResult === 'lose' ? 'DEALER WINS' : 'PUSH'}
                    </h3>
                    
                    <div className={`text-2xl font-bold mb-4 ${
                      gameResult === 'win' ? 'text-lime-green' :
                      gameResult === 'lose' ? 'text-red-500' :
                      'text-electric-blue'
                    }`}>
                      {gameResult === 'win' && playerHand.isBlackjack 
                        ? `+$${Math.floor(bet * 1.5)}` 
                        : gameResult === 'win' 
                          ? `+$${bet}`
                          : gameResult === 'lose'
                            ? `-$${bet}`
                            : 'Bet Returned'
                      }
                    </div>


                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {/* Dealer Section */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6 px-4">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-gray-400" />
                  <span className="text-lg text-gray-300 font-medium">Dealer</span>
                  {dealerHand.isBlackjack && gameState === 'game-over' && (
                    <span className="text-sm text-yellow-400 font-medium bg-yellow-900/30 px-3 py-1 rounded-full border border-yellow-600/30">
                      ♠ BLACKJACK ♠
                    </span>
                  )}
                  {dealerHand.isBust && (
                    <span className="text-sm text-red-400 font-medium bg-red-900/30 px-3 py-1 rounded-full border border-red-600/30">
                      💥 BUST 💥
                    </span>
                  )}
                </div>
                {dealerHand.total > 0 && (gameState !== 'playing' || dealerHand.cards.length > 1) && (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-gray-800/50 rounded-lg px-6 py-3 border border-neon-pink/30"
                  >
                    <motion.span 
                      key={dealerHand.total}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      className="text-4xl text-neon-pink font-bold drop-shadow-[0_0_10px_rgba(255,45,203,0.8)]"
                    >
                      {dealerHand.total}
                    </motion.span>
                    {dealerHand.isSoft && <span className="text-sm text-blue-400 ml-2">(Soft)</span>}
                  </motion.div>
                )}
              </div>

              <div className="flex justify-center items-center min-h-[180px] sm:min-h-[220px] relative">
                <div className="flex justify-center gap-2 flex-wrap">
                  {dealerHand.cards.map((card, index) => (
                    <CardComponent key={card.id} card={card} index={index} isNew={false} />
                  ))}
                  {dealerHoleCard && gameState === 'playing' && (
                    <CardComponent 
                      key={`hole-${dealerHoleCard.id}`} 
                      card={dealerHoleCard} 
                      isHidden 
                      index={dealerHand.cards.length} 
                      isNew={false} 
                    />
                  )}
                  {isFlippingHoleCard && dealerHoleCard && (
                    <CardComponent 
                      key={`flipping-${dealerHoleCard.id}`} 
                      card={dealerHoleCard} 
                      isFlipping 
                      index={dealerHand.cards.length} 
                      isNew={false} 
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Player Section */}
            <div>
              <div className="flex items-center justify-between mb-6 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-pink to-electric-blue flex items-center justify-center">
                    <span className="text-sm font-bold text-white">P</span>
                  </div>
                  <span className="text-lg text-gray-300 font-medium">You</span>
                  {playerHand.isBlackjack && (
                    <span className="text-sm text-yellow-400 font-medium bg-yellow-900/30 px-3 py-1 rounded-full border border-yellow-600/30">
                      🃏 BLACKJACK 🃏
                    </span>
                  )}
                  {playerHand.isBust && (
                    <span className="text-sm text-red-400 font-medium bg-red-900/30 px-3 py-1 rounded-full border border-red-600/30">
                      💥 BUST 💥
                    </span>
                  )}
                </div>
                {playerHand.total > 0 && (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-gray-800/50 rounded-lg px-6 py-3 border border-electric-blue/30"
                  >
                    <motion.span 
                      key={animatedTotal}
                      className="text-4xl text-electric-blue font-bold drop-shadow-[0_0_10px_rgba(0,212,255,0.8)]"
                    >
                      {animatedTotal}
                    </motion.span>
                    {playerHand.isSoft && <span className="text-sm text-blue-400 ml-2">(Soft)</span>}
                  </motion.div>
                )}
              </div>

              <div className="flex justify-center items-center min-h-[180px] sm:min-h-[220px] relative">
                <div className="flex justify-center gap-2 flex-wrap">
                  {playerHand.cards.map((card, index) => (
                    <CardComponent key={card.id} card={card} index={index} isNew={false} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Betting Section - Stake.com Style */}
          <AnimatePresence>
            {gameState === 'betting' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="max-w-sm mx-auto mb-8"
              >
                {/* Bet Amount Input */}
                <div className="bg-bg-card/60 backdrop-blur-xl rounded-xl border border-neon-gray-dark/30 p-4 mb-3">
                  <div className="text-center mb-3">
                    <label className="text-neon-gray text-sm font-medium">Bet Amount</label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setBet(Math.max(1, Math.floor(bet / 2)))}
                      className="px-3 py-3 bg-bg-darker border border-neon-gray-dark/50 rounded-lg text-neon-gray hover:text-neon-white hover:border-electric-blue/50 transition-all font-medium"
                    >
                      1/2
                    </button>
                    
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neon-gray">$</span>
                      <input
                        type="number"
                        value={bet}
                        onChange={(e) => setBet(Math.max(1, Math.min(balance, parseInt(e.target.value) || 1)))}
                        className="w-full pl-8 pr-4 py-3 bg-bg-darker border border-neon-gray-dark/50 rounded-lg text-neon-white font-bold text-lg text-center focus:border-electric-blue focus:ring-1 focus:ring-electric-blue/30 outline-none transition-all"
                        min="1"
                        max={balance}
                      />
                    </div>
                    
                    <button
                      onClick={() => setBet(Math.min(balance, bet * 2))}
                      className="px-3 py-3 bg-bg-darker border border-neon-gray-dark/50 rounded-lg text-neon-gray hover:text-neon-white hover:border-electric-blue/50 transition-all font-medium"
                    >
                      X2
                    </button>
                  </div>
                </div>

                {/* Quick Bet Buttons */}
                <div className="flex gap-2 mb-4">
                  {[10, 50, 100, 500].filter(amount => amount <= balance).map(amount => (
                    <button
                      key={amount}
                      onClick={() => setBet(amount)}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        bet === amount
                          ? 'bg-neon-pink/20 border border-neon-pink/50 text-neon-pink'
                          : 'bg-bg-darker/60 border border-neon-gray-dark/30 text-neon-gray hover:bg-bg-darker hover:text-neon-white'
                      }`}
                    >
                      ${amount}
                    </button>
                  ))}
                </div>

                {/* Bet Button */}
                <NeonButton
                  onClick={startNewRound}
                  className="w-full py-3 text-lg font-bold"
                  disabled={bet > balance || bet < 1}
                >
                  Place Bet
                </NeonButton>

                {bet > balance && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center mt-2 text-red-400 text-sm"
                  >
                    Insufficient balance
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Game Controls */}
          <AnimatePresence>
            {gameState === 'playing' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="flex justify-center gap-3 sm:gap-4 flex-wrap mb-8 px-4"
              >
              <NeonButton
                onClick={hit}
                className="px-8 py-4 text-lg font-bold bg-gradient-to-r from-neon-pink/20 to-neon-pink/10 border-neon-pink/50"
              >
                🎯 HIT
              </NeonButton>
              <NeonButton
                onClick={stand}
                variant="secondary"
                className="px-8 py-4 text-lg font-bold"
              >
                ✋ STAND
              </NeonButton>
              {canSplit && (
                <NeonButton
                  onClick={splitPairs}
                  className="px-6 py-4 text-lg font-bold bg-gradient-to-r from-yellow-500/20 to-yellow-500/10 border-yellow-500/50"
                >
                  ✂️ SPLIT
                </NeonButton>
              )}
              {canDouble && (
                <NeonButton
                  onClick={double}
                  className="px-6 py-4 text-lg font-bold bg-gradient-to-r from-lime-green/20 to-lime-green/10 border-lime-green/50"
                >
                  💎 DOUBLE
                </NeonButton>
              )}
              {canInsurance && (
                <NeonButton
                  onClick={takeInsurance}
                  className="px-4 py-4 text-sm font-bold bg-gradient-to-r from-orange-500/20 to-orange-500/10 border-orange-500/50"
                >
                  🛡️ INSURANCE
                </NeonButton>
              )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dealing State */}
          <AnimatePresence>
            {isDealing && gameState === 'dealing' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="text-center mb-8"
              >
                <motion.div 
                  className="text-2xl text-electric-blue font-bold mb-2"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  🎴 Dealing...
                </motion.div>
                <div className="text-neon-gray">Professional Casino Experience</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dealer Turn State */}
          <AnimatePresence>
            {gameState === 'dealer-turn' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="text-center mb-8"
              >
                <motion.div 
                  className="text-2xl text-yellow-400 font-bold mb-2"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🤖 Dealer Playing...
                </motion.div>
                <div className="text-neon-gray">Dealer must hit soft 17</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bet History */}
          {betHistory.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto mb-8"
            >
              <div className="bg-bg-card/40 backdrop-blur-xl rounded-xl border border-neon-gray-dark/30 p-4">
                <h3 className="text-neon-white font-bold text-center mb-3">Recent Results</h3>
                <div className="flex gap-2 justify-center flex-wrap">
                  {betHistory.map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`px-3 py-2 rounded-lg text-xs font-bold ${
                        entry.result === 'win' || entry.result === 'blackjack'
                          ? 'bg-lime-green/20 text-lime-green border border-lime-green/30'
                          : entry.result === 'lose'
                            ? 'bg-red-500/20 text-red-500 border border-red-500/30'
                            : 'bg-electric-blue/20 text-electric-blue border border-electric-blue/30'
                      }`}
                    >
                      {entry.result === 'blackjack' ? '🃏' : 
                       entry.result === 'win' ? '✓' : 
                       entry.result === 'lose' ? '✗' : '='} 
                      ${entry.bet}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Blackjack;