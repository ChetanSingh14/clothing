"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import "./AnimatedHero.css";

gsap.registerPlugin(useGSAP);

interface AnimatedHeroProps {
  onStartClick: () => void;
}

export default function AnimatedHero({ onStartClick }: AnimatedHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const berriesFGRef = useRef<HTMLDivElement>(null);
  const berriesBGRef = useRef<HTMLDivElement>(null);
  const leavesBGRef = useRef<HTMLDivElement>(null);
  const [flavor, setFlavor] = useState<"cream" | "brown">("cream");
  const [modelViewerLoaded, setModelViewerLoaded] = useState(false);

  // Load model viewer client side only
  useEffect(() => {
    import("@google/model-viewer").then(() => {
      setModelViewerLoaded(true);
    }).catch((e) => console.error("Failed to load model-viewer", e));
  }, []);

  useGSAP(() => {
    if (!modelViewerLoaded) return;
    const modelViewer = document.querySelector("#product-model") as any;
    if (!modelViewer) return;

    const berries = document.querySelectorAll(".berry") as NodeListOf<HTMLElement>;
    const cards = document.querySelectorAll(".flavor-card") as NodeListOf<HTMLElement>;
    const body = containerRef.current;
    if (!body) return;

    let isSwitching = false;
    let switchSpin = 0;
    let blueTexture: any = null;
    let greenTexture: any = null;

    const loadTextures = async () => {
      try {
        if (modelViewer.model) {
          modelViewer.model.materials.forEach((material: any) => {
            if (material.pbrMetallicRoughness.baseColorTexture) {
                material.pbrMetallicRoughness.baseColorTexture.setTexture(null);
            }
            // Set initial color (Cream background -> Brown Tee)
            material.pbrMetallicRoughness.setBaseColorFactor([0.11, 0.08, 0.06, 1]);
          });
        }
      } catch (e) {
        console.error("Texture preload failed", e);
      }
    };

    modelViewer.addEventListener("load", loadTextures);

    // Initial Berry States
    berries.forEach((b) => {
      b.dataset.rx = "0";
      b.dataset.ry = "0";
      b.dataset.angle = (Math.random() * 360).toString();
      b.dataset.baseX = "0";
      b.dataset.baseY = "0";
    });

    let mouse = { x: 0, y: 0, px: 0, py: 0 };
    let currentMouse = { x: 0, y: 0 };
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      // Bound the mouse to the container so it works nicely when scrolled
      const rect = body.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      mouse.x = clientX / rect.width - 0.5;
      mouse.y = clientY / rect.height - 0.5;
      mouse.px = e.clientX; // For absolute distance, clientX is fine since berries use getBoundingClientRect
      mouse.py = e.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      const time = Date.now() * 0.001;
      currentMouse.x += (mouse.x - currentMouse.x) * 0.05;
      currentMouse.y += (mouse.y - currentMouse.y) * 0.05;

      if (modelViewer) {
        modelViewer.cameraOrbit = `${currentMouse.x * 40 + switchSpin}deg ${
          90 + currentMouse.y * 20
        }deg 380%`;
      }

      if (berriesFGRef.current) {
        berriesFGRef.current.style.transform = `translate(${
          currentMouse.x * 60
        }px, ${currentMouse.y * 60}px)`;
      }
      if (berriesBGRef.current) {
        berriesBGRef.current.style.transform = `translate(${
          currentMouse.x * -30
        }px, ${currentMouse.y * -30}px)`;
      }
      if (leavesBGRef.current) {
        leavesBGRef.current.style.transform = `translate(${
          currentMouse.x * -15
        }px, ${currentMouse.y * -15}px)`;
      }

      if (!isSwitching) {
        berries.forEach((berry, i) => {
          const berryRect = berry.getBoundingClientRect();
          const berryX = berryRect.left + berryRect.width / 2;
          const berryY = berryRect.top + berryRect.height / 2;

          const diffX = mouse.px - berryX;
          const diffY = mouse.py - berryY;
          const distance = Math.sqrt(diffX * diffX + diffY * diffY);

          let targetRx = 0,
            targetRy = 0,
            speedMult = 1;

          if (distance < 400) {
            const force = (400 - distance) / 400;
            targetRx = (diffX / distance) * force * -80;
            targetRy = (diffY / distance) * force * -80;
            speedMult = 1 + force * 5;
          }

          let rx = parseFloat(berry.dataset.rx || "0");
          let ry = parseFloat(berry.dataset.ry || "0");
          let angle = parseFloat(berry.dataset.angle || "0");
          let baseX = parseFloat(berry.dataset.baseX || "0");
          let baseY = parseFloat(berry.dataset.baseY || "0");

          rx += (targetRx - rx) * 0.1;
          ry += (targetRy - ry) * 0.1;
          angle += 0.2 * speedMult;

          berry.dataset.rx = rx.toString();
          berry.dataset.ry = ry.toString();
          berry.dataset.angle = angle.toString();

          const dur = [5, 7, 6, 8, 5.5, 6.5, 9, 11, 10][i % 9];
          const phase = (time + i * 0.7) * ((Math.PI * 2) / dur);
          const floatY = Math.sin(phase) * 15;
          const floatAngle = Math.cos(phase) * 6;

          berry.style.transform = `translate(calc(${
            rx + baseX
          }px), calc(${ry + baseY}px + ${floatY}px)) rotate(calc(${angle}deg + ${floatAngle}deg))`;
        });
      }

      document.querySelectorAll(".leaf").forEach((leaf: any, i) => {
        const dur = 10 + i * 2;
        const phase = (time + i * 1.2) * ((Math.PI * 2) / dur);
        const floatY = Math.sin(phase) * 20;
        const floatX = Math.cos(phase * 0.5) * 15;
        const floatAngle = Math.sin(phase * 0.3) * 15;
        leaf.style.transform = `translate(${floatX}px, ${floatY}px) rotate(${floatAngle}deg)`;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Bubble Generator
    const bubblesContainer = document.getElementById("bubbles-container");
    let bubbleInterval: any;
    if (bubblesContainer) {
      bubbleInterval = setInterval(() => {
        const bubble = document.createElement("img");
        bubble.src =
          "https://api.getlayers.ai/storage/v1/object/public/public/assets/soda-14ff8a788d/bubble.png";
        bubble.className = "bubble-img";
        const size = Math.random() * 20 + 10 + "px";
        bubble.style.width = size;
        bubble.style.height = "auto";
        bubble.style.left = Math.random() * 100 + "%";
        bubble.style.bottom = "-50px";
        bubble.style.opacity = (Math.random() * 0.4 + 0.2).toString();

        const duration = Math.random() * 6 + 4;
        bubble.style.animation = `floatUpImg ${duration}s linear forwards`;

        bubblesContainer.appendChild(bubble);
        setTimeout(() => bubble.remove(), duration * 1000);
      }, 400);
    }

    // Switch Logic listener is manually attached to cards in React, we'll expose a function
    (window as any).triggerFlavorSwitch = async (flavorTarget: "cream" | "brown") => {
      if (isSwitching) return;
      isSwitching = true;
      setFlavor(flavorTarget);

      const targetColors =
        flavorTarget === "brown"
          ? { inner: "#3E3025", mid: "#2D221A", outer: "#1E1610", text: "#ffffff", muted: "rgba(255, 255, 255, 0.7)", glassBg: "rgba(255, 255, 255, 0.05)", glassBorder: "rgba(255, 255, 255, 0.1)" }
          : { inner: "#ffffff", mid: "#F5E1D0", outer: "#EAD8C8", text: "#111111", muted: "rgba(17, 17, 17, 0.7)", glassBg: "rgba(255, 255, 255, 0.2)", glassBorder: "rgba(17, 17, 17, 0.1)" };

      gsap.to(body, {
        "--bg-inner": targetColors.inner,
        "--bg-mid": targetColors.mid,
        "--bg-outer": targetColors.outer,
        "--text-color": targetColors.text,
        "--muted-color": targetColors.muted,
        "--glass-bg": targetColors.glassBg,
        "--glass-border": targetColors.glassBorder,
        duration: 1.5,
        ease: "power2.inOut",
      });

      const spinObj = { val: 0, blur: 0 };
      gsap.to(spinObj, {
        val: 360,
        blur: 15,
        duration: 0.6,
        ease: "power2.in",
        onUpdate: () => {
          switchSpin = spinObj.val;
          modelViewer.style.filter = `blur(${spinObj.blur}px)`;
        },
        onComplete: async () => {
          if (flavorTarget === "brown") {
            body.classList.add("brown-theme");
            if (modelViewer.model) {
              modelViewer.model.materials.forEach((material: any) => {
                  material.pbrMetallicRoughness.setBaseColorFactor([0.96, 0.88, 0.81, 1]);
              });
            }
          } else {
            body.classList.remove("brown-theme");
            if (modelViewer.model) {
              modelViewer.model.materials.forEach((material: any) => {
                  material.pbrMetallicRoughness.setBaseColorFactor([0.11, 0.08, 0.06, 1]);
              });
            }
          }

          gsap.to(spinObj, {
            val: 720,
            blur: 0,
            duration: 1.5,
            ease: "back.out(0.7)",
            onUpdate: () => {
              switchSpin = spinObj.val;
              modelViewer.style.filter = `blur(${spinObj.blur}px)`;
            },
            onComplete: () => {
              switchSpin = 0;
              modelViewer.style.filter = "none";
            },
          });
        }
      });

      const heroCenter = document.querySelector(".hero-center") as HTMLElement;
      let completedBerries = 0;

      berries.forEach((berry: any) => {
        const bW = berry.offsetWidth / 2;
        const bH = berry.offsetHeight / 2;
        const centerX = window.innerWidth / 2 - berry.offsetLeft - bW;
        const centerY = window.innerHeight / 2 - berry.offsetTop - bH;

        const startAngle = parseFloat(berry.dataset.angle) || 0;
        const currentBaseX = parseFloat(berry.dataset.baseX) || 0;
        const currentBaseY = parseFloat(berry.dataset.baseY) || 0;

        const nextBaseX = (Math.random() - 0.5) * 200;
        const nextBaseY = (Math.random() - 0.5) * 200;

        gsap.set(berry, {
          rotation: startAngle,
          x: currentBaseX,
          y: currentBaseY,
        });

        const berryTl = gsap.timeline();

        berryTl
          .to(berry, {
            x: centerX,
            y: centerY,
            rotation: startAngle + 45,
            scale: 0.1,
            opacity: 0,
            duration: 0.5,
            ease: "power2.in",
            onComplete: () => {
              if (heroCenter) heroCenter.style.zIndex = "50";
            },
          })
          .to(berry, { duration: 0.3 })
          .to(berry, {
            onStart: () => {
              if (heroCenter) heroCenter.style.zIndex = "1";
            },
            x: nextBaseX,
            y: nextBaseY,
            rotation: startAngle + 90,
            scale: 1,
            opacity: 1,
            duration: 0.9,
            ease: "back.out(1.5)",
            onComplete: () => {
              berry.dataset.angle = (startAngle + 90).toString();
              berry.dataset.baseX = nextBaseX.toString();
              berry.dataset.baseY = nextBaseY.toString();
              berry.dataset.rx = "0";
              berry.dataset.ry = "0";

              completedBerries++;
              if (completedBerries === berries.length) {
                isSwitching = false;
              }
            },
          });
      });
    };

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      if (bubbleInterval) clearInterval(bubbleInterval);
      if (modelViewer) modelViewer.removeEventListener("load", loadTextures);
      delete (window as any).triggerFlavorSwitch;
    };
  }, { dependencies: [modelViewerLoaded], scope: containerRef });

  return (
    <div
      ref={containerRef}
      className={`animated-hero-wrapper ${flavor === "brown" ? "brown-theme" : ""}`}
    >
      <div id="bubbles-container"></div>

      <div className="hero-main-content">
        <div className="hero-inner-layout">
          <div className="leaves-container" ref={leavesBGRef}>
            <model-viewer
              className="leaf l1"
              src="https://api.getlayers.ai/storage/v1/object/public/public/assets/soda-14ff8a788d/leaves.glb"
              environment-image="neutral"
              exposure="1.0"
              interaction-prompt="none"
              camera-orbit="45deg 75deg 105%"
            ></model-viewer>
            <model-viewer
              className="leaf l2"
              src="https://api.getlayers.ai/storage/v1/object/public/public/assets/soda-14ff8a788d/leaves.glb"
              environment-image="neutral"
              exposure="1.0"
              interaction-prompt="none"
              camera-orbit="-30deg 60deg 105%"
            ></model-viewer>
            <model-viewer
              className="leaf l3"
              src="https://api.getlayers.ai/storage/v1/object/public/public/assets/soda-14ff8a788d/leaves.glb"
              environment-image="neutral"
              exposure="1.0"
              interaction-prompt="none"
              camera-orbit="120deg 85deg 105%"
            ></model-viewer>
            <model-viewer
              className="leaf l4"
              src="https://api.getlayers.ai/storage/v1/object/public/public/assets/soda-14ff8a788d/leaves.glb"
              environment-image="neutral"
              exposure="1.0"
              interaction-prompt="none"
              camera-orbit="10deg 45deg 105%"
            ></model-viewer>
          </div>

          <div className="hero-left">
            <h1 className="main-title large-animation-1">
              <span className="outline-text">CLEAN</span>
              <br />
              AESTHETIC
            </h1>
            <p className="hero-description">
              Elevate your streetwear game. <br />
              Premium heavyweight tees for the ultimate fit. <br />
              No cap, just pure drip.
            </p>
            <div className="cta-group">
              <button className="primary-btn" onClick={onStartClick}>
                Explore Catalog
                <span className="plus-icon">+</span>
              </button>
            </div>
            <div className="award-badge">
              <div className="award-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 15L15 18L19 14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M7 10L12 15L17 10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="award-text-col">
                <span className="award-title">FASHION AWARDS</span>
                <span className="award-subtitle">PREMIUM APPAREL 2025</span>
              </div>
            </div>
          </div>

          <div className="berries-container-bg" ref={berriesBGRef}>
            <img className="berry b7" src="/thread.svg" alt="thread" />
            <img className="berry b8" src="/thread.svg" alt="thread" />
            <img className="berry b9" src="/thread.svg" alt="thread" />
          </div>

          <div className="hero-center">
            {modelViewerLoaded && (
              <model-viewer
                id="product-model"
                src="/shirt_baked.glb"
                alt="Product 3D Model"
                camera-controls
                disable-zoom
                shadow-intensity="0"
                environment-image="neutral"
                exposure="1.5"
                interaction-prompt="none"
                camera-orbit="0deg 90deg 380%"
                field-of-view="30deg"
                className="main-product-3d"
              ></model-viewer>
            )}
          </div>

          <div className="berries-container" ref={berriesFGRef}>
            <img className="berry b1" src="/thread.svg" alt="thread" />
            <img className="berry b2" src="/thread.svg" alt="thread" />
            <img className="berry b3" src="/thread.svg" alt="thread" />
            <img className="berry b4" src="/thread.svg" alt="thread" />
            <img className="berry b5" src="/thread.svg" alt="thread" />
            <img className="berry b6" src="/thread.svg" alt="thread" />
          </div>

          <div className="hero-right">
            <div className="product-carousel">
              <div className="carousel-cards">
                <div
                  className={`flavor-card ${flavor === "cream" ? "active" : ""}`}
                  onClick={() => (window as any).triggerFlavorSwitch?.("cream")}
                >
                  <img
                    src="/brown_tee.png"
                    alt="Brown Tee"
                  />
                  <div className="card-info">
                    <span>Brown Tee</span>
                    <span>₹29.99</span>
                  </div>
                </div>
                <div
                  className={`flavor-card ${flavor === "brown" ? "active" : ""}`}
                  onClick={() => (window as any).triggerFlavorSwitch?.("brown")}
                >
                  <img
                    src="/cream_tee.png"
                    alt="Cream Tee"
                  />
                  <div className="card-info">
                    <span>Cream Tee</span>
                    <span>₹29.99</span>
                  </div>
                </div>
              </div>
            </div>
            <h2 className="side-title large-animation-1">
              <span className="outline-text">STREET</span>
              <br />
              ESSENTIALS
            </h2>
          </div>
        </div>
      </div>
      <div style={{ display: "none" }}>
        <model-viewer src="/shirt_baked.glb"></model-viewer>
      </div>
    </div>
  );
}
