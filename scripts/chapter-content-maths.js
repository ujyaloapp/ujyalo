/* ============================================================
   chapter-content-maths.js
   SEE Maths — all chapters with descriptive model answers
   ============================================================ */
const CHAPTER_CONTENT = {
  subject: 'maths',
  label: 'Maths',
  icon: '🧮',
  chapters: [
    { name:'Algebra', qs:[
      {
        q:'Solve: 3x + 7 = 22. Show your working.',
        a:'Step 1: Move the number to the right side by subtracting 7 from both sides.\n3x = 22 − 7\n3x = 15\n\nStep 2: Divide both sides by 3 to find x.\nx = 15 ÷ 3\nx = 5\n\n✓ Why this works: Whatever you do to one side of an equation, you must do to the other. This keeps the equation balanced.',
        m:2
      },
      {
        q:'Factorise: x² − 7x + 12',
        a:'To factorise a quadratic, find two numbers that:\n• Multiply to give +12 (the last number)\n• Add to give −7 (the middle number)\n\nThose numbers are −3 and −4 (because −3 × −4 = 12 and −3 + −4 = −7)\n\nAnswer: (x − 3)(x − 4)\n\n✓ Check by expanding: (x−3)(x−4) = x² − 4x − 3x + 12 = x² − 7x + 12 ✓',
        m:2
      },
      {
        q:'Solve: 5x − 3 = 2x + 9',
        a:'Step 1: Collect x terms on one side.\n5x − 2x = 9 + 3\n3x = 12\n\nStep 2: Divide both sides by 3.\nx = 4\n\n✓ Key idea: Always move x terms to one side and numbers to the other before dividing.',
        m:2
      },
      {
        q:'If 2x + 3y = 12 and x = 3, find the value of y.',
        a:'When you are given the value of one variable, substitute it directly into the equation.\n\n2(3) + 3y = 12\n6 + 3y = 12\n3y = 12 − 6\n3y = 6\ny = 2\n\n✓ Always substitute first, then simplify.',
        m:2
      },
      {
        q:'Expand and simplify: (x + 4)(x − 3)',
        a:'Use the FOIL method (First, Outer, Inner, Last):\nFirst: x × x = x²\nOuter: x × −3 = −3x\nInner: 4 × x = +4x\nLast: 4 × −3 = −12\n\nCombine: x² − 3x + 4x − 12\n= x² + x − 12\n\n✓ Always collect like terms at the end.',
        m:2
      },
      {
        q:'Solve the quadratic equation x² − 5x + 6 = 0 by factorisation.',
        a:'Step 1: Find two numbers that multiply to 6 and add to −5.\nThose numbers are −2 and −3.\n\nStep 2: Factorise.\nx² − 5x + 6 = (x − 2)(x − 3)\n\nStep 3: Set each bracket to zero.\nx − 2 = 0  →  x = 2\nx − 3 = 0  →  x = 3\n\nAnswer: x = 2 or x = 3\n\n✓ A quadratic equation always has two solutions (they can sometimes be equal).',
        m:4
      },
      {
        q:'The sum of two numbers is 18 and their difference is 4. Find both numbers.',
        a:'Let the two numbers be x and y.\n\nForm two equations:\nx + y = 18  ... (1)\nx − y = 4   ... (2)\n\nAdd both equations together:\n2x = 22\nx = 11\n\nSubstitute into (1):\n11 + y = 18\ny = 7\n\nThe numbers are 11 and 7.\n\n✓ Check: 11 + 7 = 18 ✓ and 11 − 7 = 4 ✓',
        m:3
      },
    ]},
    { name:'Mensuration', qs:[
      {
        q:'Find the area of a circle with radius 7 cm. (Use π = 22/7)',
        a:'Formula: Area = πr²\n\n= (22/7) × 7²\n= (22/7) × 49\n= 22 × 7       ← the 7s cancel\n= 154 cm²\n\n✓ Key idea: Always square the radius first, then multiply by π. The unit for area is always cm² (squared).',
        m:2
      },
      {
        q:'Find the volume of a cylinder with radius 5 cm and height 10 cm. (Use π = 22/7)',
        a:'Formula: Volume = πr²h\n\n= (22/7) × 5² × 10\n= (22/7) × 25 × 10\n= (22 × 250) / 7\n= 5500 / 7\n≈ 785.7 cm³\n\n✓ Think of a cylinder as a circle (the base) stretched upward by the height. Volume = base area × height.',
        m:2
      },
      {
        q:'A rectangle has length 12 cm and width 8 cm. Find its area and perimeter.',
        a:'Area = length × width\n= 12 × 8\n= 96 cm²\n\nPerimeter = 2 × (length + width)\n= 2 × (12 + 8)\n= 2 × 20\n= 40 cm\n\n✓ Area measures the space inside (cm²). Perimeter measures the distance around the outside (cm).',
        m:2
      },
      {
        q:'A circular garden has a diameter of 28 m. Find its area. (Use π = 22/7)',
        a:'Important: The formula uses radius, not diameter.\nRadius = diameter ÷ 2 = 28 ÷ 2 = 14 m\n\nArea = πr²\n= (22/7) × 14²\n= (22/7) × 196\n= 22 × 28       ← 196 ÷ 7 = 28\n= 616 m²\n\n✓ Common mistake: Many students forget to halve the diameter. Always convert to radius first.',
        m:3
      },
      {
        q:'The total surface area of a cylinder is 660 cm². If the radius is 5 cm, find the height.',
        a:'Formula: TSA = 2πr(r + h)\n\n660 = 2 × (22/7) × 5 × (5 + h)\n660 = (220/7) × (5 + h)\n\nMultiply both sides by 7:\n4620 = 220 × (5 + h)\n\nDivide both sides by 220:\n5 + h = 21\nh = 16 cm\n\n✓ When the unknown is inside brackets, first isolate the bracket, then solve for the unknown.',
        m:4
      },
    ]},
    { name:'Trigonometry', qs:[
      {
        q:'If sin θ = 3/5, find the values of cos θ and tan θ.',
        a:'Given: sin θ = 3/5\nThis means: opposite = 3, hypotenuse = 5\n\nFind the adjacent side using Pythagoras:\nadjacent = √(hypotenuse² − opposite²)\n= √(25 − 9)\n= √16 = 4\n\ncos θ = adjacent / hypotenuse = 4/5\ntan θ = opposite / adjacent = 3/4\n\n✓ Remember SOH CAH TOA:\nSin = Opposite/Hypotenuse\nCos = Adjacent/Hypotenuse\nTan = Opposite/Adjacent',
        m:2
      },
      {
        q:'Find the value of: sin 30° + cos 60° − tan 45°',
        a:'You must memorise these standard values:\nsin 30° = 1/2\ncos 60° = 1/2\ntan 45° = 1\n\nNow substitute:\n= 1/2 + 1/2 − 1\n= 1 − 1\n= 0\n\n✓ These standard angle values appear in almost every SEE exam. Learn them by heart.',
        m:2
      },
      {
        q:'A ladder 10 m long leans against a wall at an angle of 60° with the ground. How high up the wall does it reach?',
        a:'Draw the situation: The ladder is the hypotenuse (10 m). The angle with the ground is 60°. The height up the wall is the opposite side.\n\nUsing sin: sin θ = opposite / hypotenuse\nsin 60° = height / 10\n\nHeight = 10 × sin 60°\n= 10 × (√3/2)\n= 10 × 0.866\n= 8.66 m\n\n✓ Always draw a diagram first. Identify which sides you have and which trig ratio connects them.',
        m:3
      },
      {
        q:'Prove that: sin²θ + cos²θ = 1',
        a:'Consider a right-angled triangle with:\nOpposite = a, Adjacent = b, Hypotenuse = c\n\nBy Pythagoras: a² + b² = c²\n\nNow: sin θ = a/c  and  cos θ = b/c\n\nsin²θ + cos²θ\n= (a/c)² + (b/c)²\n= a²/c² + b²/c²\n= (a² + b²) / c²\n= c² / c²      ← because a² + b² = c²\n= 1  ✓\n\n✓ This identity is fundamental in trigonometry and used in many proofs.',
        m:2
      },
    ]},
    { name:'Statistics', qs:[
      {
        q:'Find the mean of: 12, 18, 24, 15, 21',
        a:'Mean = Sum of all values ÷ Number of values\n\nSum = 12 + 18 + 24 + 15 + 21 = 90\nCount = 5\n\nMean = 90 ÷ 5 = 18\n\n✓ The mean is the "fair share" value — if all values were equal, each would be 18.',
        m:2
      },
      {
        q:'Find the median of: 4, 7, 2, 9, 3, 8, 5',
        a:'Step 1: Arrange in ascending order.\n2, 3, 4, 5, 7, 8, 9\n\nStep 2: Find the middle value.\nThere are 7 values. The middle is the 4th value.\n\nMedian = 5\n\n✓ For an odd number of values: median = the middle value.\nFor an even number: median = average of the two middle values.\n✓ Never find the median without sorting first — this is the most common mistake.',
        m:2
      },
      {
        q:'The mean of 5 numbers is 12. Four of the numbers are 10, 14, 8 and 16. Find the fifth number.',
        a:'Key idea: if you know the mean and count, you can find the total sum.\n\nTotal sum = mean × count = 12 × 5 = 60\n\nSum of the four known numbers = 10 + 14 + 8 + 16 = 48\n\nFifth number = Total sum − Known sum\n= 60 − 48\n= 12',
        m:2
      },
      {
        q:'Find the mean, median and mode of: 5, 8, 4, 5, 10, 7, 5, 8',
        a:'First arrange in order: 4, 5, 5, 5, 7, 8, 8, 10\n\nMean:\nSum = 4+5+5+5+7+8+8+10 = 52\nMean = 52 ÷ 8 = 6.5\n\nMedian (8 values — average the 4th and 5th):\n4th value = 5, 5th value = 7\nMedian = (5 + 7) ÷ 2 = 6\n\nMode (most frequent):\n5 appears 3 times — Mode = 5\n\n✓ Mean, median and mode are all "averages" but they measure different things.',
        m:4
      },
    ]},
    { name:'Probability', qs:[
      {
        q:'A bag contains 3 red and 5 blue balls. What is the probability of picking a red ball?',
        a:'Probability = Favourable outcomes / Total outcomes\n\nTotal balls = 3 + 5 = 8\nFavourable outcomes (red balls) = 3\n\nP(red) = 3/8\n\n✓ Probability is always between 0 and 1.\n0 = impossible, 1 = certain.\n3/8 = 0.375, meaning roughly a 37.5% chance.',
        m:1
      },
      {
        q:'A fair die is rolled. Find the probability of getting an even number.',
        a:'A die has 6 faces: 1, 2, 3, 4, 5, 6\nTotal outcomes = 6\nEven numbers = 2, 4, 6 → 3 outcomes\n\nP(even) = 3/6 = 1/2\n\n✓ Always list the total possible outcomes before counting the favourable ones.',
        m:1
      },
      {
        q:'Two coins are tossed. Find the probability of getting exactly one head.',
        a:'List ALL possible outcomes:\nHH, HT, TH, TT → 4 total outcomes\n\nOutcomes with exactly one head:\nHT (head then tail) and TH (tail then head) → 2 outcomes\n\nP(exactly one head) = 2/4 = 1/2\n\n✓ When tossing two coins, always list all four outcomes. HT and TH are different outcomes.',
        m:2
      },
      {
        q:'A bag has 4 red, 3 blue and 5 green balls. A ball is drawn at random. Find the probability that it is not red.',
        a:'Total balls = 4 + 3 + 5 = 12\n\nMethod 1 (direct):\nNot red = blue + green = 3 + 5 = 8\nP(not red) = 8/12 = 2/3\n\nMethod 2 (complement rule):\nP(not red) = 1 − P(red) = 1 − 4/12 = 8/12 = 2/3\n\n✓ The complement rule: P(event does NOT happen) = 1 − P(event happens). Very useful shortcut.',
        m:2
      },
    ]},
    { name:'Sets', qs:[
      {
        q:'If A = {1, 2, 3, 4, 5} and B = {3, 4, 5, 6, 7}, find A ∪ B and A ∩ B.',
        a:'A ∪ B (Union — ALL elements from BOTH sets, no repeats):\n= {1, 2, 3, 4, 5, 6, 7}\n\nA ∩ B (Intersection — only elements in BOTH sets):\n= {3, 4, 5}\n\n✓ Memory trick:\n∪ looks like a "U" — Union — put everything together.\n∩ looks like an upside-down U — Intersection — only what overlaps.',
        m:2
      },
      {
        q:'In a class of 30 students, 18 play cricket, 15 play football and 8 play both. How many play neither?',
        a:'Use the formula:\nn(C ∪ F) = n(C) + n(F) − n(C ∩ F)\n= 18 + 15 − 8\n= 25\n\nStudents who play at least one sport = 25\nStudents who play neither = Total − 25\n= 30 − 25\n= 5 students\n\n✓ We subtract the "both" group because they are counted twice (once in cricket, once in football).',
        m:3
      },
      {
        q:'In a survey of 50 people, 30 like tea, 25 like coffee and 10 like both. How many like neither?',
        a:'n(T ∪ C) = n(T) + n(C) − n(T ∩ C)\n= 30 + 25 − 10\n= 45\n\nNeither = 50 − 45 = 5 people\n\n✓ This type of question appears very frequently in SEE. Master the formula:\nn(A ∪ B) = n(A) + n(B) − n(A ∩ B)',
        m:3
      },
    ]},
    { name:'Coordinate Geometry', qs:[
      {
        q:'Find the distance between points A(3, 4) and B(0, 0).',
        a:'Distance formula: d = √[(x₂−x₁)² + (y₂−y₁)²]\n\nd = √[(0−3)² + (0−4)²]\n= √[9 + 16]\n= √25\n= 5 units\n\n✓ This formula comes directly from Pythagoras. The horizontal and vertical distances form two sides of a right triangle, and the distance is the hypotenuse.',
        m:2
      },
      {
        q:'Find the midpoint of the line joining A(2, 6) and B(8, 4).',
        a:'Midpoint formula: M = ((x₁+x₂)/2, (y₁+y₂)/2)\n\nM = ((2+8)/2, (6+4)/2)\n= (10/2, 10/2)\n= (5, 5)\n\n✓ The midpoint is simply the average of the x-coordinates and the average of the y-coordinates.',
        m:1
      },
      {
        q:'Find the gradient of the line passing through (1, 2) and (4, 8).',
        a:'Gradient formula: m = (y₂−y₁) / (x₂−x₁)\n\nm = (8−2) / (4−1)\n= 6 / 3\n= 2\n\n✓ Gradient measures steepness. A gradient of 2 means: for every 1 unit you move right, you go up 2 units.\nPositive gradient = line goes upward from left to right.\nNegative gradient = line goes downward.',
        m:2
      },
      {
        q:'The midpoint of AB is (3, 5). If A = (1, 3), find the coordinates of B.',
        a:'Using the midpoint formula in reverse:\n(x₁+x₂)/2 = 3  →  1+x₂ = 6  →  x₂ = 5\n(y₁+y₂)/2 = 5  →  3+y₂ = 10  →  y₂ = 7\n\nB = (5, 7)\n\n✓ If midpoint = (mx, my), then the other endpoint = (2mx − x₁, 2my − y₁)',
        m:2
      },
    ]},
    { name:'Matrices', qs:[
      {
        q:'Find the determinant of the matrix [[3, 1], [2, 4]].',
        a:'For a 2×2 matrix [[a, b], [c, d]]:\nDeterminant = ad − bc\n\n= (3 × 4) − (1 × 2)\n= 12 − 2\n= 10\n\n✓ The determinant tells you important properties of the matrix. If det = 0, the matrix has no inverse.',
        m:1
      },
      {
        q:'Add the matrices [[1, 2], [3, 4]] and [[5, 6], [7, 8]].',
        a:'Add corresponding elements (same position):\n\n[[1+5, 2+6], [3+7, 4+8]]\n= [[6, 8], [10, 12]]\n\n✓ You can only add matrices that have the same dimensions. Add row by row, column by column.',
        m:1
      },
      {
        q:'Find the inverse of the matrix [[2, 1], [5, 3]].',
        a:'Step 1: Find the determinant.\ndet = (2×3) − (1×5) = 6 − 5 = 1\n\nStep 2: Apply the inverse formula.\nFor [[a,b],[c,d]], inverse = (1/det) × [[d, −b], [−c, a]]\n\nInverse = (1/1) × [[3, −1], [−5, 2]]\n= [[3, −1], [−5, 2]]\n\n✓ Check: Original × Inverse should give the identity matrix [[1,0],[0,1]].',
        m:3
      },
    ]},
    { name:'Arithmetic', qs:[
      {
        q:'A shopkeeper bought an article for Rs 250 and sold it for Rs 300. Find the profit percentage.',
        a:'Profit = Selling Price − Cost Price\n= 300 − 250 = Rs 50\n\nProfit % = (Profit / Cost Price) × 100\n= (50 / 250) × 100\n= 20%\n\n✓ Always calculate profit percentage on the COST PRICE, not the selling price. This is a very common mistake in exams.',
        m:2
      },
      {
        q:'Find the simple interest on Rs 5,000 at 8% per annum for 3 years.',
        a:'Formula: SI = (P × R × T) / 100\nWhere: P = Principal, R = Rate, T = Time\n\nSI = (5000 × 8 × 3) / 100\n= 120,000 / 100\n= Rs 1,200\n\n✓ Simple interest is always calculated on the original principal only. It does not change year by year.',
        m:2
      },
      {
        q:'After a 20% discount, a shirt costs Rs 480. What was the original price?',
        a:'After 20% discount, the customer pays 80% of the original price.\n(100% − 20% = 80%)\n\nSo: 80% of original = Rs 480\nOriginal = 480 × (100/80)\n= 480 × 1.25\n= Rs 600\n\n✓ Do not subtract 20% from 480 — that is a common mistake. The discount was taken from the ORIGINAL price, which is what we are finding.',
        m:2
      },
      {
        q:'Find the compound interest on Rs 10,000 at 10% per annum for 2 years.',
        a:'Formula: A = P(1 + R/100)ⁿ\n\nA = 10000 × (1 + 10/100)²\n= 10000 × (1.1)²\n= 10000 × 1.21\n= Rs 12,100\n\nCI = A − P\n= 12,100 − 10,000\n= Rs 2,100\n\n✓ Compound interest grows each year because the interest from the previous year is added to the principal. This is why it gives more than simple interest.',
        m:4
      },
    ]},
    { name:'Geometry', qs:[
      {
        q:'Two angles of a triangle are 60° and 70°. Find the third angle.',
        a:'The sum of all interior angles of a triangle = 180°\n\nThird angle = 180° − 60° − 70°\n= 50°\n\n✓ This rule is true for ALL triangles — equilateral, isosceles, scalene, right-angled. Always 180°.',
        m:1
      },
      {
        q:'The angles of a triangle are in the ratio 2:3:4. Find each angle.',
        a:'Let the angles be 2x, 3x and 4x.\n\nThey must add up to 180°:\n2x + 3x + 4x = 180°\n9x = 180°\nx = 20°\n\nFirst angle: 2 × 20 = 40°\nSecond angle: 3 × 20 = 60°\nThird angle: 4 × 20 = 80°\n\n✓ Check: 40 + 60 + 80 = 180° ✓',
        m:2
      },
      {
        q:'In a right-angled triangle, the two shorter sides are 6 cm and 8 cm. Find the hypotenuse.',
        a:'Pythagoras theorem: c² = a² + b²\n(where c is the hypotenuse — the longest side, opposite the right angle)\n\nc² = 6² + 8²\n= 36 + 64\n= 100\nc = √100 = 10 cm\n\n✓ The hypotenuse is ALWAYS the side opposite the right angle. It is always the longest side.',
        m:2
      },
    ]},
  ]
};
