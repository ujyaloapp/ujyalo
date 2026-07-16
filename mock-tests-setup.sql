-- =====================================================================
-- Mock Tests — standalone tables (no link to past_papers or any other table).
-- Run once in the Supabase SQL editor. Re-running is safe (it re-loads the 5 mocks).
-- English questions + figures only. Nepali + answers are left empty for later.
-- =====================================================================

create table if not exists mock_tests (
  id               uuid primary key default gen_random_uuid(),
  slug             text unique not null,
  title            text not null,
  set_label        text,
  subject          text not null,
  subject_code     text not null default 'maths',
  total_marks      int  not null default 75,
  duration_minutes int  not null default 180,
  is_free          boolean not null default false,   -- Mock 1 = true; 2-5 = locked
  sort_order       int  not null default 0,
  status           text not null default 'draft',    -- 'draft' = hidden; 'published' = visible
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table if not exists mock_questions (
  id               uuid primary key default gen_random_uuid(),
  mock_id          uuid not null references mock_tests(id) on delete cascade,
  question_number  int  not null,
  sub_part         text,               -- NULL = the question stem; 'a','b','c','d' = parts
  question_text_en text,               -- may contain simple HTML (tables, fractions, sup/sub)
  question_text_np text,               -- filled later
  marks            int,                -- per part; NULL on the stem row
  diagram_svg      text,               -- the figure, when a question has one
  answer_text      text,               -- filled later
  sort_order       int  not null default 0,
  created_at       timestamptz not null default now()
);
create index if not exists idx_mock_questions_mock
  on mock_questions(mock_id, question_number, sort_order);

begin;
-- clean re-load of just these 5 mocks (touches nothing else)
delete from mock_questions where mock_id in (select id from mock_tests where slug like 'mock-set-%');
delete from mock_tests where slug like 'mock-set-%';

-- ---- Mock 1 · Set A (FREE) — 16 questions, 49 parts, 75 marks ----
insert into mock_tests (slug,title,set_label,subject,total_marks,duration_minutes,is_free,sort_order,status) values ($S$mock-set-a$S$,$T$SEE Model Test — Set A$T$,$L$Set A$L$,$J$Compulsory Mathematics$J$,75,180,true,1,'draft');
insert into mock_questions (mock_id,question_number,sub_part,question_text_en,marks,diagram_svg,sort_order) values
  ((select id from mock_tests where slug=$S$mock-set-a$S$),1,NULL,$Q$In a survey of 240 people, 140 use an Ntc SIM, 130 use an Ncell SIM, and 30 use neither of these two SIMs.$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),1,$P$a$P$,$Q$If T and C denote the sets of people who use an Ntc SIM and an Ncell SIM respectively, write the cardinality of <span style="text-decoration:overline">(T&cup;C)</span> (the people who use neither).$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),1,$P$b$P$,$Q$Present the above information in a Venn diagram.$Q$,1,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),1,$P$c$P$,$Q$Find the number of people who use an Ntc SIM only.$Q$,3,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),1,$P$d$P$,$Q$Compare the number of people who use both SIMs with the number who use neither.$Q$,1,NULL,4),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),2,NULL,$Q$A shopkeeper deposited Rs 62,500 in a bank for 2 years at a rate of compound interest compounded annually. The compound amount at the end of the first year is Rs 67,500.$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),2,$P$a$P$,$Q$For principal Rs P, time T years and rate R% per year, write the formula to find the yearly compound amount (CA).$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),2,$P$b$P$,$Q$Find the annual rate of compound interest offered by the bank.$Q$,2,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),2,$P$c$P$,$Q$What compound amount will the shopkeeper receive at the end of 2 years? Find it.$Q$,2,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),3,NULL,$Q$A delivery van was purchased for Rs 25,00,000. Over 2 years of use it earned Rs 6,00,000. The value of the van depreciates at 20% per annum and the van was sold after 2 years.$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),3,$P$a$P$,$Q$If the purchase price is Rs V<sub>0</sub>, the annual rate of compound depreciation is R% and the price after T years is Rs V<sub>T</sub>, express V<sub>T</sub> in terms of V<sub>0</sub>, R% and T.$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),3,$P$b$P$,$Q$Find the selling price of the van after 2 years.$Q$,2,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),3,$P$c$P$,$Q$Find the total profit or loss percent on the whole transaction of the van.$Q$,1,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),4,NULL,$Q$A person went to a bank to exchange US dollars before travelling abroad. On that day the bank's buying rate was US$&nbsp;1 = Rs 133 and the selling rate was US$&nbsp;1 = Rs 134.$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),4,$P$a$P$,$Q$How many US dollars does the person receive on exchanging Rs 3,35,000? Find it.$Q$,2,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),4,$P$b$P$,$Q$On the same day, how many Nepali rupees does his friend receive on exchanging US$&nbsp;3,200? Find it.$Q$,1,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),4,$P$c$P$,$Q$After 10 days the selling rate of US$&nbsp;1 becomes Rs 139.36. By what percent was the Nepali currency devalued? Find it.$Q$,1,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),5,NULL,$Q$The height of a square-based pyramid is 15 cm and the length of a side of its base is 16 cm.$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),5,$P$a$P$,$Q$How many triangular surfaces are there in a square-based pyramid? Write it.$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),5,$P$b$P$,$Q$Find the slant height of the pyramid.$Q$,2,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),5,$P$c$P$,$Q$What is the total cost of painting the whole surface of the pyramid at the rate of Rs 5 per square cm? Find it.$Q$,2,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),6,NULL,$Q$A metallic solid made up of a cone and a cylinder is given in the figure. The radii of the base of the cone and the cylinder are equal. The height of the cylinder is 30 cm, the height of the cone is 18 cm, and the radius of the base is 7 cm.$Q$,NULL,$G$<svg width="200" height="300" viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg" role="img"
         font-family="Outfit, system-ui, sans-serif">
      <title>Cone on a cylinder</title>
      <desc>A cone of height 18 cm sits on a cylinder of height 30 cm; base radius 7 cm.</desc>
      <!-- cone -->
      <path d="M100 30 L152 130 A52 14 0 0 1 48 130 Z" fill="#d3f0ec" stroke="#1f2933" stroke-width="1.5"/>
      <path d="M48 130 A52 14 0 0 0 152 130" fill="none" stroke="#1f2933" stroke-width="1.5"/>
      <!-- cylinder body -->
      <path d="M48 130 L48 250 A52 14 0 0 0 152 250 L152 130" fill="#ffffff" stroke="#1f2933" stroke-width="1.5"/>
      <ellipse cx="100" cy="130" rx="52" ry="14" fill="#ffffff" stroke="#1f2933" stroke-width="1.5"/>
      <!-- radius -->
      <line x1="100" y1="250" x2="152" y2="250" stroke="#0f766e" stroke-width="1.5"/>
      <text x="118" y="272" font-size="13" fill="#0f766e">r = 7 cm</text>
      <!-- height labels -->
      <text x="158" y="90" font-size="13" fill="#1f2933">18 cm</text>
      <text x="158" y="195" font-size="13" fill="#1f2933">30 cm</text>
    </svg>$G$,0),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),6,$P$a$P$,$Q$If the radius of the base and the slant height of the cone are given, write the formula for the curved surface area of the cone.$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),6,$P$b$P$,$Q$Find the volume of the solid object.$Q$,2,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),6,$P$c$P$,$Q$How many times is the volume of the cylindrical part greater than the volume of the conical part? Find it.$Q$,1,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),7,NULL,$Q$The length, breadth and height of a rectangular room are 20 ft, 15 ft and 10 ft respectively. The room has one door of size 8 ft &times; 4 ft and two square windows of side 3 ft.$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),7,$P$a$P$,$Q$Excluding the door and windows, how much does it cost to paint the four walls and the ceiling at the rate of Rs 30 per square foot? Find it.$Q$,3,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),7,$P$b$P$,$Q$If the rate per square foot increases by one-third, by how much does the total cost of painting the same parts increase? Find it.$Q$,2,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),8,NULL,$Q$There are 3 geometric means between 5 and 80.$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),8,$P$a$P$,$Q$If the first term is 'a', the last term is 'b' and the number of geometric means is 'n', write the formula to find the common ratio (r).$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),8,$P$b$P$,$Q$What is the third mean of the given series? Find it.$Q$,2,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),8,$P$c$P$,$Q$Between the arithmetic mean and the geometric mean of 5 and 80, which is greater and by how much? Compare them.$Q$,2,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),9,NULL,$Q$The perimeter and area of a rectangular ground are 50 m and 144 sq. m respectively.$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),9,$P$a$P$,$Q$How many roots does the quadratic equation ax<sup>2</sup> + bx + c = 0, a &ne; 0 have? Write it.$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),9,$P$b$P$,$Q$Find the length and breadth of the given ground.$Q$,3,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),9,$P$c$P$,$Q$How many plots of dimension (4 &times; 3) sq. m can be made from that rectangular ground? Calculate it.$Q$,1,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),10,NULL,$Q$Answer the following.$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),10,$P$a$P$,$Q$Simplify: &nbsp; <span style="display:inline-block;text-align:center;vertical-align:middle">a+b<hr style="margin:1px 0;border:none;border-top:1px solid var(--ink)">a&minus;b</span> &nbsp;+&nbsp; <span style="display:inline-block;text-align:center;vertical-align:middle">a&minus;b<hr style="margin:1px 0;border:none;border-top:1px solid var(--ink)">a+b</span>$Q$,2,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),10,$P$b$P$,$Q$Solve: &nbsp; 2<sup>x</sup> + 2<sup>4&minus;x</sup> = 10$Q$,3,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),11,NULL,$Q$In the given figure, two triangles PQR and PQS stand on the same base PQ and between the same parallel lines PQ and RS.$Q$,NULL,$G$<svg width="300" height="150" viewBox="0 0 300 150" xmlns="http://www.w3.org/2000/svg" role="img"
         font-family="Outfit, system-ui, sans-serif">
      <title>Two triangles on the same base between parallels</title>
      <desc>Base PQ on the lower parallel; apexes R and S on the upper parallel.</desc>
      <line x1="20" y1="35" x2="285" y2="35" stroke="#52606d" stroke-width="1.2"/>
      <line x1="20" y1="120" x2="285" y2="120" stroke="#52606d" stroke-width="1.2"/>
      <!-- triangles -->
      <polygon points="70,120 240,120 55,35" fill="none" stroke="#1f2933" stroke-width="1.5"/>
      <polygon points="70,120 240,120 235,35" fill="none" stroke="#0f766e" stroke-width="1.5"/>
      <!-- parallel marks -->
      <path d="M148 30 l8 5 -8 5" fill="none" stroke="#52606d" stroke-width="1.2"/>
      <path d="M150 115 l8 5 -8 5" fill="none" stroke="#52606d" stroke-width="1.2"/>
      <text x="47" y="30" font-size="13">R</text>
      <text x="238" y="30" font-size="13">S</text>
      <text x="60" y="135" font-size="13">P</text>
      <text x="238" y="135" font-size="13">Q</text>
    </svg>$G$,0),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),11,$P$a$P$,$Q$Write the relation between the areas of the two given triangles.$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),11,$P$b$P$,$Q$Prove that: Area of &triangle;PQR = Area of &triangle;PQS.$Q$,2,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),11,$P$c$P$,$Q$In a parallelogram ABCD, the diagonal AC divides it into two triangles. Prove that Area of &triangle;ABC = Area of &triangle;ACD.$Q$,2,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),12,NULL,$Q$In the given figure, ABCD is a cyclic quadrilateral in which &ang;A and &ang;C are opposite angles.$Q$,NULL,$G$<svg width="220" height="220" viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg" role="img"
         font-family="Outfit, system-ui, sans-serif">
      <title>Cyclic quadrilateral ABCD</title>
      <desc>Quadrilateral ABCD inscribed in a circle; angle A = 3x, angle C = 2x.</desc>
      <circle cx="110" cy="110" r="88" fill="none" stroke="#52606d" stroke-width="1.3"/>
      <polygon points="80,26 198,96 132,196 30,132" fill="#d3f0ec" fill-opacity="0.5" stroke="#1f2933" stroke-width="1.5"/>
      <text x="66" y="22" font-size="13">A</text>
      <text x="202" y="98" font-size="13">B</text>
      <text x="132" y="212" font-size="13">C</text>
      <text x="12" y="136" font-size="13">D</text>
      <text x="78" y="46" font-size="12" fill="#0f766e">3x°</text>
      <text x="120" y="176" font-size="12" fill="#0f766e">2x°</text>
    </svg>$G$,0),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),12,$P$a$P$,$Q$Write the relation between &ang;A and &ang;C.$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),12,$P$b$P$,$Q$If &ang;A = 3x° and &ang;C = 2x°, find the value of x.$Q$,1,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),12,$P$c$P$,$Q$Prove experimentally that the opposite angles of a cyclic quadrilateral are supplementary. (Two circles having radii at least 3 cm are necessary.)$Q$,2,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),13,NULL,$Q$Answer the following.$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),13,$P$a$P$,$Q$Construct a quadrilateral ABCD in which AB = BC = 5.5 cm, CD = DA = 4.6 cm and &ang;ABC = 60°. Also construct a triangle ADE whose area is equal to the area of the quadrilateral.$Q$,3,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),13,$P$b$P$,$Q$Is BD &parallel; CE? Give a reason.$Q$,1,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),14,NULL,$Q$In the given figure, PQ is the height of a house and AB is the height of a man, where PQ = 13.5 m and AB = 1.5 m.$Q$,NULL,$G$<svg width="300" height="210" viewBox="0 0 300 210" xmlns="http://www.w3.org/2000/svg" role="img"
         font-family="Outfit, system-ui, sans-serif">
      <title>Angle of elevation of a house top from a man</title>
      <desc>Man AB on the left; house PQ on the right; horizontal line of sight AR and line of sight AP.</desc>
      <!-- ground -->
      <line x1="30" y1="185" x2="285" y2="185" stroke="#52606d" stroke-width="1.2"/>
      <!-- house -->
      <line x1="250" y1="30" x2="250" y2="185" stroke="#1f2933" stroke-width="2"/>
      <!-- man -->
      <line x1="70" y1="160" x2="70" y2="185" stroke="#1f2933" stroke-width="2"/>
      <!-- horizontal sight -->
      <line x1="70" y1="160" x2="250" y2="160" stroke="#52606d" stroke-width="1.2" stroke-dasharray="4 3"/>
      <!-- line of sight -->
      <line x1="70" y1="160" x2="250" y2="30" stroke="#0f766e" stroke-width="1.5"/>
      <path d="M95 160 A25 25 0 0 0 88 146" fill="none" stroke="#0f766e" stroke-width="1.2"/>
      <text x="99" y="155" font-size="12" fill="#0f766e">θ</text>
      <!-- right-angle marks -->
      <path d="M243 178 h7 v7" fill="none" stroke="#1f2933" stroke-width="1"/>
      <path d="M243 153 h7 v7" fill="none" stroke="#1f2933" stroke-width="1"/>
      <text x="255" y="30" font-size="13">P</text>
      <text x="255" y="200" font-size="13">Q</text>
      <text x="255" y="164" font-size="13">R</text>
      <text x="52" y="158" font-size="13">A</text>
      <text x="60" y="200" font-size="13">B</text>
      <text x="256" y="100" font-size="12">13.5 m</text>
      <text x="30" y="176" font-size="12">1.5 m</text>
    </svg>$G$,0),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),14,$P$a$P$,$Q$Write the name of the angle formed by the line of sight AP with the horizontal line AR.$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),14,$P$b$P$,$Q$Find the length of PR.$Q$,1,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),14,$P$c$P$,$Q$If &ang;PAR = 45°, find the distance between the man and the house.$Q$,1,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),14,$P$d$P$,$Q$In which case would PR = AR? Write with reason.$Q$,1,NULL,4),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),15,NULL,$Q$The marks obtained by 40 students in a mathematics test are given in the table below. <table class="data"> <tr><th>Marks obtained</th><td>0&ndash;10</td><td>10&ndash;20</td><td>20&ndash;30</td><td>30&ndash;40</td><td>40&ndash;50</td></tr> <tr><th>No. of students</th><td>5</td><td>7</td><td>10</td><td>11</td><td>7</td></tr> </table>$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),15,$P$a$P$,$Q$In the median formula &nbsp;M<sub>d</sub> = L + (i/f)(N/2 &minus; cf), what does L represent? Write it.$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),15,$P$b$P$,$Q$Find the modal class and the median class of the given data.$Q$,1,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),15,$P$c$P$,$Q$Calculate the median of the given data.$Q$,2,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),15,$P$d$P$,$Q$What percent of the students obtained 20 or more marks? Find it.$Q$,1,NULL,4),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),16,NULL,$Q$A bag contains 3 red balls and 2 white balls. Two balls are drawn one after another without replacement.$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),16,$P$a$P$,$Q$If A and B are two mutually exclusive events, write the probability of (A&cup;B).$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),16,$P$b$P$,$Q$Find the probability that both balls drawn are red.$Q$,1,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),16,$P$c$P$,$Q$Show the probabilities of all possible outcomes of drawing the two balls in a tree diagram.$Q$,2,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-a$S$),16,$P$d$P$,$Q$By how much is the probability of getting at least one white ball more than the probability of getting both red? Calculate it.$Q$,1,NULL,4);

-- ---- Mock 2 · Set B (LOCKED) — 16 questions, 49 parts, 75 marks ----
insert into mock_tests (slug,title,set_label,subject,total_marks,duration_minutes,is_free,sort_order,status) values ($S$mock-set-b$S$,$T$SEE Model Test — Set B$T$,$L$Set B$L$,$J$Compulsory Mathematics$J$,75,180,false,2,'draft');
insert into mock_questions (mock_id,question_number,sub_part,question_text_en,marks,diagram_svg,sort_order) values
  ((select id from mock_tests where slug=$S$mock-set-b$S$),1,NULL,$Q$In a survey of 180 people, 100 read the newspaper Kantipur, 90 read the newspaper Gorkhapatra, and 20 read neither of these two newspapers.$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),1,$P$a$P$,$Q$If K and G denote the sets of people who read Kantipur and Gorkhapatra respectively, write the cardinality of <span style="text-decoration:overline">(K&cup;G)</span> (the people who read neither).$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),1,$P$b$P$,$Q$Present the above information in a Venn diagram.$Q$,1,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),1,$P$c$P$,$Q$Find the number of people who read Kantipur only.$Q$,3,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),1,$P$d$P$,$Q$Compare the number of people who read both newspapers with the number who read neither.$Q$,1,NULL,4),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),2,NULL,$Q$A person deposited Rs 50,000 in a bank at 8% per annum.$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),2,$P$a$P$,$Q$According to half-yearly compound interest, how many times is the interest calculated in 2 years? Write it.$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),2,$P$b$P$,$Q$If the interest is compounded half-yearly, find the compound interest at the end of 1 year.$Q$,2,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),2,$P$c$P$,$Q$At the same rate compounded yearly, in how many years will Rs 50,000 amount to Rs 58,320? Find it.$Q$,2,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),3,NULL,$Q$The present population of a village is 40,000 and it grows at the rate of 5% per annum.$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),3,$P$a$P$,$Q$If the present population is P<sub>0</sub>, the growth rate is R% and the population after T years is P<sub>T</sub>, write the formula for P<sub>T</sub>.$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),3,$P$b$P$,$Q$Find the population of the village after 2 years.$Q$,1,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),3,$P$c$P$,$Q$In how many years will the population reach 46,305? Find it.$Q$,2,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),4,NULL,$Q$Before travelling abroad, a person went to a bank to exchange British pounds. On that day the buying rate was &pound;1 = Rs 170 and the selling rate was &pound;1 = Rs 171.$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),4,$P$a$P$,$Q$How many pounds does the person receive on exchanging Rs 3,42,000? Find it.$Q$,2,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),4,$P$b$P$,$Q$On the same day, how many Nepali rupees does his friend receive on exchanging &pound;1,500? Find it.$Q$,1,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),4,$P$c$P$,$Q$After some days the selling rate of &pound;1 becomes Rs 177.84. By what percent was the Nepali currency devalued? Find it.$Q$,1,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),5,NULL,$Q$The perimeter of the base of a square-based pyramid is 32 cm and its slant height is 5 cm.$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),5,$P$a$P$,$Q$Write the formula to find the area of the triangular surfaces of a square-based pyramid.$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),5,$P$b$P$,$Q$Find the vertical height of the pyramid.$Q$,2,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),5,$P$c$P$,$Q$Find the total surface area of the pyramid.$Q$,2,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),6,NULL,$Q$A solid toy is made by mounting a cone on a hemisphere of the same radius, as shown in the figure. The common radius is 7 cm and the slant height of the cone is 25 cm.$Q$,NULL,$G$<svg width="180" height="215" viewBox="0 0 180 215" xmlns="http://www.w3.org/2000/svg" role="img"
         font-family="Outfit, system-ui, sans-serif">
      <title>Cone mounted on a hemisphere</title>
      <desc>A cone of slant height 25 cm on a hemisphere; common radius 7 cm.</desc>
      <!-- cone -->
      <polygon points="90,20 35,120 145,120" fill="#d3f0ec" stroke="#1f2933" stroke-width="1.5"/>
      <!-- hemisphere -->
      <path d="M35 120 A55 55 0 0 0 145 120 Z" fill="#ffffff" stroke="#1f2933" stroke-width="1.5"/>
      <!-- shared diameter -->
      <ellipse cx="90" cy="120" rx="55" ry="12" fill="none" stroke="#1f2933" stroke-width="1.2"/>
      <!-- radius -->
      <line x1="90" y1="120" x2="145" y2="120" stroke="#0f766e" stroke-width="1.5"/>
      <text x="100" y="112" font-size="13" fill="#0f766e">7 cm</text>
      <!-- slant -->
      <text x="112" y="66" font-size="13" fill="#1f2933">25 cm</text>
    </svg>$G$,0),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),6,$P$a$P$,$Q$Write the formula for the volume of a hemisphere of radius r.$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),6,$P$b$P$,$Q$Find the total surface area of the toy.$Q$,2,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),6,$P$c$P$,$Q$Compare the curved surface area of the conical part with that of the hemispherical part.$Q$,1,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),7,NULL,$Q$A plot of land ABCD is in the shape of a right-angled trapezium, as shown in the figure. AD = 14 m, BC = 26 m, the perpendicular distance AB = 12 m, and there are right angles at A and B.$Q$,NULL,$G$<svg width="220" height="170" viewBox="0 0 220 170" xmlns="http://www.w3.org/2000/svg" role="img"
         font-family="Outfit, system-ui, sans-serif">
      <title>Right-angled trapezium plot ABCD</title>
      <desc>AD = 14 m top, BC = 26 m bottom, AB = 12 m left height, right angles at A and B.</desc>
      <polygon points="40,35 110,35 180,130 40,130" fill="#d3f0ec" stroke="#1f2933" stroke-width="1.5"/>
      <!-- right-angle marks -->
      <path d="M40 47 h10 v-10" fill="none" stroke="#1f2933" stroke-width="1"/>
      <path d="M40 118 h10 v10" fill="none" stroke="#1f2933" stroke-width="1"/>
      <text x="30" y="33" font-size="13">A</text>
      <text x="112" y="32" font-size="13">D</text>
      <text x="30" y="143" font-size="13">B</text>
      <text x="184" y="134" font-size="13">C</text>
      <text x="62" y="28" font-size="12" fill="#52606d">14 m</text>
      <text x="10" y="88" font-size="12" fill="#52606d">12 m</text>
      <text x="95" y="147" font-size="12" fill="#52606d">26 m</text>
    </svg>$G$,0),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),7,$P$a$P$,$Q$Find the cost of paving the plot at the rate of Rs 25 per square metre.$Q$,3,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),7,$P$b$P$,$Q$If the rate per square metre increases by one-third, by how much does the total cost increase? Find it.$Q$,2,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),8,NULL,$Q$The first term and last term of an arithmetic series are 5 and 50 respectively, and the sum of all its terms is 275.$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),8,$P$a$P$,$Q$Write the formula to find the sum of the first n terms of an arithmetic series.$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),8,$P$b$P$,$Q$Find the total number of terms in the series.$Q$,2,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),8,$P$c$P$,$Q$Find the common difference and the sum of the first six terms of the series.$Q$,2,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),9,NULL,$Q$In a two-digit number, the tens digit is twice the units digit, and the number is 36 more than the number obtained by reversing its digits.$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),9,$P$a$P$,$Q$If the tens digit is x and the units digit is y, express the number algebraically.$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),9,$P$b$P$,$Q$Find the number.$Q$,3,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),9,$P$c$P$,$Q$What is the ratio of the number to its reversed number? Find it.$Q$,1,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),10,NULL,$Q$Answer the following.$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),10,$P$a$P$,$Q$Simplify: &nbsp; <span style="display:inline-block;text-align:center;vertical-align:middle">1<hr style="margin:1px 0;border:none;border-top:1px solid var(--ink)">x&minus;2</span> &nbsp;&minus;&nbsp; <span style="display:inline-block;text-align:center;vertical-align:middle">1<hr style="margin:1px 0;border:none;border-top:1px solid var(--ink)">x+2</span>$Q$,2,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),10,$P$b$P$,$Q$Solve: &nbsp; 2<sup>x+1</sup> + 2<sup>x</sup> = 24$Q$,3,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),11,NULL,$Q$In the given figure, parallelogram ABCD and triangle ABE stand on the same base AB and between the same parallel lines AB and DE.$Q$,NULL,$G$<svg width="300" height="150" viewBox="0 0 300 150" xmlns="http://www.w3.org/2000/svg" role="img"
         font-family="Outfit, system-ui, sans-serif">
      <title>Parallelogram and triangle on the same base between parallels</title>
      <desc>Base AB on the lower parallel; parallelogram ABCD and triangle ABE with vertices on the upper parallel.</desc>
      <line x1="20" y1="40" x2="290" y2="40" stroke="#52606d" stroke-width="1.2"/>
      <line x1="20" y1="120" x2="290" y2="120" stroke="#52606d" stroke-width="1.2"/>
      <!-- parallelogram ABCD -->
      <polygon points="55,120 205,120 255,40 105,40" fill="none" stroke="#1f2933" stroke-width="1.5"/>
      <!-- triangle ABE -->
      <polygon points="55,120 205,120 170,40" fill="none" stroke="#0f766e" stroke-width="1.5"/>
      <path d="M150 35 l8 5 -8 5" fill="none" stroke="#52606d" stroke-width="1.2"/>
      <path d="M150 115 l8 5 -8 5" fill="none" stroke="#52606d" stroke-width="1.2"/>
      <text x="46" y="135" font-size="13">A</text>
      <text x="205" y="135" font-size="13">B</text>
      <text x="256" y="35" font-size="13">C</text>
      <text x="92" y="35" font-size="13">D</text>
      <text x="168" y="34" font-size="13">E</text>
    </svg>$G$,0),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),11,$P$a$P$,$Q$Write the relation between the area of &triangle;ABE and the area of parallelogram ABCD.$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),11,$P$b$P$,$Q$Prove that: Area of &triangle;ABE = &frac12; &times; Area of parallelogram ABCD.$Q$,2,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),11,$P$c$P$,$Q$In a parallelogram PQRS, X is the mid-point of QR. Prove that Area of &triangle;PXS = &frac12; &times; Area of parallelogram PQRS.$Q$,2,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),12,NULL,$Q$In the given figure, O is the centre of the circle. &ang;AOB is the central angle and &ang;ACB is the inscribed angle standing on the same arc AB.$Q$,NULL,$G$<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img"
         font-family="Outfit, system-ui, sans-serif">
      <title>Central and inscribed angles on the same arc</title>
      <desc>Circle centre O; central angle AOB and inscribed angle ACB on arc AB.</desc>
      <circle cx="100" cy="105" r="80" fill="none" stroke="#52606d" stroke-width="1.3"/>
      <!-- points: A bottom-left, B bottom-right, C top -->
      <line x1="100" y1="105" x2="42" y2="160" stroke="#1f2933" stroke-width="1.4"/>
      <line x1="100" y1="105" x2="158" y2="160" stroke="#1f2933" stroke-width="1.4"/>
      <line x1="100" y1="27" x2="42" y2="160" stroke="#0f766e" stroke-width="1.4"/>
      <line x1="100" y1="27" x2="158" y2="160" stroke="#0f766e" stroke-width="1.4"/>
      <circle cx="100" cy="105" r="2.4" fill="#1f2933"/>
      <text x="88" y="100" font-size="12">O</text>
      <text x="28" y="168" font-size="13">A</text>
      <text x="162" y="168" font-size="13">B</text>
      <text x="95" y="22" font-size="13">C</text>
    </svg>$G$,0),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),12,$P$a$P$,$Q$Write the relation between the central angle &ang;AOB and the inscribed angle &ang;ACB.$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),12,$P$b$P$,$Q$If &ang;ACB = 40°, find the value of &ang;AOB.$Q$,1,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),12,$P$c$P$,$Q$Prove experimentally that the central angle is twice the inscribed angle standing on the same arc. (Two circles having radii at least 3 cm are necessary.)$Q$,2,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),13,NULL,$Q$Answer the following.$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),13,$P$a$P$,$Q$Construct a quadrilateral PQRS in which PQ = 4.8 cm, QR = 5 cm, RS = 5.2 cm, SP = 4.5 cm and &ang;PQR = 90°. Also construct a triangle PQT whose area is equal to the area of the quadrilateral.$Q$,3,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),13,$P$b$P$,$Q$Give the reason why the quadrilateral PQRS and the triangle PQT are equal in area.$Q$,1,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),14,NULL,$Q$In the given figure, PQ is a vertical tower standing on level ground. From a point A on the ground, 30 m from the foot Q, the angle of elevation of the top P is 30°. B is another point on the ground between A and Q.$Q$,NULL,$G$<svg width="300" height="200" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg" role="img"
         font-family="Outfit, system-ui, sans-serif">
      <title>Angle of elevation of a tower top</title>
      <desc>Tower PQ on the right; points A and B on the ground; elevation 30 degrees at A and 60 degrees at B.</desc>
      <line x1="40" y1="165" x2="270" y2="165" stroke="#52606d" stroke-width="1.2"/>
      <line x1="250" y1="45" x2="250" y2="165" stroke="#1f2933" stroke-width="2"/>
      <line x1="50" y1="165" x2="250" y2="45" stroke="#0f766e" stroke-width="1.4"/>
      <line x1="160" y1="165" x2="250" y2="45" stroke="#0f766e" stroke-width="1.2" stroke-dasharray="4 3"/>
      <path d="M78 165 A28 28 0 0 0 74 151" fill="none" stroke="#0f766e" stroke-width="1.1"/>
      <text x="80" y="160" font-size="12" fill="#0f766e">30°</text>
      <path d="M182 165 A22 22 0 0 0 176 149" fill="none" stroke="#0f766e" stroke-width="1.1"/>
      <text x="176" y="160" font-size="12" fill="#0f766e">60°</text>
      <path d="M243 158 h7 v7" fill="none" stroke="#1f2933" stroke-width="1"/>
      <text x="255" y="45" font-size="13">P</text>
      <text x="255" y="178" font-size="13">Q</text>
      <text x="44" y="180" font-size="13">A</text>
      <text x="156" y="180" font-size="13">B</text>
      <text x="120" y="182" font-size="12" fill="#52606d">30 m</text>
    </svg>$G$,0),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),14,$P$a$P$,$Q$Define the angle of elevation.$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),14,$P$b$P$,$Q$Find the height of the tower PQ.$Q$,1,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),14,$P$c$P$,$Q$If the angle of elevation from B is 60°, find the distance BQ.$Q$,1,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),14,$P$d$P$,$Q$How far did the observer move from A to B? Find it.$Q$,1,NULL,4),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),15,NULL,$Q$The mean of the data given in the table below is 25. One frequency (p) is missing. <table class="data"> <tr><th>Class interval</th><td>0&ndash;10</td><td>10&ndash;20</td><td>20&ndash;30</td><td>30&ndash;40</td><td>40&ndash;50</td></tr> <tr><th>Frequency</th><td>8</td><td>12</td><td>10</td><td>6</td><td>p</td></tr> </table>$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),15,$P$a$P$,$Q$In the formula for the mean, Mean = (&Sigma;fx) / N, what does N represent? Write it.$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),15,$P$b$P$,$Q$Write the mid-value (class-mark) of the class 40&ndash;50.$Q$,1,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),15,$P$c$P$,$Q$Find the value of the missing frequency p.$Q$,2,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),15,$P$d$P$,$Q$Using the value of p, write the modal class of the data.$Q$,1,NULL,4),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),16,NULL,$Q$A bag contains 4 white balls and 2 black balls. Two balls are drawn one after another without replacement.$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),16,$P$a$P$,$Q$What is the probability of an impossible event? Write it.$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),16,$P$b$P$,$Q$Find the probability that both balls drawn are white.$Q$,1,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),16,$P$c$P$,$Q$Show the probabilities of all possible outcomes of drawing the two balls in a tree diagram.$Q$,2,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-b$S$),16,$P$d$P$,$Q$Find the probability of getting at least one black ball.$Q$,1,NULL,4);

-- ---- Mock 3 · Set C (LOCKED) — 16 questions, 50 parts, 75 marks ----
insert into mock_tests (slug,title,set_label,subject,total_marks,duration_minutes,is_free,sort_order,status) values ($S$mock-set-c$S$,$T$SEE Model Test — Set C$T$,$L$Set C$L$,$J$Compulsory Mathematics$J$,75,180,false,3,'draft');
insert into mock_questions (mock_id,question_number,sub_part,question_text_en,marks,diagram_svg,sort_order) values
  ((select id from mock_tests where slug=$S$mock-set-c$S$),1,NULL,$Q$In a survey of 150 tourists, 95 had visited Pokhara, 70 had visited Chitwan, and 15 had visited neither of these two places.$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),1,$P$a$P$,$Q$If P and C denote the sets of tourists who visited Pokhara and Chitwan respectively, write the cardinality of <span style="text-decoration:overline">(P&cup;C)</span> (the tourists who visited neither).$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),1,$P$b$P$,$Q$Present the above information in a Venn diagram.$Q$,1,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),1,$P$c$P$,$Q$How many tourists had visited both Pokhara and Chitwan? Find it.$Q$,3,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),1,$P$d$P$,$Q$Compare the number who visited Pokhara only with the number who visited Chitwan only.$Q$,1,NULL,4),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),2,NULL,$Q$A sum of Rs 20,000 is lent for 2 years at the rate of 10% per annum.$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),2,$P$a$P$,$Q$Write the formula for the compound interest (CI) on a principal P for T years at R% per annum.$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),2,$P$b$P$,$Q$Find the simple interest for 2 years.$Q$,1,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),2,$P$c$P$,$Q$Find the compound interest for 2 years (compounded annually).$Q$,2,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),2,$P$d$P$,$Q$Find the difference between the compound interest and the simple interest.$Q$,1,NULL,4),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),3,NULL,$Q$A machine was purchased for Rs 1,00,000. Its value depreciates at the rate of 10% per annum.$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),3,$P$a$P$,$Q$If the initial value is V<sub>0</sub>, the rate of depreciation is R% and the value after T years is V<sub>T</sub>, write the formula for V<sub>T</sub>.$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),3,$P$b$P$,$Q$Find the value of the machine after 3 years.$Q$,2,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),3,$P$c$P$,$Q$Find the total amount by which the value depreciated in 3 years.$Q$,1,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),4,NULL,$Q$On a certain day, a bank's buying rate was A$1 = Rs 88 and its selling rate was A$1 = Rs 89.$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),4,$P$a$P$,$Q$How many Australian dollars does a customer receive on exchanging Rs 3,56,000? Find it.$Q$,2,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),4,$P$b$P$,$Q$On the same day, how many Nepali rupees does another customer receive on exchanging A$2,500? Find it.$Q$,1,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),4,$P$c$P$,$Q$After some days the selling rate becomes A$1 = Rs 92.56. By what percent was the Nepali currency devalued? Find it.$Q$,1,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),5,NULL,$Q$The base area of a square-based pyramid is 100 sq. cm and its slant height is 13 cm.$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),5,$P$a$P$,$Q$Write the relation among the base area (A), height (h) and volume (V) of a pyramid.$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),5,$P$b$P$,$Q$Compare the base area with the total area of the triangular surfaces.$Q$,2,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),5,$P$c$P$,$Q$Find the volume of the pyramid.$Q$,2,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),6,NULL,$Q$A water tank is made of a cylinder with a hemispherical dome on top, as shown in the figure. The radius of the base is 7 m and the height of the cylindrical part is 10 m.$Q$,NULL,$G$<svg width="190" height="230" viewBox="0 0 190 230" xmlns="http://www.w3.org/2000/svg" role="img"
         font-family="Outfit, system-ui, sans-serif">
      <title>Cylinder with a hemispherical dome</title>
      <desc>A hemispherical dome on a cylinder; base radius 7 m, cylinder height 10 m.</desc>
      <!-- dome -->
      <path d="M38 92 A57 57 0 0 1 152 92 Z" fill="#d3f0ec" stroke="#1f2933" stroke-width="1.5"/>
      <!-- cylinder -->
      <path d="M38 92 L38 190 A57 14 0 0 0 152 190 L152 92" fill="#ffffff" stroke="#1f2933" stroke-width="1.5"/>
      <ellipse cx="95" cy="92" rx="57" ry="14" fill="none" stroke="#1f2933" stroke-width="1.2"/>
      <!-- radius -->
      <line x1="95" y1="190" x2="152" y2="190" stroke="#0f766e" stroke-width="1.5"/>
      <text x="108" y="184" font-size="13" fill="#0f766e">7 m</text>
      <!-- height -->
      <text x="157" y="146" font-size="13" fill="#1f2933">10 m</text>
    </svg>$G$,0),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),6,$P$a$P$,$Q$Write the formula for the volume of a hemisphere of radius r.$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),6,$P$b$P$,$Q$Find the total outer surface area of the tank (the curved cylinder, the dome and the circular base).$Q$,2,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),6,$P$c$P$,$Q$Find the cost of painting this whole outer surface at Rs 20 per square metre.$Q$,1,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),7,NULL,$Q$The floor of a room is a square of side 6 m and the height of the room is 3 m. A door and two windows together cover an area of 12 sq. m on the walls.$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),7,$P$a$P$,$Q$Excluding the door and windows, find the cost of plastering the four walls at the rate of Rs 150 per square metre.$Q$,3,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),7,$P$b$P$,$Q$If the rate per square metre increases by one-third, by how much does the total cost of plastering the walls increase? Find it.$Q$,2,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),8,NULL,$Q$A shopkeeper's daily sale of a certain item increased over the first three days as shown in the table below. <table class="data"> <tr><th>Day</th><td>1st</td><td>2nd</td><td>3rd</td></tr> <tr><th>Sale (in units)</th><td>3</td><td>6</td><td>12</td></tr> </table>$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),8,$P$a$P$,$Q$On the basis of the daily sale, is the sequence arithmetic or geometric? Write with reason.$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),8,$P$b$P$,$Q$If the pattern continues, find the sale on the 8th day using a formula.$Q$,2,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),8,$P$c$P$,$Q$Find the total sale during the first 8 days.$Q$,2,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),9,NULL,$Q$The length of a rectangular garden is 5 m more than its breadth and its area is 84 sq. m.$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),9,$P$a$P$,$Q$How many roots does a quadratic equation have? Write it.$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),9,$P$b$P$,$Q$Find the length and breadth of the garden.$Q$,3,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),9,$P$c$P$,$Q$By how much should the length be decreased to make the garden a square? Calculate it.$Q$,1,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),10,NULL,$Q$Answer the following.$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),10,$P$a$P$,$Q$Simplify: &nbsp; <span style="display:inline-block;text-align:center;vertical-align:middle">x<hr style="margin:1px 0;border:none;border-top:1px solid var(--ink)">x&minus;3</span> &nbsp;&minus;&nbsp; <span style="display:inline-block;text-align:center;vertical-align:middle">x<hr style="margin:1px 0;border:none;border-top:1px solid var(--ink)">x+3</span>$Q$,2,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),10,$P$b$P$,$Q$Solve: &nbsp; 4<sup>x</sup> + 4<sup>1&minus;x</sup> = 5$Q$,3,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),11,NULL,$Q$In the given figure, parallelograms ABCD and ABEF stand on the same base AB and between the same parallel lines AB and DE.$Q$,NULL,$G$<svg width="310" height="150" viewBox="0 0 310 150" xmlns="http://www.w3.org/2000/svg" role="img"
         font-family="Outfit, system-ui, sans-serif">
      <title>Two parallelograms on the same base between the same parallels</title>
      <desc>Base AB on the lower parallel; parallelograms ABCD and ABEF with tops on the upper parallel.</desc>
      <line x1="20" y1="40" x2="300" y2="40" stroke="#52606d" stroke-width="1.2"/>
      <line x1="20" y1="120" x2="300" y2="120" stroke="#52606d" stroke-width="1.2"/>
      <polygon points="55,120 190,120 235,40 100,40" fill="none" stroke="#1f2933" stroke-width="1.5"/>
      <polygon points="55,120 190,120 285,40 150,40" fill="none" stroke="#0f766e" stroke-width="1.5"/>
      <path d="M118 35 l8 5 -8 5" fill="none" stroke="#52606d" stroke-width="1.2"/>
      <path d="M118 115 l8 5 -8 5" fill="none" stroke="#52606d" stroke-width="1.2"/>
      <text x="46" y="135" font-size="13">A</text>
      <text x="188" y="135" font-size="13">B</text>
      <text x="96" y="35" font-size="13">D</text>
      <text x="233" y="35" font-size="13">C</text>
      <text x="146" y="35" font-size="13">F</text>
      <text x="286" y="35" font-size="13">E</text>
    </svg>$G$,0),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),11,$P$a$P$,$Q$Write one property that is common to both parallelograms.$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),11,$P$b$P$,$Q$Prove that: Area of parallelogram ABCD = Area of parallelogram ABEF.$Q$,2,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),11,$P$c$P$,$Q$If the diagonal AC of parallelogram ABCD is joined, prove that Area of &triangle;ABC = &frac12; &times; Area of parallelogram ABEF.$Q$,2,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),12,NULL,$Q$In the given figure, ABCD is a cyclic quadrilateral in which &ang;B and &ang;D are opposite angles.$Q$,NULL,$G$<svg width="220" height="220" viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg" role="img"
         font-family="Outfit, system-ui, sans-serif">
      <title>Cyclic quadrilateral ABCD</title>
      <desc>Quadrilateral ABCD inscribed in a circle; angle B = 3x, angle D = 2x.</desc>
      <circle cx="110" cy="110" r="88" fill="none" stroke="#52606d" stroke-width="1.3"/>
      <polygon points="70,32 200,110 140,192 26,96" fill="#d3f0ec" fill-opacity="0.5" stroke="#1f2933" stroke-width="1.5"/>
      <text x="56" y="28" font-size="13">A</text>
      <text x="204" y="112" font-size="13">B</text>
      <text x="140" y="208" font-size="13">C</text>
      <text x="8" y="96" font-size="13">D</text>
      <text x="176" y="112" font-size="12" fill="#0f766e">3x°</text>
      <text x="36" y="100" font-size="12" fill="#0f766e">2x°</text>
    </svg>$G$,0),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),12,$P$a$P$,$Q$Write the relation between &ang;B and &ang;D.$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),12,$P$b$P$,$Q$If &ang;B = 3x° and &ang;D = 2x°, find the value of &ang;B.$Q$,1,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),12,$P$c$P$,$Q$Prove experimentally that the sum of the opposite angles of a cyclic quadrilateral is 180°. (Two circles having radii at least 3 cm are necessary.)$Q$,2,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),13,NULL,$Q$Answer the following.$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),13,$P$a$P$,$Q$Construct a quadrilateral ABCD in which AB = 4.6 cm, BC = 5.4 cm, CD = 6 cm, DA = 5 cm and the diagonal AC = 7 cm. Also construct a triangle ABE whose area is equal to the area of the quadrilateral.$Q$,3,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),13,$P$b$P$,$Q$Give the reason why the quadrilateral ABCD and the triangle ABE are equal in area.$Q$,1,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),14,NULL,$Q$In the given figure, TF is a vertical tower of height 20 m. From its top T, the angle of depression of a point P on the level ground is 30°.$Q$,NULL,$G$<svg width="300" height="190" viewBox="0 0 300 190" xmlns="http://www.w3.org/2000/svg" role="img"
         font-family="Outfit, system-ui, sans-serif">
      <title>Angle of depression of a point from a tower top</title>
      <desc>Tower TF on the left; horizontal from T; point P on the ground; angle of depression 30 degrees.</desc>
      <line x1="45" y1="160" x2="270" y2="160" stroke="#52606d" stroke-width="1.2"/>
      <line x1="45" y1="40" x2="45" y2="160" stroke="#1f2933" stroke-width="2"/>
      <line x1="45" y1="40" x2="245" y2="40" stroke="#52606d" stroke-width="1" stroke-dasharray="4 3"/>
      <line x1="45" y1="40" x2="245" y2="160" stroke="#0f766e" stroke-width="1.4"/>
      <path d="M75 40 A30 30 0 0 0 78 52" fill="none" stroke="#0f766e" stroke-width="1.1"/>
      <text x="80" y="54" font-size="12" fill="#0f766e">30°</text>
      <path d="M52 153 h-7 v7" fill="none" stroke="#1f2933" stroke-width="1"/>
      <text x="34" y="38" font-size="13">T</text>
      <text x="34" y="174" font-size="13">F</text>
      <text x="246" y="174" font-size="13">P</text>
      <text x="30" y="105" font-size="12" fill="#52606d">20 m</text>
    </svg>$G$,0),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),14,$P$a$P$,$Q$Define the angle of depression.$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),14,$P$b$P$,$Q$What is the relation between the angle of depression of P from T and the angle of elevation of T from P? Write it.$Q$,1,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),14,$P$c$P$,$Q$Find the distance of the point P from the foot F of the tower.$Q$,1,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),14,$P$d$P$,$Q$If the point moves to where the angle of depression becomes 45°, by how much does it move towards the tower? Find it.$Q$,1,NULL,4),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),15,NULL,$Q$The marks obtained by 40 students in a test are given in the "less than" cumulative table below. <table class="data"> <tr><th>Marks less than</th><td>10</td><td>20</td><td>30</td><td>40</td><td>50</td></tr> <tr><th>No. of students</th><td>4</td><td>14</td><td>24</td><td>34</td><td>40</td></tr> </table>$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),15,$P$a$P$,$Q$What does the cumulative frequency (c.f.) of a class mean? Write it.$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),15,$P$b$P$,$Q$Find the median class of the data.$Q$,1,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),15,$P$c$P$,$Q$Calculate the median of the data.$Q$,2,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),15,$P$d$P$,$Q$How many students obtained 30 or more marks? Find it.$Q$,1,NULL,4),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),16,NULL,$Q$A couple has two children.$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),16,$P$a$P$,$Q$What is the probability of a certain (sure) event? Write it.$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),16,$P$b$P$,$Q$Find the probability that both children are daughters.$Q$,1,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),16,$P$c$P$,$Q$Show the probabilities of all possible outcomes (son/daughter) in a tree diagram.$Q$,2,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-c$S$),16,$P$d$P$,$Q$Find the probability that at least one child is a son.$Q$,1,NULL,4);

-- ---- Mock 4 · Set D (LOCKED) — 16 questions, 49 parts, 75 marks ----
insert into mock_tests (slug,title,set_label,subject,total_marks,duration_minutes,is_free,sort_order,status) values ($S$mock-set-d$S$,$T$SEE Model Test — Set D$T$,$L$Set D$L$,$J$Compulsory Mathematics$J$,75,180,false,4,'draft');
insert into mock_questions (mock_id,question_number,sub_part,question_text_en,marks,diagram_svg,sort_order) values
  ((select id from mock_tests where slug=$S$mock-set-d$S$),1,NULL,$Q$In a class of 48 students, 30 like Mathematics, 24 like Science, and 6 like neither subject.$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),1,$P$a$P$,$Q$If M and S denote the sets of students who like Mathematics and Science respectively, write the cardinality of <span style="text-decoration:overline">(M&cup;S)</span> (the students who like neither).$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),1,$P$b$P$,$Q$Present the above information in a Venn diagram.$Q$,1,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),1,$P$c$P$,$Q$Find the number of students who like both subjects.$Q$,3,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),1,$P$d$P$,$Q$Compare the number who like Mathematics only with the number who like Science only.$Q$,1,NULL,4),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),2,NULL,$Q$A certain sum of money amounts to Rs 9,680 in 2 years at 10% per annum compounded annually.$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),2,$P$a$P$,$Q$For principal Rs P, time T years and rate R% per year, write the formula for the compound amount (CA).$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),2,$P$b$P$,$Q$Find the sum of money (the principal).$Q$,2,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),2,$P$c$P$,$Q$Find the compound interest earned in 2 years.$Q$,2,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),3,NULL,$Q$A motorbike was bought for Rs 2,50,000. Its value depreciates at the rate of 20% per annum.$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),3,$P$a$P$,$Q$If the initial value is V<sub>0</sub>, the rate is R% and the value after T years is V<sub>T</sub>, write the formula for V<sub>T</sub>.$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),3,$P$b$P$,$Q$Find the value of the motorbike after 2 years.$Q$,1,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),3,$P$c$P$,$Q$In how many years will its value fall to Rs 1,28,000? Find it.$Q$,2,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),4,NULL,$Q$On a certain day, a bank's buying rate was &euro;1 = Rs 158 and its selling rate was &euro;1 = Rs 159.$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),4,$P$a$P$,$Q$How many euros does a customer receive on exchanging Rs 3,18,000? Find it.$Q$,2,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),4,$P$b$P$,$Q$On the same day, how many Nepali rupees does another customer receive on exchanging &euro;1,200? Find it.$Q$,1,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),4,$P$c$P$,$Q$If the Nepali currency is then revalued by 5%, what is the new selling rate of the euro? Find it.$Q$,1,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),5,NULL,$Q$The base of a pyramid is a square of side 12 cm and its volume is 384 cu. cm.$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),5,$P$a$P$,$Q$Write the formula for the volume of a pyramid.$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),5,$P$b$P$,$Q$Find the vertical height of the pyramid.$Q$,2,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),5,$P$c$P$,$Q$Find the total surface area of the pyramid.$Q$,2,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),6,NULL,$Q$In the figure, a solid is made of a cylinder with a cone on top. Their common radius is 7 cm, the height of the cylinder is 10 cm and the height of the cone is 24 cm.$Q$,NULL,$G$<svg width="200" height="320" viewBox="0 0 200 320" xmlns="http://www.w3.org/2000/svg" role="img"
         font-family="Outfit, system-ui, sans-serif">
      <title>Cone on a cylinder</title>
      <desc>A cone of height 24 cm on a cylinder of height 10 cm; common radius 7 cm.</desc>
      <path d="M100 20 L152 150 A52 14 0 0 1 48 150 Z" fill="#d3f0ec" stroke="#1f2933" stroke-width="1.5"/>
      <path d="M48 150 A52 14 0 0 0 152 150" fill="none" stroke="#1f2933" stroke-width="1.5"/>
      <path d="M48 150 L48 260 A52 14 0 0 0 152 260 L152 150" fill="#ffffff" stroke="#1f2933" stroke-width="1.5"/>
      <ellipse cx="100" cy="150" rx="52" ry="14" fill="#ffffff" stroke="#1f2933" stroke-width="1.5"/>
      <line x1="100" y1="260" x2="152" y2="260" stroke="#0f766e" stroke-width="1.5"/>
      <text x="116" y="282" font-size="13" fill="#0f766e">r = 7 cm</text>
      <text x="158" y="95" font-size="13" fill="#1f2933">24 cm</text>
      <text x="158" y="210" font-size="13" fill="#1f2933">10 cm</text>
    </svg>$G$,0),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),6,$P$a$P$,$Q$If the radius and slant height of a cone are given, write the formula for its curved surface area.$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),6,$P$b$P$,$Q$Find the volume of the solid.$Q$,2,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),6,$P$c$P$,$Q$Find the total surface area of the solid (the base, the curved cylinder and the curved cone).$Q$,1,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),7,NULL,$Q$A field ABC is in the shape of a right-angled triangle whose two perpendicular sides AB and BC are 30 m and 40 m respectively, as shown in the figure.$Q$,NULL,$G$<svg width="250" height="180" viewBox="0 0 250 180" xmlns="http://www.w3.org/2000/svg" role="img"
         font-family="Outfit, system-ui, sans-serif">
      <title>Right-angled triangular field ABC</title>
      <desc>Right angle at B; AB = 30 m vertical, BC = 40 m horizontal, AC the hypotenuse.</desc>
      <polygon points="45,30 45,150 205,150" fill="#d3f0ec" stroke="#1f2933" stroke-width="1.5"/>
      <path d="M45 138 h12 v12" fill="none" stroke="#1f2933" stroke-width="1"/>
      <text x="34" y="30" font-size="13">A</text>
      <text x="33" y="164" font-size="13">B</text>
      <text x="208" y="162" font-size="13">C</text>
      <text x="12" y="95" font-size="12" fill="#52606d">30 m</text>
      <text x="115" y="167" font-size="12" fill="#52606d">40 m</text>
      <text x="130" y="88" font-size="12" fill="#52606d">AC</text>
    </svg>$G$,0),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),7,$P$a$P$,$Q$Find the cost of levelling the field at the rate of Rs 15 per square metre.$Q$,3,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),7,$P$b$P$,$Q$Find the cost of fencing all around the boundary of the field at Rs 25 per metre.$Q$,2,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),8,NULL,$Q$Four arithmetic means are inserted between 3 and 23.$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),8,$P$a$P$,$Q$If n arithmetic means are inserted between a and b, write the formula for the common difference d.$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),8,$P$b$P$,$Q$Find the third arithmetic mean.$Q$,2,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),8,$P$c$P$,$Q$Find the sum of all the terms from 3 to 23 (both included).$Q$,2,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),9,NULL,$Q$The product of two consecutive positive even numbers is 168.$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),9,$P$a$P$,$Q$How many roots does a quadratic equation have? Write it.$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),9,$P$b$P$,$Q$Find the two numbers.$Q$,3,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),9,$P$c$P$,$Q$Find the sum of the two numbers.$Q$,1,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),10,NULL,$Q$Answer the following.$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),10,$P$a$P$,$Q$Simplify: &nbsp; <span style="display:inline-block;text-align:center;vertical-align:middle">a&minus;b<hr style="margin:1px 0;border:none;border-top:1px solid var(--ink)">a+b</span> &nbsp;&minus;&nbsp; <span style="display:inline-block;text-align:center;vertical-align:middle">a+b<hr style="margin:1px 0;border:none;border-top:1px solid var(--ink)">a&minus;b</span>$Q$,2,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),10,$P$b$P$,$Q$Solve: &nbsp; 9<sup>x</sup> &minus; 4&middot;3<sup>x</sup> + 3 = 0$Q$,3,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),11,NULL,$Q$In the given figure, square ABCD and parallelogram ABEF stand on the same base AB and between the same parallel lines AB and FC.$Q$,NULL,$G$<svg width="300" height="150" viewBox="0 0 300 150" xmlns="http://www.w3.org/2000/svg" role="img"
         font-family="Outfit, system-ui, sans-serif">
      <title>Square and parallelogram on the same base between parallels</title>
      <desc>Base AB; square ABCD with D and C above A and B; parallelogram ABEF sheared to the right.</desc>
      <line x1="20" y1="40" x2="290" y2="40" stroke="#52606d" stroke-width="1.2"/>
      <line x1="20" y1="120" x2="290" y2="120" stroke="#52606d" stroke-width="1.2"/>
      <polygon points="60,120 160,120 160,40 60,40" fill="none" stroke="#1f2933" stroke-width="1.5"/>
      <polygon points="60,120 160,120 240,40 140,40" fill="none" stroke="#0f766e" stroke-width="1.5"/>
      <path d="M100 35 l8 5 -8 5" fill="none" stroke="#52606d" stroke-width="1.2"/>
      <path d="M100 115 l8 5 -8 5" fill="none" stroke="#52606d" stroke-width="1.2"/>
      <text x="50" y="135" font-size="13">A</text>
      <text x="158" y="135" font-size="13">B</text>
      <text x="158" y="35" font-size="13">C</text>
      <text x="50" y="35" font-size="13">D</text>
      <text x="138" y="35" font-size="13">F</text>
      <text x="242" y="35" font-size="13">E</text>
    </svg>$G$,0),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),11,$P$a$P$,$Q$Write one property that is common to a square and a parallelogram.$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),11,$P$b$P$,$Q$Prove that: Area of parallelogram ABEF = Area of square ABCD.$Q$,2,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),11,$P$c$P$,$Q$If AB = 8 cm, find the area of parallelogram ABEF.$Q$,2,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),12,NULL,$Q$In the given figure, AB is a diameter of the circle with centre O, and C is a point on the circle.$Q$,NULL,$G$<svg width="230" height="180" viewBox="0 0 230 180" xmlns="http://www.w3.org/2000/svg" role="img"
         font-family="Outfit, system-ui, sans-serif">
      <title>Angle in a semicircle</title>
      <desc>Diameter AB through centre O; C on the circle; angle ACB is inscribed in the semicircle.</desc>
      <circle cx="115" cy="105" r="70" fill="none" stroke="#52606d" stroke-width="1.3"/>
      <line x1="45" y1="105" x2="185" y2="105" stroke="#1f2933" stroke-width="1.4"/>
      <line x1="45" y1="105" x2="150" y2="42" stroke="#0f766e" stroke-width="1.4"/>
      <line x1="185" y1="105" x2="150" y2="42" stroke="#0f766e" stroke-width="1.4"/>
      <circle cx="115" cy="105" r="2.4" fill="#1f2933"/>
      <text x="33" y="109" font-size="13">A</text>
      <text x="189" y="109" font-size="13">B</text>
      <text x="150" y="34" font-size="13">C</text>
      <text x="104" y="120" font-size="12">O</text>
    </svg>$G$,0),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),12,$P$a$P$,$Q$What is the size of the angle inscribed in a semicircle (&ang;ACB)? Write it.$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),12,$P$b$P$,$Q$If &ang;BAC = 35°, find &ang;ABC.$Q$,1,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),12,$P$c$P$,$Q$Prove experimentally that the angle in a semicircle is a right angle. (Two circles of radii at least 3 cm are necessary.)$Q$,2,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),13,NULL,$Q$Answer the following.$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),13,$P$a$P$,$Q$Construct a triangle ABC in which BC = 6 cm, AB = 5.5 cm and AC = 5 cm. Also construct a triangle DBC equal in area to triangle ABC and having a side BD = 7 cm.$Q$,3,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),13,$P$b$P$,$Q$Write the relation between triangle DAC and triangle DBC with reason.$Q$,1,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),14,NULL,$Q$In the given figure, a kite is flying at the point C at the end of a straight string AC of length 20 m held at A. The string makes an angle of 30° with the horizontal AH.$Q$,NULL,$G$<svg width="290" height="190" viewBox="0 0 290 190" xmlns="http://www.w3.org/2000/svg" role="img"
         font-family="Outfit, system-ui, sans-serif">
      <title>Kite flying at the end of a string</title>
      <desc>String AC = 20 m from A at 30 degrees to the horizontal AH; C is the kite; CH is its height.</desc>
      <line x1="40" y1="150" x2="250" y2="150" stroke="#52606d" stroke-width="1.2"/>
      <line x1="40" y1="150" x2="235" y2="40" stroke="#0f766e" stroke-width="1.4"/>
      <line x1="235" y1="40" x2="235" y2="150" stroke="#1f2933" stroke-width="1.4" stroke-dasharray="4 3"/>
      <path d="M72 150 A32 32 0 0 0 68 135" fill="none" stroke="#0f766e" stroke-width="1.1"/>
      <text x="74" y="145" font-size="12" fill="#0f766e">30°</text>
      <path d="M228 150 h7 v-7" fill="none" stroke="#1f2933" stroke-width="1"/>
      <text x="30" y="155" font-size="13">A</text>
      <text x="238" y="36" font-size="13">C</text>
      <text x="238" y="164" font-size="13">H</text>
      <text x="128" y="86" font-size="12" fill="#52606d">20 m</text>
    </svg>$G$,0),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),14,$P$a$P$,$Q$Define the angle of elevation.$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),14,$P$b$P$,$Q$Find the height CH of the kite above the horizontal.$Q$,1,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),14,$P$c$P$,$Q$Find the horizontal distance AH.$Q$,1,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),14,$P$d$P$,$Q$If the string were pulled so that it makes 60° with the horizontal (length unchanged), by how much would the height of the kite increase? Find it.$Q$,1,NULL,4),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),15,NULL,$Q$The median of the data given in the table below is 25. One frequency (m) is missing. <table class="data"> <tr><th>Class interval</th><td>0&ndash;10</td><td>10&ndash;20</td><td>20&ndash;30</td><td>30&ndash;40</td><td>40&ndash;50</td></tr> <tr><th>Frequency</th><td>5</td><td>m</td><td>10</td><td>8</td><td>7</td></tr> </table>$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),15,$P$a$P$,$Q$In the median formula M<sub>d</sub> = L + (i/f)(N/2 &minus; c.f.), what does f represent? Write it.$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),15,$P$b$P$,$Q$Write the median class of the data.$Q$,1,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),15,$P$c$P$,$Q$Find the value of the missing frequency m.$Q$,2,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),15,$P$d$P$,$Q$Write the total number of data (N).$Q$,1,NULL,4),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),16,NULL,$Q$A bag contains 5 red balls and 3 green balls. Two balls are drawn one after another without replacement.$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),16,$P$a$P$,$Q$If A and B are two mutually exclusive events, write the probability of (A&cup;B).$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),16,$P$b$P$,$Q$Find the probability that both balls drawn are red.$Q$,1,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),16,$P$c$P$,$Q$Show the probabilities of all possible outcomes in a tree diagram.$Q$,2,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-d$S$),16,$P$d$P$,$Q$Find the probability of getting at least one green ball.$Q$,1,NULL,4);

-- ---- Mock 5 · Set E (LOCKED) — 16 questions, 49 parts, 75 marks ----
insert into mock_tests (slug,title,set_label,subject,total_marks,duration_minutes,is_free,sort_order,status) values ($S$mock-set-e$S$,$T$SEE Model Test — Set E$T$,$L$Set E$L$,$J$Compulsory Mathematics$J$,75,180,false,5,'draft');
insert into mock_questions (mock_id,question_number,sub_part,question_text_en,marks,diagram_svg,sort_order) values
  ((select id from mock_tests where slug=$S$mock-set-e$S$),1,NULL,$Q$In a group of 100 people, 60 can speak Nepali, 45 can speak English, and 10 can speak neither of these two languages.$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),1,$P$a$P$,$Q$If N and E denote the sets of people who can speak Nepali and English respectively, write the cardinality of <span style="text-decoration:overline">(N&cup;E)</span> (the people who can speak neither).$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),1,$P$b$P$,$Q$Present the above information in a Venn diagram.$Q$,1,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),1,$P$c$P$,$Q$Find the number of people who can speak exactly one of the two languages.$Q$,3,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),1,$P$d$P$,$Q$Compare the number who can speak both languages with the number who can speak neither.$Q$,1,NULL,4),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),2,NULL,$Q$A person deposited Rs 12,000 in a bank for 1&frac12; years at 20% per annum, compounded half-yearly.$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),2,$P$a$P$,$Q$Compounded half-yearly, how many times is the interest calculated in 1&frac12; years? Write it.$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),2,$P$b$P$,$Q$Find the compound amount at the end of 1&frac12; years.$Q$,2,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),2,$P$c$P$,$Q$Find the compound interest.$Q$,2,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),3,NULL,$Q$The present value of a piece of land is Rs 8,00,000 and it appreciates (grows) at the rate of 10% per annum.$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),3,$P$a$P$,$Q$If the present value is V<sub>0</sub>, the rate is R% and the value after T years is V<sub>T</sub>, write the formula for V<sub>T</sub>.$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),3,$P$b$P$,$Q$Find the value of the land after 2 years.$Q$,1,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),3,$P$c$P$,$Q$In how many years will its value become Rs 10,64,800? Find it.$Q$,2,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),4,NULL,$Q$A merchant exchanged Rs 4,00,000 into US dollars at the rate US$1 = Rs 125. After some days the Nepali currency was revalued by 2%, and on that day he exchanged all his dollars back into Nepali rupees.$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),4,$P$a$P$,$Q$How many US dollars did the merchant get for Rs 4,00,000? Find it.$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),4,$P$b$P$,$Q$After the 2% revaluation of the Nepali currency, what is the new exchange rate? Find it.$Q$,2,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),4,$P$c$P$,$Q$How much did the merchant gain or lose on exchanging the dollars back? Find it.$Q$,1,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),5,NULL,$Q$The perimeter of the base of a square-based pyramid is 24 cm and its vertical height is 4 cm.$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),5,$P$a$P$,$Q$Write the formula for the total surface area of a square-based pyramid.$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),5,$P$b$P$,$Q$Find the slant height of the pyramid.$Q$,2,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),5,$P$c$P$,$Q$Find the total surface area of the pyramid.$Q$,2,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),6,NULL,$Q$A solid capsule is made of a cylinder with a hemisphere attached at each end, as shown in the figure. The common radius is 7 cm and the length of the cylindrical part is 10 cm.$Q$,NULL,$G$<svg width="290" height="150" viewBox="0 0 290 150" xmlns="http://www.w3.org/2000/svg" role="img"
         font-family="Outfit, system-ui, sans-serif">
      <title>Capsule: cylinder with a hemisphere at each end</title>
      <desc>Horizontal cylinder length 10 cm, radius 7 cm, with a hemispherical cap at each end.</desc>
      <!-- cylinder body -->
      <line x1="105" y1="35" x2="185" y2="35" stroke="#1f2933" stroke-width="1.5"/>
      <line x1="105" y1="115" x2="185" y2="115" stroke="#1f2933" stroke-width="1.5"/>
      <rect x="105" y="35" width="80" height="80" fill="#d3f0ec" stroke="none"/>
      <!-- left cap -->
      <path d="M105 35 A40 40 0 0 0 105 115" fill="#ffffff" stroke="#1f2933" stroke-width="1.5"/>
      <!-- right cap -->
      <path d="M185 35 A40 40 0 0 1 185 115" fill="#ffffff" stroke="#1f2933" stroke-width="1.5"/>
      <!-- ellipse seams -->
      <path d="M105 35 A14 40 0 0 0 105 115" fill="none" stroke="#1f2933" stroke-width="1" stroke-dasharray="3 2"/>
      <path d="M185 35 A14 40 0 0 0 185 115" fill="none" stroke="#1f2933" stroke-width="1"/>
      <!-- radius -->
      <line x1="145" y1="75" x2="145" y2="35" stroke="#0f766e" stroke-width="1.5"/>
      <text x="149" y="60" font-size="13" fill="#0f766e">7 cm</text>
      <!-- length -->
      <line x1="105" y1="128" x2="185" y2="128" stroke="#52606d" stroke-width="1"/>
      <text x="132" y="143" font-size="12" fill="#52606d">10 cm</text>
    </svg>$G$,0),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),6,$P$a$P$,$Q$Write the formula for the surface area of a sphere of radius r.$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),6,$P$b$P$,$Q$Find the total surface area of the capsule.$Q$,2,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),6,$P$c$P$,$Q$Compare the curved surface area of the cylindrical part with the total curved surface area of the two hemispherical ends.$Q$,1,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),7,NULL,$Q$The length, breadth and height of a rectangular room are 20 ft, 10 ft and 10 ft respectively. The room has one door of size 8 ft &times; 4 ft and two square windows of side 3 ft.$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),7,$P$a$P$,$Q$Excluding the door and windows, find the cost of painting the four walls and the ceiling at Rs 40 per square foot.$Q$,3,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),7,$P$b$P$,$Q$If the rate per square foot increases by 25%, by how much does the total cost increase? Find it.$Q$,2,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),8,NULL,$Q$Two geometric means are inserted between 4 and 108.$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),8,$P$a$P$,$Q$If n geometric means are inserted between a and b, write the formula for the common ratio r.$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),8,$P$b$P$,$Q$Find the two geometric means.$Q$,2,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),8,$P$c$P$,$Q$Find the sum of the resulting geometric series (4 to 108, both included).$Q$,2,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),9,NULL,$Q$The perimeter of a rectangular plot is 34 m and its area is 60 sq. m.$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),9,$P$a$P$,$Q$How many roots does a quadratic equation have? Write it.$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),9,$P$b$P$,$Q$Find the length and breadth of the plot.$Q$,3,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),9,$P$c$P$,$Q$Find the length of the diagonal of the plot.$Q$,1,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),10,NULL,$Q$Answer the following.$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),10,$P$a$P$,$Q$Simplify: &nbsp; <span style="display:inline-block;text-align:center;vertical-align:middle">1<hr style="margin:1px 0;border:none;border-top:1px solid var(--ink)">x<sup>2</sup>&minus;x</span> &nbsp;+&nbsp; <span style="display:inline-block;text-align:center;vertical-align:middle">1<hr style="margin:1px 0;border:none;border-top:1px solid var(--ink)">x<sup>2</sup>+x</span>$Q$,2,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),10,$P$b$P$,$Q$Solve: &nbsp; 4<sup>x</sup> &minus; 5&middot;2<sup>x</sup> + 4 = 0$Q$,3,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),11,NULL,$Q$In the given figure, AD is the median of triangle ABC (that is, D is the mid-point of BC).$Q$,NULL,$G$<svg width="260" height="160" viewBox="0 0 260 160" xmlns="http://www.w3.org/2000/svg" role="img"
         font-family="Outfit, system-ui, sans-serif">
      <title>Median of a triangle</title>
      <desc>Triangle ABC with apex A; D is the mid-point of base BC; AD is the median.</desc>
      <polygon points="120,25 40,135 220,135" fill="none" stroke="#1f2933" stroke-width="1.5"/>
      <line x1="120" y1="25" x2="130" y2="135" stroke="#0f766e" stroke-width="1.4"/>
      <!-- equal tick marks on BD and DC -->
      <path d="M82 130 l4 8" stroke="#52606d" stroke-width="1.2"/>
      <path d="M177 130 l4 8" stroke="#52606d" stroke-width="1.2"/>
      <text x="116" y="20" font-size="13">A</text>
      <text x="28" y="145" font-size="13">B</text>
      <text x="126" y="150" font-size="13">D</text>
      <text x="222" y="145" font-size="13">C</text>
    </svg>$G$,0),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),11,$P$a$P$,$Q$Write the relation between the area of &triangle;ABD and the area of &triangle;ACD.$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),11,$P$b$P$,$Q$Prove that: Area of &triangle;ABD = Area of &triangle;ACD.$Q$,2,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),11,$P$c$P$,$Q$In a parallelogram PQRS, prove that the diagonal PR divides it into two triangles of equal area.$Q$,2,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),12,NULL,$Q$In the given figure, ABCD is a cyclic quadrilateral whose side AB is produced to the point E.$Q$,NULL,$G$<svg width="230" height="210" viewBox="0 0 230 210" xmlns="http://www.w3.org/2000/svg" role="img"
         font-family="Outfit, system-ui, sans-serif">
      <title>Cyclic quadrilateral with one side produced</title>
      <desc>Quadrilateral ABCD in a circle; side AB produced to E; exterior angle CBE.</desc>
      <circle cx="105" cy="100" r="80" fill="none" stroke="#52606d" stroke-width="1.3"/>
      <polygon points="45,50 165,70 150,165 40,140" fill="#d3f0ec" fill-opacity="0.5" stroke="#1f2933" stroke-width="1.5"/>
      <!-- AB produced to E -->
      <line x1="45" y1="50" x2="205" y2="76" stroke="#1f2933" stroke-width="1.4"/>
      <text x="30" y="48" font-size="13">A</text>
      <text x="168" y="66" font-size="13">B</text>
      <text x="152" y="180" font-size="13">C</text>
      <text x="24" y="146" font-size="13">D</text>
      <text x="208" y="80" font-size="13">E</text>
    </svg>$G$,0),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),12,$P$a$P$,$Q$Write the relation between the exterior angle &ang;CBE and the interior opposite angle &ang;ADC.$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),12,$P$b$P$,$Q$If &ang;ADC = 105°, find the value of &ang;CBE.$Q$,1,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),12,$P$c$P$,$Q$Prove experimentally that the exterior angle of a cyclic quadrilateral equals the interior opposite angle. (Two circles of radii at least 3 cm are necessary.)$Q$,2,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),13,NULL,$Q$Answer the following.$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),13,$P$a$P$,$Q$Construct a quadrilateral ABCD in which AB = 5 cm, BC = 5.5 cm, CD = 4.5 cm, DA = 6 cm and &ang;ABC = 75°. Also construct a triangle BCE whose area is equal to the area of the quadrilateral.$Q$,3,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),13,$P$b$P$,$Q$Give the reason why the quadrilateral ABCD and the triangle BCE are equal in area.$Q$,1,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),14,NULL,$Q$In the given figure, PQ is a vertical tower on level ground. From a point A on the ground, 20 m from the foot Q, the angle of elevation of the top P is 60°.$Q$,NULL,$G$<svg width="280" height="220" viewBox="0 0 280 220" xmlns="http://www.w3.org/2000/svg" role="img"
         font-family="Outfit, system-ui, sans-serif">
      <title>Angle of elevation of a tower top</title>
      <desc>Tower PQ on the right; point A on the ground 20 m from the foot Q; elevation 60 degrees; AP the line of sight.</desc>
      <line x1="40" y1="185" x2="250" y2="185" stroke="#52606d" stroke-width="1.2"/>
      <line x1="230" y1="35" x2="230" y2="185" stroke="#1f2933" stroke-width="2"/>
      <line x1="55" y1="185" x2="230" y2="35" stroke="#0f766e" stroke-width="1.4"/>
      <path d="M85 185 A30 30 0 0 0 80 168" fill="none" stroke="#0f766e" stroke-width="1.1"/>
      <text x="88" y="180" font-size="12" fill="#0f766e">60°</text>
      <path d="M223 178 h7 v7" fill="none" stroke="#1f2933" stroke-width="1"/>
      <text x="235" y="35" font-size="13">P</text>
      <text x="235" y="198" font-size="13">Q</text>
      <text x="48" y="200" font-size="13">A</text>
      <text x="135" y="202" font-size="12" fill="#52606d">20 m</text>
    </svg>$G$,0),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),14,$P$a$P$,$Q$Define the angle of elevation.$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),14,$P$b$P$,$Q$Find the height of the tower PQ.$Q$,1,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),14,$P$c$P$,$Q$Find the length of the line of sight AP.$Q$,1,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),14,$P$d$P$,$Q$If the observer moves back to a point where the angle of elevation is 30°, find his new distance from the foot Q.$Q$,1,NULL,4),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),15,NULL,$Q$The marks obtained by 30 students in a test are given in the table below. <table class="data"> <tr><th>Marks obtained</th><td>0&ndash;10</td><td>10&ndash;20</td><td>20&ndash;30</td><td>30&ndash;40</td><td>40&ndash;50</td></tr> <tr><th>No. of students</th><td>3</td><td>4</td><td>10</td><td>6</td><td>7</td></tr> </table>$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),15,$P$a$P$,$Q$What is meant by the modal class of a continuous data set? Write it.$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),15,$P$b$P$,$Q$Write the modal class of the given data.$Q$,1,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),15,$P$c$P$,$Q$Calculate the mode of the given data.$Q$,2,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),15,$P$d$P$,$Q$How many students obtained less than 20 marks? Find it.$Q$,1,NULL,4),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),16,NULL,$Q$Two fair coins are tossed together at the same time.$Q$,NULL,NULL,0),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),16,$P$a$P$,$Q$What is the probability of an impossible event? Write it.$Q$,1,NULL,1),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),16,$P$b$P$,$Q$Find the probability of getting two tails.$Q$,1,NULL,2),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),16,$P$c$P$,$Q$Show the probabilities of all possible outcomes (head/tail) in a tree diagram.$Q$,2,NULL,3),
  ((select id from mock_tests where slug=$S$mock-set-e$S$),16,$P$d$P$,$Q$Find the probability of getting at least one head.$Q$,1,NULL,4);

commit;

-- verify what landed:
select t.set_label, t.is_free, t.status, count(*) filter (where q.sub_part is null) as questions,
       count(*) filter (where q.sub_part is not null) as parts, coalesce(sum(q.marks),0) as marks
from mock_tests t left join mock_questions q on q.mock_id=t.id
where t.slug like 'mock-set-%' group by t.set_label,t.is_free,t.status order by t.set_label;