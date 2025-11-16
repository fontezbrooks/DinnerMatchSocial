---

tags:

- "#social-dining-platform"

- "#group-decision-making"

- "#meal-consensus-gamification"

- "#recipe-matching-app"

- "#user-engagement-strategies"

- "#tinder-style-app"

- "#couples-dining"

- "#dinner-decision-solution"

- "#restaurant-challenges"

- "#dining-rewards"

---



# Product Requirements Document: DinnerMatch Social - Master PRD



**Document Version:** 3.0 (Master)

**Date:** November 16, 2025

**Product:** DinnerMatch Social - Tinder-Style Group Meal Decision App with Enhanced Engagement

**Target Release:** MVP+ with Enhanced Features

**Base Document:** v1.0 (October 31, 2025)

**Enhanced Document:** v2.0 (November 16, 2025)



---



## 1. Introduction/Overview



DinnerMatch Social is a mobile application that eliminates the "What's for dinner?" debate through gamified, time-limited swiping sessions. The app helps couples (expanding to groups later) reach consensus on dinner in 5 minutes or less by swiping through a curated mix of local restaurants and home recipes.



**Core Value Proposition:** "End the 'What's for dinner?' debate in 5 minutes"



The app adapts to users' energy levels, respects dietary restrictions, and seamlessly toggles between dining out and cooking at home based on group preferences. By combining restaurant discovery with recipe suggestions in one unified experience, DinnerMatch Social transforms decision fatigue into an engaging, quick activity.



**MVP Scope:** Focus on couples only with 10 local Atlanta restaurants and 20 recipes to validate the core "swipe-to-consensus" mechanic before scaling to larger groups.



### Enhanced Features Overview



Building on the core MVP, the enhanced version introduces strategic features to increase engagement, create revenue opportunities, and build a dining community:

- **Themed Restaurant Challenges** - Curated dining adventures with progress tracking

- **Restaurant Incentives System** - Real-time discounts and special offers

- **Enhanced Matching Options** - Blind voting and activity integration

- **Dining Journey Tracking** - Gamification and achievement system

- **B2B Restaurant Platform** - Revenue generation through partnerships



---



## 2. Goals



### Core Goals (MVP)

1. **Reduce decision time:** Enable couples to reach dinner consensus in 5 minutes or less, 80% of the time

2. **Increase daily engagement:** Achieve daily active usage as the primary success metric, targeting users opening the app at least 5 times per week

3. **Validate matching algorithm:** Achieve 75%+ match success rate during timed sessions

4. **Establish monetization foundation:** Integrate restaurant partnership infrastructure and sponsored content capability for future revenue

5. **Prove accommodation of dietary needs:** Successfully filter and match options for users with comprehensive dietary restrictions

6. **Build user trust:** Track and confirm follow-through on matched choices through post-session feedback



### Enhanced Goals (MVP+)

7. **Increase repeat engagement:** Launch themed challenges to drive 30+ sessions per user per month

8. **Generate B2B revenue:** Onboard 50+ restaurant partners within 6 months

9. **Build dining community:** 60% of users participating in at least one challenge monthly

10. **Maximize restaurant value:** 40% of matches utilizing discount/incentive offers



---



## 3. User Stories



### Primary User Stories (MVP - Couples)



**US-01:** As a couple trying to decide on dinner, I want to complete a quick swiping session together so that we can stop debating and start eating within 5 minutes.



**US-02:** As a user with dietary restrictions (vegan, gluten-free, nut allergy), I want my preferences automatically applied to all options shown so that I never see incompatible meals.



**US-03:** As someone with low energy after work, I want to indicate my energy level before swiping so that the app shows me appropriate options (simple recipes or nearby restaurants instead of complex cooking).



**US-04:** As a user who just matched with a restaurant, I want to immediately see the address, open it in maps, and access reservation options so that I can act on the decision right away.



**US-05:** As a user who matched with a recipe, I want to see the full recipe details and add ingredients to my shopping list so that I can prepare to cook without additional research.



**US-06:** As a budget-conscious user, I want to see price ranges for restaurants before swiping so that I don't waste time on options outside my budget.



**US-07:** As a free-tier user, I want to participate in one group at a time so that I can use the core app features without paying.



**US-08:** As a premium user, I want to participate in multiple groups (partner group + family group) so that I can use DinnerMatch for different decision-making scenarios.



**US-09:** As a user in a session where we don't match within 5 minutes, I want the session to adapt (shorter rounds) and eventually show our closest matches so that we still get a decision made.



**US-10:** As a user who completed a dinner decision, I want the app to ask me later if I actually followed through so that the app can learn my real preferences over time.



### Secondary User Stories (Future Groups Feature)



**US-11:** As a user in a group of 4 with split energy preferences, I want the app to use majority rule to determine whether we cook or go out so that we move forward even with disagreement.



**US-12:** As a group member, I want to see a visual breakdown of how the group voted on energy levels so that I understand why the app made certain suggestions.



### Enhanced User Stories (MVP+)



#### Themed Challenges & Gamification



**US-13:** As a couple who loves breweries, I want to join a "Atlanta Brewery Challenge" so we can systematically try all local breweries and track our progress.



**US-14:** As a user, I want to see my "Dining Journey" stats showing how many restaurants we've visited together, our favorite cuisines, and challenges completed.



**US-15:** As a competitive couple, I want to earn badges and achievements for completing dining challenges so we feel accomplished and motivated to try more.



#### Restaurant Incentives & Discounts



**US-16:** As a budget-conscious user, I want to see real-time discounts (e.g., "20% off tonight only!") highlighted on restaurant cards during swiping.



**US-17:** As a spontaneous diner, I want to filter for "deals available now" to find immediate dining discounts.



#### Enhanced Matching Features



**US-18:** As someone easily influenced, I want "blind voting mode" where I can't see my partner's swipe until we both swipe, ensuring authentic preferences.



**US-19:** As an experience seeker, I want to see which restaurants have special events tonight (trivia, live music) indicated on their cards.



#### Calendar & Reservation Integration



**US-20:** As a planner, I want to add matched dinners directly to my calendar with one tap.



**US-21:** As someone who hates waiting, I want to book reservations through the app immediately after matching.



#### Recurring Sessions



**US-22:** As a couple with routine, I want to set up "Weekly Date Night" reminders that prompt our Thursday 6 PM swipe session.



---



## 4. Functional Requirements



### 4.1 User Authentication & Account Management



**FR-001:** The system must allow users to create accounts using social media login (Google/Facebook authentication).



**FR-002:** The system must support two account tiers: Free (one active group at a time) and Premium (unlimited active groups).



**FR-003:** The system must allow users to create groups by generating shareable invitation links.



**FR-004:** The system must allow users to join groups by clicking invitation links shared by other users.



**FR-005:** The system must restrict free-tier users to participation in one active group at any given time.



**FR-006:** The system must allow premium users to participate in multiple groups simultaneously (e.g., partner group + family group).



### 4.2 Dietary Preferences & Filters



**FR-007:** The system must allow users to select dietary restrictions from a comprehensive list including: Vegetarian, Vegan, Gluten-free, Dairy-free, Halal, Kosher, Keto, Paleo, and high-protein options.



**FR-008:** The system must allow users to specify food allergies including but not limited to: nuts, shellfish, soy, eggs, fish.



**FR-009:** The system must apply dietary filters as hard filters, completely excluding any restaurant or recipe that does not meet the user's requirements.



**FR-010:** The system must automatically apply all group members' combined dietary restrictions when generating the swipe deck for a session.



**FR-011:** The system must persist dietary preferences across sessions so users do not need to re-enter them.



### 4.3 Mood/Energy Check



**FR-012:** Before each swiping session, the system must prompt each group member to indicate their energy level on a scale: Low/Medium/High.



**FR-013:** The system must use majority rule to determine the group's overall energy level when members have different inputs.



**FR-014:** When group energy is Low, the system must prioritize nearby restaurants and simple recipes (prep time < 30 minutes).



**FR-015:** When group energy is Medium, the system must show a balanced mix of restaurant distances and recipe complexity.



**FR-016:** When group energy is High, the system must include more complex recipes and a wider geographic range of restaurants.



**FR-017:** The system must display a visual chart/graph showing the distribution of energy votes after collection (e.g., "2 voted Low, 1 voted High - majority Low").



### 4.4 Swiping Session Mechanics



**FR-018:** The system must initiate a 5-minute timed swiping session when all group members are ready.



**FR-019:** The system must display a countdown timer visible to all participants during the session.



**FR-020:** The system must allow users to swipe right (like), swipe left (dislike), or swipe up (skip) on each option.



**FR-021:** The system must require mutual agreement (all group members swipe right) for a match to occur.



**FR-022:** When a match occurs, the system must immediately end the session and display the match result.



**FR-023:** If no match occurs within 5 minutes, the system must automatically start Round 2 with a 3-minute timer.



**FR-024:** If no match occurs in Round 2, the system must automatically start Round 3 (Sudden Death) with a 1-minute timer.



**FR-025:** If no match occurs after Round 3, the system must display the "closest matches" - the top 3 options with the most right swipes across the group.



**FR-026:** The system must allow users to collectively vote to pause/restart a session (requires majority agreement).



**FR-027:** The system must allow users to collectively vote to skip the current round entirely (requires majority agreement).



**FR-028:** The system must continue sessions as long as the majority of group members remain connected/active.



**FR-029:** If a user disconnects during a session, the system must allow the session to continue with remaining members and notify the group of the disconnection.



### 4.5 Restaurant Content & Data



**FR-030:** The system must pull restaurant data from a third-party API (Yelp, Google Places, or similar).



**FR-031:** The system must display the following restaurant information on each swipe card: name, cuisine type, price range ($/$$/$$$), distance from user, star rating, and an image (building or popular dish).



**FR-032:** For MVP, the system must focus on restaurants located in Atlanta, GA.



**FR-033:** The system must support sponsored restaurant listings that appear as ads within the swipe deck.



**FR-034:** The system must clearly label sponsored restaurant cards as "Sponsored" or "Ad" to maintain transparency.



**FR-035:** The system must allow local restaurants to purchase ad placements through a restaurant partnership program (admin/business interface - future consideration but data structure must support it).



**FR-036:** The system must include at least 10 curated local Atlanta restaurants in the MVP swipe deck.



### 4.6 Recipe Content & Data



**FR-037:** The system must pull recipe data from third-party APIs and web scraping sources.



**FR-038:** The system must normalize scraped recipe data to fit the app's database schema (e.g., converting "steps" to "directions", "thumbnail" to "image").



**FR-039:** The system must display the following recipe information on each swipe card: recipe name, prep time, cooking time, difficulty level, and a high-quality image.



**FR-040:** The system must include at least 20 curated recipes in the MVP swipe deck.



**FR-041:** The system must periodically insert sponsored content ads asking users "Want to switch to going out to dinner mode?" (sponsored by local restaurants).



**FR-042:** The system must use curated content only for the MVP (no user-submitted recipes initially).



### 4.7 Match Results & Post-Match Actions



**FR-043:** When a restaurant match occurs, the system must display: restaurant name, address, distance, price range, cuisine type, rating, and image.



**FR-044:** The system must provide a "Open in Maps" button that launches the device's default mapping application (Google Maps or Apple Maps).



**FR-045:** The system must provide a "Make Reservation" link/button that directs users to the restaurant's reservation system or phone number.



**FR-046:** When a recipe match occurs, the system must display: recipe name, total time, difficulty, and a "View Full Recipe" button.



**FR-047:** When users tap "View Full Recipe", the system must display the complete recipe including ingredients list, step-by-step directions, and nutritional information (if available).



**FR-048:** The system must display a plus (+) icon next to each ingredient in the recipe detail view.



**FR-049:** When users tap the plus icon next to an ingredient, the system must add that ingredient to a persistent shopping list.



**FR-050:** The system must maintain a shopping list that tracks which ingredients have been acquired and which are still needed.



**FR-051:** The system must send reminder notifications for missing ingredients (e.g., "You still don't have cheese - get it delivered in 5 minutes!").



**FR-052:** The system must include infrastructure to support future ingredient delivery integration (button/UI placeholder even if delivery functionality is not active in MVP).



**FR-053:** The system must save all match history for each group, allowing users to view past decisions.



**FR-054:** The system must allow users to re-access saved matches from match history to retrieve recipes or restaurant details.



### 4.8 Post-Session Feedback Loop



**FR-055:** The system must send a push notification to users 2-3 hours after a match asking "Did you cook this recipe?" or "Did you go to this restaurant?"



**FR-056:** The system must track user responses to follow-through questions to build a feedback loop for improving future recommendations.



**FR-057:** The system must use feedback data to adjust the recommendation algorithm over time (e.g., deprioritize options users match with but don't follow through on).



### 4.9 Technical Platform Requirements



**FR-058:** The system must be built using React Native with Expo to ensure cross-platform compatibility (iOS and Android).



**FR-059:** The system must function on both iOS and Android devices simultaneously within the same group session.



**FR-060:** The system must support real-time synchronization of swipes across all group members' devices during active sessions.



**FR-061:** The system must handle network interruptions gracefully and attempt to reconnect users without ending the session.



### 4.10 Themed Restaurant Challenges (Enhanced)



**FR-062:** The system must offer pre-curated restaurant challenges including but not limited to:

- Best Burger in Atlanta (10 restaurants)

- Brewery Tour (15 breweries)

- Tiki Bar Crawl (8 bars)

- International Cuisine Journey (12 restaurants, different cuisines)

- Downtown Woodstock Eats (10 local restaurants)



**FR-063:** The system must track progress through each challenge, displaying "7/10 visited" status.



**FR-064:** The system must award badges/achievements upon challenge completion.



**FR-065:** The system must allow filtering swipe sessions by challenge (e.g., "Show only Brewery Challenge restaurants").



**FR-066:** The system must support sponsored challenges created by:

- Chambers of Commerce ("Try Downtown Decatur")

- Restaurant Groups ("Ford Fry Collection")

- Local Organizations ("Atlanta Vegan Society Approved")



**FR-067:** Premium users must have access to all challenges; free users get 1 active challenge at a time.



**FR-068:** The system must display a leaderboard showing which couples have completed the most challenges.



### 4.11 Restaurant Incentives & Dynamic Pricing (Enhanced)



**FR-069:** The system must display real-time restaurant incentives on swipe cards:

- Time-based discounts ("20% off 5-7 PM")

- Day-specific deals ("Taco Tuesday: 2-for-1")

- Last-minute offers ("30% off in next hour - slow night!")



**FR-070:** The system must highlight incentivized cards with animated badges/borders.



**FR-071:** The system must allow restaurants to push instant deals through a restaurant dashboard (B2B interface).



**FR-072:** The system must track incentive redemption rates for restaurant analytics.



**FR-073:** The system must generate unique discount codes for matched restaurants to track conversions.



### 4.12 Enhanced Matching Mechanics (Enhanced)



**FR-074:** The system must support "Blind Voting Mode" where:

- Each user's swipe is hidden from their partner

- Both swipes are revealed simultaneously

- Reduces influence and increases authentic matches



**FR-075:** The system must indicate special events on restaurant cards:

- Live music icon

- Trivia night badge

- Happy hour indicator

- Special menu notation



**FR-076:** The system must factor events into energy level filtering (High energy → more event venues).



### 4.13 Dining Journey & Progress Tracking (Enhanced)



**FR-077:** The system must maintain a comprehensive dining history showing:

- Total restaurants visited together

- Favorite cuisine types (based on match frequency)

- Challenge progress across all active challenges

- "Relationship dining score" (gamification metric)



**FR-078:** The system must generate shareable "Year in Review" summaries.



**FR-079:** The system must award milestone badges:

- "First 10 Restaurants"

- "Adventurous Eaters" (diverse cuisine types)

- "Loyal Regulars" (visited same place 5+ times)



### 4.14 Calendar & Reservation Integration (Enhanced)



**FR-080:** The system must integrate with calendar APIs to add dining events:

- Google Calendar

- Apple Calendar

- Outlook Calendar



**FR-081:** The system must pre-populate calendar events with:

- Restaurant name and address

- Reservation time (if applicable)

- Special notes (discount code, special event)



**FR-082:** The system must integrate with reservation platforms:

- OpenTable API

- Resy API

- Direct restaurant booking links



**FR-083:** The system must display reservation availability during matching ("Tables available: 6:30, 7:00, 7:30").



### 4.15 Recurring Sessions & Automation (Enhanced)



**FR-084:** The system must support scheduled recurring swipe sessions:

- Weekly (e.g., "Every Thursday at 6 PM")

- Bi-weekly

- Monthly

- Custom frequency



**FR-085:** The system must send push notifications for scheduled sessions:

- 30-minute warning

- Start time notification

- Partner not joined reminder



### 4.16 B2B Restaurant Dashboard (Enhanced)



**FR-086:** The system must provide restaurants with a web dashboard showing:

- Swipe analytics (views, right swipes, left swipes)

- Conversion metrics (matches → actual visits)

- Peak interest times

- Demographic insights (anonymized)



**FR-087:** The system must allow restaurants to:

- Create instant promotions

- Sponsor placement in challenges

- Update special events/menus

- Set capacity-based dynamic pricing



**FR-088:** The system must support tiered restaurant partnerships:

- Basic (free): Limited analytics

- Premium ($99/month): Full analytics + 5 promotions/month

- Enterprise ($299/month): Unlimited promotions + sponsored challenges



---



## 5. Non-Goals (Out of Scope for MVP)



**NG-01:** Groups larger than 2 people (couples only for MVP).



**NG-02:** In-app reservation booking system (external links only).



**NG-03:** Ingredient delivery functionality (infrastructure placeholder only).



**NG-04:** User-submitted recipes (curated content only).



**NG-05:** Recipe rating/review system.



**NG-06:** Social sharing of matches to external platforms.



**NG-07:** Cuisine preference learning algorithm beyond basic dietary restrictions.



**NG-08:** Voice-based swiping or accessibility features beyond standard mobile OS support.



**NG-09:** Desktop or web application (mobile-first only).



**NG-10:** Multi-language support (English only for MVP).



**NG-11:** Restaurant menu browsing within the app.



**NG-12:** Calorie tracking or nutritional goal setting.



**NG-13:** Integration with calendar apps for meal planning.



**NG-14:** Video recipe tutorials.



---



## 6. Design Considerations



### 6.1 User Interface



- **Swipe Interaction:** The swipe mechanism must feel responsive and smooth, similar to popular dating apps (Tinder-style gestures)

- **Visual Feedback:** Each swipe must provide immediate visual feedback (card animation, haptic feedback)

- **Timer Visibility:** The countdown timer must be prominent but not distracting, updating in real-time

- **Card Design:** Restaurant and recipe cards must be visually distinct while maintaining consistent branding



### 6.2 Visual Hierarchy



- **Match Results:** Match result screens must clearly prioritize actionable buttons ("Open in Maps", "Make Reservation", "View Recipe")

- **Energy Vote Display:** The energy level chart/graph must be simple and glanceable (e.g., horizontal bar chart or pie chart)

- **Sponsored Content:** Ad cards must be clearly labeled but designed to blend naturally with organic content



### 6.3 Accessibility



- Standard React Native accessibility props must be implemented for screen readers

- Sufficient color contrast must be maintained for readability

- Touch targets must meet minimum size requirements (44x44 pt)



### 6.4 Design Assets Needed



- Restaurant/recipe card templates

- Loading states and animations

- Empty states (no matches, no restaurants available)

- Error states (connection lost, API failure)

- Icon set for dietary restrictions and preferences

- Celebration/confetti animation for successful matches

- Challenge badges and achievement graphics (Enhanced)

- Leaderboard UI components (Enhanced)

- Event indicator icons (Enhanced)

- Discount/offer badges (Enhanced)



---



## 7. Technical Considerations



### 7.1 Technology Stack



- **Frontend:** React Native with Expo (cross-platform)

- **Authentication:** Clerk with Social login integration (Google OAuth, Facebook Login)

- **Real-time Sync:** WebSocket or Firebase Realtime Database for live session updates

- **Backend:** RESTful API (Hono)

- **Database:** NoSQL database (MongoDB) for flexible schema

- **B2B Dashboard:** Web application for restaurant partners (Enhanced)



### 7.2 Third-Party Integrations



- **Restaurant Data:** Yelp Fusion API or Google Places API

- **Recipe Data:** Spoonacular API, Edamam API, or similar

- **Maps:** React Native Maps (supports Google Maps and Apple Maps)

- **Push Notifications:** Expo Notifications

- **Analytics:** Firebase Analytics or Mixpanel for tracking daily active usage

- **Calendar Integration:** Google Calendar API, Apple EventKit (Enhanced)

- **Reservation Systems:** OpenTable API, Resy API (Enhanced)

- **Payment Processing:** Stripe for B2B subscriptions (Enhanced)



### 7.3 Data Modeling Considerations



- User profiles must store dietary preferences as an array/list for easy filtering

- Sessions must track state (active, completed, abandoned) and maintain round history

- Restaurant/recipe objects must include a "sponsored" boolean flag for ad tracking

- Shopping lists must be user-specific and ingredient items must track acquisition status

- Challenge definitions and progress tracking (Enhanced)

- Restaurant partnership tiers (Enhanced)

- Incentive/discount records (Enhanced)

- Event schedules (Enhanced)

- Achievement/badge registry (Enhanced)

- Dining history analytics (Enhanced)



### 7.4 Performance Requirements



- Swipe actions must register with <100ms latency

- Real-time sync between users must complete within 500ms under normal network conditions

- Initial app load time must be <3 seconds on 4G connection

- Restaurant dashboard must load within 2 seconds (Enhanced)

- Challenge leaderboards must update in real-time (Enhanced)



### 7.5 Scalability Considerations



- Database schema must support expansion to groups >2 members

- Matching algorithm must be extensible to handle complex group voting scenarios

- Restaurant API calls should be cached to reduce costs and improve response time

- Challenge system must support 100+ concurrent challenges (Enhanced)

- B2B dashboard must scale to 500+ restaurant partners (Enhanced)



### 7.6 Security & Privacy



- User dietary and health information must be stored securely and comply with privacy standards

- Social login tokens must be handled according to OAuth best practices

- Sponsored content must not track users beyond session-level analytics

- Restaurant dashboard access must be secured with role-based permissions (Enhanced)

- Discount codes must be protected against fraud (Enhanced)



### 7.7 Infrastructure Requirements (Enhanced)



- Challenge progress tracking system

- Restaurant dashboard (web application)

- Dynamic pricing/incentive engine

- Calendar API integrations

- Reservation platform integrations

- Badge/achievement system

- Leaderboard infrastructure

- Restaurant POS integration capability (future)



---



## 8. Implementation Phases



### Phase 1: Core MVP

- Basic swiping mechanics for couples

- Energy level filtering

- Dietary restrictions

- Restaurant and recipe integration

- Match history



### Phase 2: Enhanced Engagement Features

- Themed restaurant challenges

- Basic progress tracking

- Blind voting mode

- Event indicators on cards



### Phase 3: Monetization & Partnerships

- Restaurant incentive system

- B2B dashboard (basic)

- Sponsored challenges

- Premium challenge access



### Phase 4: Advanced Integration

- Calendar integration

- Reservation APIs

- Recurring sessions

- Advanced analytics dashboard



### Phase 5: Community Features

- Leaderboards

- Social sharing

- Couple-to-couple challenges

- Reviews within challenges



### Phase 6: Scale & Expand

- Groups larger than couples

- Multi-market expansion

- User-submitted content

- Advanced AI recommendations



---



## 9. Revenue Model



### B2C Revenue Streams:

1. **Premium Subscriptions** ($4.99/month)

- Unlimited active challenges (vs 1 for free)

- Exclusive themed challenges

- Priority access to restaurant deals

- Advanced dining stats/insights

- Multiple group participation



### B2B Revenue Streams:

1. **Restaurant Subscriptions**

- Basic: Free (limited features)

- Premium: $99/month

- Enterprise: $299/month



2. **Sponsored Challenges**

- Chamber of Commerce: $500/challenge

- Restaurant Groups: $1,000/challenge

- Brand Partnerships: $2,500/challenge



3. **Promoted Placements**

- Cost-per-impression in swipe deck

- Boost placement in challenges

- Featured deal highlighting



### Projected Revenue (Year 1):

- B2C Premium: 10,000 users × $4.99 × 12 = $598,800

- B2B Subscriptions: 100 restaurants × $99 × 12 = $118,800

- Sponsored Challenges: 20 challenges × $1,000 = $20,000

- **Total Projected: $737,600**



---



## 10. Success Metrics



### Primary Metrics (MVP)



**Daily Active Usage (DAU):** The percentage of registered users who open the app at least once per day. Target: 60% of registered users within 30 days of MVP launch.



**Weekly Active Sessions:** Average number of swiping sessions per user per week. Target: 5+ sessions per week.



### Secondary Metrics (MVP)



**Match Success Rate:** Percentage of sessions that result in a match (within 3 rounds). Target: 75%+



**Time to Decision:** Average time from session start to match. Target: <4 minutes average



**Follow-Through Rate:** Percentage of matches where users confirm they actually cooked the recipe or visited the restaurant. Target: 70%+



**Ad Engagement Rate:** Click-through rate on sponsored restaurant cards and "switch to dining out" ads. Target: 5%+ CTR



**Premium Conversion Rate:** Percentage of free users who upgrade to premium. Target: 10% within 60 days



**User Retention:** Percentage of users still active after 7 days, 30 days, 90 days. Target: 70% (D7), 50% (D30), 30% (D90)



### User Satisfaction Metrics



**Net Promoter Score (NPS):** Collect via in-app survey after 2 weeks of usage. Target: NPS >40



**App Store Rating:** Target 4.5+ stars on both iOS and Android app stores



### Enhanced Metrics (MVP+)



#### Engagement Metrics:

- **Challenge Participation Rate:** 60%+ of active users in at least one challenge

- **Average Sessions per Month:** Increase from 20 to 30+

- **Challenge Completion Rate:** 40%+ complete at least one challenge



#### Monetization Metrics:

- **Restaurant Partner Acquisition:** 50+ in first 6 months

- **Incentive Redemption Rate:** 25%+ of matched discounts used

- **B2B Revenue per Restaurant:** $150+ monthly average



#### Community Metrics:

- **Social Shares:** 20%+ of completed challenges shared

- **Couple Retention:** 80%+ of couples active after completing first challenge

- **Cross-Challenge Participation:** Average 2.5 challenges per couple



---



## 11. Risk Mitigation



### Technical Risks:

1. **API Rate Limits:** Third-party restaurant/recipe APIs may throttle requests

- Mitigation: Implement aggressive caching, consider multiple API providers

2. **Real-time Sync Failures:** WebSocket connection issues during sessions

- Mitigation: Fallback to polling, session recovery mechanism

3. **Scalability Issues:** Performance degradation with user growth

- Mitigation: Load testing, horizontal scaling plan, CDN for assets



### Business Risks:

1. **Restaurant adoption:** May be slow initially

- Mitigation: Free tier + success stories + local partnerships

2. **Challenge content creation:** Resource intensive

- Mitigation: Partner with local organizations, user-generated content (future)

3. **Incentive fraud:** Users gaming discounts

- Mitigation: Unique codes + verification + fraud detection



### User Experience Risks:

1. **Decision Fatigue:** Users overwhelmed by too many options

- Mitigation: Smart filtering, limited deck size, personalization

2. **Match Failure:** Groups unable to reach consensus

- Mitigation: Progressive rounds, closest match fallback

3. **Partner Coordination:** Difficulty getting both users online simultaneously

- Mitigation: Asynchronous voting option (future), scheduling features



---



## 12. Open Questions



**OQ-01:** What is the exact API/data source for recipe content? (Spoonacular, Edamam, custom scraping?)



**OQ-02:** How should the app handle price range preferences if not explicitly addressed in energy/mood check? Should this be a separate user preference setting?



**OQ-03:** What defines a "simple" recipe vs. "complex" recipe? Is it purely prep time, or should difficulty level and number of ingredients also factor in?



**OQ-04:** For the energy vote visualization, what specific chart type is preferred (horizontal bar, pie, simple text breakdown)?



**OQ-05:** Should the app show how many swipes are remaining in the deck during a session, or keep this hidden to maintain focus?



**OQ-06:** What is the maximum geographic radius for restaurant suggestions at different energy levels (e.g., Low = 2 miles, Medium = 5 miles, High = 10 miles)?



**OQ-07:** How should the app handle situations where dietary restrictions filter out so many options that the swipe deck has <5 cards?



**OQ-08:** Should users be able to manually toggle between "restaurant mode" and "recipe mode" mid-session, or is this determined solely by the energy check at the start?



**OQ-09:** For the shopping list feature, should ingredients be shareable between group members, or does each user maintain their own list?



**OQ-10:** What is the business model for the restaurant partnership program? (Cost-per-impression, cost-per-click, monthly subscription for restaurants?)



**OQ-11:** Should the MVP include any onboarding tutorial or first-time user experience walkthrough?



**OQ-12:** How should the app handle edge cases where both users swipe right on different options simultaneously in the final seconds of a round?



**OQ-13:** For sponsored content frequency, what is the acceptable ratio of ads to organic content? (e.g., 1 ad per every 10 swipes?)



**OQ-14:** Should match history be group-specific or user-specific? (Can a user see matches from all their groups in one place?)



**OQ-15:** How should challenge content be refreshed to maintain engagement? Monthly? Seasonally? (Enhanced)



**OQ-16:** What verification mechanism should be used for restaurant visit confirmations in challenges? (Enhanced)



**OQ-17:** Should the B2B dashboard be a separate application or integrated into the main app? (Enhanced)



---



## 13. Appendix



### 13.1 Glossary



- **Swipe Deck:** The collection of restaurant and recipe options shown to users during a session

- **Hard Filter:** A filter that completely excludes non-matching options (vs. soft filter that deprioritizes)

- **Mutual Match:** When all members of a group swipe right on the same option

- **Session Round:** One timed period of swiping (Round 1: 5 min, Round 2: 3 min, Round 3: 1 min)

- **Closest Match:** Options with the highest number of right swipes that didn't achieve mutual agreement

- **Energy Check:** Pre-session survey asking users to rate their energy level

- **Sponsored Content:** Paid restaurant listings or ads appearing in the swipe deck

- **Challenge:** Curated collection of restaurants/experiences to complete (Enhanced)

- **Dining Journey:** User's comprehensive dining history and achievements (Enhanced)

- **Blind Voting:** Mode where partner swipes are hidden until both complete (Enhanced)



### 13.2 Assumptions



- Users have stable internet connection during sessions (4G or WiFi)

- Users have push notifications enabled for optimal experience

- MVP users are primarily in committed relationships/partnerships (couples)

- Users are comfortable with social login (Google/Facebook)

- Target demographic is tech-savvy millennials and Gen Z (ages 22-40)

- MVP launch will be limited to Atlanta, GA metropolitan area

- Restaurants are willing to participate in partnership programs (Enhanced)

- Users value gamification and achievement systems (Enhanced)



### 13.3 Dependencies



- Third-party API availability and rate limits (Yelp, Google Places, recipe APIs)

- Social login provider uptime (Google OAuth, Facebook Login)

- App store approval processes (Apple App Store, Google Play Store)

- Real-time database performance for live session syncing

- Restaurant partnership sales team to secure sponsored content deals

- Calendar API access permissions from users (Enhanced)

- Reservation platform API partnerships (Enhanced)

- Payment processing for B2B subscriptions (Enhanced)



### 13.4 Food with Friends Integration Map (Enhanced Features)



#### Features Adopted:

✅ Themed restaurant lists/challenges

✅ Restaurant discounts/incentives

✅ Progress tracking through lists

✅ Calendar integration (light version)

✅ Sponsored content by restaurant groups

✅ Activity/event integration



#### Features Adapted:

🔄 Automated scheduling → Recurring session reminders

🔄 Blind voting → Hidden swipe mode

🔄 Full automation → One-tap convenience features



#### Features Deferred:

❌ Large group coordination (maintaining couples focus)

❌ Fully automated reservations (manual trigger instead)

❌ Automatic frequency determination

❌ User-generated challenge content (initially)



---



**Document Control**



- **Author:** Product Team

- **Reviewers:** Engineering Lead, Design Lead, Business Development

- **Master Document Created:** November 16, 2025

- **Base Document:** v1.0 (October 31, 2025)

- **Enhancement Document:** v2.0 (November 16, 2025)

- **Next Review Date:** After Phase 2 implementation

- **Version History:**

- v1.0 (October 31, 2025): Initial PRD for MVP scope

- v2.0 (November 16, 2025): Enhanced with Food with Friends features

- v3.0 (November 16, 2025): Master PRD combining all features
