/* chapter-content-maths.js
   SEE Grade 10 — Compulsory Mathematics
   Based on CDC Nepal Grade 10 Textbook (2074 BS)
   18 chapters grouped into 8 main categories
   ============================================ */

const CHAPTER_CONTENT = {
  subject: 'maths',
  label: 'Maths',
  icon: '🧮',
  groups: [
    {
      name: 'Sets',
      icon: '⊂',
      chapters: [
        {
          name: 'Sets — Two Sets',
          qs: [
            {
              q: 'In a class of 40 students, 25 like Maths and 30 like Science. If every student likes at least one subject, how many like both?',
              a: 'Use the formula: n(M∪S) = n(M) + n(S) − n(M∩S)\n\n40 = 25 + 30 − n(M∩S)\n40 = 55 − n(M∩S)\nn(M∩S) = 55 − 40 = 15\n\n15 students like both subjects.\n\nWe subtract "both" because those students are counted twice — once in each set.',
              m: 3
            },
            {
              q: 'If n(A) = 30, n(B) = 25 and n(A∪B) = 45, find n(A∩B).',
              a: 'Formula: n(A∪B) = n(A) + n(B) − n(A∩B)\n\n45 = 30 + 25 − n(A∩B)\n45 = 55 − n(A∩B)\nn(A∩B) = 55 − 45 = 10',
              m: 3
            },
            {
              q: 'In a survey of 200 people, 120 read newspapers and 80 read magazines. 50 read both. How many read neither?',
              a: 'Step 1: Find those who read at least one.\nn(N∪M) = 120 + 80 − 50 = 150\n\nStep 2: Neither = Total − at least one\n= 200 − 150 = 50 people',
              m: 3
            },
            {
              q: 'In a group, 70% like tea and 60% like coffee. If 20% like neither, find the percent who like both.',
              a: 'Those who like at least one = 100% − 20% = 80%\n\nn(T∪C) = n(T) + n(C) − n(T∩C)\n80 = 70 + 60 − n(T∩C)\nn(T∩C) = 130 − 80 = 50%\n\n50% like both.',
              m: 4
            },
          ]
        },
        {
          name: 'Sets — Three Sets',
          qs: [
            {
              q: 'In a survey of 60 students: 30 like cricket, 25 football, 20 volleyball. 10 like cricket and football, 8 football and volleyball, 7 cricket and volleyball, 5 like all three. How many like at least one?',
              a: 'n(C∪F∪V) = n(C) + n(F) + n(V) − n(C∩F) − n(F∩V) − n(C∩V) + n(C∩F∩V)\n= 30 + 25 + 20 − 10 − 8 − 7 + 5\n= 75 − 25 + 5\n= 55 students',
              m: 4
            },
            {
              q: 'n(A)=25, n(B)=20, n(C)=18, n(A∩B)=8, n(B∩C)=6, n(A∩C)=5, n(A∩B∩C)=3. Find n(A∪B∪C).',
              a: 'n(A∪B∪C) = 25 + 20 + 18 − 8 − 6 − 5 + 3\n= 63 − 19 + 3\n= 47',
              m: 4
            },
            {
              q: 'In a survey of 100 students, 60% like mathematics, 55% like science and 45% like English. 30% like maths and science, 25% like science and English, 20% like maths and English. If 5% like none, find the percentage who like all three.',
              a: 'Those who like at least one = 100 − 5 = 95%\n\nn(M∪S∪E) = n(M)+n(S)+n(E) − n(M∩S) − n(S∩E) − n(M∩E) + n(M∩S∩E)\n95 = 60 + 55 + 45 − 30 − 25 − 20 + n(M∩S∩E)\n95 = 160 − 75 + n(M∩S∩E)\n95 = 85 + n(M∩S∩E)\nn(M∩S∩E) = 10%\n\n10% like all three subjects.',
              m: 4
            },
          ]
        },
      ]
    },

    {
      name: 'Arithmetic',
      icon: '💰',
      chapters: [
        {
          name: 'Tax and Money Exchange',
          qs: [
            {
              q: 'The marked price of a mobile is Rs 15,000. A shopkeeper gives 10% discount and charges 13% VAT. How much does the customer pay?',
              a: 'Step 1: Discount amount = 10% of 15,000 = Rs 1,500\nStep 2: Selling price after discount = 15,000 − 1,500 = Rs 13,500\nStep 3: VAT = 13% of 13,500 = Rs 1,755\nTotal paid = 13,500 + 1,755 = Rs 15,255\n\nImportant: VAT is always calculated on the price AFTER discount, not on the marked price.',
              m: 4
            },
            {
              q: 'A customer paid Rs 28,249 for a TV after 10% discount and 13% VAT. Find the marked price.',
              a: 'Let marked price = x\nAfter 10% discount: SP = 0.9x\nAfter 13% VAT: Total = 0.9x × 1.13 = 1.017x\n\n1.017x = 28,249\nx = 28,249 ÷ 1.017 ≈ Rs 27,777\n\nMarked price ≈ Rs 27,777',
              m: 4
            },
            {
              q: 'Convert $500 into Nepali rupees if $1 = Rs 133. A broker takes 2% commission. How much will you need?',
              a: '$500 = 500 × 133 = Rs 66,500\nBroker commission = 2% of 66,500 = Rs 1,330\nTotal needed = 66,500 + 1,330 = Rs 67,830',
              m: 3
            },
            {
              q: 'A person earns Rs 6,00,000 per year. Tax: first Rs 4,00,000 is tax free, next Rs 1,00,000 at 1%, remaining at 15%. Find the income tax.',
              a: 'First Rs 4,00,000 → tax = Rs 0\nNext Rs 1,00,000 → 1% tax = Rs 1,000\nRemaining = 6,00,000 − 5,00,000 = Rs 1,00,000 → 15% = Rs 15,000\n\nTotal income tax = 0 + 1,000 + 15,000 = Rs 16,000',
              m: 4
            },
          ]
        },
        {
          name: 'Compound Interest',
          qs: [
            {
              q: 'Find the compound interest on Rs 20,000 at 10% per annum for 2 years.',
              a: 'Formula: CA = P(1 + R/100)ᵀ\n\nCA = 20,000 × (1.1)² = 20,000 × 1.21 = Rs 24,200\n\nCI = CA − P = 24,200 − 20,000 = Rs 4,200\n\nEach year the interest earns more interest — this is why CI is always more than simple interest.',
              m: 3
            },
            {
              q: 'Find the difference between CI and SI on Rs 50,000 at 10% per annum for 2 years.',
              a: 'SI = (50,000 × 10 × 2) / 100 = Rs 10,000\n\nCA = 50,000 × (1.1)² = 50,000 × 1.21 = Rs 60,500\nCI = 60,500 − 50,000 = Rs 10,500\n\nDifference = 10,500 − 10,000 = Rs 500',
              m: 4
            },
            {
              q: 'A sum amounts to Rs 7,260 in 2 years and Rs 7,986 in 3 years at compound interest. Find the rate.',
              a: 'The amount grew from Rs 7,260 to Rs 7,986 in one year.\n\n7,260 × (1 + R/100) = 7,986\n1 + R/100 = 7,986 / 7,260 = 1.1\nR/100 = 0.1\nR = 10% per annum',
              m: 4
            },
            {
              q: 'Rs 1,50,000 is borrowed at 12% per annum compounded half-yearly. Find the amount after 1 year.',
              a: 'Half-yearly: Rate per period = 12/2 = 6%, Number of periods = 2\n\nCA = 1,50,000 × (1.06)² = 1,50,000 × 1.1236 = Rs 1,68,540',
              m: 4
            },
          ]
        },
        {
          name: 'Population Growth & Depreciation',
          qs: [
            {
              q: 'The population of a village was 45,000 in 2070 BS. If the growth rate is 2.5%, find the population in 2073 BS.',
              a: 'Formula: PT = P₀(1 + R/100)ᵀ\n\nPT = 45,000 × (1.025)³\n= 45,000 × 1.07689\n≈ 48,460\n\nThis uses the same formula as compound interest — population grows like money in a bank.',
              m: 3
            },
            {
              q: 'The present population of a city is 67,600. Annual growth rate is 4%. Find the population 2 years ago.',
              a: 'PT = P₀(1 + R/100)ᵀ\n67,600 = P₀ × (1.04)²\n67,600 = P₀ × 1.0816\nP₀ = 67,600 / 1.0816 = 62,500\n\nPopulation 2 years ago was 62,500.',
              m: 3
            },
            {
              q: 'A motorcycle costs Rs 1,50,000. Its value depreciates at 10% per year. Find its value after 3 years.',
              a: 'Depreciation formula: VT = V₀(1 − R/100)ᵀ\n\nVT = 1,50,000 × (0.9)³\n= 1,50,000 × 0.729\n= Rs 1,09,350\n\nDepreciation uses (1 − R/100) because the value decreases each year.',
              m: 3
            },
            {
              q: 'A machine bought for Rs 1,00,000 is worth Rs 81,000 after 2 years. Find the rate of compound depreciation.',
              a: '81,000 = 1,00,000 × (1 − R/100)²\n(1 − R/100)² = 0.81\n1 − R/100 = √0.81 = 0.9\nR/100 = 0.1\nR = 10% per year',
              m: 4
            },
          ]
        },
      ]
    },

    {
      name: 'Mensuration',
      icon: '📐',
      chapters: [
        {
          name: 'Plane Surface (Area)',
          qs: [
            {
              q: 'Find the area of an equilateral triangle with side 8 cm.',
              a: 'Formula: Area = (√3/4) × side²\n\nArea = (√3/4) × 64\n= 16√3\n= 16 × 1.732\n≈ 27.71 cm²',
              m: 2
            },
            {
              q: 'An isosceles triangle has equal sides 10 cm and base 12 cm. Find its area.',
              a: 'Find height using Pythagoras:\nh = √(10² − 6²) = √(100 − 36) = √64 = 8 cm\n\nArea = ½ × base × height\n= ½ × 12 × 8\n= 48 cm²',
              m: 3
            },
            {
              q: 'Find the area of a trapezium with parallel sides 15 cm and 9 cm, and height 8 cm.',
              a: 'Area = ½ × (sum of parallel sides) × height\n= ½ × (15 + 9) × 8\n= ½ × 24 × 8\n= 96 cm²',
              m: 2
            },
            {
              q: 'A rhombus has diagonals 16 cm and 12 cm. Find its area and perimeter.',
              a: 'Area = ½ × d₁ × d₂ = ½ × 16 × 12 = 96 cm²\n\nFor perimeter: diagonals bisect at right angles\nHalf-diagonals = 8 and 6\nSide = √(8² + 6²) = √100 = 10 cm\nPerimeter = 4 × 10 = 40 cm',
              m: 4
            },
          ]
        },
        {
          name: 'Cylinder and Sphere',
          qs: [
            {
              q: 'Find the total surface area and volume of a cylinder with radius 7 cm and height 10 cm. (π = 22/7)',
              a: 'TSA = 2πr(r + h) = 2 × (22/7) × 7 × (7+10)\n= 2 × 22 × 17 = 748 cm²\n\nVolume = πr²h = (22/7) × 49 × 10\n= 22 × 7 × 10 = 1,540 cm³',
              m: 4
            },
            {
              q: 'Find the surface area and volume of a sphere with radius 21 cm. (π = 22/7)',
              a: 'Surface Area = 4πr²\n= 4 × (22/7) × 441\n= 4 × 22 × 63 = 5,544 cm²\n\nVolume = (4/3)πr³\n= (4/3) × (22/7) × 9261\n= (4 × 22 × 1323) / 3\n= 38,808 cm³',
              m: 4
            },
            {
              q: 'A hemisphere has radius 14 cm. Find its curved surface area and total surface area. (π = 22/7)',
              a: 'CSA = 2πr² = 2 × (22/7) × 196\n= 2 × 22 × 28 = 1,232 cm²\n\nTSA = 3πr² (curved + circular base)\n= 3 × (22/7) × 196\n= 3 × 22 × 28 = 1,848 cm²',
              m: 4
            },
          ]
        },
        {
          name: 'Prism and Pyramid',
          qs: [
            {
              q: 'A triangular prism has base triangle with sides 6, 8, 10 cm and length 15 cm. Find the lateral surface area and volume.',
              a: 'Base is a right triangle (6-8-10 is Pythagorean triple).\nPerimeter of base = 6 + 8 + 10 = 24 cm\n\nLateral SA = Perimeter × length = 24 × 15 = 360 cm²\n\nBase area = ½ × 6 × 8 = 24 cm²\nVolume = base area × length = 24 × 15 = 360 cm³',
              m: 4
            },
            {
              q: 'A square pyramid has base side 12 cm and slant height 10 cm. Find the total surface area.',
              a: 'Base area = 12² = 144 cm²\n\nLateral SA = 4 × (½ × base × slant height)\n= 4 × ½ × 12 × 10 = 240 cm²\n\nTSA = 144 + 240 = 384 cm²',
              m: 4
            },
            {
              q: 'A square pyramid has base side 6 cm and vertical height 4 cm. Find its volume.',
              a: 'Volume = ⅓ × base area × height\n= ⅓ × 36 × 4\n= 48 cm³',
              m: 3
            },
          ]
        },
      ]
    },

    {
      name: 'Algebra',
      icon: '🔣',
      chapters: [
        {
          name: 'HCF and LCM',
          qs: [
            {
              q: 'Find the HCF of x² − 4 and x² + x − 6.',
              a: 'Factorise:\nx² − 4 = (x+2)(x−2)\nx² + x − 6 = (x+3)(x−2)\n\nCommon factor = (x − 2)\nHCF = (x − 2)\n\nAlways factorise first, then find the common factors.',
              m: 3
            },
            {
              q: 'Find the LCM of x² − 1 and x² + 2x + 1.',
              a: 'Factorise:\nx² − 1 = (x+1)(x−1)\nx² + 2x + 1 = (x+1)²\n\nLCM takes the highest power of each factor:\n= (x+1)² × (x−1)',
              m: 3
            },
            {
              q: 'Find the HCF and LCM of x² − 5x + 6 and x² − x − 6.',
              a: 'Factorise:\nx² − 5x + 6 = (x−2)(x−3)\nx² − x − 6 = (x−3)(x+2)\n\nHCF = (x−3) — common factor\nLCM = (x−2)(x−3)(x+2) — all factors taking highest power',
              m: 4
            },
          ]
        },
        {
          name: 'Radical and Surd',
          qs: [
            {
              q: 'Simplify: √48 + √75 − √27',
              a: '√48 = √(16×3) = 4√3\n√75 = √(25×3) = 5√3\n√27 = √(9×3) = 3√3\n\n= 4√3 + 5√3 − 3√3\n= 6√3\n\nOnly surds with the same number under the root can be added or subtracted.',
              m: 2
            },
            {
              q: 'Rationalise the denominator: 5 / (2 + √3)',
              a: 'Multiply top and bottom by the conjugate (2 − √3):\n\n= 5(2−√3) / (2+√3)(2−√3)\n= 5(2−√3) / (4−3)\n= 5(2−√3) / 1\n= 10 − 5√3',
              m: 3
            },
            {
              q: 'Simplify: (√5 + √3)²',
              a: 'Use (a+b)² = a² + 2ab + b²\n\n= (√5)² + 2×√5×√3 + (√3)²\n= 5 + 2√15 + 3\n= 8 + 2√15',
              m: 2
            },
            {
              q: 'If x = 3 + 2√2, find x + 1/x.',
              a: '1/x = 1/(3+2√2)\nRationalise: multiply by (3−2√2)/(3−2√2)\n= (3−2√2)/(9−8) = 3−2√2\n\nx + 1/x = (3+2√2) + (3−2√2)\n= 6',
              m: 4
            },
          ]
        },
        {
          name: 'Indices',
          qs: [
            {
              q: 'Simplify: (2³ × 2⁴) ÷ 2⁵',
              a: 'Product law: aᵐ × aⁿ = aᵐ⁺ⁿ\nDivision law: aᵐ ÷ aⁿ = aᵐ⁻ⁿ\n\n= 2³⁺⁴ ÷ 2⁵ = 2⁷ ÷ 2⁵ = 2² = 4',
              m: 2
            },
            {
              q: 'Simplify: (x³y²)² ÷ (xy)³',
              a: 'Numerator: (x³y²)² = x⁶y⁴\nDenominator: (xy)³ = x³y³\n\n= x⁶y⁴ ÷ x³y³ = x³y',
              m: 3
            },
            {
              q: 'Evaluate: (27)^(2/3)',
              a: '27^(2/3) = (27^(1/3))² = (∛27)² = 3² = 9\n\nRule: x^(m/n) = (ⁿ√x)ᵐ — take the root first, then raise to the power.',
              m: 2
            },
            {
              q: 'If 2^(x+1) = 8^(x−1), find x.',
              a: 'Write 8 = 2³:\n2^(x+1) = 2^(3(x−1)) = 2^(3x−3)\n\nSince bases are equal:\nx + 1 = 3x − 3\n4 = 2x\nx = 2',
              m: 3
            },
          ]
        },
        {
          name: 'Algebraic Fractions',
          qs: [
            {
              q: 'Simplify: (x² − 9) / (x² + 5x + 6)',
              a: 'Numerator: x² − 9 = (x+3)(x−3)\nDenominator: x² + 5x + 6 = (x+2)(x+3)\n\n= (x+3)(x−3) / (x+2)(x+3)\n= (x−3) / (x+2)',
              m: 3
            },
            {
              q: 'Simplify: 1/(x−1) + 1/(x+1)',
              a: 'Common denominator = (x−1)(x+1)\n\n= (x+1)/[(x−1)(x+1)] + (x−1)/[(x−1)(x+1)]\n= [(x+1) + (x−1)] / (x²−1)\n= 2x / (x²−1)',
              m: 3
            },
            {
              q: 'Simplify: (x²−4)/(x+2) × (x+3)/(x−2)',
              a: 'Factorise x²−4 = (x+2)(x−2)\n\n= [(x+2)(x−2)/(x+2)] × [(x+3)/(x−2)]\n= x+3',
              m: 3
            },
          ]
        },
        {
          name: 'Equations',
          qs: [
            {
              q: 'Solve simultaneously: 2x + 3y = 12 and x − y = 1.',
              a: 'From x − y = 1: x = y + 1\n\nSubstitute:\n2(y+1) + 3y = 12\n5y + 2 = 12\n5y = 10, y = 2\nx = 3\n\nCheck: 2(3)+3(2)=12 ✓ and 3−2=1 ✓',
              m: 4
            },
            {
              q: '7 pens and 5 pencils cost Rs 375. 4 pens and 7 pencils cost Rs 264. Find the price of each.',
              a: '7x + 5y = 375 ...(1)\n4x + 7y = 264 ...(2)\n\nMultiply (1) by 7: 49x + 35y = 2625\nMultiply (2) by 5: 20x + 35y = 1320\nSubtract: 29x = 1305, x = 45\n\nFrom (1): 315 + 5y = 375, y = 12\n\nPen = Rs 45, Pencil = Rs 12',
              m: 4
            },
            {
              q: '6 years ago a father was 6 times his son\'s age. After 4 years, his age will be twice his son\'s. Find their present ages.',
              a: 'Let father\'s age = x, son\'s age = y\n\nCondition 1: x−6 = 6(y−6) → x = 6y−30 ...(1)\nCondition 2: x+4 = 2(y+4) → x = 2y+4 ...(2)\n\nFrom (1) and (2):\n6y−30 = 2y+4\n4y = 34, y = 8.5\n\nActually: x+4 = 2(y+4)\nx = 2y+4...(2)\n6y−30 = 2y+4\n4y = 34, y = 8.5, x = 21',
              m: 4
            },
          ]
        },
      ]
    },

    {
      name: 'Geometry',
      icon: '📏',
      chapters: [
        {
          name: 'Area of Triangles & Quadrilaterals',
          qs: [
            {
              q: 'A parallelogram has base 14 cm and height 9 cm. A diagonal divides it into two triangles. Find the area of each triangle.',
              a: 'Area of parallelogram = base × height = 14 × 9 = 126 cm²\n\nA diagonal divides it into two equal triangles.\nArea of each triangle = 126 / 2 = 63 cm²',
              m: 3
            },
            {
              q: 'Triangle ABC and parallelogram ABDE are on the same base AB and between the same parallels. If the parallelogram area is 80 cm², find the triangle area.',
              a: 'Theorem: A triangle on the same base and between the same parallels as a parallelogram has half the area.\n\nArea of triangle = ½ × 80 = 40 cm²',
              m: 3
            },
            {
              q: 'Triangles ABC and DBC are on the same base BC. If BD is parallel to AC and the area of triangle ABC is 30 cm², find the area of triangle DBC.',
              a: 'Triangles on the same base BC and between the same parallels (AC ∥ BD) have equal areas.\n\nArea of DBC = Area of ABC = 30 cm²',
              m: 3
            },
          ]
        },
        {
          name: 'Circle Theorems',
          qs: [
            {
              q: 'The central angle AOB = 120°. Find the inscribed angle ACB standing on the same arc AB.',
              a: 'Theorem: Central angle = 2 × inscribed angle (on same arc)\n\nInscribed angle = 120° / 2 = 60°\n\nThis is one of the most important circle theorems — always remember: central = 2 × inscribed.',
              m: 2
            },
            {
              q: 'Two inscribed angles ACB and ADB stand on the same arc AB. If ∠ACB = 35°, find ∠ADB.',
              a: 'Theorem: Inscribed angles standing on the same arc are equal.\n\n∠ADB = ∠ACB = 35°',
              m: 2
            },
            {
              q: 'An angle ABC is inscribed in a semicircle where AC is the diameter. Find ∠ABC.',
              a: 'Theorem: An angle inscribed in a semicircle is always a right angle.\n\n∠ABC = 90°\n\nThis is because the central angle of a diameter = 180°, and inscribed = half = 90°.',
              m: 2
            },
            {
              q: 'ABCD is a cyclic quadrilateral. If ∠A = 75°, find ∠C.',
              a: 'Theorem: Opposite angles of a cyclic quadrilateral add up to 180°.\n\n∠A + ∠C = 180°\n∠C = 180° − 75° = 105°',
              m: 3
            },
          ]
        },
      ]
    },

    {
      name: 'Trigonometry',
      icon: '📐',
      chapters: [
        {
          name: 'Trigonometry',
          qs: [
            {
              q: 'In a right-angled triangle, opposite = 5 cm and hypotenuse = 13 cm. Find sin θ, cos θ and tan θ.',
              a: 'Adjacent = √(13²−5²) = √(169−25) = √144 = 12 cm\n\nsin θ = 5/13\ncos θ = 12/13\ntan θ = 5/12\n\nRemember SOH CAH TOA.',
              m: 3
            },
            {
              q: 'Find: sin²30° + cos²60° + tan²45°',
              a: 'sin 30° = 1/2, so sin²30° = 1/4\ncos 60° = 1/2, so cos²60° = 1/4\ntan 45° = 1, so tan²45° = 1\n\n= 1/4 + 1/4 + 1 = 3/2',
              m: 3
            },
            {
              q: 'A ladder of 10 m leans against a wall making 30° with the wall. Find the height it reaches.',
              a: 'Angle with wall = 30°, ladder = hypotenuse = 10 m\n\ncos 30° = height / 10\n(√3/2) = height / 10\nheight = 5√3 ≈ 8.66 m',
              m: 3
            },
            {
              q: 'Prove that: sin²θ + cos²θ = 1',
              a: 'In a right triangle with sides a (opposite), b (adjacent), c (hypotenuse):\na² + b² = c² (Pythagoras)\n\nsin θ = a/c, cos θ = b/c\nsin²θ + cos²θ = a²/c² + b²/c² = (a²+b²)/c² = c²/c² = 1 ✓',
              m: 3
            },
          ]
        },
      ]
    },

    {
      name: 'Statistics',
      icon: '📊',
      chapters: [
        {
          name: 'Statistics',
          qs: [
            {
              q: 'Find the mean of: 15, 22, 18, 30, 25, 14, 20.',
              a: 'Mean = Sum / Count\nSum = 15+22+18+30+25+14+20 = 144\nCount = 7\nMean = 144/7 ≈ 20.57',
              m: 2
            },
            {
              q: 'Find the median and mode of: 5, 3, 8, 5, 7, 2, 5, 9, 3.',
              a: 'Arranged: 2, 3, 3, 5, 5, 5, 7, 8, 9\n\nMedian = 5th value = 5\nMode = 5 (appears 3 times)\n\nAlways sort first before finding median.',
              m: 3
            },
            {
              q: 'Find the mean from: Marks 10,20,30,40,50 and Frequency 3,5,8,6,3.',
              a: 'f×x values: 30, 100, 240, 240, 150\nΣf = 25\nΣfx = 760\n\nMean = Σfx/Σf = 760/25 = 30.4',
              m: 4
            },
            {
              q: 'The mean of 8 numbers is 15. If one number, 20, is removed, find the new mean.',
              a: 'Total sum = 15 × 8 = 120\nNew sum = 120 − 20 = 100\nNew count = 7\nNew mean = 100/7 ≈ 14.29',
              m: 3
            },
          ]
        },
      ]
    },

    {
      name: 'Probability',
      icon: '🎲',
      chapters: [
        {
          name: 'Probability',
          qs: [
            {
              q: 'A bag has 4 red, 5 blue and 3 green balls. Find the probability of: (a) red ball (b) not green.',
              a: 'Total = 12 balls\n\n(a) P(red) = 4/12 = 1/3\n\n(b) P(not green) = 1 − P(green) = 1 − 3/12 = 9/12 = 3/4',
              m: 2
            },
            {
              q: 'Two dice are rolled. Find the probability of getting a sum of 7.',
              a: 'Total outcomes = 36\nFavourable (sum=7): (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) = 6\n\nP(sum=7) = 6/36 = 1/6',
              m: 3
            },
            {
              q: 'A card is drawn from 52 cards. Find the probability of a face card (Jack, Queen or King).',
              a: 'Face cards = 3 × 4 suits = 12\nP(face card) = 12/52 = 3/13',
              m: 2
            },
            {
              q: 'A box has 6 red and 4 white balls. Two balls are drawn without replacement. Find P(both red).',
              a: 'P(1st red) = 6/10\nAfter removing one red: P(2nd red) = 5/9\n\nP(both red) = 6/10 × 5/9 = 30/90 = 1/3',
              m: 4
            },
          ]
        },
      ]
    },

  ]
};
