/* Editable site content. Plain script (no modules, no fetch) so it works over file://.
   After editing, run: python3 ../tools/build_site.py  (re-renders index.html so the content also works without JS).
   Fields named "pending" are owner to-dos: never rendered. Gallery tiles render only with status "finished". */
window.PF_CONTENT = {
 "meta": {
  "lang": "en",
  "title": "Ihor Zaitsev — UI/UX Designer",
  "description": "Senior game and product UI/UX designer in Valencia. Modern Ops (100M+ downloads), Fire Strike and 20+ recent game projects. Open to senior and lead roles.",
  "og_image": "assets/og/og-card-v3.jpg",
  "og_image_alt": "Ihor Zaitsev, game and product UI/UX designer: Modern Ops interface",
  "site_url": "https://emthree.design/"
 },
 "person": {
  "name": "Ihor Zaitsev",
  "monogram": "IZ",
  "role": "Senior / Lead UI/UX Designer",
  "location": "Valencia, Spain",
  "photo": {
   "src": "assets/photo/ihor-zaitsev.webp",
   "w": 360,
   "h": 360,
   "alt": "Ihor Zaitsev"
  }
 },
 "hero": {
  "eyebrow": "Senior / Lead · Games & mobile products · Valencia, Spain · Remote or relocation",
  "titleLines": [
   "UI/UX",
   "Designer"
  ],
  "lede": "I’ve spent 9+ years designing interfaces people use every day, from mobile shooters with 100M+ downloads to onboarding and payment flows. Give me a brief with gaps and I’ll find what’s missing, design the flow and the final screens, and build a working prototype before production starts.",
  "proof": "Core and meta UI/UX for a mobile FPS with 100M+ downloads on Google Play.",
  "cta": {
   "label": "See the work",
   "href": "#works"
  },
  "cta2": {
   "label": "Download CV",
   "href": "assets/cv/Ihor_Zaitsev_CV_UIUX_Designer.pdf"
  },
  "scene": {
   "alt": "Looping illustration: a hiker in a cap and glasses and his small robot companion stand on a ledge above overgrown, flooded ruins."
  }
 },
 "works": {
  "title": "Selected work",
  "intro": "Two shipped shooters and my recent game projects. Most of my work is under NDA, so public games are shown with official publisher materials.",
  "projects": [
   {
    "id": "modern-ops",
    "size": "large",
    "title": "Modern Ops",
    "studio": "EDKON Games",
    "type": "Online mobile FPS · live product",
    "line": "Joined before launch to rebuild the interface, then owned UI/UX for core and meta. Pushed for the season pass that later went into every studio game.",
    "metrics": [
     "100M+ downloads on Google Play"
    ],
    "cover": {
     "src": "assets/works/modern-ops-cover.webp",
     "w": 1600,
     "h": 871,
     "alt": "Modern Ops key art: soldiers and the Modern Ops logo with the 100M+ downloads badge"
    },
    "case": {
     "lead": "Modern Ops is an online mobile FPS built around fast team battles. Players choose from a large arsenal of guns, customize their loadout, and play across several game modes and maps, with regular updates adding new content.",
     "sections": [
      {
       "h": "Context",
       "p": [
        "I joined before launch. The game was deep in production, and its UI had been shaped mostly by a 3D artist and a programmer. My first job was to rethink it as a dedicated UI/UX designer."
       ]
      },
      {
       "h": "My role",
       "p": [
        "I owned UI/UX across the game and over time moved into game and product decisions too: visual direction, player flows, game systems, retention features, balance and live updates."
       ]
      },
      {
       "h": "Challenge",
       "p": [
        "The game already worked, so every change had to make it clearer without breaking mechanics players knew or slowing the team down."
       ]
      },
      {
       "h": "What I changed",
       "ul": [
        "Reworked the visual direction and hierarchy.",
        "Rebuilt the lobby with fewer sub-pages.",
        "Improved flows and mobile usability.",
        "HUD, progression, weapons, shop, leaderboards, onboarding, combat UI, multiplayer.",
        "Kept iterating after launch."
       ]
      },
      {
       "h": "Season pass",
       "p": [
        "Few mobile shooters had a season pass back then, so I proposed one. Once it was approved, I designed the whole feature, from the reward track to the economy. Revenue and retention went up, a big share of players bought it every season, and the studio later added it to all its games, including World War 2 and Fire Strike."
       ]
      },
      {
       "h": "Systems & production",
       "p": [
        "I worked with developers through implementation and checked UI directly in Unity: assets, states, adaptive layouts, and practical fixes when design and tech didn’t match."
       ]
      },
      {
       "h": "Result",
       "p": [
        "Modern Ops became the studio’s most successful game, with 100M+ downloads on Google Play, and its season pass became the model for the studio’s other games."
       ]
      }
     ],
     "images": [
      {
       "src": "assets/works/modern-ops-01.webp",
       "w": 1276,
       "h": 1233,
       "alt": "Modern Ops — UI layout 1 of 8"
      },
      {
       "src": "assets/works/modern-ops-02.webp",
       "w": 1485,
       "h": 775,
       "alt": "Modern Ops — UI layout 2 of 8"
      },
      {
       "src": "assets/works/modern-ops-03.webp",
       "w": 1485,
       "h": 776,
       "alt": "Modern Ops — UI layout 3 of 8"
      },
      {
       "src": "assets/works/modern-ops-04.webp",
       "w": 1485,
       "h": 775,
       "alt": "Modern Ops — UI layout 4 of 8"
      },
      {
       "src": "assets/works/modern-ops-05.webp",
       "w": 1486,
       "h": 775,
       "alt": "Modern Ops — UI layout 5 of 8"
      },
      {
       "src": "assets/works/modern-ops-06.webp",
       "w": 1485,
       "h": 776,
       "alt": "Modern Ops — UI layout 6 of 8"
      },
      {
       "src": "assets/works/modern-ops-07.webp",
       "w": 1485,
       "h": 775,
       "alt": "Modern Ops — UI layout 7 of 8"
      },
      {
       "src": "assets/works/modern-ops-08.webp",
       "w": 1400,
       "h": 1270,
       "alt": "Modern Ops — UI layout 8 of 8"
      }
     ],
     "links": [
      {
       "label": "Google Play",
       "href": "https://play.google.com/store/apps/details?id=com.edkongames.mobs"
      },
      {
       "label": "App Store",
       "href": "https://apps.apple.com/us/app/modern-ops-online-shooter-fps/id1415791453"
      }
     ]
    }
   },
   {
    "id": "fire-strike",
    "size": "large",
    "title": "Fire Strike",
    "studio": "EDKON Games",
    "type": "5v5 mobile FPS · new title",
    "line": "Main design owner: UI/UX plus progression, economy, balance and the store.",
    "metrics": [
     "10M+ downloads on Google Play"
    ],
    "cover": {
     "src": "assets/works/fire-strike-cover-owner.webp",
     "w": 1020,
     "h": 553,
     "alt": "Fire Strike key art: two operators with rifles and the Fire Strike logo"
    },
    "case": {
     "lead": "Fire Strike is a 5v5 mobile FPS with short 5–7 minute matches. Players upgrade weapons and equipment, use tactical grenades, and play modes such as Team Fight, Free for All, Bomb Defuse, and Arms Race.",
     "sections": [
      {
       "h": "Context",
       "p": [
        "A new 5v5 shooter where I became the main design owner of the player experience."
       ]
      },
      {
       "h": "What I owned",
       "ul": [
        "UI/UX across the game.",
        "Core and meta systems.",
        "Progression and economy.",
        "Weapon balance.",
        "Store offers.",
        "Naming and content plan.",
        "Support after launch."
       ]
      },
      {
       "h": "Challenge",
       "p": [
        "I rarely got a ready feature to draw. Usually I had to understand the problem, decide how the system should work, and then make it clear for players and realistic for the team."
       ]
      },
      {
       "h": "Production",
       "p": [
        "Hands-on in Unity the whole time: testing, reviewing, preparing assets and states with the developers."
       ]
      },
      {
       "h": "What I learned",
       "p": [
        "UI is part of the game system. It’s tied to mechanics, progression, economy and what the team can actually build."
       ]
      },
      {
       "h": "Result",
       "p": [
        "Shipped, 10M+ downloads on Google Play."
       ]
      }
     ],
     "images": [
      {
       "src": "assets/works/fire-strike-01.webp",
       "w": 1304,
       "h": 1880,
       "alt": "Fire Strike — UI layout"
      }
     ],
     "links": [
      {
       "label": "Google Play",
       "href": "https://play.google.com/store/apps/details?id=com.edkongames.aurora"
      },
      {
       "label": "App Store",
       "href": "https://apps.apple.com/us/app/fire-strike-online-shooter/id1526289771"
      }
     ]
    },
    "flip": true
   }
  ],
  "recent": {
   "title": "Recent work · 2023–2026",
   "intro": "I worked on 20+ game and gamification projects in different genres and stages. In my last months I was Lead UI Designer for a team of 4–7 designers.",
   "intro2": "I made a starter UI template that 4–5 new projects grew from, set up regular design reviews, and designed lobby, HUD, rewards, onboarding and payment flows. I checked every release in the engine myself.",
   "items": [
    {
     "title": "MEGA Shoot",
     "year": "2026",
     "type": "Football gamification game",
     "role": "UI/UX of the game: player flow, screens, HUD, results, in-engine review.",
     "link": {
      "label": "Watch",
      "href": "https://www.youtube.com/watch?v=N12EkJwqJc8"
     },
     "preview": {
      "src": "assets/works/recent-preview-mega-shoot-1200.webp",
      "srcset": [
       [
        "assets/works/recent-preview-mega-shoot-640.webp",
        640
       ],
       [
        "assets/works/recent-preview-mega-shoot-1200.webp",
        1200
       ]
      ],
      "w": 1200,
      "h": 674,
      "play": true,
      "figma": "57:650 / 57:902"
     }
    },
    {
     "title": "Cash Clawee",
     "year": "2026",
     "type": "Mobile claw skill game",
     "role": "UI/UX from first concept to release and support. Mentored designers on the project.",
     "link": {
      "label": "cashclawee.com",
      "href": "https://cashclawee.com/"
     },
     "preview": {
      "src": "assets/works/recent-preview-cash-clawee-1200.webp",
      "srcset": [
       [
        "assets/works/recent-preview-cash-clawee-640.webp",
        640
       ],
       [
        "assets/works/recent-preview-cash-clawee-1200.webp",
        1200
       ]
      ],
      "w": 1200,
      "h": 674,
      "play": false,
      "figma": "57:650 / 57:921"
     }
    },
    {
     "title": "MEGA Clawee",
     "year": "2025",
     "type": "Online claw machine",
     "role": "UI/UX of the game.\nMentored designers on the project.",
     "link": {
      "label": "Watch",
      "href": "https://www.youtube.com/watch?v=jP32Xk6ixMo"
     },
     "preview": {
      "src": "assets/works/recent-preview-mega-clawee-1200.webp",
      "srcset": [
       [
        "assets/works/recent-preview-mega-clawee-640.webp",
        640
       ],
       [
        "assets/works/recent-preview-mega-clawee-1200.webp",
        1200
       ]
      ],
      "w": 1200,
      "h": 674,
      "play": true,
      "figma": "57:650 / 57:959"
     }
    },
    {
     "title": "Santa’s Slope",
     "year": "2024",
     "type": "Seasonal skill-based runner",
     "role": "HUD, start and offer screens, results and rewards, in-engine review.",
     "link": {
      "label": "Watch",
      "href": "https://www.youtube.com/watch?v=scew6-8ShlM"
     },
     "preview": {
      "src": "assets/works/recent-preview-santas-slope-1200.webp",
      "srcset": [
       [
        "assets/works/recent-preview-santas-slope-640.webp",
        640
       ],
       [
        "assets/works/recent-preview-santas-slope-1200.webp",
        1200
       ]
      ],
      "w": 1200,
      "h": 674,
      "play": true,
      "figma": "57:650 / 57:940"
     }
    }
   ],
   "cover": {
    "src": "assets/works/recent-cover.webp",
    "w": 1600,
    "h": 871,
    "alt": "Collage of recent game and gamification releases"
   },
   "images": [
    {
     "src": "assets/works/recent-cash-clawee-screens.webp",
     "w": 1567,
     "h": 979,
     "alt": "Cash Clawee app screens"
    },
    {
     "src": "assets/works/recent-mega-clawee.webp",
     "w": 1528,
     "h": 718,
     "alt": "MEGA Clawee on a phone"
    }
   ]
  },
  "concepts": [
   {
    "id": "monster-town",
    "size": "compact",
    "title": "Monster Town",
    "studio": "Concept",
    "type": "Blitz-MOBA concept · UI/UX direction",
    "line": "UI/UX direction, interaction flows, visual exploration and interactive prototyping for short multiplayer battles.",
    "metrics": [
     "Development stopped at gameplay prototyping"
    ],
    "cover": {
     "src": "assets/works/monster-town-cover.webp",
     "w": 1600,
     "h": 871,
     "alt": "Monster Town key art with the game logo and monster characters"
    },
    "case": {
     "lead": "Monster Town was a fast-paced Blitz-MOBA concept built around short multiplayer battles and character-driven combat.",
     "sections": [
      {
       "h": "My role",
       "p": [
        "I was responsible for the UI/UX direction, interaction flows, visual exploration, and interactive prototyping."
       ]
      },
      {
       "h": "Project status",
       "p": [
        "Development stopped during the gameplay prototyping stage, so the work shown here represents the UI/UX direction developed for the project."
       ]
      }
     ],
     "images": [
      {
       "src": "assets/works/monster-town-01.webp",
       "w": 1600,
       "h": 1600,
       "alt": "Monster Town — UI layout 1 of 3"
      },
      {
       "src": "assets/works/monster-town-02.webp",
       "w": 1600,
       "h": 1600,
       "alt": "Monster Town — UI layout 2 of 3"
      },
      {
       "src": "assets/works/monster-town-03.webp",
       "w": 1600,
       "h": 1600,
       "alt": "Monster Town — UI layout 3 of 3"
      }
     ],
     "links": []
    }
   }
  ],
  "pipeline": {
   "id": "ai-pipeline",
   "label": "Workflow case",
   "title": "My AI design pipeline",
   "lead": "A set of AI agents I built and keep tuning for design work. It gets me from an idea to a clickable prototype in hours, not days. The decisions stay mine.",
   "steps": [
    {
     "h": "Brief",
     "p": "I set the problem, references and limits."
    },
    {
     "h": "Explore",
     "p": "Agents suggest directions, I pick and fix."
    },
    {
     "h": "Build",
     "p": "Agents turn my design into a working prototype."
    },
    {
     "h": "Review",
     "p": "I check UX, details and edge cases, then iterate."
    }
   ],
   "sections": [
    {
     "h": "The problem",
     "p": [
      "A static mockup hides the hard parts: states, transitions, edge cases, how a screen feels in motion. A working prototype usually means waiting for a developer."
     ]
    },
    {
     "h": "What I built",
     "p": [
      "An agent setup for UI concepts, assets, prototypes and design review. Claude and Codex turn my designs into prototypes in code. The agents follow my design system and references, and I check every fact."
     ]
    },
    {
     "h": "Proof",
     "ul": [
      "This site. I set the art direction and checked every fact; the agents made the assets and wrote the code."
     ]
    },
    {
     "h": "What it changes",
     "p": [
      "We try ideas in motion before production, and developers get a working prototype instead of a pile of static screens."
     ]
    }
   ]
  }
 },
 "gallery": {
  "title": "Gallery",
  "intro": "Small studies in material, motion and interface detail, made with my AI-agent design pipeline. Concepts, not client work.",
  "tiles": [
   {
    "id": "g1",
    "title": "Glass chess — D · Glass",
    "label": "Concept · redesign study",
    "status": "placeholder"
   },
   {
    "id": "g2",
    "title": "Glass call-to-action",
    "label": "Material study",
    "status": "placeholder"
   },
   {
    "id": "g3",
    "title": "Study 03",
    "label": "AI-assisted study",
    "status": "placeholder"
   },
   {
    "id": "g4",
    "title": "Study 04",
    "label": "AI-assisted study",
    "status": "placeholder"
   },
   {
    "id": "g5",
    "title": "Study 05",
    "label": "AI-assisted study",
    "status": "placeholder"
   },
   {
    "id": "g6",
    "title": "Study 06",
    "label": "AI-assisted study",
    "status": "placeholder"
   }
  ],
  "showOnlyFinished": true
 },
 "about": {
  "title": "About",
  "intro": "I’m Ihor, originally from Kharkiv, Ukraine, now in Valencia. 9+ years in UI/UX, 8+ in games. I do the whole job: flows, visual design, prototypes, UI systems, and checking the build in the engine, on mobile and desktop, from early ideas to live games.",
  "principles": [
   {
    "h": "Design for the build",
    "p": "While I design a screen, I think about how it will be built: components, states, templates. It saves the team repeated work."
   },
   {
    "h": "UI is part of the game",
    "p": "Interface, mechanics, progression and economy affect each other, so I design them together."
   },
   {
    "h": "Don’t break what works",
    "p": "On a live game every change has to make things clearer without breaking what players already know."
   },
   {
    "h": "Agents for speed, me for decisions",
    "p": "AI helps me explore and prototype faster. What ships, and how good it is, is my call."
   }
  ],
  "experience": [
   {
    "years": "2023–2026",
    "company": "BrainRocket",
    "role": "Senior Game UI/UX Designer → Lead UI Designer",
    "note": "20+ projects · mobile & desktop"
   },
   {
    "years": "2018–2023",
    "company": "EDKON Games",
    "role": "Game UI/UX Designer / Game Designer",
    "note": "Modern Ops — 100M+ downloads · Fire Strike — 10M+ downloads"
   },
   {
    "years": "2017–2018",
    "company": "Fgfactory",
    "role": "UI/UX Designer",
    "note": "Desktop and mobile games and digital products"
   },
   {
    "years": "2017",
    "company": "Unit Space",
    "role": "UI/UX Designer",
    "note": "Web and mobile products"
   }
  ],
  "expertise": [
   "Game UI/UX",
   "UX flows",
   "Interaction design",
   "Visual design",
   "Prototyping",
   "UI systems",
   "Game systems",
   "Progression & economy",
   "Product thinking",
   "Live development",
   "Visual direction",
   "Leadership",
   "Mentoring",
   "AI-assisted design",
   "Product flows (onboarding, KYC, payments)"
  ],
  "tools": [
   "Figma",
   "Photoshop",
   "After Effects",
   "Unity",
   "Jira"
  ],
  "ai": "I also build AI-agent workflows that turn designs into working prototypes. This site is one of the results.",
  "languages": [
   "English — B2, professional & technical",
   "Ukrainian — fluent",
   "Russian — native"
  ],
  "beyond": "Outside games I’ve designed onboarding, verification and payment flows, where trust matters as much as looks.",
   "aiTools": [
   "Claude",
   "Codex",
   "ChatGPT",
   "Figma AI",
   "Midjourney",
   "Nano Banana",
   "Krea",
   "Firefly",
   "Runway",
   "Kling"
  ]
 },
 "contact": {
  "title": "Hiring a senior or lead UI/UX designer for a game or product team? Let’s talk.",
  "email": "ihor.zaitsev.kh@gmail.com",
  "links": [
   {
    "label": "LinkedIn",
    "href": "https://www.linkedin.com/in/ihor-zaitsev-6aa168103/"
   },
   {
    "label": "Telegram",
    "href": "https://t.me/emthree"
   }
  ],
  "cv": {
   "label": "Download CV",
   "href": "assets/cv/Ihor_Zaitsev_CV_UIUX_Designer.pdf",
   "size": "PDF · 70 KB"
  },
  "availability": "Based in Valencia (CET). Open to remote roles and relocation."
 },
 "footer": {
  "note": "Game screenshots are official materials from their publishers. Most project work is under NDA and can be discussed in interviews within confidentiality limits."
 },
 "proof": [
  {
   "value": "9+",
   "label": "years in UI/UX"
  },
  {
   "value": "30+",
   "label": "game projects"
  },
  {
   "value": "100M+",
   "label": "downloads (Modern Ops)"
  },
  {
   "value": "Lead",
   "label": "still hands-on"
  }
 ]
};
