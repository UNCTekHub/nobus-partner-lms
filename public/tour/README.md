# Product tour narration (pristine voice)

The 5-minute guided tour (src/components/ProductTour.jsx) narrates each step.
By default it uses the browser's built-in text-to-speech (functional, but not
"pristine"). To use a high-quality human/neural voice, generate one MP3 per
step and drop it in `public/tour/audio/` named `<step-id>.mp3`.

The tour plays `/tour/audio/<step-id>.mp3` if present, otherwise falls back to
the browser voice automatically. No code change needed once the files exist.

How to generate pristine audio: paste each script below into a neural TTS
(e.g. ElevenLabs, OpenAI TTS, Azure Neural, Google WaveNet) or record a voice
artist, export MP3, and save with the exact filename shown.

## Files & scripts

**audio/welcome.mp3**
Welcome to Nobus PartnerCentral. Sit back and relax - this five minute walkthrough will drive itself through the key features of the platform. You can pause or skip at any time.

**audio/tour-dashboard.mp3**
This is your dashboard - your command center. At a glance you can see your open pipeline, your weighted forecast, your protected deals, and your partner tier progress.

**audio/tour-sales.mp3**
The Sales Navigator lets you track every opportunity on a Kanban pipeline, log your activities, and see a weighted revenue forecast as your deals progress.

**audio/tour-deals.mp3**
Here you register your deals. Registering an opportunity locks in channel protection, keeping your deal shielded from conflict for as long as you stay engaged with the account.

**audio/tour-quotes.mp3**
The Quote Builder creates customer-ready quotations from the live catalog. Just click New Quote, add your services, and your partner-tier discount is applied automatically. You can then export a branded PDF order form.

**audio/tour-training.mp3**
The Training Academy enables your Sales, Presales and Technical teams with role-based courses and certifications - the same credentials that help you unlock higher partner tiers.

**audio/tour-growth.mp3**
Growth and Rewards brings together your tier progress and discount, the credit you earn on closed deals, your market development funds, and your partner analytics.

**audio/tour-support.mp3**
Need help? Support lets you raise a case with the Nobus partner team, backed by response time service levels and a named partner manager.

**audio/tour-forum.mp3**
The Community Forum lets you share knowledge with partners across the whole network, in topic rooms for compute, storage, networking, security, sales and more.

**audio/tour-marketing.mp3**
Under Marketing Materials you will find ready-to-use brochures, battle cards, whitepapers and campaign kits for your customer conversations.

**audio/tour-labs.mp3**
And with Demo Labs you can book guided sandbox scenarios on the real Nobus platform, to run hands-on demonstrations in your presales meetings.

**audio/finish.mp3**
That's the tour. Everything you just saw lives in the left hand menu, and you can replay this walkthrough anytime from the question mark button in the top bar. Now go build.
