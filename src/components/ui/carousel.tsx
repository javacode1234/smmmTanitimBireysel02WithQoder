import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// Error Boundary for Carousel
export class CarouselErrorBoundary extends React.Component<{children: React.ReactNode, fallback?: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode, fallback?: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('Carousel error:', error);
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Carousel error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="text-center py-4 text-muted-foreground">
          İçerik şu anda görüntülenemiyor.
        </div>
      );
    }

    return this.props.children;
  }
}

// Error Boundary for Carousel Items
class CarouselItemErrorBoundary extends React.Component<{children: React.ReactNode, fallback?: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode, fallback?: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('Carousel item error:', error);
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Carousel item error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 h-full flex items-center justify-center">
          <span className="text-muted-foreground">İçerik yüklenemedi</span>
        </div>
      );
    }

    return this.props.children;
  }
}

// Error Boundary for Carousel Content
class CarouselContentErrorBoundary extends React.Component<{children: React.ReactNode, fallback?: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode, fallback?: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('Carousel content error:', error);
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Carousel content error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center h-full">
          <span className="text-muted-foreground">İçerik yüklenemedi</span>
        </div>
      );
    }

    return this.props.children;
  }
}

type CarouselProps = {
  children: React.ReactNode
  className?: string
}

type CarouselContentProps = {
  children: React.ReactNode
  className?: string
}

type CarouselItemProps = {
  children: React.ReactNode
  className?: string
}

type CarouselPreviousProps = {
  className?: string
  onClick?: () => void
  disabled?: boolean
}

type CarouselNextProps = {
  className?: string
  onClick?: () => void
  disabled?: boolean
}

const CarouselContext = React.createContext<{
  currentIndex: number
  itemsPerView: number
  totalItems: number
  goToPrevious: () => void
  goToNext: () => void
  goToSlide: (index: number) => void
  dragStart: (clientX: number) => void
  dragMove: (clientX: number) => void
  dragEnd: () => void
  isDragging: boolean
  translateX: number
  pauseAutoplay: () => void
  resumeAutoplay: () => void
  continuousFlow?: boolean
  flowPosition?: number
} | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)
  if (!context) {
    throw new Error("useCarousel must be used within a Carousel")
  }
  return context
}

const Carousel = React.forwardRef<
  HTMLDivElement,
  CarouselProps & {
    itemsPerView?: number | { sm?: number; md?: number; lg?: number };
    autoPlay?: boolean;
    autoPlayInterval?: number;
    continuousFlow?: boolean;
  }
>(
  (
    {
      children,
      className,
      itemsPerView = 1,
      autoPlay = false,
      autoPlayInterval = 5000,
      continuousFlow = false,
      ...props
    },
    ref
  ) => {
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [isDragging, setIsDragging] = React.useState(false);
    const [isHovered, setIsHovered] = React.useState(false);
    const [startX, setStartX] = React.useState(0);
    const [translateX, setTranslateX] = React.useState(0);
    const totalItems = React.Children.count(children);
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
    const carouselRef = React.useRef<HTMLDivElement>(null);
    const animationRef = React.useRef<number | null>(null);
    const [flowPosition, setFlowPosition] = React.useState(0);
    const isMountedRef = React.useRef(true);

    // Get responsive items per view
    const getResponsiveItemsPerView = React.useCallback(() => {
      if (typeof itemsPerView === 'number') {
        return itemsPerView;
      }
      
      // Default values
      const defaults = { sm: 1, md: 2, lg: 4 };
      const config = { ...defaults, ...itemsPerView };
      
      // Get screen size (simplified approach)
      if (typeof window !== 'undefined') {
        if (window.innerWidth >= 1024) return config.lg;
        if (window.innerWidth >= 768) return config.md;
        return config.sm;
      }
      
      // Default to lg on server
      return config.lg;
    }, [itemsPerView]);

    const currentItemsPerView = getResponsiveItemsPerView();

    // Cleanup on unmount
    React.useEffect(() => {
      isMountedRef.current = true;
      const handleResize = () => {
        // Force re-render on resize to update items per view
      };
      
      if (typeof window !== 'undefined') {
        window.addEventListener('resize', handleResize);
      }
      
      return () => {
        isMountedRef.current = false;
        if (typeof window !== 'undefined') {
          window.removeEventListener('resize', handleResize);
        }
        
        // Clear timeout with additional safety checks
        if (timeoutRef.current) {
          try {
            clearTimeout(timeoutRef.current);
          } catch (e) {
            console.warn('Error clearing timeout in cleanup:', e);
          } finally {
            timeoutRef.current = null;
          }
        }
        
        // Cancel animation frame with additional safety checks
        if (animationRef.current) {
          try {
            cancelAnimationFrame(animationRef.current);
          } catch (e) {
            console.warn('Error canceling animation frame:', e);
          } finally {
            animationRef.current = null;
          }
        }
      };
    }, []);

    const goToPrevious = React.useCallback(() => {
      if (!isMountedRef.current) return;
      setCurrentIndex((prev) => {
        const previous = prev - 1;
        // Sonsuz döngü için sona git
        if (previous < 0) {
          return Math.max(totalItems - 1, 0);
        }
        return previous;
      });
    }, [totalItems]);

    const goToNext = React.useCallback(() => {
      if (!isMountedRef.current) return;
      setCurrentIndex((prev) => {
        const next = prev + 1;
        // Sonsuz döngü için başa dön
        if (next >= totalItems) {
          return 0;
        }
        return next;
      });
    }, [totalItems]);

    const goToSlide = React.useCallback((index: number) => {
      if (!isMountedRef.current) return;
      setCurrentIndex(Math.max(0, Math.min(index, totalItems - 1)));
    }, [totalItems]);

    const pauseAutoplay = React.useCallback(() => {
      setIsHovered(true);
    }, []);

    const resumeAutoplay = React.useCallback(() => {
      setIsHovered(false);
    }, []);

    // Continuous flow animation
    React.useEffect(() => {
      if (!continuousFlow || isHovered || !isMountedRef.current) return;

      let lastTimestamp: number | null = null;
      let animationFrameId: number | null = null;
      
      const animate = (timestamp: number) => {
        try {
          // Check if component is still mounted
          if (!isMountedRef.current) return;
          
          if (!lastTimestamp) lastTimestamp = timestamp;
          
          const deltaTime = timestamp - lastTimestamp;
          // Only update position every ~16ms (60fps) to prevent excessive updates
          if (deltaTime >= 16) {
            // Use functional update to ensure we have the latest state
            setFlowPosition(prev => {
              // Check if component is still mounted
              if (!isMountedRef.current) return prev;
              
              // Move by an even smaller amount each frame for very slow, smooth speed
              const newPosition = prev - 0.05;
              // Reset position when it reaches a certain threshold to create seamless loop
              return newPosition <= -100 ? 0 : newPosition;
            });
            lastTimestamp = timestamp;
          }
          
          // Check if component is still mounted before requesting next frame
          if (isMountedRef.current) {
            animationFrameId = requestAnimationFrame(animate);
          }
        } catch (error) {
          console.warn('Error in continuous flow animation:', error);
        }
      };

      // Check if component is still mounted before starting animation
      if (isMountedRef.current) {
        animationFrameId = requestAnimationFrame(animate);
      }

      return () => {
        if (animationFrameId) {
          try {
            cancelAnimationFrame(animationFrameId);
          } catch (error) {
            console.warn('Error canceling animation frame:', error);
          } finally {
            animationFrameId = null;
          }
        }
      };
    }, [continuousFlow, isHovered]);

    // Auto-play functionality with error handling
    React.useEffect(() => {
      if (!autoPlay || isDragging || isHovered || totalItems <= 1 || continuousFlow || !isMountedRef.current) return;

      const startAutoPlay = () => {
        try {
          // Clear any existing timeout
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }

          // Check if component is still mounted before setting timeout
          if (isMountedRef.current) {
            timeoutRef.current = setTimeout(() => {
              // Additional safety check before executing goToNext
              try {
                if (typeof goToNext === 'function' && isMountedRef.current) {
                  goToNext();
                }
              } catch (e) {
                console.warn('Error in auto-play goToNext:', e);
              }
            }, autoPlayInterval);
          }
        } catch (error) {
          console.warn('Error setting up auto-play:', error);
        }
      };

      startAutoPlay();

      // Cleanup function with error handling
      return () => {
        if (timeoutRef.current) {
          try {
            clearTimeout(timeoutRef.current);
          } catch (e) {
            console.warn('Error clearing timeout in cleanup:', e);
          } finally {
            timeoutRef.current = null;
          }
        }
      };
    }, [autoPlay, autoPlayInterval, currentIndex, goToNext, isDragging, isHovered, totalItems, continuousFlow]);

    // Drag functionality with error handling
    const dragStart = React.useCallback((clientX: number) => {
      try {
        // Check if component is still mounted
        if (!isMountedRef.current || !carouselRef.current) return;
        setIsDragging(true);
        setStartX(clientX);
      } catch (error) {
        console.warn('Error in dragStart:', error);
      }
    }, []);

    const dragMove = React.useCallback((clientX: number) => {
      try {
        // Check if component is still mounted and dragging
        if (!isMountedRef.current || !isDragging || !carouselRef.current) return;
        const diff = clientX - startX;
        setTranslateX(diff);
      } catch (error) {
        console.warn('Error in dragMove:', error);
      }
    }, [isDragging, startX]);

    const dragEnd = React.useCallback(() => {
      try {
        // Check if component is still mounted
        if (!isMountedRef.current) {
          setIsDragging(false);
          return;
        }
        
        // Only proceed if we were actually dragging
        if (!isDragging) {
          setIsDragging(false);
          return;
        }
        
        setIsDragging(false);
        
        // For continuous flow, we don't change slides but allow temporary dragging
        if (continuousFlow) {
          // Reset translateX for continuous flow
          setTranslateX(0);
          return;
        }
        
        // If dragged more than 50px, change slide (sabit değer kullanarak logoların kaymasını önle)
        const threshold = 50;
        
        if (Math.abs(translateX) > threshold) {
          if (translateX > 0) {
            goToPrevious();
          } else {
            goToNext();
          }
        }
      } catch (error) {
        console.warn('Error in dragEnd calculation:', error);
      } finally {
        // Always reset translateX even if there's an error
        try {
          setTranslateX(0);
        } catch (error) {
          console.warn('Error resetting translateX:', error);
        }
      }
    }, [isDragging, translateX, goToPrevious, goToNext, continuousFlow]);

    const contextValue = React.useMemo(
      () => ({
        currentIndex,
        itemsPerView: currentItemsPerView,
        totalItems,
        goToPrevious,
        goToNext,
        goToSlide,
        dragStart,
        dragMove,
        dragEnd,
        isDragging,
        translateX,
        pauseAutoplay,
        resumeAutoplay,
        continuousFlow,
        flowPosition,
      }),
      [
        currentIndex,
        currentItemsPerView,
        totalItems,
        goToPrevious,
        goToNext,
        goToSlide,
        dragStart,
        dragMove,
        dragEnd,
        isDragging,
        translateX,
        pauseAutoplay,
        resumeAutoplay,
        continuousFlow,
        flowPosition,
      ]
    );

    return (
      <CarouselContext.Provider value={contextValue}>
        <CarouselErrorBoundary>
          <div
            ref={React.useCallback((node: HTMLDivElement | null) => {
              (carouselRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
              if (typeof ref === 'function') {
                ref(node);
              } else if (ref) {
                (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
              }
            }, [ref])}
            className={cn("relative", className)}
            onMouseEnter={pauseAutoplay}
            onMouseLeave={resumeAutoplay}
            {...props}
          >
            {children}
          </div>
        </CarouselErrorBoundary>
      </CarouselContext.Provider>
    );
  }
)
Carousel.displayName = "Carousel"

const CarouselContent = React.forwardRef<
  HTMLDivElement,
  CarouselContentProps
>(({ children, className, ...props }, ref) => {
  const { currentIndex, isDragging, dragStart, dragMove, dragEnd, translateX, continuousFlow, flowPosition } = useCarousel()
  const isMountedRef = React.useRef({ current: true });
  
  // Track mount status
  React.useEffect(() => {
    isMountedRef.current = { current: true };
    return () => {
      isMountedRef.current = { current: false };
    };
  }, []);
  
  // Handle mouse events with error handling
  const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
    try {
      // Check if component is still mounted
      if (!isMountedRef.current.current) return;
      dragStart(e.clientX)
    } catch (error) {
      console.warn('Error in dragStart:', error)
    }
  }, [dragStart])
  
  const handleMouseMove = React.useCallback((e: React.MouseEvent) => {
    try {
      // Check if component is still mounted
      if (!isMountedRef.current.current) return;
      dragMove(e.clientX)
    } catch (error) {
      console.warn('Error in dragMove:', error)
    }
  }, [dragMove])
  
  const handleMouseUp = React.useCallback(() => {
    try {
      // Check if component is still mounted
      if (!isMountedRef.current.current) return;
      dragEnd()
    } catch (error) {
      console.warn('Error in dragEnd:', error)
    }
  }, [dragEnd])
  
  const handleMouseLeave = React.useCallback(() => {
    try {
      // Check if component is still mounted
      if (!isMountedRef.current.current) return;
      dragEnd()
    } catch (error) {
      console.warn('Error in dragEnd (mouseleave):', error)
    }
  }, [dragEnd])
  
  // Handle touch events with error handling
  const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
    try {
      // Check if component is still mounted
      if (!isMountedRef.current.current) return;
      if (e.touches[0]) {
        dragStart(e.touches[0].clientX)
      }
    } catch (error) {
      console.warn('Error in touchStart:', error)
    }
  }, [dragStart])
  
  const handleTouchMove = React.useCallback((e: React.TouchEvent) => {
    try {
      // Check if component is still mounted
      if (!isMountedRef.current.current) return;
      if (e.touches[0]) {
        dragMove(e.touches[0].clientX)
      }
    } catch (error) {
      console.warn('Error in touchMove:', error)
    }
  }, [dragMove])
  
  const handleTouchEnd = React.useCallback(() => {
    try {
      // Check if component is still mounted
      if (!isMountedRef.current.current) return;
      dragEnd()
    } catch (error) {
      console.warn('Error in touchEnd:', error)
    }
  }, [dragEnd])

  // Calculate transform with safety checks
  const calculateTransform = React.useCallback(() => {
    try {
      if (continuousFlow) {
        // For continuous flow, use the flow position plus any drag translation
        // We'll use a fixed value for drag offset since we can't easily get the element width
        const dragOffset = translateX ? translateX * 0.01 : 0; // Approximate conversion
        return `translateX(${(flowPosition || 0) + dragOffset}%)`
      } else {
        // Safety check for negative values
        const safeCurrentIndex = Math.max(0, currentIndex)
        // Drag sırasında translateX'ı sınırla (logoların çok fazla kaymasını önle)
        const limitedTranslateX = isDragging ? Math.max(-100, Math.min(100, translateX || 0)) : (translateX || 0)
        return `translateX(calc(-${(safeCurrentIndex * 100)}% + ${limitedTranslateX}px))`
      }
    } catch (error) {
      console.warn('Error calculating transform:', error)
      return 'translateX(0)'
    }
  }, [currentIndex, translateX, continuousFlow, flowPosition, isDragging])

  // For continuous flow, we need to duplicate children to create seamless loop
  const renderChildren = React.useCallback(() => {
    try {
      if (continuousFlow) {
        // Create a seamless loop by duplicating children with unique keys
        const childrenArray = React.Children.toArray(children)
        
        // Create three sets of children with unique keys
        const duplicatedChildren: React.ReactNode[] = []
        
        // First set (original)
        childrenArray.forEach((child, index) => {
          if (React.isValidElement(child)) {
            duplicatedChildren.push(React.cloneElement(child, {
              key: `original-${index}`
            }))
          }
        })
        
        // Second set (duplicate 1)
        childrenArray.forEach((child, index) => {
          if (React.isValidElement(child)) {
            duplicatedChildren.push(React.cloneElement(child, {
              key: `duplicate1-${index}`
            }))
          }
        })
        
        // Third set (duplicate 2)
        childrenArray.forEach((child, index) => {
          if (React.isValidElement(child)) {
            duplicatedChildren.push(React.cloneElement(child, {
              key: `duplicate2-${index}`
            }))
          }
        })
        
        return duplicatedChildren
      }
      return children
    } catch (error) {
      console.warn('Error in renderChildren:', error)
      return children
    }
  }, [children, continuousFlow])

  return (
    <div 
      className="overflow-hidden select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ userSelect: 'none' }}
      {...props}
    >
      <CarouselContentErrorBoundary>
        <div
          ref={ref}
          className={cn(
            "flex transition-transform ease-out",
            continuousFlow ? "duration-0" : "duration-500",
            isDragging ? "cursor-grabbing transition-none" : "cursor-grab",
            className
          )}
          style={{
            transform: calculateTransform(),
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
          }}
        >
          {/* Safety check to prevent rendering issues */}
          {React.Children.toArray(children).length > 0 ? renderChildren() : null}
        </div>
      </CarouselContentErrorBoundary>
    </div>
  )
})
CarouselContent.displayName = "CarouselContent"

const CarouselItem = React.forwardRef<HTMLDivElement, CarouselItemProps>(
  ({ children, className, ...props }, ref) => {
    const { continuousFlow } = useCarousel()
    const isMountedRef = React.useRef({ current: true });
    
    // Track mount status
    React.useEffect(() => {
      isMountedRef.current = { current: true };
      return () => {
        isMountedRef.current = { current: false };
      };
    }, []);
    
    // Use React.useMemo to prevent unnecessary re-renders
    const content = React.useMemo(() => (
      <CarouselItemErrorBoundary>
        {children}
      </CarouselItemErrorBoundary>
    ), [children]);
    
    return (
      <div
        ref={ref}
        className={cn(
          "flex-shrink-0 w-full sm:w-1/2 md:w-1/4",
          continuousFlow ? "basis-1/8 md:basis-1/4" : "basis-full sm:basis-1/2 md:basis-1/4",
          className
        )}
        {...props}
      >
        {content}
      </div>
    )
  }
)
CarouselItem.displayName = "CarouselItem"

const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  CarouselPreviousProps
>(({ className, onClick, disabled, ...props }, ref) => {
  const { goToPrevious, totalItems } = useCarousel()
  const isMountedRef = React.useRef({ current: true });
  
  // Track mount status
  React.useEffect(() => {
    isMountedRef.current = { current: true };
    return () => {
      isMountedRef.current = { current: false };
    };
  }, []);
  
  // Sonsuz döngü için sadece tek item varsa disable et
  const isDisabled = disabled || totalItems <= 1

  const handleClick = React.useCallback((e: React.MouseEvent) => {
    try {
      e.preventDefault();
      e.stopPropagation();
      // Check if component is still mounted
      if (!isMountedRef.current.current) return;
      
      if (typeof goToPrevious === 'function') {
        goToPrevious()
        onClick?.()
      }
    } catch (error) {
      console.warn('Error in CarouselPrevious handleClick:', error)
    }
  }, [goToPrevious, onClick])

  return (
    <Button
      ref={ref}
      variant="outline"
      size="icon"
      className={cn(
        "absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full",
        className
      )}
      onClick={handleClick}
      disabled={isDisabled}
      {...props}
    >
      <ChevronLeft className="h-4 w-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
})
CarouselPrevious.displayName = "CarouselPrevious"

const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  CarouselNextProps
>(({ className, onClick, disabled, ...props }, ref) => {
  const { goToNext, totalItems } = useCarousel()
  const isMountedRef = React.useRef({ current: true });
  
  // Track mount status
  React.useEffect(() => {
    isMountedRef.current = { current: true };
    return () => {
      isMountedRef.current = { current: false };
    };
  }, []);
  
  // Sonsuz döngü için sadece tek item varsa disable et
  const isDisabled = disabled || totalItems <= 1

  const handleClick = React.useCallback((e: React.MouseEvent) => {
    try {
      e.preventDefault();
      e.stopPropagation();
      // Check if component is still mounted
      if (!isMountedRef.current.current) return;
      
      if (typeof goToNext === 'function') {
        goToNext()
        onClick?.()
      }
    } catch (error) {
      console.warn('Error in CarouselNext handleClick:', error)
    }
  }, [goToNext, onClick])

  return (
    <Button
      ref={ref}
      variant="outline"
      size="icon"
      className={cn(
        "absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full",
        className
      )}
      onClick={handleClick}
      disabled={isDisabled}
      {...props}
    >
      <ChevronRight className="h-4 w-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  )
})
CarouselNext.displayName = "CarouselNext"

const CarouselIndicators = ({ className }: { className?: string }) => {
  const { currentIndex, totalItems, goToSlide } = useCarousel()
  const isMountedRef = React.useRef({ current: true });
  
  // Track mount status
  React.useEffect(() => {
    isMountedRef.current = { current: true };
    return () => {
      isMountedRef.current = { current: false };
    };
  }, []);
  const handleClick = React.useCallback((index: number, e: React.MouseEvent) => {
    try {
      e.preventDefault();
      e.stopPropagation();
      if (!isMountedRef.current.current) return;
      if (typeof goToSlide === 'function') {
        goToSlide(index)
      }
    } catch (error) {
      console.warn('Error in CarouselIndicators handleClick:', error)
    }
  }, [goToSlide])
  
  if (totalItems <= 1) return null

  return (
    <div className={cn("flex justify-center gap-2 mt-4", className)}>
      {Array.from({ length: totalItems }).map((_, index) => (
        <button
          key={index}
          onClick={(e) => handleClick(index, e)}
          className={cn(
            "h-2 rounded-full transition-all duration-300",
            index === currentIndex
              ? "w-8 bg-blue-600"
              : "w-2 bg-gray-300"
          )}
          aria-label={`Go to slide ${index + 1}`}
          type="button"
        />
      ))}
    </div>
  )
}
CarouselIndicators.displayName = "CarouselIndicators"

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselIndicators,
  type CarouselProps,
  type CarouselContentProps,
  type CarouselItemProps,
  type CarouselPreviousProps,
  type CarouselNextProps,
}
