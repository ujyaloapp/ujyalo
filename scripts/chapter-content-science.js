/* chapter-content-science.js
   SEE Grade 10 — Compulsory Science
   Based on CDC Nepal Grade 10 Science Textbook
   23 units grouped into 4 categories
   ============================================ */

const CHAPTER_CONTENT = {
  subject: 'science',
  label: 'Science',
  icon: '🔬',
  groups: [

    {
      name: 'Physics',
      icon: '⚡',
      chapters: [

        {
          name: 'Force',
          formulas: [
            'F = ma  (Newton\'s Second Law)',
            'W = mg  (Weight = mass × gravitational acceleration)',
            'p = mv  (Momentum = mass × velocity)',
            'g = 10 m/s² (gravitational acceleration on Earth)',
          ],
          mistakes: [
            'Mass is in kg, weight is in Newtons — they are not the same',
            'F = ma requires mass in kg and acceleration in m/s²',
            'Always find acceleration first before finding force',
          ],
          qs: [
            {
              q: "State Newton's First Law of Motion and give one real-life example.",
              a: "Newton's First Law (Law of Inertia): An object stays at rest or continues moving in a straight line at constant speed unless an unbalanced force acts on it.\n\nReal-life example: When a bus suddenly stops, passengers lurch forward. Their bodies were moving and want to keep moving — that's inertia.\n\nKey word: INERTIA — the tendency of an object to resist changes in its motion.",
              m: 2
            },
            {
              q: "State Newton's Second Law. A force of 20 N acts on a mass of 4 kg. Find the acceleration.",
              a: "Newton's Second Law: Force = mass × acceleration\nF = ma\n\nF = 20 N, m = 4 kg\na = F/m = 20/4 = 5 m/s²\n\nAcceleration = 5 m/s²\n\nThe bigger the force, the bigger the acceleration. The heavier the object, the smaller the acceleration for the same force.",
              m: 3
            },
            {
              q: "State Newton's Third Law of Motion and give one example.",
              a: "Newton's Third Law: For every action there is an equal and opposite reaction.\n\nExample: When you push against a wall (action), the wall pushes back on you with the same force (reaction). That's why your hand doesn't go through the wall.\n\nAnother example: A rocket pushes gases downward (action), gases push the rocket upward (reaction).",
              m: 2
            },
            {
              q: "A car of mass 1000 kg accelerates from rest to 20 m/s in 5 seconds. Find the force applied.",
              a: "First find acceleration:\na = (v - u) / t = (20 - 0) / 5 = 4 m/s²\n\nThen find force:\nF = ma = 1000 × 4 = 4000 N\n\nForce applied = 4000 N",
              m: 3
            },
            {
              q: "What is the difference between mass and weight?",
              a: "Mass:\n• Amount of matter in an object\n• Measured in kilograms (kg)\n• Same everywhere — doesn't change with location\n• Scalar quantity\n\nWeight:\n• Force of gravity on an object\n• Measured in Newtons (N)\n• Changes with location (less on moon, more on Jupiter)\n• Vector quantity\n• Formula: W = mg (where g = 10 m/s²)\n\nExample: A person of mass 60 kg has weight = 60 × 10 = 600 N on Earth.",
              m: 3
            },
          ]
        },

        {
          name: 'Pressure',
          formulas: [
            'P = F/A  (Pressure = Force / Area)',
            'P = hρg  (Liquid pressure = depth × density × g)',
            '1 atm = 101,325 Pa (atmospheric pressure at sea level)',
          ],
          mistakes: [
            'Smaller area = greater pressure for same force (knife vs flat stone)',
            'Liquid pressure depends on DEPTH not on the total volume of liquid',
            'Atmospheric pressure DECREASES with altitude — not increases',
          ],
          qs: [
            {
              q: "Define pressure and write its formula. A force of 50 N acts on an area of 2 m². Find the pressure.",
              a: "Pressure is the force acting per unit area.\n\nFormula: P = F/A\nP = Pressure (Pa or N/m²)\nF = Force (N)\nA = Area (m²)\n\nP = 50/2 = 25 Pa\n\nPressure = 25 Pascal\n\nSmaller area = greater pressure for the same force. That's why a knife cuts well (small area) but a flat stone doesn't.",
              m: 3
            },
            {
              q: "What is atmospheric pressure? What is its value at sea level?",
              a: "Atmospheric pressure is the pressure exerted by the weight of the air above us in the atmosphere.\n\nAt sea level: 1 atm = 101,325 Pa ≈ 101,300 Pa\n\nAs you go higher (like climbing a mountain), atmospheric pressure decreases because there is less air above you.\n\nExample: Water boils at lower temperature at high altitude because atmospheric pressure is lower.",
              m: 2
            },
            {
              q: "State Pascal's Law. Give one application.",
              a: "Pascal's Law: Pressure applied to an enclosed liquid is transmitted equally in all directions throughout the liquid.\n\nApplication: Hydraulic brakes in vehicles.\nWhen you press the brake pedal, pressure is transmitted through brake fluid equally to all wheels — stopping the car.\n\nOther applications: Hydraulic lift, hydraulic jack.",
              m: 3
            },
            {
              q: "Why do submarines and deep-sea divers experience very high pressure?",
              a: "Liquid pressure increases with depth.\n\nFormula: P = hρg\nh = depth, ρ = density of liquid, g = 10 m/s²\n\nThe deeper you go underwater, the more water is above you pressing down. A submarine at 100 m depth has enormous water pressure on all sides.\n\nThat's why submarines are built with very thick, strong walls to withstand this pressure.",
              m: 2
            },
          ]
        },

        {
          name: 'Energy',
          formulas: [
            'KE = ½mv²  (Kinetic Energy)',
            'PE = mgh  (Potential Energy)',
            'P = W/t  (Power = Work / time)',
            'W = F × d  (Work = Force × distance)',
            'Efficiency = (Useful output / Total input) × 100%',
          ],
          mistakes: [
            'KE depends on v² — doubling speed quadruples kinetic energy',
            'Power is in Watts (W) = Joules per second',
            'Energy is conserved — it changes form, never disappears',
          ],
          qs: [
            {
              q: "What is kinetic energy? Find the kinetic energy of a ball of mass 2 kg moving at 5 m/s.",
              a: "Kinetic energy is the energy possessed by an object due to its motion.\n\nFormula: KE = ½mv²\n\nKE = ½ × 2 × 5²\n= ½ × 2 × 25\n= 25 J\n\nKinetic energy = 25 Joules\n\nThe faster an object moves, the more kinetic energy it has. Doubling speed quadruples kinetic energy.",
              m: 2
            },
            {
              q: "A stone of mass 3 kg is held at a height of 10 m above the ground. Find its potential energy. (g = 10 m/s²)",
              a: "Potential energy is the energy stored in an object due to its position or height.\n\nFormula: PE = mgh\n\nPE = 3 × 10 × 10\n= 300 J\n\nPotential energy = 300 Joules\n\nWhen the stone falls, this potential energy converts to kinetic energy.",
              m: 2
            },
            {
              q: "State the Law of Conservation of Energy with an example.",
              a: "Law of Conservation of Energy: Energy cannot be created or destroyed. It can only be converted from one form to another. The total energy in a closed system remains constant.\n\nExample: A swinging pendulum\n• At the highest point: maximum PE, zero KE\n• At the lowest point: zero PE, maximum KE\n• Total energy (PE + KE) remains constant throughout\n\nEnergy just keeps changing form — it never disappears.",
              m: 3
            },
            {
              q: "What is power? A person does 600 J of work in 2 minutes. Find the power.",
              a: "Power is the rate of doing work — how fast work is done.\n\nFormula: P = W/t\n\nW = 600 J, t = 2 minutes = 120 seconds\n\nP = 600/120 = 5 W\n\nPower = 5 Watts\n\nUnit: Watt (W) = Joule per second",
              m: 3
            },
          ]
        },

        {
          name: 'Heat',
          formulas: [
            'Q = mcΔT  (Heat = mass × specific heat capacity × temperature change)',
            'Specific heat of water = 4200 J/kg°C',
            'K = °C + 273  (Kelvin = Celsius + 273)',
          ],
          mistakes: [
            'Heat and temperature are different — a swimming pool has more heat than a cup of boiling water',
            'Temperature stays CONSTANT during change of state (melting/boiling)',
            'Heat flows from HOT to COLD — never the reverse naturally',
          ],
          qs: [
            {
              q: "What is the difference between heat and temperature?",
              a: "Heat:\n• Total thermal energy in a substance\n• Depends on mass, temperature and type of material\n• Measured in Joules (J)\n• Heat flows from hot to cold\n\nTemperature:\n• Measure of how hot or cold something is\n• Measure of average kinetic energy of particles\n• Measured in °C or Kelvin (K)\n• Doesn't depend on mass\n\nExample: A cup of boiling water and a swimming pool at 25°C — the pool has more heat (more water) but the boiling water has higher temperature.",
              m: 3
            },
            {
              q: "What is specific heat capacity? Why does water have a high specific heat capacity and why is this important?",
              a: "Specific heat capacity is the amount of heat needed to raise the temperature of 1 kg of a substance by 1°C.\n\nWater has a very high specific heat capacity (4200 J/kg°C).\n\nWhy this is important:\n1. Oceans absorb huge amounts of heat without getting very hot — this regulates Earth's climate\n2. Water is used as a coolant in car engines and power stations\n3. Coastal areas have milder climates than inland areas",
              m: 3
            },
            {
              q: "Explain the three methods of heat transfer with one example each.",
              a: "1. Conduction — heat transfers through a solid by particle vibration\nExample: Metal spoon gets hot when placed in hot soup\n\n2. Convection — heat transfers through fluids (liquids/gases) by movement of particles\nExample: Hot air rises near a heater, cool air moves in to replace it — creating a convection current\n\n3. Radiation — heat transfers as electromagnetic waves without needing any medium\nExample: Heat from the Sun reaches Earth through empty space",
              m: 3
            },
            {
              q: "What happens to water when it is heated from 0°C to 100°C? Describe the changes.",
              a: "0°C: Ice melts to water (latent heat of fusion absorbed — temperature stays at 0°C during melting)\n\n0°C to 100°C: Water temperature rises. Water expands slightly.\n\nException: Between 0°C and 4°C, water contracts (gets denser). At 4°C water has maximum density.\n\n100°C: Water boils to steam (latent heat of vaporisation absorbed — temperature stays at 100°C during boiling)\n\nAbove 100°C: Steam temperature rises.",
              m: 3
            },
          ]
        },

        {
          name: 'Light',
          formulas: [
            '∠i = ∠r  (angle of incidence = angle of reflection)',
            'n = sin i / sin r  (refractive index)',
            'Speed of light = 3 × 10⁸ m/s',
            '1/f = 1/v + 1/u  (lens formula)',
          ],
          mistakes: [
            'Angles are always measured from the NORMAL, not from the surface',
            'Real image can be projected on screen — virtual image cannot',
            'Light bends TOWARDS normal going into denser medium',
          ],
          qs: [
            {
              q: "State the two laws of reflection of light.",
              a: "Law 1: The incident ray, the reflected ray and the normal at the point of incidence all lie in the same plane.\n\nLaw 2: The angle of incidence equals the angle of reflection.\n∠i = ∠r\n\nRemember: Angles are always measured from the NORMAL (a line perpendicular to the surface), not from the surface itself.",
              m: 2
            },
            {
              q: "What is refraction? State Snell's Law.",
              a: "Refraction is the bending of light when it passes from one transparent medium to another of different optical density.\n\nSnell's Law: n₁ sin θ₁ = n₂ sin θ₂\n\nWhere n = refractive index, θ = angle with the normal\n\nSimple rule:\n• Light going from less dense to more dense medium → bends towards normal\n• Light going from more dense to less dense medium → bends away from normal\n\nExample: A pencil looks bent when placed in a glass of water — this is refraction.",
              m: 3
            },
            {
              q: "What is total internal reflection? What is the critical angle?",
              a: "Total internal reflection occurs when light travels from a denser medium to a less dense medium at an angle greater than the critical angle. All the light reflects back — none passes through.\n\nCritical angle: The angle of incidence at which the refracted ray travels along the boundary (angle of refraction = 90°).\n\nApplications:\n• Optical fibres — used in internet cables and endoscopes\n• Diamonds sparkle due to total internal reflection\n• Periscopes and binoculars use prisms",
              m: 3
            },
            {
              q: "Differentiate between a real image and a virtual image.",
              a: "Real image:\n• Formed where light rays actually meet\n• Can be projected on a screen\n• Always inverted (upside down)\n• Formed by concave mirror or convex lens\n• Example: Image on a cinema screen\n\nVirtual image:\n• Formed where light rays appear to come from (don't actually meet)\n• Cannot be projected on a screen\n• Always erect (right side up)\n• Formed by plane mirror, convex mirror or concave lens\n• Example: Your reflection in a mirror",
              m: 3
            },
          ]
        },

        {
          name: 'Current Electricity and Magnetism',
          formulas: [
            'V = IR  (Ohm\'s Law)',
            'P = VI = I²R = V²/R  (Power)',
            'Series: R = R₁ + R₂ + R₃',
            'Parallel: 1/R = 1/R₁ + 1/R₂ + 1/R₃',
            'E = Pt  (Energy = Power × time)',
            '1 kWh = 3,600,000 J',
          ],
          mistakes: [
            'In parallel, total resistance is LESS than smallest individual resistor',
            'In series, current is same throughout — voltage divides',
            'In parallel, voltage is same throughout — current divides',
          ],
          qs: [
            {
              q: "State Ohm's Law and write its formula. A 6V battery is connected to a 3Ω resistor. Find the current.",
              a: "Ohm's Law: The current through a conductor is directly proportional to the voltage across it, provided temperature remains constant.\n\nFormula: V = IR\n\nV = 6V, R = 3Ω\nI = V/R = 6/3 = 2 A\n\nCurrent = 2 Amperes",
              m: 3
            },
            {
              q: "Three resistors of 4Ω, 6Ω and 12Ω are connected in parallel. Find the total resistance.",
              a: "For parallel resistors:\n1/R = 1/R₁ + 1/R₂ + 1/R₃\n\n1/R = 1/4 + 1/6 + 1/12\n\nCommon denominator = 12:\n= 3/12 + 2/12 + 1/12\n= 6/12 = 1/2\n\nR = 2Ω\n\nIn parallel, total resistance is always less than the smallest individual resistor.",
              m: 3
            },
            {
              q: "What is electromagnetic induction? State Faraday's Law.",
              a: "Electromagnetic induction is the production of electric current in a conductor when it moves through a magnetic field or when the magnetic field around it changes.\n\nFaraday's Law: The induced EMF in a coil is proportional to the rate of change of magnetic flux through the coil.\n\nApplications:\n• Electric generators — convert mechanical energy to electrical energy\n• Transformers — change voltage levels\n• Dynamos in bicycles\n\nThis is the principle behind how electricity is generated in power stations.",
              m: 3
            },
            {
              q: "What is the difference between AC and DC current?",
              a: "DC (Direct Current):\n• Current flows in one direction only\n• Constant voltage\n• Source: batteries, solar cells\n• Used in: torches, phones, laptops\n\nAC (Alternating Current):\n• Current changes direction periodically\n• Voltage alternates between positive and negative\n• Source: generators, power stations\n• Used in: homes, factories, most electrical appliances\n• In Nepal: 50 Hz (changes direction 50 times per second)\n\nAC is used for transmission because it can be easily stepped up or down using transformers.",
              m: 3
            },
          ]
        },

      ]
    },

    {
      name: 'Chemistry',
      icon: '🧪',
      chapters: [

        {
          name: 'Classification of Elements',
          formulas: [
            'Atomic number = number of protons',
            'Mass number = protons + neutrons',
            'Electrons in outer shell = group number (for main groups)',
            'Number of electron shells = period number',
          ],
          mistakes: [
            'Elements in same GROUP have similar properties — not same period',
            'Atomic number never changes for an element — it defines the element',
            'Metals are on the LEFT of the periodic table — non-metals on the RIGHT',
          ],
          qs: [
            {
              q: "What is the Modern Periodic Table? State the Modern Periodic Law.",
              a: "The Modern Periodic Table arranges all known elements in order of increasing atomic number in rows (periods) and columns (groups).\n\nModern Periodic Law: The physical and chemical properties of elements are a periodic function of their atomic numbers.\n\nThe table has:\n• 7 periods (horizontal rows)\n• 18 groups (vertical columns)\n• 118 elements currently known\n\nElements in the same group have similar chemical properties because they have the same number of electrons in their outer shell.",
              m: 3
            },
            {
              q: "What are metals, non-metals and metalloids? Give two examples of each.",
              a: "Metals:\n• Good conductors of heat and electricity\n• Shiny, malleable, ductile\n• Examples: Iron (Fe), Copper (Cu), Gold (Au)\n\nNon-metals:\n• Poor conductors (insulators)\n• Brittle, not shiny\n• Examples: Carbon (C), Sulphur (S), Oxygen (O)\n\nMetalloids (semi-metals):\n• Properties between metals and non-metals\n• Semi-conductors\n• Examples: Silicon (Si), Arsenic (As)\n\nMetalloids are extremely important in making computer chips and solar panels.",
              m: 3
            },
            {
              q: "What are alkali metals? Give three properties and two examples.",
              a: "Alkali metals are Group 1 elements in the periodic table.\n\nProperties:\n1. Very reactive — react vigorously with water\n2. Soft metals — can be cut with a knife\n3. Low density — lithium, sodium and potassium float on water\n4. Form hydroxides when reacting with water\n\nExamples:\n• Sodium (Na): 2Na + 2H₂O → 2NaOH + H₂\n• Potassium (K): reacts even more vigorously than sodium\n\nThey must be stored in oil to prevent reaction with air and moisture.",
              m: 3
            },
          ]
        },

        {
          name: 'Chemical Reaction',
          formulas: [
            'Reactants → Products',
            'Oxidation = loss of electrons / gain of oxygen',
            'Reduction = gain of electrons / loss of oxygen',
            'OIL RIG: Oxidation Is Loss, Reduction Is Gain (of electrons)',
          ],
          mistakes: [
            'Oxidation and reduction always happen TOGETHER in a redox reaction',
            'A catalyst speeds up reaction but is NOT used up',
            'Exothermic = heat OUT, Endothermic = heat IN',
          ],
          qs: [
            {
              q: "What is a chemical reaction? Write the word equation and balanced symbol equation for burning magnesium.",
              a: "A chemical reaction is a process where reactants are chemically changed into new substances called products with different properties.\n\nBurning magnesium:\nWord equation: Magnesium + Oxygen → Magnesium oxide\nSymbol equation: 2Mg + O₂ → 2MgO\n\nSigns of a chemical reaction:\n• Heat or light produced\n• Gas bubbles formed\n• Colour change\n• Precipitate formed\n• Cannot be easily reversed",
              m: 3
            },
            {
              q: "Differentiate between exothermic and endothermic reactions with one example each.",
              a: "Exothermic reaction:\n• Releases heat energy to surroundings\n• Surroundings get warmer\n• Example: Combustion (burning wood or fuel)\n  CH₄ + 2O₂ → CO₂ + 2H₂O + heat\n\nEndothermic reaction:\n• Absorbs heat energy from surroundings\n• Surroundings get cooler\n• Example: Photosynthesis\n  6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂\n\nMemory trick:\nexo = exit (heat exits the reaction)\nendo = enter (heat enters the reaction)",
              m: 3
            },
            {
              q: "What is oxidation and reduction? Give one example of each.",
              a: "Oxidation: gain of oxygen OR loss of hydrogen OR loss of electrons\nExample: 2Mg + O₂ → 2MgO (magnesium is oxidised — gains oxygen)\n\nReduction: loss of oxygen OR gain of hydrogen OR gain of electrons\nExample: CuO + H₂ → Cu + H₂O (copper oxide is reduced — loses oxygen)\n\nOIL RIG: Oxidation Is Loss (of electrons), Reduction Is Gain (of electrons)\n\nIn any redox reaction, oxidation and reduction always happen together.",
              m: 3
            },
            {
              q: "What is a catalyst? How does it affect a chemical reaction?",
              a: "A catalyst is a substance that speeds up a chemical reaction without being used up or permanently changed.\n\nHow it works:\n• Provides an alternative reaction pathway with lower activation energy\n• More molecules have enough energy to react\n• Reaction rate increases\n• Catalyst is recovered unchanged at the end\n\nExample: Manganese dioxide (MnO₂) as a catalyst in decomposition of hydrogen peroxide:\n2H₂O₂ → 2H₂O + O₂ (faster with MnO₂)\n\nIndustrial example: Iron catalyst in Haber process for making ammonia.",
              m: 3
            },
          ]
        },

        {
          name: 'Acid, Base and Salt',
          formulas: [
            'Acid + Base → Salt + Water  (neutralisation)',
            'Acid + Metal → Salt + Hydrogen gas',
            'Acid + Carbonate → Salt + Water + CO₂',
            'pH < 7 = acidic, pH = 7 = neutral, pH > 7 = alkaline',
          ],
          mistakes: [
            'pH decreases as acidity increases — lower pH = stronger acid',
            'Neutralisation always produces SALT and WATER',
            'Strong acid ≠ concentrated acid — they are different things',
          ],
          qs: [
            {
              q: "What is an acid? Give three properties and two examples.",
              a: "An acid is a substance that produces hydrogen ions (H⁺) when dissolved in water.\n\nProperties:\n1. Tastes sour (like lemon juice)\n2. Turns blue litmus paper RED\n3. pH less than 7\n4. Reacts with metals to produce hydrogen gas\n5. Reacts with bases to form salt and water\n\nExamples:\n• Hydrochloric acid (HCl) — in stomach\n• Sulphuric acid (H₂SO₄) — in car batteries\n• Acetic acid (CH₃COOH) — in vinegar\n\nNever taste acids in a laboratory!",
              m: 3
            },
            {
              q: "What is neutralisation? Write the word and symbol equation for the reaction between HCl and NaOH.",
              a: "Neutralisation is the reaction between an acid and a base to produce a salt and water. The resulting solution is neutral (pH 7).\n\nWord equation:\nHydrochloric acid + Sodium hydroxide → Sodium chloride + Water\n\nSymbol equation:\nHCl + NaOH → NaCl + H₂O\n\nAll neutralisation reactions:\nAcid + Base → Salt + Water\n\nReal-life example: Taking antacid tablets for indigestion — the base neutralises excess stomach acid.",
              m: 3
            },
            {
              q: "What is pH? What do pH values of 1, 7 and 14 indicate?",
              a: "pH is a scale from 0 to 14 that measures how acidic or alkaline a solution is.\n\npH 1: Strongly acidic (e.g. stomach acid, HCl)\npH 7: Neutral (pure water)\npH 14: Strongly alkaline (e.g. sodium hydroxide)\n\npH less than 7 = acidic\npH equal to 7 = neutral\npH greater than 7 = alkaline/basic\n\nAs pH decreases by 1, the solution is 10 times more acidic.\nIndicators like litmus paper or universal indicator are used to test pH.",
              m: 3
            },
          ]
        },

        {
          name: 'Some Gases',
          formulas: [
            'Oxygen test: relights a glowing splint',
            'Hydrogen test: squeaky pop with burning splint',
            'CO₂ test: turns lime water milky  Ca(OH)₂ + CO₂ → CaCO₃ + H₂O',
            'Ammonia test: turns damp red litmus paper blue',
          ],
          mistakes: [
            'Never confuse the tests — each gas has ONE specific test',
            'CO₂ does NOT support combustion — used in fire extinguishers',
            'Hydrogen is lighter than air — collected by downward displacement',
            'Oxygen is denser than air — collected by upward displacement',
          ],
          qs: [
            {
              q: "How is oxygen prepared in the laboratory? Write the equation.",
              a: "Oxygen is prepared by the decomposition of hydrogen peroxide using manganese dioxide as a catalyst.\n\n2H₂O₂ → 2H₂O + O₂ (with MnO₂ catalyst)\n\nCollection: By upward displacement of air (oxygen is denser than air) or over water.\n\nTest for oxygen: A glowing splint relights in oxygen — this is the standard test.\n\nProperties: Colourless, odourless, supports combustion, denser than air.",
              m: 3
            },
            {
              q: "How is hydrogen prepared in the laboratory? Write the equation and state its properties.",
              a: "Hydrogen is prepared by reacting zinc with dilute sulphuric acid.\n\nZn + H₂SO₄ → ZnSO₄ + H₂\n\nCollection: By downward displacement of air (hydrogen is lighter than air).\n\nTest for hydrogen: A burning splint produces a squeaky pop sound — this is the standard test.\n\nProperties:\n• Lightest gas\n• Colourless and odourless\n• Highly flammable\n• Burns to form water: 2H₂ + O₂ → 2H₂O",
              m: 3
            },
            {
              q: "How is carbon dioxide prepared in the laboratory? Write the equation and describe three properties.",
              a: "Carbon dioxide is prepared by reacting marble chips (calcium carbonate) with dilute hydrochloric acid.\n\nCaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂\n\nCollection: By upward displacement of air (CO₂ is denser than air).\n\nTest: Turns lime water milky — Ca(OH)₂ + CO₂ → CaCO₃ + H₂O\n\nProperties:\n1. Colourless, odourless gas\n2. Denser than air — sinks to the bottom\n3. Does not support combustion — used in fire extinguishers\n4. Turns lime water milky\n5. Greenhouse gas",
              m: 3
            },
          ]
        },

        {
          name: 'Metals',
          formulas: [
            'Reactivity series (most to least): K, Na, Ca, Mg, Al, Zn, Fe, Cu, Au',
            'More reactive metal displaces less reactive from solution',
            'Rusting: Fe + O₂ + H₂O → Fe₂O₃ (needs BOTH oxygen AND water)',
          ],
          mistakes: [
            'Rusting needs BOTH oxygen AND water — not just one of them',
            'More reactive metals are harder to extract from their ores',
            'Gold does not rust or corrode — it is the least reactive common metal',
          ],
          qs: [
            {
              q: "What is the reactivity series of metals? List five metals in order from most to least reactive.",
              a: "The reactivity series is a list of metals arranged in order of their reactivity, from most reactive to least reactive.\n\nFrom most to least reactive:\nPotassium (K) — most reactive\nSodium (Na)\nCalcium (Ca)\nMagnesium (Mg)\nAluminium (Al)\nZinc (Zn)\nIron (Fe)\nCopper (Cu)\nGold (Au) — least reactive\n\nMore reactive metals displace less reactive metals from their compounds.\nExample: Zn + CuSO₄ → ZnSO₄ + Cu (zinc displaces copper)",
              m: 3
            },
            {
              q: "What is corrosion? How can iron be protected from rusting?",
              a: "Corrosion is the slow destruction of a metal by chemical reaction with its environment.\n\nRusting of iron requires both oxygen AND water:\nIron + Oxygen + Water → Iron oxide (rust)\n\nPrevention methods:\n1. Painting — creates a barrier\n2. Oiling or greasing — prevents moisture contact\n3. Galvanising — coating with zinc (zinc is more reactive, protects iron)\n4. Tin plating — coating with tin\n5. Alloying — making stainless steel (iron + chromium + nickel)\n6. Electroplating — coating with another metal",
              m: 3
            },
            {
              q: "What is an alloy? Give two examples and explain why alloys are useful.",
              a: "An alloy is a mixture of two or more metals (or a metal with a non-metal) that has better properties than the pure metals alone.\n\nExample 1: Steel (iron + carbon)\n• Harder and stronger than pure iron\n• Used in construction, vehicles, tools\n\nExample 2: Brass (copper + zinc)\n• More resistant to corrosion than pure copper\n• Used in musical instruments, taps, fittings\n\nExample 3: Bronze (copper + tin)\n• Harder than copper\n• Used in medals, statues\n\nAlloys are useful because they combine the best properties of their component metals.",
              m: 3
            },
          ]
        },

        {
          name: 'Hydrocarbon and its Compounds',
          formulas: [
            'Alkanes: CₙH₂ₙ₊₂  (saturated — single bonds only)',
            'Alkenes: CₙH₂ₙ  (unsaturated — contain C=C double bond)',
            'Methane CH₄, Ethane C₂H₆, Propane C₃H₈, Butane C₄H₁₀',
            'Ethene C₂H₄, Propene C₃H₆',
            'Combustion: hydrocarbon + O₂ → CO₂ + H₂O',
          ],
          mistakes: [
            'Alkanes are saturated (single bonds) — alkenes are unsaturated (double bond)',
            'Test for alkene: decolourises bromine water — alkanes do NOT',
            'Complete combustion produces CO₂ and H₂O — incomplete produces CO (poisonous)',
          ],
          qs: [
            {
              q: "What are hydrocarbons? What is the difference between alkanes and alkenes?",
              a: "Hydrocarbons are organic compounds containing only carbon and hydrogen atoms.\n\nAlkanes:\n• Saturated hydrocarbons — contain only single bonds (C-C)\n• General formula: CₙH₂ₙ₊₂\n• Examples: Methane (CH₄), Ethane (C₂H₆), Propane (C₃H₈)\n• Less reactive\n• Used as fuels\n\nAlkenes:\n• Unsaturated hydrocarbons — contain at least one double bond (C=C)\n• General formula: CₙH₂ₙ\n• Examples: Ethene (C₂H₄), Propene (C₃H₆)\n• More reactive than alkanes\n• Used to make plastics (polymerisation)\n\nTest for alkene: Decolourises bromine water (alkanes do not).",
              m: 3
            },
            {
              q: "What is a homologous series? Write the first four members of the alkane series.",
              a: "A homologous series is a group of organic compounds with the same general formula, similar chemical properties and differ by a CH₂ unit.\n\nFirst four alkanes:\n1. Methane — CH₄ (natural gas, used for cooking)\n2. Ethane — C₂H₆\n3. Propane — C₃H₈ (LPG — used in gas cylinders)\n4. Butane — C₄H₁₀ (cigarette lighters)\n\nProperties of homologous series:\n• Same functional group\n• Similar chemical properties\n• Gradual change in physical properties (boiling point increases)\n• Each member differs by CH₂",
              m: 3
            },
            {
              q: "What is soap? How is it made? Explain how it cleans.",
              a: "Soap is a sodium or potassium salt of a long-chain fatty acid.\n\nMaking soap (Saponification):\nFat/Oil + NaOH (alkali) → Soap + Glycerol\n\nHow soap cleans:\nSoap molecules have two parts:\n1. Hydrophilic head — attracted to water\n2. Hydrophobic tail — attracted to grease/oil\n\nThe tails surround the grease droplet while the heads face outward toward water. This forms a structure called a micelle. The grease droplet is then carried away by water when rinsed.\n\nSoap doesn't work well in hard water because it forms scum.",
              m: 4
            },
          ]
        },

        {
          name: 'Materials Used in Daily Life',
          formulas: [
            'Saponification: Fat/Oil + NaOH → Soap + Glycerol',
            'Cement main component: Calcium silicate',
            'Concrete = Cement + Sand + Gravel + Water',
          ],
          mistakes: [
            'Thermoplastics can be remelted — thermosetting plastics cannot',
            'Soap does not work well in hard water — forms scum instead of lather',
            'Synthetic fibres are made from petroleum — natural fibres from plants/animals',
          ],
          qs: [
            {
              q: "What are polymers? Give two examples of natural and two of synthetic polymers.",
              a: "Polymers are large molecules made up of many small repeating units called monomers joined together in long chains.\n\nNatural polymers:\n• Starch — made of glucose units, found in food\n• Natural rubber — from rubber tree sap\n• Cellulose — in plant cell walls\n• Protein — made of amino acids\n\nSynthetic (man-made) polymers:\n• Polythene (polyethylene) — plastic bags\n• Nylon — clothing, ropes\n• PVC — pipes, flooring\n• Polystyrene — packaging material",
              m: 3
            },
            {
              q: "What is the difference between thermoplastics and thermosetting plastics? Give one example of each.",
              a: "Thermoplastics:\n• Soften when heated and can be reshaped\n• Can be recycled\n• Polymer chains are not cross-linked\n• Example: Polythene, PVC, nylon\n\nThermosetting plastics:\n• Harden permanently when heated — cannot be re-melted\n• Cannot be recycled easily\n• Polymer chains are cross-linked\n• Example: Bakelite (used in electrical fittings), melamine (used in crockery)\n\nThermoplastics are more environmentally friendly because they can be recycled.",
              m: 3
            },
            {
              q: "What is cement? Name the raw materials used and write its main component.",
              a: "Cement is a fine grey powder used as a binding material in construction.\n\nRaw materials:\n• Limestone (calcium carbonate) — main raw material\n• Clay\n• Gypsum (added to control setting time)\n\nMain component: Calcium silicate and calcium aluminate\n\nHow it works:\nWhen water is added to cement, a chemical reaction (hydration) occurs and it sets hard.\n\nConcrete = Cement + Sand + Gravel + Water\nReinforced concrete = Concrete + Steel rods (stronger)",
              m: 3
            },
          ]
        },

      ]
    },

    {
      name: 'Biology',
      icon: '🌿',
      chapters: [

        {
          name: 'Invertebrates',
          formulas: [
            'Invertebrates = animals WITHOUT a backbone',
            'Vertebrates = animals WITH a backbone',
            'Arthropoda = largest animal group (jointed legs, exoskeleton)',
            'Complete metamorphosis: Egg → Larva → Pupa → Adult',
            'Incomplete metamorphosis: Egg → Nymph → Adult',
          ],
          mistakes: [
            'Insects have 3 body parts and 6 legs — spiders have 2 parts and 8 legs',
            'Earthworms are Annelida not Arthropoda',
            'Complete metamorphosis has 4 stages — incomplete has 3',
          ],
          qs: [
            {
              q: "What are invertebrates? Name four major groups with one example of each.",
              a: "Invertebrates are animals without a backbone (vertebral column).\n\nThey make up about 97% of all animal species.\n\nMajor groups:\n1. Protozoa — single-celled animals (e.g. Amoeba, Plasmodium)\n2. Platyhelminthes — flatworms (e.g. Tapeworm, Planaria)\n3. Annelida — segmented worms (e.g. Earthworm, Leech)\n4. Arthropoda — jointed legs (e.g. Butterfly, Crab, Spider)\n5. Mollusca — soft body, often with shell (e.g. Snail, Octopus)\n\nArthropoda is the largest group in the animal kingdom.",
              m: 3
            },
            {
              q: "Describe the economic importance of earthworms.",
              a: "Earthworms are extremely important for agriculture and ecosystems:\n\n1. Soil aeration — burrowing creates tunnels allowing air into soil (roots need air)\n2. Soil drainage — tunnels allow water to drain properly\n3. Decomposition — break down dead organic matter into nutrients\n4. Soil fertility — excrete castings (vermicompost) which are rich in nutrients\n5. Mix soil layers — bring deeper soil to surface\n\nCharles Darwin called earthworms 'nature's ploughmen'.\n\nVermicomposting uses earthworms to produce organic fertiliser — very important in Nepal for farming.",
              m: 3
            },
            {
              q: "What is metamorphosis? Explain complete metamorphosis with an example.",
              a: "Metamorphosis is the process of transformation from an immature form to an adult form in distinct stages.\n\nComplete metamorphosis (4 stages) — example: Butterfly\n\n1. Egg → laid on leaves\n2. Larva (caterpillar) → hatches from egg, feeds and grows\n3. Pupa (chrysalis) → resting stage, major transformation happens inside\n4. Adult (butterfly) → emerges with wings, reproduces\n\nIncomplete metamorphosis (3 stages): Egg → Nymph → Adult\nExample: Grasshopper, Cockroach\n\nThe nymph looks like a small adult without wings.",
              m: 3
            },
          ]
        },

        {
          name: 'Human Nervous and Glandular Systems',
          formulas: [
            'Reflex arc: Stimulus → Receptor → Sensory nerve → Spinal cord → Motor nerve → Effector → Response',
            'CNS = Brain + Spinal cord',
            'PNS = All nerves outside CNS',
          ],
          mistakes: [
            'Reflex actions do NOT involve the brain — processed in spinal cord',
            'Endocrine glands are DUCTLESS — release hormones into bloodstream',
            'Insulin LOWERS blood sugar — glucagon RAISES blood sugar',
          ],
          qs: [
            {
              q: "What is the nervous system? Name its two main divisions.",
              a: "The nervous system is the body's communication network that receives information, processes it and coordinates responses.\n\nTwo main divisions:\n\n1. Central Nervous System (CNS):\n• Brain — control centre of the body\n• Spinal cord — connects brain to rest of body\n\n2. Peripheral Nervous System (PNS):\n• All nerves outside the brain and spinal cord\n• Carries messages to and from the CNS\n• Includes sensory nerves (carry messages TO brain) and motor nerves (carry messages FROM brain)",
              m: 3
            },
            {
              q: "What is a reflex action? Describe the reflex arc with an example.",
              a: "A reflex action is a rapid, automatic response to a stimulus that does not involve conscious thought.\n\nReflex arc — the pathway of a reflex:\nStimulus → Receptor → Sensory nerve → Spinal cord → Motor nerve → Effector → Response\n\nExample: Touching a hot object\n1. Heat (stimulus) detected by skin receptors\n2. Sensory nerve carries signal to spinal cord\n3. Spinal cord processes signal (no brain needed)\n4. Motor nerve sends signal to muscles\n5. Hand pulls away (response)\n\nReflex actions are faster than conscious actions because the signal doesn't need to travel to the brain first.",
              m: 3
            },
            {
              q: "What are endocrine glands? Name four endocrine glands and the hormones they produce.",
              a: "Endocrine glands are ductless glands that release hormones directly into the bloodstream.\n\n1. Pituitary gland — growth hormone, FSH, LH (master gland)\n2. Thyroid gland — thyroxine (controls metabolism and growth)\n3. Pancreas — insulin (lowers blood sugar), glucagon (raises blood sugar)\n4. Adrenal gland — adrenaline (fight or flight hormone)\n5. Testes — testosterone (male sex hormone)\n6. Ovaries — oestrogen, progesterone (female sex hormones)\n\nDiabetes is caused by insufficient insulin production by the pancreas.",
              m: 3
            },
          ]
        },

        {
          name: 'Blood Circulation in Human Body',
          formulas: [
            'Normal blood pressure = 120/80 mmHg',
            'Normal heart rate = 70 beats per minute',
            'Blood path: Body → Right Atrium → Right Ventricle → Lungs → Left Atrium → Left Ventricle → Body',
          ],
          mistakes: [
            'Left ventricle has thickest walls — pumps to whole body',
            'Right side of heart carries DEOXYGENATED blood',
            'Left side of heart carries OXYGENATED blood',
            'Arteries carry blood AWAY from heart — veins carry blood TOWARDS heart',
          ],
          qs: [
            {
              q: "Describe the structure and function of the human heart.",
              a: "The heart is a muscular pump that circulates blood throughout the body.\n\nStructure — 4 chambers:\n1. Right Atrium — receives deoxygenated blood from the body\n2. Right Ventricle — pumps blood to the lungs\n3. Left Atrium — receives oxygenated blood from the lungs\n4. Left Ventricle — pumps oxygenated blood to the body (thickest walls)\n\nValves prevent backflow of blood.\n\nBlood path:\nBody → Right Atrium → Right Ventricle → Lungs → Left Atrium → Left Ventricle → Body\n\nThe heart beats about 70 times per minute at rest.",
              m: 3
            },
            {
              q: "What are the components of blood and their functions?",
              a: "Blood has 4 main components:\n\n1. Red Blood Cells (Erythrocytes):\n• Carry oxygen (contain haemoglobin)\n• No nucleus\n• Biconcave disc shape\n\n2. White Blood Cells (Leucocytes):\n• Fight infection and disease\n• Produce antibodies\n• Some engulf bacteria (phagocytes)\n\n3. Platelets (Thrombocytes):\n• Help blood to clot\n• Prevent excessive bleeding\n\n4. Plasma:\n• Yellow liquid — 55% of blood\n• Carries dissolved substances (glucose, CO₂, hormones, proteins)\n• Transports heat",
              m: 3
            },
            {
              q: "What is blood pressure? What is normal blood pressure and what causes high blood pressure?",
              a: "Blood pressure is the force exerted by blood against the walls of blood vessels.\n\nNormal blood pressure: 120/80 mmHg\n• 120 = systolic pressure (when heart contracts)\n• 80 = diastolic pressure (when heart relaxes)\n\nHigh blood pressure (hypertension) causes:\n• Excess salt intake\n• Obesity\n• Stress\n• Lack of exercise\n• Smoking and alcohol\n• Genetic factors\n\nDangers of high blood pressure:\n• Heart attack\n• Stroke\n• Kidney damage\n\nLow blood pressure can cause dizziness and fainting.",
              m: 3
            },
          ]
        },

        {
          name: 'Chromosome and Sex Determination',
          formulas: [
            'Human body cells: 46 chromosomes = 23 pairs',
            'Gametes (sperm/egg): 23 chromosomes',
            'Female: XX, Male: XY',
            'Father determines sex: X sperm → girl (XX), Y sperm → boy (XY)',
          ],
          mistakes: [
            'Sex is determined by the FATHER not the mother',
            'Gametes have HALF the normal chromosome number (23 not 46)',
            'XX = female, XY = male — not the other way around',
          ],
          qs: [
            {
              q: "What are chromosomes? How many chromosomes do human body cells have?",
              a: "Chromosomes are thread-like structures found in the nucleus of cells, made of DNA and protein. They carry genetic information (genes).\n\nHuman body cells have 46 chromosomes = 23 pairs\n• 22 pairs = autosomes (non-sex chromosomes)\n• 1 pair = sex chromosomes (XX in female, XY in male)\n\nSperm and egg cells (gametes) have 23 chromosomes each (half the normal number) — so when they fuse, the fertilised egg has 46.\n\nDown syndrome occurs when a person has 47 chromosomes (an extra chromosome 21).",
              m: 3
            },
            {
              q: "How is the sex of a baby determined? Use a genetic cross to explain.",
              a: "Sex is determined by the sex chromosomes:\n• Female: XX\n• Male: XY\n\nThe father's sperm determines the sex of the baby:\n• Sperm carrying X chromosome + egg (X) = XX = Girl\n• Sperm carrying Y chromosome + egg (X) = XY = Boy\n\nGenetic cross:\nMother (XX) × Father (XY)\nEggs: X, X\nSperm: X, Y\n\nPossible combinations: XX, XX, XY, XY\n= 50% chance of girl, 50% chance of boy\n\nSo it is always the father who determines the sex of the child.",
              m: 4
            },
          ]
        },

        {
          name: 'Asexual and Sexual Reproduction',
          formulas: [
            'Asexual: 1 parent, no gametes, identical offspring (clones)',
            'Sexual: 2 parents, gametes fuse, genetically varied offspring',
            'Binary fission: 1 cell divides into 2 identical cells',
          ],
          mistakes: [
            'Asexual reproduction produces IDENTICAL offspring — sexual produces varied',
            'Variation from sexual reproduction is important for evolution',
            'Budding (yeast) and binary fission (bacteria) are both asexual',
          ],
          qs: [
            {
              q: "What is the difference between asexual and sexual reproduction?",
              a: "Asexual reproduction:\n• Involves only ONE parent\n• No fusion of gametes\n• Offspring are genetically identical to parent (clones)\n• Faster, requires less energy\n• Examples: Binary fission (bacteria), budding (yeast), spore formation (fungi)\n\nSexual reproduction:\n• Involves TWO parents\n• Fusion of male and female gametes\n• Offspring have genetic variation\n• Slower, requires more energy\n• Examples: Humans, animals, flowering plants\n\nGenetic variation in sexual reproduction is important for evolution and adaptation.",
              m: 3
            },
            {
              q: "Explain binary fission in Amoeba.",
              a: "Binary fission is a type of asexual reproduction where one organism divides into two identical daughter cells.\n\nSteps in Amoeba:\n1. Amoeba grows to full size\n2. DNA replicates (makes a copy of itself)\n3. Nucleus divides into two nuclei\n4. Cytoplasm divides\n5. Two identical Amoeba are formed\n\nThis is the simplest form of reproduction — very fast (can divide every 20 minutes in bacteria).\n\nBinary fission also occurs in bacteria, which is why bacterial infections spread so quickly.",
              m: 3
            },
          ]
        },

        {
          name: 'Artificial Vegetative Propagation',
          formulas: [
            'Methods: Cutting, Grafting, Layering, Budding',
            'Grafting: Scion (shoot) joined to Rootstock (rooted stem)',
            'All artificial propagation produces plants identical to parent',
          ],
          mistakes: [
            'Grafting combines TWO different plants — not one',
            'Vegetative propagation does not use seeds',
            'Cutting uses stem or leaf — not root (in most cases)',
          ],
          qs: [
            {
              q: "What is artificial vegetative propagation? Name four methods.",
              a: "Artificial vegetative propagation is the process by which humans deliberately grow new plants from vegetative parts (stem, root, leaf) of the parent plant without seeds.\n\nMethods:\n1. Cutting — a stem or leaf is cut and planted (e.g. rose, sugarcane)\n2. Grafting — joining a shoot of one plant to the root of another (e.g. mango, apple)\n3. Layering — bending a branch to touch soil until it grows roots (e.g. strawberry, jasmine)\n4. Budding — inserting a bud of one plant into the stem of another (e.g. rose)\n\nAdvantages:\n• Faster than growing from seeds\n• Produces plants identical to parent\n• Can combine best features of two plants (grafting)",
              m: 3
            },
            {
              q: "What is grafting? Explain with an example and state its advantages.",
              a: "Grafting is the joining of a shoot (scion) of one plant to the rooted stem (rootstock) of another plant so they grow together as one plant.\n\nExample: Apple tree grafting\n• Scion = shoot from a high-yield apple variety\n• Rootstock = disease-resistant apple tree\n• Result = plant that gives high yield AND resists disease\n\nAdvantages:\n1. Combines desirable traits of two varieties\n2. Produces fruit earlier than seed-grown plants\n3. Can grow varieties that don't thrive on their own roots\n4. Propagates plants that don't grow easily from cuttings\n\nUsed widely in Nepal for mango, citrus and apple production.",
              m: 3
            },
          ]
        },

        {
          name: 'Heredity',
          formulas: [
            'Dominant allele (capital letter) expressed over recessive (lowercase)',
            'Homozygous: AA or aa (two same alleles)',
            'Heterozygous: Aa (two different alleles)',
            'Phenotype = physical appearance, Genotype = genetic makeup',
            'Monohybrid cross: use Punnett square (2×2 grid)',
          ],
          mistakes: [
            'Dominant does not mean more common — just expressed over recessive',
            'Recessive trait is hidden in Aa — shown only in aa',
            'Two heterozygous parents (Aa × Aa) give 3:1 ratio (3 dominant : 1 recessive)',
          ],
          qs: [
            {
              q: "What is heredity? Define the terms gene, allele, dominant and recessive.",
              a: "Heredity is the passing of traits from parents to offspring through genes.\n\nKey terms:\nGene — a section of DNA that controls a specific characteristic (e.g. eye colour)\nAllele — different versions of the same gene (e.g. brown eye allele, blue eye allele)\nDominant allele — the allele that is expressed even when only one copy is present (written as capital letter, e.g. B)\nRecessive allele — the allele that is only expressed when two copies are present (written as lowercase, e.g. b)\n\nHomozygous = two identical alleles (BB or bb)\nHeterozygous = two different alleles (Bb)",
              m: 3
            },
            {
              q: "In pea plants, tall (T) is dominant over dwarf (t). Cross a homozygous tall plant (TT) with a dwarf plant (tt). What are the offspring?",
              a: "Parent cross: TT × tt\n\nGametes from TT: T, T\nGametes from tt: t, t\n\nPunnett square:\n        T    T\nt      Tt   Tt\nt      Tt   Tt\n\nAll offspring: Tt (heterozygous tall)\n\nF1 generation: 100% tall plants (Tt)\n\nAll offspring are tall because T is dominant — even one T allele is enough to show the tall trait.\n\nThis follows Mendel's Law of Dominance.",
              m: 4
            },
          ]
        },

        {
          name: 'Environmental Pollution and Management',
          formulas: [
            'Greenhouse gases: CO₂, CH₄, N₂O, water vapour, CFCs',
            'Ozone formula: O₃',
            'pH of acid rain < 5.6 (normal rain pH ≈ 5.6)',
          ],
          mistakes: [
            'Greenhouse effect is NATURAL and necessary — enhanced greenhouse effect causes climate change',
            'Ozone layer is in the STRATOSPHERE not the troposphere',
            'CFCs destroy ozone — not CO₂',
          ],
          qs: [
            {
              q: "What is environmental pollution? Name the four main types.",
              a: "Environmental pollution is the introduction of harmful substances or energy into the environment that causes damage to living organisms and ecosystems.\n\nFour main types:\n1. Air pollution — harmful gases and particles in the air (CO₂, SO₂, smoke)\n2. Water pollution — harmful substances in water bodies (sewage, chemicals, oil)\n3. Land/Soil pollution — harmful substances on land (plastic, pesticides, heavy metals)\n4. Noise pollution — excessive or harmful sound (traffic, machinery, loud music)\n\nNepal faces serious air pollution in Kathmandu Valley due to vehicles, brick kilns and waste burning.",
              m: 3
            },
            {
              q: "What is the greenhouse effect? How does it lead to global warming?",
              a: "The greenhouse effect:\n1. Sunlight passes through the atmosphere and warms the Earth's surface\n2. Earth re-emits heat as infrared radiation\n3. Greenhouse gases (CO₂, CH₄, water vapour) trap some of this heat\n4. This natural process keeps Earth warm enough for life\n\nGlobal warming occurs when:\n• Human activities increase greenhouse gas levels\n• More heat is trapped than normal\n• Earth's average temperature rises\n\nCauses: Burning fossil fuels, deforestation, industry, agriculture\n\nEffects: Melting glaciers, rising sea levels, extreme weather, loss of biodiversity\n\nNepal is extremely vulnerable — Himalayan glaciers are melting rapidly.",
              m: 3
            },
            {
              q: "What is biodiversity? Why is it important to conserve it?",
              a: "Biodiversity is the variety of all living organisms — plants, animals, fungi and microorganisms — in an area or on Earth.\n\nWhy conservation is important:\n1. Ecosystem stability — each species plays a role; losing one disrupts the whole system\n2. Food security — wild varieties of crops are needed for breeding new disease-resistant varieties\n3. Medicine — many drugs come from plants and animals\n4. Economic value — tourism, forestry, fisheries\n5. Cultural and spiritual value\n\nNepal is one of the world's most biodiverse countries:\n• Over 5,000 plant species\n• 800+ bird species\n• Home to Bengal tiger, snow leopard, one-horned rhinoceros\n\nThreats: Habitat destruction, poaching, climate change, pollution.",
              m: 3
            },
          ]
        },

      ]
    },

    {
      name: 'Astronomy & Geology',
      icon: '🌍',
      chapters: [

        {
          name: 'History of the Earth',
          formulas: [
            'Age of Earth ≈ 4.6 billion years',
            'Rock types: Igneous (from magma), Sedimentary (from sediments), Metamorphic (heat + pressure)',
            'Igneous: Granite (slow) and Basalt (fast cooling)',
          ],
          mistakes: [
            'Sedimentary rocks often contain fossils — igneous and metamorphic rarely do',
            'Metamorphic rocks are CHANGED existing rocks — not new from magma',
            'Fossils form in SEDIMENTARY rocks as layers build up over time',
          ],
          qs: [
            {
              q: "What is the age of the Earth and how was it formed?",
              a: "The Earth is approximately 4.6 billion years old.\n\nFormation:\n1. About 4.6 billion years ago, a cloud of gas and dust (nebula) in space began to collapse under gravity\n2. Most material formed the Sun\n3. Remaining material clumped together to form the planets, including Earth\n4. Early Earth was very hot — covered in molten rock\n5. Over millions of years it cooled, forming a solid crust\n6. Oceans formed from water vapour released by volcanoes and from comets\n7. First simple life appeared about 3.5 billion years ago",
              m: 3
            },
            {
              q: "What is the rock cycle? Name and describe three types of rocks.",
              a: "The rock cycle is the continuous process by which rocks are formed, broken down and reformed over millions of years.\n\nThree types of rocks:\n\n1. Igneous rocks:\n• Formed from cooled magma or lava\n• Example: Granite (slow cooling, large crystals), Basalt (fast cooling, small crystals)\n\n2. Sedimentary rocks:\n• Formed from compressed sediments (sand, mud, shells)\n• Often contain fossils\n• Example: Limestone, Sandstone, Coal\n\n3. Metamorphic rocks:\n• Formed when existing rocks are changed by heat and pressure\n• Example: Marble (from limestone), Slate (from shale)",
              m: 3
            },
            {
              q: "What are fossils? How do they help us understand the history of life on Earth?",
              a: "Fossils are preserved remains or traces of ancient organisms found in rocks.\n\nHow fossils form:\n1. Organism dies and is buried in sediment\n2. Soft parts decay, hard parts (bones, shells) remain\n3. Sediment hardens into rock over millions of years\n4. Hard parts are replaced by minerals\n5. Erosion eventually exposes the fossil\n\nWhat fossils tell us:\n• Evidence that life has existed on Earth for billions of years\n• Show how organisms have evolved over time\n• Help determine the age of rock layers\n• Reveal ancient climates and environments\n• Provide evidence for Darwin's theory of evolution",
              m: 3
            },
          ]
        },

        {
          name: 'Climate Change and Atmosphere',
          formulas: [
            'Atmosphere layers (low to high): Troposphere, Stratosphere, Mesosphere, Thermosphere, Exosphere',
            'Ozone layer: in the Stratosphere (15–35 km)',
            'CFCs destroy ozone: CF₂Cl₂ → Cl• (chlorine radical attacks ozone)',
          ],
          mistakes: [
            'Weather occurs in TROPOSPHERE — ozone layer is in STRATOSPHERE',
            'Ozone depletion ≠ greenhouse effect — they are different problems',
            'Montreal Protocol addressed ozone — Kyoto Protocol addressed CO₂',
          ],
          qs: [
            {
              q: "Describe the layers of the Earth's atmosphere.",
              a: "The atmosphere has five main layers (from lowest to highest):\n\n1. Troposphere (0–12 km):\n• Where all weather occurs\n• Temperature decreases with height\n• Contains most of the air we breathe\n\n2. Stratosphere (12–50 km):\n• Contains the ozone layer (absorbs UV radiation)\n• Temperature increases with height\n\n3. Mesosphere (50–80 km):\n• Meteors burn up here\n• Coldest layer\n\n4. Thermosphere (80–700 km):\n• Very thin air, very high temperatures\n• Aurora borealis occurs here\n\n5. Exosphere (700+ km):\n• Merges into outer space\n• Satellites orbit here",
              m: 3
            },
            {
              q: "What is the ozone layer? Why is its depletion a serious problem?",
              a: "The ozone layer is a region in the stratosphere (15–35 km above Earth) where ozone (O₃) is concentrated.\n\nFunction: Absorbs harmful ultraviolet (UV) radiation from the Sun.\n\nDepletion:\n• CFCs (chlorofluorocarbons) from old refrigerators, aerosols destroy ozone\n• Each CFC molecule can destroy thousands of ozone molecules\n\nEffects of ozone depletion:\n1. Increased UV radiation reaches Earth\n2. Increased skin cancer and eye cataracts in humans\n3. Damage to marine ecosystems (phytoplankton)\n4. Reduced crop yields\n\nSolution: Montreal Protocol (1987) — international agreement to phase out CFCs. The ozone layer is slowly recovering.",
              m: 3
            },
            {
              q: "What are the effects of climate change on Nepal?",
              a: "Nepal is one of the most vulnerable countries to climate change despite contributing very little to greenhouse gas emissions.\n\nEffects on Nepal:\n\n1. Glacial retreat:\n• Himalayan glaciers are melting rapidly\n• Glacial Lake Outburst Floods (GLOFs) are increasing\n• Long-term threat to water supply for millions\n\n2. Changes in rainfall:\n• Unpredictable monsoons\n• More intense floods and longer droughts\n• Damage to agriculture\n\n3. Rising temperatures:\n• Crops and vegetation shifting to higher altitudes\n• Some areas becoming too hot or dry for traditional crops\n\n4. Biodiversity loss:\n• Species forced to move to higher altitudes\n• Some cannot adapt and go extinct",
              m: 3
            },
          ]
        },

        {
          name: 'The Earth in the Universe',
          formulas: [
            'Planets in order: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune',
            'Earth rotation (day/night) = 24 hours',
            'Earth revolution (year) = 365.25 days',
            'Speed of light = 3 × 10⁸ m/s',
            '1 light year = distance light travels in one year',
          ],
          mistakes: [
            'Seasons are caused by Earth\'s AXIAL TILT — not distance from Sun',
            'Day and night caused by Earth\'s ROTATION — seasons by REVOLUTION',
            'The Sun is a STAR not a planet',
          ],
          qs: [
            {
              q: "Describe the structure of the Solar System.",
              a: "The Solar System consists of the Sun and everything that orbits it.\n\nThe Sun:\n• A star at the centre — provides light and heat\n• Contains 99.8% of the Solar System's mass\n\nEight planets (in order from the Sun):\n1. Mercury\n2. Venus\n3. Earth\n4. Mars\n— Asteroid belt —\n5. Jupiter (largest)\n6. Saturn (has rings)\n7. Uranus\n8. Neptune\n\nOther objects:\n• Dwarf planets (e.g. Pluto)\n• Moons — natural satellites of planets\n• Asteroids — rocky objects mainly between Mars and Jupiter\n• Comets — icy bodies with tails when near the Sun",
              m: 3
            },
            {
              q: "What is a galaxy? Describe the Milky Way.",
              a: "A galaxy is a massive system of stars, gas, dust and dark matter held together by gravity.\n\nThe Milky Way:\n• Our galaxy — the Solar System is part of it\n• Contains approximately 200–400 billion stars\n• Spiral galaxy shape (like a pinwheel)\n• Diameter: about 100,000 light years\n• The Solar System is located in one of the spiral arms, about 26,000 light years from the centre\n\nScale of the universe:\n• The universe contains over 2 trillion galaxies\n• Light from the nearest star (Proxima Centauri) takes 4.2 years to reach Earth\n• The observable universe is about 93 billion light years in diameter",
              m: 3
            },
            {
              q: "What causes day and night, and what causes the seasons?",
              a: "Day and Night:\n• Caused by Earth's rotation on its own axis\n• Earth rotates once every 24 hours\n• The side facing the Sun has day; the opposite side has night\n\nSeasons:\n• Caused by Earth's revolution around the Sun AND Earth's axial tilt (23.5°)\n• NOT caused by distance from the Sun\n\nWhen Nepal tilts towards the Sun (June):\n• Northern hemisphere summer\n• Days are longer, Sun is higher in sky\n• More direct sunlight = warmer\n\nWhen Nepal tilts away from the Sun (December):\n• Northern hemisphere winter\n• Days are shorter, Sun is lower in sky\n• Less direct sunlight = cooler",
              m: 3
            },
          ]
        },

      ]
    },

  ]
};
