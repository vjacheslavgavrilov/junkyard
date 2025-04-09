// imports icons data from external file
import icons from '../data/icons/icons.js';

// class to manage interaction state and prevent duplicate events
class InteractionState {
  constructor() {
    this.lastEventTime = 0;
    this.isProcessing = false;
    this.eventLock = false;
  }

  // resets all interaction state properties
  reset() {
    this.eventLock = false;
    this.lastEventTime = 0;
    this.isProcessing = false;
  }
}

// class to store configuration constants
class Config {
  constructor() {
    this.interactionDelay = 50;
    this.touchDelay = 150;
    this.mobileActiveDuration = 200;
    this.mobileActiveClass = 'touch';
    this.touchMoveThreshold = 10;
    this.animationDuration = 250;
  }
}

// main application class
class App {
  constructor() {
    // detects if device has touch capability
    this.isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    
    // media query for detecting touch devices
    this.mediaQuery = window.matchMedia('(pointer: coarse)');
    
    // stores cards and tags data
    this.cardsData = [];
    this.tagsData = [];
    
    // tracks currently touched element
    this.currentTouchedElement = null;
    
    // stores initial touch coordinates
    this.initialTouchPoint = { x: 0, y: 0 };
    
    // tracks current filter state
    this.currentFilter = 'all';
    
    // flag for first load state
    this.isFirstLoad = true;
    
    // creates interaction state and config instances
    this.interactionState = new InteractionState();
    this.config = new Config();
  }

  // initializes DOM structure
  initDOM() {
    this.mainContainer = document.createElement('div');
    this.mainContainer.classList.add('main-container');
    document.body.appendChild(this.mainContainer);

    // sets initial opacity for fade-in effect
    this.mainContainer.style.opacity = '0';

    // creates basic page structure
    this.mainContainer.innerHTML = `
      <header>
        <div class="header-container">
          <a href="/">
            <div class="header-link">
              <img class="logotype" src="../data/images/Moon.png" alt="moon" draggable="false">
              <h1 class="website-name">Junkyard</h1>
            </div>
          </a>
        </div>
      </header>
      <div class="content-wrapper">
        <div class="tags-container"></div>
        <div class="cards-container"></div>
      </div>
      <footer>
        <div class="copyright">vjacheslav gavrilov</div>
        <div class="footer-link">
          <div class="link"><a href="https://github.com/vjacheslavgavrilov" target="_blank">github</a></div>
          <div class="link"><a href="https://www.linkedin.com/in/vjacheslav-gavrilov/" target="_blank">linkedin</a></div>
        </div>
      </footer>
    `;

    // initializes link elements and event handlers
    this.initLinkElements();
    this.addResetHandlers();
    this.addGlobalTouchHandlers();

    // creates fade-in animation
    let opacity = 0;
    const fadeIn = () => {
      opacity += 0.05;
      this.mainContainer.style.opacity = opacity.toString();
      if (opacity < 1) {
        requestAnimationFrame(fadeIn);
      }
    };
    requestAnimationFrame(fadeIn);
  }

  // adds global touch event handlers
  addGlobalTouchHandlers() {
    document.addEventListener('touchend', this.handleGlobalTouchEnd.bind(this), { passive: true });
    document.addEventListener('touchcancel', this.handleGlobalTouchCancel.bind(this), { passive: true });
  }

  // handles global touch end event
  handleGlobalTouchEnd() {
    if (this.currentTouchedElement) {
      this.currentTouchedElement.classList.remove(this.config.mobileActiveClass);
      this.currentTouchedElement = null;
    }
  }

  // handles global touch cancel event
  handleGlobalTouchCancel() {
    if (this.currentTouchedElement) {
      this.currentTouchedElement.classList.remove(this.config.mobileActiveClass);
      this.currentTouchedElement = null;
    }
  }

  // initializes link elements with appropriate event handlers
  initLinkElements() {
    document.querySelectorAll('.link').forEach(link => {
      // removes existing event listeners to prevent duplicates
      link.removeEventListener('mouseenter', this.handleLinkMouseEnter);
      link.removeEventListener('mouseleave', this.handleLinkMouseLeave);
      link.removeEventListener('touchstart', this.handleLinkTouchStart);

      // adds appropriate event listeners based on device type
      if (this.isTouchDevice) {
        link.addEventListener('touchstart', this.handleLinkTouchStart.bind(this));
      } else {
        link.addEventListener('mouseenter', this.handleLinkMouseEnter);
        link.addEventListener('mouseleave', this.handleLinkMouseLeave);
      }
    });
  }

  // handles touch start event on links
  handleLinkTouchStart(e) {
    e.currentTarget.classList.add(this.config.mobileActiveClass);
    this.currentTouchedElement = e.currentTarget;
    this.initialTouchPoint = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  }

  // handles mouse enter event on links
  handleLinkMouseEnter(e) {
    e.currentTarget.classList.add('hover');
  }

  // handles mouse leave event on links
  handleLinkMouseLeave(e) {
    e.currentTarget.classList.remove('hover');
  }

  // adds handlers to reset interaction state on certain events
  addResetHandlers() {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.resetInteractionState();
      }
    });

    window.addEventListener('blur', () => {
      this.resetInteractionState();
    });

    window.addEventListener('focus', () => {
      this.resetInteractionState();
    });
  }

  // resets all interaction state
  resetInteractionState() {
    this.interactionState.reset();
    if (this.currentTouchedElement) {
      this.currentTouchedElement.classList.remove(this.config.mobileActiveClass);
      this.currentTouchedElement = null;
    }
  }

  // handles all types of user interactions with elements
  handleInteraction(element, callback) {
    let startX = 0;
    let startY = 0;
    let moved = false;

    // handles touch start event
    const handleTouchStart = (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      moved = false;
      element.classList.add(this.config.mobileActiveClass);
      this.currentTouchedElement = element;
    };

    // handles touch move event
    const handleTouchMove = (e) => {
      if (!this.currentTouchedElement) return;

      const touch = e.touches[0] || e.changedTouches[0];
      const deltaX = Math.abs(touch.clientX - startX);
      const deltaY = Math.abs(touch.clientY - startY);

      if (deltaX > this.config.touchMoveThreshold || deltaY > this.config.touchMoveThreshold) {
        moved = true;
      }
    };

    // handles touch end event
    const handleTouchEnd = (e) => {
      if (!moved && this.currentTouchedElement === element) {
        const now = Date.now();
        const isDuplicate = now - this.interactionState.lastEventTime < this.config.interactionDelay;

        if (!this.interactionState.eventLock && !isDuplicate) {
          this.interactionState.eventLock = true;
          this.interactionState.lastEventTime = now;

          setTimeout(() => {
            callback(e);
            this.interactionState.eventLock = false;
          }, this.config.touchDelay);
        }
      }

      element.classList.remove(this.config.mobileActiveClass);
      this.currentTouchedElement = null;
    };

    // handles click event
    const handleClick = (e) => {
      const now = Date.now();
      const isDuplicate = now - this.interactionState.lastEventTime < this.config.interactionDelay;

      if (this.interactionState.eventLock || isDuplicate) {
        if (this.interactionState.eventLock) {
          this.resetInteractionState();
        }
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      this.interactionState.eventLock = true;
      this.interactionState.lastEventTime = now;
      callback(e);
      this.interactionState.eventLock = false;
    };

    // removes existing event listeners
    element.removeEventListener('click', handleClick);
    element.removeEventListener('touchstart', handleTouchStart);
    element.removeEventListener('touchmove', handleTouchMove);
    element.removeEventListener('touchend', handleTouchEnd);

    // adds appropriate event listeners based on device type
    if (this.isTouchDevice) {
      element.addEventListener('touchstart', handleTouchStart, { passive: true });
      element.addEventListener('touchmove', handleTouchMove, { passive: true });
      element.addEventListener('touchend', handleTouchEnd, { passive: false });
    } else {
      element.addEventListener('click', handleClick);
    }
  }

  // creates tag element with event handlers
  createTagElement(tag) {
    // creates valid id from tag name
    const validId = tag.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const element = document.createElement('div');
    element.id = validId;
    element.classList.add('tag');
    element.textContent = tag;

    // adds interaction handler for filtering
    this.handleInteraction(element, () => {
      document.querySelectorAll('.tag').forEach(t => t.classList.remove('select'));
      element.classList.add('select');
      this.filterCards(element.id === 'all' ? 'all' : element.id);
    });

    // adds hover effects for non-touch devices
    if (!this.isTouchDevice) {
      element.addEventListener('mouseenter', () => {
        if (!element.classList.contains('select')) {
          element.classList.add('hover');
        }
      });

      element.addEventListener('mouseleave', () => {
        element.classList.remove('hover');
      });
    }

    return element;
  }

  // creates card element with appropriate content and event handlers
  createCardElement(card) {
    const link = document.createElement('a');
    link.href = card.link;
    link.classList.add('card-link');
    link.target = "_blank";

    const cardElement = document.createElement('div');
    cardElement.id = card.id;
    cardElement.classList.add('card');

    // sets card content
    cardElement.innerHTML = `
      <div class="icon">${icons[card.icon] || ''}</div>
      <div class="card-text">
        <h2 class="card-title">${card.title}</h2>
        <p class="card-paragraph">${card.subtitle}</p>
      </div>
    `;

    link.appendChild(cardElement);

    // adds touch-specific handlers
    if (this.isTouchDevice) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
      });

      this.handleInteraction(cardElement, () => {
        setTimeout(() => {
          window.open(card.link, '_blank');
        }, this.config.touchDelay);
      });
    }

    // adds hover effects for non-touch devices
    if (!this.isTouchDevice) {
      link.addEventListener('mouseenter', () => {
        cardElement.classList.add('hover');
      });

      link.addEventListener('mouseleave', () => {
        cardElement.classList.remove('hover');
      });
    }

    return link;
  }

  // filters and displays cards based on selected tag
  async filterCards(selectedTag) {
    this.currentFilter = selectedTag;

    const cardsContainer = document.querySelector('.cards-container');

    // handles animation for non-first loads
    if (!this.isFirstLoad) {
      const currentCards = Array.from(cardsContainer.querySelectorAll('.card-link'));

      currentCards.forEach(card => {
        card.classList.remove('visible');
        card.classList.add('hiding');
      });

      await new Promise(resolve => setTimeout(resolve, this.config.animationDuration));
    }

    // clears container and adds filtered cards
    cardsContainer.innerHTML = '';

    const cardsToShow = selectedTag === 'all'
      ? this.cardsData
      : this.cardsData.filter(card => card.id === selectedTag);

    cardsToShow.forEach(card => {
      const cardElement = this.createCardElement(card);
      cardsContainer.appendChild(cardElement);

      // applies different animation for first load
      if (this.isFirstLoad) {
        cardElement.classList.add('visible');
      } else {
        requestAnimationFrame(() => {
          cardElement.classList.add('visible');
        });
      }
    });

    this.isFirstLoad = false;
  }

  // updates the entire interface with current data
  updateInterface() {
    const tagsContainer = document.querySelector('.tags-container');
    tagsContainer.innerHTML = '';

    // creates and adds 'All' tag
    const allTag = this.createTagElement('All');
    allTag.id = 'all';
    allTag.classList.add('tag', 'select');
    tagsContainer.appendChild(allTag);

    // adds all other tags
    this.tagsData.forEach(tag => {
      if (tag.toLowerCase() !== 'all') {
        tagsContainer.appendChild(this.createTagElement(tag));
      }
    });

    // applies initial filter and updates links
    this.filterCards('all');
    this.initLinkElements();
  }

  // handles device type changes
  handleDeviceChange(e) {
    const newIsTouchDevice = e.matches;
    if (newIsTouchDevice !== this.isTouchDevice) {
      this.isTouchDevice = newIsTouchDevice;
      this.currentFilter = 'all';
      this.isFirstLoad = true;
      this.updateInterface();
    }
  }

  // loads data from JSON files
  async loadData() {
    try {
      const tagsResponse = await fetch('../data/json/tags.json');
      this.tagsData = (await tagsResponse.json()).tags;

      const cardsResponse = await fetch('../data/json/cards.json');
      this.cardsData = await cardsResponse.json();

      this.updateInterface();
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  // initializes the application
  init() {
    this.initDOM();
    this.mediaQuery.addEventListener('change', (e) => this.handleDeviceChange(e));
    this.loadData();
  }
}

// initializes app when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});