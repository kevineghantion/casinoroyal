// Casino Royal Framer Motion Animation Variants
export const pageTransition = {
  initial: {
    opacity: 0,
    y: 30,
    scale: 0.95
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95
  }
};

export const hoverGlow = {
  rest: {
    scale: 1,
    filter: "drop-shadow(0 0 0px rgba(255, 45, 203, 0))"
  },
  hover: {
    scale: 1.05,
    filter: "drop-shadow(0 0 20px rgba(255, 45, 203, 0.5))"
  },
  tap: {
    scale: 0.98,
    filter: "drop-shadow(0 0 30px rgba(255, 45, 203, 0.8))"
  }
};

export const flipForm = {
  front: {
    rotateY: 0,
    opacity: 1
  },
  back: {
    rotateY: 180,
    opacity: 0
  }
};

export const rocketMultiplier = {
  initial: {
    scale: 1,
    y: 0
  },
  flying: {
    scale: [1, 1.2, 1],
    y: [0, -10, 0]
  },
  cashOut: {
    scale: 1.5,
    filter: "drop-shadow(0 0 30px rgba(168, 255, 62, 0.8))"
  }
};

export const cardDeal = {
  hidden: {
    x: -100,
    y: -50,
    rotate: -20,
    opacity: 0
  },
  visible: (index: number) => ({
    x: 0,
    y: 0,
    rotate: 0,
    opacity: 1
  }),
  hover: {
    y: -10,
    rotate: 5,
    scale: 1.05
  }
};

export const floatingElement = {
  float: {
    y: [0, -20, 0]
  }
};

export const neonPulse = {
  pulse: {
    filter: [
      "drop-shadow(0 0 10px currentColor)",
      "drop-shadow(0 0 30px currentColor)",
      "drop-shadow(0 0 10px currentColor)"
    ]
  }
};

export const slideInFromRight = {
  hidden: {
    x: "100%",
    opacity: 0
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.1,
      ease: "easeOut"
    }
  }
};

export const slideInFromLeft = {
  hidden: {
    x: "-100%",
    opacity: 0
  },
  visible: {
    x: 0,
    opacity: 1
  }
};

export const staggerChildren = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1
  }
};

export const balancePulse = {
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

export const countUp = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.45,
      ease: "easeOut"
    }
  }
};

export const slideUpMobile = {
  hidden: {
    y: "100%",
    opacity: 0
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      damping: 30,
      stiffness: 300
    }
  },
  exit: {
    y: "100%",
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: "easeIn"
    }
  }
};

export const bounceIn = {
  hidden: {
    scale: 0,
    opacity: 0
  },
  visible: {
    scale: 1,
    opacity: 1
  }
};