/* ============================================================
   chapter-content-science.js
   SEE Science — all chapters with descriptive model answers
   ============================================================ */
const CHAPTER_CONTENT = {
  subject: 'science',
  label: 'Science',
  icon: '🔬',
  chapters: [
    { name:'Electricity', qs:[
      {
        q:"State Ohm's Law and write its formula.",
        a:"Ohm's Law: The current flowing through a conductor is directly proportional to the voltage across it, provided the temperature remains constant.\n\nFormula: V = IR\nWhere:\nV = Voltage (volts)\nI = Current (amperes)\nR = Resistance (ohms)\n\n✓ This means if you double the voltage, the current doubles. If you double the resistance, the current halves.",
        m:2
      },
      {
        q:'Three resistors of 2Ω, 3Ω and 6Ω are connected in parallel. Find the total resistance.',
        a:'For resistors in parallel, use:\n1/R = 1/R₁ + 1/R₂ + 1/R₃\n\n1/R = 1/2 + 1/3 + 1/6\n\nConvert to same denominator (6):\n= 3/6 + 2/6 + 1/6\n= 6/6\n= 1\n\nR = 1Ω\n\n✓ Key concept: In a parallel circuit, the total resistance is ALWAYS less than the smallest individual resistance. Here the smallest is 2Ω and the total is 1Ω — this makes sense.',
        m:3
      },
      {
        q:'A current of 3A flows through a resistor of 10Ω. Find the voltage across it.',
        a:"Using Ohm's Law: V = IR\nV = 3 × 10\nV = 30 V\n\n✓ Always identify which quantity you need (V, I or R), then rearrange the formula:\nV = IR\nI = V/R\nR = V/I",
        m:2
      },
      {
        q:'Find the power consumed by a bulb connected to 220V with a current of 0.5A.',
        a:'Formula: P = VI\nP = 220 × 0.5\nP = 110 W\n\n✓ Power is measured in watts (W). A 110W bulb consumes 110 joules of energy every second.\n\nOther useful power formulas:\nP = I²R\nP = V²/R',
        m:2
      },
      {
        q:'A 60W bulb is used for 5 hours daily. Calculate the energy consumed in one week (in kWh).',
        a:'Energy per day = Power × Time\n= 60 W × 5 hours\n= 300 Wh\n\nEnergy per week = 300 × 7\n= 2100 Wh\n\nConvert to kWh (divide by 1000):\n= 2100 / 1000\n= 2.1 kWh\n\n✓ Your electricity bill is measured in kWh (kilowatt-hours). 1 kWh is the energy used by a 1000W device in 1 hour.',
        m:4
      },
    ]},
    { name:'Light & Optics', qs:[
      {
        q:'State the two laws of reflection of light.',
        a:'First Law: The incident ray, the reflected ray and the normal at the point of incidence all lie in the same plane.\n\nSecond Law: The angle of incidence is equal to the angle of reflection.\n∠i = ∠r\n\n✓ Remember: angles are always measured from the NORMAL (a line perpendicular to the mirror), not from the mirror surface itself.',
        m:2
      },
      {
        q:'Define refraction of light. What happens to light when it moves from water to air?',
        a:'Refraction: The bending of light as it passes from one transparent medium to another of different optical density.\n\nWhen light moves from water to air:\n• It moves from a denser medium to a less dense medium\n• It speeds up\n• It bends AWAY from the normal\n• The angle of refraction is GREATER than the angle of incidence\n\n✓ Simple rule:\nDenser to less dense → bends away from normal\nLess dense to denser → bends towards normal',
        m:2
      },
      {
        q:'What is the difference between a real image and a virtual image? Give one example of each.',
        a:'Real image:\n• Formed when light rays actually converge (meet)\n• Can be projected onto a screen\n• Always inverted (upside down)\n• Example: Image on a cinema screen formed by a projector lens\n\nVirtual image:\n• Formed where light rays appear to come from (they do not actually meet)\n• Cannot be projected onto a screen\n• Always erect (right way up)\n• Example: Your reflection in a plane mirror\n\n✓ The simplest test: if you can catch the image on paper, it is real. If you cannot, it is virtual.',
        m:2
      },
    ]},
    { name:'Force & Motion', qs:[
      {
        q:"State Newton's First Law of Motion. Give one real-life example.",
        a:"Newton's First Law (Law of Inertia):\nAn object at rest stays at rest, and an object in motion stays in motion at the same speed and direction, unless acted upon by an unbalanced external force.\n\nReal-life example:\nWhen a bus stops suddenly, passengers lurch forward. Their bodies were in motion and tend to continue moving forward — this is inertia in action.\n\n✓ Inertia is the resistance of an object to changes in its state of motion. Heavier objects have more inertia.",
        m:2
      },
      {
        q:'What is the difference between speed and velocity?',
        a:'Speed:\n• Distance travelled per unit time\n• Scalar quantity — only has magnitude, no direction\n• Formula: speed = distance / time\n• Example: "The car travels at 60 km/h"\n\nVelocity:\n• Displacement per unit time\n• Vector quantity — has both magnitude AND direction\n• Formula: velocity = displacement / time\n• Example: "The car travels at 60 km/h northward"\n\n✓ Key difference: Two cars can have the same speed but different velocities if they are going in different directions.',
        m:2
      },
      {
        q:'A ball of mass 2 kg is moving at 5 m/s. Find its momentum.',
        a:'Formula: p = mv\nWhere p = momentum, m = mass, v = velocity\n\np = 2 × 5\np = 10 kg m/s\n\n✓ Momentum is a vector quantity — it has direction. A heavier object or a faster object has more momentum and is harder to stop.',
        m:2
      },
      {
        q:'A car accelerates from rest to 20 m/s in 4 seconds. Find the acceleration and the force if the mass is 1000 kg.',
        a:'Part 1: Find acceleration\nFormula: a = (v − u) / t\nu = 0 (starts from rest), v = 20 m/s, t = 4 s\n\na = (20 − 0) / 4\na = 5 m/s²\n\nPart 2: Find force\nFormula: F = ma\nF = 1000 × 5\nF = 5000 N\n\n✓ Always solve in steps. Find what you can first, then use it to find the next unknown.',
        m:4
      },
    ]},
    { name:'Chemical Reactions', qs:[
      {
        q:'What is a chemical reaction? Give one example with a word equation.',
        a:'A chemical reaction is a process in which reactants are chemically changed into new substances called products. The products have different properties from the original reactants.\n\nExample — Rusting of iron:\nIron + Oxygen + Water → Iron oxide (rust)\n\nSigns that a chemical reaction has occurred:\n• Change in colour\n• Production of gas (bubbles)\n• Release of heat or light\n• Formation of a precipitate\n\n✓ Unlike a physical change, a chemical reaction cannot be easily reversed.',
        m:2
      },
      {
        q:'Differentiate between exothermic and endothermic reactions with one example each.',
        a:'Exothermic reaction:\n• Releases heat energy to the surroundings\n• Surroundings feel warmer\n• Example: Combustion (burning wood or fuel)\n  Wood + Oxygen → Carbon dioxide + Water + HEAT\n\nEndothermic reaction:\n• Absorbs heat energy from the surroundings\n• Surroundings feel cooler\n• Example: Photosynthesis\n  CO₂ + Water + LIGHT ENERGY → Glucose + Oxygen\n\n✓ Memory trick:\nexo = exit (heat exits to surroundings)\nendo = enter (heat enters the reaction)',
        m:2
      },
      {
        q:'Explain what happens when iron is exposed to moist air. Write the word equation.',
        a:'When iron is exposed to moist air, it undergoes a slow oxidation reaction called rusting.\n\nConditions needed: Both oxygen AND water (moisture) must be present. Iron does not rust in dry air or in water without dissolved oxygen.\n\nWord equation:\nIron + Oxygen + Water → Iron(III) oxide (rust)\n\nRusting is harmful because:\n• It weakens structures (bridges, machines)\n• It is very difficult to reverse\n\nPrevention methods:\n• Painting\n• Oiling or greasing\n• Galvanising (coating with zinc)\n• Using stainless steel',
        m:2
      },
    ]},
    { name:'Acids & Bases', qs:[
      {
        q:'What is an acid? Give two properties of acids.',
        a:'An acid is a substance that produces hydrogen ions (H⁺) when dissolved in water.\n\nProperties of acids:\n1. Tastes sour (like lemon juice)\n2. Turns blue litmus paper RED\n3. Has a pH value less than 7\n4. Reacts with metals to produce hydrogen gas\n5. Reacts with bases to form salt and water\n\nExamples: Hydrochloric acid (HCl), sulphuric acid (H₂SO₄), vinegar (acetic acid)\n\n✓ Never taste acids in a laboratory — use litmus paper or pH indicator instead.',
        m:2
      },
      {
        q:'What happens when hydrochloric acid reacts with sodium hydroxide? Write the word equation.',
        a:'This is called a neutralisation reaction — an acid reacting with a base.\n\nWord equation:\nHydrochloric acid + Sodium hydroxide → Sodium chloride + Water\n\nSymbol equation:\nHCl + NaOH → NaCl + H₂O\n\nWhat happens:\n• The H⁺ ions from the acid combine with the OH⁻ ions from the base to form water\n• The resulting solution is neutral (pH 7)\n• Sodium chloride (common salt) is formed\n\n✓ All neutralisation reactions follow the pattern:\nAcid + Base → Salt + Water',
        m:2
      },
      {
        q:'What is neutralisation? Give one real-life example.',
        a:'Neutralisation is the chemical reaction between an acid and a base to produce a salt and water.\nThe reaction reduces the acidity or alkalinity of both substances.\n\nFormula: Acid + Base → Salt + Water\n\nReal-life examples:\n1. Indigestion tablets: Our stomach produces excess HCl causing indigestion. Antacid tablets contain magnesium hydroxide (a base) which neutralises the acid and relieves pain.\n\n2. Farmers add lime (calcium hydroxide) to acidic soil to neutralise it and make it suitable for crops.\n\n✓ Neutralisation always produces a SALT — not always the same salt as table salt (NaCl), but a salt compound.',
        m:2
      },
    ]},
    { name:'Human Biology', qs:[
      {
        q:'Name the four chambers of the human heart and state the function of each.',
        a:'The heart has four chambers:\n\n1. Right Atrium:\n   Receives deoxygenated blood from the body via the vena cava\n\n2. Right Ventricle:\n   Pumps deoxygenated blood to the lungs for oxygenation\n\n3. Left Atrium:\n   Receives oxygenated blood returning from the lungs via the pulmonary vein\n\n4. Left Ventricle:\n   Pumps oxygenated blood to the rest of the body via the aorta (has the thickest walls)\n\n✓ Memory trick: Blood flows RIGHT side → lungs → LEFT side → body\nThe left ventricle has the thickest walls because it works the hardest.',
        m:2
      },
      {
        q:'What is the role of the kidney in the human body?',
        a:'The kidneys perform several vital functions:\n\n1. Filtration: Filter waste products (urea, creatinine) from the blood\n2. Urine production: Produce urine by concentrating filtered waste\n3. Water balance: Regulate the amount of water in the body\n4. Blood pressure: Help control blood pressure\n5. pH balance: Maintain the correct pH of the blood\n6. Ion balance: Control levels of sodium, potassium and other ions\n\n✓ The kidneys filter about 180 litres of blood per day — but only produce about 1.5 litres of urine. Most water is reabsorbed back into the blood.',
        m:2
      },
      {
        q:'What is the function of red blood cells, white blood cells and platelets?',
        a:'Red Blood Cells (RBCs / Erythrocytes):\n• Carry oxygen from the lungs to all body cells\n• Carry carbon dioxide back from cells to the lungs\n• Contain haemoglobin (gives blood its red colour)\n• Have no nucleus (to carry more haemoglobin)\n\nWhite Blood Cells (WBCs / Leucocytes):\n• Defend the body against infection and disease\n• Some engulf bacteria (phagocytes)\n• Some produce antibodies (lymphocytes)\n\nPlatelets (Thrombocytes):\n• Help blood to clot when there is a wound\n• Prevent excessive blood loss\n\n✓ Think of it this way: RBCs = delivery workers, WBCs = soldiers, Platelets = repair workers.',
        m:3
      },
    ]},
    { name:'Plant Biology', qs:[
      {
        q:'Write the word equation for photosynthesis.',
        a:'Carbon dioxide + Water → Glucose + Oxygen\n(using sunlight energy and chlorophyll)\n\nSymbol equation:\n6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂\n\n✓ Photosynthesis is the opposite of respiration:\n• Photosynthesis: takes in CO₂, releases O₂ (happens in light)\n• Respiration: takes in O₂, releases CO₂ (happens always)\n\nPlants do BOTH processes, but photosynthesis is faster in sunlight.',
        m:1
      },
      {
        q:'What are stomata? Give two functions of stomata.',
        a:'Stomata (singular: stoma) are tiny pores or openings found mainly on the underside of leaves. Each stoma is surrounded by two guard cells that control its opening and closing.\n\nFunctions:\n1. Gaseous exchange: Allow CO₂ to enter the leaf for photosynthesis, and O₂ to exit\n2. Transpiration: Allow water vapour to escape from the leaf\n3. Also allow O₂ in and CO₂ out during respiration at night\n\n✓ Stomata are usually found on the underside of leaves to reduce water loss from direct sunlight.',
        m:2
      },
      {
        q:'What is transpiration? Give two reasons why it is important for plants.',
        a:'Transpiration is the process by which water evaporates from the leaves of plants, mainly through the stomata.\n\nWhy it is important:\n1. Creates a "transpiration pull" — this suction helps draw water up from the roots through the stem to the leaves (upward transport of water and minerals)\n\n2. Cools the plant — evaporation of water removes heat, preventing the plant from overheating\n\n3. Maintains turgor pressure — keeps cells firm and leaves upright\n\n✓ Transpiration is affected by: temperature, humidity, wind speed, and light intensity. Hot, dry, windy conditions increase transpiration.',
        m:2
      },
      {
        q:'Explain the difference between photosynthesis and respiration.',
        a:'Photosynthesis:\n• Occurs only in green plants (in chloroplasts)\n• Only happens in light\n• Takes in: CO₂ and water\n• Releases: Glucose and oxygen\n• Stores energy in glucose\n• Word equation: CO₂ + H₂O → Glucose + O₂\n\nRespiration:\n• Occurs in ALL living cells (in mitochondria)\n• Happens day and night, always\n• Takes in: Glucose and oxygen\n• Releases: CO₂, water and energy\n• Releases energy from glucose\n• Word equation: Glucose + O₂ → CO₂ + H₂O + Energy\n\n✓ Key difference: Photosynthesis MAKES food and STORES energy. Respiration USES food and RELEASES energy.',
        m:3
      },
    ]},
    { name:'Environment & Ecology', qs:[
      {
        q:'What is the greenhouse effect? Name two greenhouse gases.',
        a:'The greenhouse effect is a natural process where certain gases in the atmosphere absorb and re-emit heat radiation from the Earth\'s surface, trapping warmth and keeping the planet habitable.\n\nWithout it, Earth would be too cold for life. The problem is that human activity is enhancing this effect, causing global warming.\n\nGreenhouse gases:\n1. Carbon dioxide (CO₂) — from burning fossil fuels, deforestation\n2. Methane (CH₄) — from livestock, rice paddies, landfills\n3. Water vapour (H₂O)\n4. Nitrous oxide (N₂O)\n\n✓ The greenhouse effect itself is natural and necessary. It is the ENHANCED greenhouse effect from human activity that causes climate change.',
        m:2
      },
      {
        q:'Define biodiversity. Give two reasons why biodiversity is important.',
        a:'Biodiversity is the variety of all living organisms — plants, animals, fungi and microorganisms — found in a particular area or on Earth.\n\nIt includes:\n• Species diversity (number of different species)\n• Genetic diversity (variety within a species)\n• Ecosystem diversity (variety of habitats)\n\nWhy biodiversity is important:\n1. Ecological stability: Each species plays a role in its ecosystem. Losing one species can disrupt food chains and entire ecosystems.\n\n2. Resources for humans: Plants provide medicines, food and materials. Many drugs were discovered from wild plants.\n\n3. Natural services: Forests clean air and water, bees pollinate crops, wetlands prevent floods.\n\n✓ Nepal is one of the most biodiverse countries in the world due to its varied altitude and climate zones.',
        m:2
      },
      {
        q:'What is a food chain? Write a food chain with four organisms.',
        a:'A food chain shows the transfer of energy from one organism to another through feeding relationships. Each organism feeds on the one before it.\n\nArrows show the direction of energy flow.\n\nExample food chain:\nGrass → Grasshopper → Frog → Snake\n(Producer) → (Primary) → (Secondary) → (Tertiary consumer)\n\nKey terms:\n• Producer: Makes its own food through photosynthesis (always a plant)\n• Consumer: Gets energy by eating other organisms\n• Herbivore: Eats only plants (primary consumer)\n• Carnivore: Eats animals\n\n✓ Energy is lost at each step. Only about 10% of energy passes from one level to the next. This is why food chains rarely have more than 4–5 levels.',
        m:2
      },
      {
        q:'Explain how deforestation contributes to climate change.',
        a:'Deforestation (cutting down forests) contributes to climate change in two main ways:\n\n1. Reduced CO₂ absorption:\nTrees absorb CO₂ from the atmosphere during photosynthesis. When forests are destroyed, less CO₂ is absorbed, so more accumulates in the atmosphere, enhancing the greenhouse effect.\n\n2. Release of stored carbon:\nTrees store large amounts of carbon in their wood and roots. When trees are burned or decay after being cut, this carbon is released as CO₂ into the atmosphere.\n\nOther effects:\n• Destroys habitats → reduces biodiversity\n• Increases soil erosion\n• Disrupts the water cycle\n\n✓ Deforestation accounts for about 10–15% of global CO₂ emissions each year.',
        m:3
      },
    ]},
  ]
};
