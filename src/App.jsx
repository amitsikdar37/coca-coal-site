import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Globe, Lightbulb, Users } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);
import './App.css';

function App() {
  const [view, setView] = useState('home'); // 'home' or 'catalog'
  const [containerNode, setContainerNode] = useState(null);
  const { scrollYProgress } = useScroll({
    target: { current: containerNode },
    offset: ["start start", "end end"]
  });
  const [currentFrame, setCurrentFrame] = useState(1);

  // Map scroll progress → frame number
  const frameIndex = useTransform(scrollYProgress, [0, 1], [1, 240]);

  // Watch frame index to update the image
  useMotionValueEvent(frameIndex, 'change', (latest) => {
    setCurrentFrame(Math.round(latest));
  });

  // ─── Preload all frames ───────────────────────────────────────────────────
  useEffect(() => {
    for (let i = 1; i <= 240; i++) {
      const img = new Image();
      img.src = `/frames/ezgif-frame-${String(i).padStart(3, '0')}.jpg`;
    }
  }, []);

  // ─── Reset Scroll on View Change ──────────────────────────────────────────
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  // ─── Scroll-tied Animations based on frameIndex ───────────────────────────
  
  // Phase A: UI Dissolve (hero text and buttons) starts at frame 100
  const heroOpacity = useTransform(frameIndex, [100, 140], [1, 0]);
  const heroScale = useTransform(frameIndex, [100, 140], [1, 0.95]);

  // Phase B: Collection Reveal starts slightly after
  const collectionOpacity = useTransform(frameIndex, [120, 160], [0, 1]);
  const collectionY = useTransform(frameIndex, [120, 160], [60, 0]);

  // Phase C: Product Cans fly in
  const dietCokeX = useTransform(frameIndex, [140, 200], ['-110vw', '0vw']);
  const zeroSugarX = useTransform(frameIndex, [140, 200], ['110vw', '0vw']);
  const cansOpacity = useTransform(frameIndex, [140, 200], [0, 1]);

  // ─── Legacy Sections GSAP Animations ────────────────────────────────────
  useEffect(() => {
    if (view !== 'home') return;
    const ctx = gsap.context(() => {
      // Pin background and handle parallax
      ScrollTrigger.create({
        trigger: ".legacy-sections-wrapper",
        start: "top top",
        end: "bottom bottom",
        pin: ".legacy-bg-container",
      });

      // Background image subtle parallax
      gsap.to(".legacy-bg-image", {
        scrollTrigger: {
          trigger: ".legacy-sections-wrapper",
          start: "top bottom",
          end: "bottom top",
          scrub: true
        },
        yPercent: 20,
        ease: "none"
      });

      // Section 1 Timeline
      const tl1 = gsap.timeline({
        scrollTrigger: {
          trigger: ".legacy-sec-1",
          start: "top 80%",
        }
      });

      tl1.from(".legacy-sec-1 .legacy-eyebrow", {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: "expo.out"
      })
      .from(".legacy-sec-1 .legacy-title .stagger-el", {
        yPercent: 100,
        skewY: 7,
        duration: 1.2,
        stagger: 0.1,
        ease: "expo.out"
      }, "-=0.6")
      .from(".legacy-sec-1 .legacy-text-wrapper", {
        scaleY: 0,
        transformOrigin: "top",
        duration: 1,
        ease: "power4.inOut"
      }, "-=1")
      .from(".legacy-sec-1 .legacy-text-wrapper p", {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: "expo.out"
      }, "-=0.4");

      // Section 2 Timeline
      const tl2 = gsap.timeline({
        scrollTrigger: {
          trigger: ".legacy-sec-2",
          start: "top 80%",
        }
      });

      tl2.from(".legacy-sec-2 .legacy-icon", {
        scale: 0,
        rotation: -45,
        duration: 1,
        ease: "back.out(1.7)"
      })
      .from(".legacy-sec-2 .movement-title .stagger-el", {
        yPercent: 100,
        skewY: 10,
        duration: 1.2,
        stagger: 0.1,
        ease: "expo.out"
      }, "-=0.6")
      .from(".legacy-sec-2 .movement-text", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "expo.out"
      }, "-=0.8")
      .from(".legacy-sec-2 .btn-explore", {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: "expo.out"
      }, "-=0.6");

      // Refresh ScrollTrigger to catch layout shifts
      ScrollTrigger.refresh();
    });

    return () => ctx.revert();
  }, [view]);

  // ─── Heritage Animations ─────────────────────────────────────────────────
  useEffect(() => {
    if (view === 'heritage') {
      const ctx = gsap.context(() => {
        // Hero Intro Animation
        const heroTl = gsap.timeline();
        heroTl.from(".heritage-title .stagger-el", {
          yPercent: 100,
          skewY: 5,
          duration: 1.2,
          stagger: 0.1,
          ease: "expo.out"
        })
        .from(".heritage-subtitle", {
          y: 20,
          opacity: 0,
          duration: 1,
          ease: "power3.out"
        }, "-=0.8")
        .from(".heritage-actions", {
          y: 20,
          opacity: 0,
          duration: 1,
          ease: "power3.out"
        }, "-=0.8");

        // Scroll Parallax for Background Text
        gsap.to(".heritage-bg-text", {
          scrollTrigger: {
            trigger: ".heritage-hero",
            start: "top top",
            end: "bottom top",
            scrub: true
          },
          yPercent: -30,
          opacity: 0,
          ease: "none"
        });

        // Timeline Sections Reveal
        const timelines = gsap.utils.toArray(".heritage-timeline");
        timelines.forEach(section => {
          const timelineTl = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: "top 70%"
            }
          });

          const year = section.querySelector(".timeline-year");
          const title = section.querySelector(".timeline-title");
          const text = section.querySelector(".timeline-text");
          const visual = section.querySelectorAll(".timeline-badge, .timeline-image-container");

          if (year) timelineTl.from(year, { y: 50, opacity: 0, duration: 1.2, ease: "power3.out" }, 0);
          if (title) timelineTl.from(title, { y: 30, opacity: 0, duration: 1, ease: "power3.out" }, 0.4);
          if (text) timelineTl.from(text, { y: 30, opacity: 0, duration: 1, ease: "power3.out" }, 0.6);
          if (visual.length) timelineTl.from(visual, { scale: 0.9, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.2 }, 0.4);
        });

        ScrollTrigger.refresh();
      });
      return () => ctx.revert();
    }
  }, [view]);

  // ─── About Animations ────────────────────────────────────────────────────
  useEffect(() => {
    if (view === 'about') {
      const ctx = gsap.context(() => {
        // Hero Animation
        const heroTl = gsap.timeline();
        heroTl.from(".about-title .stagger-el", {
          yPercent: 100,
          skewY: 5,
          duration: 1.2,
          stagger: 0.1,
          ease: "expo.out"
        })
        .from(".about-subtitle", {
          y: 20,
          opacity: 0,
          duration: 1,
          ease: "power3.out"
        }, "-=0.8");

        gsap.to(".about-bg-text", {
          scrollTrigger: {
            trigger: ".about-hero",
            start: "top top",
            end: "bottom top",
            scrub: true
          },
          yPercent: -30,
          opacity: 0,
          ease: "none"
        });

        // Vision & Bento Grid Reveal
        const bentoTl = gsap.timeline({
          scrollTrigger: {
            trigger: ".about-vision",
            start: "top 80%"
          }
        });

        bentoTl.from(".vision-title", { y: 30, opacity: 0, duration: 1, ease: "power3.out" })
               .from(".vision-text", { y: 30, opacity: 0, duration: 1, ease: "power3.out" }, "-=0.8");

        const bentoGridTl = gsap.timeline({
          scrollTrigger: {
            trigger: ".about-bento",
            start: "top 80%"
          }
        });

        bentoGridTl.from(".bento-card", { 
                 y: 50, 
                 opacity: 0, 
                 duration: 1, 
                 ease: "power3.out", 
                 stagger: 0.15 
               });

        ScrollTrigger.refresh();
      });
      return () => ctx.revert();
    }
  }, [view]);

  // ─── Catalog Animations ──────────────────────────────────────────────────
  useEffect(() => {
    if (view === 'catalog') {
      const ctx = gsap.context(() => {
        gsap.fromTo(".filter-sidebar", 
          { x: -50, opacity: 0 },
          { x: 0, opacity: 1, duration: 1, ease: "expo.out", clearProps: "all" }
        );

        gsap.fromTo(".catalog-card", 
          { y: 50, opacity: 0 },
          { 
            y: 0, 
            opacity: 1, 
            duration: 1, 
            stagger: 0.1, 
            ease: "expo.out", 
            delay: 0.2,
            clearProps: "all"
          }
        );
      });
      return () => ctx.revert();
    }
  }, [view]);

  return (
    <>
      {/* ── Navbar ──────────────────────────────────────────────────── */}
      <nav className="navbar">
        <div className="nav-brand" onClick={() => setView('home')} style={{ cursor: 'pointer' }}>
          <img src="/cocacola.png" alt="Coca Cola Logo" />
        </div>
        <div className="nav-links">
          <a 
            href="#" 
            className={`nav-link ${view === 'home' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setView('home'); }}
          >Home</a>
          <a 
            href="#" 
            className={`nav-link ${view === 'catalog' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setView('catalog'); }}
          >Catalog</a>
          <a 
            href="#" 
            className={`nav-link ${view === 'heritage' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setView('heritage'); }}
          >Heritage</a>
          <a 
            href="#" 
            className={`nav-link ${view === 'about' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setView('about'); }}
          >About</a>
        </div>
        <div className="nav-right">
          <div className="nav-timer">00:12:45</div>
          <button className="shop-now-btn">Shop Now</button>
        </div>
      </nav>

      {view === 'home' ? (
        <div className="home-view">
          <div className="app-container" ref={setContainerNode}>
            <main className="main-content">
              {/* Phase A target — hero text */}
              <motion.div 
                className="hero-branding" 
                style={{ opacity: heroOpacity, scale: heroScale }}
              >
                <h1 className="hero-title">THE COKE SHOP</h1>
                <p className="hero-subtitle">Refreshment&nbsp;Redefined</p>
              </motion.div>

              {/* Phase A target — hero buttons */}
              <motion.div 
                className="hero-actions"
                style={{ opacity: heroOpacity, scale: heroScale }}
              >
                <button className="btn-primary">EXPLORE NOW</button>
                <button className="btn-secondary">VIEW GALLERY</button>
              </motion.div>

              {/* Phase B — Collection heading (tied to scroll) */}
              <motion.div 
                className="collection-reveal"
                style={{ opacity: collectionOpacity, y: collectionY, x: "-50%" }}
              >
                <span className="collection-eyebrow">The Lineup</span>
                <h2 className="collection-heading">Our&nbsp;Collection</h2>
              </motion.div>

              {/* Phase C — Diet Coke (slides from left tied to scroll) */}
              <motion.div 
                className="product-can can-diet"
                style={{ opacity: cansOpacity, x: dietCokeX }}
              >
                <img src="/diet coke.png" alt="Diet Coke" />
                <span className="can-label">Diet Coke</span>
              </motion.div>

              {/* Centre bottle — frame-by-frame scroll animation */}
              <motion.div className="center-bottle">
                <img
                  src={`/frames/ezgif-frame-${String(currentFrame).padStart(3, '0')}.jpg`}
                  alt="Coca Cola Glass Animation"
                />
              </motion.div>

              {/* Phase C — Classic Label (slides/fades with cans) */}
              <motion.span 
                className="center-label-standalone"
                style={{ opacity: cansOpacity, x: "-50%" }}
              >
                Classic
              </motion.span>

              {/* Phase C — Zero Sugar (slides from right tied to scroll) */}
              <motion.div 
                className="product-can can-zero"
                style={{ opacity: cansOpacity, x: zeroSugarX }}
              >
                <img src="/zerosugarcoke.png" alt="Coca Cola Zero Sugar" />
                <span className="can-label">Zero&nbsp;Sugar</span>
              </motion.div>

              {/* Scroll indicator */}
              <div className="scroll-indicator">
                <span className="scroll-text">SCROLL</span>
                <div className="scroll-line"></div>
              </div>
            </main>
          </div>

          {/* ── Legacy Sections ─────────────────────────────────────────────── */}
          <div className="legacy-sections-wrapper">
            <div className="legacy-bg-container">
              <div 
                className="legacy-bg-image" 
                style={{ backgroundImage: "url('/Cocacoalwallpaper.jpg')" }}
              ></div>
              <div className="legacy-bg-overlay"></div>
            </div>

            <div className="legacy-content">
              {/* Section 1 */}
              <section className="legacy-sec-1">
                <div className="legacy-container">
                  <span className="legacy-eyebrow">OUR LEGACY</span>
                  <h2 className="legacy-title">
                    <span className="reveal-wrapper">
                      <span className="stagger-el">MORE THAN A</span>
                    </span>
                    <span className="reveal-wrapper">
                      <span className="stagger-el">BEVERAGE.</span>
                    </span>
                    <span className="reveal-wrapper">
                      <span className="stagger-el">A PIECE OF HISTORY.</span>
                    </span>
                  </h2>
                  <div className="legacy-text-wrapper">
                    <p>
                      Since 1886, we've been crafting moments of joy, bringing<br />
                      people together around the world with the simple act of<br />
                      sharing a Coke. Experience the heritage in every drop.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 2 */}
              <section className="legacy-sec-2">
                <div className="legacy-container center-text">
                  <div className="legacy-icon">
                    <Globe color="#F40009" size={48} strokeWidth={1} />
                  </div>
                  <h2 className="movement-title">
                    <span className="reveal-wrapper">
                      <span className="stagger-el">JOIN THE</span>
                    </span>
                    <span className="reveal-wrapper">
                      <span className="stagger-el">MOVEMENT</span>
                    </span>
                  </h2>
                  <p className="movement-text">
                    We are committed to creating a more sustainable future. Every<br />
                    bottle, every community, every action matters. Discover how we're<br />
                    making a difference and how you can be a part of it.
                  </p>
                  <button className="btn-explore">EXPLORE INITIATIVES</button>
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : view === 'catalog' ? (
        <div className="catalog-view">
          <div className="catalog-container">
            <aside className="filter-sidebar">
              <h2 className="filter-title">Filter</h2>
              
              <div className="filter-group">
                <h3 className="filter-group-title">FLAVORS</h3>
                <div className="filter-items">
                  <label className="filter-item">
                    <input type="checkbox" defaultChecked />
                    <span>Classic</span>
                  </label>
                  <label className="filter-item">
                    <input type="checkbox" />
                    <span>Zero Sugar</span>
                  </label>
                  <label className="filter-item">
                    <input type="checkbox" />
                    <span>Cherry</span>
                  </label>
                </div>
              </div>

              <div className="filter-group">
                <h3 className="filter-group-title">PACKAGING</h3>
                <div className="filter-items">
                  <label className="filter-item">
                    <input type="checkbox" />
                    <span>Glass Bottle</span>
                  </label>
                  <label className="filter-item">
                    <input type="checkbox" defaultChecked />
                    <span>Can</span>
                  </label>
                </div>
              </div>
            </aside>

            <main className="catalog-content">
              <div className="catalog-grid">
                {/* Product 1 */}
                <div className="catalog-card">
                  <div className="card-image-box">
                    <img src="/classic.jpeg" alt="Coca Cola Classic" />
                  </div>
                  <div className="card-info">
                    <h3 className="card-name">Coca-Cola Classic</h3>
                    <p className="card-desc">Original Taste</p>
                    <div className="card-actions">
                      <button className="btn-quick">QUICK VIEW</button>
                      <button className="btn-shop">SHOP NOW</button>
                    </div>
                  </div>
                </div>

                {/* Product 2 */}
                <div className="catalog-card">
                  <div className="card-image-box">
                    <img src="/zerosugarcoke.png" alt="Coke Zero Sugar" />
                  </div>
                  <div className="card-info">
                    <h3 className="card-name">Coke Zero Sugar</h3>
                    <p className="card-desc">Zero Sugar</p>
                    <div className="card-actions">
                      <button className="btn-quick">QUICK VIEW</button>
                      <button className="btn-shop">SHOP NOW</button>
                    </div>
                  </div>
                </div>

                {/* Product 3 */}
                <div className="catalog-card">
                  <div className="card-image-box">
                    <img src="/diet coke.png" alt="Diet Coke" />
                  </div>
                  <div className="card-info">
                    <h3 className="card-name">Diet Coke</h3>
                    <p className="card-desc">Light and Refreshing</p>
                    <div className="card-actions">
                      <button className="btn-quick">QUICK VIEW</button>
                      <button className="btn-shop">SHOP NOW</button>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      ) : view === 'heritage' ? (
        <div className="heritage-view">
          <section className="heritage-hero">
            <div className="heritage-bg-image">
              <img src="/classic.jpeg" alt="Classic Coke Bottle" />
            </div>
            <div className="heritage-bg-text">THE COKE STORY</div>
            <div className="heritage-hero-content">
              <h1 className="heritage-title">
                <span className="reveal-wrapper"><span className="stagger-el">THE ORIGIN</span></span>
                <span className="reveal-wrapper"><span className="stagger-el">OF REFRESHMENT</span></span>
              </h1>
              <p className="heritage-subtitle">
                From a modest pharmacy in Atlanta to the cornerstone of global culture.<br/>
                This is the story of how a single formula changed the world.
              </p>
              <div className="heritage-scroll-indicator">
                <span>SCROLL TO BEGIN</span>
                <div className="scroll-line"></div>
              </div>
              <div className="heritage-actions">
                <button className="btn-primary heritage-btn-primary">EXPLORE NOW</button>
                <button className="btn-secondary heritage-btn-secondary">VIEW GALLERY</button>
              </div>
            </div>
          </section>
          
          <section className="heritage-timeline">
            <div className="timeline-container">
              <div className="timeline-left">
                <div className="timeline-year">1886</div>
                <div className="timeline-content">
                  <h2 className="timeline-title">THE FIRST POUR</h2>
                  <p className="timeline-text">
                    Dr. John S. Pemberton crafted a distinctive tasting syrup, combining<br/>
                    it with carbonated water. The resulting beverage was served at<br/>
                    Jacobs' Pharmacy, marking the birth of an icon. Simple, yet<br/>
                    profoundly refreshing.
                  </p>
                </div>
              </div>
              <div className="timeline-right">
                <div className="timeline-badge">
                  <div className="badge-inner">
                    <img src="/cocacola.png" alt="Coca Cola" />
                    <span className="badge-text">Classic Sip</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="heritage-timeline timeline-reverse">
            <div className="timeline-container">
              <div className="timeline-left">
                <div className="timeline-year">1915</div>
                <div className="timeline-content">
                  <span className="timeline-chapter">CHAPTER TWO</span>
                  <h2 className="timeline-title">THE CONTOUR<br/>BOTTLE</h2>
                  <p className="timeline-text">
                    A design so distinctive it could be recognized by touch<br/>
                    in the dark or lying broken on the ground. The contour<br/>
                    bottle became a global icon of refreshment and design<br/>
                    ingenuity.
                  </p>
                </div>
              </div>
              <div className="timeline-right">
                <div className="timeline-image-container">
                  <img src="/contour bottle.jpg" alt="Contour Bottle" className="timeline-image" />
                </div>
              </div>
            </div>
          </section>

          <section className="heritage-timeline">
            <div className="timeline-container">
              <div className="timeline-left">
                <div className="timeline-year">1950</div>
                <div className="timeline-content">
                  <span className="timeline-chapter">CHAPTER THREE</span>
                  <h2 className="timeline-title">A GLOBAL<br/>ICON</h2>
                  <p className="timeline-text">
                    Transcending its origins as a beverage, Coca-Cola<br/>
                    became a symbol of shared moments, pop culture, and<br/>
                    universal connection, appearing on the cover of TIME<br/>
                    magazine.
                  </p>
                </div>
              </div>
              <div className="timeline-right">
                <div className="timeline-image-container">
                  <img src="/global image.webp" alt="Global Icon" className="timeline-image" />
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : view === 'about' ? (
        <div className="about-view">
          <section className="about-hero">
            <div className="about-bg-image">
              <img src="/classic.jpeg" alt="Classic Coke Bottle" />
            </div>
            <div className="about-bg-text">THE COKE SHOP</div>
            <div className="about-hero-content">
              <span className="about-eyebrow">OUR PURPOSE</span>
              <h1 className="about-title">
                <span className="reveal-wrapper"><span className="stagger-el">Refresh the world.</span></span>
                <span className="reveal-wrapper"><span className="stagger-el">Make a difference.</span></span>
              </h1>
              <p className="about-subtitle">
                We craft the brands and choice of drinks that people love, to refresh<br/>
                them in body & spirit. And done in ways that create a more<br/>
                sustainable business and better shared future that makes a<br/>
                difference in people's lives, communities and our planet.
              </p>
              <div className="about-scroll-indicator">
                <div className="scroll-line"></div>
              </div>
            </div>
          </section>

          <section className="about-vision">
            <div className="vision-container">
              <h2 className="vision-title">A Vision for Tomorrow</h2>
              <p className="vision-text">
                Our vision is to craft the brands and choice of drinks that people love, to refresh them in<br/>
                body & spirit. And done in ways that create a more sustainable business and better shared<br/>
                future that makes a difference in people's lives, communities and our planet.
              </p>
            </div>
          </section>

          <section className="about-bento">
            <div className="bento-grid">
              {/* Card 1: Global Impact */}
              <div className="bento-card col-span-2 card-global">
                <div className="card-bg-decoration">
                  <div className="badge-inner">
                    <img src="/cocacola.png" alt="Coca Cola" />
                    <span className="badge-text">Classic Sip</span>
                  </div>
                </div>
                <div className="card-content-top">
                  <Globe className="bento-icon" size={24} color="#eabcb5" />
                </div>
                <div className="card-content-bottom">
                  <h3>Global Impact</h3>
                  <p>Operating in over 200 countries, we hold ourselves accountable to create a better shared future.</p>
                </div>
              </div>

              {/* Card 2: Innovation */}
              <div className="bento-card">
                <div className="card-content-top">
                  <Lightbulb className="bento-icon" size={24} color="#eabcb5" />
                </div>
                <div className="card-content-bottom">
                  <h3>Innovation</h3>
                  <p>Constantly evolving our portfolio to meet the changing tastes and needs of consumers worldwide.</p>
                </div>
              </div>

              {/* Card 3: Inclusion */}
              <div className="bento-card">
                <div className="card-content-top">
                  <Users className="bento-icon" size={24} color="#eabcb5" />
                </div>
                <div className="card-content-bottom">
                  <h3>Inclusion</h3>
                  <p>Creating a culture where everyone belongs and can thrive, reflecting the diverse world we serve.</p>
                </div>
              </div>

              {/* Card 4: Our People */}
              <div className="bento-card col-span-2 card-people">
                <div className="card-content-top">
                  <Users className="bento-icon" size={24} color="#eabcb5" />
                </div>
                <div className="card-content-bottom">
                  <h3>Our People</h3>
                  <p>
                    At the heart of our success is our dedicated team. We believe in empowering our
                    employees, fostering a culture of continuous learning, and recognizing the
                    unique contributions of every individual. Our people are the secret ingredient
                    that makes the magic happen.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="site-footer">
        <div className="footer-container">
          <div className="footer-left">
            <img src="/cocacola.png" alt="Coca Cola" className="footer-logo" />
          </div>
          <div className="footer-center">
            <a href="#">PRIVACY POLICY</a>
            <a href="#">TERMS OF SERVICE</a>
            <a href="#">CONTACT US</a>
            <a href="#">SUSTAINABILITY REPORT</a>
          </div>
          <div className="footer-right">
            <p>© 2024 THE COCA-COLA COMPANY. ALL RIGHTS RESERVED.</p>
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;
