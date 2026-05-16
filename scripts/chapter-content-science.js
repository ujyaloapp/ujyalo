/* chapter-content-science.js
   SEE Grade 10 — Compulsory Science
   Grouped structure matching chapter-practice.html
   ================================================ */

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
          name: 'Electricity',
          qs: [
            {
              q: "State Ohm's Law and write its formula.",
              a: "Ohm's Law says: the more voltage you push through a wire, the more current flows — as long as temperature stays the same.\n\nFormula: V = IR\nV = Voltage (volts)\nI = Current (amperes)\nR = Resistance (ohms)\n\nThink of it like water in a pipe:\nVoltage = water pressure\nCurrent = how much water flows\nResistance = how narrow the pipe is",
              m: 2
            },
            {
              q: 'Three resistors of 2Ω, 3Ω and 6Ω are connected in parallel. Find the total resistance.',
              a: 'For parallel resistors:\n1/R = 1/R₁ + 1/R₂ + 1/R₃\n\n1/R = 1/2 + 1/3 + 1/6\n\nMake them the same denominator (6):\n= 3/6 + 2/6 + 1/6 = 6/6 = 1\n\nR = 1Ω\n\nIn parallel, total resistance is ALWAYS less than the smallest resistor.',
              m: 3
            },
            {
              q: 'A current of 3A flows through a resistor of 10Ω. Find the voltage across it.',
              a: "V = IR\nV = 3 × 10 = 30 V\n\nRemember the three versions:\nV = IR (find voltage)\nI = V/R (find current)\nR = V/I (find resistance)",
              m: 2
            },
            {
              q: 'Find the power consumed by a bulb connected to 220V with a current of 0.5A.',
              a: 'Power = Voltage × Current\nP = V × I\nP = 220 × 0.5\nP = 110 W\n\nPower tells you how much energy the bulb uses every second.',
              m: 2
            },
            {
              q: 'A 60W bulb is used for 5 hours daily. Calculate the energy consumed in one week (in kWh).',
              a: 'Energy per day = 60W × 5 hours = 300 Wh\nEnergy per week = 300 × 7 = 2100 Wh\nConvert to kWh = 2100 ÷ 1000 = 2.1 kWh\n\nYour electricity bill is calculated in kWh.',
              m: 4
            },
          ]
        },
        {
          name: 'Light & Optics',
          qs: [
            {
              q: 'State the two laws of reflection of light.',
              a: 'Law 1: The incident ray, reflected ray and normal all lie in the same flat plane.\n\nLaw 2: Angle of incidence = Angle of reflection\n∠i = ∠r\n\nAngles are always measured from the NORMAL — not from the mirror surface.',
              m: 2
            },
            {
              q: 'Define refraction of light. What happens to light when it moves from water to air?',
              a: 'Refraction is when light bends as it moves from one material to another.\n\nWhen light goes from water to air:\n• It moves into a less dense material\n• It speeds up\n• It bends AWAY from the normal\n\nEasy rule:\nDenser → less dense: bends away from normal\nLess dense → denser: bends towards normal',
              m: 2
            },
            {
              q: 'What is the difference between a real image and a virtual image? Give one example of each.',
              a: 'Real image:\n• Light rays actually meet at that point\n• Can be projected on a screen\n• Always upside down\n• Example: Image on a cinema screen\n\nVirtual image:\n• Light rays only appear to come from that point\n• Cannot be projected on a screen\n• Always the right way up\n• Example: Your reflection in a mirror\n\nSimple test: Can you catch it on paper? Yes = real. No = virtual.',
              m: 2
            },
          ]
        },
        {
          name: 'Force & Motion',
          qs: [
            {
              q: "State Newton's First Law of Motion. Give one real-life example.",
              a: "Newton's First Law: An object will keep doing what it's doing — staying still or moving — unless a force acts on it.\n\nThis is called INERTIA.\n\nExample: When a bus suddenly stops, your body keeps moving forward. That's inertia — your body wants to keep moving.",
              m: 2
            },
            {
              q: 'What is the difference between speed and velocity?',
              a: 'Speed: How fast something moves. No direction needed.\nExample: "The car moves at 60 km/h"\n\nVelocity: How fast AND which direction.\nExample: "The car moves at 60 km/h northward"\n\nSpeed is a scalar. Velocity is a vector (has direction).',
              m: 2
            },
            {
              q: 'A ball of mass 2 kg is moving at 5 m/s. Find its momentum.',
              a: 'Momentum = mass × velocity\np = m × v\np = 2 × 5\np = 10 kg m/s',
              m: 2
            },
            {
              q: 'A car accelerates from rest to 20 m/s in 4 seconds. Find the acceleration and force if mass is 1000 kg.',
              a: 'Step 1: Acceleration\na = (v − u) / t = (20 − 0) / 4 = 5 m/s²\n\nStep 2: Force\nF = ma = 1000 × 5 = 5000 N',
              m: 4
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
          name: 'Chemical Reactions',
          qs: [
            {
              q: 'What is a chemical reaction? Give one example with a word equation.',
              a: 'A chemical reaction is when substances change into completely new substances with different properties.\n\nSigns a reaction happened:\n• Heat or light produced\n• Gas bubbles\n• Colour change\n• A solid forming in liquid\n\nExample — burning magnesium:\nMagnesium + Oxygen → Magnesium oxide\n\nUnlike melting ice, you cannot easily reverse a chemical reaction.',
              m: 2
            },
            {
              q: 'Differentiate between exothermic and endothermic reactions with one example each.',
              a: 'Exothermic = gives out heat. Surroundings get warmer.\nExample: Burning wood\n\nEndothermic = takes in heat. Surroundings get cooler.\nExample: Photosynthesis\n\nMemory trick:\nexo = exit (heat exits)\nendo = enter (heat enters)',
              m: 2
            },
            {
              q: 'Explain what happens when iron is exposed to moist air. Write the word equation.',
              a: 'Iron + moist air = rust. This is called oxidation.\n\nBoth oxygen AND water must be present.\n• Iron in dry air = no rust\n• Iron in water with no oxygen = no rust\n• Iron in moist air = rust!\n\nIron + Oxygen + Water → Iron oxide (rust)\n\nPrevention: painting, oiling, galvanising (zinc coating)',
              m: 2
            },
          ]
        },
        {
          name: 'Acids & Bases',
          qs: [
            {
              q: 'What is an acid? Give two properties of acids.',
              a: 'An acid produces H⁺ ions when dissolved in water.\n\nProperties:\n1. Tastes sour (lemon juice, vinegar)\n2. Turns blue litmus paper RED\n3. pH less than 7\n4. Reacts with metals to make hydrogen gas\n\nExamples: HCl, H₂SO₄, vinegar\n\nNever taste acids in a lab!',
              m: 2
            },
            {
              q: 'What happens when hydrochloric acid reacts with sodium hydroxide? Write the word equation.',
              a: 'This is called neutralisation — acid + base cancel each other out.\n\nHydrochloric acid + Sodium hydroxide → Sodium chloride + Water\nHCl + NaOH → NaCl + H₂O\n\nThe result is neutral (pH 7).\n\nAll neutralisation reactions: Acid + Base → Salt + Water',
              m: 2
            },
            {
              q: 'What is neutralisation? Give one real-life example.',
              a: 'Neutralisation is when an acid and a base react and cancel each other out, making salt and water.\n\nAcid + Base → Salt + Water\n\nReal example: When you have indigestion, your stomach has too much acid. An antacid tablet (a base) neutralises the acid and you feel better.\n\nFarmers also add lime (a base) to acidic soil to neutralise it.',
              m: 2
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
          name: 'Human Biology',
          qs: [
            {
              q: 'Name the four chambers of the human heart and state the function of each.',
              a: '1. Right Atrium — collects used blood coming back from the body\n2. Right Ventricle — sends that blood to the lungs to get oxygen\n3. Left Atrium — collects fresh oxygenated blood from the lungs\n4. Left Ventricle — pumps fresh blood out to the whole body (thickest walls)\n\nBlood path: Body → Right side → Lungs → Left side → Body',
              m: 2
            },
            {
              q: 'What is the role of the kidney in the human body?',
              a: 'The kidneys are like a cleaning filter for your blood.\n\nMain jobs:\n1. Filter waste (urea) out of the blood\n2. Make urine to remove waste\n3. Control water balance in the body\n4. Keep blood pressure normal\n5. Maintain blood pH\n\nYour kidneys filter ALL your blood about 300 times per day!',
              m: 2
            },
            {
              q: 'What is the function of red blood cells, white blood cells and platelets?',
              a: 'Red blood cells:\n• Carry oxygen from lungs to every part of the body\n• Carry CO₂ back to the lungs\n• Red colour from haemoglobin\n\nWhite blood cells:\n• Fight bacteria and viruses — your body\'s soldiers\n• Produce antibodies\n\nPlatelets:\n• Help blood clot when you get a cut\n• Stop excessive bleeding\n\nSimple: Red = delivery, White = defence, Platelets = repair',
              m: 3
            },
          ]
        },
        {
          name: 'Plant Biology',
          qs: [
            {
              q: 'Write the word equation for photosynthesis.',
              a: 'Carbon dioxide + Water → Glucose + Oxygen\n(Needs sunlight and chlorophyll)\n\nPlants take CO₂ from air and water from soil, use sunlight to make glucose — their food. They release oxygen which we breathe.',
              m: 1
            },
            {
              q: 'What are stomata? Give two functions of stomata.',
              a: 'Stomata are tiny holes on the underside of leaves. Each hole is controlled by two guard cells.\n\nFunctions:\n1. Let CO₂ in for photosynthesis (and O₂ out)\n2. Let water vapour escape (transpiration)\n\nThey are on the underside to stay shaded and reduce water loss.',
              m: 2
            },
            {
              q: 'Explain the difference between photosynthesis and respiration.',
              a: 'Photosynthesis (only in green plants, only in light):\n• Takes IN: CO₂ and water\n• Gives OUT: glucose and oxygen\n• STORES energy\n\nRespiration (all living things, day and night):\n• Takes IN: glucose and oxygen\n• Gives OUT: CO₂ and water\n• RELEASES energy\n\nPhotosynthesis makes food. Respiration uses food.',
              m: 3
            },
          ]
        },
      ]
    },

    {
      name: 'Environment',
      icon: '🌍',
      chapters: [
        {
          name: 'Environment & Ecology',
          qs: [
            {
              q: 'What is the greenhouse effect? Name two greenhouse gases.',
              a: 'The greenhouse effect is like a blanket around the Earth.\n\nSunlight warms the Earth → Earth releases heat → greenhouse gases trap some heat → Earth stays warm.\n\nThe problem: humans are making the blanket TOO thick.\n\nGreenhouse gases:\n1. Carbon dioxide (CO₂) — from cars, factories\n2. Methane (CH₄) — from cattle, rice fields',
              m: 2
            },
            {
              q: 'Define biodiversity. Give two reasons why biodiversity is important.',
              a: 'Biodiversity means the variety of all living things in an area.\n\nWhy it matters:\n1. Every species has a job. Remove one and the whole system can collapse. No bees = no pollination = no fruits.\n\n2. We get medicine, food and materials from wild species. Many life-saving medicines came from plants.\n\nNepal is one of the most biodiverse countries on Earth.',
              m: 2
            },
            {
              q: 'What is a food chain? Write a food chain with four organisms.',
              a: 'A food chain shows who eats who — and how energy passes from one living thing to another.\n\nGrass → Grasshopper → Frog → Snake\n\nGrass = producer\nGrasshopper = primary consumer\nFrog = secondary consumer\nSnake = tertiary consumer\n\nEnergy is lost at each step — only about 10% passes on.',
              m: 2
            },
            {
              q: 'Explain how deforestation contributes to climate change.',
              a: 'Trees absorb CO₂ during photosynthesis.\n\nWhen forests are cut:\n1. Fewer trees = less CO₂ absorbed = more CO₂ in air\n2. When trees are burned, stored carbon is released as CO₂\n\nBoth increase CO₂ → stronger greenhouse effect → Earth gets warmer.\n\nOther effects:\n• Destroys habitats\n• Causes soil erosion\n• Disrupts the water cycle',
              m: 3
            },
          ]
        },
      ]
    },

  ]
};
