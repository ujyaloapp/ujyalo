/* chapter-content-maths.js */
const CHAPTER_CONTENT = {
  subject: 'maths',
  label: 'Maths',
  icon: '🧮',
  chapters: [
    { name:'Algebra', qs:[
      {
        q:'Solve: 3x + 7 = 22. Show your working.',
        a:'We need to find what x is.\n\nFirst, get rid of the 7 by subtracting it from both sides:\n3x = 22 − 7\n3x = 15\n\nNow divide both sides by 3:\nx = 5\n\nThat\'s it! x = 5\n\nQuick check: 3 × 5 + 7 = 15 + 7 = 22 ✓',
        m:2
      },
      {
        q:'Factorise: x² − 7x + 12',
        a:'Factorising means writing it as two brackets.\n\nWe need two numbers that:\n• Multiply to make 12\n• Add to make −7\n\nThink... −3 and −4 work!\n−3 × −4 = 12 ✓ and −3 + (−4) = −7 ✓\n\nSo the answer is: (x − 3)(x − 4)\n\nAlways check by expanding back:\n(x−3)(x−4) = x² − 7x + 12 ✓',
        m:2
      },
      {
        q:'Solve: 5x − 3 = 2x + 9',
        a:'Move all the x\'s to one side and all the numbers to the other.\n\n5x − 2x = 9 + 3\n3x = 12\nx = 4\n\nSimple tip: x terms go left, plain numbers go right.',
        m:2
      },
      {
        q:'If 2x + 3y = 12 and x = 3, find the value of y.',
        a:'We already know x = 3. Just put it in!\n\n2(3) + 3y = 12\n6 + 3y = 12\n3y = 12 − 6\n3y = 6\ny = 2',
        m:2
      },
      {
        q:'Expand and simplify: (x + 4)(x − 3)',
        a:'Multiply everything in the first bracket by everything in the second bracket.\n\nx × x = x²\nx × −3 = −3x\n4 × x = +4x\n4 × −3 = −12\n\nNow collect the middle terms:\nx² − 3x + 4x − 12\n= x² + x − 12',
        m:2
      },
      {
        q:'Solve the quadratic equation x² − 5x + 6 = 0 by factorisation.',
        a:'Find two numbers that multiply to 6 and add to −5.\nThat\'s −2 and −3.\n\nSo: (x − 2)(x − 3) = 0\n\nFor this to equal zero, one of the brackets must be zero:\nx − 2 = 0 → x = 2\nx − 3 = 0 → x = 3\n\nAnswer: x = 2 or x = 3',
        m:4
      },
      {
        q:'The sum of two numbers is 18 and their difference is 4. Find both numbers.',
        a:'Call the numbers x and y.\n\nx + y = 18\nx − y = 4\n\nAdd both equations:\n2x = 22\nx = 11\n\nPut x = 11 back in the first equation:\n11 + y = 18\ny = 7\n\nThe numbers are 11 and 7.\nCheck: 11 + 7 = 18 ✓ and 11 − 7 = 4 ✓',
        m:3
      },
    ]},
    { name:'Mensuration', qs:[
      {
        q:'Find the area of a circle with radius 7 cm. (Use π = 22/7)',
        a:'Formula: Area = πr²\n\nJust put the numbers in:\n= (22/7) × 7 × 7\n= (22/7) × 49\n= 22 × 7  (the 7s cancel out nicely!)\n= 154 cm²\n\nRemember: area is always cm² — always write the little ²',
        m:2
      },
      {
        q:'Find the volume of a cylinder with radius 5 cm and height 10 cm. (Use π = 22/7)',
        a:'Think of a cylinder as a circle stretched upward.\nVolume = πr²h (area of the circle × height)\n\n= (22/7) × 5² × 10\n= (22/7) × 25 × 10\n= (22 × 250) / 7\n= 5500 / 7\n≈ 785.7 cm³',
        m:2
      },
      {
        q:'A rectangle has length 12 cm and width 8 cm. Find its area and perimeter.',
        a:'Area = length × width\n= 12 × 8\n= 96 cm²\n\nPerimeter = distance all the way around\n= 2 × (length + width)\n= 2 × (12 + 8)\n= 2 × 20\n= 40 cm\n\nEasy way to remember:\nArea = inside space (cm²)\nPerimeter = border distance (cm)',
        m:2
      },
      {
        q:'A circular garden has a diameter of 28 m. Find its area. (Use π = 22/7)',
        a:'Watch out — the formula needs RADIUS, not diameter!\nRadius = 28 ÷ 2 = 14 m\n\nArea = πr²\n= (22/7) × 14 × 14\n= (22/7) × 196\n= 22 × 28\n= 616 m²\n\nVery common mistake: forgetting to halve the diameter first.',
        m:3
      },
      {
        q:'The total surface area of a cylinder is 660 cm². If the radius is 5 cm, find the height.',
        a:'Formula: TSA = 2πr(r + h)\n\nPut in what we know:\n660 = 2 × (22/7) × 5 × (5 + h)\n660 = (220/7) × (5 + h)\n\nMultiply both sides by 7:\n4620 = 220 × (5 + h)\n\nDivide both sides by 220:\n5 + h = 21\nh = 16 cm',
        m:4
      },
    ]},
    { name:'Trigonometry', qs:[
      {
        q:'If sin θ = 3/5, find the values of cos θ and tan θ.',
        a:'Remember SOH CAH TOA.\nsin = Opposite ÷ Hypotenuse\n\nSo: opposite = 3, hypotenuse = 5\n\nFind the missing side using Pythagoras:\nadjacent = √(5² − 3²) = √(25 − 9) = √16 = 4\n\nNow:\ncos θ = adjacent ÷ hypotenuse = 4/5\ntan θ = opposite ÷ adjacent = 3/4',
        m:2
      },
      {
        q:'Find the value of: sin 30° + cos 60° − tan 45°',
        a:'These are standard values you must know by heart:\nsin 30° = 1/2\ncos 60° = 1/2\ntan 45° = 1\n\nNow just substitute:\n= 1/2 + 1/2 − 1\n= 1 − 1\n= 0',
        m:2
      },
      {
        q:'A ladder 10 m long leans against a wall at an angle of 60° with the ground. How high up the wall does it reach?',
        a:'Draw it first. The ladder is the hypotenuse (10 m). We want the height (opposite side).\n\nsin 60° = opposite ÷ hypotenuse\nheight = 10 × sin 60°\n= 10 × 0.866\n= 8.66 m\n\nAlways draw the triangle first — it makes these much easier.',
        m:3
      },
      {
        q:'Prove that: sin²θ + cos²θ = 1',
        a:'Use a right triangle with sides a (opposite), b (adjacent), c (hypotenuse).\n\nWe know: a² + b² = c² (Pythagoras)\n\nsin θ = a/c, so sin²θ = a²/c²\ncos θ = b/c, so cos²θ = b²/c²\n\nsin²θ + cos²θ\n= a²/c² + b²/c²\n= (a² + b²)/c²\n= c²/c²\n= 1 ✓',
        m:2
      },
    ]},
    { name:'Statistics', qs:[
      {
        q:'Find the mean of: 12, 18, 24, 15, 21',
        a:'Mean = add everything up ÷ how many numbers\n\nSum = 12 + 18 + 24 + 15 + 21 = 90\nCount = 5\n\nMean = 90 ÷ 5 = 18',
        m:2
      },
      {
        q:'Find the median of: 4, 7, 2, 9, 3, 8, 5',
        a:'Step 1: Put them in order from smallest to biggest.\n2, 3, 4, 5, 7, 8, 9\n\nStep 2: The median is the middle number.\n7 numbers → middle is the 4th one\n\nMedian = 5\n\nNever skip step 1 — always sort first!',
        m:2
      },
      {
        q:'The mean of 5 numbers is 12. Four of the numbers are 10, 14, 8 and 16. Find the fifth number.',
        a:'If mean = 12 and there are 5 numbers:\nTotal sum = 12 × 5 = 60\n\nAdd the four we know:\n10 + 14 + 8 + 16 = 48\n\nFifth number = 60 − 48 = 12',
        m:2
      },
      {
        q:'Find the mean, median and mode of: 5, 8, 4, 5, 10, 7, 5, 8',
        a:'Sort first: 4, 5, 5, 5, 7, 8, 8, 10\n\nMean:\nSum = 4+5+5+5+7+8+8+10 = 52\nMean = 52 ÷ 8 = 6.5\n\nMedian (8 numbers — average the 4th and 5th):\n4th = 5, 5th = 7\nMedian = (5+7) ÷ 2 = 6\n\nMode (most common):\n5 appears 3 times → Mode = 5',
        m:4
      },
    ]},
    { name:'Probability', qs:[
      {
        q:'A bag contains 3 red and 5 blue balls. What is the probability of picking a red ball?',
        a:'Probability = (what you want) ÷ (total possible)\n\nTotal balls = 3 + 5 = 8\nRed balls = 3\n\nP(red) = 3/8\n\nProbability is always between 0 (impossible) and 1 (certain).',
        m:1
      },
      {
        q:'A fair die is rolled. Find the probability of getting an even number.',
        a:'A die has 6 faces: 1, 2, 3, 4, 5, 6\nEven numbers: 2, 4, 6 — that\'s 3 of them\n\nP(even) = 3/6 = 1/2\n\nSo there\'s a 50% chance of getting an even number.',
        m:1
      },
      {
        q:'Two coins are tossed. Find the probability of getting exactly one head.',
        a:'Write out ALL possibilities:\nHH, HT, TH, TT — 4 total\n\nExactly one head: HT and TH — 2 outcomes\n\nP(exactly one head) = 2/4 = 1/2\n\nNote: HT and TH are different! Order matters.',
        m:2
      },
      {
        q:'A bag has 4 red, 3 blue and 5 green balls. Find the probability of NOT picking red.',
        a:'Total balls = 4 + 3 + 5 = 12\nNot red = blue + green = 3 + 5 = 8\n\nP(not red) = 8/12 = 2/3\n\nShortcut: P(not red) = 1 − P(red) = 1 − 4/12 = 8/12 = 2/3\nBoth methods give the same answer.',
        m:2
      },
    ]},
    { name:'Sets', qs:[
      {
        q:'If A = {1, 2, 3, 4, 5} and B = {3, 4, 5, 6, 7}, find A ∪ B and A ∩ B.',
        a:'A ∪ B means UNION — all elements from both sets (no repeats):\nA ∪ B = {1, 2, 3, 4, 5, 6, 7}\n\nA ∩ B means INTERSECTION — only elements in BOTH sets:\nA ∩ B = {3, 4, 5}\n\nMemory trick:\n∪ = Union = everything together\n∩ = Intersection = only the overlap',
        m:2
      },
      {
        q:'In a class of 30 students, 18 play cricket, 15 play football and 8 play both. How many play neither?',
        a:'Students who play at least one sport:\n= Cricket + Football − Both\n= 18 + 15 − 8\n= 25\n\nWe subtract "both" because those 8 students were counted twice.\n\nNeither = 30 − 25 = 5 students',
        m:3
      },
      {
        q:'In a survey of 50 people, 30 like tea, 25 like coffee and 10 like both. How many like neither?',
        a:'At least one drink = 30 + 25 − 10 = 45\n\nNeither = 50 − 45 = 5 people\n\nThis formula comes up in almost every SEE exam:\nn(A ∪ B) = n(A) + n(B) − n(A ∩ B)',
        m:3
      },
    ]},
    { name:'Coordinate Geometry', qs:[
      {
        q:'Find the distance between points A(3, 4) and B(0, 0).',
        a:'Distance formula: d = √[(x₂−x₁)² + (y₂−y₁)²]\n\nd = √[(0−3)² + (0−4)²]\n= √[9 + 16]\n= √25\n= 5 units\n\nThis is just Pythagoras — the horizontal and vertical gaps form a right triangle.',
        m:2
      },
      {
        q:'Find the midpoint of the line joining A(2, 6) and B(8, 4).',
        a:'Midpoint = average of x-coordinates, average of y-coordinates\n\n= ((2+8)/2, (6+4)/2)\n= (10/2, 10/2)\n= (5, 5)',
        m:1
      },
      {
        q:'Find the gradient of the line passing through (1, 2) and (4, 8).',
        a:'Gradient = how much it goes up ÷ how much it goes across\n\n= (8−2) ÷ (4−1)\n= 6 ÷ 3\n= 2\n\nGradient of 2 means: for every 1 step right, you go 2 steps up.',
        m:2
      },
      {
        q:'The midpoint of AB is (3, 5). If A = (1, 3), find the coordinates of B.',
        a:'Midpoint = (3, 5), A = (1, 3)\n\nFor x: (1 + x₂) ÷ 2 = 3\n1 + x₂ = 6\nx₂ = 5\n\nFor y: (3 + y₂) ÷ 2 = 5\n3 + y₂ = 10\ny₂ = 7\n\nB = (5, 7)',
        m:2
      },
    ]},
    { name:'Matrices', qs:[
      {
        q:'Find the determinant of the matrix [[3, 1], [2, 4]].',
        a:'For a 2×2 matrix [[a, b], [c, d]]:\ndet = (a × d) − (b × c)\n\n= (3 × 4) − (1 × 2)\n= 12 − 2\n= 10',
        m:1
      },
      {
        q:'Add the matrices [[1, 2], [3, 4]] and [[5, 6], [7, 8]].',
        a:'Just add the numbers in the same position:\n\nTop left: 1+5 = 6\nTop right: 2+6 = 8\nBottom left: 3+7 = 10\nBottom right: 4+8 = 12\n\nAnswer: [[6, 8], [10, 12]]',
        m:1
      },
      {
        q:'Find the inverse of the matrix [[2, 1], [5, 3]].',
        a:'Step 1: Find the determinant\ndet = (2×3) − (1×5) = 6 − 5 = 1\n\nStep 2: Swap the diagonal, change signs of the other two\nSwap 2 and 3: [[3, ...], [..., 2]]\nChange signs of 1 and 5: [[3, −1], [−5, 2]]\n\nStep 3: Divide by the determinant (which is 1 here)\nInverse = [[3, −1], [−5, 2]]',
        m:3
      },
    ]},
    { name:'Arithmetic', qs:[
      {
        q:'A shopkeeper bought an article for Rs 250 and sold it for Rs 300. Find the profit percentage.',
        a:'Profit = Selling price − Cost price\n= 300 − 250 = Rs 50\n\nProfit % = (Profit ÷ Cost price) × 100\n= (50 ÷ 250) × 100\n= 20%\n\nAlways calculate % on the COST PRICE — not the selling price.',
        m:2
      },
      {
        q:'Find the simple interest on Rs 5,000 at 8% per annum for 3 years.',
        a:'Formula: SI = (P × R × T) ÷ 100\nP = 5000, R = 8, T = 3\n\nSI = (5000 × 8 × 3) ÷ 100\n= 120,000 ÷ 100\n= Rs 1,200',
        m:2
      },
      {
        q:'After a 20% discount, a shirt costs Rs 480. What was the original price?',
        a:'After 20% off, the student pays 80% of the original price.\n\n80% of original = 480\nOriginal = 480 × 100 ÷ 80\n= Rs 600\n\nCommon mistake: Do NOT subtract 20% from 480. The discount came off the original price, not 480.',
        m:2
      },
      {
        q:'Find the compound interest on Rs 10,000 at 10% per annum for 2 years.',
        a:'Formula: A = P × (1 + R/100)ⁿ\n\nA = 10000 × (1 + 10/100)²\n= 10000 × (1.1)²\n= 10000 × 1.21\n= Rs 12,100\n\nCI = Amount − Principal\n= 12,100 − 10,000\n= Rs 2,100\n\nCompound interest is bigger than simple interest because each year the interest also earns interest.',
        m:4
      },
    ]},
    { name:'Geometry', qs:[
      {
        q:'Two angles of a triangle are 60° and 70°. Find the third angle.',
        a:'All three angles of any triangle always add up to 180°.\n\nThird angle = 180° − 60° − 70° = 50°',
        m:1
      },
      {
        q:'The angles of a triangle are in the ratio 2:3:4. Find each angle.',
        a:'Let the angles be 2x, 3x and 4x.\n\nThey must add to 180°:\n2x + 3x + 4x = 180°\n9x = 180°\nx = 20°\n\nAngles: 40°, 60°, 80°\n\nCheck: 40 + 60 + 80 = 180° ✓',
        m:2
      },
      {
        q:'In a right-angled triangle, the two shorter sides are 6 cm and 8 cm. Find the hypotenuse.',
        a:'The hypotenuse is the longest side — always opposite the right angle.\n\nPythagoras: c² = a² + b²\nc² = 6² + 8²\nc² = 36 + 64 = 100\nc = √100 = 10 cm',
        m:2
      },
    ]},
  ]
};
