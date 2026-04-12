const salesCourse = {
  id: 'sales-enablement',
  title: 'Partner Sales Enablement Bootcamp',
  description: 'Comprehensive 2-day intensive training for partner sales teams, account managers, and business development professionals.',
  duration: '2 Days (16 Hours)',
  audience: 'Partner sales teams, account managers, business development',
  classSize: '10-15 participants per cohort',
  prerequisites: 'None (designed for salespeople, not technical staff)',
  icon: 'TrendingUp',
  color: 'nobus',
  objectives: [
    'Articulate Nobus Cloud\'s value proposition to different buyer personas',
    'Conduct effective discovery calls and qualification',
    'Position Nobus against AWS, Azure, and on-premise',
    'Build compelling proposals and ROI calculations',
    'Execute proof-of-concept sales strategies',
    'Navigate deal registration and commission processes',
  ],
  modules: [
    {
      id: 'sales-m1',
      title: 'Session 1: Nobus Cloud Overview',
      day: 1,
      time: '8:00 AM - 9:30 AM',
      lessons: [
        {
          id: 'sales-m1-l1',
          title: '1.1 About Nobus',
          content: `## Company Background

- **Mission:** Democratize cloud computing in Africa
- **Data Centers:** Lagos/Abuja (Tier III)
- **Platform:** OpenStack-based hyperscale cloud

### Why This Matters for Your Sales

- **Local company** = easier procurement for Nigerian businesses
- **Tier III** = enterprise-grade reliability
- **Growth rate** = market validation
- **Naira billing** = no FX exposure for customers`
        },
        {
          id: 'sales-m1-l2',
          title: '1.2 The Nobus Difference',
          content: `## Competitive Advantages (Your Selling Points)

### 1. Data Sovereignty
- Data stays in Nigeria (NDPR compliance)
- No foreign government access
- Critical for banks, government, healthcare

> **Sales Pitch:** *"Unlike AWS or Azure where your data sits in Europe or US, Nobus keeps your data in Nigeria. For banks and government agencies, this isn't just convenient—it's often a legal requirement. Can you afford the regulatory risk of offshore data?"*

### 2. Naira Pricing
- Bill in ₦, not USD
- No foreign exchange risk
- Budget certainty

> **Sales Pitch:** *"Your CFO budgets in Naira. AWS bills in dollars. When exchange rate goes from ₦400 to ₦800, your AWS bill doubles overnight. With Nobus, ₦100K means ₦100K—no surprises."*

### 3. Local Support
- Same time zone
- Phone support in English
- Understand Nigerian business context
- Can visit your office

> **Sales Pitch:** *"When your system goes down at 9 PM Lagos time, who answers? AWS support might take hours in different timezone. Nobus support is HERE—same city, same time zone, speak your language."*

### 4. Compliance First
- ISO 27001 certified
- PCI-DSS compliant
- NDPR aligned
- Built for regulated industries

### 5. Cost Competitive
- 15-30% cheaper than global clouds
- No egress fees (data transfer out)
- Transparent pricing

> **Sales Pitch:** *"You think AWS is expensive? Their egress fees alone can be 20% of your bill. Nobus has NO egress fees. Average customer saves 25% vs. AWS."*`
        },
        {
          id: 'sales-m1-l3',
          title: '1.3 The Market Opportunity',
          content: `## Cloud Adoption in Nigeria

- Massive untapped opportunity
- Only a small percentage of businesses are in cloud
- Fast-growing market annually

### Target Sectors (Priority Order)

1. **Banking & Financial Services** - Highest value, compliance-driven
2. **Fintech** - Fast-growing, cloud-native, high spend
3. **Healthcare** - Data sensitivity, NDPR critical
4. **Telecom** - Large infrastructure needs
5. **E-commerce** - Scalability needs
6. **Government** - Data sovereignty mandate
7. **Education** - Digital transformation
8. **Manufacturing** - ERP migration

> **Why This Matters:** These sectors have BUDGET and URGENCY. One bank deal = ₦50M+/year.`
        },
        {
          id: 'sales-m1-l4',
          title: '1.4 Buyer Personas',
          content: `## Understanding Your Buyers

### Persona 1: The CIO/CTO (Economic Buyer)
- **Age:** 40-55
- **Concerns:** Risk, reliability, compliance, career
- **Decision criteria:** Uptime SLAs, support, references
- **Pain points:** Aging infrastructure, OpEx budget pressure
- **What they care about:** "Will this work? Will I get fired if it fails?"

**How to Sell:**
- Lead with reliability and compliance
- Show case studies from similar companies
- Offer referenceable customers
- Emphasize risk mitigation (multi-AZ, backups)
- Provide ROI analysis for CFO

---

### Persona 2: The IT Manager (Technical Buyer)
- **Age:** 30-45
- **Concerns:** Day-to-day operations, learning curve, support
- **Decision criteria:** Ease of use, documentation, support quality
- **Pain points:** Understaffed team, late nights fixing servers

**How to Sell:**
- Demonstrate ease of use
- Highlight managed services (less work for them)
- Emphasize support quality
- Show training options

---

### Persona 3: The CFO (Financial Buyer)
- **Age:** 40-60
- **Concerns:** Cost, budget certainty, ROI, cash flow
- **Decision criteria:** TCO, OpEx vs. CapEx, payment terms

**How to Sell:**
- Lead with cost savings
- TCO calculator (show CapEx → OpEx benefit)
- Naira pricing stability
- Quick ROI (often <12 months)

---

### Persona 4: The CEO (Ultimate Buyer)
- **Age:** 45-65
- **Concerns:** Business growth, competitive advantage, risk

**How to Sell:**
- Business outcomes, not technology
- Speed to market
- Competitive advantage
- Strategic partnership, not vendor`
        },
      ],
      quiz: {
        id: 'quiz-sales-m1',
        title: 'Session 1 Quiz: Nobus Cloud Overview',
        questions: [
          {
            q: 'What is the primary compliance advantage Nobus offers over AWS/Azure for Nigerian businesses?',
            options: ['Lower pricing', 'Data sovereignty - data stays in Nigeria (NDPR compliance)', 'More services available', 'Faster compute instances'],
            correct: 1,
          },
          {
            q: 'Which buyer persona is most concerned with TCO, OpEx vs CapEx, and budget certainty?',
            options: ['CIO/CTO', 'IT Manager', 'CFO', 'CEO'],
            correct: 2,
          },
          {
            q: 'What is the #1 priority target sector for Nobus Cloud sales?',
            options: ['E-commerce', 'Education', 'Banking & Financial Services', 'Manufacturing'],
            correct: 2,
          },
          {
            q: 'Which of the following is TRUE about Nobus pricing?',
            options: ['Nobus bills in USD', 'Nobus charges egress fees', 'Nobus bills in Naira with no egress fees', 'Nobus is more expensive than AWS'],
            correct: 2,
          },
        ],
      },
    },
    {
      id: 'sales-m2',
      title: 'Session 2: Sales Process & Discovery',
      day: 1,
      time: '9:45 AM - 11:15 AM',
      lessons: [
        {
          id: 'sales-m2-l1',
          title: '2.1 The Nobus Sales Process',
          content: `## 6-Stage Sales Process

### Stage 1: Lead Generation (Your responsibility)
- **Outbound:** Cold calls, LinkedIn, events
- **Inbound:** Webinars, website, referrals
- **Marketing:** Content, SEO, partnerships
- **Your Goal:** Get 30-minute intro call

### Stage 2: Initial Discovery Call (30-45 min)
- Qualify: BANT (Budget, Authority, Need, Timeline)
- Understand: Current infrastructure, pain points
- Educate: Nobus value proposition
- **Your Goal:** Schedule deep-dive technical call

### Stage 3: Technical Discovery (60-90 min, includes Nobus engineer)
- Map current architecture
- Identify migration candidates
- Discuss concerns and objections
- Demonstrate Nobus platform
- **Your Goal:** Agreement to proceed with proposal

### Stage 4: Proposal & PoC (1-2 weeks)
- Written proposal with pricing
- Optional: Proof of Concept (4 weeks)
- Reference calls if requested
- **Your Goal:** Verbal commitment to proceed

### Stage 5: Negotiation & Close (1-2 weeks)
- Commercial terms, Contract review
- Executive sign-off, Purchase order
- **Your Goal:** Signed contract

### Stage 6: Implementation (1-3 months)
- Onboarding and migration
- Training, Go-live
- Transition to support
- **Your Goal:** Successful production deployment + testimonial

**Typical Timeline:** 2-4 months for new logo, 2-6 weeks for expansion`
        },
        {
          id: 'sales-m2-l2',
          title: '2.2 Discovery Framework: SPIN Selling',
          content: `## SPIN Selling Framework

### S - Situation Questions (Understand current state)
- "Walk me through your current infrastructure setup."
- "How many servers are you running today?"
- "Where is your data center located?"
- "Who manages your infrastructure?"
- "What percentage of your IT budget goes to infrastructure?"

### P - Problem Questions (Uncover pain)
- "How often do you experience downtime?"
- "What happens when you run out of capacity?"
- "How long does it take to provision new servers?"
- "What keeps you up at night about your current setup?"
- "Tell me about the last time infrastructure blocked a business initiative."

### I - Implication Questions (Amplify pain)
- "If you had another 6-hour outage, what would be the business impact?"
- "How much revenue do you lose per hour of downtime?"
- "If you can't scale for the Christmas rush, what happens?"
- "What does slow infrastructure provisioning cost you in time-to-market?"

### N - Need-Payoff Questions (Paint vision)
- "If you could provision servers in 5 minutes instead of 5 weeks, what would that enable?"
- "What if you only paid for what you actually use?"
- "How would 99.95% uptime change your operations?"
- "What could you do with the ₦20M you'd save on infrastructure?"`
        },
        {
          id: 'sales-m2-l3',
          title: '2.3 Qualification: The BANT Framework',
          content: `## BANT Qualification Framework

### B - Budget
**Good Questions:**
- "What are you currently spending on infrastructure?"
- "Do you have budget approved for this fiscal year?"
- "Are you looking at CapEx or OpEx budget?"

**Don't Ask:** "How much money do you have?" (too direct)

**Decision Criteria:**
- ✅ GO: Budget identified and accessible
- ⚠️ CAUTION: "We need to find budget" (lower priority)
- ❌ STOP: "No budget and no path to budget"

---

### A - Authority
**Good Questions:**
- "Who else is involved in this decision?"
- "Walk me through your approval process."
- "Who has the final sign-off?"

**Decision Criteria:**
- ✅ GO: Speaking with decision-maker OR clear path to them
- ⚠️ CAUTION: Speaking with influencer (keep qualifying)
- ❌ STOP: Speaking with blocker or no access

---

### N - Need
**Good Questions:**
- "What's driving this initiative right now?"
- "What problem are you trying to solve?"
- "What happens if you don't solve this in the next 6 months?"

---

### T - Timeline
**Good Questions:**
- "When do you need this operational?"
- "What's driving that timeline?"
- "When does your fiscal year end?" (budget urgency)

## Qualifying Scorecard

| Criteria | Score (0-3) | Weight |
|----------|-------------|--------|
| Budget Identified | _ | 3x |
| Authority Access | _ | 3x |
| Compelling Need | _ | 2x |
| Timeline <90 days | _ | 2x |
| Right Fit (use case) | _ | 1x |

- **25+**: High priority, schedule technical deep-dive immediately
- **15-24**: Medium priority, continue discovery
- **<15**: Low priority, disqualify or nurture`
        },
      ],
      quiz: {
        id: 'quiz-sales-m2',
        title: 'Session 2 Quiz: Sales Process & Discovery',
        questions: [
          {
            q: 'In the SPIN selling framework, what do "I" questions do?',
            options: ['Identify the current situation', 'Amplify the pain of the problem', 'Present the Nobus solution', 'Investigate the budget'],
            correct: 1,
          },
          {
            q: 'What is the typical timeline for closing a new logo deal?',
            options: ['1-2 weeks', '2-4 months', '6-12 months', '1-2 days'],
            correct: 1,
          },
          {
            q: 'A prospect scores 28 on the BANT qualifying scorecard. What should you do?',
            options: ['Disqualify them', 'Continue discovery', 'Schedule technical deep-dive immediately', 'Nurture the lead'],
            correct: 2,
          },
          {
            q: 'What is the goal of Stage 2 (Initial Discovery Call)?',
            options: ['Get a signed contract', 'Schedule a deep-dive technical call', 'Deliver a proposal', 'Begin implementation'],
            correct: 1,
          },
        ],
      },
    },
    {
      id: 'sales-m3',
      title: 'Session 3: Competitive Positioning',
      day: 1,
      time: '11:30 AM - 1:00 PM',
      lessons: [
        {
          id: 'sales-m3-l1',
          title: '3.1 Your Competition',
          content: `## Primary Competitors

1. **AWS (Amazon Web Services)** - 800 lb gorilla, market leader
2. **Microsoft Azure** - Enterprise-focused
3. **Google Cloud** - Data/AI-focused
4. **On-Premise** - Status quo (biggest competitor!)

### Secondary
- Other Nigerian cloud providers (if any)
- Hosting companies positioning as "cloud"

> **Key Insight:** On-Premise is your REAL competition. Most Nigerian businesses are still on-premise!`
        },
        {
          id: 'sales-m3-l2',
          title: '3.2 Battlecard: Nobus vs. AWS',
          content: `## Nobus vs. AWS Comparison

| Factor | Nobus | AWS | Your Talking Point |
|--------|-------|-----|-------------------|
| **Data Location** | Lagos/Abuja, Nigeria | Europe/US | "Your data stays in Nigeria. NDPR compliant by design." |
| **Currency** | Bill in Naira | Bill in USD | "No exchange rate risk. ₦100K today = ₦100K next month." |
| **Support** | Same timezone, phone, local | Different timezone, mostly online | "When your system crashes at 9 PM, we answer in Lagos." |
| **Pricing** | 15-30% cheaper | Premium pricing | "Same quality, better price. Certified Tier III like AWS." |
| **Egress Fees** | NONE | 5-20% of bill | "Data transfer out is FREE on Nobus." |
| **Compliance** | ISO 27001, PCI-DSS, NDPR | ISO 27001, PCI-DSS | "Equally certified, but data stays in Nigeria." |
| **Complexity** | Simpler, fewer services | 200+ services, complex | "We focus on what Nigerian businesses actually need." |
| **Onboarding** | White-glove | Self-service | "We train your team. Walk you through migration." |

### What TO Say
- ✅ "AWS is excellent for global companies. For Nigerian businesses prioritizing data sovereignty, local support, and cost, Nobus is often the better fit."
- ✅ "Many of our customers evaluated AWS and chose Nobus because [specific reason matching their pain]."

### What NOT to Say
- ❌ "AWS sucks" (unprofessional)
- ❌ "We're better than AWS at everything" (not believable)`
        },
        {
          id: 'sales-m3-l3',
          title: '3.3-3.4 Battlecards: Azure & On-Premise',
          content: `## Nobus vs. Azure

| Factor | Nobus | Azure | Talking Point |
|--------|-------|-------|---------------|
| **Focus** | Nigerian SMBs to Enterprise | Microsoft shops | "If you're Microsoft everywhere, Azure makes sense. If not, Nobus is simpler and cheaper." |
| **Integration** | Cloud-agnostic | Deep Microsoft integration | "Nobus supports Linux, Windows, any stack you prefer." |
| **Pricing** | Transparent, simpler | Complex, licensing confusing | "Nobus pricing is simple: ₦X per hour, period." |

---

## Nobus vs. On-Premise (Status Quo)

**This is your REAL competition.** Most Nigerian businesses are still on-premise!

| Factor | On-Premise | Nobus | Talking Point |
|--------|-----------|-------|---------------|
| **CapEx** | ₦50M+ upfront | ₦0 upfront | "No need to write a ₦50M check. Pay-as-you-go from ₦50K/month." |
| **OpEx** | ₦10-20M/year | ₦5-15M/year | "Cheaper to operate. No power, cooling, staff costs." |
| **Scalability** | Buy ahead | Instant | "Black Friday traffic? Scale in 5 minutes." |
| **Downtime** | Your problem | Our problem | "Server fails? We fix it in minutes, you don't even know." |
| **Compliance** | DIY | Certified | "You need ISO 27001? We already have it. You inherit compliance." |
| **Power** | NEPA risk | Generator backup | "Power goes out in Lagos? We have redundant power. Zero impact." |

### Common On-Premise Objections

**"But we already own the servers."**
> "True, but sunk cost. What's cheaper for next 3 years?"

**"Our data is too sensitive for cloud."**
> "Yet Central Bank and major fintechs trust Nobus with customer financial data."

**"Cloud is expensive."**
> "Let's do the math. Your server: ₦2M purchase + ₦500K/year. Nobus equivalent: ₦100K/month x 36 months = ₦3.6M. We're cheaper, PLUS you get redundancy and support."`
        },
      ],
      quiz: {
        id: 'quiz-sales-m3',
        title: 'Session 3 Quiz: Competitive Positioning',
        questions: [
          {
            q: 'What is Nobus\'s BIGGEST competitor in Nigeria?',
            options: ['AWS', 'Azure', 'Google Cloud', 'On-Premise (Status Quo)'],
            correct: 3,
          },
          {
            q: 'What is a key advantage Nobus has over AWS regarding data transfer?',
            options: ['Faster network speeds', 'No egress fees', 'More data centers', 'Free inbound data'],
            correct: 1,
          },
          {
            q: 'When a prospect says "AWS is the industry standard," what should you NOT say?',
            options: ['"AWS is excellent for global companies"', '"Many of our customers evaluated AWS and chose Nobus"', '"AWS sucks"', '"For Nigerian businesses, Nobus is often the better fit"'],
            correct: 2,
          },
        ],
      },
    },
    {
      id: 'sales-m4',
      title: 'Session 4: Proposal Development',
      day: 1,
      time: '2:00 PM - 3:30 PM',
      lessons: [
        {
          id: 'sales-m4-l1',
          title: '4.1 Proposal Structure',
          content: `## Every Proposal Must Include These 8 Sections

### 1. Executive Summary (1 page)
- Their problem
- Our solution
- Key benefits (3-5 bullet points)
- Total investment
- Next steps

> **Keep it short!** Execs won't read past page 1 if not hooked.

### 2. Understanding Your Business (1 page)
- Demonstrate you listened in discovery
- Repeat their pain points back
- Show you understand their industry

### 3. Proposed Solution (2-3 pages)
- High-level architecture diagram
- Services included
- How it solves their problems
- Why this approach

### 4. Implementation Plan (1 page)
- Timeline: Weeks 1-4, 5-8, 9-12
- Milestones
- Roles and responsibilities
- Training plan

### 5. Pricing (1-2 pages)
- Monthly recurring costs
- One-time setup costs (if any)
- 12-month projection
- 3-year TCO comparison
- Payment terms

### 6. Success Stories (1 page)
- 2-3 brief customer stories
- Similar company size or industry
- Quantified results
- Quote from customer if possible

### 7. Why Nobus (1 page)
- Data sovereignty, Compliance
- Support quality, Company stability
- Partnership approach

### 8. Next Steps (1/2 page)
- Clear call-to-action
- Timeline for decision
- Who to contact

**Total length: 10-12 pages max.** Nobody reads 50-page proposals.`
        },
        {
          id: 'sales-m4-l2',
          title: '4.2 Pricing Your Proposal',
          content: `## Step-by-Step Pricing Guide

### Step 1: Size the Workload
Ask in discovery:
- How many applications?
- How many users?
- How much data?
- Current infrastructure specs?
- Performance requirements?

### Step 2: Map to Nobus Services

**Example: Simple Web Application**

Current State (On-Prem):
- 2 web servers, 1 database server, 1 backup server
- 2TB storage
- Cost: ₦15M/year (CapEx + OpEx)

Nobus Equivalent:
- 2x t2.medium instances (web) @ ₦50K/month each = ₦100K
- 1x r5.large instance (database) @ ₦120K/month = ₦120K
- Managed backups @ ₦30K/month = ₦30K
- 2TB block storage @ ₦20K/TB/month = ₦40K
- Load balancer @ ₦25K/month = ₦25K
- **TOTAL: ₦315K/month = ₦3.78M/year**
- **SAVINGS: ₦15M - ₦3.78M = ₦11.22M/year (75% reduction!)**

### Step 3: Add Contingency
- Development/Test environment: +50% of production cost
- Training: ₦500K one-time
- Migration support: ₦1-2M one-time
- Safety buffer: +10%

### Step 5: Position the Price
✅ **Good:** "For ₦315K per month—less than the cost of one junior developer—you get enterprise-grade infrastructure with 99.95% uptime, included backups, and 24/7 support."

❌ **Bad:** "It costs ₦315K per month." (Just a number, no context)`
        },
      ],
      quiz: {
        id: 'quiz-sales-m4',
        title: 'Session 4 Quiz: Proposal Development',
        questions: [
          {
            q: 'What is the recommended maximum length for a proposal?',
            options: ['5 pages', '10-12 pages', '25 pages', '50 pages'],
            correct: 1,
          },
          {
            q: 'How should you position the price to a customer?',
            options: ['Just state the number plainly', 'Compare it to a relatable cost and highlight value', 'Always offer a discount upfront', 'Avoid discussing price entirely'],
            correct: 1,
          },
        ],
      },
    },
    {
      id: 'sales-m5',
      title: 'Session 5: Proof of Concept Strategy',
      day: 1,
      time: '3:45 PM - 5:00 PM',
      lessons: [
        {
          id: 'sales-m5-l1',
          title: '5.1-5.2 When to Recommend & Structure a PoC',
          content: `## When to Recommend a PoC

### YES - Recommend PoC when:
- Large deal (>₦10M/year)
- Risk-averse buyer
- Technical complexity or uncertainty
- Competitive situation (we're not incumbent)
- First cloud project for the company

### NO - Skip PoC when:
- Small deal (<₦2M/year)
- Simple, well-understood use case
- They're already convinced
- Existing customer expanding

### PoC vs. Pilot vs. Trial
- **PoC:** Validates feasibility. Usually free. 2-4 weeks.
- **Pilot:** Small production deployment. Paid (discounted). 1-3 months.
- **Trial:** Test drive. Free tier or credit. Days to weeks.

## PoC Charter Template

| Section | Details |
|---------|---------|
| **Objective** | Demonstrate that Nobus can host [APPLICATION] |
| **Success Criteria** | Performance <100ms, 99.95% uptime, Pass security scan, 30%+ savings |
| **Scope** | Migrate specific application, production-like architecture |
| **Timeline** | 4 weeks (Setup → Migration → Testing → Analysis) |
| **Investment** | Nobus waives infra costs; Customer: 2 engineers, 8 hrs/week |

> **Critical:** Get them to agree UPFRONT what "success" looks like. Otherwise, they'll keep adding requirements and never decide.`
        },
        {
          id: 'sales-m5-l2',
          title: '5.3-5.4 PoC Execution & Converting to Production',
          content: `## PoC Execution Tips

### Before You Start
- ☐ Get signed PoC charter
- ☐ Confirm decision date (don't let it drag on)
- ☐ Assign Nobus technical resource
- ☐ Schedule weekly check-ins
- ☐ Set up communication channel (WhatsApp/Slack)

### During the PoC
- ☐ Weekly status updates (even if "no change")
- ☐ Document everything (screenshots, metrics)
- ☐ Proactively solve problems
- ☐ Build relationship with technical team
- ☐ Identify internal champion

### After the PoC
- ☐ Present results formally (PowerPoint)
- ☐ Quantify success (numbers, not opinions)
- ☐ Get testimonial from technical team
- ☐ Ask for the business (don't be shy!)

## Converting PoC to Production

### Common Stall Tactics (and How to Overcome)

**Stall:** "PoC was successful! We need to run another test..."
> **Response:** "Great! What specifically wasn't validated? Let's address that concern directly."

**Stall:** "Let me socialize this internally..."
> **Response:** "Absolutely. How can I help? Would it help if I presented to your team?"

**Stall:** "We want to test AWS too..."
> **Response:** "Of course! When is AWS's PoC scheduled? Can we agree that if Nobus matches or beats their results, you'll move forward with us?"

### The Close
> "The PoC was successful—you saw [specific results]. You mentioned [pain point] is costing you [amount]. We can solve it. What questions remain before we proceed?"

Then **SHUT UP**. First person who speaks loses. Let silence do the work.`
        },
      ],
      quiz: {
        id: 'quiz-sales-m5',
        title: 'Session 5 Quiz: PoC Strategy',
        questions: [
          {
            q: 'When should you SKIP a PoC?',
            options: ['Large deal with risk-averse buyer', 'Competitive situation', 'Existing customer expanding with simple use case', 'First cloud project for the company'],
            correct: 2,
          },
          {
            q: 'What is the most critical thing to do BEFORE starting a PoC?',
            options: ['Set up monitoring', 'Get agreement on success criteria upfront', 'Build the architecture', 'Train the customer team'],
            correct: 1,
          },
        ],
      },
    },
    {
      id: 'sales-m6',
      title: 'Session 6: Objection Handling',
      day: 2,
      time: '8:00 AM - 10:00 AM',
      lessons: [
        {
          id: 'sales-m6-l1',
          title: '6.1 The Objection Handling Framework',
          content: `## 5-Step Objection Handling Framework

1. **Listen** (don't interrupt)
2. **Acknowledge** (show empathy)
3. **Question** (understand the real objection)
4. **Answer** (address the concern)
5. **Confirm** (check if resolved)

### Example
**Prospect:** "Your price is too high."

❌ **Bad Response:** "No it's not! AWS is more expensive!"

✅ **Good Response:**
1. Listen: [Let them finish]
2. Acknowledge: "I understand price is a concern..."
3. Question: "...help me understand what you're comparing us to?"
4. Answer: [Tailored response based on their comparison]
5. Confirm: "Does that address your concern, or is there something else?"`
        },
        {
          id: 'sales-m6-l2',
          title: '6.2-6.3 Top Objections & Hidden Objections',
          content: `## Handling Price Objections

**"That's too expensive."**

Don't argue! Ask: "Help me understand—what's too expensive relative to? What were you expecting?"

**If comparing to on-prem:**
> "You're spending ₦15M/year today. We're ₦3.8M. That's 75% cheaper. What am I missing?"

**If comparing to AWS:**
> "AWS quoted ₦X? Let's compare apples to apples. Does AWS include support? Training? Egress fees? Customers typically find Nobus 20-30% less."

**If no budget:**
> "Can we phase this? Start with just production for ₦300K/month, add dev/test in Q2?"

**If pushing for discount:**
> "Here's what I can do: [10% discount for annual prepay OR bundled services OR extended payment terms]. Does that help?"

### What NOT to do
- ❌ Immediately discount (trains them to ask for more)
- ❌ Badmouth the competition
- ❌ Argue about value
- ❌ Give up and walk away

---

## The "Hidden Objection"

Sometimes the stated objection isn't the real objection.

### Signs of a Hidden Objection
- Your answer doesn't resolve their concern
- They keep bringing up same objection differently
- Body language seems off
- They won't commit even after objections "resolved"

### How to Uncover
> "I feel like there's something else concerning you. What is it?"
> "If we solved [stated objection], would you move forward? Or is there something else?"

### Common Hidden Objections
- Fear of change / career risk
- Political issues internally
- Already decided on competitor
- No real budget
- Not the decision maker`
        },
      ],
      quiz: {
        id: 'quiz-sales-m6',
        title: 'Session 6 Quiz: Objection Handling',
        questions: [
          {
            q: 'What is the FIRST step in the objection handling framework?',
            options: ['Answer immediately', 'Listen without interrupting', 'Question their logic', 'Present counter-evidence'],
            correct: 1,
          },
          {
            q: 'A prospect keeps raising the same objection in different ways even after you\'ve addressed it. This likely indicates:',
            options: ['They need more technical details', 'A hidden objection', 'They want a discount', 'They need to talk to their team'],
            correct: 1,
          },
        ],
      },
    },
  ],
};

export default salesCourse;
