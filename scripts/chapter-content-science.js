/* chapter-content-science.js */
const CHAPTER_CONTENT = {
  subject: 'science',
  label: 'Science',
  icon: '🔬',
  chapters: [
    { name:'Electricity', qs:[
      {
        q:"State Ohm's Law and write its formula.",
        a:"Ohm's Law says: the more voltage you push through a wire, the more current flows — as long as temperature stays the same.\n\nFormula: V = IR\nV = Voltage (volts)\nI = Current (amperes)\nR = Resistance (ohms)\n\nThink of it like water in a pipe:\nVoltage = water pressure\nCurrent = how much water flows\nResistance = how narrow the pipe is",
        m:2
      },
      {
        q:'Three resistors of 2Ω, 3Ω and 6Ω are connected in parallel. Find the total resistance.',
        a:'For parallel resistors:\n1/R = 1/R₁ + 1/R₂ + 1/R₃\n\n1/R = 1/2 + 1/3 + 1/6\n\nMake them the same denominator (6):\n= 3/6 + 2/6 + 1/6\n= 6/6 = 1\n\nR = 1Ω\n\nImportant: In parallel, total resistance is LESS than the smallest resistor. Here smallest is 2Ω and total is 1Ω. That makes sense!',
        m:3
      },
      {
        q:'A current of 3A flows through a resistor of 10Ω. Find the voltage across it.',
        a:"V = IR\nV = 3 × 10\nV = 30 V\n\nSimple tip: Learn these three versions of Ohm's Law:\nV = IR (find voltage)\nI = V/R (find current)\nR = V/I (find resistance)",
        m:2
      },
      {
        q:'Find the power consumed by a bulb connected to 220V with a current of 0.5A.',
        a:'Power = Voltage × Current\nP = V × I\nP = 220 × 0.5\nP = 110 W\n\nPower tells you how much energy the bulb uses every second. 110W means 110 joules per second.',
        m:2
      },
      {
        q:'A 60W bulb is used for 5 hours daily. Calculate the energy consumed in one week (in kWh).',
        a:'Energy per day:\n= 60W × 5 hours = 300 Wh\n\nEnergy per week:\n= 300 × 7 = 2100 Wh\n\nConvert to kWh (divide by 1000):\n= 2100 ÷ 1000 = 2.1 kWh\n\nYour electricity bill is calculated in kWh. The more kWh you use, the higher the bill.',
        m:4
      },
    ]},
    { name:'Light & Optics', qs:[
      {
        q:'State the two laws of reflection of light.',
        a:'Law 1: The incident ray, reflected ray and normal all lie in the same flat plane.\n\nLaw 2: Angle of incidence = Angle of reflection\n∠i = ∠r\n\nRemember: angles are measured from the NORMAL (the imaginary line straight out from the mirror), not from the mirror itself.',
        m:2
      },
      {
        q:'Define refraction of light. What happens to light when it moves from water to air?',
        a:'Refraction is when light bends as it moves from one material to another.\n\nWhen light goes from water to air:\n• It moves into a less dense material\n• It speeds up\n• It bends AWAY from the normal\n\nEasy rule to remember:\nGoing into denser material → bends TOWARDS normal\nGoing into less dense material → bends AWAY from normal',
        m:2
      },
      {
        q:'What is the difference between a real image and a virtual image? Give one example of each.',
        a:'Real image:\n• Light rays actually meet at that point\n• You can project it on a screen\n• Always upside down\n• Example: Image on a cinema screen\n\nVirtual image:\n• Light rays only appear to come from that point\n• You cannot project it on a screen\n• Always the right way up\n• Example: Your reflection in a mirror\n\nSimple test: Can you catch it on paper? Yes = real. No = virtual.',
        m:2
      },
    ]},
    { name:'Force & Motion', qs:[
      {
        q:"State Newton's First Law of Motion. Give one real-life example.",
        a:"Newton's First Law: An object will keep doing what it's doing — staying still or moving — unless a force acts on it.\n\nThis is called INERTIA.\n\nReal example: When a bus suddenly stops, your body keeps moving forward. That's why you jerk forward — your body wants to keep moving.\n\nAnother example: A ball rolling on a smooth floor keeps rolling because nothing stops it.",
        m:2
      },
      {
        q:'What is the difference between speed and velocity?',
        a:'Speed: How fast something moves. No direction needed.\nExample: "The car moves at 60 km/h"\n\nVelocity: How fast AND which direction.\nExample: "The car moves at 60 km/h northward"\n\nIf two cars both go 60 km/h but in opposite directions — same speed, different velocity.\n\nSpeed is a scalar. Velocity is a vector (has direction).',
        m:2
      },
      {
        q:'A ball of mass 2 kg is moving at 5 m/s. Find its momentum.',
        a:'Momentum = mass × velocity\np = m × v\np = 2 × 5\np = 10 kg m/s\n\nMomentum tells you how hard something is to stop. A heavy truck at low speed can have more momentum than a small ball at high speed.',
        m:2
      },
      {
        q:'A car accelerates from rest to 20 m/s in 4 seconds. Find the acceleration and the force if the mass is 1000 kg.',
        a:'Step 1: Find acceleration\na = (final speed − starting speed) ÷ time\na = (20 − 0) ÷ 4\na = 5 m/s²\n\nStep 2: Find force\nF = mass × acceleration\nF = 1000 × 5\nF = 5000 N\n\nAlways do it in steps — find acceleration first, then use it to find force.',
        m:4
      },
    ]},
    { name:'Chemical Reactions', qs:[
      {
        q:'What is a chemical reaction? Give one example with a word equation.',
        a:'A chemical reaction is when substances change into completely new substances with different properties.\n\nYou can tell a reaction happened if you see:\n• Heat or light produced\n• Gas bubbles\n• Colour change\n• A solid forming in liquid\n\nExample — burning magnesium:\nMagnesium + Oxygen → Magnesium oxide\n\nUnlike melting ice, you cannot easily reverse a chemical reaction.',
        m:2
      },
      {
        q:'Differentiate between exothermic and endothermic reactions with one example each.',
        a:'Exothermic = gives out heat\nThe surroundings get warmer.\nExample: Burning wood — you feel the heat\n\nEndothermic = takes in heat\nThe surroundings get cooler.\nExample: Photosynthesis — plants absorb light energy\n\nMemory trick:\nexo = exit (heat exits to surroundings)\nendo = enter (heat enters the reaction)',
        m:2
      },
      {
        q:'Explain what happens when iron is exposed to moist air. Write the word equation.',
        a:'Iron + moist air = rust. This is called corrosion or oxidation.\n\nBoth oxygen AND water must be present for rusting to happen.\n• Iron in dry air = no rust\n• Iron in water with no oxygen = no rust\n• Iron in moist air = rust!\n\nWord equation:\nIron + Oxygen + Water → Iron oxide (rust)\n\nPrevention: painting, oiling, or coating with zinc (galvanising)',
        m:2
      },
    ]},
    { name:'Acids & Bases', qs:[
      {
        q:'What is an acid? Give two properties of acids.',
        a:'An acid is a substance that gives H⁺ ions when dissolved in water.\n\nProperties of acids:\n1. Tastes sour (lemon juice, vinegar)\n2. Turns blue litmus paper RED\n3. pH less than 7\n4. Reacts with metals to make hydrogen gas\n\nExamples: lemon juice, vinegar, hydrochloric acid (HCl)\n\nNever taste acids in a lab!',
        m:2
      },
      {
        q:'What happens when hydrochloric acid reacts with sodium hydroxide? Write the word equation.',
        a:'This is called neutralisation — acid + base cancel each other out.\n\nHydrochloric acid + Sodium hydroxide → Sodium chloride + Water\nHCl + NaOH → NaCl + H₂O\n\nThe result is salt water — neutral, pH 7.\n\nAll neutralisation reactions follow:\nAcid + Base → Salt + Water',
        m:2
      },
      {
        q:'What is neutralisation? Give one real-life example.',
        a:'Neutralisation is when an acid and a base react together and cancel each other out, making salt and water.\n\nAcid + Base → Salt + Water\n\nReal life example:\nWhen you have indigestion, your stomach has too much acid. You take an antacid tablet (which is a base). The base neutralises the acid and you feel better.\n\nFarmers also add lime (a base) to acidic soil to neutralise it so crops can grow.',
        m:2
      },
    ]},
    { name:'Human Biology', qs:[
      {
        q:'Name the four chambers of the human heart and state the function of each.',
        a:'The heart has 4 rooms (chambers):\n\n1. Right Atrium — collects used blood coming back from the body\n2. Right Ventricle — sends that blood to the lungs to get oxygen\n3. Left Atrium — collects fresh oxygenated blood from the lungs\n4. Left Ventricle — pumps fresh blood out to the whole body (has the thickest walls — it works the hardest)\n\nBlood path: Body → Right side of heart → Lungs → Left side of heart → Body',
        m:2
      },
      {
        q:'What is the role of the kidney in the human body?',
        a:'The kidneys are like a cleaning filter for your blood.\n\nMain jobs:\n1. Filter waste (like urea) out of the blood\n2. Make urine to remove that waste\n3. Control how much water is in your body\n4. Keep blood pressure normal\n5. Keep the blood\'s pH balanced\n\nFact: Your kidneys filter ALL your blood about 300 times per day!',
        m:2
      },
      {
        q:'What is the function of red blood cells, white blood cells and platelets?',
        a:'Red blood cells:\n• Carry oxygen from lungs to every part of your body\n• Carry carbon dioxide back to the lungs\n• Red colour comes from haemoglobin\n\nWhite blood cells:\n• Fight bacteria and viruses — they are your body\'s soldiers\n• Produce antibodies\n\nPlatelets:\n• Help your blood clot when you get a cut\n• Stop you from bleeding too much\n\nSimple: Red = delivery, White = defence, Platelets = repair',
        m:3
      },
    ]},
    { name:'Plant Biology', qs:[
      {
        q:'Write the word equation for photosynthesis.',
        a:'Carbon dioxide + Water → Glucose + Oxygen\n(This needs sunlight and chlorophyll to work)\n\nPlants take in CO₂ from air and water from soil.\nUsing sunlight, they make glucose (food) and release oxygen.\n\nThis is why plants are so important — they make the oxygen we breathe!',
        m:1
      },
      {
        q:'What are stomata? Give two functions of stomata.',
        a:'Stomata are tiny holes on the underside of leaves. Each hole is controlled by two guard cells that open and close it.\n\nFunctions:\n1. Let CO₂ in for photosynthesis (and O₂ out)\n2. Let water vapour escape (this is transpiration)\n\nThey are on the underside of leaves to stay shaded and reduce water loss.',
        m:2
      },
      {
        q:'What is transpiration? Give two reasons why it is important for plants.',
        a:'Transpiration is when water evaporates from leaves through the stomata — like the plant sweating.\n\nWhy it matters:\n1. Pulls water UP from roots to leaves — like sucking through a straw. Without this, water couldn\'t reach the top of tall trees.\n\n2. Cools the plant down — when water evaporates it carries heat away, just like sweating cools your body.\n\nHot sunny windy days = more transpiration.',
        m:2
      },
      {
        q:'Explain the difference between photosynthesis and respiration.',
        a:'Photosynthesis (only in green plants, only in light):\n• Takes IN: CO₂ and water\n• Gives OUT: glucose and oxygen\n• STORES energy\n\nRespiration (all living things, day and night):\n• Takes IN: glucose and oxygen\n• Gives OUT: CO₂ and water\n• RELEASES energy\n\nThey are opposites of each other.\nPhotosynthesis makes food. Respiration uses food.',
        m:3
      },
    ]},
    { name:'Environment & Ecology', qs:[
      {
        q:'What is the greenhouse effect? Name two greenhouse gases.',
        a:'The greenhouse effect is like a blanket around the Earth.\n\nSunlight enters the atmosphere → warms the Earth → Earth releases heat → greenhouse gases trap some of that heat → Earth stays warm.\n\nWithout it, Earth would be freezing. The problem is humans are making the blanket TOO thick by releasing extra greenhouse gases.\n\nGreenhouse gases:\n1. Carbon dioxide (CO₂) — from cars, factories, burning fuel\n2. Methane (CH₄) — from cattle, rice fields, rubbish dumps',
        m:2
      },
      {
        q:'Define biodiversity. Give two reasons why biodiversity is important.',
        a:'Biodiversity means the variety of all living things in an area — all the different plants, animals, insects and microorganisms.\n\nWhy it matters:\n1. Every species has a job. Remove one and the whole system can collapse. Example: no bees = no pollination = no fruits or vegetables.\n\n2. We get medicine, food and materials from wild species. Many life-saving medicines came from rainforest plants.\n\nNepal is one of the most biodiverse countries on Earth because of its mountains, forests and plains.',
        m:2
      },
      {
        q:'What is a food chain? Write a food chain with four organisms.',
        a:'A food chain shows who eats who — and how energy passes from one living thing to another.\n\nArrows show energy moving:\nGrass → Grasshopper → Frog → Snake\n\nGrass = producer (makes food from sunlight)\nGrasshopper = primary consumer (eats plants)\nFrog = secondary consumer (eats grasshopper)\nSnake = tertiary consumer (eats frog)\n\nEnergy is lost at each step, which is why food chains rarely go beyond 4 or 5 levels.',
        m:2
      },
      {
        q:'Explain how deforestation contributes to climate change.',
        a:'Trees are nature\'s CO₂ absorbers. They suck CO₂ out of the air during photosynthesis.\n\nWhen we cut down forests:\n1. Fewer trees = less CO₂ absorbed = more CO₂ builds up in the air\n2. When trees are burned, all the carbon stored inside them is released as CO₂\n\nBoth effects increase CO₂ in the atmosphere → stronger greenhouse effect → Earth gets warmer.\n\nDeforestation is one of the biggest causes of climate change, along with burning fossil fuels.',
        m:3
      },
    ]},
  ]
};
